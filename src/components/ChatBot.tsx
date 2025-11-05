import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { saveChatMessage, getUserChatHistory } from "@/utils/firestoreService";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompts for the chatbot
  const quickPrompts = [
    "Plan a 3-day trip to Paris",
    "Best time to visit Bali?",
    "Budget travel tips for Japan",
    "Family-friendly destinations in Europe"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      const welcomeMessage: Message = {
        role: "assistant",
        content: "Hello! I'm your AI Travel Assistant. How can I help you plan your next adventure?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Load chat history if user is logged in
      if (user) {
        loadChatHistory();
      }
    }
  }, [isOpen, messages.length, user]);

  const loadChatHistory = async () => {
    try {
      const history = await getUserChatHistory();
      if (history.length > 0) {
        const formattedHistory = history.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.timestamp.toDate()
        }));
        setMessages(formattedHistory);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to Firebase if logged in
    if (user) {
      try {
        await saveChatMessage({
          role: "user",
          content: input
        });
      } catch (error) {
        console.error("Error saving user message:", error);
      }
    }

    try {
      // Simulate API call to Gemini
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: Message = {
        role: "assistant",
        content: "I can help you plan your trip! Would you like me to generate a detailed itinerary for your destination?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to Firebase if logged in
      if (user) {
        try {
          await saveChatMessage({
            role: "assistant",
            content: assistantMessage.content
          });
        } catch (error) {
          console.error("Error saving assistant message:", error);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[500px] flex flex-col"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl backdrop-blur-xl bg-card/90 flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Travel Assistant</h3>
                    <p className="text-xs text-muted-foreground">AI-powered travel planning</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
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
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-2xl p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}
                
                {messages.length === 1 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-3">Try asking me:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((prompt, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 text-xs"
                          onClick={() => handleQuickPrompt(prompt)}
                        >
                          {prompt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me anything about travel..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="flex-1 bg-background min-h-[40px] max-h-[100px]"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-primary to-accent h-[40px]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;