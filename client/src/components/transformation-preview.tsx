import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Code, 
  Play, 
  Download, 
  RefreshCw, 
  FileCode, 
  Settings, 
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformationPreviewProps {
  projectId: string;
  onProceedToIntegration: () => void;
  onBackToMapping: () => void;
}

export function TransformationPreview({
  projectId,
  onProceedToIntegration,
  onBackToMapping,
}: TransformationPreviewProps) {
  const [integrationCode, setIntegrationCode] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filesGenerated, setFilesGenerated] = useState<any>(null);

  useEffect(() => {
    generateCode();
  }, [projectId]);

  const generateCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/generate-code`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate code");
      }

      const result = await response.json();
      setIntegrationCode(result);
      if (result.filesGenerated) {
        setFilesGenerated(result.filesGenerated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const testTransformation = async () => {
    setIsTesting(true);
    setError(null);

    try {
      const sampleData = {
        customer_id: "C001",
        first_name: "John", 
        last_name: "Doe",
        email_address: "john.doe@example.com",
        phone_number: "+1-555-0123",
        created_date: "2024-01-15"
      };

      const response = await fetch(`/api/projects/${projectId}/test-transformation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleData }),
      });

      if (!response.ok) {
        throw new Error("Test failed");
      }

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const sampleInput = {
    customer_id: "C001",
    first_name: "John",
    last_name: "Doe", 
    email_address: "john.doe@example.com",
    phone_number: "+1-555-0123",
    created_date: "2024-01-15"
  };

  const sampleOutput = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    contactEmail: "john.doe@example.com",
    dateCreated: "2024-01-15T00:00:00Z",
    isActive: true
  };

  if (isGenerating) {
    return (
      <Card data-testid="transformation-loading">
        <CardContent className="py-16">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">Generating Transformation Files</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>📄 Creating field mapping documentation...</p>
              <p>🔧 Generating XSLT transformation file...</p>
              <p>📊 Building mapping CSV file...</p>
              <p>⚙️ Preparing integration code...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Transformation Preview */}
      <Card data-testid="transformation-preview-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Data Transformation Preview</CardTitle>
            <Button
              variant="outline"
              onClick={generateCode}
              data-testid="button-regenerate-code"
            >
              <Code className="mr-2 h-4 w-4" />
              View Full Logic
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Sample */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Source Data Sample
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap" data-testid="source-data-sample">
                  {JSON.stringify(sampleInput, null, 2)}
                </pre>
              </div>
            </div>

            {/* Output Sample */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Target Data Output
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap" data-testid="target-data-sample">
                  {JSON.stringify(sampleOutput, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Transformation Summary */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-3">Applied Transformations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>customer_id → id (String to Integer)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>created_date → dateCreated (ISO Format)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-green-500" />
                <span>Added: isActive = true (Default)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Minus className="h-4 w-4 text-red-500" />
                <span>Dropped: phone_number (Unmapped)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Output */}
      <Card data-testid="integration-output-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Integration Output</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/api/projects/${projectId}/download/xslt`, '_blank')}
                  data-testid="button-download-xslt"
                  disabled={!filesGenerated}
                >
                  <Download className="mr-2 h-4 w-4" />
                  XSLT
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/api/projects/${projectId}/download/mapping-file`, '_blank')}
                  data-testid="button-download-mapping"
                  disabled={!filesGenerated}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Mapping CSV
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/api/projects/${projectId}/download/mapping-document`, '_blank')}
                  data-testid="button-download-documentation"
                  disabled={!filesGenerated}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
              </div>
              <Button 
                onClick={testTransformation}
                disabled={isTesting}
                data-testid="button-test-transformation"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Test Run
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="api">API Spec</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="test">Test Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {/* File Generation Status */}
              {filesGenerated && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800 dark:text-green-200">Files Generated Successfully</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    All transformation files have been created and are ready for download and validation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>XSLT Transformation File</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Field Mapping CSV</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mapping Documentation</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* XSLT Transformation */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileCode className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">XSLT Transformation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">XML transformation stylesheet</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={cn("font-mono", filesGenerated ? "text-green-600" : "text-amber-600")}>
                        {filesGenerated ? "Generated" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>File:</span>
                      <span className="font-mono">transformation.xsl</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span className="font-mono">XSLT 1.0</span>
                    </div>
                  </div>
                </div>

                {/* Field Mapping */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Settings className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Field Mapping</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Structured mapping data</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={cn("font-mono", filesGenerated ? "text-green-600" : "text-amber-600")}>
                        {filesGenerated ? "Generated" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>File:</span>
                      <span className="font-mono">field-mappings.csv</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format:</span>
                      <span className="font-mono">CSV</span>
                    </div>
                  </div>
                </div>

                {/* Documentation */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">Documentation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Human-readable mapping guide</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={cn("font-mono", filesGenerated ? "text-green-600" : "text-amber-600")}>
                        {filesGenerated ? "Generated" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>File:</span>
                      <span className="font-mono">mapping-documentation.txt</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Format:</span>
                      <span className="font-mono">Markdown</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="mt-6">
              <ScrollArea className="h-96">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap" data-testid="api-specification">
                    {integrationCode?.apiSpec ? JSON.stringify(integrationCode.apiSpec, null, 2) : "API specification will be generated here"}
                  </pre>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <ScrollArea className="h-96">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap" data-testid="transformation-code">
                    {integrationCode?.pythonCode || "# Transformation code will be generated here"}
                  </pre>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="test" className="mt-6">
              {testResult ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Test completed successfully</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <pre className="text-sm" data-testid="test-results">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Test Run" to validate the transformation</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBackToMapping}
          data-testid="button-back-to-mapping"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            Save as Template
          </Button>
          <Button 
            onClick={onProceedToIntegration}
            data-testid="button-deploy-integration"
          >
            Deploy Integration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
