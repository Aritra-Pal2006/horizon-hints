import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MapExplorer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with token from env
    const initMap = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-mapbox-token");
        if (data?.token) {
          mapboxgl.accessToken = data.token;
          
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [0, 20],
            zoom: 2,
            projection: { name: "globe" },
          });

          map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
          map.current.addControl(new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
          }), "top-right");
        }
      } catch (error) {
        console.error("Map init error:", error);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  const searchPlaces = async () => {
    if (!searchQuery.trim() || !map.current) return;

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("search-places", {
        body: { query: searchQuery },
      });

      if (error) throw error;

      // Clear existing markers
      markers.forEach((m) => m.remove());
      setMarkers([]);

      if (data?.results && data.results.length > 0) {
        const newMarkers: mapboxgl.Marker[] = [];
        
        data.results.forEach((place: any) => {
          const { lat, lng } = place.geocodes.main;
          
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm mb-1">${place.name}</h3>
              <p class="text-xs text-gray-600">${place.location.formatted_address}</p>
            </div>
          `);

          const marker = new mapboxgl.Marker({ color: "#0ea5e9" })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          newMarkers.push(marker);
        });

        setMarkers(newMarkers);

        // Fly to first result
        const firstPlace = data.results[0];
        map.current.flyTo({
          center: [firstPlace.geocodes.main.lng, firstPlace.geocodes.main.lat],
          zoom: 14,
          duration: 2000,
        });

        toast.success(`Found ${data.results.length} places`);
      } else {
        toast.info("No places found");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      const msg = typeof error?.message === "string" ? error.message : "";
      if (msg.includes("401")) {
        toast.error("Foursquare API key is invalid (401). Please update it in Backend Secrets.");
      } else {
        toast.error("Failed to search places");
      }
    } finally {
      setIsSearching(false);
    }
  };

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
                  placeholder="Search attractions, restaurants..."
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
          </Card>

          {/* Map Container */}
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </motion.div>
      </div>
    </div>
  );
};

export default MapExplorer;
