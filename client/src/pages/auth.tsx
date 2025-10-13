import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft } from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check for return URL in query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      
      if (returnTo) {
        setLocation(returnTo);
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <>
      <SEOHead
        title="Sign In - Connetly"
        description="Sign in to Connetly to access intelligent data integration features"
        canonicalUrl={`${window.location.origin}/auth`}
      />

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Column - Auth Forms */}
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <ArrowRightLeft className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Connetly
                </span>
              </div>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                        data-testid="input-login-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                        data-testid="input-register-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                        data-testid="input-register-email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">First Name</Label>
                        <Input
                          id="register-firstName"
                          type="text"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          data-testid="input-register-firstName"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          data-testid="input-register-lastName"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        data-testid="input-register-password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Hero Section */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 p-12">
          <div className="max-w-md text-center">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Data Integration
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Transform your data workflows with AI-powered field mapping, automated XSLT and DataWeave generation, and seamless integration capabilities.
            </p>
            <div className="grid gap-4 text-left">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                <div>
                  <h3 className="font-semibold mb-1">Smart Field Mapping</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect and suggest field mappings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                <div>
                  <h3 className="font-semibold mb-1">Dual Format Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate both XSLT and DataWeave transformations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                <div>
                  <h3 className="font-semibold mb-1">Production Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Download transformation code ready for deployment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
