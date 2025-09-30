"use client";

import { useState, useCallback } from "react";
import {
  createOrUpdateUserProfile,
  getUserProfile,
  searchUserProfileByAddress,
  deleteUserProfile,
  getUserWalletBalance,
  checkUserProfileExists,
  registerNewUser,
} from "../app/actions/hybrid-user-actions.js";

export const useHybridUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState("0");
  const [profileExists, setProfileExists] = useState(false);

  // Create or update user profile (hybrid approach)
  const createOrUpdateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createOrUpdateUserProfile(userData);

      if (result.success) {
        setUserProfile(result);
        setProfileExists(true);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to create or update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user profile (hybrid approach)
  const getProfile = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserProfile(address);

      if (result.success) {
        setUserProfile(result.data);
        setProfileExists(true);
        return result;
      } else {
        setError(result.error);
        setProfileExists(false);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to get profile";
      setError(errorMessage);
      setProfileExists(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for user profile by address (hybrid approach)
  const searchProfile = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchUserProfileByAddress(address);

      if (result.success) {
        setUserProfile(result.data);
        setProfileExists(true);
        return result;
      } else {
        setError(result.error);
        setProfileExists(false);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to search profile";
      setError(errorMessage);
      setProfileExists(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user profile (hybrid approach)
  const deleteProfile = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteUserProfile(address);

      if (result.success) {
        setUserProfile(null);
        setProfileExists(false);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to delete profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wallet balance
  const getBalance = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUserWalletBalance(address);

      if (result.success) {
        setWalletBalance(result.balance);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to get wallet balance";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user profile exists
  const checkProfileExists = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await checkUserProfileExists(address);

      if (result.success) {
        setProfileExists(result.exists);
        return result;
      } else {
        setError(result.error);
        setProfileExists(false);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to check profile existence";
      setError(errorMessage);
      setProfileExists(false);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new user in Supabase
  const registerUser = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerNewUser(address);

      if (result.success) {
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      const errorMessage = "Failed to register user";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear user profile
  const clearProfile = useCallback(() => {
    setUserProfile(null);
    setProfileExists(false);
  }, []);

  return {
    loading,
    error,
    userProfile,
    walletBalance,
    profileExists,
    createOrUpdateProfile,
    getProfile,
    searchProfile,
    deleteProfile,
    getBalance,
    checkProfileExists,
    registerUser,
    clearError,
    clearProfile,
  };
};
