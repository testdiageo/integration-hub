import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/step-indicator";
import { FileUpload } from "@/components/file-upload";
import { FieldMappingComponent } from "@/components/field-mapping";
import { TransformationPreview } from "@/components/transformation-preview";
import { ArrowRightLeft, Bell, Settings, User, Save } from "lucide-react";
import { type IntegrationProject, type UploadedFile, type FieldMapping } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const steps = [
  { number: 1, label: "Upload Files" },
  { number: 2, label: "Field Mapping" },
  { number: 3, label: "Transformation" },
  { number: 4, label: "Deploy" },
];

export default function IntegrationHub() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentProject, setCurrentProject] = useState<IntegrationProject | null>(null);
  const queryClient = useQueryClient();

  // Create initial project
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/projects", {
        name: "New Integration Project",
        description: "Intelligent field mapping and automated transformations",
        status: "draft",
      });
      return response.json();
    },
    onSuccess: (project) => {
      setCurrentProject(project);
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
    // Create project on component mount
    if (!currentProject) {
      createProjectMutation.mutate();
    }
  }, []);

  const sourceFile = files.find((f: UploadedFile) => f.systemType === "source");
  const targetFile = files.find((f: UploadedFile) => f.systemType === "target");

  const handleFileUploaded = (file: UploadedFile) => {
    refetchFiles();
    
    // Auto-advance to mapping step when both files are uploaded
    if (currentStep === 1 && files.length === 1) {
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

  const handleProceedToIntegration = () => {
    setCurrentStep(4);
  };

  const handleBackToMapping = () => {
    setCurrentStep(2);
  };

  // Get analysis data from mappings
  const analysisData = mappings.length > 0 ? {
    overallConfidence: Math.round(
      mappings.reduce((sum: number, m: FieldMapping) => sum + (m.confidence || 0), 0) / mappings.length
    ),
    autoMatches: mappings.filter((m: FieldMapping) => m.mappingType === "auto").length,
    suggestedMatches: mappings.filter((m: FieldMapping) => m.mappingType === "suggested").length,
    manualReviewNeeded: mappings.filter((m: FieldMapping) => m.mappingType === "unmapped").length,
  } : undefined;

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="text-primary-foreground text-sm" />
                </div>
                <h1 className="text-xl font-bold" data-testid="app-title">IntegrationHub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User className="text-secondary-foreground text-sm" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2" data-testid="project-title">
                {currentProject.name}
              </h2>
              <p className="text-muted-foreground" data-testid="project-description">
                {currentProject.description}
              </p>
            </div>
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

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
            mappings={mappings}
            onMappingsUpdated={handleMappingsUpdated}
            onProceedToTransformation={handleProceedToTransformation}
            analysisData={analysisData}
          />
        )}

        {currentStep === 3 && (
          <TransformationPreview
            projectId={currentProject.id}
            onProceedToIntegration={handleProceedToIntegration}
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
                <h3 className="text-2xl font-bold mb-4">Integration Ready!</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Your integration is configured and ready to deploy. All field mappings and transformations have been validated.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Review Settings
                  </Button>
                  <Button>
                    Deploy to Production
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
