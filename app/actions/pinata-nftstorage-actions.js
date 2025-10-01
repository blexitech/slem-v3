"use server";

/**
 * Server Actions for Pinata + NFT.Storage Integration
 * Replaces Arweave and Storacha with Pinata and NFT.Storage
 */

// Note: Supabase operations are now handled client-side
// Server actions only handle Pinata and NFT.Storage operations

// Note: Pinata uploads are now handled on the client side
// Server actions only handle Supabase database operations

import {
  uploadNFTMetadataToNFTStorage,
  fetchNFTMetadataFromNFTStorage,
  createNFTStorageConfigFromEnv,
  getNFTStorageGatewayURL,
} from "../../lib/nftStorage.js";

// ==============================================
// 1. USER PROFILE MANAGEMENT
// ==============================================

/**
 * Create or update user profile reference in Supabase (Pinata upload handled on client)
 * @param {string} walletAddress - User's wallet address
 * @param {string} pinataCid - Pinata CID from client-side upload
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function createOrUpdateUserProfileV3(walletAddress, pinataCid) {
  console.log("🎯 createOrUpdateUserProfileV3 called with:", {
    walletAddress,
    pinataCid,
  });

  try {
    // Store reference in Supabase
    console.log("💾 Storing profile reference in Supabase...");

    const profileData = {
      walletAddress,
      pinataCid: pinataCid,
      metadata: {
        type: "user_profile",
        storage: "pinata",
        version: "3.0",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };

    console.log("💾 Supabase profile data:", profileData);

    const supabaseResult = await createOrUpdateUserProfile(profileData);
    console.log("💾 Supabase upsert result:", supabaseResult);

    if (!supabaseResult.success) {
      console.error("⚠️ Supabase upsert failed:", supabaseResult.error);
      return {
        success: false,
        error: `Supabase upsert failed: ${supabaseResult.error}`,
      };
    }

    console.log("✅ Profile reference stored successfully");
    return {
      success: true,
      cid: pinataCid,
      profileData: supabaseResult.data,
      message: "User profile reference stored successfully",
      isUpdate:
        supabaseResult.data.updated_at !== supabaseResult.data.created_at,
    };
  } catch (error) {
    console.error("💥 Error in createOrUpdateUserProfileV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

/**
 * Get user profile (client-side operation)
 * Note: This function is now handled client-side to avoid server-side ReadableStream issues
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function getUserProfileV3(walletAddress) {
  console.log("🔍 getUserProfileV3 called for wallet:", walletAddress);
  console.log("ℹ️ Note: Profile retrieval is now handled client-side");

  // This function is now handled client-side
  // Return a message indicating client-side handling
  return {
    success: false,
    error:
      "Profile retrieval is now handled client-side. Please use the client-side Supabase functions.",
  };
}

/**
 * Delete user profile
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function deleteUserProfileV3(walletAddress) {
  console.log("🗑️ deleteUserProfileV3 called for wallet:", walletAddress);

  try {
    // Step 1: Get profile reference to get the CID
    const profileResult = await getUserProfile(walletAddress);

    if (profileResult.success) {
      const profileRef = profileResult.data;
      console.log("📋 Found profile with Pinata CID:", profileRef.pinataCid);

      // Note: We don't delete from Pinata as it's decentralized
      // The data will remain but become inaccessible without the reference
    }

    // Step 2: Delete from Supabase
    console.log("💾 Step 2: Deleting profile reference from Supabase...");

    const deleteResult = await deleteUserProfile(walletAddress);
    console.log("💾 Supabase delete result:", deleteResult);

    if (!deleteResult.success) {
      console.error("❌ Supabase delete failed:", deleteResult.error);
      return {
        success: false,
        error: `Supabase delete failed: ${deleteResult.error}`,
      };
    }

    console.log("✅ Profile deletion completed successfully");
    return {
      success: true,
      message: "User profile deleted successfully",
    };
  } catch (error) {
    console.error("💥 Error in deleteUserProfileV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

// ==============================================
// 2. NFT METADATA MANAGEMENT
// ==============================================

/**
 * Upload NFT metadata to NFT.Storage
 * @param {Object} metadata - NFT metadata object
 * @param {string} mintAddress - NFT mint address
 * @param {string} ownerWallet - Owner's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function uploadNFTMetadataV3(metadata, mintAddress, ownerWallet) {
  console.log("📤 uploadNFTMetadataV3 called:", {
    mintAddress,
    ownerWallet,
    metadataName: metadata.name,
  });

  try {
    // Step 1: Upload metadata to NFT.Storage
    console.log("📤 Step 1: Uploading NFT metadata to NFT.Storage...");

    const nftStorageConfig = createNFTStorageConfigFromEnv();
    const uploadResult = await uploadNFTMetadataToNFTStorage(
      metadata,
      nftStorageConfig
    );
    console.log("📤 NFT.Storage upload result:", uploadResult);

    if (!uploadResult.success) {
      console.error("❌ NFT.Storage upload failed:", uploadResult.error);
      return {
        success: false,
        error: `NFT.Storage upload failed: ${uploadResult.error}`,
      };
    }

    // Step 2: Store reference in Supabase
    console.log("💾 Step 2: Storing NFT reference in Supabase...");

    const nftData = {
      mintAddress,
      nftMetadataCid: uploadResult.cid,
      ownerWallet,
      tokenID: metadata.token_id || null,
      collectionAddress: metadata.collection_address || null,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
      },
    };

    const supabaseResult = await storeNFTMetadata(nftData);
    console.log("💾 Supabase NFT storage result:", supabaseResult);

    if (!supabaseResult.success) {
      console.error("⚠️ Supabase NFT storage failed:", supabaseResult.error);
      return {
        success: false,
        error: `Supabase NFT storage failed: ${supabaseResult.error}`,
      };
    }

    console.log("✅ NFT metadata upload completed successfully");
    return {
      success: true,
      cid: uploadResult.cid,
      nftData: supabaseResult.data,
      message: "NFT metadata uploaded successfully",
    };
  } catch (error) {
    console.error("💥 Error in uploadNFTMetadataV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

/**
 * Get NFT metadata from NFT.Storage
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function getNFTMetadataV3(mintAddress) {
  console.log("🔍 getNFTMetadataV3 called for mint:", mintAddress);

  try {
    // Step 1: Get NFT reference from Supabase
    console.log("📋 Step 1: Getting NFT reference from Supabase...");

    const nftResult = await getNFTByMintAddress(mintAddress);
    console.log("📋 Supabase NFT result:", nftResult);

    if (!nftResult.success) {
      console.error("❌ NFT not found in Supabase:", nftResult.error);
      return {
        success: false,
        error: nftResult.error,
      };
    }

    const nftRef = nftResult.data;

    // Step 2: Download metadata from NFT.Storage
    console.log("📥 Step 2: Downloading metadata from NFT.Storage...");

    const nftStorageConfig = createNFTStorageConfigFromEnv();
    const downloadResult = await fetchNFTMetadataFromNFTStorage(
      nftRef.nftMetadataCid,
      nftStorageConfig
    );
    console.log("📥 NFT.Storage download result:", downloadResult);

    console.log("✅ NFT metadata retrieval completed successfully");
    return {
      success: true,
      data: {
        nftRef,
        metadata: downloadResult,
        cid: nftRef.nftMetadataCid,
        storage: "nftstorage",
      },
      message: "NFT metadata retrieved successfully",
    };
  } catch (error) {
    console.error("💥 Error in getNFTMetadataV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

// ==============================================
// 3. UTILITY FUNCTIONS
// ==============================================

/**
 * Get user statistics
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function getUserStatsV3(walletAddress) {
  console.log("📊 getUserStatsV3 called for wallet:", walletAddress);

  try {
    const result = await getUserStats(walletAddress);
    console.log("📊 User stats result:", result);

    return result;
  } catch (error) {
    console.error("💥 Error in getUserStatsV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

/**
 * Search user data
 * @param {string} walletAddress - User's wallet address
 * @param {string} query - Search query
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function searchUserDataV3(walletAddress, query) {
  console.log("🔍 searchUserDataV3 called:", { walletAddress, query });

  try {
    const result = await searchUserData(walletAddress, query);
    console.log("🔍 Search result:", result);

    return result;
  } catch (error) {
    console.error("💥 Error in searchUserDataV3:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}

// ==============================================
// 4. MIGRATION HELPERS
// ==============================================

/**
 * Migrate user profile from Arweave to Pinata
 * @param {string} walletAddress - User's wallet address
 * @param {string} arweaveUrl - Arweave transaction URL
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function migrateUserProfileFromArweave(walletAddress, arweaveUrl) {
  console.log("🔄 migrateUserProfileFromArweave called:", {
    walletAddress,
    arweaveUrl,
  });

  try {
    // Step 1: Fetch data from Arweave
    console.log("📥 Step 1: Fetching data from Arweave...");
    const arweaveResponse = await fetch(arweaveUrl);

    if (!arweaveResponse.ok) {
      throw new Error(
        `Failed to fetch from Arweave: ${arweaveResponse.status}`
      );
    }

    const arweaveData = await arweaveResponse.json();
    console.log("📥 Arweave data fetched:", arweaveData);

    // Step 2: Note - Pinata upload should be handled on client side
    console.log(
      "📤 Step 2: Note - Pinata upload should be handled on client side"
    );
    console.log("📤 Arweave data ready for migration:", arweaveData);

    // Step 3: Return data for client-side migration
    console.log("💾 Step 3: Returning data for client-side migration...");
    console.log("✅ Arweave data fetched successfully");
    return {
      success: true,
      data: arweaveData,
      walletAddress: walletAddress,
      originalArweaveUrl: arweaveUrl,
      message:
        "Arweave data fetched - ready for client-side migration to Pinata",
    };
  } catch (error) {
    console.error("💥 Error in migrateUserProfileFromArweave:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}
