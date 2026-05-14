import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL    = Deno.env.get("ADMIN_EMAIL") || "admin@daktarsab.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error("Missing Resend API key");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "DaktarSab <notifications@daktarsab.com>",
      to: [to],
      subject,
      html,
    }),
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { record, type } = await req.json();

    // ── 1. Booking accepted ──────────────────────────────────────────────────
    if (type === "booking_update" && record.status === "accepted") {
      const result = await sendEmail(
        record.user_email || "test@example.com",
        "আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে | DaktarSab",
        `<h2>হ্যালো ${record.user_name},</h2>
         <p><strong>${record.provider_name}</strong>-এর সাথে আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত হয়েছে।</p>
         ${record.preferred_date ? `<p>তারিখ: <strong>${record.preferred_date}</strong> ${record.preferred_time || ""}</p>` : ""}
         ${record.meet_link ? `<p><a href="${record.meet_link}">ভিডিও কলে যুক্ত হতে ক্লিক করুন</a></p>` : ""}
         <p>ধন্যবাদ,<br/>DaktarSab টিম</p>`
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── 2. New partner registration → alert admin ─────────────────────────────
    if (type === "partner_registration_new") {
      const result = await sendEmail(
        ADMIN_EMAIL,
        `নতুন পার্টনার আবেদন: ${record.name} — DaktarSab`,
        `<h2>নতুন পার্টনার আবেদন</h2>
         <table border="1" cellpadding="6" style="border-collapse:collapse;">
           <tr><td><strong>নাম</strong></td><td>${record.name}</td></tr>
           <tr><td><strong>ইমেইল</strong></td><td>${record.email}</td></tr>
           <tr><td><strong>ফোন</strong></td><td>${record.phone}</td></tr>
           <tr><td><strong>স্পেশালিটি</strong></td><td>${record.specialty || "—"}</td></tr>
           <tr><td><strong>BMDC</strong></td><td>${record.bmdc_no}</td></tr>
           <tr><td><strong>জেলা</strong></td><td>${record.district || "—"}</td></tr>
         </table>
         <p style="margin-top:16px;"><a href="https://daktarsab.com/kazi" style="background:#0F6E56;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Admin Panel-এ যান →</a></p>`
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── 3. Partner status update → notify applicant ──────────────────────────
    if (type === "partner_registration_update") {
      const approved = record.status === "approved";
      const result = await sendEmail(
        record.email,
        approved
          ? "🎉 অভিনন্দন! আপনার আবেদন অনুমোদিত হয়েছে | DaktarSab"
          : "আপনার আবেদন সম্পর্কে আপডেট | DaktarSab",
        approved
          ? `<h2>আপনার আবেদন অনুমোদিত হয়েছে!</h2>
             <p>প্রিয় ডা. ${record.name},</p>
             <p>DaktarSab প্ল্যাটফর্মে আপনাকে স্বাগতম। আপনার একাউন্ট এখন সক্রিয়।</p>
             <p><a href="https://daktarsab.com/doctor-dashboard" style="background:#0F6E56;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">ড্যাশবোর্ডে যান →</a></p>`
          : `<h2>আপনার আবেদন সম্পর্কে</h2>
             <p>প্রিয় ${record.name},</p>
             <p>দুঃখিত, আপনার আবেদনটি এই মুহূর্তে অনুমোদন করা সম্ভব হয়নি।</p>
             ${record.admin_notes ? `<p><strong>কারণ:</strong> ${record.admin_notes}</p>` : ""}
             <p>আরও তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।</p>`
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "No action required" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
