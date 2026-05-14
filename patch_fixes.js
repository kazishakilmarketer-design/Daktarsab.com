/** @type {import('fs')} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const path = require('path');

const partnerFile = 'c:/Users/HP/Desktop/Daktarsab.com/src/pages/PartnerDashboard.tsx';
const chatFile    = 'c:/Users/HP/Desktop/Daktarsab.com/src/components/ChatInterface.tsx';

// ─── 1. Add ResourceUpdatePanel to PartnerDashboard ───────────────────────
let partner = fs.readFileSync(partnerFile, 'utf8');

const resourcePanel = `
  /* ── RESOURCE UPDATE PANEL ─────────────────────────────────────────────── */
  const ResourceUpdatePanel = () => {
    const [beds, setBeds]     = React.useState("");
    const [icu, setIcu]       = React.useState("");
    const [oxygen, setOxygen] = React.useState("High");
    const [saving, setSaving] = React.useState(false);
    const [saved, setSaved]   = React.useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      if (!beds && !icu) return;
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data: reg } = await supabase
          .from("partner_registrations")
          .select("hospital_name")
          .eq("email", user.email)
          .limit(1)
          .maybeSingle();
        const hospitalName = reg && reg.hospital_name ? reg.hospital_name : "My Hospital";
        await supabase
          .from("hospital_resources")
          .upsert({
            hospital_name:      hospitalName,
            beds_available:     parseInt(beds) || 0,
            icu_beds_available: parseInt(icu) || 0,
            oxygen_status:      oxygen,
            updated_by:         user.id,
            last_updated_at:    new Date().toISOString(),
          }, { onConflict: "hospital_name" });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) { console.error(err); }
      finally { setSaving(false); }
    }

    return (
      <Card style={{ marginBottom: 18 }}>
        <CardHead>
          <CardTitle>🏥 হাসপাতাল রিসোর্স আপডেট</CardTitle>
          <span style={{ fontSize: 11, color: "#64748B" }}>Live data for patients</span>
        </CardHead>
        <form onSubmit={handleSubmit} style={{ padding: 18, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>🛏 Beds Available</label>
            <input type="number" min="0" value={beds} onChange={e => setBeds(e.target.value)} placeholder="e.g. 45"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>🏥 ICU Beds</label>
            <input type="number" min="0" value={icu} onChange={e => setIcu(e.target.value)} placeholder="e.g. 8"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>💨 Oxygen Status</label>
            <select value={oxygen} onChange={e => setOxygen(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}>
              <option value="High">🟢 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🔴 Low</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: saving ? "#94A3B8" : G.g5, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "সেভ হচ্ছে..." : saved ? "✅ Saved!" : "আপডেট করুন"}
          </button>
        </form>
      </Card>
    );
  };

`;

// Find the CardTitle line just before OverviewView
const overviewConst = '  const OverviewView = () => (';
if (partner.includes(overviewConst)) {
  partner = partner.replace(overviewConst, resourcePanel + overviewConst);
  fs.writeFileSync(partnerFile, partner, 'utf8');
  console.log('✅ ResourceUpdatePanel inserted into PartnerDashboard');
} else {
  console.log('❌ Could not find OverviewView arrow function');
  // Show nearby content
  const lines = partner.split('\n');
  lines.slice(410, 420).forEach((l, i) => console.log((410+i) + ': ' + JSON.stringify(l)));
}

// ─── 2. Add AI Memory persistence to ChatInterface ────────────────────────
let chat = fs.readFileSync(chatFile, 'utf8');

// Insert after the messages useState initialization
const messagesStateEnd = `  const [input, setInput] = useState("");`;

if (chat.includes(messagesStateEnd)) {
  const memoryCode = `
  // ── AI Memory: persist & restore chat via localStorage (Bug #2 fix) ──────
  const STORAGE_KEY = \`ds_chat_\${user?.id || 'guest'}\`;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 1) {
          setMessages(parsed);
          setOnboardingDone(true);
        }
      }
    } catch { /* corrupt storage — ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return; // skip welcome-only state
    try {
      const toSave = messages.slice(-30); // keep last 30 messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch { /* storage full */ }
  }, [messages, STORAGE_KEY]);

  `;
  chat = chat.replace(messagesStateEnd, memoryCode + messagesStateEnd);
  fs.writeFileSync(chatFile, chat, 'utf8');
  console.log('✅ AI Memory persistence added to ChatInterface');
} else {
  console.log('❌ Could not find input state line in ChatInterface');
}

console.log('Done!');
