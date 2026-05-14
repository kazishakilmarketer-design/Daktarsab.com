/**
 * Partner Bookings Dashboard
 * Route: /partner-bookings
 * Partners filter by their provider name/ID to see their own leads
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Building2, ShieldCheck, Eye, EyeOff, Phone, Calendar,
    Clock, FileText, RefreshCw, CheckCircle2, MessageSquare, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const PARTNER_PASSPHRASE = "partner2026";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "নতুন", variant: "default" },
    contacted: { label: "যোগাযোগ হয়েছে", variant: "secondary" },
    confirmed: { label: "নিশ্চিত", variant: "default" },
    closed: { label: "বন্ধ", variant: "outline" },
};

const SERVICE_LABELS: Record<string, string> = {
    hospital: "হাসপাতাল",
    clinic: "ক্লিনিক",
    diagnostic: "ডায়াগনস্টিক",
    ambulance: "অ্যাম্বুলেন্স",
    doctor: "ডাক্তার",
};

interface BookingRow {
    id: string;
    user_name: string;
    user_phone: string;
    service_type: string;
    provider_name: string;
    preferred_date: string | null;
    preferred_time: string | null;
    notes: string | null;
    status: string;
    created_at: string;
}

export default function PartnerBookings() {
    const [pass, setPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [auth, setAuth] = useState(false);
    const [providerId, setProviderId] = useState("");
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (pass === PARTNER_PASSPHRASE) setAuth(true);
        else setError("ভুল পাসওয়ার্ড");
    }

    async function fetchBookings() {
        if (!providerId.trim()) { setError("আপনার প্রতিষ্ঠানের নাম/ID দিন"); return; }
        setLoading(true); setError("");
        try {
            const { data, error: dbErr } = await (supabase as any)
                .from("booking_requests")
                .select("*")
                .or(`provider_id.ilike.%${providerId.trim()}%,provider_name.ilike.%${providerId.trim()}%`)
                .order("created_at", { ascending: false });

            if (dbErr) throw dbErr;
            setBookings((data as BookingRow[]) || []);
        } catch (err: any) {
            setError(err?.message || "ডেটা লোড সমস্যা");
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, status: string) {
        setUpdatingId(id);
        try {
            await (supabase as any)
                .from("booking_requests")
                .update({ status })
                .eq("id", id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        } catch (err: any) {
            setError(err?.message || "আপডেট সমস্যা");
        } finally {
            setUpdatingId(null);
        }
    }

    const counts = {
        new: bookings.filter(b => b.status === "new").length,
        contacted: bookings.filter(b => b.status === "contacted").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
    };

    // ── Login ──────────────────────────────────────────────────────────────────
    if (!auth) return (
        <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-5">
                <div className="text-center space-y-2">
                    <Logo className="h-14 mx-auto mb-2" />
                    <h1 className="text-xl font-bold">পার্টনার ড্যাশবোর্ড</h1>
                    <p className="text-sm text-muted-foreground">ডাক্তার সাব পার্টনার পোর্টাল</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative">
                        <Input
                            type={showPass ? "text" : "password"}
                            placeholder="পার্টনার পাসওয়ার্ড"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            className="pr-10"
                        />
                        <button type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() => setShowPass(s => !s)}>
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button type="submit" className="w-full">প্রবেশ করুন</Button>
                </form>
            </motion.div>
        </div>
    );

    // ── Dashboard ──────────────────────────────────────────────────────────────
    return (
        <div className="h-[100dvh] w-full bg-background overflow-y-auto flex flex-col">
            <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">পার্টনার বুকিং ড্যাশবোর্ড</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAuth(false)}>
                    বের হন
                </Button>
            </header>

            <div className="mx-auto w-full max-w-4xl space-y-5 p-4 flex-1 pb-10">
                {/* Search by provider */}
                <Card>
                    <CardContent className="flex flex-col sm:flex-row items-end gap-3 pt-5">
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-xs font-semibold text-muted-foreground">আপনার প্রতিষ্ঠানের নাম বা ID</label>
                            <Input
                                placeholder="যেমন: ঢাকা মেডিকেল, City Hospital..."
                                value={providerId}
                                onChange={e => setProviderId(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && fetchBookings()}
                                className="h-11"
                            />
                        </div>
                        <Button onClick={fetchBookings} disabled={loading} className="h-11 gap-2 shrink-0">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            বুকিং দেখুন
                        </Button>
                    </CardContent>
                </Card>

                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
                )}

                {/* Stat cards */}
                {bookings.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardContent className="flex items-center gap-2 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">নতুন</p>
                                    <p className="text-xl font-bold">{counts.new}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-2 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
                                    <Phone className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">যোগাযোগ</p>
                                    <p className="text-xl font-bold">{counts.contacted}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-2 p-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">নিশ্চিত</p>
                                    <p className="text-xl font-bold">{counts.confirmed}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Bookings table */}
                {bookings.length > 0 ? (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">বুকিং রিকোয়েস্ট ({bookings.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="text-xs whitespace-nowrap">তারিখ</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">রোগী</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">ফোন</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">পছন্দের সময়</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">বিশেষ বার্তা</TableHead>
                                            <TableHead className="text-xs whitespace-nowrap">স্ট্যাটাস</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map(b => (
                                            <TableRow key={b.id} className="hover:bg-muted/30">
                                                <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {new Date(b.created_at).toLocaleDateString("bn-BD")}
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold whitespace-nowrap">
                                                    {b.user_name}
                                                </TableCell>
                                                <TableCell>
                                                    <a href={`tel:${b.user_phone}`}
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline whitespace-nowrap">
                                                        <Phone className="h-3 w-3" /> {b.user_phone}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="text-xs whitespace-nowrap">
                                                    {b.preferred_date && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            {b.preferred_date}
                                                        </div>
                                                    )}
                                                    {b.preferred_time && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {b.preferred_time}
                                                        </div>
                                                    )}
                                                    {!b.preferred_date && !b.preferred_time && "—"}
                                                </TableCell>
                                                <TableCell className="max-w-[140px]">
                                                    <p className="text-[11px] text-muted-foreground truncate" title={b.notes || ""}>
                                                        {b.notes || "—"}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Select
                                                        value={b.status}
                                                        onValueChange={(v) => updateStatus(b.id, v)}
                                                        disabled={updatingId === b.id}
                                                    >
                                                        <SelectTrigger className="h-7 w-36 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="new">নতুন</SelectItem>
                                                            <SelectItem value="contacted">যোগাযোগ হয়েছে</SelectItem>
                                                            <SelectItem value="confirmed">নিশ্চিত</SelectItem>
                                                            <SelectItem value="closed">বন্ধ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    !loading && providerId && (
                        <div className="text-center py-16 text-muted-foreground">
                            <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                            <p className="text-sm">কোনো বুকিং রিকোয়েস্ট পাওয়া যায়নি।</p>
                            <p className="text-xs mt-1 text-muted-foreground/60">প্রতিষ্ঠানের নাম সঠিকভাবে দিন।</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
