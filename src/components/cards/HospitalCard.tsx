import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Building2, Navigation } from "lucide-react";
import { CapacityWidget } from "@/components/cards/CapacityWidget";

interface HospitalCardProps {
  hospital: {
    name: string;
    type: string;
    location: string;
    phone?: string | null;
  };
  onDirection: () => void;
  onCall: () => void;
}

export function HospitalCard({ hospital, onDirection, onCall }: HospitalCardProps) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md bg-white">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm text-foreground leading-tight max-w-[70%]">{hospital.name}</h3>
          <Badge variant="outline" className="text-[10px] h-5 bg-card text-muted-foreground border-slate-200 uppercase">
            {hospital.type === "সরকারি" ? "Government" : "Private"}
          </Badge>
        </div>

        <div className="space-y-1.5 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span>{hospital.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary/70" />
            <span>Emergency 24/7 Available</span>
          </div>
        </div>

        {/* Live Capacity Widget */}
        <CapacityWidget hospitalName={hospital.name} compact={true} />

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-semibold gap-2"
            onClick={onCall}
          >
            <Phone className="h-3.5 w-3.5" /> কল করুন
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 text-xs font-semibold gap-2"
            onClick={onDirection}
          >
            <Navigation className="h-3.5 w-3.5" /> রাস্তা দেখুন
          </Button>
        </div>
      </div>
    </Card>
  );
}
