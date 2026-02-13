// Facebook authentication utilities for messenger features

export interface FacebookAuthData {
  token: string | null;
}

/**
 * Get Facebook authentication data from localStorage
 * @returns Facebook token and pageId
 */
export const getFacebookAuthData = (): FacebookAuthData => {
  const token = localStorage.getItem("facebookToken");

  return {
    token,
  };
};

/**
 * Check if Facebook authentication is available
 * @returns true if both token and pageId are present
 */
export const isFacebookAuthenticated = (): boolean => {
  const { token } = getFacebookAuthData();
  return !!token;
};

/**
 * Clear Facebook authentication data from localStorage
 */
export const clearFacebookAuth = (): void => {
  localStorage.removeItem("facebookToken");
};

/**
 * Get authorization header for Facebook API requests
 * @returns Authorization header object or empty object
 */
export const getFacebookAuthHeader = (): Record<string, string> => {
  const { token } = getFacebookAuthData();

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
};
