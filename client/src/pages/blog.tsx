import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, TrendingUp, Home } from "lucide-react";
import { Link } from "wouter";

const blogPosts = [
  {
    id: 2,
    title: "XSLT vs DataWeave: Choosing the Right Transformation Language",
    excerpt: "A comprehensive comparison of XSLT and DataWeave transformation languages to help you make the right choice for your project.",
    author: "Michael Rodriguez",
    date: "2025-01-10",
    readTime: "12 min read",
    category: "Technical Deep Dive",
    image: "/api/placeholder/400/250",
    featured: true,
  },
  {
    id: 4,
    title: "Building ETL Pipelines: A Complete Guide",
    excerpt: "Everything you need to know about Extract, Transform, Load processes and how to implement them effectively.",
    author: "David Kim",
    date: "2024-12-28",
    readTime: "15 min read",
    category: "Tutorial",
    image: "/api/placeholder/400/250",
  },
  {
    id: 1,
    title: "10 Best Practices for Data Integration in 2025",
    excerpt: "Learn the essential strategies for building robust and scalable data integration pipelines that stand the test of time.",
    author: "Sarah Chen",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Best Practices",
    image: "/api/placeholder/400/250",
  },
  {
    id: 3,
    title: "How AI is Revolutionizing Field Mapping",
    excerpt: "Discover how machine learning algorithms are transforming the way we approach data integration and field mapping.",
    author: "Emily Watson",
    date: "2025-01-05",
    readTime: "6 min read",
    category: "AI & Innovation",
    image: "/api/placeholder/400/250",
  },
  {
    id: 5,
    title: "Optimizing Data Transformation Performance",
    excerpt: "Tips and techniques for improving the speed and efficiency of your data transformation workflows.",
    author: "Lisa Anderson",
    date: "2024-12-20",
    readTime: "10 min read",
    category: "Performance",
    image: "/api/placeholder/400/250",
  },
  {
    id: 6,
    title: "API Integration Strategies for Modern Applications",
    excerpt: "Learn how to design and implement robust API integrations that scale with your business needs.",
    author: "James Wilson",
    date: "2024-12-15",
    readTime: "9 min read",
    category: "Integration",
    image: "/api/placeholder/400/250",
  },
];

const categories = ["All", "Best Practices", "Technical Deep Dive", "AI & Innovation", "Tutorial", "Performance", "Integration"];

export default function Blog() {
  return (
    <>
      <SEOHead
        title="IntegrationHub Blog - Data Integration Insights & Best Practices"
        description="Expert insights on data integration, XSLT, DataWeave, AI-powered field mapping, and best practices for building scalable integration pipelines."
        keywords="data integration blog, XSLT tutorial, DataWeave guide, API integration, ETL best practices, field mapping"
        canonicalUrl={`${window.location.origin}/blog`}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button variant="ghost" asChild data-testid="button-return-home">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </div>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-blog">
                Integration Insights & Best Practices
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-blog-description">
                Learn from industry experts about data integration, transformation, and automation
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  data-testid={`button-category-${category.toLowerCase().replace(" ", "-")}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold" data-testid="heading-featured">Featured Post</h2>
            </div>
            {blogPosts[0] && (
              <Card className="overflow-hidden hover:shadow-xl transition-shadow" data-testid="card-featured-post">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 aspect-video md:aspect-auto" />
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4" data-testid="badge-featured-category">{blogPosts[0].category}</Badge>
                    <CardTitle className="text-3xl mb-4" data-testid="title-featured-post">{blogPosts[0].title}</CardTitle>
                    <CardDescription className="text-base mb-6" data-testid="excerpt-featured-post">
                      {blogPosts[0].excerpt}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(blogPosts[0].date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{blogPosts[0].readTime}</span>
                      </div>
                    </div>
                    <Button asChild data-testid="button-read-featured">
                      <Link href={`/blog/${blogPosts[0].id}`}>
                        Read Article <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* All Posts */}
        <section className="py-12 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8" data-testid="heading-recent-posts">Recent Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(1).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col" data-testid={`card-blog-post-${post.id}`}>
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 aspect-video" />
                  <CardHeader>
                    <Badge className="w-fit mb-2" data-testid={`badge-category-${post.id}`}>{post.category}</Badge>
                    <CardTitle className="line-clamp-2" data-testid={`title-post-${post.id}`}>{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3" data-testid={`excerpt-post-${post.id}`}>
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full" data-testid={`button-read-post-${post.id}`}>
                      <Link href={`/blog/${post.id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
