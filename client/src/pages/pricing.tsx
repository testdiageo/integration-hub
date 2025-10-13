import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check, Gift, Zap, TrendingUp, Crown } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const pricingPlans = [
  {
    name: "Free",
    tier: "free",
    description: "Try Connetly with limited features",
    price: "0",
    period: "forever",
    icon: Gift,
    badge: null,
    features: {
      projects: "0 projects",
      retention: "0 days",
      downloads: "No downloads",
      teamSize: "1 user",
      support: "Community support",
      features: [
        "AI-powered field mapping",
        "XSLT & DataWeave generation",
        "Basic validation (5 rows preview)",
        "CSV, JSON, XML support",
      ],
    },
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "One-Time",
    tier: "one-time",
    description: "Perfect for a single integration project",
    price: "49",
    period: "one-time",
    icon: Zap,
    badge: null,
    features: {
      projects: "3 projects",
      retention: "60 days",
      downloads: "3/month",
      teamSize: "1 user",
      support: "Email support",
      features: [
        "AI-powered field mapping",
        "XSLT & DataWeave generation",
        "Standard validation (50 rows preview)",
        "All file formats supported",
      ],
    },
    cta: "Purchase Once",
    highlighted: false,
  },
  {
    name: "Monthly",
    tier: "monthly",
    description: "For ongoing integration development",
    price: "99",
    period: "month",
    icon: TrendingUp,
    badge: "Most Popular",
    features: {
      projects: "5 projects",
      retention: "120 days",
      downloads: "5/month",
      teamSize: "1 user",
      support: "Priority email support",
      features: [
        "Advanced AI field mapping",
        "XSLT & DataWeave generation",
        "Advanced validation (unlimited preview)",
        "All file formats supported",
        "API access",
        "Custom transformation templates",
      ],
    },
    cta: "Start Monthly",
    highlighted: true,
  },
  {
    name: "Annual",
    tier: "annual",
    description: "Best value for serious integration teams",
    price: "999",
    period: "year",
    icon: Crown,
    badge: "Best Value",
    features: {
      projects: "50 projects",
      retention: "Unlimited",
      downloads: "50/year",
      teamSize: "2 users",
      support: "24/7 priority support",
      features: [
        "Everything in Monthly",
        "2 months free (save $189)",
        "Dedicated account manager",
        "Custom AI model training",
        "SLA guarantee",
        "Advanced security & compliance",
        "Training & onboarding",
        "Custom integrations",
      ],
    },
    cta: "Subscribe Annually",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade to any paid plan anytime. Paid users can switch between plans. Changes take effect immediately, and you'll be charged/credited the pro-rated difference.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) via Stripe. Annual plans also support invoice billing for enterprise customers.",
  },
  {
    question: "What's included in the Free plan?",
    answer: "The Free plan allows you to explore the platform but does not include project creation or downloads. It's designed to help you understand the platform before subscribing. Upgrade to start creating projects.",
  },
  {
    question: "How do project limits work?",
    answer: "Each tier has a maximum number of active projects: One-Time (3), Monthly (5), Annual (50). You can delete old projects to create new ones if you reach your limit. Data retention policies determine how long projects are kept.",
  },
  {
    question: "How do download limits work?",
    answer: "Download limits reset monthly for One-Time and Monthly plans, and annually for Annual plans. One-Time: 3/month, Monthly: 5/month, Annual: 50/year. Track your usage in your account dashboard.",
  },
  {
    question: "What happens when data retention expires?",
    answer: "Projects older than your retention period are automatically deleted. One-Time: 60 days, Monthly: 120 days, Annual: Unlimited. Upgrade to extend retention or download your work before expiration.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for all paid subscriptions. Simply contact support if you're not satisfied within 30 days of purchase.",
  },
];

export default function Pricing() {
  const { user, isLoading, isAuthenticated, isPaidUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: async (tier: string) => {
      return await apiRequest("/api/auth/subscribe", "POST", { tier });
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "✅ Subscription Activated!",
        description: "Your subscription is now active. All features unlocked!",
      });
      
      // Redirect to hub after successful subscription
      setTimeout(() => {
        window.location.href = "/hub";
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (tier: string, planName: string) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      // Store the intended plan in sessionStorage for post-login redirect
      sessionStorage.setItem('intendedPlan', tier);
      // Redirect to auth with return URL
      window.location.href = "/auth?returnTo=/pricing";
      return;
    }
    
    // Check if user already has this plan
    if (user?.subscriptionStatus === tier) {
      toast({
        title: "Already Subscribed",
        description: `You already have the ${planName} plan active.`,
        variant: "default",
      });
      return;
    }
    
    // Handle plan changes/upgrades
    const currentTierOrder = { free: 0, 'one-time': 1, monthly: 2, annual: 3 };
    const currentOrder = currentTierOrder[user?.subscriptionStatus as keyof typeof currentTierOrder] || 0;
    const newOrder = currentTierOrder[tier as keyof typeof currentTierOrder] || 0;
    
    let actionType = "activate";
    if (currentOrder < newOrder) {
      actionType = "upgrade";
    } else if (currentOrder > newOrder) {
      actionType = "downgrade";
    }
    
    // In production, this would integrate with Stripe or payment gateway
    // For now, we'll just show a confirmation and proceed
    if (tier === 'free' && user?.subscriptionStatus !== 'free') {
      // Downgrade confirmation
      const confirmed = window.confirm(
        `Are you sure you want to downgrade to the Free plan? You'll lose access to paid features.`
      );
      if (!confirmed) return;
    }
    
    subscribeMutation.mutate(tier);
  };

  const getCurrentPlanName = () => {
    if (!user?.subscriptionStatus) return "Free";
    const statusMap: Record<string, string> = {
      free: "Free",
      "one-time": "One-Time",
      monthly: "Monthly",
      annual: "Annual",
    };
    return statusMap[user.subscriptionStatus] || "Free";
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - Connetly | Flexible Options for Every Team"
        description="Choose the perfect Connetly plan for your needs. Free plan available once per user, one-time purchase, or monthly/annual subscriptions with AI-powered field mapping and code generation."
        keywords="integration pricing, data transformation pricing, XSLT tool pricing, API integration cost, field mapping subscription"
        canonicalUrl={`${window.location.origin}/pricing`}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-pricing">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-pricing-description">
                Start free, upgrade when you need more. All plans include our core AI-powered integration features.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pricingPlans.map((plan, idx) => {
                const Icon = plan.icon;
                const isCurrentPlan = user?.subscriptionStatus === plan.tier;
                return (
                  <Card
                    key={idx}
                    className={`relative overflow-hidden ${
                      plan.highlighted ? "border-primary shadow-xl md:scale-105" : ""
                    } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                    data-testid={`card-pricing-${plan.name.toLowerCase()}`}
                  >
                    {plan.badge && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary" data-testid={`badge-${plan.name.toLowerCase()}`}>
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl" data-testid={`title-${plan.name.toLowerCase()}`}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription data-testid={`description-${plan.name.toLowerCase()}`}>
                        {plan.description}
                      </CardDescription>
                      <div className="mt-6">
                        <span className="text-4xl font-bold" data-testid={`price-${plan.name.toLowerCase()}`}>
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          /{plan.period}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2 mb-6">
                        {isCurrentPlan ? (
                          <Button
                            className="w-full"
                            variant="default"
                            size="lg"
                            disabled
                            data-testid={`button-current-${plan.name.toLowerCase()}`}
                          >
                            ✓ Current Plan
                          </Button>
                        ) : (
                          <>
                            {(() => {
                              // Calculate if this is an upgrade or downgrade
                              const tierOrder = { free: 0, 'one-time': 1, monthly: 2, annual: 3 };
                              const currentOrder = tierOrder[user?.subscriptionStatus as keyof typeof tierOrder] || 0;
                              const planOrder = tierOrder[plan.tier as keyof typeof tierOrder] || 0;
                              
                              let buttonText = plan.cta;
                              if (isAuthenticated && user?.subscriptionStatus) {
                                if (planOrder > currentOrder) {
                                  buttonText = `Upgrade to ${plan.name}`;
                                } else if (planOrder < currentOrder) {
                                  buttonText = `Downgrade to ${plan.name}`;
                                } else {
                                  buttonText = plan.cta;
                                }
                              } else if (!isAuthenticated) {
                                buttonText = "Sign In to Subscribe";
                              }
                              
                              if (plan.tier === "free") {
                                return (
                                  <Button
                                    className="w-full"
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    data-testid={`button-cta-${plan.name.toLowerCase()}`}
                                  >
                                    <Link href={isAuthenticated ? "/hub" : "/auth"}>
                                      {isAuthenticated ? "Access Hub" : "Get Started Free"}
                                    </Link>
                                  </Button>
                                );
                              }
                              
                              return (
                                <Button
                                  className="w-full"
                                  variant={plan.highlighted ? "default" : "outline"}
                                  size="lg"
                                  onClick={() => handleSelectPlan(plan.tier, plan.name)}
                                  disabled={subscribeMutation.isPending}
                                  data-testid={`button-cta-${plan.name.toLowerCase()}`}
                                >
                                  {subscribeMutation.isPending ? "Processing..." : buttonText}
                                </Button>
                              );
                            })()}
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Key Limits */}
                        <div className="space-y-2 pb-4 border-b">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Projects</span>
                            <span className="font-semibold">{plan.features.projects}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Retention</span>
                            <span className="font-semibold">{plan.features.retention}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Downloads</span>
                            <span className="font-semibold">{plan.features.downloads}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Team Size</span>
                            <span className="font-semibold">{plan.features.teamSize}</span>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                          {plan.features.features.map((feature: string, featureIdx: number) => (
                            <div key={featureIdx} className="flex items-start gap-3" data-testid={`feature-${plan.name.toLowerCase()}-${featureIdx}`}>
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                          
                          {/* Support */}
                          <div className="flex items-start gap-3 pt-2 border-t">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{plan.features.support}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="heading-comparison">
              Detailed Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center font-semibold">Free</th>
                    <th className="p-4 text-center font-semibold">One-Time</th>
                    <th className="p-4 text-center font-semibold">Monthly</th>
                    <th className="p-4 text-center font-semibold bg-primary/10">Annual</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4 font-medium">Projects</td>
                    <td className="p-4 text-center">0</td>
                    <td className="p-4 text-center">3</td>
                    <td className="p-4 text-center">5</td>
                    <td className="p-4 text-center bg-primary/5">50</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium">Data Retention</td>
                    <td className="p-4 text-center">0 days</td>
                    <td className="p-4 text-center">60 days</td>
                    <td className="p-4 text-center">120 days</td>
                    <td className="p-4 text-center bg-primary/5">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Downloads</td>
                    <td className="p-4 text-center">
                      <span className="text-destructive">❌</span>
                    </td>
                    <td className="p-4 text-center">3/month</td>
                    <td className="p-4 text-center">5/month</td>
                    <td className="p-4 text-center bg-primary/5">50/year</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium">Team Size</td>
                    <td className="p-4 text-center">1 user</td>
                    <td className="p-4 text-center">1 user</td>
                    <td className="p-4 text-center">1 user</td>
                    <td className="p-4 text-center bg-primary/5">2 users</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">AI-Powered Field Mapping</td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium">XSLT & DataWeave Generation</td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Validation Preview</td>
                    <td className="p-4 text-center text-sm">5 rows</td>
                    <td className="p-4 text-center text-sm">50 rows</td>
                    <td className="p-4 text-center text-sm">Unlimited</td>
                    <td className="p-4 text-center text-sm bg-primary/5">Unlimited</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="p-4 font-medium">File Format Support</td>
                    <td className="p-4 text-center text-sm">CSV, JSON, XML</td>
                    <td className="p-4 text-center text-sm">All formats</td>
                    <td className="p-4 text-center text-sm">All formats</td>
                    <td className="p-4 text-center text-sm bg-primary/5">All formats</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Support</td>
                    <td className="p-4 text-center text-sm">Community</td>
                    <td className="p-4 text-center text-sm">Email</td>
                    <td className="p-4 text-center text-sm">Priority Email</td>
                    <td className="p-4 text-center text-sm bg-primary/5">24/7 Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="heading-faq">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <Card key={idx} data-testid={`card-faq-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid={`question-${idx}`}>
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground" data-testid={`answer-${idx}`}>
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription Status */}
        {isAuthenticated && (
          <section className="py-8 bg-muted/20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg" data-testid="text-current-status">Current Status</h3>
                      <p className="text-muted-foreground text-sm" data-testid="text-status-description">
                        You're on the {getCurrentPlanName()} plan
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={user?.subscriptionStatus === "free" ? "secondary" : "default"} 
                        className="text-sm"
                        data-testid="badge-current-plan"
                      >
                        {getCurrentPlanName()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="heading-cta">
              Still have questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta">
              Our team is here to help you choose the right plan for your needs
            </p>
            <Button size="lg" asChild data-testid="button-contact">
              <Link href="/hub">Contact Sales</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
