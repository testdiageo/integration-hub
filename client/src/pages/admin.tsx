import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo-head";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Shield, Users, CheckCircle, XCircle } from "lucide-react";
import type { User } from "@shared/schema";

export default function AdminDashboard() {
  const { user: currentUser, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin,
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/admin`, "PATCH", { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, subscriptionStatus, subscriptionTier }: { userId: string; subscriptionStatus: string; subscriptionTier?: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/subscription`, "PATCH", { subscriptionStatus, subscriptionTier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User subscription updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <Button className="w-full" asChild data-testid="button-back-home">
              <a href="/">Go to Homepage</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Admin Dashboard - Connetly"
        description="Manage users and subscriptions for Connetly"
        canonicalUrl={`${window.location.origin}/admin`}
      />

      <div className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="heading-admin">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Manage users and subscriptions
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.subscriptionStatus === "paid").length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.subscriptionStatus === "trial").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`user-card-${user.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold" data-testid={`user-name-${user.id}`}>
                              {user.firstName} {user.lastName}
                            </h3>
                            {user.isAdmin && (
                              <Badge variant="default" data-testid={`badge-admin-${user.id}`}>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            <Badge
                              variant={user.subscriptionStatus === "paid" ? "default" : "secondary"}
                              data-testid={`badge-subscription-${user.id}`}
                            >
                              {user.subscriptionStatus}
                            </Badge>
                            {user.subscriptionTier && (
                              <Badge variant="outline" data-testid={`badge-tier-${user.id}`}>
                                {user.subscriptionTier}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground" data-testid={`user-email-${user.id}`}>
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined: {new Date(user.createdAt!).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {user.id !== currentUser?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAdminMutation.mutate({ userId: user.id, isAdmin: !user.isAdmin })}
                                disabled={updateAdminMutation.isPending}
                                data-testid={`button-toggle-admin-${user.id}`}
                              >
                                {user.isAdmin ? "Remove Admin" : "Make Admin"}
                              </Button>
                              {user.subscriptionStatus !== "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateSubscriptionMutation.mutate({ 
                                    userId: user.id, 
                                    subscriptionStatus: "paid",
                                    subscriptionTier: "professional"
                                  })}
                                  disabled={updateSubscriptionMutation.isPending}
                                  data-testid={`button-upgrade-${user.id}`}
                                >
                                  Upgrade to Paid
                                </Button>
                              )}
                              {user.subscriptionStatus === "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateSubscriptionMutation.mutate({ 
                                    userId: user.id, 
                                    subscriptionStatus: "trial"
                                  })}
                                  disabled={updateSubscriptionMutation.isPending}
                                  data-testid={`button-downgrade-${user.id}`}
                                >
                                  Downgrade to Trial
                                </Button>
                              )}
                            </>
                          )}
                          {user.id === currentUser?.id && (
                            <Badge variant="secondary">You</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
