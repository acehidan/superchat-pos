import axios from "../axios";
import { getFacebookAuthHeader } from "../../utils/facebookAuth";

export interface ToggleAIResponse {
  success: boolean;
  message: string;
  data?: {
    status: "enabled" | "disabled";
    updatedAt: string;
  };
}

export const toggleAIForUser = async (
  psid: string
): Promise<ToggleAIResponse> => {
  try {
    // Get Facebook authentication headers
    const authHeaders = getFacebookAuthHeader();
    
    // Make PATCH request to toggle AI for specific user
    const response = await axios.patch(`messenger/users/${psid}/toggle-ai`, {}, {
      headers: {
        ...authHeaders,
      },
    });
    
    return {
      success: true,
      message: "AI status updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error toggling AI for user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to toggle AI for user",
    };
  }
};
