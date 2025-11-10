import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription } from "@/contexts/subscription-context";
import { DownloadAuthDialog } from "@/components/download-auth-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  CheckCircle, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  FileText,
  Sparkles,
  ArrowLeft,
  Workflow,
  Lock,
  Crown,
  Loader2
} from "lucide-react";

interface ValidationSuccessProps {
  projectId: string;
  validationResult?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    confidence: number;
    matchesExpected?: boolean;
  };
  onBackToValidation: () => void;
}

export function ValidationSuccessStep({ 
  projectId, 
  validationResult,
  onBackToValidation 
}: ValidationSuccessProps) {
  const { isTrial, isPaid } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogData, setAuthDialogData] = useState<{
    message?: string;
    remaining?: number;
    resetDate?: string;
  }>({});
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleDownload = async (fileType: string) => {
    // Show dialog immediately for trial users
    if (isTrial) {
      setAuthDialogData({
        message: "Upgrade to download files. Free users can view files but cannot download them.",
      });
      setAuthDialogOpen(true);
      return;
    }

    let endpoint = '';
    let filename = '';
    
    switch (fileType) {
      case 'xslt':
        endpoint = `/api/projects/${projectId}/download/xslt`;
        filename = 'transformation.xsl';
        break;
      case 'dataweave':
        endpoint = `/api/projects/${projectId}/download/dataweave`;
        filename = 'transformation.dwl';
        break;
      case 'mapping':
        endpoint = `/api/projects/${projectId}/download/mapping-file`;
        filename = 'field-mappings.csv';
        break;
      case 'documentation':
        endpoint = `/api/projects/${projectId}/download/mapping-document`;
        filename = 'mapping-documentation.txt';
        break;
    }
    
    if (!endpoint) return;

    try {
      setDownloadingFile(fileType);

      // Make authenticated request
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include', // Important for session cookies
      });

      if (response.status === 403) {
        // Authorization failed - show friendly dialog
        const errorData = await response.json();
        setAuthDialogData({
          message: errorData.message,
          remaining: errorData.remaining,
        });
        setAuthDialogOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Download successful - create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success toast
      toast({
        title: "Download Started",
        description: `${filename} is downloading...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred while downloading the file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="h-16 w-16 text-green-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-200">
            🎉 Validation Successful!
          </CardTitle>
          <p className="text-green-700 dark:text-green-300 text-lg">
            Your transformations are ready for production deployment
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {/* Confidence Score */}
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="default" className="bg-green-600 text-white">
              Confidence: {validationResult?.confidence || 0}%
            </Badge>
            <Badge variant="outline" className="border-green-600 text-green-600">
              Production Ready
            </Badge>
          </div>
          
          {/* Success Details */}
          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-green-800 dark:text-green-200">
            <p className="font-medium">✅ All validations passed successfully</p>
            <p className="text-sm mt-1">All transformation files are perfectly synchronized and validated</p>
          </div>
        </CardContent>
      </Card>

      {/* Trial Restriction Message */}
      {isTrial && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Downloads are disabled in Free Trial</p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">Upgrade to download XSLT, DataWeave, and mapping files</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" data-testid="button-upgrade-from-success">
              <Link href="/pricing">
                Upgrade Now
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isTrial && <Lock className="h-5 w-5 text-muted-foreground" />}
            <Download className="h-5 w-5" />
            <span>Download Your Files</span>
            {isTrial && <Badge variant="secondary">Pro Feature</Badge>}
          </CardTitle>
          <p className="text-muted-foreground">
            {isTrial 
              ? "Upgrade to download all generated transformation files" 
              : "Download all generated transformation files ready for production deployment"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* XSLT File */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <FileCode className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">XSLT Transformation</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    XML transformation stylesheet
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    transformation.xsl
                  </p>
                </div>
                <Button 
                  onClick={() => handleDownload('xslt')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-download-success-xslt"
                  disabled={isTrial || downloadingFile === 'xslt'}
                >
                  {downloadingFile === 'xslt' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : isTrial ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download XSLT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* DataWeave File */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <Workflow className="h-12 w-12 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">DataWeave (Mule)</h3>
                  <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                    MuleSoft transformation script
                  </p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                    transformation.dwl
                  </p>
                </div>
                <Button 
                  onClick={() => handleDownload('dataweave')}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  data-testid="button-download-success-dataweave"
                  disabled={isTrial || downloadingFile === 'dataweave'}
                >
                  {downloadingFile === 'dataweave' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : isTrial ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download DataWeave
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Field Mappings CSV */}
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <FileSpreadsheet className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Field Mappings</h3>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Structured mapping data
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                    field-mappings.csv
                  </p>
                </div>
                <Button 
                  onClick={() => handleDownload('mapping')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-download-success-mapping"
                  disabled={isTrial || downloadingFile === 'mapping'}
                >
                  {downloadingFile === 'mapping' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : isTrial ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Mappings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <FileText className="h-12 w-12 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Documentation</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                    Human-readable guide
                  </p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    mapping-documentation.txt
                  </p>
                </div>
                <Button 
                  onClick={() => handleDownload('documentation')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-download-success-documentation"
                  disabled={isTrial || downloadingFile === 'documentation'}
                >
                  {downloadingFile === 'documentation' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : isTrial ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Docs
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Download All Button */}
          <div className="mt-6 text-center">
            <div className="text-sm text-muted-foreground mb-3">
              Or download individual files as needed above
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">🚀 Ready for Production!</h3>
          <div className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
            <p>• Your XSLT transformation has been validated and is production-ready</p>
            <p>• All field mappings are synchronized and consistent</p>
            <p>• You can now deploy these files to your production environment</p>
            <p>• Keep the documentation file for future reference and maintenance</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBackToValidation}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Validation
        </Button>
        
        <Button 
          onClick={() => window.location.reload()}
          data-testid="button-start-new-project"
        >
          Start New Project
        </Button>
      </div>

      {/* Download Authorization Dialog */}
      <DownloadAuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        errorMessage={authDialogData.message}
        userTier={user?.subscriptionStatus || 'free'}
        remaining={authDialogData.remaining}
        resetDate={authDialogData.resetDate}
      />
    </div>
  );
}