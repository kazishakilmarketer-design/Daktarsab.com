
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Category mapping: CSV uses English, DB uses Bangla
function mapCategory(cat: string): string {
  const c = cat?.trim().toLowerCase() || "";
  if (c === "government" || c === "সরকারি") return "সরকারি";
  if (c === "premium" || c === "প্রিমিয়াম") return "প্রিমিয়াম";
  return "বেসরকারি"; // Private or default
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceRoleKey;

    // Verify Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify token validity
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role in profiles table
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profileErr } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr || profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { csvData } = await req.json();
    if (!csvData || !Array.isArray(csvData)) {
      return new Response(JSON.stringify({ error: "csvData array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear existing hospitals first
    await serviceClient.from("hospitals").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // Batch insert in chunks of 500
    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < csvData.length; i += BATCH) {
      const batch = csvData.slice(i, i + BATCH).map((row: Record<string, string | undefined>) => ({
        name: row.hospital_name?.trim() || "Unknown",
        district: row.district?.trim() || "",
        upazila: row.upazila?.trim() || "",
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
        type: mapCategory(row.category || ""),
        phone: row.contact?.trim() || null,
      }));

      const { error } = await serviceClient.from("hospitals").insert(batch);
      if (error) {
        console.error(`Batch ${i} error:`, error);
        return new Response(JSON.stringify({ error: error.message, inserted }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ success: true, inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
