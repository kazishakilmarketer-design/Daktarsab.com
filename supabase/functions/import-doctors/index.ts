/* eslint-disable */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { csvData } = await req.json();

    if (!Array.isArray(csvData) || csvData.length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map CSV rows to doctor records
    const doctors = csvData
      .filter((row: Record<string, string | undefined>) => row.doctor_name?.trim())
      .map((row: Record<string, string | undefined>) => ({
        doctor_name: row.doctor_name?.trim() || "",
        qualification: row.qualification?.trim() || "",
        specialization: row.specialization?.trim() || "",
        designation: row.designation?.trim() || "",
        chamber: row.chamber?.trim() || "",
        division: row.division?.trim() || "",
        image_url: row.image_url?.trim() || null,
        profile_url: row.profile_url?.trim() || null,
      }));

    // Insert in batches of 200
    let inserted = 0;
    const batchSize = 200;
    for (let i = 0; i < doctors.length; i += batchSize) {
      const batch = doctors.slice(i, i + batchSize);
      const { error } = await supabase.from("doctors").insert(batch);
      if (error) {
        console.error("Batch insert error:", error);
        return new Response(
          JSON.stringify({ error: error.message, inserted }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Import error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
