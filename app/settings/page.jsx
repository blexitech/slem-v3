"use client";

import React, { useState, useEffect } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useHybridUser } from "../../lib/useHybridUser";

const SettingsPage = () => {
  const { address, isConnected } = useAppKitAccount();
  const {
    loading,
    error,
    userProfile,
    profileExists,
    searchProfile,
    createOrUpdateProfile,
    clearError,
  } = useHybridUser();

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    dateOfBirth: "",
    email: "",
  });

  // Load user profile when connected
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile();
    }
  }, [isConnected, address]);

  const loadUserProfile = async () => {
    const result = await searchProfile(address);
    if (result.success) {
      setProfileData(result.data);
      // Populate form with existing data
      const sensitiveData = result.data.sensitiveData?.data;
      if (sensitiveData) {
        setFormData({
          fullName: sensitiveData.fullName || "",
          username: sensitiveData.username || "",
          dateOfBirth: sensitiveData.dateOfBirth || "",
          email: sensitiveData.email || "",
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const userData = {
      address: address,
      fullName: formData.fullName,
      username: formData.username,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
      metadata: {
        createdAt:
          profileData?.sensitiveData?.data?.metadata?.createdAt ||
          new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };

    const result = await createOrUpdateProfile(userData);
    if (result.success) {
      setProfileData(result);
      setIsEditing(false);
      // Reload profile to get updated data
      await loadUserProfile();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data
    if (profileData?.sensitiveData?.data) {
      const sensitiveData = profileData.sensitiveData.data;
      setFormData({
        fullName: sensitiveData.fullName || "",
        username: sensitiveData.username || "",
        dateOfBirth: sensitiveData.dateOfBirth || "",
        email: sensitiveData.email || "",
      });
    }
    clearError();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-center text-gray-400">
              Please connect your wallet to access settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>

          {profileData ? (
            <div>
              {!isEditing ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name
                      </label>
                      <p className="text-white">
                        {profileData.sensitiveData?.data?.fullName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                      </label>
                      <p className="text-white">
                        {profileData.sensitiveData?.data?.username || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <p className="text-white">
                        {profileData.sensitiveData?.data?.dateOfBirth ||
                          "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-white">
                        {profileData.sensitiveData?.data?.email || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleEdit}
                      className="px-6 py-2 bg-amber-400 text-black rounded-lg font-bold hover:bg-amber-300 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>

                  {profileData.arweaveUrl && (
                    <div className="mt-4 p-3 bg-gray-700 rounded">
                      <p className="text-xs text-gray-400">
                        Profile stored on Arweave + Supabase
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Arweave URL: {profileData.arweaveUrl}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-amber-400 text-black rounded-lg font-bold hover:bg-amber-300 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-6">
                You don't have a profile yet. Create one to get started.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-amber-400 text-black rounded-lg font-bold hover:bg-amber-300 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating Profile..." : "Create Profile"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
