import React from "react";
import { Resend } from "resend";
import TestingEmail from "@/components/EMAILS/testingEmail";

export default function Dashboard() {
  async function sendTestEmail() {
    "use server";

    const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY);
    await resend.emails.send({
      from: "blexi@blexitek.com",
      to: "kervin@blexitek.com",
      subject: "hello world",
      react: <TestingEmail url="https://google.com" />,
    });
  }

  return (
    <div>
      <form action={sendTestEmail}>
        <button className="bg-amber-500" type="submit">Send test email</button>
      </form>
    </div>
  );
}
