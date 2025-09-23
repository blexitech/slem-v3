"use client";
import Image from "next/image";
import React from "react";
import "@reown/appkit/react";

import ConnectWallet from "@/components/BUTTONs/ConnectWallet";

const Menu = () => {
  return (
    <main>
      <section className="w-full flex justify-center mt-6">
        <Image
          className="w-[60vw]"
          src="/assets/splash/splashLogo.png"
          width={100}
          height={100}
          alt="Logo"
        />
      </section>
       <ConnectWallet />
    </main>
  );
};

export default Menu;
