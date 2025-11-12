import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI business intelligence assistant for Yangon Tyre Factory. I can help you analyze production data, quality metrics, sales performance, inventory levels, and financial reports. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: suggestedQueries } = trpc.ai.getSuggestedQueries.useQuery();
  const chatMutation = trpc.ai.chat.useMutation();
  const reportMutation = trpc.ai.generateReport.useMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: inputMessage,
        conversationHistory: messages.slice(-10), // Last 10 messages for context
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to get response from AI assistant");
      console.error(error);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query);
  };

  const handleGenerateReport = async (query: string) => {
    setIsGeneratingReport(true);
    try {
      const response = await reportMutation.mutateAsync({
        query,
        format: "detailed",
      });

      const reportMessage: Message = {
        role: "assistant",
        content: `**Report Generated: ${query}**\n\n${response.report}`,
        timestamp: response.generatedAt,
      };

      setMessages(prev => [...prev, reportMessage]);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Business Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about your business data in natural language
          </p>
        </div>
        <Button
          onClick={() => handleGenerateReport("Generate comprehensive executive summary for this month")}
          disabled={isGeneratingReport}
          variant="outline"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Executive Report
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Main Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Chat
            </CardTitle>
            <CardDescription>
              Ask me anything about production, quality, sales, inventory, or financial data
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            <ScrollArea className="flex-1 px-6" ref={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question... (e.g., 'Show me last month's defect rate')"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Queries Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Suggested Queries</CardTitle>
            <CardDescription className="text-xs">
              Click to try these questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-4">
                {suggestedQueries?.map((category) => (
                  <div key={category.category}>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Badge variant="outline">{category.category}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {category.queries.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuery(query)}
                          className="w-full text-left text-xs p-2 rounded-md hover:bg-muted transition-colors border border-border"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

