import { useRoute, Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Calendar, Clock, User } from "lucide-react";

const blogArticles: Record<string, {
  title: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}> = {
  "2": {
    title: "XSLT vs DataWeave: Choosing the Right Transformation Language for Your Integration Needs",
    author: "Michael Rodriguez",
    date: "2025-01-10",
    readTime: "12 min read",
    category: "Technical Deep Dive",
    content: `
In the world of data transformation, two powerful languages often stand at the forefront of architectural discussions: the veteran XSLT and the modern DataWeave. While both serve the fundamental purpose of converting data from one format to another, their approaches, capabilities, and ideal use cases differ significantly. Understanding these differences is crucial for making informed decisions in your integration projects.

## The Veteran: XSLT (Extensible Stylesheet Language Transformations)

XSLT has been the cornerstone of XML transformation since the late 1990s. As a declarative language, it uses template-based rules to transform XML documents into various formats.

### Strengths of XSLT:

- **Mature and Standardized**: W3C standard with extensive documentation and community knowledge
- **XML Native**: Exceptional handling of complex XML structures and namespaces
- **Wide Support**: Built into most programming languages and databases
- **Powerful Templating**: Ideal for document-oriented transformations

### Common Use Cases:

\`\`\`xml
<!-- Example: Simple XSLT transforming XML to HTML -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <body>
        <h2>Employee List</h2>
        <xsl:for-each select="employees/employee">
          <p><xsl:value-of select="name"/> - <xsl:value-of select="department"/></p>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
\`\`\`

## The Modern Contender: DataWeave

DataWeave is a functional data transformation language developed by MuleSoft for use within Mule runtime engines. Designed for modern integration needs, it excels at handling multiple data formats beyond just XML.

### Strengths of DataWeave:

- **Multi-Format Native**: Seamlessly handles JSON, XML, CSV, Java Objects, and more
- **Functional Programming**: Clean, expressive syntax with strong typing
- **Integration Optimized**: Built for modern API-led connectivity
- **Excellent Tooling**: Great support in Anypoint Studio with auto-completion and validation

### Common Use Cases:

\`\`\`javascript
// Example: DataWeave transforming JSON to XML
%dw 2.0
output application/xml
---
{
  employees: {
    employee: payload.employees map ((employee) -> {
      name: employee.fullName,
      department: employee.dept,
      active: employee.status == "ACTIVE"
    })
  }
}
\`\`\`

## Head-to-Head Comparison

### Syntax and Readability

**XSLT** uses XML-based syntax, which can become verbose for complex transformations:

\`\`\`xml
<xsl:choose>
  <xsl:when test="price > 100">Premium</xsl:when>
  <xsl:otherwise>Standard</xsl:otherwise>
</xsl:choose>
\`\`\`

**DataWeave** offers more concise, readable syntax:

\`\`\`javascript
price: if (payload.price > 100) "Premium" else "Standard"
\`\`\`

### Learning Curve

**XSLT** has a steeper learning curve due to:
- XML-based syntax verbosity
- Complex XPath expressions
- Template rule precedence complexities

**DataWeave** is generally easier to learn with:
- Intuitive functional syntax
- Better error messages
- Superior IDE support

### Performance Considerations

- **XSLT**: Excellent for large XML documents with streaming capabilities
- **DataWeave**: Optimized for typical integration payload sizes with efficient memory management

## When to Choose Which?

### Choose XSLT When:

- Working primarily with complex XML documents
- Requiring XSLT 2.0/3.0 advanced features (grouping, functions)
- In legacy enterprise environments with existing XSLT expertise
- Transforming document-oriented data with deep hierarchical structures
- Need standards compliance across different platforms

### Choose DataWeave When:

- Building modern integration solutions with MuleSoft
- Working with multiple data formats (JSON, XML, CSV)
- Developing API-led connectivity architectures
- Prioritizing developer productivity and maintainability
- Requiring strong typing and better debugging capabilities

## Migration Considerations

Many organizations are gradually migrating from XSLT to DataWeave for modern integration projects. The migration strategy typically involves:

1. **Assessment**: Identify XSLT transformations that would benefit from DataWeave
2. **Parallel Implementation**: Run both transformations during transition
3. **Incremental Migration**: Convert simpler transformations first
4. **Team Training**: Upskill developers on functional programming concepts

## The Verdict

For modern integration platforms and cloud-native architectures, **DataWeave generally has the edge**. Its multi-format capabilities, cleaner syntax, and integration-optimized design make it more suitable for contemporary use cases.

However, **XSLT remains relevant** for XML-heavy environments, legacy system integrations, and scenarios requiring advanced XML processing capabilities.

The choice ultimately depends on your specific requirements:

- Existing infrastructure and expertise
- Primary data formats you work with
- Integration platform selection
- Team skills and training capacity

Both languages are powerful in their respective domains, and understanding their strengths will ensure you make the right transformation choice for your project's success.

**Which transformation language are you using in your current projects? Share your experiences in the comments below!**
    `
  },
  "4": {
    title: "Building ETL Pipelines: A Complete Guide",
    author: "David Kim",
    date: "2024-12-28",
    readTime: "15 min read",
    category: "Tutorial",
    content: `
In today's data-driven world, organizations generate massive amounts of information every second. But raw data alone isn't useful — it needs to be collected, cleaned, and transformed before it can fuel analytics, AI, or business intelligence. That's where ETL pipelines come in.

This guide will walk you through everything you need to know about building ETL pipelines — from core concepts to tools, architecture, and best practices.

## What is ETL?

ETL stands for **Extract, Transform, Load**, a process used to move data from one system to another while ensuring it's accurate, consistent, and analytics-ready.

- **Extract** – Pull data from various sources such as APIs, databases, flat files, or cloud services.
- **Transform** – Clean, validate, and standardize the data (e.g., handling missing values, renaming columns, aggregating metrics).
- **Load** – Push the transformed data into a target system like a data warehouse or data lake (e.g., Snowflake, BigQuery, or Redshift).

Together, these stages create a data pipeline that continuously moves and processes data for reporting, analytics, or machine learning.

## Why ETL Pipelines Matter

A well-built ETL pipeline is essential because it:

- Automates data integration from multiple sources
- Improves data quality and consistency
- Saves time for analysts and data scientists
- Enables real-time insights when paired with streaming tools
- Supports compliance by maintaining an audit trail of data movement

In short, ETL pipelines are the backbone of every modern data stack.

## Core Components of an ETL Pipeline

A robust ETL system usually consists of these key components:

### Data Sources:
APIs, CRM systems, IoT devices, databases, flat files (CSV, JSON), and cloud storage.

### ETL Engine:
The tool or platform that orchestrates extraction, transformation, and loading (e.g., Apache Airflow, AWS Glue, or custom Python scripts).

### Data Storage:
Temporary storage (staging area) and final destinations like data warehouses or lakes.

### Monitoring & Logging:
Tools for tracking job failures, data latency, and performance.

### Scheduling & Automation:
Cron jobs, Airflow DAGs, or workflow orchestrators to automate pipeline runs.

## How to Build an ETL Pipeline (Step-by-Step)

Here's a simplified process to design and implement your own ETL pipeline.

### 1. Define Requirements

- Identify your data sources and target destination.
- Understand data formats, frequency of updates, and volume.
- Define transformation logic and business rules.

### 2. Choose the Right Tools

Select tools that fit your use case and scale:

- **Extraction**: Python scripts, Fivetran, Stitch, Talend
- **Transformation**: dbt, Spark, Pandas
- **Loading**: Airbyte, AWS Glue, Kafka, or direct SQL loaders

### 3. Design the Data Flow

Map how data will move from source to destination.
A typical flow looks like:
**Source → Staging Area → Transformation Layer → Data Warehouse**

### 4. Implement Data Extraction

Connect to your data sources using APIs, connectors, or SQL queries.
Make sure to handle pagination, authentication, and rate limits properly.

### 5. Apply Transformations

Perform data cleaning and enrichment. Common tasks include:

- Normalizing formats (dates, currencies)
- Handling null values
- Aggregating metrics
- Joining multiple datasets

### 6. Load Data

Push the cleaned data into your target database or warehouse.
Use batch loads or streaming inserts depending on latency needs.

### 7. Automate & Monitor

Set up automated runs using tools like Apache Airflow or Prefect.
Implement alerts for job failures and monitor data quality metrics.

## Popular Tools for ETL Pipelines

| Stage | Common Tools |
|-------|--------------|
| Extract | Fivetran, Airbyte, Talend |
| Transform | dbt, Apache Spark, Pandas |
| Load | Snowflake, BigQuery, Redshift |
| Orchestration | Apache Airflow, Prefect, Dagster |
| Monitoring | Great Expectations, Monte Carlo, Datadog |

The right stack depends on your scale, team skillset, and infrastructure (cloud vs. on-premise).

## Best Practices for ETL Pipelines

- **Design for Scalability** – Use distributed processing for large datasets.
- **Keep Transformations Modular** – Easier to debug and reuse.
- **Implement Data Validation** – Catch bad data early with schema checks.
- **Log Everything** – Maintain full traceability of data flows.
- **Optimize for Performance** – Partition data, use bulk inserts, and parallelize tasks.
- **Version Control Your Pipelines** – Treat ETL scripts as production code.

## ETL vs. ELT: What's the Difference?

While ETL transforms data before loading, **ELT (Extract, Load, Transform)** loads raw data first and then transforms it inside the destination warehouse.

- **ETL** is great for complex transformations before loading.
- **ELT** leverages modern data warehouses for faster, scalable transformations.

Many modern data stacks use ELT with tools like dbt for in-warehouse transformations.

## Example: A Simple ETL Pipeline in Python

\`\`\`python
import pandas as pd
import requests
from sqlalchemy import create_engine

# 1. Extract
url = "https://api.example.com/sales"
data = requests.get(url).json()
df = pd.DataFrame(data)

# 2. Transform
df['date'] = pd.to_datetime(df['date'])
df = df[df['amount'] > 0]

# 3. Load
engine = create_engine("postgresql://user:pass@localhost:5432/warehouse")
df.to_sql('sales_data', engine, if_exists='replace', index=False)
\`\`\`

This basic example demonstrates how Python can connect APIs, transform data using Pandas, and load it into a warehouse.

## Conclusion

Building ETL pipelines is both an art and a science — it requires understanding data systems, automation tools, and performance optimization. Whether you're processing a few gigabytes or terabytes daily, a well-designed ETL pipeline ensures your organization can make data-driven decisions efficiently and confidently.

**Start small, automate early, and monitor continuously — your future data team will thank you.**
    `
  }
};

export default function BlogArticle() {
  const [, params] = useRoute("/blog/:id");
  const articleId = params?.id || "";
  const article = blogArticles[articleId];

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${article.title} - IntegrationHub Blog`}
        description={article.content.substring(0, 155)}
        keywords="XSLT, DataWeave, transformation language, data integration, MuleSoft, XML transformation"
        canonicalUrl={`${window.location.origin}/blog/${articleId}`}
      />

      <div className="min-h-screen bg-background">
        {/* Navigation Bar */}
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" asChild data-testid="button-back-to-blog">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
              <Button variant="outline" asChild data-testid="button-home">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Badge className="mb-4" data-testid="badge-category">{article.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-article-title">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span data-testid="text-author">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-date">{new Date(article.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span data-testid="text-read-time">{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <Card className="p-8 md:p-12">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-2
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
              data-testid="article-content"
              dangerouslySetInnerHTML={{ 
                __html: article.content
                  .split('\n')
                  .map(line => {
                    // Convert markdown-style headers
                    if (line.startsWith('## ')) {
                      return `<h2>${line.substring(3)}</h2>`;
                    }
                    if (line.startsWith('### ')) {
                      return `<h3>${line.substring(4)}</h3>`;
                    }
                    // Convert bold text
                    line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                    // Convert code blocks
                    if (line.startsWith('```')) {
                      const lang = line.substring(3);
                      return `<pre><code class="language-${lang}">`;
                    }
                    if (line === '```') {
                      return '</code></pre>';
                    }
                    // Convert bullet points
                    if (line.startsWith('- ')) {
                      return `<li>${line.substring(2)}</li>`;
                    }
                    // Regular paragraphs
                    if (line.trim() === '') {
                      return '<br />';
                    }
                    return `<p>${line}</p>`;
                  })
                  .join('')
              }}
            />
          </Card>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" asChild data-testid="button-footer-blog">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                More Articles
              </Link>
            </Button>
            <Button asChild data-testid="button-footer-hub">
              <Link href="/hub">
                Try IntegrationHub
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </>
  );
}
