import React from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEWS_CATEGORIES, useSettings } from "../context/SettingsContext";

export default function ProfileScreen() {
  const {
    isCelsius,
    toggleTemperatureUnit,
    selectedCategories,
    toggleCategory,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {/* Temperature Unit Setting */}
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Temperature Unit</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Celsius</Text>
              <Switch value={isCelsius} onValueChange={toggleTemperatureUnit} />
            </View>
          </View>

          {/* News Categories */}
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>News Categories</Text>
            {NEWS_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryItem}
                onPress={() => toggleCategory(category)}
              >
                <Text style={styles.categoryText}>{category}</Text>
                <Switch
                  value={selectedCategories[category]}
                  onValueChange={() => toggleCategory(category)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  settingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 16,
    color: "#666",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
});
