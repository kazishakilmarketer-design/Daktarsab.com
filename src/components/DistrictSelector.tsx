import { useEffect, useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { bangladeshDivisions, divisionToDistricts, districtToDivision, bangladeshLocations } from "@/lib/locations";

interface DistrictSelectorProps {
  division?: string;
  onDivisionChange?: (division: string) => void;
  value: string; // district
  onValueChange: (district: string) => void;
  upazila?: string;
  onUpazilaChange?: (upazila: string) => void;
  showUpazila?: boolean;
  className?: string;
}

export default function DistrictSelector({
  division: initialDivision,
  onDivisionChange,
  value: districtValue,
  onValueChange,
  upazila: upazilaValue = "",
  onUpazilaChange,
  showUpazila = false,
  className,
}: DistrictSelectorProps) {
  const [division, setDivision] = useState<string>(
    initialDivision ?? districtToDivision[districtValue] ?? ""
  );
  const [district, setDistrict] = useState<string>(districtValue);
  const [upazila, setUpazila] = useState<string>(upazilaValue);
  const [locating, setLocating] = useState(false);
  const [cachedLocation, setCachedLocation] = useState<{ division?: string; district: string; upazila?: string } | null>(null);
  const { toast } = useToast();

  // Keep internal state in sync with props
  useEffect(() => {
    const inferredDivision = initialDivision ?? districtToDivision[districtValue] ?? "";
    setDivision(inferredDivision);
    setDistrict(districtValue);
  }, [initialDivision, districtValue]);

  useEffect(() => {
    setUpazila(upazilaValue);
  }, [upazilaValue]);

  const districts = division ? divisionToDistricts[division] ?? [] : [];
  const upazilas = district ? bangladeshLocations[district] ?? [] : [];

  function handleDivisionSelect(value: string) {
    setDivision(value);
    onDivisionChange?.(value);

    // Reset district/upazila when division changes
    setDistrict("");
    onValueChange("");
    setUpazila("");
    onUpazilaChange?.("");
  }

  function handleDistrictSelect(value: string) {
    setDistrict(value);
    onValueChange(value);
    setUpazila("");
    onUpazilaChange?.("");
  }

  function handleUpazilaSelect(value: string) {
    setUpazila(value);
    onUpazilaChange?.(value);
  }

  async function handleAutoLocate() {
    if (!navigator.geolocation) {
      toast({ title: "লোকেশন সাপোর্ট নেই", description: "আপনার ব্রাউজারে লোকেশন সাপোর্ট নেই।", variant: "destructive" });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`,
            { headers: { "User-Agent": "DoctorSaabApp/1.0" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          function normalizeDistrictName(raw: string): string | null {
            const trimmed = raw.trim();
            if (!trimmed) return null;

            // If already in Bangla and known, return as-is
            if (districtToDivision[trimmed]) return trimmed;

            // Some reverse geocoders return English district names; map common ones.
            const enToBn: Record<string, string> = {
              dhaka: "ঢাকা",
              "dhaka city": "ঢাকা",
              chittagong: "চট্টগ্রাম",
              chattogram: "চট্টগ্রাম",
              rajshahi: "রাজশাহী",
              khulna: "খুলনা",
              barishal: "বরিশাল",
              sylhet: "সিলেট",
              rangpur: "রংপুর",
              "mymensingh": "ময়মনসিংহ",
              bogura: "বগুড়া",
              bogra: "বগুড়া",
              comilla: "কুমিল্লা",
              "cumilla": "কুমিল্লা",
            };

            const key = trimmed.toLowerCase();
            return enToBn[key] ?? null;
          }

          const possible = [addr.county, addr.district, addr.state_district, addr.city, addr.town, addr.state];
          let matchedDistrict: string | null = null;
          for (const candidate of possible) {
            if (candidate) {
              const normalized = normalizeDistrictName(candidate);
              if (normalized) {
                matchedDistrict = normalized;
                break;
              }
            }
          }

          const upazilaCandidate = addr.suburb || addr.town || addr.village || "";

          if (matchedDistrict) {
            const matchedDivision = districtToDivision[matchedDistrict] ?? "";
            handleDivisionSelect(matchedDivision);
            handleDistrictSelect(matchedDistrict);
            if (upazilaCandidate) handleUpazilaSelect(upazilaCandidate);

            setCachedLocation({ division: matchedDivision, district: matchedDistrict, upazila: upazilaCandidate || undefined });
            toast({ title: "📍 লোকেশন পাওয়া গেছে", description: `জেলা: ${matchedDistrict}` });
          } else {
            toast({ title: "জেলা শনাক্ত হয়নি", description: "ম্যানুয়ালি জেলা সিলেক্ট করুন।", variant: "destructive" });
          }
        } catch {
          toast({ title: "লোকেশন এরর", description: "লোকেশন থেকে জেলা বের করতে সমস্যা হয়েছে।", variant: "destructive" });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast({
          title: "লোকেশন পারমিশন প্রয়োজন",
          description: "অনুগ্রহ করে লোকেশন পারমিশন দিন অথবা ম্যানুয়ালি জেলা সিলেক্ট করুন।",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs text-muted-foreground">অবস্থান</Label>
      <div className="grid gap-2 md:grid-cols-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">বিভাগ</Label>
          <Select value={division} onValueChange={handleDivisionSelect}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="বিভাগ" />
            </SelectTrigger>
            <SelectContent>
              {bangladeshDivisions.map((div) => (
                <SelectItem key={div} value={div}>
                  {div}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">জেলা</Label>
          <Select value={district} onValueChange={handleDistrictSelect}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="জেলা" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">উপজেলা</Label>
          <Select value={upazila} onValueChange={handleUpazilaSelect}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="উপজেলা" />
            </SelectTrigger>
            <SelectContent>
              {upazilas.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleAutoLocate}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
          ) : (
            <LocateFixed className="mr-2 h-4 w-4 text-primary" />
          )}
          অটো লোকেশন
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground">
                {cachedLocation ? `ক্যাশড: ${cachedLocation.district}` : ""}
              </span>
            </TooltipTrigger>
            <TooltipContent>{cachedLocation ? "অটো লোকেশন (ক্যাশড)" : ""}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
