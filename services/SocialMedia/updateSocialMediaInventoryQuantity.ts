import axios from "../axios";

export interface UpdateSocialMediaInventoryQuantityPayload {
  quantityChange: number;
  reason: string;
}

interface UpdateSocialMediaInventoryQuantityResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const updateSocialMediaInventoryQuantity = async (
  id: string,
  payload: UpdateSocialMediaInventoryQuantityPayload,
): Promise<UpdateSocialMediaInventoryQuantityResponse> => {
  try {
    const response = await axios.patch(
      `/social-inventory/${id}`,
      payload,
    );
    return {
      success: true,
      message: "Social media inventory quantity updated successfully",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error updating social media inventory quantity:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update social media inventory quantity",
    };
  }
};
