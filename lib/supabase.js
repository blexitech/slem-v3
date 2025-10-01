/**
 * Supabase V2 Server Functions for SLE Marketplace
 * Updated to work with encrypted IPFS storage instead of Arweave
 */

import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHED_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

console.log("🔧 Supabase configuration:", {
  url: supabaseUrl,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  usingPublishedKey: !process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Create server-side Supabase client with custom fetch to fix ReadableStream issues
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
});

// ==============================================
// 1. USER PROFILES (Encrypted on Web3.Storage)
// ==============================================

/**
 * Create or update user profile with data on Pinata
 * @param {Object} profileData - { walletAddress, pinataCid, metadata }
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const createOrUpdateUserProfile = async (profileData) => {
  try {
    const { walletAddress, pinataCid, metadata } = profileData;

    // Use upsert to create or update
    const { data, error } = await supabaseServer
      .from("V3 Users")
      .upsert(
        {
          walletAddress: walletAddress,
          pinataCid: pinataCid,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "walletAddress",
          ignoreDuplicates: false,
        }
      )
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "User profile created/updated successfully",
    };
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Direct HTTP request to Supabase REST API using Node.js https module
 * This bypasses all fetch-related ReadableStream issues
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
const directHttpQuery = async (walletAddress) => {
  return new Promise((resolve) => {
    const https = require("https");
    const url = require("url");

    console.log("🔄 Using direct HTTP request to bypass ReadableStream issues");

    // Parse the Supabase URL
    const parsedUrl = url.parse(supabaseUrl);
    const apiPath = `/rest/v1/V3%20Users?walletAddress=eq.${encodeURIComponent(walletAddress)}&select=*`;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: apiPath,
      method: "GET",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=minimal",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const jsonData = JSON.parse(data);

            if (jsonData && jsonData.length > 0) {
              console.log(
                "✅ User profile retrieved successfully via direct HTTP:",
                jsonData[0]
              );
              resolve({
                success: true,
                data: jsonData[0],
                message: "User profile retrieved successfully via direct HTTP",
              });
            } else {
              console.log("❌ No profile found for wallet:", walletAddress);
              resolve({
                success: false,
                error: "User profile not found",
              });
            }
          } else {
            console.error("❌ HTTP error:", res.statusCode, data);
            resolve({
              success: false,
              error: `HTTP error: ${res.statusCode}`,
            });
          }
        } catch (parseError) {
          console.error("💥 Error parsing response:", parseError);
          resolve({
            success: false,
            error: "Error parsing response",
          });
        }
      });
    });

    req.on("error", (error) => {
      console.error("💥 HTTP request error:", error);
      resolve({
        success: false,
        error: error.message || "HTTP request failed",
      });
    });

    req.end();
  });
};

/**
 * Get user profile by wallet address with fallback to direct HTTP
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getUserProfile = async (walletAddress) => {
  try {
    console.log("🔍 Getting user profile for wallet:", walletAddress);

    // Try Supabase client first
    const { data, error } = await supabaseServer
      .from("V3 Users")
      .select("*")
      .eq("walletAddress", walletAddress)
      .single();

    if (error) {
      console.log("❌ Supabase query error:", error);
      if (error.code === "PGRST116") {
        // No rows found
        return {
          success: false,
          error: "User profile not found",
        };
      }
      throw error;
    }

    console.log("✅ User profile retrieved successfully:", data);
    return {
      success: true,
      data: data,
      message: "User profile retrieved successfully",
    };
  } catch (error) {
    console.error("💥 Error getting user profile:", error);

    // If it's a ReadableStream error, use direct HTTP fallback
    if (error.message && error.message.includes("ReadableStream")) {
      console.log(
        "🔄 ReadableStream error detected, using direct HTTP fallback"
      );
      return await directHttpQuery(walletAddress);
    }

    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Delete user profile
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deleteUserProfile = async (walletAddress) => {
  try {
    const { error } = await supabaseServer
      .from("V3 Users")
      .delete()
      .eq("walletAddress", walletAddress);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "User profile deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

// ==============================================
// 2. ENCRYPTED FILES (Web3.Storage)
// ==============================================

/**
 * Store encrypted file reference
 * @param {Object} fileData - { cid, filename, ownerWallet, encKeyUser, metadata }
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const storeEncryptedFile = async (fileData) => {
  try {
    const { cid, filename, ownerWallet, encKeyUser, metadata } = fileData;

    const { data, error } = await supabaseServer
      .from("encrypted_files")
      .insert({
        cid: cid,
        filename: filename,
        owner_wallet: ownerWallet,
        enc_key_user: encKeyUser,
        metadata: metadata,
      })
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "Encrypted file reference stored successfully",
    };
  } catch (error) {
    console.error("Error storing encrypted file:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Get encrypted files for a user
 * @param {string} ownerWallet - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Array, error?: string }
 */
export const getEncryptedFiles = async (ownerWallet) => {
  try {
    const { data, error } = await supabaseServer
      .from("encrypted_files")
      .select("*")
      .eq("owner_wallet", ownerWallet)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      message: "Encrypted files retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting encrypted files:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Get specific encrypted file by CID
 * @param {string} cid - IPFS Content ID
 * @param {string} ownerWallet - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getEncryptedFile = async (cid, ownerWallet) => {
  try {
    const { data, error } = await supabaseServer
      .from("encrypted_files")
      .select("*")
      .eq("cid", cid)
      .eq("owner_wallet", ownerWallet)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          error: "Encrypted file not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      data: data,
      message: "Encrypted file retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting encrypted file:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Delete encrypted file reference
 * @param {string} cid - IPFS Content ID
 * @param {string} ownerWallet - User's wallet address
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deleteEncryptedFile = async (cid, ownerWallet) => {
  try {
    const { error } = await supabaseServer
      .from("encrypted_files")
      .delete()
      .eq("cid", cid)
      .eq("owner_wallet", ownerWallet);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Encrypted file reference deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting encrypted file:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

// ==============================================
// 3. NFT METADATA (NFT.Storage)
// ==============================================

/**
 * Store NFT metadata reference
 * @param {Object} nftData - { mintAddress, metadataCID, ownerWallet, tokenID, collectionAddress, metadata }
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const storeNFTMetadata = async (nftData) => {
  try {
    const {
      mintAddress,
      nftMetadataCid,
      ownerWallet,
      tokenID,
      collectionAddress,
      metadata,
    } = nftData;

    const { data, error } = await supabaseServer
      .from("user_nfts")
      .upsert(
        {
          mint_address: mintAddress,
          metadata_cid: nftMetadataCid,
          owner_wallet: ownerWallet,
          token_id: tokenID,
          collection_address: collectionAddress,
          metadata: metadata,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "mint_address",
          ignoreDuplicates: false,
        }
      )
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "NFT metadata reference stored successfully",
    };
  } catch (error) {
    console.error("Error storing NFT metadata:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Get NFTs for a user
 * @param {string} ownerWallet - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Array, error?: string }
 */
export const getUserNFTs = async (ownerWallet) => {
  try {
    const { data, error } = await supabaseServer
      .from("user_nfts")
      .select("*")
      .eq("owner_wallet", ownerWallet)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data,
      message: "User NFTs retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting user NFTs:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Get specific NFT by mint address
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getNFTByMintAddress = async (mintAddress) => {
  try {
    const { data, error } = await supabaseServer
      .from("user_nfts")
      .select("*")
      .eq("mint_address", mintAddress)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          error: "NFT not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      data: data,
      message: "NFT retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting NFT:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Update NFT owner (for transfers)
 * @param {string} mintAddress - NFT mint address
 * @param {string} newOwnerWallet - New owner's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const updateNFTOwner = async (mintAddress, newOwnerWallet) => {
  try {
    const { data, error } = await supabaseServer
      .from("user_nfts")
      .update({
        owner_wallet: newOwnerWallet,
        updated_at: new Date().toISOString(),
      })
      .eq("mint_address", mintAddress)
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "NFT owner updated successfully",
    };
  } catch (error) {
    console.error("Error updating NFT owner:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Delete NFT reference
 * @param {string} mintAddress - NFT mint address
 * @param {string} ownerWallet - Current owner's wallet address
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deleteNFTReference = async (mintAddress, ownerWallet) => {
  try {
    const { error } = await supabaseServer
      .from("user_nfts")
      .delete()
      .eq("mint_address", mintAddress)
      .eq("owner_wallet", ownerWallet);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "NFT reference deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting NFT reference:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

// ==============================================
// 4. UTILITY FUNCTIONS
// ==============================================

/**
 * Set current wallet context for RLS policies
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<void>}
 */
export const setWalletContext = async (walletAddress) => {
  try {
    await supabaseServer.rpc("set_config", {
      setting_name: "app.current_wallet",
      new_value: walletAddress,
    });
  } catch (error) {
    console.error("Error setting wallet context:", error);
    // This is not critical, so we don't throw
  }
};

/**
 * Get user statistics
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getUserStats = async (walletAddress) => {
  try {
    // Get profile count
    const profileResult = await getUserProfile(walletAddress);
    const hasProfile = profileResult.success;

    // Get files count
    const filesResult = await getEncryptedFiles(walletAddress);
    const filesCount = filesResult.success ? filesResult.data.length : 0;

    // Get NFTs count
    const nftsResult = await getUserNFTs(walletAddress);
    const nftsCount = nftsResult.success ? nftsResult.data.length : 0;

    return {
      success: true,
      data: {
        hasProfile,
        filesCount,
        nftsCount,
        totalItems: filesCount + nftsCount,
      },
      message: "User statistics retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Search across user's data
 * @param {string} walletAddress - User's wallet address
 * @param {string} query - Search query
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const searchUserData = async (walletAddress, query) => {
  try {
    // Search in files
    const { data: files, error: filesError } = await supabaseServer
      .from("encrypted_files")
      .select("*")
      .eq("owner_wallet", walletAddress)
      .or(`filename.ilike.%${query}%,metadata->>type.ilike.%${query}%`);

    if (filesError) {
      throw filesError;
    }

    // Search in NFTs
    const { data: nfts, error: nftsError } = await supabaseServer
      .from("user_nfts")
      .select("*")
      .eq("owner_wallet", walletAddress)
      .or(
        `metadata->>name.ilike.%${query}%,metadata->>description.ilike.%${query}%`
      );

    if (nftsError) {
      throw nftsError;
    }

    return {
      success: true,
      data: {
        files: files || [],
        nfts: nfts || [],
        totalResults: (files?.length || 0) + (nfts?.length || 0),
      },
      message: "Search completed successfully",
    };
  } catch (error) {
    console.error("Error searching user data:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};
