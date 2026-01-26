import axios from "../axios";
import { AIPersonality } from "./fetchAIPersonalities";

interface UpdatePersonalityRequest {
  personalityType: string;
  name: string;
  gender: "male" | "female" | "other";
  personalityDescription: string;
  rules: string;
  isActive: boolean;
}

interface UpdatePersonalityResponse {
  success: boolean;
  message: string;
  data?: AIPersonality;
}

export const updateAIPersonality = async (
  id: string,
  data: UpdatePersonalityRequest,
): Promise<UpdatePersonalityResponse> => {
  try {
    const response = await axios.patch(`personalities/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating AI personality:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update AI personality",
    };
  }
};
