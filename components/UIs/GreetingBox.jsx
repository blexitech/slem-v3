"use client";

import React, { useEffect, useState } from "react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import { useHybridUser } from "../../lib/useHybridUser";

const GreetingBox = () => {
  const { address, isConnected } = useAppKitAccount();
  const { searchProfile, registerUser } = useHybridUser();

  const [profileData, setProfileData] = useState(null);

  // Load user profile when connected
  useEffect(() => {
    if (isConnected && address) {
      handleUserConnect();
    }
  }, [isConnected, address]);

  const handleUserConnect = async () => {
    // First, register the user in Supabase (if not already registered)
    const registerResult = await registerUser(address);

    if (registerResult.success) {
      console.log(
        registerResult.isNewUser ? "New user registered" : "Existing user found"
      );
    } else {
      console.error("Failed to register user:", registerResult.error);
    }

    // Then load their profile data
    const profileResult = await searchProfile(address);

    if (profileResult.success) {
      setProfileData(profileResult.data);
    }
  };

  return (
    <div className="w-[96vw] mx-auto mt-6 flex justify-between items-center">
      <div>
        {isConnected ? (
          <div className="flex flex-col items-start">
            <h3 className="text-amber-400 font-angkor uppercase text-sm">
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
          <Image
            className="w-[20vw] rounded-full"
            src="/assets/global/avatar.png"
            alt="avatar"
            width={1000}
            height={1000}
          />
        </Link>
      </div>
    </div>
  );
};

export default GreetingBox;
