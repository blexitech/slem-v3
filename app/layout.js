import "./globals.css";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
import ClientLayout from "@/app/clientLayout";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Card } from "@/components/TEMPLATEs/card";
import LargeScreenNotice from "@/components/UIs/LargeScreenNotice";
import MobileNav from "@/components/UIs/MobileNav";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const isFirstVisit = !cookieStore.get("first_seen");

  return (
    <html lang="en">
      <head>
        <title>SLE Marketplace</title>
        <meta name="description" content="SLE Marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ClientLayout isFirstVisit={isFirstVisit}>
          <LargeScreenNotice />
          {children}
          <MobileNav />
        </ClientLayout>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
    </html>
  );
}
