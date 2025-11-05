import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AIPlanner = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tripPreferences, setTripPreferences] = useState({
    duration: "",
    budget: "",
    interests: [] as string[],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const interests = ["Adventure", "Food", "History", "Nightlife", "Nature", "Culture", "Beaches", "Shopping"];
  const budgets = ["Low ($)", "Medium ($$)", "High ($$$)"];
  const durations = ["1-3 days", "4-7 days", "1-2 weeks", "2+ weeks"];

  useEffect(() => {
    const destination = searchParams.get("destination");
    if (destination) {
      const welcomeMsg: Message = {
        role: "assistant",
        content: `Great! Let's plan your trip to ${destination}. I can help you with itineraries, packing tips, local culture, and recommendations. What would you like to know?`,
      };
      setMessages([welcomeMsg]);
    } else {
      const welcomeMsg: Message = {
        role: "assistant",
        content: "Hello! I'm your AI Travel Assistant. Tell me where you'd like to go, and I'll help you plan the perfect trip!",
      };
      setMessages([welcomeMsg]);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleInterest = (interest: string) => {
    setTripPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = tripPreferences.duration || tripPreferences.budget || tripPreferences.interests.length > 0
        ? `\n\nTrip preferences: Duration: ${tripPreferences.duration || "not specified"}, Budget: ${tripPreferences.budget || "not specified"}, Interests: ${tripPreferences.interests.join(", ") || "not specified"}`
        : "";

      const { data, error } = await supabase.functions.invoke("chat-travel", {
        body: {
          messages: [...messages, userMessage],
          context,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              AI Travel Planner
            </h1>
            <p className="text-muted-foreground">
              Chat with AI to plan your perfect adventure
            </p>
          </motion.div>

          {/* Trip Preferences */}
          <Card className="p-6 mb-6 backdrop-blur-xl bg-card/80 border-border">
            <h3 className="font-semibold mb-4 text-lg">Trip Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {durations.map((d) => (
                    <Badge
                      key={d}
                      variant={tripPreferences.duration === d ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setTripPreferences((p) => ({ ...p, duration: d }))}
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Budget Level</label>
                <div className="flex flex-wrap gap-2">
                  {budgets.map((b) => (
                    <Badge
                      key={b}
                      variant={tripPreferences.budget === b ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setTripPreferences((p) => ({ ...p, budget: b }))}
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={tripPreferences.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Messages */}
          <Card className="backdrop-blur-xl bg-card/80 border-border overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <Sparkles className="w-4 h-4 inline-block mr-2 text-primary" />
                      )}
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Ask me anything about your trip..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-background"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
