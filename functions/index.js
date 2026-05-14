const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const cors = require('cors')({ origin: true });

exports.geminichat = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  if (!GEMINI_API_KEY) {
    logger.error("Missing GEMINI_API_KEY");
    return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
  }

  try {
    const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const body = req.body;

    if (!body.contents || !Array.isArray(body.contents)) {
      return res.status(400).json({ error: "Missing 'contents' field" });
    }

    const fetchResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: body.contents,
        systemInstruction: body.systemInstruction,
        generationConfig: body.generationConfig ?? {
          temperature: 0.7,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
        safetySettings: body.safetySettings,
      }),
    });

    const geminiData = await fetchResponse.json();
    return res.status(fetchResponse.status).json(geminiData);
  } catch (err) {
    logger.error("gemini-chat error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

exports.sendnotification = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
  if (!RESEND_API_KEY) return res.status(500).json({ error: "Missing Resend API Key" });

  try {
    const { record, type } = req.body;

    if (type === 'booking_update' && record.status === 'accepted') {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "DaktarSab Notifications <notifications@daktarsab.com>",
          to: [record.user_name ? `${record.user_name.replace(/\\s+/g,'').toLowerCase()}@example.com` : "test@example.com"],
          subject: "আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে | DaktarSab",
          html: `
            <h2>হ্যালো ${record.user_name},</h2>
            <p>আপনার ডক্টর <strong>${record.provider_name}</strong> এর সাথে আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে।</p>
            ${record.meet_link ? `<p><a href="${record.meet_link}">ভিডিও কলে যুক্ত হতে এখানে ক্লিক করুন</a></p>` : ''}
            <p>ধন্যবাদ, <br/>DaktarSab টিম</p>
          `,
        }),
      });
      const data = await emailRes.json();
      return res.status(emailRes.status).json(data);
    }
    return res.status(200).json({ message: "No action required" });
  } catch (error) {
    logger.error("send-notification error:", error);
    return res.status(400).json({ error: error.message });
  }
});
