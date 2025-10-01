/**
 * Pinata IPFS Integration Utilities
 * Handles file uploads and data storage to Pinata IPFS
 */

// ==============================================
// 1. UTILITY FUNCTIONS
// ==============================================

// ==============================================
// 2. PINATA API FUNCTIONS
// ==============================================

/**
 * Upload JSON data to Pinata IPFS
 * @param {any} data - Data object to upload
 * @param {Object} config - Pinata configuration
 * @param {Object} metadata - Optional metadata for the upload
 * @returns {Promise<Object>} Upload response
 */
export async function uploadJSONToPinata(data, config, metadata) {
  try {
    // Validate inputs
    if (!data) {
      throw new Error("Data is required for upload");
    }
    if (!config) {
      throw new Error("Pinata configuration is required");
    }

    // Validate authentication based on auth type
    if (config.authType === "jwt") {
      if (!config.jwt) {
        throw new Error("Pinata JWT token is required");
      }
    } else {
      if (!config.apiKey || !config.apiSecret) {
        throw new Error("Pinata API key and secret are required");
      }
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("Pinata uploads must be performed on the client side");
    }

    // Additional safety check for ReadableStream issues
    if (
      typeof ReadableStream === "undefined" ||
      typeof Response === "undefined"
    ) {
      throw new Error("Browser environment not properly initialized");
    }

    const uploadData = {
      pinataContent: data,
      pinataMetadata: {
        name: metadata?.name || `data-${Date.now()}.json`,
        keyvalues: metadata?.keyvalues || {},
        description: metadata?.description || "",
      },
      pinataOptions: {
        cidVersion: 1,
        wrapWithDirectory: false,
      },
    };

    // Prepare headers based on auth type
    const headers = {
      "Content-Type": "application/json",
    };
    if (config.authType === "jwt") {
      headers["Authorization"] = `Bearer ${config.jwt}`;
    } else {
      headers["pinata_api_key"] = config.apiKey;
      headers["pinata_secret_api_key"] = config.apiSecret;
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(uploadData),
      }
    );

    if (!response.ok) {
      let errorMessage = `Pinata upload failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Pinata API Error Response:", errorData);

        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        } else if (errorData.error) {
          errorMessage = `Pinata error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `Pinata error: ${errorData.message}`;
        }
      } catch (e) {
        console.warn("Could not parse error response:", e);
        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    return {
      success: true,
      cid: result.IpfsHash,
      metadata: {
        filename: metadata?.name,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Pinata JSON upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload JSON to Pinata",
    };
  }
}

/**
 * Upload file to Pinata IPFS
 * @param {File|Blob} file - File or Blob to upload
 * @param {Object} config - Pinata configuration
 * @param {Object} metadata - Optional metadata for the upload
 * @returns {Promise<Object>} Upload response
 */
export async function uploadFileToPinata(file, config, metadata) {
  try {
    // Validate inputs
    if (!file) {
      throw new Error("File is required for upload");
    }
    if (!config) {
      throw new Error("Pinata configuration is required");
    }

    // Validate authentication based on auth type
    if (config.authType === "jwt") {
      if (!config.jwt) {
        throw new Error("Pinata JWT token is required");
      }
    } else {
      if (!config.apiKey || !config.apiSecret) {
        throw new Error("Pinata API key and secret are required");
      }
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("Pinata uploads must be performed on the client side");
    }

    // Use FormData to upload the actual file
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const pinataMetadata = {
      name: metadata?.name || `file-${Date.now()}`,
      keyvalues: metadata?.keyvalues || {},
      description: metadata?.description || "",
    };
    formData.append("pinataMetadata", JSON.stringify(pinataMetadata));

    // Add options
    const pinataOptions = {
      cidVersion: 1,
      wrapWithDirectory: false,
    };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    // Prepare headers based on auth type
    const headers = {};
    if (config.authType === "jwt") {
      headers["Authorization"] = `Bearer ${config.jwt}`;
    } else {
      headers["pinata_api_key"] = config.apiKey;
      headers["pinata_secret_api_key"] = config.apiSecret;
    }

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: headers,
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = `Pinata upload failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Pinata API Error Response:", errorData);

        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        } else if (errorData.error) {
          errorMessage = `Pinata error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `Pinata error: ${errorData.message}`;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        console.warn("Could not parse error response:", e);
        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    return {
      success: true,
      cid: result.IpfsHash,
      metadata: {
        filename: metadata?.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Pinata file upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload file to Pinata",
    };
  }
}

/**
 * Upload user profile data to Pinata
 * @param {any} userData - User profile data
 * @param {Object} config - Pinata configuration
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} Upload response
 */
export async function uploadUserProfileToPinata(
  userData,
  config,
  walletAddress
) {
  console.log("🔧 uploadUserProfileToPinata called with:", {
    userData,
    walletAddress,
    config: {
      authType: config.authType,
      hasJwt: !!config.jwt,
      hasApiKey: !!config.apiKey,
    },
  });

  // Create a cleaner, more readable name
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "unknown";
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  console.log("🔧 Generated name components:", { shortWallet, timestamp });

  const metadata = {
    name: `Profile-${shortWallet}-${timestamp}`,
    keyvalues: {
      type: "user-profile",
      walletAddress: walletAddress,
      version: "3.0",
      storage: "pinata",
    },
    description: `User profile data for wallet ${shortWallet}`,
  };

  console.log("🔧 Final metadata:", metadata);

  return await uploadJSONToPinata(userData, config, metadata);
}

/**
 * Upload NFT metadata to Pinata
 * @param {any} metadata - NFT metadata object
 * @param {Object} config - Pinata configuration
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} Upload response
 */
export async function uploadNFTMetadataToPinata(metadata, config, mintAddress) {
  // Create a cleaner, more readable name for NFT metadata
  const shortMint = mintAddress
    ? `${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`
    : "unknown";
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const pinataMetadata = {
    name: `NFT-${shortMint}-${timestamp}`,
    keyvalues: {
      type: "nft-metadata",
      mintAddress: mintAddress,
      version: "3.0",
      storage: "pinata",
    },
    description: `NFT metadata for mint address ${shortMint}`,
  };

  return await uploadJSONToPinata(metadata, config, pinataMetadata);
}

// ==============================================
// 3. FILE DELETION FUNCTIONS
// ==============================================

/**
 * Delete files from Pinata by their IDs
 * @param {string[]} fileIds - Array of file IDs to delete
 * @param {Object} config - Pinata configuration
 * @returns {Promise<Object>} Delete response
 */
export async function deleteFilesFromPinata(fileIds, config) {
  try {
    // Validate inputs
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error("File IDs array is required for deletion");
    }
    if (!config) {
      throw new Error("Pinata configuration is required");
    }

    // Validate authentication based on auth type
    if (config.authType === "jwt") {
      if (!config.jwt) {
        throw new Error("Pinata JWT token is required");
      }
    } else {
      if (!config.apiKey || !config.apiSecret) {
        throw new Error("Pinata API key and secret are required");
      }
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("Pinata deletions must be performed on the client side");
    }

    console.log("🗑️ Deleting files from Pinata:", fileIds);

    // Prepare headers based on auth type
    const headers = {
      "Content-Type": "application/json",
    };
    if (config.authType === "jwt") {
      headers["Authorization"] = `Bearer ${config.jwt}`;
    } else {
      headers["pinata_api_key"] = config.apiKey;
      headers["pinata_secret_api_key"] = config.apiSecret;
    }

    // For multiple file IDs, we need to delete them one by one
    // since the unpin endpoint only accepts one CID at a time
    const results = [];
    for (const fileId of fileIds) {
      try {
        const response = await fetch(
          `https://api.pinata.cloud/pinning/unpin/${fileId}`,
          {
            method: "DELETE",
            headers: headers,
          }
        );

        if (!response.ok) {
          let errorMessage = `Pinata deletion failed for ${fileId}: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (response.status === 401) {
              errorMessage =
                "Pinata authentication failed. Please check your API credentials.";
            } else if (response.status === 404) {
              errorMessage = `File ${fileId} not found or already deleted`;
            } else if (errorData.error) {
              errorMessage = `Pinata error: ${errorData.error}`;
            } else if (errorData.message) {
              errorMessage = `Pinata error: ${errorData.message}`;
            }
          } catch (e) {
            console.warn("Could not parse error response:", e);
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        results.push({ id: fileId, success: true, result });
      } catch (error) {
        results.push({ id: fileId, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `✅ Deletion completed: ${successCount} successful, ${failureCount} failed`
    );

    return {
      success: failureCount === 0,
      deletedCount: successCount,
      results: results,
    };
  } catch (error) {
    console.error("Pinata file deletion error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete files from Pinata",
    };
  }
}

/**
 * Delete a single file from Pinata by its ID
 * @param {string} fileId - File ID to delete
 * @param {Object} config - Pinata configuration
 * @returns {Promise<Object>} Delete response
 */
export async function deleteFileFromPinata(fileId, config) {
  return await deleteFilesFromPinata([fileId], config);
}

/**
 * Delete file by CID from Pinata using the unpin endpoint
 * @param {string} cid - IPFS Content ID to delete
 * @param {Object} config - Pinata configuration
 * @returns {Promise<Object>} Delete response
 */
export async function deleteFileByCIDFromPinata(cid, config) {
  try {
    console.log("🗑️ Deleting file by CID:", cid);

    // Validate inputs
    if (!cid) {
      throw new Error("CID is required for deletion");
    }
    if (!config) {
      throw new Error("Pinata configuration is required");
    }

    // Validate authentication based on auth type
    if (config.authType === "jwt") {
      if (!config.jwt) {
        throw new Error("Pinata JWT token is required");
      }
    } else {
      if (!config.apiKey || !config.apiSecret) {
        throw new Error("Pinata API key and secret are required");
      }
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error("Pinata deletions must be performed on the client side");
    }

    // Prepare headers based on auth type
    const headers = {};
    if (config.authType === "jwt") {
      headers["Authorization"] = `Bearer ${config.jwt}`;
    } else {
      headers["pinata_api_key"] = config.apiKey;
      headers["pinata_secret_api_key"] = config.apiSecret;
    }

    // Use the correct unpin endpoint with CID
    const response = await fetch(
      `https://api.pinata.cloud/pinning/unpin/${cid}`,
      {
        method: "DELETE",
        headers: headers,
      }
    );

    if (!response.ok) {
      let errorMessage = `Pinata deletion failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Pinata API Error Response:", errorData);

        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        } else if (response.status === 404) {
          errorMessage = "File not found or already deleted";
        } else if (errorData.error) {
          errorMessage = `Pinata error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `Pinata error: ${errorData.message}`;
        }
      } catch (e) {
        console.warn("Could not parse error response:", e);
        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        } else if (response.status === 404) {
          errorMessage = "File not found or already deleted";
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ File deleted successfully by CID:", result);

    return {
      success: true,
      deletedCount: 1,
      result: result,
    };
  } catch (error) {
    console.error("Pinata CID deletion error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete file by CID from Pinata",
    };
  }
}

/**
 * List files from Pinata with optional filters
 * @param {Object} config - Pinata configuration
 * @param {Object} options - Query options (status, pageLimit, etc.)
 * @returns {Promise<Object>} List response
 */
export async function listFilesFromPinata(config, options = {}) {
  try {
    if (!config) {
      throw new Error("Pinata configuration is required");
    }

    // Validate authentication based on auth type
    if (config.authType === "jwt") {
      if (!config.jwt) {
        throw new Error("Pinata JWT token is required");
      }
    } else {
      if (!config.apiKey || !config.apiSecret) {
        throw new Error("Pinata API key and secret are required");
      }
    }

    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      throw new Error(
        "Pinata file listing must be performed on the client side"
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.status) queryParams.append("status", options.status);
    if (options.pageLimit)
      queryParams.append("pageLimit", options.pageLimit.toString());
    if (options.pageOffset)
      queryParams.append("pageOffset", options.pageOffset.toString());

    const url = `https://api.pinata.cloud/data/pinList?${queryParams.toString()}`;

    // Prepare headers based on auth type
    const headers = {};
    if (config.authType === "jwt") {
      headers["Authorization"] = `Bearer ${config.jwt}`;
    } else {
      headers["pinata_api_key"] = config.apiKey;
      headers["pinata_secret_api_key"] = config.apiSecret;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      let errorMessage = `Pinata file listing failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Pinata API Error Response:", errorData);

        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        } else if (errorData.error) {
          errorMessage = `Pinata error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `Pinata error: ${errorData.message}`;
        }
      } catch (e) {
        console.warn("Could not parse error response:", e);
        if (response.status === 401) {
          errorMessage =
            "Pinata authentication failed. Please check your API credentials.";
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("📋 Files listed successfully:", result.count, "files found");

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Pinata file listing error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to list files from Pinata",
    };
  }
}

// ==============================================
// 4. DATA RETRIEVAL FUNCTIONS
// ==============================================

/**
 * Fetch data from Pinata IPFS using CID
 * @param {string} cid - IPFS Content ID
 * @param {Object} config - Pinata configuration (for gateway URL)
 * @returns {Promise<any>} Fetched data
 */
export async function fetchFromPinata(cid, config) {
  try {
    // Construct the proper Pinata gateway URL according to their documentation
    // Format: https://gateway.mypinata.cloud/ipfs/{cid}
    let gatewayUrl;
    if (config.gatewayUrl) {
      // If gatewayUrl is provided, ensure it has the proper format
      if (config.gatewayUrl.startsWith("http")) {
        // Full URL provided
        gatewayUrl = config.gatewayUrl.endsWith("/ipfs")
          ? config.gatewayUrl
          : `${config.gatewayUrl}/ipfs`;
      } else {
        // Just the domain provided (e.g., "copper-blank-caterpillar-722.mypinata.cloud")
        gatewayUrl = `https://${config.gatewayUrl}/ipfs`;
      }
    } else {
      // Default to public Pinata gateway
      gatewayUrl = "https://gateway.pinata.cloud/ipfs";
    }

    const fullUrl = `${gatewayUrl}/${cid}`;
    console.log("🔗 Fetching from URL:", fullUrl);

    // Prepare headers for authentication
    const headers = {};
    if (config.jwt) {
      headers["Authorization"] = `Bearer ${config.jwt}`;
      console.log("🔐 Using JWT authentication for private file access");
    } else if (config.gatewayKey) {
      headers["x-pinata-gateway-token"] = config.gatewayKey;
      console.log(
        "🔐 Using Gateway Key authentication for private file access"
      );
    }

    const response = await fetch(fullUrl, {
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🔐 401 Unauthorized - trying public gateway as fallback");
        // Try public gateway as fallback
        const publicUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        console.log("🔗 Trying public gateway:", publicUrl);

        const publicResponse = await fetch(publicUrl);
        if (publicResponse.ok) {
          const contentType = publicResponse.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            return await publicResponse.json();
          } else {
            return await publicResponse.blob();
          }
        }
      }

      throw new Error(
        `Failed to fetch from Pinata: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    // Handle CORS and other network errors by trying public gateway
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("CORS")
    ) {
      console.log(
        "🌐 CORS or network error - trying public gateway as fallback"
      );
      try {
        const publicUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        console.log("🔗 Trying public gateway:", publicUrl);

        const publicResponse = await fetch(publicUrl);
        if (publicResponse.ok) {
          const contentType = publicResponse.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            return await publicResponse.json();
          } else {
            return await publicResponse.blob();
          }
        }
      } catch (publicError) {
        console.error("Public gateway also failed:", publicError);
      }
    }

    console.error("Pinata fetch error:", error);
    throw error;
  }
}

/**
 * Get Pinata gateway URL for a CID
 * @param {string} cid - IPFS Content ID
 * @param {Object} config - Pinata configuration
 * @returns {string} Full gateway URL
 */
export function getPinataGatewayURL(cid, config) {
  const gatewayUrl = config.gatewayUrl || "https://gateway.pinata.cloud/ipfs";
  return `${gatewayUrl}/${cid}`;
}

// ==============================================
// 4. UTILITY FUNCTIONS
// ==============================================

/**
 * Validate Pinata configuration
 * @param {Object} config - Pinata configuration
 * @returns {boolean} Is valid
 */
export function validatePinataConfig(config) {
  if (config.authType === "jwt") {
    return !!(config.jwt && config.gatewayUrl);
  }
  return !!(config.apiKey && config.apiSecret && config.gatewayUrl);
}

/**
 * Create Pinata configuration from environment variables
 * @returns {Object} Pinata configuration
 */
export function createPinataConfigFromEnv() {
  // Check for JWT token first (recommended by Pinata)
  const jwt =
    process.env.PINATA_JWT ||
    process.env.NEXT_PUBLIC_PINATA_JWT ||
    process.env.NEXT_PUBLIC_PINATA_JWT_KEY;

  // Fallback to API Key + Secret
  const apiKey =
    process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const apiSecret =
    process.env.PINATA_API_SECRET ||
    process.env.NEXT_PUBLIC_PINATA_API_SECRET ||
    process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  // Gateway URL (required)
  const gatewayUrl =
    process.env.PINATA_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_PINATA_GATEWAY;

  // Gateway Key (for private file access)
  const gatewayKey =
    process.env.PINATA_GATEWAY_KEY ||
    process.env.NEXT_PUBLIC_PINATA_GATEWAY_KEY;

  // Debug logging (can be removed in production)
  // console.log("🔧 Pinata Config Debug:", {
  //   hasJWT: !!jwt,
  //   hasApiKey: !!apiKey,
  //   hasApiSecret: !!apiSecret,
  //   hasGatewayUrl: !!gatewayUrl,
  //   jwtPrefix: jwt ? jwt.substring(0, 10) + "..." : "none",
  //   gatewayUrl: gatewayUrl || "none",
  // });

  if (jwt) {
    return {
      jwt,
      gatewayUrl,
      gatewayKey,
      authType: "jwt",
    };
  }

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Pinata authentication required. Set PINATA_JWT (recommended) or PINATA_API_KEY + PINATA_API_SECRET environment variables."
    );
  }

  return {
    apiKey,
    apiSecret,
    gatewayUrl,
    gatewayKey,
    authType: "apiKey",
  };
}

/**
 * Check if a CID is valid
 * @param {string} cid - IPFS Content ID
 * @returns {boolean} Is valid CID
 */
export function isValidCID(cid) {
  // Basic CID validation - starts with 'Qm' for v0 or 'bafy' for v1
  return /^(Qm[a-zA-Z0-9]{44}|bafy[a-z0-9]{50,})$/.test(cid);
}

// ==============================================
// 5. MIGRATION HELPERS
// ==============================================

/**
 * Migrate data from Arweave URL to Pinata
 * @param {string} arweaveUrl - Arweave transaction URL
 * @param {Object} config - Pinata configuration
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Upload response
 */
export async function migrateFromArweaveToPinata(arweaveUrl, config, metadata) {
  try {
    // Fetch data from Arweave
    const response = await fetch(arweaveUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Arweave: ${response.status}`);
    }

    const data = await response.text();
    const blob = new Blob([data], { type: "application/json" });

    // Upload to Pinata
    return await uploadFileToPinata(blob, config, metadata);
  } catch (error) {
    console.error("Arweave to Pinata migration error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to migrate from Arweave to Pinata",
    };
  }
}
