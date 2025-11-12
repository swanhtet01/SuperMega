import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Factory, Calendar, Package, Users, Clock, CheckCircle2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TIRE_SIZES = [
  "700R16", "750R16", "825R16", "825R20", "900R20", "1000R20", "1100R20", "1200R20",
  "165R13", "175R13", "185R14", "195R14", "205R14",
];

const TIRE_TYPES = [
  "Motorcycle", "Passenger Car", "Light Truck", "Heavy Truck", "Agricultural", "Industrial"
];

const PRODUCTION_LINES = ["Line 1", "Line 2", "Line 3", "Line 4"];
const SHIFTS = ["Day Shift (6AM-2PM)", "Night Shift (2PM-10PM)", "Overtime (10PM-6AM)"];

export default function ProductionEntry() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tireSize, setTireSize] = useState("");
  const [tireType, setTireType] = useState("");
  const [quantityProduced, setQuantityProduced] = useState("");
  const [quantityApproved, setQuantityApproved] = useState("");
  const [quantityRejected, setQuantityRejected] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [shift, setShift] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");


  // Auto-generate batch number
  const generateBatchNumber = () => {
    const dateStr = date.replace(/-/g, "");
    const lineCode = productionLine.replace("Line ", "L");
    const shiftCode = shift.includes("Day") ? "D" : shift.includes("Night") ? "N" : "O";
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const batch = `${dateStr}-${lineCode}-${shiftCode}-${random}`;
    setBatchNumber(batch);
    toast.success("Batch number generated");
  };

  const createProductionMutation = trpc.production.create.useMutation({
    onSuccess: () => {
      toast.success("Production record saved successfully");
      // Reset form
      setTireSize("");
      setTireType("");
      setQuantityProduced("");
      setQuantityApproved("");
      setQuantityRejected("");
      setProductionLine("");
      setShift("");
      setBatchNumber("");
      setNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!date || !tireSize || !tireType || !quantityProduced || !quantityApproved || !quantityRejected) {
      toast.error("Please fill in all required fields");
      return;
    }

    const produced = parseInt(quantityProduced);
    const approved = parseInt(quantityApproved);
    const rejected = parseInt(quantityRejected);

    if (approved + rejected !== produced) {
      toast.error("Approved + Rejected must equal Total Produced");
      return;
    }

    if (!batchNumber) {
      toast.error("Please generate a batch number");
      return;
    }

    createProductionMutation.mutate({
      productionDate: date,
      tireSize,
      tireType,
      quantityProduced: produced,
      quantityApproved: approved,
      quantityRejected: rejected,
      shift: shift || undefined,
      batchNumber,
      notes: notes || undefined,
    });
  };

  const approvalRate = quantityProduced && quantityApproved 
    ? ((parseInt(quantityApproved) / parseInt(quantityProduced)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="h-8 w-8" />
            Production Entry
          </h1>
          <p className="text-muted-foreground">Record daily tire production data</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {user?.name || "Unknown User"}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Produced</p>
                <p className="text-3xl font-bold">{quantityProduced || "0"}</p>
              </div>
              <Package className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{quantityApproved || "0"}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold">{approvalRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
          <CardDescription>Enter tire production information for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Production Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="batchNumber"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Generate or enter batch number"
                  className="flex-1"
                />
                <Button onClick={generateBatchNumber} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
          </div>

          {/* Tire Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tireSize">Tire Size *</Label>
              <Select value={tireSize} onValueChange={setTireSize}>
                <SelectTrigger id="tireSize" className="mt-2">
                  <SelectValue placeholder="Select tire size" />
                </SelectTrigger>
                <SelectContent>
                  {TIRE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tireType">Tire Type *</Label>
              <Select value={tireType} onValueChange={setTireType}>
                <SelectTrigger id="tireType" className="mt-2">
                  <SelectValue placeholder="Select tire type" />
                </SelectTrigger>
                <SelectContent>
                  {TIRE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantityProduced">Total Produced *</Label>
              <Input
                id="quantityProduced"
                type="number"
                value={quantityProduced}
                onChange={(e) => setQuantityProduced(e.target.value)}
                placeholder="0"
                className="mt-2"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="quantityApproved" className="text-green-600">Approved *</Label>
              <Input
                id="quantityApproved"
                type="number"
                value={quantityApproved}
                onChange={(e) => setQuantityApproved(e.target.value)}
                placeholder="0"
                className="mt-2 border-green-300 focus:border-green-500"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="quantityRejected" className="text-red-600">Rejected *</Label>
              <Input
                id="quantityRejected"
                type="number"
                value={quantityRejected}
                onChange={(e) => setQuantityRejected(e.target.value)}
                placeholder="0"
                className="mt-2 border-red-300 focus:border-red-500"
                min="0"
              />
            </div>
          </div>

          {/* Production Line and Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productionLine" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Production Line
              </Label>
              <Select value={productionLine} onValueChange={setProductionLine}>
                <SelectTrigger id="productionLine" className="mt-2">
                  <SelectValue placeholder="Select production line" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTION_LINES.map((line) => (
                    <SelectItem key={line} value={line}>
                      {line}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="shift" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Shift
              </Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger id="shift" className="mt-2">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {SHIFTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information about this production run..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} size="lg" disabled={createProductionMutation.isPending}>
              {createProductionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Production Record
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">📋 Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enter all tire production data at the end of each shift</li>
            <li>• Generate a unique batch number for traceability</li>
            <li>• Ensure Approved + Rejected = Total Produced</li>
            <li>• Add notes for any unusual events or quality issues</li>
            <li>• Data will automatically update inventory and quality systems</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

