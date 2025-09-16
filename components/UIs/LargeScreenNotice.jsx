"use client";

import { Card } from "@/components/TEMPLATEs/card";

export default function LargeScreenNotice() {
  return (
    <div className="hidden md:flex fixed inset-0 z-[9998] items-center justify-center bg-black">
      <div className="max-w-[520px] w-[90%]">
        <Card
          variant="dots"
          title="The marketplace experience is better on mobile devices"
          className="bg-background"
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            For the best experience, please visit on a mobile device. We’re
            working on an optimized desktop and tablet view.
          </p>
        </Card>
      </div>
    </div>
  );
}
