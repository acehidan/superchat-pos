import axios from "../axios";
import { IntentValidation } from "./fetchIntents";

interface UpdateIntentRequest {
  intentType: string;
  validationPrompt: string;
  keywords: {
    english: string[];
    burmese: string[];
  };
  patterns: {
    english: string[];
    burmese: string[];
  };
  strongPatterns: {
    english: string[];
    burmese: string[];
  };
  description: string;
}

interface UpdateIntentResponse {
  success: boolean;
  message: string;
  data?: IntentValidation;
}

export const updateIntent = async (
  id: string,
  data: UpdateIntentRequest
): Promise<UpdateIntentResponse> => {
  try {
    const response = await axios.patch(`intents-validation/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating intent:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update intent",
    };
  }
};
