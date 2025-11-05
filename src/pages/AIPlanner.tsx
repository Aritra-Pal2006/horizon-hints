import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, MapPin, Calendar, Euro, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createItinerary } from "@/utils/firestoreService";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ItineraryDay = {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    duration: string;
    location: string;
  }[];
  notes: string;
};

type Itinerary = {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  days: ItineraryDay[];
  tips: string[];
};

const AIPlanner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tripPreferences, setTripPreferences] = useState({
    destination: "",
    duration: "",
    budget: "",
    interests: [] as string[],
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "itinerary">("chat");
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const interests = ["Adventure", "Food", "History", "Nightlife", "Nature", "Culture", "Beaches", "Shopping"];
  const budgets = ["Low ($)", "Medium ($$)", "High ($$$)"];
  const durations = ["1-3 days", "4-7 days", "1-2 weeks", "2+ weeks"];

  useEffect(() => {
    const destination = searchParams.get("destination");
    if (destination) {
      setTripPreferences(prev => ({ ...prev, destination }));
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

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate more contextually aware and varied responses
      let assistantResponse = "";
      
      const lowerInput = input.toLowerCase();
      
      // Destination-specific responses
      if (lowerInput.includes("paris")) {
        assistantResponse = "Paris is magical! The City of Light offers iconic landmarks like the Eiffel Tower and Louvre Museum. Don't miss a Seine river cruise at sunset and try authentic croissants at a local boulangerie. Would you like me to create a detailed Paris itinerary?";
      } else if (lowerInput.includes("tokyo")) {
        assistantResponse = "Tokyo is an incredible blend of traditional and modern! From serene temples to bustling Shibuya Crossing, there's something for everyone. Sushi at Tsukiji Market and cherry blossoms in spring are must-experiences. Shall I plan your Tokyo adventure?";
      } else if (lowerInput.includes("new york")) {
        assistantResponse = "New York City never sleeps! Broadway shows, Central Park, and world-class museums await you. Don't forget to try a classic New York slice and experience the city from the top of the Empire State Building. Ready for the Big Apple experience?";
      } else if (lowerInput.includes("bali")) {
        assistantResponse = "Bali is paradise! From Ubud's rice terraces to Seminyak's beaches, it's perfect for relaxation and adventure. Yoga retreats, temple tours, and delicious Indonesian cuisine will make your trip unforgettable. Shall we plan your tropical escape?";
      }
      // Greeting responses
      else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        assistantResponse = "Hello there, fellow traveler! 🌍 I'm your AI travel companion, ready to help you plan the perfect adventure. Where are you thinking of exploring?";
      } else if (lowerInput.includes("goodbye") || lowerInput.includes("bye")) {
        assistantResponse = "Safe travels! Remember to pack your sense of adventure and curiosity. If you need any more travel tips, I'm always here to help!";
      }
      // Thank you responses
      else if (lowerInput.includes("thank")) {
        const thankResponses = [
          "You're very welcome! I'm here to make your travel dreams a reality. Is there anything else I can assist you with?",
          "My pleasure! Travel planning is what I love to do. What else would you like to know?",
          "Happy to help! The world is full of amazing destinations waiting for you to discover."
        ];
        assistantResponse = thankResponses[Math.floor(Math.random() * thankResponses.length)];
      }
      // Itinerary planning responses
      else if (lowerInput.includes("plan") || lowerInput.includes("itinerary") || lowerInput.includes("schedule")) {
        assistantResponse = "I'd love to create a personalized itinerary for you! Just share your destination, travel dates, and interests. I'll craft a detailed day-by-day plan tailored to your preferences. Shall we get started?";
      }
      // Weather responses
      else if (lowerInput.includes("weather") || lowerInput.includes("climate")) {
        assistantResponse = "Weather can make or break a trip! For the most accurate forecasts, I recommend checking closer to your travel date. Generally, I suggest packing layers and being prepared for unexpected changes. Would you like packing tips for your destination?";
      }
      // Food/cuisine responses
      else if (lowerInput.includes("food") || lowerInput.includes("restaurant") || lowerInput.includes("cuisine")) {
        const foodResponses = [
          "Food is a huge part of travel! Every destination has its own culinary treasures waiting to be discovered. From street food to fine dining, I can suggest authentic local experiences. What type of cuisine interests you?",
          "Ah, a food lover! Local cuisine tells the story of a place. I can recommend everything from hole-in-the-wall gems to Michelin-starred restaurants. What's your favorite type of food?",
          "Great taste! Trying local dishes is one of the best ways to experience a culture. I can help you find the best spots for authentic flavors. Any dietary preferences I should know about?"
        ];
        assistantResponse = foodResponses[Math.floor(Math.random() * foodResponses.length)];
      }
      // Budget responses
      else if (lowerInput.includes("budget") || lowerInput.includes("cheap") || lowerInput.includes("expensive")) {
        assistantResponse = "Traveling smart is all about balance! I can help you find great value accommodations, free activities, and local eats that won't break the bank. What's your budget range for this trip?";
      }
      // Culture/respect responses
      else if (lowerInput.includes("culture") || lowerInput.includes("respect") || lowerInput.includes("local")) {
        assistantResponse = "Respecting local customs is essential for meaningful travel. I can share cultural etiquette tips and lesser-known traditions to help you connect with locals authentically. What destination are you curious about?";
      }
      // Packing responses
      else if (lowerInput.includes("pack") || lowerInput.includes("luggage") || lowerInput.includes("suitcase")) {
        const packingResponses = [
          "Packing pro tip: Roll your clothes to save space and always pack one extra day's worth of essentials in your carry-on. What's your destination? I can suggest climate-appropriate packing lists!",
          "Smart packing makes travel stress-free! I recommend packing versatile pieces and leaving room for souvenirs. Are you traveling somewhere specific? I can suggest must-pack items!",
          "The art of packing: Lay out everything, then remove 30% - you likely don't need as much as you think! What type of trip are you preparing for?"
        ];
        assistantResponse = packingResponses[Math.floor(Math.random() * packingResponses.length)];
      }
      // Default varied responses
      else {
        const responses = [
          "That's an excellent point! Every traveler has unique preferences. Based on my experience, I'd recommend balancing popular attractions with hidden local gems. Would you like me to generate a personalized itinerary?",
          "I completely understand! Travel is all about personal discovery. For the best experience, I suggest staying flexible while having a loose plan. Shall I create a customizable itinerary for you?",
          "Great insight! Cultural immersion often leads to the most memorable travel experiences. I can help you find authentic local experiences that align with your interests. What aspects of travel matter most to you?",
          "Absolutely! Sustainable travel is increasingly important. I can suggest eco-friendly accommodations and responsible tourism practices for your destination. Would you like green travel recommendations?",
          "Interesting perspective! Solo travel, group adventures, or family trips each offer unique joys. I can tailor recommendations based on your travel style. How are you planning to travel?",
          "That's a thoughtful consideration! Off-season travel can offer incredible value and fewer crowds. I can provide timing tips for your destination of choice. When are you thinking of traveling?",
          "Wonderful idea! Photography can preserve travel memories beautifully. I can suggest scenic viewpoints and cultural moments worth capturing. What kind of travel experiences do you want to document?",
          "Smart thinking! Travel insurance is crucial peace of mind. I recommend comprehensive coverage, especially for adventure activities. Would you like a checklist of essential travel preparations?",
          "Excellent observation! Local festivals and events can transform an ordinary trip into an extraordinary one. I can research special events happening during your travel dates. When are you planning to go?",
          "That's so true! Language barriers can be overcome with a few key phrases. I can provide essential vocabulary for your destination. Which country are you visiting?"
        ];
        assistantResponse = responses[Math.floor(Math.random() * responses.length)];
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateItinerary = async () => {
    if (!tripPreferences.destination) {
      toast.error("Please specify a destination");
      return;
    }

    setIsLoading(true);
    setActiveTab("itinerary");

    try {
      // Simulate API call to generate itinerary
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a more varied itinerary based on preferences
      const daysCount = tripPreferences.duration.includes("1-3") ? 3 : 
                       tripPreferences.duration.includes("4-7") ? 5 : 7;
      
      const itineraryDays: ItineraryDay[] = [];
      
      for (let day = 1; day <= daysCount; day++) {
        const activities = [];
        
        // Generate different activities based on interests
        if (tripPreferences.interests.includes("Food")) {
          activities.push({
            time: "12:30 PM",
            activity: "Local cuisine experience",
            duration: "2 hours",
            location: "Popular food district"
          });
        }
        
        if (tripPreferences.interests.includes("Culture")) {
          activities.push({
            time: "10:00 AM",
            activity: "Visit cultural landmark",
            duration: "3 hours",
            location: "Historic center"
          });
        }
        
        if (tripPreferences.interests.includes("Nature")) {
          activities.push({
            time: "9:00 AM",
            activity: "Nature walk or park visit",
            duration: "2.5 hours",
            location: "Local green space"
          });
        }
        
        if (tripPreferences.interests.includes("Adventure")) {
          activities.push({
            time: "2:00 PM",
            activity: "Adventure activity",
            duration: "3 hours",
            location: "Adventure zone"
          });
        }
        
        // Default activities if no specific interests
        if (activities.length === 0) {
          activities.push(
            {
              time: "10:00 AM",
              activity: "Morning sightseeing",
              duration: "3 hours",
              location: "City center"
            },
            {
              time: "2:00 PM",
              activity: "Afternoon exploration",
              duration: "3 hours",
              location: "Local attractions"
            }
          );
        }
        
        // Add evening activity
        activities.push({
          time: "7:00 PM",
          activity: "Evening experience",
          duration: "2 hours",
          location: "Entertainment district"
        });
        
        itineraryDays.push({
          day,
          title: `Day ${day}: ${tripPreferences.destination} Exploration`,
          activities,
          notes: day === 1 ? "Take it easy on your first day to adjust to the time zone." : 
                 day === daysCount ? "Last day - prepare for departure" : 
                 "Enjoy your day exploring!"
        });
      }

      const mockItinerary: Itinerary = {
        destination: tripPreferences.destination,
        duration: tripPreferences.duration || "4-7 days",
        budget: tripPreferences.budget || "Medium ($$)",
        interests: tripPreferences.interests,
        days: itineraryDays,
        tips: [
          "Book popular attractions in advance to avoid long lines",
          "Try local street food for authentic flavors",
          "Download offline maps for navigation",
          "Keep a copy of important documents in your email",
          "Pack comfortable walking shoes",
          "Stay hydrated and protect yourself from the sun"
        ]
      };

      setItinerary(mockItinerary);
    } catch (error) {
      console.error("Itinerary generation error:", error);
      toast.error("Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveItinerary = async () => {
    if (!user) {
      toast.error("Please log in to save your itinerary");
      navigate("/login");
      return;
    }

    if (!itinerary) {
      toast.error("No itinerary to save");
      return;
    }

    setSaving(true);
    try {
      // Save itinerary to Firebase
      await createItinerary({
        destination: itinerary.destination,
        duration: itinerary.duration,
        budget: itinerary.budget,
        interests: itinerary.interests,
        days: itinerary.days,
        tips: itinerary.tips
      });
      
      toast.success("Itinerary saved successfully!");
    } catch (error) {
      console.error("Error saving itinerary:", error);
      toast.error("Failed to save itinerary. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const viewOnMap = () => {
    // Navigate to the map explorer with the current destination
    if (itinerary?.destination) {
      navigate(`/map?destination=${encodeURIComponent(itinerary.destination)}`);
    } else if (tripPreferences.destination) {
      navigate(`/map?destination=${encodeURIComponent(tripPreferences.destination)}`);
    } else {
      toast.error("Please specify a destination first");
    }
  };

  const exportAsPDF = async () => {
    if (!itineraryRef.current) {
      toast.error("No itinerary to export");
      return;
    }

    try {
      const canvas = await html2canvas(itineraryRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is taller than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Itinerary_${itinerary?.destination || 'Travel'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      toast.success("Itinerary exported as PDF successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export itinerary as PDF. Please try again.");
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
                <label className="text-sm font-medium mb-2 block">Destination</label>
                <Input
                  value={tripPreferences.destination}
                  onChange={(e) => setTripPreferences(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Where do you want to go?"
                  className="bg-background"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <Button 
                onClick={generateItinerary}
                disabled={isLoading || !tripPreferences.destination}
                className="bg-gradient-to-r from-primary to-accent mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Itinerary
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "chat" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("chat")}
            >
              Chat Assistant
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "itinerary" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("itinerary")}
            >
              Generated Itinerary
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "chat" ? (
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
                  <Textarea
                    placeholder="Ask me anything about your trip..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="flex-1 bg-background min-h-[40px] max-h-[120px]"
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
            </Card>
          ) : (
            <div>
              {isLoading && !itinerary ? (
                <Card className="p-8 backdrop-blur-xl bg-card/80 border-border">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating your personalized itinerary...</p>
                  </div>
                </Card>
              ) : itinerary ? (
                <div ref={itineraryRef} className="space-y-6">
                  {/* Itinerary Header */}
                  <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">Trip to {itinerary.destination}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{itinerary.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            <span>{itinerary.budget}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={saveItinerary}
                        disabled={saving}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Itinerary
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>

                  {/* Itinerary Days */}
                  <div className="space-y-6">
                    {itinerary.days.map((day) => (
                      <Card key={day.day} className="p-6 backdrop-blur-xl bg-card/80 border-border">
                        <h3 className="text-xl font-bold mb-4">Day {day.day}: {day.title}</h3>
                        
                        <div className="space-y-4">
                          {day.activities.map((activity, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="font-bold text-primary">{activity.time}</div>
                                <div className="text-xs text-muted-foreground">{activity.duration}</div>
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{activity.activity}</h4>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{activity.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {day.notes && (
                          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="text-sm">
                              <span className="font-medium">Note:</span> {day.notes}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Travel Tips */}
                  <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                    <h3 className="text-xl font-bold mb-4">Travel Tips</h3>
                    <ul className="space-y-2">
                      {itinerary.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={saveItinerary}
                      disabled={saving}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to My Trips
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={viewOnMap}>
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                    <Button variant="outline" onClick={exportAsPDF}>
                      Export as PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="p-8 backdrop-blur-xl bg-card/80 border-border text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Itinerary Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Fill in your trip preferences and click "Generate Itinerary" to create your personalized travel plan.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("chat")}
                    variant="outline"
                  >
                    Back to Chat
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;