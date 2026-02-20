import axios from "axios";
import {
  getFacebookAuthHeader,
  getFacebookAuthData,
} from "../../utils/facebookAuth";

// Create a separate axios instance for Facebook API calls
const facebookAxios = axios.create();

export interface ToggleAIResponse {
  success: boolean;
  message: string;
  data?: {
    status: "enabled" | "disabled";
    updatedAt: string;
  };
}

export const toggleAIForUser = async (
  psid: string,
  enabled: boolean,
): Promise<ToggleAIResponse> => {
  try {
    // Get Facebook authentication headers and data
    const authHeaders = getFacebookAuthHeader();
    const authData = getFacebookAuthData();

    // Get pageId from localStorage
    const pageId = authData.pageId || localStorage.getItem("facebookPageId");

    if (!pageId) {
      throw new Error(
        "Facebook Page ID not found. Please authenticate with Facebook first.",
      );
    }

    // Make PATCH request using separate axios instance with pageId in body
    const response = await facebookAxios.patch(
      `messenger/users/${psid}/toggle-ai`,
      {
        pageId: pageId,
        enabled: enabled,
      },
      {
        headers: {
          ...authHeaders,
        },
      },
    );

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
