-- Supabase Table Schema for SLE Marketplace
-- This table stores minimal user reference data, while sensitive data is stored on Arweave

-- Create V3 Users table (matches existing structure)
CREATE TABLE IF NOT EXISTS public."V3 Users" (
    "walletAddress" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "arweaveUrl" TEXT NULL,
    CONSTRAINT "V3 Users_pkey" PRIMARY KEY ("walletAddress")
) TABLESPACE pg_default;

-- Create an index on arweaveUrl for faster lookups
CREATE INDEX IF NOT EXISTS idx_v3_users_arweave_url ON public."V3 Users"("arweaveUrl");

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_v3_users_created_at ON public."V3 Users"(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public."V3 Users" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage their own records
-- Note: In a real application, you'd want to verify the wallet address matches the authenticated user
CREATE POLICY "Users can manage their own references" ON public."V3 Users"
    FOR ALL USING (true); -- For now, allowing all operations. In production, implement proper auth

-- Example of how the data structure looks:
-- walletAddress: "0x1234567890abcdef..." (wallet address)
-- arweaveUrl: "https://arweave.net/abc123def456..."
-- created_at: "2024-01-01T00:00:00Z"

-- The sensitive data stored on Arweave includes:
-- - fullName
-- - username  
-- - dateOfBirth
-- - email
-- - metadata (createdAt, lastUpdated, etc.)
