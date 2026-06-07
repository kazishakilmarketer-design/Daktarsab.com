/**
 * HospitalMapView — Hybrid Google Maps + Leaflet
 *
 * Mode detection:
 *   - VITE_GOOGLE_MAPS_KEY set → Google Maps JavaScript API (richer, real-time nav)
 *   - No key → Leaflet + OpenStreetMap (offline-capable, free)
 *
 * Both modes share the same CSV data source: /public/data/hospitals.csv
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { usePatient } from "@/contexts/PatientContext";
import { Loader2, LocateFixed, AlertCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Hospital {
  name: string;
  district: string;
  upazila: string;
  latitude: number;
  longitude: number;
  category: string;
  contact: string;
  resource?: { beds_available: number; icu_beds_available: number; oxygen_status: string; };
}

// ─── CSV parser ────────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { result.push(cur.trim()); cur = ""; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

let _hospCache: Hospital[] | null = null;

async function loadHospitalCSV(): Promise<Hospital[]> {
  if (_hospCache) return _hospCache;
  const res = await fetch("/data/hospitals.csv");
  const text = await res.text();
  _hospCache = text.split("\n").slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const c = parseCSVLine(line);
      return {
        name: c[0] ?? "",
        district: c[1] ?? "",
        upazila: c[2] ?? "",
        latitude: parseFloat(c[3]) || 0,
        longitude: parseFloat(c[4]) || 0,
        category: c[5] ?? "Private",
        contact: c[6] ?? "",
      };
    })
    .filter((h) => h.name && h.latitude !== 0 && h.longitude !== 0);
  return _hospCache;
}

// ─── Bangla district → English ─────────────────────────────────────────────
const BN_TO_EN: Record<string, string> = {
  "ঢাকা": "Dhaka", "চট্টগ্রাম": "Chattogram", "সিলেট": "Sylhet",
  "রাজশাহী": "Rajshahi", "খুলনা": "Khulna", "বরিশাল": "Barisal",
  "রংপুর": "Rangpur", "ময়মনসিংহ": "Mymensingh", "গাজীপুর": "Gazipur",
  "নারায়ণগঞ্জ": "Narayanganj", "নরসিংদী": "Narsingdi", "টাঙ্গাইল": "Tangail",
  "কুমিল্লা": "Cumilla", "ব্রাহ্মণবাড়িয়া": "Brahmanbaria",
  "চাঁদপুর": "Chandpur", "ফেনী": "Feni", "নোয়াখালী": "Noakhali",
  "লক্ষ্মীপুর": "Lakshmipur", "কক্সবাজার": "Cox's Bazar",
  "যশোর": "Jashore", "বগুড়া": "Bogura", "দিনাজপুর": "Dinajpur",
  "রাজবাড়ী": "Rajbari", "শরীয়তপুর": "Shariatpur", "মাদারীপুর": "Madaripur",
  "গোপালগঞ্জ": "Gopalganj", "ফরিদপুর": "Faridpur", "মানিকগঞ্জ": "Manikganj",
  "মুন্সীগঞ্জ": "Munshiganj", "হবিগঞ্জ": "Habiganj",
  "মৌলভীবাজার": "Moulvibazar", "সুনামগঞ্জ": "Sunamganj",
  "কিশোরগঞ্জ": "Kishoreganj", "নেত্রকোনা": "Netrokona",
  "জামালপুর": "Jamalpur", "শেরপুর": "Sherpur",
  "পাবনা": "Pabna", "সিরাজগঞ্জ": "Sirajganj", "নাটোর": "Natore",
  "কুষ্টিয়া": "Kushtia", "ঝিনাইদহ": "Jhenaidah", "মাগুরা": "Magura",
};

// ─── Google Maps mode ──────────────────────────────────────────────────────
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

function loadGoogleMapsScript(): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("gmap-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function getGoogleCategory(category: string): { label: string; color: string } {
  const c = category.toLowerCase();
  if (c === "government") return { label: "🟢 সরকারি", color: "#0d9668" };
  if (c === "premium") return { label: "🟣 প্রিমিয়াম", color: "#7c3aed" };
  return { label: "🔵 বেসরকারি", color: "#3b82f6" };
}

// ─── Leaflet mode (fallback / offline) ─────────────────────────────────────
async function initLeaflet(
  container: HTMLDivElement,
  hospitals: Hospital[],
  userPos: [number, number] | null
) {
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");

  // MarkerCluster — groups nearby pins at low zoom, expands on click/drill-in
  await import("leaflet.markercluster/dist/MarkerCluster.css");
  await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
  await import("leaflet.markercluster"); // side-effect: attaches .markerClusterGroup to L

  // ── Icons ────────────────────────────────────────────────────────────────
  function createIcon(color: string, size = 24) {
    return L.divIcon({
      className: "",
      html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2.5px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,.35);
        display:flex;align-items:center;justify-content:center;
      "><span style="color:white;font-size:${size * 0.55}px;font-weight:700;line-height:1">+</span></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2 + 4)],
      tooltipAnchor: [size / 2 + 4, 0],
    });
  }
  const govIcon = createIcon("#0d9668");
  const privIcon = createIcon("#3b82f6");
  const premIcon = createIcon("#7c3aed");
  const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,.3)"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7],
  });

  // ── Map ──────────────────────────────────────────────────────────────────
  const map = L.map(container, { center: [23.685, 90.356], zoom: 7, zoomControl: false });
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
    maxZoom: 18,
  }).addTo(map);

  // ── Cluster group ────────────────────────────────────────────────────────
  const cluster = (L as any).markerClusterGroup({
    maxClusterRadius: 60,              // px radius before clustering
    disableClusteringAtZoom: 14,       // show individual pins at zoom 14+
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    // Color clusters by size
    iconCreateFunction: (c: any) => {
      const count = c.getChildCount();
      const size = count < 10 ? 34 : count < 50 ? 42 : count < 200 ? 50 : 58;
      const bg = count < 10 ? "#0d9668" : count < 100 ? "#3b82f6" : "#7c3aed";
      return L.divIcon({
        className: "",
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${bg};color:white;font-weight:700;
          font-size:${size * 0.3}px;font-family:'Hind Siliguri',sans-serif;
          display:flex;align-items:center;justify-content:center;
          border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.3);
        ">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    },
  });

  // ── Markers ──────────────────────────────────────────────────────────────
  hospitals.forEach((h) => {
    const cat = getGoogleCategory(h.category);
    const icon = h.category.toLowerCase() === "government" ? govIcon
      : h.category.toLowerCase() === "premium" ? premIcon
        : privIcon;

    const dir = `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
    const hasPhone = h.contact && /\d{6,}/.test(h.contact);
    const telHTML = hasPhone
      ? `<a href="tel:${h.contact}" style="
            display:flex;align-items:center;gap:6px;padding:7px 10px;
            border-radius:8px;background:#f0fdf4;color:#0d9668;
            font-weight:700;text-decoration:none;margin-bottom:8px;font-size:12px;">
           📞 ${h.contact}
         </a>`
      : `<p style="font-size:11px;color:#aaa;margin:0 0 8px;">ফোন নম্বর নেই</p>`;

    const typeBadge = `<span style="
      display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;
      font-weight:600;background:${cat.color}22;color:${cat.color};
      border:1px solid ${cat.color}44;margin-bottom:6px;">
      ${cat.label}
    </span>`;

    const popupHTML = `
      <div style="font-family:'Hind Siliguri',Hind,sans-serif;min-width:210px;max-width:260px;">
        <h3 style="font-size:14px;font-weight:700;margin:0 0 5px;line-height:1.35;color:#111;">
          ${h.name}
        </h3>
        ${typeBadge}
        ${h.resource ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px;margin:6px 0;display:flex;gap:8px;font-size:10px;font-weight:700;">
            <span style="color:#0f172a;">🛏️ Beds: ${h.resource.beds_available}</span>
            <span style="color:#dc2626;">🏥 ICU: ${h.resource.icu_beds_available}</span>
            <span style="color:#059669;">💨 O₂: ${h.resource.oxygen_status}</span>
          </div>
        ` : ''}
        <p style="font-size:12px;color:#555;margin:0 0 2px;">
          📍 ${h.upazila ? h.upazila + ", " : ""}${h.district}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/>
        ${telHTML}
        <a href="${dir}" target="_blank" rel="noopener" style="
          display:flex;align-items:center;justify-content:center;gap:6px;
          padding:9px;border-radius:8px;background:#0d9668;
          color:white;text-decoration:none;font-weight:700;font-size:13px;">
          🧭 Google Maps-এ নেভিগেট করুন
        </a>
      </div>`;

    const marker = L.marker([h.latitude, h.longitude], { icon })
      .bindPopup(popupHTML, { maxWidth: 270, className: "ds-popup" })
      // Hover tooltip — shows hospital name immediately on mouseover
      .bindTooltip(h.name, {
        permanent: false,      // only on hover
        direction: "top",
        offset: [0, -14],
        className: "ds-tooltip",
      });

    cluster.addLayer(marker);
  });

  map.addLayer(cluster);

  // ── User position ────────────────────────────────────────────────────────
  if (userPos) {
    L.marker(userPos, { icon: userIcon })
      .addTo(map)
      .bindPopup("<b>আপনার অবস্থান</b>")
      .bindTooltip("আপনার অবস্থান", { direction: "top", offset: [0, -10] });
  }

  // ── Fit bounds ───────────────────────────────────────────────────────────
  const valid = hospitals.filter((h) => h.latitude && h.longitude);
  if (valid.length > 0) {
    const bounds = L.latLngBounds(valid.map((h) => [h.latitude, h.longitude] as [number, number]));
    if (userPos) bounds.extend(userPos);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }

  // ── Custom CSS (tooltip + popup styling) ─────────────────────────────────
  if (!document.getElementById("ds-map-styles")) {
    const style = document.createElement("style");
    style.id = "ds-map-styles";
    style.textContent = `
      .ds-tooltip {
        background: rgba(17,17,17,0.88) !important;
        color: #fff !important;
        border: none !important;
        border-radius: 6px !important;
        padding: 4px 10px !important;
        font-size: 12px !important;
        font-family: 'Hind Siliguri', Hind, sans-serif !important;
        font-weight: 600 !important;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,.25) !important;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-tooltip::before { display: none !important; }
      .ds-popup .leaflet-popup-content-wrapper {
        border-radius: 12px !important;
        box-shadow: 0 8px 30px rgba(0,0,0,.18) !important;
        padding: 0 !important;
      }
      .ds-popup .leaflet-popup-content {
        margin: 14px !important;
      }
      .ds-popup .leaflet-popup-tip-container { margin-top: -1px; }
    `;
    document.head.appendChild(style);
  }

  return () => map.remove();
}


// ─── Google Maps mode ──────────────────────────────────────────────────────
async function initGoogleMaps(
  container: HTMLDivElement,
  hospitals: Hospital[],
  userPos: [number, number] | null
) {
  await loadGoogleMapsScript();
  const google = (window as any).google;

  const center = userPos
    ? { lat: userPos[0], lng: userPos[1] }
    : { lat: 23.685, lng: 90.356 };

  const map = new google.maps.Map(container, {
    center,
    zoom: userPos ? 11 : 7,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
    ],
  });

  const infoWindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();

  hospitals.forEach((h) => {
    const cat = getGoogleCategory(h.category);
    const marker = new google.maps.Marker({
      position: { lat: h.latitude, lng: h.longitude },
      map,
      title: h.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: cat.color,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    const dir = `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
    const tel = h.contact && /\d{6,}/.test(h.contact)
      ? `<a href="tel:${h.contact}" style="display:block;padding:6px;border-radius:6px;background:#f0fdf4;color:#0d9668;font-weight:700;text-align:center;margin-bottom:6px;text-decoration:none;">📞 ${h.contact}</a>`
      : "";

    marker.addListener("click", () => {
      infoWindow.setContent(`
        <div style="font-family:'Hind Siliguri',sans-serif;min-width:200px;padding:4px">
          <h3 style="font-size:14px;font-weight:700;margin:0 0 4px;line-height:1.3">${h.name}</h3>
          <p style="font-size:12px;color:#666;margin:0 0 2px">${cat.label}</p>
          ${h.resource ? `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px;margin:6px 0;display:flex;gap:8px;font-size:10px;font-weight:700;">
              <span style="color:#0f172a;">🛏️ Beds: ${h.resource.beds_available}</span>
              <span style="color:#dc2626;">🏥 ICU: ${h.resource.icu_beds_available}</span>
              <span style="color:#059669;">💨 O₂: ${h.resource.oxygen_status}</span>
            </div>
          ` : ''}
          <p style="font-size:11px;color:#888;margin:0 0 8px">📍 ${h.upazila}, ${h.district}</p>
          ${tel}
          <a href="${dir}" target="_blank" style="display:block;padding:8px;border-radius:6px;background:#0d9668;color:white;text-decoration:none;font-weight:700;font-size:13px;text-align:center;">🧭 Google Maps-এ নেভিগেট করুন</a>
        </div>
      `);
      infoWindow.open(map, marker);
    });

    bounds.extend({ lat: h.latitude, lng: h.longitude });
  });

  if (userPos) {
    new google.maps.Marker({
      position: { lat: userPos[0], lng: userPos[1] },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      title: "আপনার অবস্থান",
    });
    bounds.extend({ lat: userPos[0], lng: userPos[1] });
  }

  if (hospitals.length > 0) {
    map.fitBounds(bounds);
    const listener = google.maps.event.addListener(map, "idle", () => {
      if (map.getZoom() > 13) map.setZoom(13);
      google.maps.event.removeListener(listener);
    });
  }

  return () => { }; // Google Maps can't be "removed" easily, container will be unmounted
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function HospitalMapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [mapMode, setMapMode] = useState<"loading" | "google" | "leaflet">("loading");
  const { profile } = usePatient();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterType = searchParams.get("filter") || "all";

  // ── Load CSV ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    (async () => {
      try {
        const all = await loadHospitalCSV();
        
        // Fetch resources
        const { data: resources } = await (supabase as any).from("hospital_resources").select("*");
        const resourceMap = new Map();
        if (resources) {
          resources.forEach((r: any) => resourceMap.set(r.hospital_name?.toLowerCase(), r));
        }

        const rawDistrict = profile.location ?? "";
        const district = BN_TO_EN[rawDistrict] ?? rawDistrict;
        const upazila = profile.upazila ?? "";
        let filtered = all;
        
        // Apply location filtering
        if (district) {
          filtered = filtered.filter((h) =>
            h.district.toLowerCase().includes(district.toLowerCase()) ||
            h.district.toLowerCase().includes(rawDistrict.toLowerCase())
          );
        }
        if (upazila) {
          filtered = filtered.filter((h) =>
            h.upazila.toLowerCase().includes(upazila.toLowerCase())
          );
        }

        // Apply category filtering
        if (filterType === "hospital") {
          filtered = filtered.filter((h) => 
            h.name.toLowerCase().includes("hospital") || 
            h.name.toLowerCase().includes("হাসপাতাল") ||
            h.name.toLowerCase().includes("medical") ||
            h.name.toLowerCase().includes("মেডিকেল") ||
            h.name.toLowerCase().includes("clinic") ||
            h.name.toLowerCase().includes("ক্লিনিক")
          );
        } else if (filterType === "diagnostic") {
          filtered = filtered.filter((h) => 
            h.name.toLowerCase().includes("diagnostic") || 
            h.name.toLowerCase().includes("diagonostic") || 
            h.name.toLowerCase().includes("ডায়াগনস্টিক") ||
            h.name.toLowerCase().includes("lab") ||
            h.name.toLowerCase().includes("ল্যাব") ||
            h.name.toLowerCase().includes("imaging") ||
            h.name.toLowerCase().includes("x-ray") ||
            h.name.toLowerCase().includes("pathology")
          );
        } else if (filterType === "blood") {
          filtered = filtered.filter((h) => 
            h.name.toLowerCase().includes("blood") || 
            h.name.toLowerCase().includes("transfusion") || 
            h.name.toLowerCase().includes("রক্ত") ||
            h.name.toLowerCase().includes("ব্লাড") ||
            h.name.toLowerCase().includes("donor") ||
            h.name.toLowerCase().includes("ডোনার")
          );
        } else if (filterType === "ambulance") {
          filtered = filtered.filter((h) => 
            h.name.toLowerCase().includes("ambulance") || 
            h.name.toLowerCase().includes("অ্যাম্বুলেন্স") ||
            // Fallback: show hospitals that offer ambulance services
            h.category.toLowerCase() === "government" ||
            h.name.toLowerCase().includes("hospital") ||
            h.name.toLowerCase().includes("হাসপাতাল")
          );
        } else if (filterType === "emergency") {
          filtered = filtered.filter((h) => 
            h.category.toLowerCase() === "government" || 
            h.category.toLowerCase() === "premium" ||
            h.name.toLowerCase().includes("hospital") ||
            h.name.toLowerCase().includes("হাসপাতাল")
          );
        }
        
        // Attach resources
        filtered = filtered.map(h => ({
          ...h,
          resource: resourceMap.get(h.name.toLowerCase())
        }));

        if (!cancelled) setHospitals(filtered.slice(0, 1500));
      } catch (e) {
        if (!cancelled) setError("হাসপাতালের তথ্য লোড করতে সমস্যা হয়েছে।");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile.location, profile.upazila, filterType]);

  // ── Geolocation ─────────────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => { },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => { detectLocation(); }, [detectLocation]);

  // ── Init map when data ready ─────────────────────────────────────────────
  useEffect(() => {
    if (loading || !mapRef.current || hospitals.length === 0) return;

    // cleanup previous map instance
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    // clear container
    mapRef.current.innerHTML = "";

    const container = mapRef.current;

    (async () => {
      if (GMAPS_KEY) {
        try {
          const cleanup = await initGoogleMaps(container, hospitals, userPos);
          cleanupRef.current = cleanup;
          setMapMode("google");
          return;
        } catch (e) {
          console.warn("Google Maps failed, falling back to Leaflet", e);
        }
      }
      const cleanup = await initLeaflet(container, hospitals, userPos);
      cleanupRef.current = cleanup;
      setMapMode("leaflet");
    })();

    return () => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitals, loading]);

  // Reinit if user position changes after map is drawn
  useEffect(() => {
    if (!userPos || !mapRef.current || hospitals.length === 0 || loading) return;
    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }
    mapRef.current.innerHTML = "";
    const container = mapRef.current;
    (async () => {
      if (GMAPS_KEY) {
        try {
          cleanupRef.current = await initGoogleMaps(container, hospitals, userPos);
          setMapMode("google"); return;
        } catch { }
      }
      cleanupRef.current = await initLeaflet(container, hospitals, userPos);
      setMapMode("leaflet");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPos]);

  return (
    <div className="relative flex h-full flex-col">
      {/* Legend */}
      <div className="absolute left-3 top-3 z-[1000] flex gap-2 rounded-lg border border-border bg-card/95 px-3 py-1.5 text-[11px] backdrop-blur-sm">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-primary inline-block" /> সরকারি</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-blue-500 inline-block" /> বেসরকারি</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-purple-500 inline-block" /> প্রিমিয়াম</span>
      </div>

      {/* Hospital count + map mode badge */}
      {!loading && hospitals.length > 0 && (
        <div className="absolute left-3 top-12 z-[1000] flex items-center gap-1.5 rounded-lg border border-border bg-card/95 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
          <Map className="h-3 w-3 text-primary" />
          {hospitals.length} হাসপাতাল
          {mapMode === "google" && <span className="font-semibold text-primary ml-1">· Google Maps</span>}
        </div>
      )}

      {/* Locate me */}
      <Button
        variant="outline" size="icon" onClick={detectLocation}
        className="absolute right-3 top-3 z-[1000] h-9 w-9 border-border bg-card/95 shadow-md backdrop-blur-sm"
        title="আমার অবস্থান"
      >
        <LocateFixed className="h-4 w-4 text-primary" />
      </Button>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            হাসপাতাল লোড হচ্ছে...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute left-1/2 top-14 z-[1001] -translate-x-1/2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Empty */}
      {!loading && hospitals.length === 0 && !error && (
        <div className="absolute left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 rounded-xl border border-border bg-card/95 p-6 text-center shadow-lg backdrop-blur-sm">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">কোনো হাসপাতাল পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground">
            {profile.location ? `"${profile.location}" জেলায় কোনো হাসপাতাল পাওয়া যায়নি।` : "প্রোফাইলে আপনার জেলা সিলেক্ট করুন।"}
          </p>
        </div>
      )}

      {/* Floating Category Filter Chips */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-[1000] flex gap-1.5 overflow-x-auto no-scrollbar max-w-[90%] bg-card/95 p-1.5 rounded-2xl border border-border shadow-lg backdrop-blur-sm">
        {[
          { id: "all", label: "সব" },
          { id: "hospital", label: "হাসপাতাল" },
          { id: "diagnostic", label: "ডায়াগনস্টিক" },
          { id: "ambulance", label: "অ্যাম্বুলেন্স" },
          { id: "blood", label: "ব্লাড ব্যাংক" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ filter: tab.id })}
            className={`px-3 py-1 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all ${
              filterType === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div ref={mapRef} className="flex-1" style={{ minHeight: "300px" }} />
    </div>
  );
}
