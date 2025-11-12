import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProductionEntry() {
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    productionDate: new Date().toISOString().split("T")[0],
    batchNumber: "",
    shiftType: "3-shift" as "1-shift" | "3-shift",
    tireSize: "",
    batchCode: "",
    curingA: 0,
    curingB: 0,
    curingR: 0,
    supervisorName: "",
    notes: "",
  });

  const createMutation = trpc.production.create.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      utils.production.list.invalidate();
      utils.dashboard.kpis.invalidate();
      // Reset form
      setFormData({
        productionDate: new Date().toISOString().split("T")[0],
        batchNumber: "",
        shiftType: "3-shift",
        tireSize: "",
        batchCode: "",
        curingA: 0,
        curingB: 0,
        curingR: 0,
        supervisorName: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalProduced = formData.curingA + formData.curingB + formData.curingR;
    
    createMutation.mutate({
      ...formData,
      totalProduced,
    });
  };

  const totalProduced = formData.curingA + formData.curingB + formData.curingR;
  const approvalRate = totalProduced > 0 ? ((formData.curingA / totalProduced) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("production.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productionDate">{t("production.date")}</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">{t("production.batch")}</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g., 44-25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shiftType">{t("production.shift")}</Label>
                  <select
                    id="shiftType"
                    value={formData.shiftType}
                    onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as "1-shift" | "3-shift" })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="1-shift">1-Shift</option>
                    <option value="3-shift">3-Shift</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tireSize">{t("production.tireSize")}</Label>
                  <Input
                    id="tireSize"
                    value={formData.tireSize}
                    onChange={(e) => setFormData({ ...formData, tireSize: e.target.value })}
                    placeholder="e.g., 5.00-12, 7.00-16"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchCode">{t("production.batchCode")}</Label>
                  <Input
                    id="batchCode"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                    placeholder="e.g., 711-R, 713-L"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisorName">{t("production.supervisor")}</Label>
                  <Input
                    id="supervisorName"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Curing Results (A/B/R System)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="curingA" className="text-green-600">
                      {t("production.curingA")}
                    </Label>
                    <Input
                      id="curingA"
                      type="number"
                      min="0"
                      value={formData.curingA}
                      onChange={(e) => setFormData({ ...formData, curingA: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curingB" className="text-yellow-600">
                      {t("production.curingB")}
                    </Label>
                    <Input
                      id="curingB"
                      type="number"
                      min="0"
                      value={formData.curingB}
                      onChange={(e) => setFormData({ ...formData, curingB: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curingR" className="text-red-600">
                      {t("production.curingR")}
                    </Label>
                    <Input
                      id="curingR"
                      type="number"
                      min="0"
                      value={formData.curingR}
                      onChange={(e) => setFormData({ ...formData, curingR: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Produced:</span>
                      <span className="ml-2 font-semibold">{totalProduced}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approval Rate:</span>
                      <span className="ml-2 font-semibold">{approvalRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("production.notes")}</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                  placeholder="Additional notes (supports Myanmar Unicode)"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? t("common.loading") : t("production.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
