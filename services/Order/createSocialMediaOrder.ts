import axios from "../axios";
import { SocialMediaOrderRequest } from "../../types";

interface CreateSocialMediaOrderResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const createSocialMediaOrder = async (
  data: SocialMediaOrderRequest,
): Promise<CreateSocialMediaOrderResponse> => {
  console.log("Creating social media order:", data);
  try {
    const response = await axios.post("/social-media-sale-order", data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating social media order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create social media order",
    };
  }
};
