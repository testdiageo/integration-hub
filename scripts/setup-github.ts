import { createRepository, getAuthenticatedUser } from '../server/github-setup';

async function setupGitHub() {
  try {
    console.log('Getting GitHub user info...');
    const user = await getAuthenticatedUser();
    console.log(`Authenticated as: ${user.login}`);

    console.log('\nCreating repository...');
    const repo = await createRepository(
      'integration-hub',
      'IntegrationHub - AI-Powered Data Integration & Transformation Platform',
      false
    );
    
    console.log(`\n✅ Repository created/found: ${repo.html_url}`);
    console.log(`Clone URL: ${repo.clone_url}`);
    console.log(`SSH URL: ${repo.ssh_url}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Add the remote:');
    console.log(`   git remote add origin ${repo.clone_url}`);
    console.log('\n2. Stage all files:');
    console.log('   git add .');
    console.log('\n3. Commit:');
    console.log('   git commit -m "Initial commit - IntegrationHub SaaS platform"');
    console.log('\n4. Push to GitHub:');
    console.log('   git push -u origin main');
    
  } catch (error) {
    console.error('Error setting up GitHub:', error);
    process.exit(1);
  }
}

setupGitHub();
