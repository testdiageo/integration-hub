import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo-head";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Code2,
  Database,
  FileCode,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <SEOHead
        title="Connetly - AI-Powered Data Integration & Transformation Platform"
        description="Transform your data integration workflow with AI-powered field mapping, automated XSLT and DataWeave generation, and intelligent transformation logic. Support for CSV, JSON, XML, and Excel formats."
        keywords="data integration, AI field mapping, XSLT generation, DataWeave transformation, API integration, data transformation, ETL tool, integration platform"
        canonicalUrl={window.location.origin}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
            <div className="text-center max-w-4xl mx-auto" style={{ overflow: 'visible' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in" data-testid="badge-ai-powered">
                <Sparkles className="h-4 w-4" />
                AI-Powered Integration Platform
              </div>
              
              <div className="py-4" style={{ overflow: 'visible', minHeight: 'fit-content' }}>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in-up" data-testid="heading-hero" style={{ lineHeight: '1.5', paddingTop: '0.1em', paddingBottom: '0.3em', display: 'block' }}>
                  Transform Data Integration with Intelligence
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up animation-delay-200" data-testid="text-hero-description">
                Upload your source and target files. Map fields, generate transformation logic, and create production-ready XSLT or DataWeave code in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                <Button size="lg" asChild className="text-lg px-8" data-testid="button-start-free">
                  <Link href="/hub">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8" data-testid="button-view-pricing">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              {[
                { value: "95%", label: "Accuracy Rate" },
                { value: "10x", label: "Faster Mapping" },
                { value: "50+", label: "File Formats" },
                { value: "24/7", label: "Support" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-features">
                Everything You Need for Seamless Integration
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
                From AI-powered mapping to production-ready code generation, we've got you covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Smart Field Mapping",
                  description: "Intelligent algorithms analyze your data and suggest optimal field mappings with confidence scores",
                },
                {
                  icon: Zap,
                  title: "Instant Code Generation",
                  description: "Generate production-ready XSLT and DataWeave transformation code in seconds",
                },
                {
                  icon: Database,
                  title: "Multi-Format Support",
                  description: "Work with CSV, JSON, XML, Excel, and more. We handle the complexity for you",
                },
                {
                  icon: FileCode,
                  title: "XSLT & DataWeave",
                  description: "Choose your preferred transformation format. Both XSLT and DataWeave supported",
                },
                {
                  icon: Shield,
                  title: "Validation & Testing",
                  description: "Built-in validation ensures your transformations work correctly before deployment",
                },
                {
                  icon: BarChart3,
                  title: "Visual Analytics",
                  description: "See mapping confidence scores and transformation previews at every step",
                },
              ].map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow" data-testid={`card-feature-${idx}`}>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-how-it-works">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-how-it-works-description">
                Get from data to deployment in 6 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: "Upload Files", description: "Drop your source and target data files" },
                { step: 2, title: "Smart Mapping", description: "Intelligent field mapping suggestions" },
                { step: 3, title: "Review & Adjust", description: "Review mappings and make adjustments" },
                { step: 4, title: "Generate Code", description: "Choose XSLT or DataWeave format" },
                { step: 5, title: "Validate", description: "Test transformations with sample data" },
                { step: 6, title: "Download", description: "Get production-ready code and docs" },
              ].map((item) => (
                <div key={item.step} className="relative" data-testid={`step-${item.step}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cta">
                  Ready to Transform Your Integration Workflow?
                </h2>
                <p className="text-xl opacity-90 mb-8" data-testid="text-cta-description">
                  Join thousands of developers who trust Connetly for their data transformation needs
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild className="text-lg px-8" data-testid="button-cta-start">
                    <Link href="/hub">
                      Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/20" data-testid="button-cta-demo">
                    <Link href="/pricing">See Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
