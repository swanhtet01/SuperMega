import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Eye, Brain, DollarSign, TrendingUp, ArrowRight, Check, Zap, Shield, Sparkles } from "lucide-react";

export default function SuperMegaHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Autonomous AI Company
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            AI That Builds Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Business
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Enterprise software built and maintained by autonomous AI agents.
            <br />
            Deploy in days, improve daily, scale infinitely.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => window.location.href = '/flowcore?demo=true'}>
              View Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
              See How It Works
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-cyan-400">98%</div>
              <div className="text-sm text-slate-400">Lower Cost</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">10x</div>
              <div className="text-sm text-slate-400">Faster Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-slate-400">AI Operations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Our Products</h2>
          <p className="text-slate-400 text-lg">AI-powered solutions for every aspect of your business</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* FlowCore */}
          <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Factory className="w-6 h-6 text-cyan-400" />
              </div>
              <CardTitle className="text-white">FlowCore</CardTitle>
              <CardDescription className="text-slate-400">
                Your factory's operating system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  Real-time production tracking
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  AI-powered optimization
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                  Multi-plant coordination
                </li>
              </ul>
              <Button className="w-full bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20" onClick={() => window.location.href = '/flowcore?demo=true'}>
                View Demo
              </Button>
            </CardContent>
          </Card>

          {/* QualityLens */}
          <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">QualityLens</CardTitle>
              <CardDescription className="text-slate-400">
                See quality issues before they happen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  Computer vision defect detection
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  Predictive quality alerts
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  Root cause analysis
                </li>
              </ul>
              <Button className="w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* StockMind */}
          <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">StockMind</CardTitle>
              <CardDescription className="text-slate-400">
                Never run out, never overstock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  ML demand forecasting
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  Auto-reorder optimization
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  Multi-warehouse management
                </li>
              </ul>
              <Button className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                Join Waitlist
              </Button>
            </CardContent>
          </Card>

          {/* CashSense */}
          <Card className="bg-slate-900/50 border-slate-800 hover:border-green-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">CashSense</CardTitle>
              <CardDescription className="text-slate-400">
                Your AI CFO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  Automated bookkeeping
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  Cash flow forecasting
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  Fraud detection
                </li>
              </ul>
              <Button className="w-full bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20">
                Join Waitlist
              </Button>
            </CardContent>
          </Card>

          {/* DealFlow */}
          <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">DealFlow</CardTitle>
              <CardDescription className="text-slate-400">
                Close more deals, faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  AI lead scoring
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  Win probability prediction
                </li>
                <li className="flex items-start text-sm text-slate-300">
                  <Check className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  Automated follow-ups
                </li>
              </ul>
              <Button className="w-full bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20">
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why SuperMega Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Why SuperMega?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">10x Faster Delivery</h3>
            <p className="text-slate-400">
              What takes months with traditional development happens in days with autonomous AI agents.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Continuous Evolution</h3>
            <p className="text-slate-400">
              Your software improves daily. New features, optimizations, and fixes deployed automatically.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enterprise Grade</h3>
            <p className="text-slate-400">
              SOC 2 ready, 99.9% uptime, role-based access, audit logging, data encryption.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Build Your Business with AI?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join companies already using SuperMega to transform their operations.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-slate-400">
            <p className="mb-2">© 2025 SuperMega.dev - The Autonomous AI Company</p>
            <p className="text-sm">Built with 🤖 by SuperMega AI Agent Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

