import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MapPin, 
  Thermometer, 
  Star, 
  Calendar,
  Search,
  Loader2,
  Euro,
  Users,
  Clock,
  Navigation
} from "lucide-react";
import CitySearch from "@/components/CitySearch";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFavorites, removeFavoriteDestination } from "@/utils/firestoreService";
import { toast } from "sonner";

interface FavoriteDestination {
  id: string;
  destinationId: string;
  name: string;
  country: string;
  image: string;
  description: string;
  temp: number;
  rating: number;
  addedDate: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch favorites from Firebase
        const firebaseFavorites = await getUserFavorites();
        
        // Transform Firebase data to match our UI needs
        const transformedFavorites: FavoriteDestination[] = firebaseFavorites.map(fav => ({
          id: fav.id,
          destinationId: fav.destinationId,
          name: fav.name,
          country: fav.country,
          image: "🌍", // Default image, could be improved
          description: `Favorite destination in ${fav.country}`,
          temp: 20, // Default temperature, could be fetched from weather API
          rating: 4.5, // Default rating
          addedDate: fav.addedAt.toDate().toISOString().split('T')[0] // Convert Firestore timestamp to date string
        }));
        
        setFavorites(transformedFavorites);
      } catch (error) {
        toast.error("Failed to load favorites");
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

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

  const filteredDestinations = favorites.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFavorite = async (id: string) => {
    setRemovingId(id);
    try {
      // Remove from Firebase
      await removeFavoriteDestination(id);
      
      setFavorites(prev => prev.filter(fav => fav.id !== id));
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove favorite");
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              <h1 className="text-4xl font-bold">Your Favorites</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All your saved destinations in one place. Plan your next adventure from your favorites.
            </p>
          </motion.div>

          {/* Search and Stats */}
          <Card className="p-6 mb-8 backdrop-blur-xl bg-card/80 border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Saved Destinations</h2>
                <p className="text-muted-foreground">
                  You have {favorites.length} favorite destinations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Favorites Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No destinations match your search" : "You haven't saved any destinations yet"}
                </p>
                <Button 
                  onClick={() => navigate("/explore")}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  Explore Destinations
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="cursor-pointer"
                  >
                    <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-border hover:shadow-lg transition-shadow relative">
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(destination.id);
                        }}
                        disabled={removingId === destination.id}
                      >
                        {removingId === destination.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4 fill-current text-red-500" />
                        )}
                      </Button>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-4xl mb-2">{destination.image}</div>
                            <h3 className="text-xl font-bold">{destination.name}</h3>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {destination.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{destination.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{destination.description}</p>
                        
                        <div className="flex items-center justify-between mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-primary" />
                            <span>{destination.temp}°C</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            <span>Local Currency</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/destination/${destination.destinationId}`);
                            }}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-primary to-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/planner?destination=${encodeURIComponent(destination.name)}`);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Plan Trip
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Travel Inspiration */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Travel Inspiration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h3 className="text-xl font-bold mb-2">Create a New Itinerary</h3>
                <p className="text-muted-foreground mb-4">
                  Plan a trip to a new destination using our AI-powered travel assistant
                </p>
                <Button 
                  onClick={() => navigate("/planner")}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  Start Planning
                </Button>
              </Card>
              
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h3 className="text-xl font-bold mb-2">Explore More Destinations</h3>
                <p className="text-muted-foreground mb-4">
                  Discover new places to add to your favorites list
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/explore")}
                >
                  Browse Destinations
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;