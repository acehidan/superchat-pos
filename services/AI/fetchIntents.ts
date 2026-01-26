import axios from "../axios";

export interface IntentKeywords {
  english: string[];
  burmese: string[];
}

export interface IntentPatterns {
  english: string[];
  burmese: string[];
}

export interface IntentValidation {
  id: string;
  intentType: string;
  validationPrompt: string;
  keywords: IntentKeywords;
  patterns: IntentPatterns;
  strongPatterns: IntentPatterns;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface FetchIntentsResponse {
  success: boolean;
  message: string;
  data: IntentValidation[];
  count: number;
}

export const fetchIntents = async (): Promise<FetchIntentsResponse> => {
  try {
    const response = await axios.get("intents-validation");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching intents:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch intents",
      data: [],
      count: 0,
    };
  }
};
