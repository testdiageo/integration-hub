import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Edit, 
  Check, 
  X, 
  RefreshCw, 
  Expand, 
  Brain, 
  AlertTriangle, 
  CheckCircle,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type FieldMapping } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface FieldMappingProps {
  projectId: string;
  mappings: FieldMapping[];
  onMappingsUpdated: (mappings: FieldMapping[]) => void;
  onProceedToTransformation: () => void;
  analysisData?: {
    overallConfidence: number;
    autoMatches: number;
    suggestedMatches: number;
    manualReviewNeeded: number;
  };
}

export function FieldMappingComponent({
  projectId,
  mappings,
  onMappingsUpdated,
  onProceedToTransformation,
  analysisData,
}: FieldMappingProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch project files to get target field options
  const { data: projectFiles } = useQuery({
    queryKey: ["/api/projects", projectId, "files"],
  });

  const handleGenerateMappings = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/generate-mappings`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate mappings");
      }

      const result = await response.json();
      onMappingsUpdated(result.mappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate mappings");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateMapping = async (mappingId: string, updates: Partial<FieldMapping>) => {
    try {
      const response = await fetch(`/api/mappings/${mappingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update mapping");
      }

      const updatedMapping = await response.json();
      const newMappings = mappings.map(m => 
        m.id === mappingId ? updatedMapping : m
      );
      onMappingsUpdated(newMappings);
      
      // Invalidate and refetch mappings to ensure UI is updated
      await queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "mappings"],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mapping");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMappingIcon = (mappingType: string, confidence: number) => {
    switch (mappingType) {
      case "auto":
        return <Check className="h-4 w-4 text-green-600" />;
      case "suggested":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "unmapped":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMappingBadgeVariant = (mappingType: string) => {
    switch (mappingType) {
      case "auto":
        return "default";
      case "suggested":
        return "secondary";
      case "unmapped":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (mappings.length === 0) {
    return (
      <Card data-testid="mapping-analysis-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Field Mapping</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generate intelligent field mapping suggestions
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateMappings}
              disabled={isGenerating}
              data-testid="button-generate-mappings"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Map Fields
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Map Fields</h3>
            <p className="text-muted-foreground mb-6">
              Upload both source and target files, then click "Map Fields" to generate intelligent field mapping suggestions.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2 text-destructive">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Results */}
      {analysisData && (
        <Card data-testid="mapping-analysis-results">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mapping Analysis Complete</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Intelligent field mapping suggestions ready
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateMappings}
                disabled={isGenerating}
                data-testid="button-reanalyze"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reanalyze
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2" data-testid="auto-matches-count">
                  {analysisData.autoMatches}
                </div>
                <p className="text-sm text-muted-foreground">Automatic Matches</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-500 mb-2" data-testid="suggested-matches-count">
                  {analysisData.suggestedMatches}
                </div>
                <p className="text-sm text-muted-foreground">Suggested Matches</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2" data-testid="manual-review-count">
                  {analysisData.manualReviewNeeded}
                </div>
                <p className="text-sm text-muted-foreground">Manual Review Needed</p>
              </div>
            </div>

            <Button 
              onClick={onProceedToTransformation} 
              className="w-full"
              data-testid="button-proceed-to-transformation"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Proceed to Transformation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Field Mappings Preview */}
      <Card data-testid="field-mappings-preview">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Field Mapping Preview</CardTitle>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="overall-confidence">
                Overall Confidence: {analysisData?.overallConfidence || 0}%
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Open editor for first unmapped field or create new mapping
                  const unmappedField = mappings.find(m => m.mappingType === 'unmapped');
                  if (unmappedField) {
                    setEditingMapping(unmappedField);
                    setIsDialogOpen(true);
                  }
                }}
                data-testid="button-full-editor"
              >
                <Expand className="mr-2 h-4 w-4" />
                Full Editor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    mapping.mappingType === "auto" && "bg-green-50 border-green-200",
                    mapping.mappingType === "suggested" && "bg-amber-50 border-amber-200",
                    mapping.mappingType === "unmapped" && "bg-red-50 border-red-200",
                    mapping.mappingType === "manual" && "bg-blue-50 border-blue-200"
                  )}
                  data-testid={`mapping-row-${mapping.sourceField}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="bg-green-100 text-green-800 font-mono">
                        {mapping.sourceField}
                      </Badge>
                      {getMappingIcon(mapping.mappingType, mapping.confidence || 0)}
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono",
                          mapping.targetField
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {mapping.targetField || "No match found"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      {mapping.confidence !== null && mapping.confidence !== undefined && (
                        <>
                          <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-1000 rounded-full",
                                getConfidenceColor(mapping.confidence)
                              )}
                              style={{ width: `${mapping.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground" data-testid={`confidence-${mapping.sourceField}`}>
                            {mapping.confidence}% confidence
                          </span>
                        </>
                      )}
                      <Badge variant={getMappingBadgeVariant(mapping.mappingType)}>
                        {mapping.mappingType === "auto" && "Auto Match"}
                        {mapping.mappingType === "suggested" && "Suggested"}
                        {mapping.mappingType === "unmapped" && "Manual Review"}
                        {mapping.mappingType === "manual" && "Manual"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {mapping.transformation ? (
                      <span className="text-sm text-muted-foreground">
                        {(mapping.transformation as any)?.typeConversion || "No transform"}
                      </span>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingMapping(mapping);
                        setIsDialogOpen(true);
                      }}
                      data-testid={`button-edit-mapping-${mapping.sourceField}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mapping Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="mapping-editor">
          <DialogHeader>
            <DialogTitle>Edit Field Mapping</DialogTitle>
          </DialogHeader>
          
          {editingMapping && (
            <MappingEditor
              mapping={editingMapping}
              projectFiles={Array.isArray(projectFiles) ? projectFiles : []}
              onSave={(updatedMapping) => {
                handleUpdateMapping(editingMapping.id, updatedMapping);
                setIsDialogOpen(false);
                setEditingMapping(null);
              }}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingMapping(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MappingEditorProps {
  mapping: FieldMapping;
  projectFiles: any[];
  onSave: (updates: Partial<FieldMapping>) => void;
  onCancel: () => void;
}

function MappingEditor({ mapping, projectFiles, onSave, onCancel }: MappingEditorProps) {
  const [targetField, setTargetField] = useState(mapping.targetField || "none");
  const [confidence, setConfidence] = useState(mapping.confidence?.toString() || "50");
  const [mappingType, setMappingType] = useState(mapping.mappingType);

  // Get target schema fields
  const targetFile = projectFiles.find(f => f.systemType === "target");
  const targetFields = targetFile?.detectedSchema?.fields?.map((f: any) => f.name) || [];

  const handleSave = () => {
    const updates: Partial<FieldMapping> = {
      targetField: targetField === "none" ? null : targetField,
      confidence: parseInt(confidence),
      mappingType: (targetField !== "none") ? (parseInt(confidence) >= 90 ? "auto" : "suggested") : "unmapped",
    };
    onSave(updates);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Source Field</Label>
          <div className="mt-1">
            <Badge variant="outline" className="bg-green-100 text-green-800 font-mono">
              {mapping.sourceField}
            </Badge>
          </div>
        </div>

        <div>
          <Label htmlFor="target-field" className="text-sm font-medium">Target Field</Label>
          <Select value={targetField} onValueChange={setTargetField}>
            <SelectTrigger className="mt-1" data-testid="select-target-field">
              <SelectValue placeholder="Select target field or leave unmapped" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- No mapping --</SelectItem>
              {targetFields.map((field: string) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="confidence" className="text-sm font-medium">Confidence Score (%)</Label>
          <Input
            id="confidence"
            type="number"
            min="0"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="mt-1"
            data-testid="input-confidence"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Mapping Type</Label>
          <div className="mt-1">
            <Badge variant={mappingType === "auto" ? "default" : mappingType === "suggested" ? "secondary" : "destructive"}>
              {(targetField && targetField !== "none") ? (parseInt(confidence) >= 90 ? "Auto Match" : "Suggested") : "Unmapped"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-mapping">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-mapping">
          <Save className="mr-2 h-4 w-4" />
          Save Mapping
        </Button>
      </div>
    </div>
  );
}
