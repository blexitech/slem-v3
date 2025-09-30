import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHED_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create server-side Supabase client
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// Server-side functions for Supabase operations
export const serverInsertUserReference = async (userData) => {
  try {
    const userReference = {
      walletAddress: userData.address,
      arweaveUrl: userData.arweaveUrl,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("V3 Users")
      .insert([userReference])
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "User reference created successfully",
    };
  } catch (error) {
    console.error("Error inserting user reference:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const serverGetUserReference = async (address) => {
  try {
    const { data, error } = await supabaseServer
      .from("V3 Users")
      .select("*")
      .eq("walletAddress", address)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return {
          success: false,
          error: "User reference not found",
        };
      }
      throw error;
    }

    return {
      success: true,
      data: data,
      message: "User reference retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting user reference:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const serverUpdateUserReference = async (address, arweaveUrl) => {
  try {
    const { data, error } = await supabaseServer
      .from("V3 Users")
      .update({
        arweaveUrl: arweaveUrl,
      })
      .eq("walletAddress", address)
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "User reference updated successfully",
    };
  } catch (error) {
    console.error("Error updating user reference:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const serverUpsertUserReference = async (userData) => {
  try {
    const userReference = {
      walletAddress: userData.address,
      arweaveUrl: userData.arweaveUrl,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from("V3 Users")
      .upsert([userReference], {
        onConflict: "walletAddress",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data[0],
      message: "User reference upserted successfully",
    };
  } catch (error) {
    console.error("Error upserting user reference:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
