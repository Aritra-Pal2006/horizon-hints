import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { searchCities } from "@/utils/geoDBService";
import { motion, AnimatePresence } from "framer-motion";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface CitySearchProps {
  onCitySelect: (city: City) => void;
  placeholder?: string;
}

const CitySearch = ({ onCitySelect, placeholder = "Search for a city..." }: CitySearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length > 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const cities = await searchCities(query);
      setResults(cities);
      setShowResults(true);
    } catch (error) {
      setResults([]);
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: City) => {
    setQuery(`${city.name}, ${city.country}`);
    setShowResults(false);
    onCitySelect(city);
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShowResults(true)}
          className="pl-10"
        />
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="max-h-60 overflow-y-auto backdrop-blur-xl bg-card/90 border-border shadow-lg">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                results.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer transition-colors"
                    onClick={() => handleSelectCity(city)}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {city.name}
                        {city.region && `, ${city.region}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {city.country}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No cities found
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitySearch;