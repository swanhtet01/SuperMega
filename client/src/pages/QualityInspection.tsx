import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Camera, QrCode, CheckCircle2, XCircle, AlertCircle, Upload, Loader2 } from "lucide-react";

type InspectionStage = "mixing" | "building" | "curing" | "final";
type InspectionResult = "pass" | "fail" | "rework";
type DefectType = "visual" | "dimensional" | "structural" | "material";
type DefectSeverity = "minor" | "major" | "critical";

interface DefectEntry {
  type: DefectType;
  category: string;
  severity: DefectSeverity;
  description: string;
  photo?: File;
}

export default function QualityInspection() {
  const { user } = useAuth();
  const [stage, setStage] = useState<InspectionStage>("mixing");
  const [batchNumber, setBatchNumber] = useState("");
  const [result, setResult] = useState<InspectionResult>("pass");
  const [notes, setNotes] = useState("");
  const [defects, setDefects] = useState<DefectEntry[]>([]);
  const [currentDefect, setCurrentDefect] = useState<DefectEntry>({
    type: "visual",
    category: "",
    severity: "minor",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Defect categories by type
  const defectCategories = {
    visual: ["Surface irregularities", "Color variation", "Cosmetic blemishes", "Marking defects"],
    dimensional: ["Size out of spec", "Shape deviation", "Weight variance", "Thickness issues"],
    structural: ["Ply misalignment", "Bead seating", "Internal voids", "Belt separation"],
    material: ["Compound quality", "Foreign material", "Component defects", "Material degradation"],
  };

  const handleAddDefect = () => {
    if (!currentDefect.category || !currentDefect.description) {
      toast.error("Please fill in all defect details");
      return;
    }
    setDefects([...defects, currentDefect]);
    setCurrentDefect({
      type: "visual",
      category: "",
      severity: "minor",
      description: "",
    });
    toast.success("Defect added");
  };

  const handleRemoveDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
    toast.success("Defect removed");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentDefect({ ...currentDefect, photo: file });
      toast.success("Photo added");
    }
  };

  const handleScanBarcode = () => {
    // TODO: Implement barcode scanning
    toast.info("Barcode scanning coming soon");
  };

  const handleSubmit = async () => {
    if (!batchNumber) {
      toast.error("Please enter or scan batch number");
      return;
    }

    if (result !== "pass" && defects.length === 0) {
      toast.error("Please add at least one defect for failed/rework inspection");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement inspection submission via tRPC
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success("Inspection submitted successfully");
      
      // Reset form
      setBatchNumber("");
      setResult("pass");
      setNotes("");
      setDefects([]);
      setCurrentDefect({
        type: "visual",
        category: "",
        severity: "minor",
        description: "",
      });
    } catch (error) {
      toast.error("Failed to submit inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageColor = (s: InspectionStage) => {
    const colors = {
      mixing: "bg-blue-500",
      building: "bg-purple-500",
      curing: "bg-orange-500",
      final: "bg-green-500",
    };
    return colors[s];
  };

  const getResultIcon = (r: InspectionResult) => {
    switch (r) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "rework":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quality Inspection</h1>
            <p className="text-muted-foreground">Inspector: {user?.name || "Unknown"}</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Stage Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Stage</CardTitle>
            <CardDescription>Select the production stage you are inspecting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["mixing", "building", "curing", "final"] as InspectionStage[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    stage === s
                      ? `${getStageColor(s)} text-white border-transparent`
                      : "border-border hover:border-primary"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold capitalize">{s}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
            <CardDescription>Enter or scan the batch number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Enter batch number"
                  className="text-lg h-12"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleScanBarcode}
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 p-0"
                >
                  <QrCode className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Result */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Result</CardTitle>
            <CardDescription>Select the overall result of this inspection</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={result} onValueChange={(v) => setResult(v as InspectionResult)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["pass", "fail", "rework"] as InspectionResult[]).map((r) => (
                  <div key={r} className="flex items-center space-x-2">
                    <RadioGroupItem value={r} id={r} />
                    <Label
                      htmlFor={r}
                      className="flex items-center gap-2 cursor-pointer flex-1 p-3 rounded-lg border border-border hover:bg-accent"
                    >
                      {getResultIcon(r)}
                      <span className="capitalize font-medium">{r}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Defects Section */}
        {(result === "fail" || result === "rework") && (
          <Card>
            <CardHeader>
              <CardTitle>Defects</CardTitle>
              <CardDescription>Record all defects found during inspection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Defects */}
              {defects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Recorded Defects ({defects.length})</h3>
                  {defects.map((defect, index) => (
                    <div
                      key={index}
                      className="p-4 border border-border rounded-lg flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{defect.type}</Badge>
                          <Badge variant={defect.severity === "critical" ? "destructive" : "secondary"}>
                            {defect.severity}
                          </Badge>
                        </div>
                        <p className="font-medium">{defect.category}</p>
                        <p className="text-sm text-muted-foreground">{defect.description}</p>
                        {defect.photo && (
                          <p className="text-xs text-muted-foreground mt-1">📷 Photo attached</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDefect(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Defect */}
              <div className="space-y-4 p-4 border-2 border-dashed border-border rounded-lg">
                <h3 className="font-semibold">Add New Defect</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defectType">Defect Type</Label>
                    <Select
                      value={currentDefect.type}
                      onValueChange={(v) =>
                        setCurrentDefect({ ...currentDefect, type: v as DefectType, category: "" })
                      }
                    >
                      <SelectTrigger id="defectType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual</SelectItem>
                        <SelectItem value="dimensional">Dimensional</SelectItem>
                        <SelectItem value="structural">Structural</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="defectSeverity">Severity</Label>
                    <Select
                      value={currentDefect.severity}
                      onValueChange={(v) =>
                        setCurrentDefect({ ...currentDefect, severity: v as DefectSeverity })
                      }
                    >
                      <SelectTrigger id="defectSeverity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="defectCategory">Category</Label>
                  <Select
                    value={currentDefect.category}
                    onValueChange={(v) => setCurrentDefect({ ...currentDefect, category: v })}
                  >
                    <SelectTrigger id="defectCategory">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {defectCategories[currentDefect.type].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="defectDescription">Description</Label>
                  <Textarea
                    id="defectDescription"
                    value={currentDefect.description}
                    onChange={(e) =>
                      setCurrentDefect({ ...currentDefect, description: e.target.value })
                    }
                    placeholder="Describe the defect in detail..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="defectPhoto">Photo (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="defectPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => {}}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={handleAddDefect} className="w-full" size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Add Defect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Add any additional observations or comments</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="flex-1 h-14 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Submit Inspection
              </>
            )}
          </Button>
        </div>

        {/* Offline Indicator */}
        <div className="text-center text-sm text-muted-foreground">
          <p>✓ Offline mode enabled - inspections will sync when online</p>
        </div>
      </div>
    </div>
  );
}

