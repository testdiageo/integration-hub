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
    period: "once",
    icon: Gift,
    badge: null,
    features: [
      "3 Integration projects",
      "AI-powered field mapping",
      "XSLT & DataWeave generation",
      "Basic validation (5 rows preview)",
      "CSV, JSON, XML support",
      "Community support",
      "14-day project retention",
    ],
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
    features: [
      "10 Integration projects",
      "AI-powered field mapping",
      "XSLT & DataWeave generation",
      "Standard validation (50 rows preview)",
      "All file formats supported",
      "Email support",
      "60-day project retention",
      "Download transformation code",
    ],
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
    features: [
      "Unlimited integration projects",
      "Advanced AI field mapping",
      "XSLT & DataWeave generation",
      "Advanced validation (unlimited preview)",
      "All file formats supported",
      "Priority email support",
      "Unlimited project retention",
      "Team collaboration (up to 5 users)",
      "API access",
      "Custom transformation templates",
    ],
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
    features: [
      "Everything in Monthly",
      "2 months free (save $189)",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom AI model training",
      "24/7 priority support",
      "SLA guarantee",
      "Advanced security & compliance",
      "Training & onboarding",
      "Custom integrations",
    ],
    cta: "Subscribe Annually",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I switch plans later?",
    answer: "Yes! Free users can upgrade to any paid plan anytime. Paid users can switch between monthly and annual subscriptions. Changes take effect immediately.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) via Stripe. Annual plans also support invoice billing.",
  },
  {
    question: "What's included in the Free plan?",
    answer: "The Free plan includes 3 integration projects with AI-powered field mapping and code generation. You can preview up to 5 rows of transformed data and export your transformation code.",
  },
  {
    question: "What happens after a one-time purchase expires?",
    answer: "One-time purchases give you 60 days of access. After that, your projects are archived but you can upgrade to monthly/annual to restore access or purchase another one-time plan.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for monthly and annual subscriptions. One-time purchases are non-refundable after you create your first project.",
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

                      <div className="space-y-3">
                        {plan.features.map((feature, featureIdx) => (
                          <div key={featureIdx} className="flex items-start gap-3" data-testid={`feature-${plan.name.toLowerCase()}-${featureIdx}`}>
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
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
