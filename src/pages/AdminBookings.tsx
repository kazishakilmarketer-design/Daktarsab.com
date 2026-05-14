import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle2, Phone, Calendar as CalendarIcon, Clock, Store, Stethoscope, Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Tables } from "@/integrations/supabase/types";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type BookingRequest = Tables<"booking_requests">;

export default function AdminBookings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // SECURITY: Enforce authentication and admin role
    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }
        // Additional role check via profiles table
        (supabase as any)
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }: { data: { role?: string } | null }) => {
              if (!data || data.role !== "admin") {
                  toast({ title: "Access Denied", description: "Admin access required.", variant: "destructive" });
                  navigate('/', { replace: true });
              }
          });
    }, [user, loading, navigate, toast]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from("booking_requests")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast({
                title: "Trhough Exception",
                description: "Failed to fetch bookings.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("booking_requests")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
            );

            toast({
                title: "Status Updated",
                description: `Booking status changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update booking status.",
                variant: "destructive",
            });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status.toLowerCase()) {
            case "new":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>;
            case "contacted":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Contacted</Badge>;
            case "confirmed":
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Confirmed</Badge>;
            case "closed":
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredBookings = bookings.filter((b) =>
        (b.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.user_phone || "").includes(searchQuery) ||
        (b.provider_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">
                        Loading Admin Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <Header />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pt-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard: Bookings</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage all lead requests across the platform.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search name, phone, or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <TableRow>
                                    <TableHead className="w-[200px]">Patient Details</TableHead>
                                    <TableHead className="w-[200px]">Provider</TableHead>
                                    <TableHead className="w-[150px]">Preferred Time</TableHead>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                    <TableHead className="text-right w-[150px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            No bookings found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{booking.user_name}</div>
                                                <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <a href={`tel:${booking.user_phone}`} className="hover:text-emerald-600 hover:underline">
                                                        {booking.user_phone}
                                                    </a>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-medium text-slate-800 line-clamp-1 flex items-center gap-1.5">
                                                    {booking.service_type === 'doctor' ? (
                                                        <Stethoscope className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                    ) : (
                                                        <Store className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    )}
                                                    {booking.provider_name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 capitalize">
                                                    {booking.service_type} Request
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm text-slate-700">
                                                    {booking.preferred_date ? (
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                                            {format(new Date(booking.preferred_date), "MMM d, yyyy")}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">No Date</span>
                                                    )}

                                                    {booking.preferred_time && (
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            {booking.preferred_time}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge status={booking.status} />
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    {format(new Date(booking.created_at), "MMM d, h:mm a")}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right align-top pt-4">
                                                <Select
                                                    value={booking.status}
                                                    onValueChange={(val) => updateStatus(booking.id, val)}
                                                >
                                                    <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                                                        <SelectValue placeholder="Update Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="contacted">Contacted</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="closed">Closed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </div>
    );
}
