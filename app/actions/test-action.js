"use server";

export async function testServerAction() {
  console.log("Test server action called!");
  return { success: true, message: "Server action is working!" };
}
