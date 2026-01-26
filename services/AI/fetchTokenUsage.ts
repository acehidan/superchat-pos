import axios from "../axios";

export interface TokenUsage {
  id: string;
  pageId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenUsagePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TokenUsageStatistics {
  totalRecords: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgTokensPerRecord: number;
}

export interface TokenUsageResponse {
  success: boolean;
  data: TokenUsage[];
  pagination: TokenUsagePagination;
  statistics: TokenUsageStatistics;
  message: string;
}

export const fetchTokenUsage = async (): Promise<TokenUsageResponse> => {
  try {
    const response = await axios.get("token-usage");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching token usage:", error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 100,
      },
      statistics: {
        totalRecords: 0,
        totalTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        avgTokensPerRecord: 0,
      },
      message: error.response?.data?.message || "Failed to fetch token usage",
    };
  }
};
