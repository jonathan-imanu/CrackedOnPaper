import { useState, useCallback } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { FilePondFile } from "filepond";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Resume } from "@/resumes/types";

// Import FilePond plugins
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

// Register plugins
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

interface UploadFlowProps {
  existingResumes: Resume[];
  onUpload: (
    file: File,
    name: string,
    version: string,
    industry: string,
    yoeBucket: string
  ) => Promise<void>;
  onCancel: () => void;
  isUploading?: boolean;
}

type UploadStep = "select" | "name" | "details" | "existing-check" | "complete";

const industries = ["Tech", "Finance", "Marketing", "Design", "Sales"];
const experienceLevels = ["Entry", "Mid-Level", "Senior", "Executive"];

export function UploadFlow({
  existingResumes,
  onUpload,
  onCancel,
  isUploading = false,
}: UploadFlowProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedYoe, setSelectedYoe] = useState("");
  const [selectedExistingResume, setSelectedExistingResume] =
    useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: FilePondFile[]) => {
    if (files.length > 0) {
      const file = files[0].file as File;
      setSelectedFile(file);
      setFileName(file.name.replace(/\.pdf$/i, ""));
      setError(null);
    }
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setFileName("");
    setError(null);
  }, []);

  const handleNext = () => {
    if (currentStep === "select") {
      if (!selectedFile) {
        setError("Please select a file to upload");
        return;
      }
      setCurrentStep("name");
    } else if (currentStep === "name") {
      if (!fileName.trim()) {
        setError("Please enter a name for your resume");
        return;
      }
      setCurrentStep("details");
    } else if (currentStep === "details") {
      if (!selectedIndustry) {
        setError("Please select an industry");
        return;
      }
      if (!selectedYoe) {
        setError("Please select your years of experience");
        return;
      }
      if (existingResumes.length > 0) {
        setCurrentStep("existing-check");
      } else {
        handleUpload();
      }
    } else if (currentStep === "existing-check") {
      handleUpload();
    }
  };

  const handleBack = () => {
    if (currentStep === "name") {
      setCurrentStep("select");
    } else if (currentStep === "details") {
      setCurrentStep("name");
    } else if (currentStep === "existing-check") {
      setCurrentStep("details");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim() || !selectedIndustry || !selectedYoe)
      return;

    try {
      setError(null);
      // Generate version based on whether we're updating an existing resume
      const version = selectedExistingResume ? `v${Date.now()}` : "v1";
      await onUpload(
        selectedFile,
        fileName.trim(),
        version,
        selectedIndustry,
        selectedYoe
      );
      setCurrentStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleCreateNew = () => {
    setSelectedExistingResume(null);
    handleUpload();
  };

  const resetFlow = () => {
    setCurrentStep("select");
    setSelectedFile(null);
    setFileName("");
    setSelectedIndustry("");
    setSelectedYoe("");
    setSelectedExistingResume(null);
    setError(null);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "select", label: "Select File" },
      { key: "name", label: "Name Resume" },
      { key: "details", label: "Industry & Experience" },
      ...(existingResumes.length > 0
        ? [{ key: "existing-check", label: "Existing Resumes" }]
        : []),
      { key: "complete", label: "Complete" },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.key
                  ? "bg-primary text-primary-foreground"
                  : index < steps.findIndex((s) => s.key === currentStep)
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < steps.findIndex((s) => s.key === currentStep) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  index < steps.findIndex((s) => s.key === currentStep)
                    ? "bg-green-500"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Select a PDF file to upload and start competing
        </p>
      </div>

      <div className="filepond-container">
        <FilePond
          files={selectedFile ? [selectedFile] : []}
          onaddfile={(error, file) => {
            if (!error) handleFileSelect([file]);
          }}
          onremovefile={handleFileRemove}
          acceptedFileTypes={["application/pdf"]}
          maxFileSize="1MB"
          maxFiles={1}
          labelIdle='Drag & Drop your PDF here or <span class="filepond--label-action">Browse</span>'
          labelFileProcessing="Uploading"
          labelFileProcessingComplete="Upload complete"
          labelFileProcessingAborted="Upload cancelled"
          labelFileProcessingError="Error during upload"
          labelTapToCancel="tap to cancel"
          labelTapToRetry="tap to retry"
          labelTapToUndo="tap to undo"
          labelFileTypeNotAllowed="File of invalid type"
          labelMaxFileSizeExceeded="File is too large"
          labelMaxFileSize="Maximum file size is {filesize}"
          labelMaxTotalFileSizeExceeded="Maximum total size exceeded"
          labelMaxTotalFileSize="Maximum total file size is {filesize}"
          className="w-full"
          stylePanelLayout="compact"
          styleLoadIndicatorPosition="center bottom"
          styleProgressIndicatorPosition="right bottom"
          styleButtonRemoveItemPosition="right"
          styleButtonProcessItemPosition="right bottom"
          styleItemPanelAspectRatio="0.17"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedFile}
          className="flex-1"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderNameStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Name Your Resume</h2>
        <p className="text-muted-foreground">
          Give your resume a memorable name
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fileName">Resume Name (Alphanumeric Only)</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="SoftwareEngineerResume2024"
            className="mt-1"
            inputMode="text"
            pattern="[a-zA-Z0-9]+"
            maxLength={40}
            title="Only alphanumeric characters are allowed"
            autoComplete="off"
            aria-invalid={!!fileName && !/^[a-zA-Z0-9]+$/.test(fileName)}
          />
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{selectedFile?.name}</p>
              <p className="text-sm text-muted-foreground">
                {((selectedFile?.size ?? 0) / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!fileName.trim() || !/^[a-zA-Z0-9]+$/.test(fileName)}
          className="flex-1"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Industry & Experience</h2>
        <p className="text-muted-foreground">
          Help us match your resume with similar candidates
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="yoe">Experience Level</Label>
          <Select value={selectedYoe} onValueChange={setSelectedYoe}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{fileName}</p>
              <div className="flex items-center gap-2 mt-1">
                {selectedIndustry && (
                  <Badge variant="outline">{selectedIndustry}</Badge>
                )}
                {selectedYoe && <Badge variant="outline">{selectedYoe}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedIndustry || !selectedYoe}
          className="flex-1"
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderExistingCheckStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Existing Resumes Found</h2>
        <p className="text-muted-foreground">
          You already have resumes. Would you like to update an existing one or
          create a new version?
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4">
          {existingResumes.map((resume) => (
            <Card
              key={resume.ID}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedExistingResume?.ID === resume.ID
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => setSelectedExistingResume(resume)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{resume.Name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{resume.Industry}</Badge>
                      <Badge variant="outline">{resume.YoeBucket}</Badge>
                      <Badge variant="secondary">{resume.CurrentEloInt}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Elo: {resume.CurrentEloInt} • Battles:{" "}
                      {resume.BattlesCount} • Uploaded: {resume.CreatedAt}
                    </p>
                  </div>
                  {selectedExistingResume?.ID === resume.ID && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Or create a completely new resume
          </p>
          <Button
            variant="outline"
            onClick={handleCreateNew}
            disabled={isUploading}
            className="w-full"
          >
            Create New Resume
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedExistingResume}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            `Update ${selectedExistingResume?.Name || "Resume"}`
          )}
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
        <p className="text-muted-foreground">
          Your resume "{fileName}" has been successfully uploaded.
          {selectedExistingResume && (
            <span>
              {" "}
              It will replace your existing "{selectedExistingResume.Name}"
              resume.
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="outline">{selectedIndustry}</Badge>
          <Badge variant="outline">{selectedYoe}</Badge>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Done
        </Button>
        <Button onClick={resetFlow} className="flex-1">
          Upload Another
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {renderStepIndicator()}

      {currentStep === "select" && renderSelectStep()}
      {currentStep === "name" && renderNameStep()}
      {currentStep === "details" && renderDetailsStep()}
      {currentStep === "existing-check" && renderExistingCheckStep()}
      {currentStep === "complete" && renderCompleteStep()}
    </div>
  );
}
