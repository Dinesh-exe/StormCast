import { useCallback, useEffect, useState } from "react";
import { NewsArticle } from "../services/newsService";
import { getCurrentWeather } from "../services/weatherService";
import { useLocation } from "./useLocation";

type WeatherCondition = "cold" | "hot" | "cool";

const getWeatherCondition = (temperature: number): WeatherCondition => {
  if (temperature <= 10) return "cold";
  if (temperature >= 25) return "hot";
  return "cool";
};

const filterNewsByWeather = (
  articles: NewsArticle[],
  condition: WeatherCondition
): NewsArticle[] => {
  return articles.filter((article) => {
    const sentiment = article.sentiment;
    switch (condition) {
      case "cold":
        // Show depressing news (negative sentiment)
        return sentiment < -0.2;
      case "hot":
        // Show fear-related news (very negative sentiment)
        return sentiment < -0.5;
      case "cool":
        // Show positive news (positive sentiment)
        return sentiment > 0.2;
      default:
        return true;
    }
  });
};

export const useWeatherBasedNews = (articles: NewsArticle[]) => {
  const { location } = useLocation();
  const [weatherCondition, setWeatherCondition] =
    useState<WeatherCondition>("cool");
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>(articles);

  const updateWeatherCondition = useCallback(async () => {
    if (!location) return;

    try {
      const weather = await getCurrentWeather(
        location.latitude,
        location.longitude
      );
      const condition = getWeatherCondition(weather.temperature);
      setWeatherCondition(condition);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  }, [location]);

  useEffect(() => {
    updateWeatherCondition();
  }, []);

  useEffect(() => {
    setFilteredNews(filterNewsByWeather(articles, weatherCondition));
  }, [articles, weatherCondition]);

  return {
    filteredNews,
    weatherCondition,
  };
};

export default useWeatherBasedNews;
