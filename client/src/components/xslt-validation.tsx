import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/file-upload";
import { useSubscription } from "@/contexts/subscription-context";
import { Link } from "wouter";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Upload, 
  ArrowRight,
  RefreshCw,
  Lock,
  Crown
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type UploadedFile } from "@shared/schema";

interface XSLTValidationProps {
  projectId: string;
  onProceedToSuccess: () => void;
  xsltValidation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    confidenceScore: number;
    matchesExpected?: boolean;
  };
}

export function XSLTValidationStep({
  projectId,
  onProceedToSuccess,
  xsltValidation
}: XSLTValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const queryClient = useQueryClient();
  const { isTrial, isPaid } = useSubscription();

  // Get project files
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ["/api/projects", projectId, "files"],
    enabled: !!projectId,
  });

  // Get original source and target files from Step 1
  const sourceFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "source");
  const targetFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "target");

  // Enhanced validation mutation (compares target, mapping, and XSLT files)
  const validateGeneratedMutation = useMutation({
    mutationFn: async () => {
      setIsValidating(true);
      const response = await apiRequest(`/api/projects/${projectId}/validate-generated`, "POST");
      return response.json();
    },
    onSuccess: (validationResult) => {
      setIsValidating(false);
      // Invalidate project query to refresh the validation results
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      
      if (validationResult.isValid) {
        // Auto-proceed to success page if validation is successful
        setTimeout(() => {
          onProceedToSuccess();
        }, 2000);
      }
    },
    onError: () => {
      setIsValidating(false);
    }
  });

  const handleFileUploaded = async (file: UploadedFile) => {
    await refetchFiles();
  };

  const handleFileDeleted = () => {
    refetchFiles();
  };

  // Can validate if we have original files and the system should have generated the XSLT
  const canValidate = sourceFile && targetFile;
  const hasValidationResults = !!xsltValidation;
  
  // Use the latest validation result from either the prop or the mutation result
  const latestValidationResult = validateGeneratedMutation.data || xsltValidation;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>XSLT Validation</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Validate the automatically generated XSLT transformation using your original source file and the system-generated target schema to ensure correct output.
          </p>
        </CardHeader>
      </Card>

      {/* System Files Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Source File</span>
              <Badge variant="secondary">From Step 1</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceFile ? (
              <div className="space-y-2">
                <p className="font-medium">{sourceFile.fileName}</p>
                <p className="text-sm text-muted-foreground">Original source data file</p>
                <div className="text-xs text-muted-foreground">
                  <p>Fields: {(sourceFile.detectedSchema as any)?.fields?.length || 0}</p>
                  <p>Records: ~{(sourceFile.detectedSchema as any)?.recordCount || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No source file found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Target Schema</span>
              <Badge variant="secondary">From Step 1</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {targetFile ? (
              <div className="space-y-2">
                <p className="font-medium">{targetFile.fileName}</p>
                <p className="text-sm text-muted-foreground">Expected output format</p>
                <div className="text-xs text-muted-foreground">
                  <p>Fields: {(targetFile.detectedSchema as any)?.fields?.length || 0}</p>
                  <p>Records: ~{(targetFile.detectedSchema as any)?.recordCount || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No target file found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Generated XSLT</span>
              <Badge variant="default">Auto-Generated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">transformation.xsl</p>
              <p className="text-sm text-muted-foreground">Automatically generated from field mappings</p>
              <div className="text-xs text-muted-foreground">
                <p>Status: Ready for validation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Action */}
      {canValidate && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Validate</h3>
                <p className="text-muted-foreground">
                  Validate the automatically generated XSLT transformation against your source data.
                </p>
              </div>
              <Button
                onClick={() => validateGeneratedMutation.mutate()}
                disabled={isValidating}
                size="lg"
                data-testid="button-validate-xslt"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate XSLT
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {(hasValidationResults || latestValidationResult) && (
        <Card data-testid="xslt-validation-result">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {latestValidationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Validation Results</span>
              <Badge variant={latestValidationResult.isValid ? "default" : "destructive"}>
                {latestValidationResult.isValid ? "Passed" : "Failed"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confidence Score */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid="xslt-confidence">
              <span className="font-medium">Confidence Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      latestValidationResult.confidenceScore >= 80 ? 'bg-green-600' :
                      latestValidationResult.confidenceScore >= 60 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${latestValidationResult.confidenceScore}%` }}
                  />
                </div>
                <span className="font-semibold">{latestValidationResult.confidenceScore}%</span>
              </div>
            </div>

            {/* Expected Match Status */}
            {latestValidationResult.matchesExpected !== undefined && (
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                {latestValidationResult.matchesExpected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  Transformation {latestValidationResult.matchesExpected ? "matches" : "does not match"} expected output
                </span>
              </div>
            )}

            {/* Errors */}
            {latestValidationResult.errors && latestValidationResult.errors.length > 0 && (
              <Alert variant="destructive" data-testid="xslt-validation-errors">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {latestValidationResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {latestValidationResult.warnings && latestValidationResult.warnings.length > 0 && (
              <Alert data-testid="xslt-validation-warnings">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {latestValidationResult.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Transformed Data Preview */}
            {latestValidationResult.transformedData && latestValidationResult.transformedData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Transformed Data Preview</h3>
                  {isTrial && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Free Trial - 3 Rows Only
                    </Badge>
                  )}
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(latestValidationResult.transformedData[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {latestValidationResult.transformedData
                          .slice(0, isTrial ? 3 : undefined)
                          .map((row: any, idx: number) => (
                            <tr key={idx} className="border-t" data-testid={`preview-row-${idx}`}>
                              {Object.values(row).map((value: any, cellIdx: number) => (
                                <td key={cellIdx} className="px-4 py-2">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {isTrial && latestValidationResult.transformedData.length > 3 && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium text-sm">
                              {latestValidationResult.transformedData.length - 3} more rows available with Pro
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Upgrade to see all transformed data and download files
                            </p>
                          </div>
                        </div>
                        <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600" data-testid="button-upgrade-from-preview">
                          <Link href="/pricing">
                            Upgrade Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => validateGeneratedMutation.mutate()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-validate
              </Button>
              
              {latestValidationResult.isValid && (
                <>
                  {isTrial ? (
                    <Button disabled className="gap-2" data-testid="button-proceed-success-locked">
                      <Lock className="h-4 w-4" />
                      Download Locked - Upgrade Required
                    </Button>
                  ) : (
                    <Button onClick={onProceedToSuccess} data-testid="button-proceed-success">
                      Proceed to Downloads
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!canValidate && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Required Files</h3>
              <p className="text-muted-foreground">
                Upload all three files above to begin XSLT validation. This step ensures your transformation logic correctly converts XML to the expected JSON format.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}