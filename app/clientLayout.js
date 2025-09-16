"use client";

import { FirstVisitGate } from "@/components/UIs/SplashScreen";
import { Toaster } from "sonner";

export default function ClientLayout({ children, isFirstVisit }) {
  return (
    <>
      <Toaster position="bottom-right" expand={true} richColors closeButton />
        <main>
          <FirstVisitGate isFirstVisit={isFirstVisit}>
            {children}
          </FirstVisitGate>
        </main>
    </>
  );
}
