import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface CostCardProps {
  tests: { name: string; estimatedCost: string }[];
  doctorFee?: string;
}

export function CostCard({ tests, doctorFee = "৳৮০০" }: CostCardProps) {
  // Extract number range from cost strings to calculate total (rough estimate)
  const calculateTotal = () => {
    let min = 800;
    let max = 800;

    tests.forEach(test => {
      const match = test.estimatedCost.match(/৳(\d+)-(\d+)/);
      if (match) {
        min += parseInt(match[1]);
        max += parseInt(match[2]);
      } else {
        const singleMatch = test.estimatedCost.match(/৳(\d+)/);
        if (singleMatch) {
          min += parseInt(singleMatch[1]);
          max += parseInt(singleMatch[1]) * 1.5;
        }
      }
    });

    return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
  };

  return (
    <Card className="p-4 border-border/40 shadow-sm bg-slate-50/50">
      <h3 className="font-bold text-xs text-muted-foreground mb-3 tracking-wide uppercase">আনুমানিক খরচ</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between py-1 border-b border-slate-100 last:border-0 text-[12px]">
          <span className="text-muted-foreground">ডাক্তার ফি</span>
          <span className="font-medium">{doctorFee}</span>
        </div>
        
        {tests.map((test, index) => (
          <div key={index} className="flex justify-between py-1 border-b border-slate-100 last:border-0 text-[12px]">
            <span className="text-muted-foreground truncate max-w-[60%]">{test.name}</span>
            <span className="font-medium shrink-0">{test.estimatedCost}</span>
          </div>
        ))}

        <div className="flex justify-between py-3 mt-2 border-t border-slate-200 text-sm font-bold text-primary">
          <span>মোট (আনুমানিক)</span>
          <span>{calculateTotal()}</span>
        </div>
      </div>
    </Card>
  );
}
