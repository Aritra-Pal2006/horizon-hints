import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, MapPin, Loader2, Navigation, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Foursquare API configuration
const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;

const MapExplorer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

    // Initialize map with better error handling
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [0, 20],
        zoom: 2,
        attributionControl: false
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      
      map.current.addControl(geolocate, "top-right");

      // Handle successful geolocation
      geolocate.on("geolocate", (position: any) => {
        const { longitude, latitude } = position.coords;
        map.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
        toast.success("Located your position");
      });

      // Handle geolocation errors
      geolocate.on("error", () => {
        toast.error("Unable to get your location");
      });

      // Handle map load
      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapError(null);
        
        // Check for destination or attraction parameter
        const destination = searchParams.get("destination");
        const attraction = searchParams.get("attraction");
        
        if (destination) {
          setSearchQuery(destination);
          // Small delay to ensure map is fully ready
          setTimeout(() => {
            searchPlacesForDestination(destination);
          }, 500);
        } else if (attraction) {
          setSearchQuery(attraction);
          // Small delay to ensure map is fully ready
          setTimeout(() => {
            searchPlacesForDestination(attraction);
          }, 500);
        }
      });

      // Handle map errors
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        setMapError("Failed to load map. Please check your Mapbox token configuration.");
        toast.error("Map error occurred. Check console for details.");
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setMapError("Failed to initialize map. Please check your Mapbox token configuration.");
      toast.error("Failed to initialize map");
    }

    // Clean up
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

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

  const searchPlacesForDestination = async (destination: string) => {
    if (!map.current || mapError) return;

    setIsSearching(true);
    
    try {
      // Use Mapbox Geocoding API
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${mapboxgl.accessToken}&limit=1`;
      
      const response = await fetch(geocodeUrl);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name;
        
        // Fly to location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000
        });
        
        // Add a marker for the destination
        clearMarkers();
        const marker = new mapboxgl.Marker({ color: "#ff0000" })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`))
          .addTo(map.current);
        
        setMarkers([marker]);
        
        // Search for places after map movement
        setTimeout(() => {
          searchPlacesInArea(lat, lng);
        }, 2000);
      } else {
        toast.error("Destination not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to find destination");
    } finally {
      setIsSearching(false);
    }
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
  };

  const searchPlacesInArea = async (lat: number, lng: number) => {
    if (mapError) return;
    
    setIsSearching(true);
    
    try {
      const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=5000&limit=15`;

      const response = await fetch(url, {
        headers: {
          "Authorization": FOURSQUARE_API_KEY,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`);
      }

      const data = await response.json();

      clearMarkers();

      if (data?.results && data.results.length > 0) {
        const newMarkers: mapboxgl.Marker[] = [];
        
        data.results.forEach((place: any) => {
          // Skip places without geocodes
          if (!place.geocodes?.main) return;
          
          const { lat, lng } = place.geocodes.main;
          
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2 max-w-xs">
              <h3 class="font-bold text-sm mb-1">${place.name || 'Unnamed Place'}</h3>
              ${place.location?.formatted_address ? `<p class="text-xs text-gray-600 mb-1">${place.location.formatted_address}</p>` : ''}
              ${place.categories?.[0] ? `<p class="text-xs text-gray-500">${place.categories[0].name}</p>` : ""}
            </div>
          `);

          const marker = new mapboxgl.Marker({ color: "#0ea5e9" })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        toast.success(`Found ${newMarkers.length} places`);
      } else {
        toast.info("No places found in this area");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search places");
    } finally {
      setIsSearching(false);
    }
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim() || !map.current || mapError) return;

    setIsSearching(true);
    
    try {
      // Use Mapbox Geocoding API
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&limit=1`;
      
      const response = await fetch(geocodeUrl);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name;
        
        // Fly to location
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000
        });
        
        // Add a marker for the location
        clearMarkers();
        const marker = new mapboxgl.Marker({ color: "#ff0000" })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${placeName}</h3>`))
          .addTo(map.current);
        
        setMarkers([marker]);
        
        // Search for places after map movement
        setTimeout(() => {
          searchPlacesInArea(lat, lng);
        }, 2000);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to find location");
    } finally {
      setIsSearching(false);
    }
  };

  const searchNearby = async () => {
    if (!map.current || mapError) return;

    setIsSearching(true);
    
    try {
      const center = map.current.getCenter();
      await searchPlacesInArea(center.lat, center.lng);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search nearby places");
    } finally {
      setIsSearching(false);
    }
  };

  // Show error message if map failed to load
  if (mapError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 h-[calc(100vh-5rem)] flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Map Loading Error</h2>
            <p className="text-muted-foreground mb-4">
              {mapError}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              To fix this issue:
            </p>
            <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2">
              <li>1. Sign up for a free account at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
              <li>2. Get your access token from your <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mapbox account</a></li>
              <li>3. Update the <code className="bg-muted px-1 py-0.5 rounded text-xs">VITE_MAPBOX_TOKEN</code> in your <code className="bg-muted px-1 py-0.5 rounded text-xs">.env</code> file</li>
              <li>4. Restart the development server</li>
            </ul>
            <div className="flex flex-col gap-2">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="outline" onClick={() => window.open("https://account.mapbox.com/access-tokens/", "_blank")}>
                Get Mapbox Token
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[calc(100vh-5rem)]"
        >
          {/* Search Bar */}
          <Card className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md backdrop-blur-xl bg-card/90 border-border p-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
                  className="pl-10 bg-background"
                />
              </div>
              <Button
                onClick={searchPlaces}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={searchNearby}
                disabled={isSearching}
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Nearby
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { longitude, latitude } = position.coords;
                        if (map.current) {
                          map.current.flyTo({ center: [longitude, latitude], zoom: 14 });
                        }
                      },
                      () => toast.error("Unable to get your location")
                    );
                  }
                }}
                disabled={isSearching}
              >
                My Location
              </Button>
            </div>
          </Card>

          {/* Map Container */}
          <div ref={mapContainer} className="w-full h-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default MapExplorer;