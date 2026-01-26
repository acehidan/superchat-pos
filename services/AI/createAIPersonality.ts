import axios from "../axios";
import { AIPersonality } from "./fetchAIPersonalities";

interface CreatePersonalityRequest {
  personalityType: string;
  name: string;
  gender: "male" | "female" | "other";
  personalityDescription: string;
  rules: string;
  isActive: boolean;
}

interface CreatePersonalityResponse {
  success: boolean;
  message: string;
  data?: AIPersonality;
}

export const createAIPersonality = async (
  data: CreatePersonalityRequest,
): Promise<CreatePersonalityResponse> => {
  try {
    const response = await axios.post("personalities", data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating AI personality:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to create AI personality",
    };
  }
};
