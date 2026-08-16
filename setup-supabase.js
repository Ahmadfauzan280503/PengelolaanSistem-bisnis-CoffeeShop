// Script to setup Supabase Storage bucket and add description column
require('dotenv').config();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  console.log("🔧 Supabase Setup Script");
  console.log("========================\n");

  // ========== 1. Create Storage Bucket ==========
  console.log("📦 Step 1: Creating storage bucket 'product-images'...");
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("product-images", {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
  });

  if (bucketError) {
    if (bucketError.message.includes("already exists") || bucketError.message.includes("Duplicate")) {
      console.log("   ⚠️  Bucket 'product-images' already exists. Skipping.");
    } else {
      console.log("   ❌ Error creating bucket:", bucketError.message);
    }
  } else {
    console.log("   ✅ Bucket 'product-images' created successfully!");
  }

  // ========== 2. Update Bucket Public Policies ==========
  console.log("\n🔓 Step 2: Ensure bucket is public...");
  const { error: updateError } = await supabase.storage.updateBucket("product-images", {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
  });
  if (updateError) {
    console.log("   ⚠️ Note updating bucket:", updateError.message);
  } else {
    console.log("   ✅ Bucket is public.");
  }

  // ========== 3. Add description column to products table ==========
  console.log("\n📝 Step 3: Checking 'description' column in products table...");
  // We can't do ALTER TABLE easily through supabase-js without an RPC, but let's try reading the column first
  const { data: testData, error: testError } = await supabase.from("products").select("description").limit(1);
  if (testError && testError.message.includes("Could not find the 'description' column")) {
    console.log("   ℹ️  Column doesn't exist yet. Will add via SQL...");
    try {
      const pg = require("pg");
      const client = new pg.Client({
        connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;");
      await client.end();
      console.log("   ✅ Column 'description' added to products table!");
    } catch (pgErr) {
      console.log("   ❌ Database error:", pgErr.message);
      console.log("   📌 Please add manually: Supabase Dashboard → Table Editor → products → Add Column → 'description' (text, nullable)");
    }
  } else if (testError) {
    console.log("   ❌ Error checking column:", testError.message);
  } else {
    console.log("   ⚠️  Column 'description' already exists in products table. Skipping.");
  }

  console.log("\n========================");
  console.log("🎉 Setup complete!\n");
}

main().catch(console.error);
