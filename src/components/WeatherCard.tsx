import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { fetchCurrentWeather, fetchWeatherForecast, WeatherData, ForecastData } from "@/utils/weatherService";
import { Cloud, Droplets, Wind, Sunrise, Sunset } from "lucide-react";
import { format } from "date-fns";

interface WeatherCardProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

const WeatherCard = ({ latitude, longitude, locationName }: WeatherCardProps) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const [weatherData, forecastData] = await Promise.all([
          fetchCurrentWeather(latitude, longitude),
          fetchWeatherForecast(latitude, longitude)
        ]);
        
        setCurrentWeather(weatherData);
        setForecast(forecastData);
        setError(null);
      } catch (err) {
        setError("Failed to load weather data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeatherData();
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-secondary rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-secondary rounded"></div>
            <div className="h-16 bg-secondary rounded"></div>
            <div className="h-16 bg-secondary rounded"></div>
            <div className="h-16 bg-secondary rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !currentWeather) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
        <p className="text-center text-muted-foreground">{error || "Weather data unavailable"}</p>
      </Card>
    );
  }

  const getWeatherIconUrl = (iconCode: string) => 
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-card/80 border-border">
      <h3 className="text-xl font-bold mb-2">Weather in {locationName}</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold">{currentWeather.temp}°C</div>
          <div className="text-muted-foreground capitalize">{currentWeather.description}</div>
        </div>
        <img 
          src={getWeatherIconUrl(currentWeather.icon)} 
          alt={currentWeather.description}
          className="w-16 h-16"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Droplets className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm text-muted-foreground">Humidity</div>
            <div className="font-medium">{currentWeather.humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Wind className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm text-muted-foreground">Wind</div>
            <div className="font-medium">{currentWeather.wind_speed} m/s</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Sunrise className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm text-muted-foreground">Sunrise</div>
            <div className="font-medium">{formatTime(currentWeather.sunrise)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Sunset className="w-5 h-5 text-primary" />
          <div>
            <div className="text-sm text-muted-foreground">Sunset</div>
            <div className="font-medium">{formatTime(currentWeather.sunset)}</div>
          </div>
        </div>
      </div>

      {forecast.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-2 bg-secondary/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  {index === 0 ? "Today" : format(new Date(day.date), "EEE")}
                </div>
                <img 
                  src={getWeatherIconUrl(day.icon)} 
                  alt={day.description}
                  className="w-8 h-8 mx-auto"
                />
                <div className="font-medium">{day.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WeatherCard;