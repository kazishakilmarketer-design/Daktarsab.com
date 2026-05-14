import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nvtpugntdxtdpcjabmhm.supabase.co";
const supabaseKey = "sb_publishable_c8BB1IUjtCLUPxoaHGiSdw_4pPYlabM";
const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

// Category mapping logic from the edge function
function mapCategory(cat) {
    const c = cat?.trim().toLowerCase() || "";
    if (c === "government" || c === "সরকারি") return "সরকারি";
    if (c === "premium" || c === "প্রিমিয়াম") return "প্রিমিয়াম";
    return "বেসরকারি";
}

async function run() {
    try {
        console.log("Loading doctors...");
        const doctorsText = fs.readFileSync("./public/data/doctors_directory.csv", "utf-8");
        const docLines = doctorsText.split("\n");
        const docHeader = parseCSVLine(docLines[0] || "");

        const nameIdx = docHeader.findIndex((h) => /name/i.test(h));
        const qualIdx = docHeader.findIndex((h) => /qualif/i.test(h));
        const specIdx = docHeader.findIndex((h) => /special/i.test(h));
        const desigIdx = docHeader.findIndex((h) => /design/i.test(h));
        const chamberIdx = docHeader.findIndex((h) => /chamber/i.test(h));
        const divIdx = docHeader.findIndex((h) => /division|district|location/i.test(h));
        const imgIdx = docHeader.findIndex((h) => /image/i.test(h));
        const profileIdx = docHeader.findIndex((h) => /profile|url|link/i.test(h));

        const batchSize = 200;
        const doctors = docLines
            .slice(1)
            .filter((l) => l.trim())
            .map((line) => {
                const cols = parseCSVLine(line);
                return {
                    doctor_name: cols[nameIdx] || "",
                    qualification: cols[qualIdx] || "",
                    specialization: cols[specIdx] || "",
                    designation: cols[desigIdx] || "",
                    chamber: cols[chamberIdx] || "",
                    division: cols[divIdx] || "",
                    image_url: cols[imgIdx] || null,
                    profile_url: cols[profileIdx] || null,
                };
            })
            .filter((d) => d.doctor_name && d.specialization);

        console.log(`Parsed ${doctors.length} doctors. Uploading...`);
        for (let i = 0; i < doctors.length; i += batchSize) {
            const batch = doctors.slice(i, i + batchSize);
            const { error } = await supabase.from("doctors").insert(batch);
            if (error) {
                console.error("Error inserting doctors batch:", error.message);
                if (error.message.includes("relation") && error.message.includes("does not exist")) {
                    console.error("THE 'doctors' TABLE DOES NOT EXIST OR A COLUMN IS WRONG.");
                }
            } else {
                console.log(`Inserted doctors ${i} to ${i + batch.length}`);
            }
        }

        console.log("Loading hospitals...");
        const hospText = fs.readFileSync("./public/data/hospitals.csv", "utf-8");
        const hospLines = hospText.split("\n");

        const hospitals = hospLines
            .slice(1)
            .filter((l) => l.trim())
            .map((line) => {
                const cols = parseCSVLine(line);
                return {
                    name: cols[0]?.trim() || "Unknown",
                    district: cols[1]?.trim() || "",
                    upazila: cols[2]?.trim() || "",
                    latitude: parseFloat(cols[3]) || null,
                    longitude: parseFloat(cols[4]) || null,
                    type: mapCategory(cols[5]),
                    phone: cols[6]?.trim() || null,
                };
            })
            .filter((h) => h.name && h.name !== "Unknown");

        console.log(`Parsed ${hospitals.length} hospitals. Uploading...`);
        for (let i = 0; i < hospitals.length; i += batchSize) {
            const batch = hospitals.slice(i, i + batchSize);
            const { error } = await supabase.from("hospitals").insert(batch);
            if (error) {
                console.error("Error inserting hospitals batch:", error.message);
            } else {
                console.log(`Inserted hospitals ${i} to ${i + batch.length}`);
            }
        }

        console.log("Done uploading.");
    } catch (e) {
        console.error("Exception:", e);
    }
    process.exit(0);
}

run();
