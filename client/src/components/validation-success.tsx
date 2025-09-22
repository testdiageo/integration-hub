import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  FileText,
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface ValidationSuccessProps {
  projectId: string;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    confidenceScore: number;
    matchesExpected?: boolean;
  };
  onBackToValidation: () => void;
}

export function ValidationSuccessStep({ 
  projectId, 
  validationResult,
  onBackToValidation 
}: ValidationSuccessProps) {

  const handleDownload = (fileType: string) => {
    let endpoint = '';
    let filename = '';
    
    switch (fileType) {
      case 'xslt':
        endpoint = `/api/projects/${projectId}/download/xslt`;
        filename = 'transformation.xsl';
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
    
    if (endpoint) {
      window.open(endpoint, '_blank');
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
            Your XSLT transformation is ready for production deployment
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {/* Confidence Score */}
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="default" className="bg-green-600 text-white">
              Confidence: {validationResult.confidenceScore}%
            </Badge>
            <Badge variant="outline" className="border-green-600 text-green-600">
              Production Ready
            </Badge>
          </div>
          
          {/* Success Details */}
          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-green-800 dark:text-green-200">
            <p className="font-medium">✅ All validations passed successfully</p>
            <p className="text-sm mt-1">Target file, mapping CSV, and XSLT are perfectly synchronized</p>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Download Your Files</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Download all generated transformation files ready for production deployment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download XSLT
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
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Mappings
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
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Docs
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
    </div>
  );
}