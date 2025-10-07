"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import MaskedDiv from "../TEMPLATEs/masked-div";
import { usePinataNFTStorage } from "../../lib/usePinataNFTStorage";

const ProfileHead = () => {
  const params = useParams();
  const { getProfile } = usePinataNFTStorage();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // The URL parameter is the wallet address
        const walletAddress = params.address;

        console.log("Fetching profile for wallet address:", walletAddress);

        // Get the full profile data from Pinata using the wallet address
        const profileResult = await getProfile(walletAddress);

        if (profileResult.success) {
          setProfileData(profileResult.data);
        } else {
          console.log("No profile data found for user:", walletAddress);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.address) {
      fetchUserProfile();
    }
  }, [params.address, getProfile]);

  if (loading) {
    return (
      <section className="w-full flex justify-center mt-6">
        <div className="text-white">Loading profile...</div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col items-center mt-6">
      {/* Cover Image */}
      <MaskedDiv maskType="type-4" size={0.98} className="my-4">
        {profileData?.sensitiveData?.data?.coverImage ? (
          <img
            src={profileData.sensitiveData.data.coverImage}
            alt="Cover image"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if cover image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <span className="text-white text-lg font-bold">No Cover Image</span>
          </div>
        )}
      </MaskedDiv>

      {/* Profile Picture */}
      <div className="relative -mt-12 mb-4">
        {profileData?.sensitiveData?.data?.profileImage ? (
          <img
            src={profileData.sensitiveData.data.profileImage}
            alt="Profile picture"
            className="w-30 h-30 rounded-full object-cover border-2 border-amber-500"
            style={{ aspectRatio: "1/1" }}
            onError={(e) => {
              // Fallback to default avatar if profile image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        ) : null}
        <Image
          width={120}
          height={120}
          src="/assets/global/avatar.png"
          alt="Default avatar"
          className="w-30 h-30 rounded-full object-cover border-2 border-amber-500"
          style={{
            display: profileData?.sensitiveData?.data?.profileImage
              ? "none"
              : "block",
            aspectRatio: "1/1",
          }}
        />
      </div>

      {/* User Info */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {profileData?.sensitiveData?.data?.fullName ||
            profileData?.sensitiveData?.data?.username ||
            "Unknown User"}
        </h1>
        <p className="text-amber-400 text-lg">
          @{profileData?.sensitiveData?.data?.username || "unknown"}
        </p>
        
      </div>
    </section>
  );
};

export default ProfileHead;
