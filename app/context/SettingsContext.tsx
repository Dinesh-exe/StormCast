import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type NewsCategory =
  | "All"
  | "Politic"
  | "Sport"
  | "Education"
  | "Games"
  | "World"
  | "Tech";

export const NEWS_CATEGORIES: NewsCategory[] = [
  "All",
  "Politic",
  "Sport",
  "Education",
  "Games",
  "World",
  "Tech",
];

interface SettingsContextType {
  isCelsius: boolean;
  toggleTemperatureUnit: () => void;
  selectedCategories: Record<NewsCategory, boolean>;
  toggleCategory: (category: NewsCategory) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isCelsius, setIsCelsius] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    Record<NewsCategory, boolean>
  >({
    All: true,
    Politic: false,
    Sport: false,
    Education: false,
    Games: false,
    World: false,
    Tech: false,
  });

  useEffect(() => {
    // Load settings from AsyncStorage
    const loadSettings = async () => {
      try {
        const tempUnit = await AsyncStorage.getItem("temperatureUnit");
        const categories = await AsyncStorage.getItem("newsCategories");

        if (tempUnit) {
          setIsCelsius(tempUnit === "celsius");
        }
        if (categories) {
          setSelectedCategories(JSON.parse(categories));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const toggleTemperatureUnit = async () => {
    const newValue = !isCelsius;
    setIsCelsius(newValue);
    try {
      await AsyncStorage.setItem(
        "temperatureUnit",
        newValue ? "celsius" : "fahrenheit"
      );
    } catch (error) {
      console.error("Error saving temperature unit:", error);
    }
  };

  const toggleCategory = async (category: NewsCategory) => {
    const newCategories = {
      ...selectedCategories,
      [category]: !selectedCategories[category],
    };
    setSelectedCategories(newCategories);
    try {
      await AsyncStorage.setItem(
        "newsCategories",
        JSON.stringify(newCategories)
      );
    } catch (error) {
      console.error("Error saving news categories:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        isCelsius,
        toggleTemperatureUnit,
        selectedCategories,
        toggleCategory,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
