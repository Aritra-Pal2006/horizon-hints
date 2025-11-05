import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Euro, 
  Star, 
  Heart, 
  Share2, 
  Navigation,
  Clock,
  Users,
  Loader2,
  Settings
} from "lucide-react";
import WeatherCard from "@/components/WeatherCard";
import Navbar from "@/components/Navbar";
import { searchCities, getCityDetails } from "@/utils/geoDBService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { isDestinationFavorite, addFavoriteDestination, removeFavoriteDestination, getUserFavorites } from "@/utils/firestoreService";
import DestinationMap from "@/components/DestinationMap";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Mock data for different destinations
const destinationDataMap: Record<string, any> = {
  paris: {
    name: "Paris",
    country: "France",
    description: "Paris, the capital of France, is synonymous with the finer things in life: art, fashion, exquisite cuisine, and intellectual and cultural pursuits. The City of Light draws millions of visitors every year with its magnificent museums, stunning architecture, and vibrant neighborhoods.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    reviews: 12450,
    bestTime: "April-June, September-November",
    currency: "Euro (€)",
    language: "French",
    timezone: "CET (UTC+1)",
    attractions: [
      "Eiffel Tower",
      "Louvre Museum",
      "Notre-Dame Cathedral",
      "Champs-Élysées",
      "Montmartre",
      "Seine River Cruise"
    ],
    categories: ["Culture", "History", "Romance", "Art", "Food"],
    temp: 18,
    population: "2.1 million",
    area: "105.4 km²",
    currencyCode: "EUR",
    currencyRate: "1 USD = 0.93 EUR",
    emergency: "112",
    electricity: "230V / 50Hz",
    drivingSide: "Right",
    visa: "Schengen",
    tipping: "5-10% in restaurants",
    highlights: [
      "Iconic landmarks like the Eiffel Tower and Arc de Triomphe",
      "World-class museums including the Louvre and Musée d'Orsay",
      "Charming neighborhoods like Montmartre and Le Marais",
      "Café culture and world-renowned cuisine",
      "Fashion capital with luxury shopping on Champs-Élysées"
    ]
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    description: "Tokyo, Japan's bustling capital, mixes the ultramodern with the traditional. Known for its skyscrapers, shopping districts, and pop culture, Tokyo offers a unique blend of ancient temples and cutting-edge technology.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviews: 15230,
    bestTime: "March-May, September-November",
    currency: "Yen (¥)",
    language: "Japanese",
    timezone: "JST (UTC+9)",
    attractions: [
      "Shibuya Crossing",
      "Tokyo Skytree",
      "Senso-ji Temple",
      "Tsukiji Fish Market",
      "Meiji Shrine",
      "Harajuku District"
    ],
    categories: ["Culture", "Technology", "Food", "Shopping"],
    temp: 22,
    population: "14 million",
    area: "2,194 km²",
    currencyCode: "JPY",
    currencyRate: "1 USD = 149 JPY",
    emergency: "119",
    electricity: "100V / 50Hz",
    drivingSide: "Left",
    visa: "Varies by nationality",
    tipping: "Not customary",
    highlights: [
      "Ultra-modern districts like Shibuya and Shinjuku",
      "Traditional temples and gardens",
      "World's busiest pedestrian crossing",
      "Amazing food scene from sushi to ramen",
      "Unique pop culture and fashion districts"
    ]
  },
  "new-york": {
    name: "New York",
    country: "USA",
    description: "New York City, often called simply New York, is the most populous city in the United States. The city is a global hub for finance, entertainment, and culture, known for its iconic skyline and diverse neighborhoods.",
    image: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    reviews: 22150,
    bestTime: "April-June, September-November",
    currency: "Dollar ($)",
    language: "English",
    timezone: "EST (UTC-5)",
    attractions: [
      "Statue of Liberty",
      "Central Park",
      "Times Square",
      "Empire State Building",
      "Metropolitan Museum",
      "Brooklyn Bridge"
    ],
    categories: ["Culture", "Entertainment", "Shopping", "Food"],
    temp: 15,
    population: "8.5 million",
    area: "783.8 km²",
    currencyCode: "USD",
    currencyRate: "1 USD = 1 USD",
    emergency: "911",
    electricity: "120V / 60Hz",
    drivingSide: "Right",
    visa: "Varies by nationality",
    tipping: "15-20% in restaurants",
    highlights: [
      "Iconic skyline with Empire State Building and One World Trade",
      "World-class museums like the Met and MoMA",
      "Diverse neighborhoods from Greenwich Village to Harlem",
      "Broadway shows and entertainment scene",
      "Central Park and other green spaces"
    ]
  },
  bali: {
    name: "Bali",
    country: "Indonesia",
    description: "Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to Hindu temples and a rich cultural heritage.",
    image: "https://images.unsplash.com/photo-1518542720-425d14f5a9c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    reviews: 18760,
    bestTime: "April-October",
    currency: "Rupiah (Rp)",
    language: "Indonesian",
    timezone: "WITA (UTC+8)",
    attractions: [
      "Uluwatu Temple",
      "Tanah Lot",
      "Ubud Monkey Forest",
      "Mount Batur",
      "Tegallalang Rice Terraces",
      "Seminyak Beach"
    ],
    categories: ["Beaches", "Culture", "Nature", "Adventure"],
    temp: 28,
    population: "4.3 million",
    area: "5,780 km²",
    currencyCode: "IDR",
    currencyRate: "1 USD = 15,500 IDR",
    emergency: "112",
    electricity: "230V / 50Hz",
    drivingSide: "Left",
    visa: "Visa on arrival for many nationalities",
    tipping: "Small change is appreciated",
    highlights: [
      "Stunning beaches from Kuta to Nusa Dua",
      "Ancient temples like Uluwatu and Tanah Lot",
      "Rice terraces and volcanic landscapes",
      "World-class diving and surfing spots",
      "Rich cultural traditions and ceremonies"
    ]
  },
  london: {
    name: "London",
    country: "UK",
    description: "London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times. At its center stand the imposing Houses of Parliament, the iconic 'Big Ben' clock tower and Westminster Abbey.",
    image: "https://images.unsplash.com/photo-1513635269975-5661817d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.6,
    reviews: 19840,
    bestTime: "March-May, September-November",
    currency: "Pound (£)",
    language: "English",
    timezone: "GMT (UTC+0)",
    attractions: [
      "Tower of London",
      "Buckingham Palace",
      "British Museum",
      "London Eye",
      "Big Ben",
      "Tower Bridge"
    ],
    categories: ["History", "Culture", "Architecture", "Food"],
    temp: 12,
    population: "9 million",
    area: "1,572 km²",
    currencyCode: "GBP",
    currencyRate: "1 USD = 0.82 GBP",
    emergency: "999",
    electricity: "230V / 50Hz",
    drivingSide: "Left",
    visa: "Varies by nationality",
    tipping: "10-15% in restaurants",
    highlights: [
      "Historic landmarks like Tower Bridge and Buckingham Palace",
      "World-class museums with free entry",
      "Theatre district with West End shows",
      "Diverse neighborhoods from Notting Hill to Shoreditch",
      "Parks and green spaces like Hyde Park and Regent's Park"
    ]
  },
  sydney: {
    name: "Sydney",
    country: "Australia",
    description: "Sydney, capital of New South Wales and one of Australia's largest cities, is best known for its harbourfront Sydney Opera House, with a distinctive sail-like design. Massive Darling Harbour and the smaller Circular Quay port are hubs of waterside life.",
    image: "https://images.unsplash.com/photo-1506973035762-94b6592028b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    reviews: 16520,
    bestTime: "September-November, March-May",
    currency: "Dollar (A$)",
    language: "English",
    timezone: "AEST (UTC+10)",
    attractions: [
      "Sydney Opera House",
      "Sydney Harbour Bridge",
      "Bondi Beach",
      "Darling Harbour",
      "Taronga Zoo",
      "The Rocks"
    ],
    categories: ["Beaches", "Culture", "Architecture", "Nature"],
    temp: 24,
    population: "5.3 million",
    area: "12,367 km²",
    currencyCode: "AUD",
    currencyRate: "1 USD = 1.52 AUD",
    emergency: "000",
    electricity: "230V / 50Hz",
    drivingSide: "Left",
    visa: "Electronic Travel Authority for many nationalities",
    tipping: "Not customary",
    highlights: [
      "Iconic Opera House and Harbour Bridge",
      "Beautiful beaches from Bondi to Manly",
      "Harbour and coastal walks",
      "Vibrant neighborhoods like Surry Hills and Newtown",
      "Excellent dining and café culture"
    ]
  }
};

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Get destination data based on ID
  const destinationData = destinationDataMap[id || "paris"] || destinationDataMap["paris"];

  useEffect(() => {
    const loadCityData = async () => {
      setLoading(true);
      try {
        // Fetch city details by ID
        const cityData = await getCityDetails(id || "");
        setCity(cityData);
        
        // Check if destination is favorite
        if (user) {
          const isFav = await isDestinationFavorite(cityData.id);
          setIsFavorite(isFav);
          
          // If it's a favorite, get the favorite ID for removal
          if (isFav) {
            const userFavorites = await getUserFavorites();
            const favorite = userFavorites.find(fav => fav.destinationId === cityData.id);
            if (favorite) {
              setFavoriteId(favorite.id);
            }
          }
        }
      } catch (error) {
        console.error("Error loading city data:", error);
        toast.error("Failed to load destination details");
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      loadCityData();
    } else if (!user) {
      setLoading(false);
    }
  }, [id, user]);

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

  const handlePlanTrip = () => {
    navigate(`/planner?destination=${encodeURIComponent(city?.name || destinationData.name)}`);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      navigate("/login");
      return;
    }

    setTogglingFavorite(true);
    try {
      if (isFavorite && favoriteId) {
        // Remove from favorites
        await removeFavoriteDestination(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        if (city) {
          const newFavoriteId = await addFavoriteDestination({
            destinationId: city.id,
            name: city.name,
            country: city.country,
            imageUrl: destinationData.image
          });
          setIsFavorite(true);
          setFavoriteId(newFavoriteId);
          toast.success("Added to favorites");
        }
      }
    } catch (error) {
      toast.error("Failed to update favorite");
      console.error("Error toggling favorite:", error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleShareDestination = async () => {
    const shareData = {
      title: `${destinationData.name}, ${destinationData.country}`,
      text: `Check out ${destinationData.name} on TravelGuide! ${destinationData.description.substring(0, 100)}...`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share(shareData);
        toast.success("Destination shared successfully!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error: any) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (copyError) {
        toast.error("Failed to share destination");
        console.error("Error sharing destination:", error);
      }
    }
  };

  const handleSaveForLater = async () => {
    // For "Save for Later", we'll add to favorites but with a special tag
    // In a more advanced implementation, we might have a separate "saved for later" collection
    if (!user) {
      toast.error("Please log in to save for later");
      navigate("/login");
      return;
    }

    setTogglingFavorite(true);
    try {
      if (city) {
        // Check if already saved for later
        const isAlreadySaved = isFavorite;
        
        if (!isAlreadySaved) {
          const newFavoriteId = await addFavoriteDestination({
            destinationId: city.id,
            name: city.name,
            country: city.country,
            imageUrl: destinationData.image
          });
          setIsFavorite(true);
          setFavoriteId(newFavoriteId);
          toast.success("Destination saved for later!");
        } else {
          toast.info("Destination already saved!");
        }
      }
    } catch (error) {
      toast.error("Failed to save for later");
      console.error("Error saving for later:", error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="animate-pulse">
              <div className="h-8 bg-secondary rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-secondary rounded mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-6 bg-secondary rounded w-1/2"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-secondary rounded"></div>
                    <div className="h-4 bg-secondary rounded w-5/6"></div>
                    <div className="h-4 bg-secondary rounded w-4/6"></div>
                  </div>
                </div>
                <div>
                  <div className="h-64 bg-secondary rounded"></div>
                </div>
              </div>
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
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              ← Back to Explore
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {city?.name || destinationData.name}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {city?.country || destinationData.country}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-medium">{destinationData.rating}</span>
                  <span className="text-muted-foreground">({destinationData.reviews.toLocaleString()} reviews)</span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleFavorite}
                  disabled={togglingFavorite}
                >
                  {togglingFavorite ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-red-500" : ""}`} />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-96"
          >
            <img 
              src={destinationData.image} 
              alt={destinationData.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl font-bold">Discover {destinationData.name}</h2>
              <p className="text-lg">{destinationData.bestTime}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h2 className="text-2xl font-bold mb-4">About {destinationData.name}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {destinationData.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {destinationData.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  onClick={handlePlanTrip}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Plan Your Trip
                </Button>
              </Card>

              {/* Map */}
              {city && (
                <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                  <h2 className="text-2xl font-bold mb-4">Location</h2>
                  <DestinationMap 
                    latitude={city.latitude} 
                    longitude={city.longitude} 
                    name={city.name} 
                    country={city.country} 
                  />
                </Card>
              )}

              {/* Top Attractions */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h2 className="text-2xl font-bold mb-4">Top Attractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destinationData.attractions.map((attraction, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/map?attraction=${encodeURIComponent(attraction)}`)}
                    >
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{attraction}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Practical Information */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h2 className="text-2xl font-bold mb-4">Practical Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Euro className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{destinationData.currency}</p>
                      <p className="text-xs text-muted-foreground">{destinationData.currencyRate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="font-medium">{destinationData.language}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timezone</p>
                      <p className="font-medium">{destinationData.timezone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Time to Visit</p>
                      <p className="font-medium">{destinationData.bestTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Population</p>
                      <p className="font-medium">{destinationData.population}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">{destinationData.area}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Travel Tips */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h2 className="text-2xl font-bold mb-4">Travel Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Number</p>
                      <p className="font-medium">{destinationData.emergency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Electricity</p>
                      <p className="font-medium">{destinationData.electricity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Navigation className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Driving Side</p>
                      <p className="font-medium">{destinationData.drivingSide}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Requirements</p>
                      <p className="font-medium">{destinationData.visa}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Euro className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipping</p>
                      <p className="font-medium">{destinationData.tipping}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Highlights */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h2 className="text-2xl font-bold mb-4">Why Visit {destinationData.name}?</h2>
                <ul className="space-y-3">
                  {destinationData.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-1 rounded-full mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather */}
              {city && (
                <WeatherCard 
                  latitude={city.latitude} 
                  longitude={city.longitude} 
                  locationName={`${city.name}, ${city.country}`} 
                />
              )}

              {/* Quick Actions */}
              <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={toggleFavorite}
                    disabled={togglingFavorite}
                  >
                    {togglingFavorite ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current text-red-500" : ""}`} />
                    )}
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleShareDestination}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Destination
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleSaveForLater}
                    disabled={togglingFavorite}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {isFavorite ? "Saved for Later" : "Save for Later"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;