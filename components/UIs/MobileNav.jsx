"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { LimelightNav, NavItem } from "@/components/TEMPLATEs/limelight-nav";
import { Home, Ticket, PlusCircle, Megaphone, Menu } from 'lucide-react';

const MobileNav = () => {
    const router = useRouter();
    const customNavItems = [
        { id: 'home', icon: <Home />, label: 'Home', onClick: () => router.push('/')},
        { id: 'raffle', icon: <Ticket />, label: 'Raffle', onClick: () => router.push('/raffle') },
        { id: 'mint', icon: <PlusCircle />, label: 'Mint', onClick: () => router.push('/mint') },
        { id: 'pulse', icon: <Megaphone />, label: 'Pulse', onClick: () => router.push('/pulse') },
        { id: 'menu', icon: <Menu />, label: 'Menu', onClick: () => router.push('/menu') },
      ];


  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex items-end justify-center">
      {/* Nav container */}
      <LimelightNav className="bg-primary-foreground rounded-xl" items={customNavItems} />
    </div>
  );
};

export default MobileNav;
