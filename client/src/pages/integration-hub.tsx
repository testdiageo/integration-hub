import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/step-indicator";
import { FileUpload } from "@/components/file-upload";
import { FieldMappingComponent } from "@/components/field-mapping";
import { TransformationPreview } from "@/components/transformation-preview";
import { XSLTValidationStep } from "@/components/xslt-validation";
import { ValidationSuccessStep } from "@/components/validation-success";
import { SEOHead } from "@/components/seo-head";
import { Save, RefreshCcw, ArrowRightLeft, LogIn, Lock } from "lucide-react";
import { type IntegrationProject, type UploadedFile, type FieldMapping } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  { number: 1, label: "Upload Files" },
  { number: 2, label: "Field Mapping" },
  { number: 3, label: "Transformation" },
  { number: 4, label: "Generate XSLT" },
  { number: 5, label: "Validation" },
  { number: 6, label: "Success & Download" },
];

export default function IntegrationHub() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentProject, setCurrentProject] = useState<IntegrationProject | null>(null);
  const [hasInitializedStep, setHasInitializedStep] = useState(false);
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, isPaidUser } = useAuth();

  // Load existing project from localStorage
  const loadProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest(`/api/projects/${projectId}`, "GET");
      return response.json();
    },
    onSuccess: (project) => {
      setCurrentProject(project);
      localStorage.setItem('integrationhub-current-project', project.id);
    },
    onError: () => {
      // If project doesn't exist, remove from localStorage and create new
      localStorage.removeItem('integrationhub-current-project');
      createProjectMutation.mutate();
    },
  });

  // Create initial project
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/projects", "POST", {
        name: "New Integration Project",
        description: "Intelligent field mapping and automated transformations",
        status: "draft",
      });
      return response.json();
    },
    onSuccess: (project) => {
      setCurrentProject(project);
      localStorage.setItem('integrationhub-current-project', project.id);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  // Get project files
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ["/api/projects", currentProject?.id, "files"],
    enabled: !!currentProject?.id,
  });

  // Get project mappings
  const { data: mappings = [], refetch: refetchMappings } = useQuery({
    queryKey: ["/api/projects", currentProject?.id, "mappings"],
    enabled: !!currentProject?.id,
  });

  useEffect(() => {
    // Only create/load project if user is authenticated
    if (!currentProject && isAuthenticated && !isLoading) {
      const savedProjectId = localStorage.getItem('integrationhub-current-project');
      if (savedProjectId) {
        loadProjectMutation.mutate(savedProjectId);
      } else {
        createProjectMutation.mutate();
      }
    }
  }, [isAuthenticated, isLoading]);

  // Auto-advance to correct step based on loaded data (only on initial load)
  useEffect(() => {
    if (currentProject && files && mappings && !hasInitializedStep) {
      const sourceFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "source");
      const targetFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "target");
      const xsltValidationCompleted = currentProject.xsltValidation && 
        (currentProject.xsltValidation as any)?.isValid;
      
      // If project has integration code, go to step 5
      if (currentProject.integrationCode) {
        setCurrentStep(5);
      }
      // If XSLT validation is completed and mappings exist, go to step 3
      else if (xsltValidationCompleted && (mappings as FieldMapping[]).length > 0) {
        setCurrentStep(3);
      }
      // If XSLT validation is completed but no mappings, go to step 3 to allow mapping generation
      else if (xsltValidationCompleted) {
        setCurrentStep(3);
      }
      // If both files are uploaded, go to step 2 for field mapping
      else if (sourceFile && targetFile) {
        setCurrentStep(2);
      }
      // Default to step 1 for new projects
      else {
        setCurrentStep(1);
      }
      
      setHasInitializedStep(true);
    }
  }, [currentProject, files, mappings, hasInitializedStep]);

  const sourceFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "source");
  const targetFile = (files as UploadedFile[]).find((f: UploadedFile) => f.systemType === "target");

  const handleFileUploaded = async (file: UploadedFile) => {
    await refetchFiles();
    
    // Auto-advance to field mapping step when both files are uploaded
    const updatedFiles = await refetchFiles();
    const sourceFile = (updatedFiles.data as UploadedFile[])?.find((f: UploadedFile) => f.systemType === "source");
    const targetFile = (updatedFiles.data as UploadedFile[])?.find((f: UploadedFile) => f.systemType === "target");
    
    if (currentStep === 1 && sourceFile && targetFile) {
      setCurrentStep(2);
    }
  };

  const handleFileDeleted = () => {
    refetchFiles();
  };

  const handleMappingsUpdated = (newMappings: FieldMapping[]) => {
    refetchMappings();
  };

  const handleProceedToTransformation = () => {
    setCurrentStep(3);
  };

  const handleProceedToXSLTGeneration = () => {
    setCurrentStep(4);
  };

  const handleProceedToValidation = () => {
    setCurrentStep(5);
  };

  const handleBackToMapping = () => {
    setCurrentStep(2);
  };

  const handleBackToTransformation = () => {
    setCurrentStep(3);
  };

  // Get analysis data from mappings
  const analysisData = (mappings as FieldMapping[]).length > 0 ? {
    overallConfidence: Math.round(
      (mappings as FieldMapping[]).reduce((sum: number, m: FieldMapping) => sum + (m.confidence || 0), 0) / (mappings as FieldMapping[]).length
    ),
    autoMatches: (mappings as FieldMapping[]).filter((m: FieldMapping) => m.mappingType === "auto").length,
    suggestedMatches: (mappings as FieldMapping[]).filter((m: FieldMapping) => m.mappingType === "suggested").length,
    manualReviewNeeded: (mappings as FieldMapping[]).filter((m: FieldMapping) => m.mappingType === "unmapped").length,
  } : undefined;

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth required message for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to access the Integration Hub and create data transformation projects.
            </p>
            <Button className="w-full" asChild data-testid="button-login-required">
              <a href="/api/login">
                <LogIn className="mr-2 h-4 w-4" />
                Log In to Continue
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subscription required message for trial users
  if (!isPaidUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
            <p className="text-muted-foreground mb-6">
              Upgrade to a paid plan to access the Integration Hub and create unlimited data transformation projects.
            </p>
            <Button className="w-full" asChild data-testid="button-upgrade-required">
              <a href="/pricing">
                View Pricing Plans
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while project is being created
  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Setting up your integration project...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Integration Workflow - IntegrationHub | AI-Powered Data Transformation"
        description="Create intelligent data integrations with AI-powered field mapping. Upload files, generate transformations, and download production-ready XSLT or DataWeave code."
        keywords="data integration workflow, field mapping tool, XSLT generator, DataWeave creator, transformation workflow"
        canonicalUrl={`${window.location.origin}/hub`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="project-title">
                  {currentProject.name}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="project-description">
                  {currentProject.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize" data-testid="project-status">
                  {currentProject.status}
                </Badge>
                <Button variant="outline" size="sm" data-testid="button-save-project">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" data-testid="button-reset-project">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={steps} />

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload
              projectId={currentProject.id}
              systemType="source"
              onFileUploaded={handleFileUploaded}
              onFileDeleted={handleFileDeleted}
              uploadedFile={sourceFile}
            />
            <FileUpload
              projectId={currentProject.id}
              systemType="target"
              onFileUploaded={handleFileUploaded}
              onFileDeleted={handleFileDeleted}
              uploadedFile={targetFile}
            />
          </div>
        )}

        {currentStep === 2 && (
          <FieldMappingComponent
            projectId={currentProject.id}
            mappings={mappings as FieldMapping[]}
            onMappingsUpdated={handleMappingsUpdated}
            onProceedToTransformation={handleProceedToTransformation}
            analysisData={analysisData}
          />
        )}

        {currentStep === 3 && (
          <TransformationPreview
            projectId={currentProject.id}
            onProceedToIntegration={handleProceedToXSLTGeneration}
            onBackToMapping={handleBackToMapping}
          />
        )}

        {currentStep === 4 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">XSLT Generated Successfully</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your XSLT transformation file has been automatically generated based on your field mappings.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={handleBackToTransformation}>
                    Back to Transformation
                  </Button>
                  <Button onClick={handleProceedToValidation} data-testid="button-proceed-validation">
                    Proceed to Validation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <XSLTValidationStep
            projectId={currentProject.id}
            onProceedToSuccess={() => setCurrentStep(6)}
            xsltValidation={currentProject.xsltValidation as any}
          />
        )}

        {currentStep === 6 && (
          <ValidationSuccessStep
            projectId={currentProject.id}
            validationResult={currentProject.xsltValidation as any}
            onBackToValidation={() => setCurrentStep(5)}
          />
        )}
        </main>
      </div>
    </>
  );
}
