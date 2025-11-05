import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Globe, 
  Heart, 
  Calendar,
  Mail,
  Lock,
  User,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Landing = () => {
  const [destination, setDestination] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSearch = () => {
    if (destination.trim()) {
      navigate(`/planner?destination=${encodeURIComponent(destination)}`);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Welcome back! You're now logged in.");
        setShowAuthModal(false);
      } else {
        await signUp(email, password, name);
        toast.success("Account created successfully! Welcome aboard.");
        setShowAuthModal(false);
      }
    } catch (error: any) {
      toast.error(error.message || (isLogin ? "Failed to log in" : "Failed to create account"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome! You're now logged in with Google.");
      setShowAuthModal(false);
    } catch (error: any) {
      // Provide more specific error messages
      if (error.message) {
        toast.error(error.message);
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Google sign-in was cancelled. Please try again and complete the sign-in process.");
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const topDestinations = [
    { name: "Paris, France", image: "🗼", color: "from-pink-500 to-rose-500" },
    { name: "Tokyo, Japan", image: "🗾", color: "from-red-500 to-orange-500" },
    { name: "New York, USA", image: "🗽", color: "from-blue-500 to-cyan-500" },
    { name: "Bali, Indonesia", image: "🏝️", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Your AI Travel Companion
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12">
              Plan your perfect journey with AI-powered recommendations
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative backdrop-blur-xl bg-card/80 rounded-2xl p-3 shadow-lg border border-border">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 bg-background border-0 h-12 text-lg"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Plan Trip
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full mt-3 text-primary hover:bg-primary/10"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      () => navigate("/planner?useLocation=true"),
                      () => toast.error("Unable to get your location")
                    );
                  }
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use My Current Location
              </Button>
            </div>
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-border hover:bg-secondary px-8"
              onClick={() => navigate("/explore")}
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Destinations
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 backdrop-blur-xl bg-card/80 border-border hover:bg-card/50"
              onClick={() => navigate("/explore")}
            >
              <Globe className="w-8 h-8 text-primary" />
              <div className="text-center">
                <h3 className="font-bold">Explore Destinations</h3>
                <p className="text-sm text-muted-foreground mt-1">Discover amazing places</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 backdrop-blur-xl bg-card/80 border-border hover:bg-card/50"
              onClick={() => navigate("/planner")}
            >
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="text-center">
                <h3 className="font-bold">AI Trip Planner</h3>
                <p className="text-sm text-muted-foreground mt-1">Create personalized itineraries</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 backdrop-blur-xl bg-card/80 border-border hover:bg-card/50"
              onClick={() => setShowAuthModal(true)}
            >
              <Heart className="w-8 h-8 text-primary" />
              <div className="text-center">
                <h3 className="font-bold">Save Your Trips</h3>
                <p className="text-sm text-muted-foreground mt-1">Login to save itineraries</p>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Popular Destinations
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore the world's most amazing places
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topDestinations.map((dest, idx) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => navigate(`/planner?destination=${encodeURIComponent(dest.name)}`)}
              >
                <div className={`relative h-64 rounded-2xl bg-gradient-to-br ${dest.color} p-6 overflow-hidden group shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="text-6xl">{dest.image}</div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">{dest.name}</h3>
                      <p className="text-white/90 text-sm">Explore now →</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Details Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Perfect Travel
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Horizon Hints combines cutting-edge AI technology with comprehensive travel data to create your ultimate travel companion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Comprehensive Travel Planning</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: <Sparkles className="w-6 h-6 text-primary" />,
                    title: "AI-Powered Itineraries",
                    description: "Get personalized day-by-day travel plans based on your interests, budget, and travel dates"
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-primary" />,
                    title: "Interactive Maps",
                    description: "Explore destinations with detailed maps showing attractions, restaurants, and transportation options"
                  },
                  {
                    icon: <Heart className="w-6 h-6 text-primary" />,
                    title: "Smart Recommendations",
                    description: "Discover hidden gems and popular attractions tailored to your preferences"
                  },
                  {
                    icon: <Calendar className="w-6 h-6 text-primary" />,
                    title: "Real-Time Updates",
                    description: "Stay informed with live weather, events, and travel advisories for your destinations"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-card/80 rounded-2xl p-8 border border-border shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6">Key Features</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-primary mb-2">Destination Explorer</h4>
                  <p className="text-muted-foreground text-sm">
                    Browse thousands of destinations with detailed information, photos, and traveler reviews
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-2">Trip Management</h4>
                  <p className="text-muted-foreground text-sm">
                    Save, organize, and share your travel plans with friends and family
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-2">Local Insights</h4>
                  <p className="text-muted-foreground text-sm">
                    Get authentic recommendations for food, culture, and experiences from locals
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-2">Travel Community</h4>
                  <p className="text-muted-foreground text-sm">
                    Connect with fellow travelers, share experiences, and get inspiration for your next adventure
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-bold mb-3">Why Travelers Choose Horizon Hints</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-muted-foreground">Destinations</div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">500K+</div>
                    <div className="text-xs text-muted-foreground">Travelers</div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Horizon Hints Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Planning your perfect trip has never been easier with our intelligent travel platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us Your Travel Preferences",
                description: "Share your destination, travel dates, interests, and budget with our AI assistant",
                icon: <User className="w-8 h-8 text-primary" />
              },
              {
                step: "02",
                title: "Get Your Personalized Itinerary",
                description: "Receive a detailed day-by-day plan with attractions, dining options, and activities",
                icon: <Sparkles className="w-8 h-8 text-primary" />
              },
              {
                step: "03",
                title: "Explore & Customize",
                description: "Modify your plan, save favorites, and get real-time updates during your trip",
                icon: <MapPin className="w-8 h-8 text-primary" />
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="backdrop-blur-xl bg-card/80 rounded-2xl p-8 border border-border shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <div className="text-primary font-bold text-2xl mb-2">{step.step}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Our platform combines cutting-edge AI with comprehensive travel data to deliver exceptional travel experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-card/80 rounded-2xl p-8 border border-border shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-6">Our Technology Stack</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-primary mb-2">Artificial Intelligence</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    Advanced machine learning algorithms analyze millions of data points to create personalized travel recommendations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Machine Learning</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Natural Language Processing</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Predictive Analytics</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-2">Real-Time Data Integration</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    We aggregate data from multiple sources to provide accurate, up-to-date information for travelers.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Weather APIs</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Flight Data</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Local Events</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-2">Interactive Mapping</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    Our custom mapping solution provides detailed destination information with intuitive navigation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Mapbox GL JS</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Geolocation</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Route Optimization</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Comprehensive Travel Data</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: <Globe className="w-6 h-6 text-primary" />,
                    title: "Global Destination Database",
                    description: "Detailed information on 10,000+ destinations worldwide, including attractions, accommodations, and local experiences"
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6 text-primary" />,
                    title: "Travel Intelligence",
                    description: "Real-time insights on pricing trends, seasonal patterns, and travel restrictions for informed decision-making"
                  },
                  {
                    icon: <Heart className="w-6 h-6 text-primary" />,
                    title: "Community-Driven Content",
                    description: "Authentic reviews and recommendations from our global community of travelers and local experts"
                  }
                ].map((data, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      {data.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{data.title}</h4>
                      <p className="text-muted-foreground">{data.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Privacy & Security
                </h4>
                <p className="text-muted-foreground text-sm">
                  Your travel data is protected with industry-standard encryption. We never sell your personal information and give you full control over your data.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: Sparkles,
                title: "AI-Powered Planning",
                description: "Get personalized itineraries based on your preferences and interests",
              },
              {
                Icon: MapPin,
                title: "Real-Time Data",
                description: "Access live information about attractions, weather, and local events",
              },
              {
                Icon: Heart,
                title: "Save & Share",
                description: "Save your favorite destinations and itineraries to access anytime",
              },
            ].map((feature, idx) => {
              const { Icon } = feature;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="backdrop-blur-xl bg-card/80 rounded-2xl p-8 border border-border shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Travelers Love Horizon Hints
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our community has to say about their travel experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: "Horizon Hints transformed how I plan trips. The AI suggestions were spot-on and saved me hours of research!",
                author: "Sarah J.",
                role: "Frequent Traveler",
              },
              {
                quote: "Finally, an app that understands my travel style. The personalized itineraries are incredibly detailed and practical.",
                author: "Michael T.",
                role: "Adventure Enthusiast",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="backdrop-blur-xl bg-card/80 rounded-2xl p-6 border border-border shadow-lg"
              >
                <div className="text-primary mb-4">★★★★★</div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-12 border border-border"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who use Horizon Hints to plan unforgettable adventures
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8"
                onClick={() => setShowAuthModal(true)}
              >
                <User className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-border hover:bg-secondary px-8"
                onClick={() => navigate("/planner")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try AI Planner
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 backdrop-blur-xl bg-card/90 border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {isLogin ? "Welcome Back" : "Join Horizon Hints"}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAuthModal(false)}
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Google
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Landing;