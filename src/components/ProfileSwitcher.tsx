import { usePatient } from "@/contexts/PatientContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users } from "lucide-react";

interface ProfileSwitcherProps {
  onSwitch?: (name: string | null) => void;
}

export default function ProfileSwitcher({ onSwitch }: ProfileSwitcherProps) {
  const { familyMembers, activeMemberId, setActiveMemberId, setProfile } = usePatient();

  if (familyMembers.length === 0) return null;

  function handleSwitch(value: string) {
    if (value === "self") {
      setActiveMemberId(null);
      onSwitch?.(null);
    } else {
      const member = familyMembers.find((m) => m.id === value);
      if (member) {
        setActiveMemberId(member.id);
        setProfile({
          age: member.age,
          gender: member.gender,
          location: member.location,
          monthlyIncome: member.monthlyIncome,
        });
        onSwitch?.(member.name);
      }
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-border/50 bg-card/50 px-3 py-1.5">
      <Users className="h-3.5 w-3.5 text-muted-foreground" />
      <Select value={activeMemberId || "self"} onValueChange={handleSwitch}>
        <SelectTrigger className="h-7 w-auto min-w-[120px] border-none bg-transparent text-xs shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          <SelectItem value="self">
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3" /> নিজে
            </span>
          </SelectItem>
          {familyMembers.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  {m.name.charAt(0)}
                </span>
                {m.name} ({m.relation})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
