import axios from "../axios";

export interface AIPersonality {
  id: string;
  personalityType: string;
  name: string;
  gender: "male" | "female" | "other";
  personalityDescription: string;
  rules: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FetchPersonalitiesResponse {
  success: boolean;
  message: string;
  data: AIPersonality[];
}

export const fetchAIPersonalities =
  async (): Promise<FetchPersonalitiesResponse> => {
    try {
      const response = await axios.get("personalities");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching AI personalities:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch AI personalities",
        data: [],
      };
    }
  };
