import axios from "../axios";

interface TogglePersonalityResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const togglePersonalityActivation = async (
  id: string
): Promise<TogglePersonalityResponse> => {
  try {
    const response = await axios.post(`personalities/${id}/activate`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling personality activation:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to toggle personality activation",
    };
  }
};
