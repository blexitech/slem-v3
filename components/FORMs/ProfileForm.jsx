"use client";

import React, { useState, useEffect } from "react";
import { usePinataNFTStorage } from "../../lib/usePinataNFTStorage.js";
import {
  uploadFileToPinata,
  createPinataConfigFromEnv,
} from "../../lib/pinata.js";

const ProfileForm = ({
  isOpen,
  onClose,
  initialData = {},
  embeddedWalletInfo = null,
  walletAddress,
}) => {
  // Initialize the V3 Pinata + NFT.Storage user hook
  const { createOrUpdateProfile, loading, error, clearError } =
    usePinataNFTStorage();

  // Helper function to get email from embedded wallet info
  const getEmailFromWallet = (walletInfo) => {
    console.log("🔍 Getting email from wallet info:", walletInfo);

    const email =
      walletInfo?.user?.email ||
      walletInfo?.email ||
      walletInfo?.userInfo?.email ||
      walletInfo?.userInfo?.user?.email ||
      "";

    console.log("📧 Extracted email:", email);
    return email;
  };

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    dateOfBirth: "",
    profileImage: "",
    coverImage: "",
  });

  const [imageFiles, setImageFiles] = useState({
    profileImage: null,
    coverImage: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    profileImage: null,
    coverImage: null,
  });

  const [errors, setErrors] = useState({});
  const [loadingStage, setLoadingStage] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Update form data when initialData or embeddedWalletInfo changes
  useEffect(() => {
    const walletEmail = getEmailFromWallet(embeddedWalletInfo);
    console.log("🔄 Updating form data:", {
      initialData,
      walletEmail,
      embeddedWalletInfo,
    });

    // Check if initialData.email is a real email or just "Not provided"
    const hasRealProfileEmail =
      initialData.email &&
      initialData.email !== "Not provided" &&
      initialData.email.includes("@");

    const emailToUse = hasRealProfileEmail
      ? initialData.email
      : walletEmail || initialData.email || "";

    console.log("📧 Email logic:", {
      hasRealProfileEmail,
      initialDataEmail: initialData.email,
      walletEmail,
      finalEmail: emailToUse,
    });

    setFormData({
      fullName: initialData.fullName || "",
      username: initialData.username || "",
      email: emailToUse,
      dateOfBirth: initialData.dateOfBirth || "",
      profileImage: initialData.profileImage || "",
      coverImage: initialData.coverImage || "",
    });

    // Reset image files and previews when form opens
    setImageFiles({
      profileImage: null,
      coverImage: null,
    });
    setImagePreviews({
      profileImage: null,
      coverImage: null,
    });
  }, [initialData, embeddedWalletInfo]);

  // Watch for loading state changes from the hook
  useEffect(() => {
    if (!loading && loadingStage) {
      // Clear loading stage when hook loading is false
      setLoadingStage("");
    }
  }, [loading, loadingStage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Image size must be less than 5MB",
        }));
        return;
      }

      // Store the file
      setImageFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => ({
        ...prev,
        [name]: previewUrl,
      }));

      // Clear any existing errors
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!walletAddress) {
      setErrors({
        general: "Missing wallet connection",
      });
      return;
    }

    console.log("🚀 V3 Form submission started with data:", formData);
    clearError();
    setLoadingStage("Preparing data...");

    try {
      // Upload images to Pinata first if they exist
      let profileImageUrl = formData.profileImage;
      let coverImageUrl = formData.coverImage;

      if (imageFiles.profileImage) {
        setLoadingStage("Uploading profile image...");
        const pinataConfig = createPinataConfigFromEnv();
        const profileImageResult = await uploadFileToPinata(
          imageFiles.profileImage,
          pinataConfig,
          {
            name: `profile-image-${walletAddress}-${Date.now()}`,
            keyvalues: {
              type: "profile-image",
              walletAddress: walletAddress,
            },
          }
        );

        if (profileImageResult.success) {
          profileImageUrl = `https://gateway.pinata.cloud/ipfs/${profileImageResult.cid}`;
          console.log("✅ Profile image uploaded:", profileImageUrl);
        } else {
          throw new Error(
            `Failed to upload profile image: ${profileImageResult.error}`
          );
        }
      }

      if (imageFiles.coverImage) {
        setLoadingStage("Uploading cover image...");
        const pinataConfig = createPinataConfigFromEnv();
        const coverImageResult = await uploadFileToPinata(
          imageFiles.coverImage,
          pinataConfig,
          {
            name: `cover-image-${walletAddress}-${Date.now()}`,
            keyvalues: {
              type: "cover-image",
              walletAddress: walletAddress,
            },
          }
        );

        if (coverImageResult.success) {
          coverImageUrl = `https://gateway.pinata.cloud/ipfs/${coverImageResult.cid}`;
          console.log("✅ Cover image uploaded:", coverImageUrl);
        } else {
          throw new Error(
            `Failed to upload cover image: ${coverImageResult.error}`
          );
        }
      }

      // Prepare user data with uploaded image URLs
      const userData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
      };

      console.log("📦 Prepared user data for V3 submission:", userData);
      setLoadingStage("Saving profile...");

      // Create or update profile using V3 system
      const result = await createOrUpdateProfile(userData, walletAddress);

      console.log("✅ V3 Profile creation/update result:", result);

      if (result.success) {
        setLoadingStage("Complete!");
        setSuccessMessage(
          "Profile saved successfully! Data stored on Pinata IPFS."
        );

        // Close form after success
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 2000);
      } else {
        console.error("❌ V3 Profile creation failed:", result);
        setLoadingStage("Failed");
        setErrors({ general: result.error || "Failed to save profile" });
      }
    } catch (error) {
      console.error("💥 Error during V3 form submission:", error);
      setLoadingStage("Error occurred");
      setErrors({ general: error.message || "An error occurred" });
    } finally {
      // Don't clear loading stage here - let the hook handle it
      // setLoadingStage("");
    }
  };

  const handleClose = () => {
    const walletEmail = getEmailFromWallet(embeddedWalletInfo);

    // Check if initialData.email is a real email or just "Not provided"
    const hasRealProfileEmail =
      initialData.email &&
      initialData.email !== "Not provided" &&
      initialData.email.includes("@");

    const emailToUse = hasRealProfileEmail
      ? initialData.email
      : walletEmail || initialData.email || "";

    setFormData({
      fullName: initialData.fullName || "",
      username: initialData.username || "",
      email: emailToUse,
      dateOfBirth: initialData.dateOfBirth || "",
      profileImage: initialData.profileImage || "",
      coverImage: initialData.coverImage || "",
    });
    setImageFiles({
      profileImage: null,
      coverImage: null,
    });
    setImagePreviews({
      profileImage: null,
      coverImage: null,
    });
    setErrors({});
    setSuccessMessage(null);
    setLoadingStage("");
    clearError();
    onClose();
  };

  // Debug log when form opens
  useEffect(() => {
    if (isOpen) {
      console.log("🚀 ProfileForm opened with:", {
        initialData,
        embeddedWalletInfo,
        walletEmail: getEmailFromWallet(embeddedWalletInfo),
        currentFormData: formData,
      });
    }
  }, [isOpen, initialData, embeddedWalletInfo, formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">
            Edit Profile (V3 - Pinata)
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-md">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Hook Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Loading Progress Indicator */}
          {loading && loadingStage && (
            <div className="mb-6 p-4 bg-gray-800 border border-amber-400 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 bg-yellow-400 rounded-full"></div>
                <div>
                  <p className="text-yellow-400 font-medium">{loadingStage}</p>
                  <p className="text-gray-400 text-sm">
                    {loadingStage === "Preparing data..." &&
                      "Getting your information ready..."}
                    {loadingStage === "Uploading to Pinata..." &&
                      "Storing your data on Pinata IPFS..."}
                    {loadingStage === "Complete!" &&
                      "All done! Your profile has been saved securely."}
                    {loadingStage === "Failed" &&
                      "Something went wrong. Please try again."}
                    {loadingStage === "Error occurred" &&
                      "An error occurred. Please check your connection and try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-white mb-1"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-purple-100 text-black rounded-md border ${
                errors.fullName ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              placeholder="Enter your full name"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white mb-1"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-purple-100 text-black rounded-md border ${
                errors.username ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-purple-200 text-black rounded-md border ${
                errors.email ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              placeholder={
                getEmailFromWallet(embeddedWalletInfo)
                  ? "Email from your wallet"
                  : "Enter your email"
              }
              disabled={loading}
            />
            {getEmailFromWallet(embeddedWalletInfo) && (
              <p className="mt-1 text-xs text-green-400">
                ✓ Email prefilled from your wallet connection
              </p>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-white mb-1"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-purple-200 text-black rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={loading}
            />
          </div>

          {/* Profile Image */}
          <div>
            <label
              htmlFor="profileImage"
              className="block text-sm font-medium text-white mb-1"
            >
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full px-3 py-2 bg-purple-200 text-black rounded-md border ${
                errors.profileImage ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              disabled={loading}
            />
            {imagePreviews.profileImage && (
              <div className="mt-2">
                <img
                  src={imagePreviews.profileImage}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                />
                <p className="text-xs text-gray-400 mt-1">Preview</p>
              </div>
            )}
            {errors.profileImage && (
              <p className="mt-1 text-sm text-red-400">{errors.profileImage}</p>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-white mb-1"
            >
              Cover Image
            </label>
            <input
              type="file"
              id="coverImage"
              name="coverImage"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full px-3 py-2 bg-purple-200 text-black rounded-md border ${
                errors.coverImage ? "border-red-500" : "border-gray-600"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              disabled={loading}
            />
            {imagePreviews.coverImage && (
              <div className="mt-2">
                <img
                  src={imagePreviews.coverImage}
                  alt="Cover preview"
                  className="w-full h-24 object-cover rounded-lg border border-gray-600"
                />
                <p className="text-xs text-gray-400 mt-1">Preview</p>
              </div>
            )}
            {errors.coverImage && (
              <p className="mt-1 text-sm text-red-400">{errors.coverImage}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-400 text-black rounded-md font-medium hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? loadingStage || "Saving..." : "Save Changes (V3)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
