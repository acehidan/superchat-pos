import axios from "../axios";

interface DeleteIntentResponse {
  success: boolean;
  message: string;
}

export const deleteIntent = async (
  id: string
): Promise<DeleteIntentResponse> => {
  try {
    const response = await axios.delete(`intents-validation/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting intent:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete intent",
    };
  }
};
