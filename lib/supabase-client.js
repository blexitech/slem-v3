/**
 * Client-side Supabase configuration for SLE Marketplace
 * This handles all Supabase operations on the client-side to avoid server-side ReadableStream issues
 */

import { createClient } from "@supabase/supabase-js";

// Client-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHED_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==============================================
// 1. USER PROFILES
// ==============================================

/**
 * Get user profile by wallet address (client-side)
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getUserProfile = async (walletAddress) => {
  try {
    console.log("🔍 Getting user profile for wallet:", walletAddress);

    const { data, error } = await supabase
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
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
};

/**
 * Create or update user profile (client-side)
 * @param {Object} profileData - { walletAddress, pinataCid, metadata }
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const createOrUpdateUserProfile = async (profileData) => {
  try {
    const { walletAddress, pinataCid, metadata } = profileData;

    // Use upsert to create or update
    const { data, error } = await supabase
      .from("V3 Users")
      .upsert(
        {
          walletAddress: walletAddress,
          pinataCid: pinataCid,
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
 * Delete user profile (client-side)
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export const deleteUserProfile = async (walletAddress) => {
  try {
    const { error } = await supabase
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
// 2. NFT METADATA
// ==============================================

/**
 * Store NFT metadata reference (client-side)
 * @param {Object} nftData - { mintAddress, nftMetadataCid, ownerWallet, tokenID, collectionAddress, metadata }
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

    const { data, error } = await supabase
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
 * Get NFTs for a user (client-side)
 * @param {string} ownerWallet - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Array, error?: string }
 */
export const getUserNFTs = async (ownerWallet) => {
  try {
    const { data, error } = await supabase
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
 * Get specific NFT by mint address (client-side)
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getNFTByMintAddress = async (mintAddress) => {
  try {
    const { data, error } = await supabase
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

// ==============================================
// 3. UTILITY FUNCTIONS
// ==============================================

/**
 * Get user statistics (client-side)
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export const getUserStats = async (walletAddress) => {
  try {
    // Get profile count
    const profileResult = await getUserProfile(walletAddress);
    const hasProfile = profileResult.success;

    // Get NFTs count
    const nftsResult = await getUserNFTs(walletAddress);
    const nftsCount = nftsResult.success ? nftsResult.data.length : 0;

    return {
      success: true,
      data: {
        hasProfile,
        nftsCount,
        totalItems: nftsCount,
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
