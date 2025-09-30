import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHED_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User reference schema for Supabase (minimal data only)
export const createUserReferenceSchema = (userData) => {
  return {
    walletAddress: userData.address, // wallet address as primary key
    arweaveUrl: userData.arweaveUrl,
    createdAt: new Date().toISOString(),
  };
};

// Insert user reference into Supabase
export const insertUserReference = async (userData) => {
  try {
    const userReference = createUserReferenceSchema(userData);

    const { data, error } = await supabase
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

// Update user reference in Supabase
export const updateUserReference = async (address, arweaveUrl) => {
  try {
    const { data, error } = await supabase
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

// Get user reference from Supabase
export const getUserReference = async (address) => {
  try {
    const { data, error } = await supabase
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

// Delete user reference from Supabase
export const deleteUserReference = async (address) => {
  try {
    const { error } = await supabase
      .from("V3 Users")
      .delete()
      .eq("walletAddress", address);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "User reference deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user reference:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upsert user reference (insert or update)
export const upsertUserReference = async (userData) => {
  try {
    const userReference = createUserReferenceSchema(userData);

    const { data, error } = await supabase
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
