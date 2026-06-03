import { runDoctorSaabAgents } from "./src/lib/doctorSaabAgents";

async function main() {
    console.log("Testing remote upazila search...");
    const context = {
        symptom: "আমার অনেক জ্বর এবং পেট ব্যাথা",
        location: "গাইবান্ধা",
        upazila: "গোবিন্দগঞ্জ",
        age: 30,
        gender: "male" as "male"
    };
    
    const result = await runDoctorSaabAgents(context);
    console.log("\n--- TRIAGE RESULT ---");
    console.log("Emergency:", result.isEmergency);
    console.log("Specialty Needed:", result.specialistNeeded);
    
    console.log(`\nFound ${result.hospitals?.length || 0} hospitals in Gaibandha/Gobindaganj:`);
    result.hospitals?.forEach(h => console.log(`- ${h.name} (${h.type}) [${h.location}]`));
    
    console.log(`\nFound ${result.recommendedDoctors?.length || 0} recommended doctors:`);
    result.recommendedDoctors?.forEach(d => console.log(`- Dr. ${d.doctorName} (${d.specialization}) - ${d.chamber || "No Chamber"}`));
}

main().catch(console.error);
