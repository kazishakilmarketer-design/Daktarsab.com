import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, FileText, MapPin, Phone, CheckCircle, Clock, Package, Truck, Search, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Pharmacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"order" | "history">("order");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchVaultFiles();
      fetchOrders();
    }
  }, [user?.id]);

  const fetchVaultFiles = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("health_vault")
      .select("*")
      .eq("user_id", user.id)
      .eq("file_type", "prescription");
    if (data) setVaultFiles(data);
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("pharmacy_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) {
      toast({ title: "সতর্কতা", description: "ঠিকানা এবং ফোন নম্বর দিন।", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("pharmacy_orders").insert({
        user_id: user?.id,
        delivery_address: address,
        contact_phone: phone,
        status: "pending",
        // we can store prescription ID if selected, but leaving it generic for now
      });

      if (error) throw error;
      
      toast({ title: "অর্ডার সফল!", description: "আপনার ওষুধের অর্ডার গ্রহণ করা হয়েছে।" });
      setAddress("");
      setPhone("");
      setActiveTab("history");
      fetchOrders();
    } catch (err: any) {
      toast({ title: "ত্রুটি", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/>পেন্ডিং</span>;
      case 'processing': return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Package className="w-3 h-3"/>প্রসেসিং</span>;
      case 'shipped': return <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3 h-3"/>শিপড</span>;
      case 'delivered': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/>ডেলিভার্ড</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 flex items-center h-14 px-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-800 ml-2">ই-ফার্মেসি</span>
      </div>

      <div className="bg-emerald-600 px-6 py-8 text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <Pill className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black mb-2">ঘরে বসেই ঔষধ পান</h1>
        <p className="text-emerald-100 text-sm">প্রেসক্রিপশন আপলোড করুন, আমরা ঔষধ পৌঁছে দেব আপনার ঠিকানায়।</p>
      </div>

      <div className="flex bg-white px-4 pt-2 shadow-sm mb-4">
        <button 
          onClick={() => setActiveTab("order")}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "order" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          নতুন অর্ডার
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "history" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          অর্ডার হিস্ট্রি
        </button>
      </div>

      <div className="p-4 max-w-[500px] mx-auto">
        {activeTab === "order" ? (
          <form onSubmit={handleOrderSubmit} className="space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                প্রেসক্রিপশন নির্বাচন করুন
              </h3>
              
              {vaultFiles.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {vaultFiles.map(file => (
                    <label key={file.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${prescriptionId === file.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="prescription" className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" checked={prescriptionId === file.id} onChange={() => setPrescriptionId(file.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{file.file_name}</p>
                        <p className="text-xs text-slate-500">{new Date(file.upload_date).toLocaleDateString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-xs text-slate-500 mb-3">ভল্টে কোনো প্রেসক্রিপশন নেই</p>
                  <button type="button" onClick={() => navigate("/health-card")} className="text-xs font-bold text-emerald-600 bg-emerald-100 px-4 py-2 rounded-lg">ভল্টে আপলোড করুন</button>
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">ডেলিভারি তথ্য</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">ডেলিভারি ঠিকানা</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="বাড়ি নং, রাস্তা, এলাকা" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">মোবাইল নম্বর</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || (vaultFiles.length > 0 && !prescriptionId)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "অর্ডার প্লেস করা হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-slate-100">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">আপনার কোনো পূর্ববর্তী অর্ডার নেই</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-50 pb-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">অর্ডার আইডি</p>
                      <p className="text-sm font-mono font-bold text-slate-800">#{order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-xs font-medium text-slate-600 flex-1">{order.delivery_address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-xs font-medium text-slate-600 flex-1">{order.contact_phone}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                    <p className="text-xs text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm font-black text-slate-800">৳{order.total_amount || "---"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
