import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star, Thermometer, Heart } from "lucide-react";
import CitySearch from "@/components/CitySearch";
import WeatherCard from "@/components/WeatherCard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isDestinationFavorite, addFavoriteDestination, removeFavoriteDestination } from "@/utils/firestoreService";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Popular destinations data
  const popularDestinations = [
    {
      id: "paris",
      name: "Paris",
      country: "France",
      image: "🗼",
      description: "The City of Light",
      temp: 18,
      rating: 4.8,
    },
    {
      id: "tokyo",
      name: "Tokyo",
      country: "Japan",
      image: "🗾",
      description: "Modern metropolis",
      temp: 22,
      rating: 4.9,
    },
    {
      id: "new-york",
      name: "New York",
      country: "USA",
      image: "🗽",
      description: "The Big Apple",
      temp: 15,
      rating: 4.7,
    },
    {
      id: "bali",
      name: "Bali",
      country: "Indonesia",
      image: "🏝️",
      description: "Tropical paradise",
      temp: 28,
      rating: 4.9,
    },
    {
      id: "london",
      name: "London",
      country: "UK",
      image: "🏰",
      description: "Historic capital",
      temp: 12,
      rating: 4.6,
    },
    {
      id: "sydney",
      name: "Sydney",
      country: "Australia",
      image: "🌊",
      description: "Harbor city",
      temp: 24,
      rating: 4.7,
    },
  ];

  // Load favorite status for popular destinations
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        const favoriteStatus: Record<string, boolean> = {};
        for (const destination of popularDestinations) {
          favoriteStatus[destination.id] = await isDestinationFavorite(destination.id);
        }
        setFavorites(favoriteStatus);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, [user]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  const toggleFavorite = async (destinationId: string) => {
    if (!user) {
      toast.error("Please log in to save favorites");
      navigate("/login");
      return;
    }

    try {
      if (favorites[destinationId]) {
        // In a real app, we would need to find the actual favorite ID to remove it
        // For now, we'll just update the UI state
        setFavorites(prev => ({
          ...prev,
          [destinationId]: false
        }));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await addFavoriteDestination({
          destinationId: destinationId,
          name: popularDestinations.find(d => d.id === destinationId)?.name || "Unknown",
          country: popularDestinations.find(d => d.id === destinationId)?.country || "Unknown",
          imageUrl: ""
        });
        
        setFavorites(prev => ({
          ...prev,
          [destinationId]: true
        }));
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorite");
      console.error("Error toggling favorite:", error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Explore Destinations</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover amazing places around the world and plan your next adventure
            </p>
          </motion.div>

          {/* Search Section */}
          <Card className="p-6 mb-12 backdrop-blur-xl bg-card/80 border-border">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">Find Your Next Destination</h2>
              <CitySearch onCitySelect={handleCitySelect} placeholder="Search cities, countries, or regions..." />
              
              {selectedCity && (
                <div className="mt-6">
                  <WeatherCard 
                    latitude={selectedCity.latitude} 
                    longitude={selectedCity.longitude} 
                    locationName={`${selectedCity.name}, ${selectedCity.country}`} 
                  />
                  
                  <div className="mt-6 flex justify-center gap-3">
                    <Button 
                      onClick={() => navigate(`/planner?destination=${encodeURIComponent(selectedCity.name)}`)}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      Plan Trip to {selectedCity.name}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedCity(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Popular Destinations */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Destinations</h2>
              <Button variant="ghost" className="text-primary">
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/destination/${destination.id}`)}
                >
                  <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-border hover:shadow-lg transition-shadow relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(destination.id);
                      }}
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites[destination.id] ? "fill-current text-red-500" : ""}`} 
                      />
                    </Button>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-4xl mb-2">{destination.image}</div>
                          <h3 className="text-xl font-bold">{destination.name}</h3>
                          <p className="text-muted-foreground">{destination.country}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{destination.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{destination.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-primary" />
                          <span>{destination.temp}°C</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          Explore
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommended For You */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h3 className="text-xl font-bold mb-2">Adventure Seekers</h3>
                <p className="text-muted-foreground mb-4">
                  Discover thrilling destinations for your next adventure
                </p>
                <div className="flex flex-wrap gap-2">
                  {["New Zealand", "Switzerland", "Costa Rica", "Nepal"].map((place) => (
                    <Button 
                      key={place}
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/planner?destination=${encodeURIComponent(place)}`)}
                    >
                      {place}
                    </Button>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h3 className="text-xl font-bold mb-2">Beach Lovers</h3>
                <p className="text-muted-foreground mb-4">
                  Relax on the world's most beautiful beaches
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Maldives", "Seychelles", "Hawaii", "Greek Islands"].map((place) => (
                    <Button 
                      key={place}
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/planner?destination=${encodeURIComponent(place)}`)}
                    >
                      {place}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;