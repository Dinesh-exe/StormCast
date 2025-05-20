import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NEWS_CATEGORIES, useSettings } from "../context/SettingsContext";
import { useWeatherBasedNews } from "../hooks/useWeatherBasedNews";
import { getNewsByCategory, NewsArticle } from "../services/newsService";

const NewsItem = memo(
  ({
    article,
    onPress,
  }: {
    article: NewsArticle;
    onPress: (url: string) => void;
  }) => {
    return (
      <TouchableOpacity
        style={styles.newsItem}
        onPress={() => onPress(article.url)}
      >
        {article.image ? (
          <Image
            source={{ uri: article?.image }}
            style={styles.newsImage}
            resizeMode="cover"
            resizeMethod="resize"
          />
        ) : (
          <Image
            source={require("../../assets/images/news.jpg")}
            style={styles.newsImage}
            resizeMode="cover"
            resizeMethod="resize"
          />
        )}
        <View style={styles.newsInfoContainer}>
          <Text style={styles.newsCategory}>{article.source.title}</Text>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {article.title}
          </Text>
          <View style={styles.newsMetaRow}>
            <Text style={styles.newsDate}>
              {article.dateTimePub
                ? new Date(article.dateTimePub).toLocaleDateString()
                : ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);
NewsItem.displayName = "NewsItem";

export default function NewsScreen() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { selectedCategories } = useSettings();

  // Get enabled categories for the header
  const enabledCategories = NEWS_CATEGORIES.filter(
    (category) => selectedCategories[category]
  );

  // If no categories are enabled, show "All"
  const displayCategories =
    enabledCategories.length > 0 ? enabledCategories : ["All"];

  const { filteredNews, weatherCondition } = useWeatherBasedNews(news);

  const fetchNews = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        // Use the selected category from the news screen
        const category = selectedCategory === "All" ? "" : selectedCategory;

        const newsData = await getNewsByCategory(category, pageNum);

        if (newsData.length === 0) {
          setHasMore(false);
        } else {
          if (isInitial) {
            setNews(newsData);
          } else {
            setNews((prevNews) => [...prevNews, ...newsData]);
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setErrorMsg("Error fetching news");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchNews(1, true);
    setPage(1);
    setHasMore(true);
  }, [selectedCategory]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage);
    }
  }, [loadingMore, hasMore, page]);

  const handleNewsPress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderNewsItem = useCallback(
    ({ item }: { item: NewsArticle }) => (
      <NewsItem article={item} onPress={handleNewsPress} />
    ),
    [handleNewsPress]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [loadingMore]);

  const keyExtractor = useCallback((item: NewsArticle) => item.uri, []);

  const getWeatherIcon = () => {
    switch (weatherCondition) {
      case "cold":
        return "snow";
      case "hot":
        return "sunny";
      case "cool":
        return "partly-sunny";
      default:
        return "partly-sunny";
    }
  };

  const getWeatherText = () => {
    switch (weatherCondition) {
      case "cold":
        return "Showing depressing news";
      case "hot":
        return "Showing fear-related news";
      case "cool":
        return "Showing positive news";
      default:
        return "Showing all news";
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.headerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>News from all around the world</Text>
        </View>

        {/* Weather Indicator */}
        <View style={styles.weatherIndicator}>
          <Ionicons name={getWeatherIcon()} size={20} color="#007AFF" />
          <Text style={styles.weatherText}>{getWeatherText()}</Text>
        </View>

        {/* Search Bar */}
        {/* <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#B0B0B0"
            style={{ marginLeft: 12 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#B0B0B0"
            value={search}
            onChangeText={setSearch}
          />
        </View> */}

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {displayCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News List */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlashList
          data={filteredNews.filter((n) =>
            n.title.toLowerCase().includes(search.toLowerCase())
          )}
          renderItem={renderNewsItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={120}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flex: 0,
  },
  header: {
    flex: 0,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#181A20",
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginTop: 4,
  },
  searchBarContainer: {
    flex: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#181A20",
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  categoriesContainer: {
    flex: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: "#246BFD",
  },
  categoryText: {
    color: "#8E8E93",
    fontWeight: "600",
    fontSize: 15,
  },
  categoryTextActive: {
    color: "#fff",
  },
  newsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  newsItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    minHeight: 110,
  },
  newsImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    margin: 12,
    backgroundColor: "#E5E7EB",
  },
  newsInfoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
    paddingRight: 12,
  },
  newsCategory: {
    fontSize: 13,
    color: "#246BFD",
    fontWeight: "600",
    marginBottom: 2,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181A20",
    marginBottom: 8,
  },
  newsMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  newsAuthor: {
    fontSize: 13,
    color: "#181A20",
    fontWeight: "500",
  },
  newsDate: {
    fontSize: 13,
    color: "#8E8E93",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  weatherIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  weatherText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
