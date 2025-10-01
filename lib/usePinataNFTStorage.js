"use client";

/**
 * usePinataNFTStorage Hook - Pinata + NFT.Storage Integration
 * Replaces Arweave and Storacha with Pinata and NFT.Storage
 */

import { useState, useCallback, useEffect } from "react";
import {
  createOrUpdateUserProfileV3,
  getUserProfileV3,
  deleteUserProfileV3,
  uploadNFTMetadataV3,
  getNFTMetadataV3,
  getUserStatsV3,
  searchUserDataV3,
} from "../app/actions/pinata-nftstorage-actions.js";

// Import client-side Supabase functions
import {
  getUserProfile as getSupabaseProfile,
  createOrUpdateUserProfile as createOrUpdateSupabaseProfile,
  deleteUserProfile as deleteSupabaseProfile,
} from "./supabase-client.js";

import {
  uploadUserProfileToPinata,
  fetchFromPinata,
  createPinataConfigFromEnv,
  deleteFileByCIDFromPinata,
} from "./pinata.js";

// ==============================================
// 1. HOOK IMPLEMENTATION
// ==============================================

export const usePinataNFTStorage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [userStats, setUserStats] = useState(null);

  // ==============================================
  // 2. ERROR HANDLING
  // ==============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error, context = "Unknown operation") => {
    console.error(`Error in ${context}:`, error);

    // Filter out technical errors that users shouldn't see
    let userMessage = `Failed to ${context.toLowerCase()}. Please try again.`;

    if (error instanceof Error) {
      const errorMessage = error.message;

      // Hide technical errors from users
      if (
        errorMessage.includes("ReadableStream") ||
        errorMessage.includes("Expected undefined") ||
        errorMessage.includes("Circular") ||
        errorMessage.includes("_controlledReadableByteStream") ||
        errorMessage.includes("_queue") ||
        errorMessage.includes("_pullAlgorithm")
      ) {
        // Keep technical details in console but show user-friendly message
        console.warn("Technical error hidden from user:", errorMessage);
        userMessage = `Failed to ${context.toLowerCase()}. Please try again.`;
      } else {
        userMessage = errorMessage;
      }
    }

    setError(userMessage);
  }, []);

  // ==============================================
  // 3. USER PROFILE MANAGEMENT
  // ==============================================

  /**
   * Create or update user profile with data on Pinata
   * @param {Object} userData - User profile data
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Result object
   */
  const createOrUpdateProfile = useCallback(
    async (userData, walletAddress) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📤 Creating/updating profile on Pinata...");
        console.log("📤 Wallet address:", walletAddress);
        console.log("📤 User data:", userData);

        // Step 0: Check if user has existing profile and delete old CID
        console.log(
          "🔍 Checking for existing profile to clean up old files..."
        );
        const existingProfileResult = await getSupabaseProfile(walletAddress);

        if (
          existingProfileResult.success &&
          existingProfileResult.data?.pinataCid
        ) {
          const oldCid = existingProfileResult.data.pinataCid;
          console.log("🗑️ Found existing CID, deleting old file:", oldCid);

          const pinataConfig = createPinataConfigFromEnv();
          const deleteResult = await deleteFileByCIDFromPinata(
            oldCid,
            pinataConfig
          );

          if (deleteResult.success) {
            console.log(
              "✅ Old file deleted successfully:",
              deleteResult.deletedCount,
              "files removed"
            );
          } else {
            console.warn(
              "⚠️ Failed to delete old file (continuing anyway):",
              deleteResult.error
            );
            // Continue with upload even if deletion fails
          }
        } else {
          console.log(
            "ℹ️ No existing profile found, proceeding with new upload"
          );
        }

        // Step 1: Upload to Pinata (client-side)
        // Clean user data - remove metadata field
        const { metadata, ...cleanUserData } = userData;

        const pinataConfig = createPinataConfigFromEnv();
        const uploadResult = await uploadUserProfileToPinata(
          cleanUserData,
          pinataConfig,
          walletAddress
        );

        if (!uploadResult.success) {
          throw new Error(`Pinata upload failed: ${uploadResult.error}`);
        }

        console.log("📤 Pinata upload successful, CID:", uploadResult.cid);

        // Step 2: Store reference in Supabase (client-side)
        console.log("💾 Storing CID in Supabase (client-side)...");
        const profileData = {
          walletAddress,
          pinataCid: uploadResult.cid,
          metadata: {
            type: "user_profile",
            storage: "pinata",
            version: "3.0",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
        };
        const result = await createOrUpdateSupabaseProfile(profileData);

        console.log("💾 Supabase storage result:", result);

        if (result.success) {
          setUserProfile(result);
          setProfileExists(true);
          console.log("✅ Profile creation/update completed successfully");
          return result;
        } else {
          setError(result.error);
          console.error("❌ Profile creation/update failed:", result.error);
          return result;
        }
      } catch (err) {
        console.error("💥 Error in createOrUpdateProfile:", err);
        handleError(err, "create or update profile");
        return { success: false, error: err.message };
      } finally {
        console.log("🔄 Setting loading to false");
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Get user profile and fetch data from Pinata
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Result object
   */
  const getProfile = useCallback(
    async (walletAddress) => {
      setLoading(true);
      setError(null);

      try {
        console.log(
          "🔍 Step 1: Getting profile reference from Supabase (client-side)..."
        );

        // Step 1: Get profile reference from Supabase (client-side)
        const profileResult = await getSupabaseProfile(walletAddress);

        if (!profileResult.success) {
          setProfileExists(false);
          setError(profileResult.error);
          return profileResult;
        }

        const profileRef = profileResult.data;

        // Step 2: Download data from Pinata (client-side) if pinataCid exists
        if (profileRef.pinataCid) {
          console.log("📥 Step 2: Downloading data from Pinata...");
          console.log("📥 Pinata CID:", profileRef.pinataCid);

          const pinataConfig = createPinataConfigFromEnv();
          console.log("📥 Pinata config:", pinataConfig);

          const downloadResult = await fetchFromPinata(
            profileRef.pinataCid,
            pinataConfig
          );

          console.log("📥 Download result:", downloadResult);

          if (downloadResult) {
            const fullProfile = {
              profileRef,
              sensitiveData: {
                data: downloadResult,
                cid: profileRef.pinataCid,
              },
            };
            console.log("✅ Full profile created:", fullProfile);
            setUserProfile(fullProfile);
            setProfileExists(true);
            return {
              success: true,
              data: fullProfile,
            };
          } else {
            console.log("❌ Download result is null/undefined");
          }
        } else {
          console.log("📋 No pinataCid found in profile reference");
        }

        // Profile exists in Supabase but no Pinata data yet
        console.log("📋 Profile exists in Supabase but no Pinata data yet");
        const basicProfile = {
          profileRef,
          sensitiveData: {
            data: {
              fullName: "Not provided",
              username: "Not provided",
              email: "Not provided",
              dateOfBirth: null,
            },
            cid: null,
          },
        };
        setUserProfile(basicProfile);
        setProfileExists(true);
        return {
          success: true,
          data: basicProfile,
        };
      } catch (err) {
        setProfileExists(false);
        handleError(err, "get profile");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Delete user profile
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Result object
   */
  const deleteProfile = useCallback(
    async (walletAddress) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🗑️ Deleting profile (client-side)...");

        const result = await deleteSupabaseProfile(walletAddress);

        if (result.success) {
          setUserProfile(null);
          setProfileExists(false);
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        handleError(err, "delete profile");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // ==============================================
  // 4. NFT METADATA MANAGEMENT
  // ==============================================

  /**
   * Upload NFT metadata to NFT.Storage
   * @param {Object} metadata - NFT metadata object
   * @param {string} mintAddress - NFT mint address
   * @param {string} ownerWallet - Owner's wallet address
   * @returns {Promise<Object>} Result object
   */
  const uploadNFT = useCallback(
    async (metadata, mintAddress, ownerWallet) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📤 Uploading NFT metadata to NFT.Storage...");

        const result = await uploadNFTMetadataV3(
          metadata,
          mintAddress,
          ownerWallet
        );

        if (result.success) {
          // Optionally refresh user NFTs
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        handleError(err, "upload NFT metadata");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Get NFT metadata from NFT.Storage
   * @param {string} mintAddress - NFT mint address
   * @returns {Promise<Object>} Result object
   */
  const getNFT = useCallback(
    async (mintAddress) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Getting NFT metadata from NFT.Storage...");

        const result = await getNFTMetadataV3(mintAddress);

        if (result.success) {
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        handleError(err, "get NFT metadata");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // ==============================================
  // 5. UTILITY FUNCTIONS
  // ==============================================

  /**
   * Get user statistics
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Result object
   */
  const getUserStats = useCallback(
    async (walletAddress) => {
      setLoading(true);
      setError(null);

      try {
        console.log("📊 Getting user stats...");

        const result = await getUserStatsV3(walletAddress);

        if (result.success) {
          setUserStats(result.data);
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        handleError(err, "get user stats");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Search user data
   * @param {string} walletAddress - User's wallet address
   * @param {string} query - Search query
   * @returns {Promise<Object>} Result object
   */
  const searchProfile = useCallback(
    async (walletAddress, query = "") => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Searching user data...");

        const result = await searchUserDataV3(walletAddress, query);

        if (result.success) {
          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        handleError(err, "search user data");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // ==============================================
  // 6. RETURN HOOK INTERFACE
  // ==============================================

  return {
    // State
    loading,
    error,
    userProfile,
    userNFTs,
    profileExists,
    userStats,

    // Error handling
    clearError,

    // Profile management
    createOrUpdateProfile,
    getProfile,
    deleteProfile,
    searchProfile,

    // NFT management
    uploadNFT,
    getNFT,

    // Utilities
    getUserStats,
  };
};

// ==============================================
// 7. EXPORT DEFAULT
// ==============================================

export default usePinataNFTStorage;
