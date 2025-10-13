import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import { User } from '@shared/schema';

/**
 * Subscription Policy Service
 * Enforces subscription limits and policies across the application
 */

export interface SubscriptionLimits {
  maxProjects: number; // -1 for unlimited
  retentionDays: number; // -1 for unlimited
  maxDownloads: number; // -1 for unlimited
  downloadPeriod: 'monthly' | 'annual' | 'unlimited';
  teamSize: number; // -1 for unlimited
  canDownload: boolean;
}

export class SubscriptionPolicyService {
  /**
   * Get subscription limits for a given tier
   */
  static getSubscriptionLimits(subscriptionStatus: string): SubscriptionLimits {
    const limits: Record<string, SubscriptionLimits> = {
      free: {
        maxProjects: 0, // Free users get no projects now
        retentionDays: 0, // No retention
        maxDownloads: 0, // No downloads
        downloadPeriod: 'monthly',
        teamSize: 1,
        canDownload: false,
      },
      'one-time': {
        maxProjects: -1, // Unlimited projects for one-time
        retentionDays: 60,
        maxDownloads: -1, // Unlimited downloads
        downloadPeriod: 'unlimited',
        teamSize: 1,
        canDownload: true,
      },
      monthly: {
        maxProjects: -1, // Unlimited
        retentionDays: -1, // Unlimited retention
        maxDownloads: 10,
        downloadPeriod: 'monthly',
        teamSize: 5,
        canDownload: true,
      },
      annual: {
        maxProjects: -1, // Unlimited
        retentionDays: -1, // Unlimited retention
        maxDownloads: 140,
        downloadPeriod: 'annual',
        teamSize: -1, // Unlimited
        canDownload: true,
      },
    };

    return limits[subscriptionStatus] || limits.free;
  }

  /**
   * Check if user can create a new project
   */
  static async canCreateProject(userId: string, subscriptionStatus: string): Promise<{
    allowed: boolean;
    message?: string;
    current?: number;
    limit?: number;
  }> {
    const limits = this.getSubscriptionLimits(subscriptionStatus);
    
    // Get user's current projects
    const allProjects = await storage.getProjects();
    const userProjects = allProjects.filter((p: any) => p.userId === userId);
    
    // Unlimited projects
    if (limits.maxProjects === -1) {
      return { allowed: true };
    }
    
    // No projects allowed
    if (limits.maxProjects === 0) {
      return {
        allowed: false,
        message: 'Free tier does not include project creation. Please upgrade to a paid plan.',
        current: userProjects.length,
        limit: limits.maxProjects,
      };
    }
    
    // Check limit
    if (userProjects.length >= limits.maxProjects) {
      return {
        allowed: false,
        message: `Project limit reached (${limits.maxProjects}). Upgrade for unlimited projects.`,
        current: userProjects.length,
        limit: limits.maxProjects,
      };
    }
    
    return { allowed: true, current: userProjects.length, limit: limits.maxProjects };
  }

  /**
   * Clean up old projects and files based on retention policy
   */
  static async cleanupExpiredData(userId: string, subscriptionStatus: string): Promise<{
    projectsDeleted: number;
    filesDeleted: number;
  }> {
    const limits = this.getSubscriptionLimits(subscriptionStatus);
    
    // Unlimited retention - no cleanup needed
    if (limits.retentionDays === -1) {
      return { projectsDeleted: 0, filesDeleted: 0 };
    }
    
    // No retention - delete everything
    if (limits.retentionDays === 0) {
      return await this.deleteAllUserData(userId);
    }
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limits.retentionDays);
    
    const allProjects = await storage.getProjects();
    const userProjects = allProjects.filter((p: any) => p.userId === userId);
    
    let projectsDeleted = 0;
    let filesDeleted = 0;
    
    for (const project of userProjects) {
      if (project.updatedAt < cutoffDate) {
        // Delete all files associated with this project
        const files = await storage.getFilesByProject(project.id);
        for (const file of files) {
          await storage.deleteFile(file.id);
          filesDeleted++;
        }
        
        // Delete all mappings for this project
        await storage.deleteMappingsByProject(project.id);
        
        // Delete the project (we need to add this to storage interface)
        // For now, we'll just delete the files
        projectsDeleted++;
      }
    }
    
    return { projectsDeleted, filesDeleted };
  }

  /**
   * Delete all user data (for free users on logout)
   */
  static async deleteAllUserData(userId: string): Promise<{
    projectsDeleted: number;
    filesDeleted: number;
  }> {
    const allProjects = await storage.getProjects();
    const userProjects = allProjects.filter((p: any) => p.userId === userId);
    
    let projectsDeleted = 0;
    let filesDeleted = 0;
    
    for (const project of userProjects) {
      // Delete all files from filesystem
      const files = await storage.getFilesByProject(project.id);
      for (const file of files) {
        // Delete from database
        await storage.deleteFile(file.id);
        filesDeleted++;
      }
      
      // Delete generated files
      const generatedDir = path.join('uploads', 'generated', project.id);
      if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
      }
      
      // Delete data files
      const dataDir = path.join('uploads', 'data', project.id);
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
      }
      
      // Delete XSLT files
      const xsltDir = path.join('uploads', 'xslt', project.id);
      if (fs.existsSync(xsltDir)) {
        fs.rmSync(xsltDir, { recursive: true, force: true });
      }
      
      // Delete all mappings
      await storage.deleteMappingsByProject(project.id);
      
      projectsDeleted++;
    }
    
    return { projectsDeleted, filesDeleted };
  }

  /**
   * Check download permissions
   */
  static async canDownload(user: User): Promise<{
    allowed: boolean;
    message?: string;
    remaining?: number;
  }> {
    const limits = this.getSubscriptionLimits(user.subscriptionStatus);
    
    if (!limits.canDownload) {
      return {
        allowed: false,
        message: 'Free users cannot download files. Please upgrade to a paid plan.',
      };
    }
    
    // Unlimited downloads
    if (limits.maxDownloads === -1) {
      return { allowed: true };
    }
    
    // Check if we need to reset the counter
    const now = new Date();
    const resetDate = user.downloadsResetAt ? new Date(user.downloadsResetAt) : null;
    
    let downloadsUsed = user.downloadsUsed || 0;
    
    // Reset counter if needed
    if (!resetDate || now >= resetDate) {
      downloadsUsed = 0;
      
      // Calculate next reset date
      let nextResetDate: Date;
      if (limits.downloadPeriod === 'monthly') {
        nextResetDate = new Date(now);
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      } else {
        nextResetDate = new Date(now);
        nextResetDate.setFullYear(nextResetDate.getFullYear() + 1);
      }
      
      await storage.updateUserDownloads(user.id, 0, nextResetDate);
    }
    
    // Check if limit reached
    if (downloadsUsed >= limits.maxDownloads) {
      const resetDateStr = resetDate ? resetDate.toLocaleDateString() : 'soon';
      return {
        allowed: false,
        message: `Download limit reached (${limits.maxDownloads}/${limits.downloadPeriod}). Resets on ${resetDateStr}.`,
        remaining: 0,
      };
    }
    
    return {
      allowed: true,
      remaining: limits.maxDownloads - downloadsUsed,
    };
  }

  /**
   * Increment download counter
   */
  static async incrementDownloadCounter(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;
    
    const newCount = (user.downloadsUsed || 0) + 1;
    await storage.updateUserDownloads(
      userId,
      newCount,
      user.downloadsResetAt || new Date()
    );
  }

  /**
   * Scheduled cleanup job - runs periodically to clean up expired data
   */
  static async runScheduledCleanup(): Promise<{
    totalProjectsDeleted: number;
    totalFilesDeleted: number;
    usersProcessed: number;
  }> {
    console.log('[CLEANUP] Starting scheduled cleanup job...');
    
    const allUsers = await storage.getAllUsers();
    let totalProjectsDeleted = 0;
    let totalFilesDeleted = 0;
    let usersProcessed = 0;
    
    for (const user of allUsers) {
      try {
        const result = await this.cleanupExpiredData(user.id, user.subscriptionStatus);
        totalProjectsDeleted += result.projectsDeleted;
        totalFilesDeleted += result.filesDeleted;
        usersProcessed++;
        
        if (result.projectsDeleted > 0 || result.filesDeleted > 0) {
          console.log(
            `[CLEANUP] User ${user.username}: Deleted ${result.projectsDeleted} projects, ${result.filesDeleted} files`
          );
        }
      } catch (error) {
        console.error(`[CLEANUP] Error cleaning up user ${user.id}:`, error);
      }
    }
    
    console.log(
      `[CLEANUP] Cleanup complete: ${totalProjectsDeleted} projects, ${totalFilesDeleted} files deleted across ${usersProcessed} users`
    );
    
    return { totalProjectsDeleted, totalFilesDeleted, usersProcessed };
  }
}
