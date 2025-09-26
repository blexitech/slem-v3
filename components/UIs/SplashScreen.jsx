"use client";
import { useState } from "react";
import Image from "next/image";
import { setFirstVisitCookie } from "@/app/actions/cookie-actions";

/**
 * Reusable splash screen component.
 * You control dismissal via the `onClose` handler.
 */

export function SplashScreen({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      className="fixed flex flex-col items-center justify-around inset-0 z-[9999] bg-black text-white md:hidden lg:hidden xl:hidden 2xl:hidden"
    >
      <div className="flex flex-col gap-2 items-center">
        <Image
          className="w-[65vw] object-center"
          src="/assets/splash/gridImage.png"
          width={1000}
          height={1000}
          alt="Company grid image"
        />
        <Image
          className="w-[75vw] h-[20vh]"
          src="/assets/splash/splashLogo.png"
          width={2000}
          height={2000}
          alt="underline"
        />
      </div>

      <div>
        <p className="font-Angkor uppercase font-bold text-3xl">
          Create. <span className="text-amber-400">Sell.</span> Pay-Off
        </p>
      </div>

      <div className="w-[70vw]">
        <p className="font-inter text-center">
          By continuing, you agree to SLEM’s{" "}
          <span className="text-amber-400">Privacy Policy</span> and{" "}
          <span className="text-amber-400">Terms of Service</span>
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded px-4 py-2 text-lg font-bold text-black font-angkor uppercase bg-amber-400"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

/**
 * First-visit controller: keeps the app mostly client-side while enabling
 * zero-flicker SSR splash on the very first paint. Pass `isFirstVisit` from layout.
 */
export function FirstVisitGate({ isFirstVisit, children }) {
  const [show, setShow] = useState(false); // Always false for now to test

  const handleClose = async () => {
    setShow(false);
    // Set the cookie when splash screen is dismissed
    await setFirstVisitCookie();
  };

  return (
    <>
      {show && <SplashScreen onClose={handleClose} />}
      {children}
    </>
  );
}
