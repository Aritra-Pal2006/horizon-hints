const GEODB_API_KEY = import.meta.env.VITE_GEODB_API_KEY;
const GEODB_BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const searchCities = async (query: string): Promise<City[]> => {
  try {
    const response = await fetch(
      `${GEODB_BASE_URL}/cities?namePrefix=${encodeURIComponent(query)}&limit=10&sort=-population`,
      {
        headers: {
          "X-RapidAPI-Key": GEODB_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }
    
    const data = await response.json();
    
    return data.data.map((city: any) => ({
      id: city.id,
      name: city.name,
      region: city.region || "",
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
    }));
  } catch (error) {
    console.error("Error searching cities:", error);
    throw error;
  }
};

export const getCityDetails = async (cityId: string): Promise<City> => {
  try {
    const response = await fetch(
      `${GEODB_BASE_URL}/cities/${cityId}`,
      {
        headers: {
          "X-RapidAPI-Key": GEODB_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch city details");
    }
    
    const data = await response.json();
    
    return {
      id: data.data.id,
      name: data.data.name,
      region: data.data.region || "",
      country: data.data.country,
      latitude: data.data.latitude,
      longitude: data.data.longitude,
    };
  } catch (error) {
    console.error("Error fetching city details:", error);
    throw error;
  }
};