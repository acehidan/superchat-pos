import axios from "../axios";
import { IntentValidation } from "./fetchIntents";

interface CreateIntentRequest {
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

interface CreateIntentResponse {
  success: boolean;
  message: string;
  data?: IntentValidation;
}

export const createIntent = async (
  data: CreateIntentRequest
): Promise<CreateIntentResponse> => {
  try {
    const response = await axios.post("intents-validation", data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating intent:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create intent",
    };
  }
};
