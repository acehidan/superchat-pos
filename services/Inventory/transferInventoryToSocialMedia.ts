import axios from "../axios";

export interface TransferInventoryToSocialMediaPayload {
  inventoryIds: string[];
  sellingGuidePrompt?: string;
  buyingGuidePrompt?: string;
}

interface TransferInventoryToSocialMediaResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Transfer multiple inventory items to social media
 * @param {TransferInventoryToSocialMediaPayload} payload - Transfer payload with inventory IDs
 * @returns {Promise<TransferInventoryToSocialMediaResponse>} Response from API
 */
export const transferInventoryToSocialMedia = async (
  payload: TransferInventoryToSocialMediaPayload
): Promise<TransferInventoryToSocialMediaResponse> => {
  try {
    const response = await axios.post("/social-inventory", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error transferring inventory to social media:", error);

    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.headers["content-type"] &&
        error.response.headers["content-type"].includes("text/html")
      ) {
        throw new Error(
          `API endpoint not found. Please check if the API is running and the endpoint "${error.config?.url}" is correct.`
        );
      }

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
      }

      if (error.request) {
        throw new Error(
          "Network error: Unable to reach the API. Please check if the API server is running."
        );
      }
    }

    throw error;
  }
};
