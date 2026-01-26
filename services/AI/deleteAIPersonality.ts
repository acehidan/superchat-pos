import axios from "../axios";

interface DeletePersonalityResponse {
  success: boolean;
  message: string;
}

export const deleteAIPersonality = async (
  id: string,
): Promise<DeletePersonalityResponse> => {
  try {
    const response = await axios.delete(`personalities/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting AI personality:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to delete AI personality",
    };
  }
};
