import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/subscription-context";
import { useToast } from "@/hooks/use-toast";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "wouter";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for trying out IntegrationHub",
    price: "49",
    period: "one-time",
    icon: Zap,
    badge: null,
    features: [
      "10 Integration projects",
      "AI-powered field mapping",
      "XSLT & DataWeave generation",
      "Basic validation & testing",
      "CSV, JSON, XML support",
      "Email support",
      "30-day access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For teams building integrations at scale",
    price: "99",
    period: "per month",
    icon: Sparkles,
    badge: "Most Popular",
    features: [
      "Unlimited integration projects",
      "Advanced AI field mapping",
      "XSLT & DataWeave generation",
      "Advanced validation & testing",
      "All file formats supported",
      "Priority email & chat support",
      "Custom transformation templates",
      "Team collaboration (up to 5 users)",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: "899",
    period: "per year",
    icon: Crown,
    badge: "Best Value",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom AI model training",
      "On-premise deployment option",
      "24/7 phone support",
      "SLA guarantee",
      "Custom integrations",
      "Advanced security & compliance",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the end of your billing cycle for downgrades.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and offer invoice billing for annual Enterprise plans.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Professional plan users get a 14-day free trial with full access to all features. No credit card required to start.",
  },
  {
    question: "What happens after the one-time Starter plan expires?",
    answer: "After 30 days, you can upgrade to a monthly or annual plan to continue using IntegrationHub, or purchase another Starter plan for additional projects.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for monthly and annual plans. One-time purchases are non-refundable after project creation.",
  },
];

export default function Pricing() {
  const { isTrial, isPaid, setSubscriptionStatus } = useSubscription();
  const { toast } = useToast();

  const handleActivatePlan = (planName: string) => {
    setSubscriptionStatus("paid");
    toast({
      title: "✅ Plan Activated!",
      description: `${planName} plan is now active. All features unlocked!`,
    });
  };

  const handleStartTrial = () => {
    setSubscriptionStatus("trial");
    toast({
      title: "Free Trial Started",
      description: "You're now on a free trial with limited features.",
    });
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - IntegrationHub | Flexible Options for Every Team"
        description="Choose the perfect IntegrationHub plan for your needs. One-time, monthly, or annual subscriptions with AI-powered field mapping, XSLT & DataWeave generation. Start free trial today."
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
                Choose the plan that fits your needs. All plans include our core AI-powered integration features.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={idx}
                    className={`relative overflow-hidden ${
                      plan.highlighted ? "border-primary shadow-xl scale-105" : ""
                    }`}
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
                        <Button
                          className="w-full"
                          variant={plan.highlighted ? "default" : "outline"}
                          size="lg"
                          asChild
                          data-testid={`button-cta-${plan.name.toLowerCase()}`}
                        >
                          <Link href="/hub">{plan.cta}</Link>
                        </Button>
                        {plan.name !== "Starter" && (
                          <Button
                            className="w-full"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleActivatePlan(plan.name)}
                            data-testid={`button-activate-${plan.name.toLowerCase()}`}
                          >
                            {isPaid ? "✓ Plan Active" : `Activate ${plan.name}`}
                          </Button>
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
        <section className="py-8 bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Current Status</h3>
                    <p className="text-muted-foreground text-sm">
                      {isPaid ? "You have full access to all features" : "You're on a free trial with limited features"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isPaid ? "default" : "secondary"} className="text-sm">
                      {isPaid ? "Pro User" : "Free Trial"}
                    </Badge>
                    {isPaid && (
                      <Button variant="outline" size="sm" onClick={handleStartTrial} data-testid="button-switch-to-trial">
                        Switch to Trial (Demo)
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

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
