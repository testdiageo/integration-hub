import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, isPaidUser, isAdmin } = useAuth();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/hub", label: "Integration Hub" },
    { path: "/blog", label: "Blog" },
    { path: "/pricing", label: "Pricing" },
    ...(isAdmin ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IntegrationHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
            
            {!isLoading && !isAuthenticated && (
              <Button asChild data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </a>
              </Button>
            )}
            
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                {isPaidUser && (
                  <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full" data-testid="badge-paid">
                    Paid
                  </span>
                )}
                <Button variant="ghost" size="sm" asChild data-testid="button-logout">
                  <a href="/api/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
                data-testid={`link-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
            
            {!isLoading && !isAuthenticated && (
              <Button className="w-full" asChild data-testid="button-mobile-login">
                <a href="/api/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </a>
              </Button>
            )}
            
            {isAuthenticated && (
              <>
                {isPaidUser && (
                  <div className="px-3 py-2 text-center">
                    <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full" data-testid="badge-paid-mobile">
                      Paid User
                    </span>
                  </div>
                )}
                <Button className="w-full" variant="outline" asChild data-testid="button-mobile-logout">
                  <a href="/api/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
