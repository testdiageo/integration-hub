import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, FileText, FileSpreadsheet, Code, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type UploadedFile } from "@shared/schema";

interface FileUploadProps {
  projectId: string;
  systemType: "source" | "target";
  onFileUploaded: (file: UploadedFile) => void;
  onFileDeleted: (fileId: string) => void;
  uploadedFile?: UploadedFile;
  disabled?: boolean;
}

export function FileUpload({
  projectId,
  systemType,
  onFileUploaded,
  onFileDeleted,
  uploadedFile,
  disabled = false,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || disabled) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("systemType", systemType);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const response = await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        const uploadedFile = await response.json();
        onFileUploaded(uploadedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [projectId, systemType, onFileUploaded, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/xml": [".xml"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: disabled || isUploading,
  });

  const handleDelete = async () => {
    if (!uploadedFile) return;

    try {
      const response = await fetch(`/api/files/${uploadedFile.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      onFileDeleted(uploadedFile.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "csv":
        return <FileSpreadsheet className="text-green-600" />;
      case "json":
        return <Code className="text-blue-600" />;
      case "xml":
        return <FileText className="text-orange-600" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="text-green-600" />;
      default:
        return <FileText className="text-gray-600" />;
    }
  };

  const getStatusBadge = (confidence?: number | null) => {
    if (confidence === null || confidence === undefined) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (confidence >= 90) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validated</Badge>;
    }
    if (confidence >= 70) {
      return <Badge variant="secondary">Good</Badge>;
    }
    return <Badge variant="outline">Needs Review</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 capitalize">
          {systemType} System
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your {systemType} data template or schema
        </p>
      </div>

      {uploadedFile ? (
        <div className="bg-muted/30 rounded-lg p-4" data-testid={`uploaded-file-${systemType}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                {getFileIcon(uploadedFile.fileType)}
              </div>
              <div>
                <p className="font-medium" data-testid={`file-name-${systemType}`}>
                  {uploadedFile.fileName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.fileSize / 1024 / 1024).toFixed(1)} MB • Detected: {uploadedFile.fileType.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(uploadedFile.schemaConfidence)}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive/80"
                data-testid={`button-delete-file-${systemType}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Fields detected: {uploadedFile.detectedSchema?.fields?.length || 0} • 
              Records: ~{uploadedFile.detectedSchema?.recordCount || 0}
            </p>
            <p data-testid={`schema-confidence-${systemType}`}>
              Schema confidence: {uploadedFile.schemaConfidence || 0}%
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive 
                ? "border-primary/50 bg-primary/5" 
                : "border-border hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            data-testid={`upload-area-${systemType}`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <Upload className="mx-auto h-8 w-8 text-primary animate-pulse" />
                <div>
                  <h4 className="font-medium mb-2">Uploading and analyzing...</h4>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                </div>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">
                  {isDragActive ? "Drop files here" : "Drop files here or click to upload"}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JSON, CSV, XML, Excel, API Schema
                </p>
                <Button 
                  type="button" 
                  disabled={disabled}
                  data-testid={`button-choose-files-${systemType}`}
                >
                  Choose Files
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
