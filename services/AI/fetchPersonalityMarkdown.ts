import axios from "../axios";

export interface PersonalityMarkdown {
  markdown: string;
  personality: {
    id: string;
    personalityType: string;
    name: string;
    gender: string;
    personalityDescription: string;
    rules: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  cached: boolean;
}

interface FetchPersonalityMarkdownResponse {
  success: boolean;
  message: string;
  data: PersonalityMarkdown;
}

export const fetchPersonalityMarkdown =
  async (): Promise<FetchPersonalityMarkdownResponse> => {
    try {
      const response = await axios.get("personalities/active/markdown");
      return {
        success: true,
        message: "Personality markdown fetched successfully",
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Error fetching personality markdown:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to fetch personality markdown",
        data: {} as PersonalityMarkdown,
      };
    }
  };
