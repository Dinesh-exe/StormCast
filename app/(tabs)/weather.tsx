import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { useLocation } from "../hooks/useLocation";
import {
  getCurrentWeather,
  getFiveDayForecast,
} from "../services/weatherService";

export default function WeatherScreen() {
  const { location, errorMsg } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isCelsius } = useSettings();

  const fetchData = async () => {
    if (location) {
      try {
        const units = isCelsius ? 'metric' : 'imperial';
        const weatherData = await getCurrentWeather(
          location.latitude,
          location.longitude,
          units
        );
        const forecastData = await getFiveDayForecast(
          location.latitude,
          location.longitude,
          units
        );
        setWeather(weatherData);

        // Extract one forecast per day
        const daily = [];
        let lastDate = "";
        for (const entry of forecastData) {
          const date = entry.dt_txt.split(" ")[0];
          if (date !== lastDate) {
            daily.push(entry);
            lastDate = date;
          }
        }
        setForecast(daily.slice(0, 5)); // Only 5 days
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [location, isCelsius]); // Refetch when temperature unit changes

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  function getDailySummaries(forecast: any[]): {
    date: string;
    day: string;
    icon: string;
    pop: number;
    max: number;
    min: number;
  }[] {
    // Group by date
    const days: { [date: string]: any[] } = {};
    forecast.forEach((entry: any) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!days[date]) days[date] = [];
      days[date].push(entry);
    });
    // For each day, get min/max temp, first icon, and max pop
    return Object.entries(days)
      .slice(0, 5)
      .map(([date, entries]) => {
        let min = Infinity,
          max = -Infinity,
          icon = (entries as any[])[0].weather[0].icon,
          pop = 0;
        (entries as any[]).forEach((e: any) => {
          min = Math.min(min, e.main.temp_min);
          max = Math.max(max, e.main.temp_max);
          if (e.pop > pop) pop = e.pop;
        });
        return {
          date,
          day: new Date(date).toLocaleDateString(undefined, {
            weekday: "long",
          }),
          icon,
          pop: Math.round(pop * 100),
          max: Math.round(max),
          min: Math.round(min),
        };
      });
  }

  const dailySummaries = getDailySummaries(forecast);

  return (
    <View style={{ flex: 1, backgroundColor: "#e0f7fa" }}>
      {/* Top Image */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.topImage}
        resizeMode="cover"
      />
      {/* Overlay Card */}
      <View style={styles.overlayCard}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-around",
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        >
          <View style={styles.rowCenter}>
            <Text style={styles.cityText}>{weather.city}</Text>
            {/* Weather Icon */}
            {weather.icon ? (
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
                }}
                style={styles.weatherIconImg}
              />
            ) : null}
          </View>

          <View style={styles.rowCenter}>
            <Text style={styles.temperatureBig}>
              {weather ? `${Math.round(weather.temperature)}°${isCelsius ? 'C' : 'F'}` : "--°"}
            </Text>
            <Text style={styles.weatherDesc}>{weather.description}</Text>
          </View>

          {/* Weather Details */}
          <View style={styles.weatherDetailsRow}>
            <Text style={styles.weatherDetail}>
              Humidity: {weather.humidity}%
            </Text>
            <Text style={styles.weatherDetail}>
              Wind: {weather.windSpeed} m/s
            </Text>
            {weather.rain ? (
              <Text style={styles.weatherDetail}>Rain: {weather.rain} mm</Text>
            ) : null}
          </View>
          {/* 5-Day Forecast Vertical List */}
          <View style={styles.forecastCard}>
            {dailySummaries.map((item, idx) => (
              <View key={idx} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>{item.day}</Text>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${item.icon}@2x.png`,
                  }}
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastPop}>{item.pop}%</Text>
                <Text style={styles.forecastTemp}>{item.max}°</Text>
                <Text style={styles.forecastTempMin}>{item.min}°</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  topImage: {
    width: "100%",
    height: 260,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: -40,
  },
  overlayCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 0,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flex: 1,
    justifyContent: "space-around",
  },
  cityText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#222",
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  temperatureBig: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#222",
  },
  weatherIconWrap: {
    backgroundColor: "#e0f7fa",
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
  },
  weatherIconImg: {
    width: 48,
    height: 48,
  },
  weatherDesc: {
    fontSize: 18,
    color: "#666",
  },
  weatherDetailsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  weatherDetail: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 8,
  },
  forecastCard: {},
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  forecastDay: {
    color: "black",
    fontSize: 14,
    flex: 1.5,
  },
  forecastIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  forecastPop: {
    color: "black",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  forecastTemp: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  forecastTempMin: {
    color: "#bbb",
    fontSize: 14,
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
});
