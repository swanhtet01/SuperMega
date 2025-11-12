import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  CheckCircle2,
  Box,
  Factory
} from "lucide-react";
import { toast } from "sonner";

const RAW_MATERIALS = [
  { id: "natural_rubber", name: "Natural Rubber", unit: "kg", minStock: 5000, currentStock: 8500 },
  { id: "synthetic_rubber", name: "Synthetic Rubber", unit: "kg", minStock: 3000, currentStock: 4200 },
  { id: "carbon_black", name: "Carbon Black", unit: "kg", minStock: 2000, currentStock: 1800 },
  { id: "steel_wire", name: "Steel Wire", unit: "kg", minStock: 1500, currentStock: 2100 },
  { id: "textile_cord", name: "Textile Cord", unit: "m", minStock: 10000, currentStock: 12500 },
  { id: "sulfur", name: "Sulfur", unit: "kg", minStock: 500, currentStock: 350 },
  { id: "accelerators", name: "Accelerators", unit: "kg", minStock: 300, currentStock: 420 },
  { id: "antioxidants", name: "Antioxidants", unit: "kg", minStock: 200, currentStock: 180 },
];

const FINISHED_GOODS = [
  { id: "700R16", size: "700R16", type: "Light Truck", stock: 450, minStock: 200 },
  { id: "750R16", size: "750R16", type: "Light Truck", stock: 380, minStock: 200 },
  { id: "825R16", size: "825R16", type: "Truck", stock: 520, minStock: 300 },
  { id: "825R20", size: "825R20", type: "Truck", stock: 150, minStock: 300 },
  { id: "900R20", size: "900R20", type: "Heavy Truck", stock: 280, minStock: 250 },
  { id: "1000R20", size: "1000R20", type: "Heavy Truck", stock: 190, minStock: 200 },
];

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("raw-materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding stock
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState("in");
  const [notes, setNotes] = useState("");

  const handleAddStock = async () => {
    if (!selectedMaterial || !quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement stock update via tRPC
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(`Stock ${movementType === "in" ? "added" : "removed"} successfully`);
      
      // Reset form
      setSelectedMaterial("");
      setQuantity("");
      setNotes("");
      setShowAddMaterial(false);
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRawMaterials = RAW_MATERIALS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFinishedGoods = FINISHED_GOODS.filter(g => 
    g.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockRawMaterials = RAW_MATERIALS.filter(m => m.currentStock < m.minStock);
  const lowStockFinishedGoods = FINISHED_GOODS.filter(g => g.stock < g.minStock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground">Track raw materials and finished goods</p>
        </div>
        <Button onClick={() => setShowAddMaterial(!showAddMaterial)}>
          <Plus className="h-4 w-4 mr-2" />
          Update Stock
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Raw Materials</p>
                <p className="text-2xl font-bold">{RAW_MATERIALS.length}</p>
              </div>
              <Box className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Finished Goods</p>
                <p className="text-2xl font-bold">{FINISHED_GOODS.length}</p>
              </div>
              <Factory className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {lowStockRawMaterials.length + lowStockFinishedGoods.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">MMK 45M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Update Stock Form */}
      {showAddMaterial && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Update Stock</CardTitle>
            <CardDescription>Add or remove inventory items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material">Material/Product *</Label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger id="material" className="mt-2">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Raw Materials</div>
                    {RAW_MATERIALS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.unit})
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Finished Goods</div>
                    {FINISHED_GOODS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.size} - {g.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="movementType">Movement Type *</Label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger id="movementType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Stock In (Add)
                      </div>
                    </SelectItem>
                    <SelectItem value="out">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Stock Out (Remove)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="mt-2"
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for movement..."
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddStock}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Stock
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddMaterial(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
          <TabsTrigger value="low-stock">
            Low Stock
            {(lowStockRawMaterials.length + lowStockFinishedGoods.length) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {lowStockRawMaterials.length + lowStockFinishedGoods.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Raw Materials Tab */}
        <TabsContent value="raw-materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Materials Inventory</CardTitle>
              <CardDescription>Current stock levels of production materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRawMaterials.map((material) => {
                  const stockPercentage = (material.currentStock / material.minStock) * 100;
                  const isLowStock = material.currentStock < material.minStock;
                  
                  return (
                    <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{material.name}</h3>
                          {isLowStock && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current: {material.currentStock.toLocaleString()} {material.unit} | 
                          Min: {material.minStock.toLocaleString()} {material.unit}
                        </p>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isLowStock ? "bg-red-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold">
                          {material.currentStock.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{material.unit}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finished Goods Tab */}
        <TabsContent value="finished-goods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finished Goods Inventory</CardTitle>
              <CardDescription>Current stock of completed tires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFinishedGoods.map((product) => {
                  const stockPercentage = (product.stock / product.minStock) * 100;
                  const isLowStock = product.stock < product.minStock;
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{product.size}</h3>
                          <Badge variant="outline">{product.type}</Badge>
                          {isLowStock && (
                            <Badge variant="destructive">Low Stock</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current: {product.stock} units | Min: {product.minStock} units
                        </p>
                        <div className="mt-2 w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isLowStock ? "bg-red-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold">{product.stock}</p>
                        <p className="text-sm text-muted-foreground">units</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items that need reordering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockRawMaterials.length === 0 && lowStockFinishedGoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All inventory levels are healthy!</p>
                  </div>
                ) : (
                  <>
                    {lowStockRawMaterials.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Raw Materials</h3>
                        <div className="space-y-2">
                          {lowStockRawMaterials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                              <div>
                                <p className="font-medium">{material.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Current: {material.currentStock} {material.unit} | 
                                  Need: {material.minStock - material.currentStock} {material.unit} more
                                </p>
                              </div>
                              <Button size="sm" variant="outline">
                                Reorder
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {lowStockFinishedGoods.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Finished Goods</h3>
                        <div className="space-y-2">
                          {lowStockFinishedGoods.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                              <div>
                                <p className="font-medium">{product.size} - {product.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  Current: {product.stock} units | 
                                  Need: {product.minStock - product.stock} units more
                                </p>
                              </div>
                              <Button size="sm" variant="outline">
                                Schedule Production
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

