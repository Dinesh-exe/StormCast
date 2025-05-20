const NEWS_API_KEY = "5b6355b7-194a-4086-954f-4a6abc7fbc82"; // Replace with your API key
const BASE_URL = "https://eventregistry.org/api/v1/article/getArticles";

interface Source {
  uri: string;
  dataType: string;
  title: string;
}

interface Concept {
  uri: string;
  type: string;
  score: number;
  label: {
    eng: string;
  };
  location?: {
    type: string;
    label: {
      eng: string;
    };
    country?: {
      type: string;
      label: {
        eng: string;
      };
    };
  };
}

export interface NewsArticle {
  uri: string;
  lang: string;
  isDuplicate: boolean;
  date: string;
  time: string;
  dateTime: string;
  dateTimePub: string;
  dataType: string;
  url: string;
  title: string;
  body: string;
  source: Source;
  authors: string[];
  concepts: Concept[];
  image?: string;
  sentiment: number;
  relevance: number;
}

interface NewsResponse {
  articles: {
    results: NewsArticle[];
    totalResults: number;
    page: number;
    count: number;
    pages: number;
  };
}

export const getNewsByCategory = async (
  searchQuery: string,
  page: number
): Promise<NewsArticle[]> => {
  try {
    const requestBody = {
      action: "getArticles",
      keyword: searchQuery,
      sourceLocationUri: ["http://en.wikipedia.org/wiki/India"],
      lang: "eng",
      conceptLang: ["eng", "tam"],
      ignoreSourceGroupUri: "",
      articlesPage: page,
      articlesCount: 20,
      articlesSortBy: "date",
      articlesSortByAsc: false,
      dataType: ["news"],
      forceMaxDataTimeWindow: 31,
      resultType: "articles",
      apiKey: NEWS_API_KEY,
      source: ["place", "country"],
      prefix: "India",
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: NewsResponse = await response.json();

    if (data.articles.results.length > 0) {
      return data.articles.results;
    }

    return [];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export default getNewsByCategory;
