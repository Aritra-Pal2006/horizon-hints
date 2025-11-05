const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastData {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

export const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind_speed: data.wind.speed,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

export const fetchWeatherForecast = async (lat: number, lon: number): Promise<ForecastData[]> => {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }
    
    const data = await response.json();
    
    // Group forecast by day and get midday forecast
    const dailyForecasts: Record<string, any> = {};
    
    data.list.forEach((forecast: any) => {
      const date = forecast.dt_txt.split(" ")[0];
      const hour = parseInt(forecast.dt_txt.split(" ")[1].split(":")[0]);
      
      // Prefer midday forecasts (around 12:00)
      if (hour >= 11 && hour <= 14) {
        if (!dailyForecasts[date] || hour === 12) {
          dailyForecasts[date] = forecast;
        }
      } else if (!dailyForecasts[date]) {
        dailyForecasts[date] = forecast;
      }
    });
    
    return Object.values(dailyForecasts).slice(0, 5).map((forecast: any) => ({
      date: forecast.dt_txt.split(" ")[0],
      temp: Math.round(forecast.main.temp),
      description: forecast.weather[0].description,
      icon: forecast.weather[0].icon,
    }));
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    throw error;
  }
};