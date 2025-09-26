"use server";

import { Resend } from "resend";
import { BetaEmail } from "@/components/EMAILS/betaEmail";
import { render } from "@react-email/render";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY);

export async function sendBetaEmail(recipientEmail, recipientName) {
  console.log("Server action called with:", { recipientEmail, recipientName });

  try {
    console.log("Checking Resend API key...");
    if (!process.env.NEXT_PUBLIC_RESEND_KEY) {
      throw new Error("NEXT_PUBLIC_RESEND_KEY environment variable is not set");
    }
    console.log("API key found, proceeding with email rendering...");

    // Render the email component to HTML
    const emailHtml = await render(
      <BetaEmail url="https://beta.studentloanexp.io/" name={recipientName} />
    );
    console.log("Email HTML rendered successfully");

    // Send the email
    console.log("Sending email via Resend...");
    const data = await resend.emails.send({
      from: "Blexi Team <blexi@blexitek.com>",
      to: [recipientEmail],
      subject: "Your Exclusive Invite: Join the SLE Marketplace Beta Program",
      html: emailHtml,
    });
    console.log("Email sent successfully:", data);

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}
