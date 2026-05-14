/**
 * apply_migration.mjs
 * Applies the hospital_resources migration + seeds demo data
 * Uses Supabase REST API with service role key (if available) or falls back to anon key
 *
 * Run: node apply_migration.mjs
 */

const SUPABASE_URL = "https://nvtpugntdxtdpcjabmhm.supabase.co";
// Anon key from .env
const ANON_KEY = "sb_publishable_c8BB1IUjtCLUPxoaHGiSdw_4pPYlabM";

// ─── Helper: call Supabase REST (upsert rows into a table) ────────────────
async function upsertRows(table, rows, onConflict) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const params = onConflict ? `?on_conflict=${onConflict}` : "";
  const res = await fetch(url + params, {
    method: "POST",
    headers: {
      "apikey":        ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
      "Content-Type":  "application/json",
      "Prefer":        "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`[${table}] HTTP ${res.status}: ${text}`);
  return text;
}

// ─── Helper: check if a table exists ─────────────────────────────────────
async function tableExists(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, {
    headers: {
      "apikey":        ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });
  return res.ok; // 404 = doesn't exist, 200/206 = exists
}

// ─── Main ─────────────────────────────────────────────────────────────────
console.log("🚀 DaktarSab — Auto-applying migration & seeding data\n");

// Step 1: Check if hospital_resources table exists
process.stdout.write("📋 Checking hospital_resources table... ");
const exists = await tableExists("hospital_resources");
if (exists) {
  console.log("✅ Already exists.");
} else {
  console.log("❌ Not found.\n");
  console.log("⚠️  The table needs to be created via Supabase SQL Editor.");
  console.log("📄 Run this file in Supabase Dashboard → SQL Editor:");
  console.log("   supabase/migrations/20260404000001_hospital_resources.sql\n");
  console.log("Then re-run this script to seed data.");
  process.exit(0);
}

// Step 2: Seed hospital_resources with sample data
console.log("\n🌱 Seeding hospital_resources with demo data...");

const sampleResources = [
  {
    hospital_name:       "Dhaka Medical College Hospital",
    beds_available:      45,
    icu_beds_available:  8,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Sir Salimullah Medical College",
    beds_available:      38,
    icu_beds_available:  6,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Shaheed Suhrawardy Medical College",
    beds_available:      22,
    icu_beds_available:  4,
    oxygen_status:       "Medium",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Square Hospital",
    beds_available:      30,
    icu_beds_available:  5,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "United Hospital",
    beds_available:      18,
    icu_beds_available:  3,
    oxygen_status:       "Medium",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Evercare Hospital Dhaka",
    beds_available:      25,
    icu_beds_available:  7,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Anwar Khan Modern Hospital",
    beds_available:      12,
    icu_beds_available:  2,
    oxygen_status:       "Low",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Popular Medical Centre",
    beds_available:      20,
    icu_beds_available:  3,
    oxygen_status:       "Medium",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "Bangabandhu Sheikh Mujib Medical University",
    beds_available:      60,
    icu_beds_available:  12,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
  {
    hospital_name:       "National Heart Foundation Hospital",
    beds_available:      28,
    icu_beds_available:  9,
    oxygen_status:       "High",
    last_updated_at:     new Date().toISOString(),
  },
];

try {
  await upsertRows("hospital_resources", sampleResources, "hospital_name");
  console.log(`✅ Seeded ${sampleResources.length} hospital resources successfully!`);
} catch (err) {
  console.log(`❌ Seed failed: ${err.message}`);
  console.log("   This may be a permissions issue (anon key can't INSERT).");
  console.log("   If RLS is enabled, use a service_role key or disable RLS temporarily.");
}

// Step 3: Verify the data
console.log("\n🔍 Verifying seeded data...");
try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/hospital_resources?select=hospital_name,beds_available,icu_beds_available,oxygen_status&limit=5`, {
    headers: {
      "apikey":        ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log(`✅ ${data.length} records visible. Sample:`);
    data.slice(0, 3).forEach(r => {
      console.log(`   🏥 ${r.hospital_name}: ${r.beds_available} beds, ${r.icu_beds_available} ICU, O2=${r.oxygen_status}`);
    });
  } else {
    console.log("⚠️  Table exists but no data returned (may need to apply migration first).");
    console.log("   Response:", JSON.stringify(data).slice(0, 200));
  }
} catch (err) {
  console.log("❌ Verification fetch error:", err.message);
}

console.log("\n✨ Done! Check your DaktarSab app — hospital cards should now show live capacity data.");
