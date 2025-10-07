"use client";

import React from "react";
import ProfileHead from "@/components/UIs/ProfileHead";
import ProfileBody from "@/components/UIs/ProfileBody";
import Alert from "@/components/UIs/Alert";
import { useAppKitAccount } from "@reown/appkit/react";

const ProfilePage = () => {
  const { address, isConnected } = useAppKitAccount();

  return (
    <main>
      {!isConnected ? (
        <Alert
          type="warning"
          title="Wallet Not Connected"
          message="Please connect your wallet to view and manage your profile. This allows you to access your personalized content and settings."
          note="Your wallet connection is required to access profile features and personalized content."
        />
      ) : (
        <>
          <ProfileHead />
          <ProfileBody />
        </>
      )}
    </main>
  );
};

export default ProfilePage;
