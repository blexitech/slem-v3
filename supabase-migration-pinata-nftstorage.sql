-- Migration Script: Arweave + Storacha → Pinata + NFT.Storage
-- This script migrates the existing "V3 Users" table to use Pinata and NFT.Storage

-- ==============================================
-- 1. ALTER EXISTING V3 USERS TABLE
-- ==============================================

-- Add new columns for Pinata and NFT.Storage CIDs
ALTER TABLE public."V3 Users" 
ADD COLUMN IF NOT EXISTS "pinataCid" TEXT,
ADD COLUMN IF NOT EXISTS "nftMetadataCid" TEXT;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_v3_users_pinata_cid ON public."V3 Users"("pinataCid");
CREATE INDEX IF NOT EXISTS idx_v3_users_nft_metadata_cid ON public."V3 Users"("nftMetadataCid");

-- ==============================================
-- 2. MIGRATION NOTES
-- ==============================================

-- IMPORTANT: Before running this migration:
-- 1. Backup your existing data
-- 2. Migrate existing Arweave data to Pinata (see migration script below)
-- 3. Update your application code to use the new Pinata/NFT.Storage endpoints
-- 4. Test thoroughly before removing the arweaveUrl column

-- ==============================================
-- 3. DATA MIGRATION SCRIPT (Run after Pinata migration)
-- ==============================================

-- This section should be run AFTER you've migrated your Arweave data to Pinata
-- and have the new CIDs ready

/*
-- Example: Update existing records with new Pinata CIDs
-- Replace 'your_new_pinata_cid_here' with actual CIDs from your Pinata migration

UPDATE public."V3 Users" 
SET "pinataCid" = 'your_new_pinata_cid_here'
WHERE "arweaveUrl" IS NOT NULL 
AND "pinataCid" IS NULL;

-- Example: Update with NFT metadata CIDs if applicable
UPDATE public."V3 Users" 
SET "nftMetadataCid" = 'your_nft_metadata_cid_here'
WHERE "nftMetadataCid" IS NULL;
*/

-- ==============================================
-- 4. CLEANUP (Run after successful migration)
-- ==============================================

-- IMPORTANT: Only run this section AFTER confirming all data has been migrated
-- and your application is working with the new Pinata/NFT.Storage system

/*
-- Remove the old arweaveUrl column (uncomment when ready)
-- ALTER TABLE public."V3 Users" DROP COLUMN IF EXISTS "arweaveUrl";

-- Drop the old index
-- DROP INDEX IF EXISTS idx_v3_users_arweave_url;
*/

-- ==============================================
-- 5. VERIFICATION QUERIES
-- ==============================================

-- Check migration status
SELECT 
    COUNT(*) as total_users,
    COUNT("arweaveUrl") as users_with_arweave,
    COUNT("pinataCid") as users_with_pinata,
    COUNT("nftMetadataCid") as users_with_nft_metadata
FROM public."V3 Users";

-- Check for users that need migration
SELECT "walletAddress", "arweaveUrl", "pinataCid", "nftMetadataCid"
FROM public."V3 Users" 
WHERE "arweaveUrl" IS NOT NULL 
AND "pinataCid" IS NULL;

-- ==============================================
-- 6. ROLLBACK SCRIPT (Emergency use only)
-- ==============================================

-- If you need to rollback, you can remove the new columns:
/*
-- ALTER TABLE public."V3 Users" DROP COLUMN IF EXISTS "pinataCid";
-- ALTER TABLE public."V3 Users" DROP COLUMN IF EXISTS "nftMetadataCid";
-- DROP INDEX IF EXISTS idx_v3_users_pinata_cid;
-- DROP INDEX IF EXISTS idx_v3_users_nft_metadata_cid;
*/
