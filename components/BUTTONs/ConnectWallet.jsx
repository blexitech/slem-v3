"use client";

import React from "react";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";

import { Button } from "../TEMPLATEs/button";
import Image from "next/image";

const ConnectWallet = () => {
  const { address, isConnected } =
    useAppKitAccount();
  const { open } = useAppKit();

  return (
    <section className="w-full flex justify-center mt-6">
      {!isConnected ? (
        <Button
          onClick={() => open({ view: "Connect" })}
          className="gap-0 rounded font-bold font-angkor uppercase text-lg"
        >
          Connect Wallet
        </Button>
      ) : (
        <Button
          onClick={() => open({ view: "Account" })}
          className="gap-0 rounded py-0 ps-0"
        >
          <div className="me-0.5 flex aspect-square h-full p-1.5">
            <Image
              className="h-auto w-full rounded-full"
              src="/assets/global/avatar.png"
              alt="Profile image"
              width={70}
              height={50}
              aria-hidden="true"
            />
          </div>
          <p className="truncate text-xl">
            {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ""}
          </p>
        </Button>
      )}
    </section>
  );
};

export default ConnectWallet;
