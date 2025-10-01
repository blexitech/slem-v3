/**
 * NFT.Storage Integration Utilities
 * Handles NFT metadata storage and retrieval
 */

// ==============================================
// 1. UTILITY FUNCTIONS
// ==============================================

// ==============================================
// 2. NFT.STORAGE API FUNCTIONS
// ==============================================

/**
 * Upload NFT metadata to NFT.Storage
 * @param {Object} metadata - NFT metadata object
 * @param {Object} config - NFT.Storage configuration
 * @returns {Promise<Object>} Upload response
 */
export async function uploadNFTMetadataToNFTStorage(metadata, config) {
  try {
    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `NFT.Storage upload failed: ${response.status} ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      cid: result.value.cid,
      metadata: {
        name: metadata.name,
        description: metadata.description,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("NFT.Storage upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload NFT metadata to NFT.Storage",
    };
  }
}

/**
 * Upload NFT metadata as JSON file to NFT.Storage
 * @param {Object} metadata - NFT metadata object
 * @param {Object} config - NFT.Storage configuration
 * @param {string} filename - Optional filename
 * @returns {Promise<Object>} Upload response
 */
export async function uploadNFTMetadataFileToNFTStorage(
  metadata,
  config,
  filename
) {
  try {
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], filename || "metadata.json", {
      type: "application/json",
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `NFT.Storage file upload failed: ${response.status} ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      cid: result.value.cid,
      metadata: {
        name: metadata.name,
        description: metadata.description,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("NFT.Storage file upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload NFT metadata file to NFT.Storage",
    };
  }
}

/**
 * Upload NFT with image to NFT.Storage
 * @param {Object} metadata - NFT metadata object
 * @param {File} imageFile - Image file
 * @param {Object} config - NFT.Storage configuration
 * @returns {Promise<Object>} Upload response
 */
export async function uploadNFTWithImageToNFTStorage(
  metadata,
  imageFile,
  config
) {
  try {
    // Create a directory structure
    const files = [
      new File([JSON.stringify(metadata, null, 2)], "metadata.json", {
        type: "application/json",
      }),
      imageFile,
    ];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `NFT.Storage directory upload failed: ${response.status} ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      cid: result.value.cid,
      metadata: {
        name: metadata.name,
        description: metadata.description,
        uploadedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("NFT.Storage directory upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload NFT with image to NFT.Storage",
    };
  }
}

// ==============================================
// 3. DATA RETRIEVAL FUNCTIONS
// ==============================================

/**
 * Fetch NFT metadata from NFT.Storage using CID
 * @param {string} cid - IPFS Content ID
 * @param {Object} config - NFT.Storage configuration
 * @returns {Promise<Object>} NFT metadata
 */
export async function fetchNFTMetadataFromNFTStorage(cid, config) {
  try {
    const gatewayUrl = config.gatewayUrl || "https://nftstorage.link/ipfs";
    const response = await fetch(`${gatewayUrl}/${cid}/metadata.json`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch NFT metadata: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("NFT.Storage fetch error:", error);
    throw error;
  }
}

/**
 * Get NFT.Storage gateway URL for a CID
 * @param {string} cid - IPFS Content ID
 * @param {Object} config - NFT.Storage configuration
 * @param {string} path - Optional path within the CID (e.g., 'metadata.json')
 * @returns {string} Full gateway URL
 */
export function getNFTStorageGatewayURL(cid, config, path) {
  const gatewayUrl = config.gatewayUrl || "https://nftstorage.link/ipfs";
  const fullPath = path ? `/${path}` : "";
  return `${gatewayUrl}/${cid}${fullPath}`;
}

/**
 * Fetch any data from NFT.Storage using CID
 * @param {string} cid - IPFS Content ID
 * @param {Object} config - NFT.Storage configuration
 * @param {string} path - Optional path within the CID
 * @returns {Promise<any>} Fetched data
 */
export async function fetchFromNFTStorage(cid, config, path) {
  try {
    const url = getNFTStorageGatewayURL(cid, config, path);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from NFT.Storage: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      return await response.json();
    } else {
      return await response.blob();
    }
  } catch (error) {
    console.error("NFT.Storage fetch error:", error);
    throw error;
  }
}

// ==============================================
// 4. UTILITY FUNCTIONS
// ==============================================

/**
 * Validate NFT.Storage configuration
 * @param {Object} config - NFT.Storage configuration
 * @returns {boolean} Is valid
 */
export function validateNFTStorageConfig(config) {
  return !!config.token;
}

/**
 * Create NFT.Storage configuration from environment variables
 * @returns {Object} NFT.Storage configuration
 */
export function createNFTStorageConfigFromEnv() {
  const token =
    process.env.NFT_STORAGE_TOKEN || process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;
  const gatewayUrl =
    process.env.NFT_STORAGE_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_NFT_STORAGE_GATEWAY_URL;

  if (!token) {
    throw new Error(
      "NFT.Storage token is required. Set NFT_STORAGE_TOKEN environment variable."
    );
  }

  return {
    token,
    gatewayUrl,
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
// 5. NFT METADATA HELPERS
// ==============================================

/**
 * Create standard NFT metadata object
 * @param {string} name - NFT name
 * @param {string} description - NFT description
 * @param {string} image - Image URL or IPFS hash
 * @param {Array} attributes - Optional attributes array
 * @returns {Object} NFT metadata
 */
export function createNFTMetadata(name, description, image, attributes) {
  return {
    name,
    description,
    image,
    attributes: attributes || [],
    external_url: "",
    background_color: "",
    animation_url: "",
    youtube_url: "",
  };
}

/**
 * Validate NFT metadata object
 * @param {any} metadata - NFT metadata to validate
 * @returns {boolean} Is valid NFT metadata
 */
export function validateNFTMetadata(metadata) {
  return (
    typeof metadata === "object" &&
    typeof metadata.name === "string" &&
    typeof metadata.description === "string" &&
    typeof metadata.image === "string" &&
    (metadata.attributes === undefined || Array.isArray(metadata.attributes))
  );
}

/**
 * Convert image file to IPFS URL
 * @param {File} imageFile - Image file
 * @param {string} cid - IPFS Content ID where image is stored
 * @param {Object} config - NFT.Storage configuration
 * @returns {string} IPFS URL for the image
 */
export function createImageIPFSUrl(imageFile, cid, config) {
  const gatewayUrl = config.gatewayUrl || "https://nftstorage.link/ipfs";
  return `${gatewayUrl}/${cid}/${imageFile.name}`;
}
