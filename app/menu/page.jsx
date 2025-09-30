"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import "@reown/appkit/react";

import ConnectWallet from "@/components/BUTTONs/ConnectWallet";
import { MenuVertical } from "@/components/TEMPLATEs/menu-vertical";
import GreetingBox from "@/components/UIs/GreetingBox";

const Menu = () => {
  const menuItems= [
    {
      label: "SLE U",
      href: "/sleu",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
    },
    {
      label: "Changelogs",
      href: "https://slemarketplace.featurebase.app/changelog",
      target: "_blank",
    },
    {
      label: "Help Center",
      href: "https://slemarketplace.featurebase.app/help",
      target: "_blank",
    },
  ];

  return (
    <main>
      <section className="w-full flex justify-center mt-0">
        <GreetingBox />
      </section>
       <ConnectWallet />
      <section className="w-full flex justify-center mt-20">
        <MenuVertical menuItems={menuItems} />
      </section>
      <section className="w-full flex justify-center mt-20">
        <ul className="flex gap-4 text-white font-angkor text-lg uppercase">
          <li><Link target="_blank" href="https://www.instagram.com/studentloanexperiment">Instagram</Link></li>
          <li><Link target="_blank" className="text-amber-500" href="https://discord.gg/QhHutrrz">Discord</Link></li>
          <li><Link target="_blank" href="https://www.tiktok.com/@studentloanexperiment">TikTok</Link></li>
        </ul>
      </section>
    </main>
  );
};

export default Menu;
