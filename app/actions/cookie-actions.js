"use server";

import { cookies } from "next/headers";

export async function setFirstVisitCookie() {
  const cookieStore = await cookies();
  
  cookieStore.set("first_seen", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year (seconds)
    sameSite: "Lax",
    secure: process.env.NEXT_PUBLIC_ENV === "dev" ? false : true,
  });
}

