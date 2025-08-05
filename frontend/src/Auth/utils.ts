import axios from "axios";

interface ApiErrorResponse {
  message: string[]; // We expect an array of strings
  error: string;
  statusCode: number;
}

/**
 * Parses a caught error and returns a user-friendly error string.
 * Each error message is prefixed with a bullet point (•).
 * @param err The caught error, expected to be of type `unknown`.
 * @returns A formatted error string.
 */
export function handleAuthError(err: unknown) {
  let errorMessage = "An unexpected error occurred.";

  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    // Check if the error has a response from the server
    if (
      err.response &&
      err.response.data &&
      Array.isArray(err.response.data.message)
    ) {
      // Join the array of messages into a single string
      //errorMessage = err.response.data.message.join("\n");

      // 1. Map over each message to add a bullet point
      // 2. Join them with a newline character
      errorMessage = err.response.data.message
        .map((msg) => `• ${msg}`)
        .join("\n");
    } else if (err.response && typeof err.response.data.message === "string") {
      // Fallback if the API sometimes sends a single string
      //errorMessage = err.response.data.message;

      errorMessage = `• ${err.response.data.message}`;
    } else if (err.message) {
      // Fallback to the generic axios error message
      //errorMessage = err.message;

      errorMessage = `• ${err.message}`;
    }
  } else if (err instanceof Error) {
    // Handle standard JavaScript errors
    //errorMessage = err.message;

    errorMessage = `• ${err.message}`;
  }

  return errorMessage;
}
