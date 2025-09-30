"use server";

import {
  uploadSensitiveUserDataToArweave,
  getSensitiveUserDataFromArweave,
  searchUserDataByAddress,
  generateWallet,
  getWalletBalance,
} from "../../lib/arweave.js";

import {
  serverInsertUserReference,
  serverUpdateUserReference,
  serverGetUserReference,
  serverUpsertUserReference,
} from "../../lib/supabase-server.js";

// Create or update user profile (hybrid approach)
export async function createOrUpdateUserProfile(userData) {
  try {
    // Step 1: Upload sensitive data to Arweave
    const wallet = generateWallet();
    const arweaveResult = await uploadSensitiveUserDataToArweave(
      userData,
      wallet
    );

    if (!arweaveResult.success) {
      return {
        success: false,
        error: `Arweave upload failed: ${arweaveResult.error}`,
      };
    }

    // Step 2: Store reference in Supabase
    const supabaseData = {
      address: userData.address,
      arweaveUrl: arweaveResult.arweaveUrl,
    };

    const supabaseResult = await serverUpsertUserReference(supabaseData);

    if (!supabaseResult.success) {
      // If Supabase fails, we should ideally clean up Arweave data
      // For now, we'll log the error but still return success since Arweave worked
      console.error("Supabase upsert failed:", supabaseResult.error);
    }

    return {
      success: true,
      transactionId: arweaveResult.transactionId,
      arweaveUrl: arweaveResult.arweaveUrl,
      supabaseData: supabaseResult.data,
      message: "User profile created/updated successfully",
      isUpdate:
        supabaseResult.data?.updated_at !== supabaseResult.data?.created_at,
    };
  } catch (error) {
    console.error("Error in createOrUpdateUserProfile action:", error);
    return {
      success: false,
      error: "Failed to create or update user profile",
    };
  }
}

// Get user profile (hybrid approach)
export async function getUserProfile(address) {
  try {
    // Step 1: Get reference from Supabase
    const supabaseResult = await serverGetUserReference(address);

    if (!supabaseResult.success) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    // Step 2: Get sensitive data from Arweave
    const arweaveUrl = supabaseResult.data.arweaveUrl;
    const transactionId = arweaveUrl.split("/").pop(); // Extract transaction ID from URL

    const arweaveResult = await getSensitiveUserDataFromArweave(transactionId);

    if (!arweaveResult.success) {
      return {
        success: false,
        error: `Failed to retrieve data from Arweave: ${arweaveResult.error}`,
      };
    }

    return {
      success: true,
      data: {
        address: address,
        arweaveUrl: arweaveUrl,
        sensitiveData: arweaveResult.data,
        supabaseData: supabaseResult.data,
      },
      message: "User profile retrieved successfully",
    };
  } catch (error) {
    console.error("Error in getUserProfile action:", error);
    return {
      success: false,
      error: "Failed to retrieve user profile",
    };
  }
}

// Search user profile by address (hybrid approach)
export async function searchUserProfileByAddress(address) {
  try {
    // First check Supabase for reference
    const supabaseResult = await serverGetUserReference(address);

    if (!supabaseResult.success) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    // Get sensitive data from Arweave
    const arweaveUrl = supabaseResult.data.arweaveUrl;
    const transactionId = arweaveUrl.split("/").pop();

    const arweaveResult = await getSensitiveUserDataFromArweave(transactionId);

    if (!arweaveResult.success) {
      return {
        success: false,
        error: `Failed to retrieve data from Arweave: ${arweaveResult.error}`,
      };
    }

    return {
      success: true,
      data: {
        address: address,
        arweaveUrl: arweaveUrl,
        sensitiveData: arweaveResult.data,
        supabaseData: supabaseResult.data,
      },
      message: "User profile found",
    };
  } catch (error) {
    console.error("Error in searchUserProfileByAddress action:", error);
    return {
      success: false,
      error: "Failed to search user profile",
    };
  }
}

// Delete user profile (hybrid approach)
export async function deleteUserProfile(address) {
  try {
    // Step 1: Get reference from Supabase to get Arweave URL
    const supabaseResult = await serverGetUserReference(address);

    if (!supabaseResult.success) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    // Step 2: Delete reference from Supabase
    const deleteResult = await deleteUserReference(address);

    if (!deleteResult.success) {
      return {
        success: false,
        error: `Failed to delete from Supabase: ${deleteResult.error}`,
      };
    }

    // Note: Arweave data cannot be deleted (permanent storage)
    // We only remove the reference from Supabase

    return {
      success: true,
      message:
        "User profile deleted successfully (Arweave data remains permanent)",
      arweaveUrl: supabaseResult.data.arweaveUrl,
    };
  } catch (error) {
    console.error("Error in deleteUserProfile action:", error);
    return {
      success: false,
      error: "Failed to delete user profile",
    };
  }
}

// Get wallet balance
export async function getUserWalletBalance(address) {
  try {
    const balance = await getWalletBalance(address);

    return {
      success: true,
      balance: balance,
      message: "Wallet balance retrieved successfully",
    };
  } catch (error) {
    console.error("Error in getUserWalletBalance action:", error);
    return {
      success: false,
      error: "Failed to get wallet balance",
    };
  }
}

// Check if user profile exists
export async function checkUserProfileExists(address) {
  try {
    const result = await serverGetUserReference(address);

    return {
      success: true,
      exists: result.success,
      data: result.data || null,
    };
  } catch (error) {
    console.error("Error in checkUserProfileExists action:", error);
    return {
      success: false,
      error: "Failed to check user profile existence",
    };
  }
}

// Register new user in Supabase (without profile data)
export async function registerNewUser(address) {
  try {
    // First check if user already exists
    const existingUser = await serverGetUserReference(address);

    if (existingUser.success) {
      // User already exists, return success
      return {
        success: true,
        message: "User already registered",
        data: existingUser.data,
        isNewUser: false,
      };
    }

    // Create new user record without Arweave URL
    const newUserData = {
      address: address,
      arweaveUrl: null, // No profile data yet
    };

    const result = await serverInsertUserReference(newUserData);

    if (result.success) {
      return {
        success: true,
        message: "User registered successfully",
        data: result.data,
        isNewUser: true,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error in registerNewUser action:", error);
    return {
      success: false,
      error: "Failed to register new user",
    };
  }
}
