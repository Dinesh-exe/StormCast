const OPENWEATHER_API_KEY = "e348896c9ccec3635bfd42820e5d67e8"; // Replace with your OpenWeatherMap API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getCurrentWeather = async (
  latitude: number,
  longitude: number,
  units: "metric" | "imperial" = "metric"
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    // Transform the API response
    return {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      condition: data.weather[0]?.main || "",
      description: data.weather[0]?.description || "",
      icon: data.weather[0]?.icon || "",
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      rain: data.rain ? data.rain["1h"] : 0,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

export const getFiveDayForecast = async (
  latitude: number,
  longitude: number,
  units: "metric" | "imperial" = "metric"
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();
    return data.list; // Return the list of forecast entries
  } catch (error) {
    console.error("Error fetching 5-day forecast:", error);
    throw error;
  }
};

export default getCurrentWeather;
