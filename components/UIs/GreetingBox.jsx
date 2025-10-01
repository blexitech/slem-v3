"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import { usePinataNFTStorage } from "../../lib/usePinataNFTStorage";
import {
  getUserProfile,
  createOrUpdateUserProfile,
} from "../../lib/supabase-client";

const GreetingBox = () => {
  const { address, isConnected } = useAppKitAccount();
  const { getProfile } = usePinataNFTStorage();

  const [profileData, setProfileData] = useState(null);

  const handleUserConnect = useCallback(async () => {
    try {
      console.log("🔍 Checking user record for wallet:", address);

      // First, check if user exists in Supabase
      const supabaseResult = await getUserProfile(address);

      if (!supabaseResult.success) {
        // User doesn't exist in Supabase, create a new record
        console.log("👤 Creating new user record in Supabase for:", address);

        const newUserData = {
          walletAddress: address,
          pinataCid: null,
        };

        const createResult = await createOrUpdateUserProfile(newUserData);

        if (createResult.success) {
          console.log("✅ New user record created successfully");
        } else {
          console.error("❌ Failed to create user record:", createResult.error);
        }
      } else {
        console.log("✅ User record already exists in Supabase");
      }

      // Then load user profile data from Pinata (if exists)
      const profileResult = await getProfile(address);

      if (profileResult.success) {
        setProfileData(profileResult.data);
      } else {
        console.log("No profile data found for user:", address);
      }
    } catch (error) {
      console.error("💥 Error in handleUserConnect:", error);
    }
  }, [address, getProfile]);

  // Load user profile when connected
  useEffect(() => {
    if (isConnected && address) {
      handleUserConnect();
    }
  }, [isConnected, address, handleUserConnect]);

  return (
    <div className="w-[96vw] mx-auto mt-6 flex justify-between items-center">
      <div>
        {isConnected ? (
          <div className="flex flex-col items-start">
            <h3 className="text-amber-500 font-angkor uppercase text-sm">
              SLE Marketplace
            </h3>
            <p className="text-center text-md font-bold text-white">
              Hello, {profileData?.sensitiveData?.data?.username || "User"}!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-start">
            <h3 className="text-amber-400 font-angkor uppercase text-sm">
              SLE Marketplace
            </h3>
            <p className="text-center text-md font-bold text-white">
              Hello, good day!
            </p>
          </div>
        )}
      </div>
      <div>
        <Link href="/">
          {profileData?.sensitiveData?.data?.profileImage ? (
            <img
              className="w-[20vw] h-[20vw] rounded-full object-cover border-2 border-amber-500"
              src={profileData.sensitiveData.data.profileImage}
              alt="Profile"
              style={{ aspectRatio: "1/1" }}
              onError={(e) => {
                // Fallback to default avatar if profile image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
          ) : null}
          <Image
            className="w-[20vw] h-[20vw] rounded-full object-cover"
            src="/assets/global/avatar.png"
            alt="avatar"
            width={1000}
            height={1000}
            style={{
              display: profileData?.sensitiveData?.data?.profileImage
                ? "none"
                : "block",
              aspectRatio: "1/1",
            }}
          />
        </Link>
      </div>
    </div>
  );
};

export default GreetingBox;
