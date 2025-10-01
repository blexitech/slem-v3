"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { usePinataNFTStorage } from "../../lib/usePinataNFTStorage";
import GreetingBox from "@/components/UIs/GreetingBox";
import ProfileForm from "@/components/FORMs/ProfileForm";
import ErrorBoundary from "@/components/UIs/ErrorBoundary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TEMPLATEs/tabs";

const SettingsPage = () => {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const {
    loading,
    error,
    userProfile,
    profileExists,
    getProfile,
    createOrUpdateProfile,
    clearError,
  } = usePinataNFTStorage();

  const [profileData, setProfileData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");

  // No longer needed - Pinata handles storage directly

  const loadUserProfile = useCallback(async () => {
    try {
      console.log("🔄 Loading user profile for address:", address);
      const result = await getProfile(address);
      console.log("🔄 Profile load result:", result);

      if (result.success) {
        console.log("✅ Setting profile data:", result.data);
        setProfileData(result.data);
      } else {
        console.log("❌ Profile load failed:", result.error);
      }
    } catch (error) {
      console.error("💥 Error loading profile:", error);
    }
  }, [address, getProfile]);

  // Load user profile when connected
  useEffect(() => {
    if (isConnected && address) {
      console.log("🔍 Settings page - embeddedWalletInfo:", embeddedWalletInfo);
      console.log(
        "📧 Settings page - wallet email:",
        embeddedWalletInfo?.user?.email
      );
      loadUserProfile();
    }
  }, [isConnected, address, loadUserProfile]);

  const handleFormSubmit = async (formData) => {
    console.log("🚀 V3 Form submission started with data:", formData);
    clearError();
    setIsFormLoading(true);
    setLoadingStage("Preparing data...");

    try {
      const userData = {
        fullName: formData.fullName,
        username: formData.username,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
      };

      console.log("📦 Prepared user data for V3 submission:", userData);
      setLoadingStage("Uploading to Pinata...");

      // Use the V3 system
      const result = await createOrUpdateProfile(userData, address);

      console.log("✅ V3 Profile creation/update result:", result);

      if (result.success) {
        setLoadingStage("Complete!");
        setProfileData(result);
        setIsFormOpen(false);

        // Show success message
        setSuccessMessage(
          "Profile saved successfully! Data stored on Pinata IPFS."
        );

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);

        // Reload profile to get updated data
        setLoadingStage("Reloading profile...");
        console.log("🔄 Reloading profile...");
        await loadUserProfile();
        console.log("✅ Profile reloaded successfully");

        setLoadingStage("Complete!");
      } else {
        console.error("❌ V3 Profile creation failed:", result);
        setLoadingStage("Failed");
      }
    } catch (error) {
      console.error("💥 Error during V3 form submission:", error);
      setLoadingStage("Error occurred");
    } finally {
      setIsFormLoading(false);
      setLoadingStage("");
      console.log("🏁 V3 Form submission completed");
    }
  };

  const handleEditClick = () => {
    setSuccessMessage(null); // Clear any success message
    setIsFormLoading(false); // Reset form loading state
    setLoadingStage(""); // Reset loading stage
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormLoading(false); // Reset form loading state
    setLoadingStage(""); // Reset loading stage
    setIsFormOpen(false);
  };

  if (!isConnected) {
    return (
      <div className="w-full bg-black text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black border border-amber-500 p-6 rounded-lg">
            <p className="text-center text-gray-400">
              Please connect your wallet to access settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full bg-black text-white">
        <GreetingBox />
        <section className="w-full flex justify-center mt-10 px-4">
          <div className="w-full max-w-6xl">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-between overflow-x-auto">
                <TabsTrigger value="profile">
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="student-loan">
                  <span className="hidden sm:inline">My Student Loan</span>
                  <span className="sm:hidden">Loans</span>
                </TabsTrigger>
                <TabsTrigger value="account">
                  <span className="hidden sm:inline">My Account</span>
                  <span className="sm:hidden">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <span className="hidden sm:inline">My Notifications</span>
                  <span className="sm:hidden">Alerts</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-amber-500 mb-4">
                    Profile Information
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Your data is encrypted and decentralized. We have no access
                    to your information.
                  </p>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-red-400 rounded-full"></div>
                        <div>
                          <p className="text-red-400 font-medium">Error</p>
                          <p className="text-gray-400 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-md">
                      <p className="text-green-400 text-sm">{successMessage}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Profile Display - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Full Name
                        </label>
                        <p className="text-white text-base">
                          {profileData?.sensitiveData?.data?.fullName ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Username
                        </label>
                        <p className="text-white text-base">
                          {profileData?.sensitiveData?.data?.username ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Email Address
                        </label>
                        <p className="text-white text-base">
                          {(() => {
                            const profileEmail =
                              profileData?.sensitiveData?.data?.email;
                            const walletEmail = embeddedWalletInfo?.user?.email;

                            // Check if profileEmail is a real email or just "Not provided"
                            const hasRealProfileEmail =
                              profileEmail &&
                              profileEmail !== "Not provided" &&
                              profileEmail.includes("@");

                            const finalEmail = hasRealProfileEmail
                              ? profileEmail
                              : walletEmail || "Not provided";

                            console.log("📧 Email display logic:", {
                              profileEmail,
                              walletEmail,
                              hasRealProfileEmail,
                              finalEmail,
                            });

                            return finalEmail;
                          })()}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Date of Birth
                        </label>
                        <p className="text-white text-base">
                          {profileData?.sensitiveData?.data?.dateOfBirth
                            ? new Date(
                                profileData.sensitiveData.data.dateOfBirth
                              ).toLocaleDateString()
                            : "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Image Fields - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Profile Image
                        </label>
                        {profileData?.sensitiveData?.data?.profileImage ? (
                          <div className="flex items-center">
                            <img
                              src={profileData.sensitiveData.data.profileImage}
                              alt="Profile"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                            <div
                              style={{ display: "none" }}
                              className="text-gray-500 text-sm"
                            >
                              Invalid image URL
                            </div>
                          </div>
                        ) : (
                          <p className="text-white text-base">Not provided</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Cover Image
                        </label>
                        {profileData?.sensitiveData?.data?.coverImage ? (
                          <div>
                            <img
                              src={profileData.sensitiveData.data.coverImage}
                              alt="Cover"
                              className="w-full h-32 object-cover rounded-lg border border-gray-600"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                            <div
                              style={{ display: "none" }}
                              className="text-gray-500 text-sm"
                            >
                              Invalid image URL
                            </div>
                          </div>
                        ) : (
                          <p className="text-white text-base">Not provided</p>
                        )}
                      </div>
                    </div>

                    {/* Storage Info */}
                    {profileData?.sensitiveData?.data?.metadata && (
                      <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">
                          Storage Information
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>
                            <span className="font-medium">Version:</span>{" "}
                            {profileData.sensitiveData.data.metadata.version ||
                              "Unknown"}
                          </div>
                          <div>
                            <span className="font-medium">Storage:</span>{" "}
                            {profileData.sensitiveData.data.metadata.storage ||
                              "Unknown"}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {profileData.sensitiveData.data.metadata.createdAt
                              ? new Date(
                                  profileData.sensitiveData.data.metadata.createdAt
                                ).toLocaleDateString()
                              : "Unknown"}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span>{" "}
                            {profileData.sensitiveData.data.metadata.lastUpdated
                              ? new Date(
                                  profileData.sensitiveData.data.metadata.lastUpdated
                                ).toLocaleDateString()
                              : "Unknown"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-700">
                      <button
                        onClick={handleEditClick}
                        className="px-6 py-2 bg-amber-500 text-black rounded-md font-medium hover:bg-amber-400 transition-colors duration-200"
                      >
                        Edit Profile (V3)
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="student-loan">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-amber-500 mb-4">
                    Student Loan Management
                  </h2>
                  <p className="text-gray-300">
                    View and manage your student loan information and payments.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="account">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-amber-500 mb-4">
                    Account Settings
                  </h2>
                  <p className="text-gray-300">
                    Configure your account preferences and security settings.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="bg-black border border-amber-500 rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <h2 className="text-xl font-semibold text-amber-500 mb-4">
                    Email Notifications
                  </h2>
                  <p className="text-gray-300">
                    Manage your notification preferences and alerts.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Profile Form Modal */}
        <ProfileForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={(() => {
            const initialData = profileData?.sensitiveData?.data || {};
            console.log("📝 ProfileForm initialData:", initialData);
            console.log("📝 Full profileData:", profileData);
            return initialData;
          })()}
          embeddedWalletInfo={embeddedWalletInfo}
          walletAddress={address}
        />
      </div>
    </ErrorBoundary>
  );
};

export default SettingsPage;
