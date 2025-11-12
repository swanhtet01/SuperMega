import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Calendar,
  CheckCircle2,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart
} from "lucide-react";
import { toast } from "sonner";

const REVENUE_CATEGORIES = ["Sales", "Services", "Other Income"];
const EXPENSE_CATEGORIES = [
  "Raw Materials",
  "Labor",
  "Utilities",
  "Maintenance",
  "Transportation",
  "Marketing",
  "Administrative",
  "Other"
];

const TRANSACTIONS = [
  { id: "TXN-001", date: "2025-11-13", type: "revenue", category: "Sales", amount: 5400000, description: "Order ORD-2025-005" },
  { id: "TXN-002", date: "2025-11-12", type: "expense", category: "Raw Materials", amount: 2100000, description: "Rubber purchase" },
  { id: "TXN-003", date: "2025-11-12", type: "revenue", category: "Sales", amount: 3100000, description: "Order ORD-2025-004" },
  { id: "TXN-004", date: "2025-11-11", type: "expense", category: "Labor", amount: 1800000, description: "Monthly salaries" },
  { id: "TXN-005", date: "2025-11-11", type: "revenue", category: "Sales", amount: 4200000, description: "Order ORD-2025-002" },
  { id: "TXN-006", date: "2025-11-10", type: "expense", category: "Utilities", amount: 450000, description: "Electricity bill" },
  { id: "TXN-007", date: "2025-11-10", type: "revenue", category: "Sales", amount: 2500000, description: "Order ORD-2025-001" },
  { id: "TXN-008", date: "2025-11-09", type: "expense", category: "Maintenance", amount: 320000, description: "Equipment repair" },
];

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [transactionType, setTransactionType] = useState<"revenue" | "expense">("revenue");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmitTransaction = async () => {
    if (!date || !category || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement transaction creation via tRPC
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Transaction recorded successfully");
      
      // Reset form
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setAmount("");
      setDescription("");
      setShowAddTransaction(false);
    } catch (error) {
      toast.error("Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate financial metrics
  const totalRevenue = TRANSACTIONS
    .filter(t => t.type === "revenue")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = TRANSACTIONS
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  // Expense breakdown
  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => {
    const total = TRANSACTIONS
      .filter(t => t.type === "expense" && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { category: cat, amount: total };
  }).filter(e => e.amount > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Financial Management
          </h1>
          <p className="text-muted-foreground">Track revenue, expenses, and profitability</p>
        </div>
        <Button onClick={() => setShowAddTransaction(!showAddTransaction)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  MMK {(totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  MMK {(totalExpenses / 1000000).toFixed(1)}M
                </p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  MMK {(netProfit / 1000000).toFixed(1)}M
                </p>
              </div>
              {netProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{profitMargin}%</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Record Transaction</CardTitle>
            <CardDescription>Add revenue or expense entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transactionType">Transaction Type *</Label>
                <Select value={transactionType} onValueChange={(value: "revenue" | "expense") => setTransactionType(value)}>
                  <SelectTrigger id="transactionType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        Revenue (Income)
                      </div>
                    </SelectItem>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        Expense (Cost)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(transactionType === "revenue" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (MMK) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="mt-2"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this transaction..."
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmitTransaction}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Record Transaction
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddTransaction(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {REVENUE_CATEGORIES.map((cat) => {
                    const total = TRANSACTIONS
                      .filter(t => t.type === "revenue" && t.category === cat)
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    if (total === 0) return null;
                    
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm">{cat}</span>
                        <span className="font-semibold">MMK {(total / 1000000).toFixed(2)}M</span>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="font-bold">Total Revenue</span>
                    <span className="font-bold text-green-600 text-lg">
                      MMK {(totalRevenue / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Expense Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseByCategory.slice(0, 5).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <span className="font-semibold">MMK {(item.amount / 1000000).toFixed(2)}M</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="font-bold">Total Expenses</span>
                    <span className="font-bold text-red-600 text-lg">
                      MMK {(totalExpenses / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>Current month financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Revenue</span>
                  <span className="font-bold text-green-600">MMK {(totalRevenue / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold text-red-600">MMK {(totalExpenses / 1000000).toFixed(2)}M</span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-lg ${netProfit >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <span className="font-bold text-lg">Net Profit</span>
                  <span className={`font-bold text-xl ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                    MMK {(netProfit / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Profit Margin</span>
                  <span className="font-bold">{profitMargin}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All revenue and expense entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TRANSACTIONS.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {txn.type === "revenue" ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {txn.date} • {txn.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.type === "revenue" ? "text-green-600" : "text-red-600"}`}>
                        {txn.type === "revenue" ? "+" : "-"}MMK {(txn.amount / 1000).toLocaleString()}K
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {txn.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Breakdown Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
              <CardDescription>Analyze spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseByCategory.map((item) => {
                  const percentage = totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : "0";
                  
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          MMK {(item.amount / 1000000).toFixed(2)}M ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-red-500"
                          style={{ width: `${percentage}%` }}
                        />
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

