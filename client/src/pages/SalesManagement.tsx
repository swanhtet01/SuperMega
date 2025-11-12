import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Plus,
  Search,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DEALERS = [
  { id: "D001", name: "Yangon Motors", city: "Yangon", phone: "09-123-456-789", outstanding: 5200000, creditLimit: 10000000 },
  { id: "D002", name: "Mandalay Tire Center", city: "Mandalay", phone: "09-234-567-890", outstanding: 3800000, creditLimit: 8000000 },
  { id: "D003", name: "Naypyidaw Auto Parts", city: "Naypyidaw", phone: "09-345-678-901", outstanding: 2100000, creditLimit: 5000000 },
  { id: "D004", name: "Bago Wheels", city: "Bago", phone: "09-456-789-012", outstanding: 1500000, creditLimit: 3000000 },
  { id: "D005", name: "Mawlamyine Traders", city: "Mawlamyine", phone: "09-567-890-123", outstanding: 4200000, creditLimit: 7000000 },
];

const ORDERS = [
  { id: "ORD-2025-001", dealer: "Yangon Motors", date: "2025-11-10", items: 3, total: 2500000, status: "pending" },
  { id: "ORD-2025-002", dealer: "Mandalay Tire Center", date: "2025-11-11", items: 5, total: 4200000, status: "shipped" },
  { id: "ORD-2025-003", dealer: "Naypyidaw Auto Parts", date: "2025-11-12", items: 2, total: 1800000, status: "delivered" },
  { id: "ORD-2025-004", dealer: "Bago Wheels", date: "2025-11-12", items: 4, total: 3100000, status: "pending" },
  { id: "ORD-2025-005", dealer: "Mawlamyine Traders", date: "2025-11-13", items: 6, total: 5400000, status: "shipped" },
];

const TIRE_PRODUCTS = [
  { size: "700R16", price: 45000 },
  { size: "750R16", price: 48000 },
  { size: "825R16", price: 52000 },
  { size: "825R20", price: 68000 },
  { size: "900R20", price: 75000 },
  { size: "1000R20", price: 82000 },
];

export default function SalesManagement() {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New order form state
  const [selectedDealer, setSelectedDealer] = useState("");
  const [orderItems, setOrderItems] = useState<Array<{ size: string; quantity: number; price: number }>>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState("");

  const addOrderItem = () => {
    if (!selectedSize || !quantity) {
      toast.error("Please select tire size and quantity");
      return;
    }

    const product = TIRE_PRODUCTS.find(p => p.size === selectedSize);
    if (!product) return;

    setOrderItems([...orderItems, {
      size: selectedSize,
      quantity: parseInt(quantity),
      price: product.price
    }]);

    setSelectedSize("");
    setQuantity("");
    toast.success("Item added to order");
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedDealer || orderItems.length === 0) {
      toast.error("Please select a dealer and add at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement order creation via tRPC
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Order created successfully");
      
      // Reset form
      setSelectedDealer("");
      setOrderItems([]);
      setShowNewOrder(false);
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDealers = DEALERS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = ORDERS.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.dealer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = ORDERS.reduce((sum, order) => sum + order.total, 0);
  const totalOutstanding = DEALERS.reduce((sum, dealer) => sum + dealer.outstanding, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-blue-50"><Truck className="h-3 w-3 mr-1" />Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle2 className="h-3 w-3 mr-1" />Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Sales Management
          </h1>
          <p className="text-muted-foreground">Manage dealers, orders, and sales performance</p>
        </div>
        <Button onClick={() => setShowNewOrder(!showNewOrder)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dealers</p>
                <p className="text-2xl font-bold">{DEALERS.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders This Month</p>
                <p className="text-2xl font-bold">{ORDERS.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">MMK {(totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">MMK {(totalOutstanding / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Order Form */}
      {showNewOrder && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create New Order</CardTitle>
            <CardDescription>Add a new sales order for a dealer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dealer">Select Dealer *</Label>
              <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                <SelectTrigger id="dealer" className="mt-2">
                  <SelectValue placeholder="Choose dealer" />
                </SelectTrigger>
                <SelectContent>
                  {DEALERS.map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.name} - {dealer.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Add Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="tireSize">Tire Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="tireSize" className="mt-2">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIRE_PRODUCTS.map((product) => (
                        <SelectItem key={product.size} value={product.size}>
                          {product.size} - MMK {product.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="mt-2"
                    min="1"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={addOrderItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {orderItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Order Items:</h4>
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.size}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} units × MMK {item.price.toLocaleString()} = MMK {(item.quantity * item.price).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-bold">
                    <span>Total:</span>
                    <span className="text-lg">MMK {calculateOrderTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewOrder(false)}
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
          placeholder="Search dealers or orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="dealers">Dealers</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>Track and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.dealer} • {order.date} • {order.items} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">MMK {(order.total / 1000).toLocaleString()}K</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealers Tab */}
        <TabsContent value="dealers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dealer Network</CardTitle>
              <CardDescription>Manage dealer relationships and credit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDealers.map((dealer) => {
                  const creditUsage = (dealer.outstanding / dealer.creditLimit) * 100;
                  const isHighCredit = creditUsage > 80;
                  
                  return (
                    <div key={dealer.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{dealer.name}</h3>
                            <Badge variant="outline">{dealer.id}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {dealer.city}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {dealer.phone}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Credit Usage:</span>
                          <span className={isHighCredit ? "text-orange-600 font-medium" : ""}>
                            MMK {(dealer.outstanding / 1000000).toFixed(1)}M / {(dealer.creditLimit / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isHighCredit ? "bg-orange-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(creditUsage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

