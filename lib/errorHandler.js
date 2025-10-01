/**
 * Global Error Handler
 * Filters out technical errors and shows user-friendly messages
 */

// Store original console.error to preserve it
const originalConsoleError = console.error;

// Override console.error to filter technical errors
console.error = (...args) => {
  const errorMessage = args.join(" ");

  // Check if this is a technical error that should be filtered
  if (
    errorMessage.includes("ReadableStream") ||
    errorMessage.includes("Expected undefined") ||
    errorMessage.includes("Circular") ||
    errorMessage.includes("_controlledReadableByteStream") ||
    errorMessage.includes("_queue") ||
    errorMessage.includes("_pullAlgorithm")
  ) {
    // Log as warning instead of error to reduce noise
    console.warn("Technical error (filtered):", ...args);
    return;
  }

  // For all other errors, use the original console.error
  originalConsoleError.apply(console, args);
};

// Global error handler for unhandled errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const errorMessage = event.error?.message || event.message || "";

    // Filter out technical errors from global error handler
    if (
      errorMessage.includes("ReadableStream") ||
      errorMessage.includes("Expected undefined") ||
      errorMessage.includes("Circular") ||
      errorMessage.includes("_controlledReadableByteStream") ||
      errorMessage.includes("_queue") ||
      errorMessage.includes("_pullAlgorithm")
    ) {
      console.warn("Global technical error (filtered):", event.error);
      event.preventDefault(); // Prevent default error handling
      return;
    }
  });

  // Global handler for unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const errorMessage =
      event.reason?.message || event.reason?.toString() || "";

    // Filter out technical errors from promise rejections
    if (
      errorMessage.includes("ReadableStream") ||
      errorMessage.includes("Expected undefined") ||
      errorMessage.includes("Circular") ||
      errorMessage.includes("_controlledReadableByteStream") ||
      errorMessage.includes("_queue") ||
      errorMessage.includes("_pullAlgorithm")
    ) {
      console.warn(
        "Promise rejection technical error (filtered):",
        event.reason
      );
      event.preventDefault(); // Prevent default error handling
      return;
    }
  });
}

export default {
  // Function to check if an error should be hidden from users
  isTechnicalError: (error) => {
    const errorMessage = error?.message || error?.toString() || "";
    return (
      errorMessage.includes("ReadableStream") ||
      errorMessage.includes("Expected undefined") ||
      errorMessage.includes("Circular") ||
      errorMessage.includes("_controlledReadableByteStream") ||
      errorMessage.includes("_queue") ||
      errorMessage.includes("_pullAlgorithm")
    );
  },

  // Function to get user-friendly error message
  getUserFriendlyMessage: (
    error,
    defaultMessage = "Something went wrong. Please try again."
  ) => {
    if (isTechnicalError(error)) {
      return defaultMessage;
    }
    return error?.message || defaultMessage;
  },
};
