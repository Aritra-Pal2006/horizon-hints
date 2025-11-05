import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Home = () => {
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (destination.trim()) {
      navigate(`/planner?destination=${encodeURIComponent(destination)}`);
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
      <Navbar />
      
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
                      () => alert("Unable to get your location")
                    );
                  }
                }}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use My Current Location
              </Button>
            </div>
          </motion.div>
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

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: Sparkles,
                title: "AI-Powered Planning",
                description: "Get personalized itineraries based on your preferences",
              },
              {
                Icon: MapPin,
                title: "Real-Time Data",
                description: "Access live information about attractions and places",
              },
              {
                Icon: Search,
                title: "Interactive Maps",
                description: "Explore destinations with beautiful interactive maps",
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
    </div>
  );
};

export default Home;
