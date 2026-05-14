import { useState } from "react";
import { Stethoscope, Star, User, Menu, X, Home, MapPin, MessageCircle, UserCheck, LayoutDashboard, Info, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient } from "@/contexts/PatientContext";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import doctorAvatar from "@/assets/doctor-avatar.png";
import Logo from "@/components/Logo";

const NAV_LINKS = [
  { to: "/", label: "হোম", icon: Home },
  { to: "/chat", label: "AI পরামর্শ", icon: MessageCircle },
  { to: "/prescription", label: "প্রেসক্রিপশন অডিটর", icon: MessageCircle },
  { to: "/hospital-map", label: "হাসপাতাল", icon: MapPin },
  { to: "/doctors", label: "ডাক্তার", icon: UserCheck },
  { to: "/features", label: "আরো দেখুন", icon: Info },
];

export default function Header() {
  const { rewardPoints } = usePatient();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0];

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md shadow-sm relative z-50">
      {/* Main header row */}
      <div className="flex w-full h-12 items-center justify-between px-3 sm:px-4 md:h-14 md:px-6 gap-1 sm:gap-2">

        {/* Left — Logo */}
        <NavLink to="/" className="flex items-center shrink-0 min-w-[100px]" onClick={() => setMenuOpen(false)}>
          <Logo className="h-6 sm:h-7 md:h-8" />
        </NavLink>

        {/* Center — empty space to push user profile to right */}
        <div className="flex-1"></div>

        {/* Right — User + Logout + Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 justify-end min-w-0">

          {user ? (
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              {/* User badge linked to Profile */}
              <NavLink to="/profile" className="flex items-center gap-1.5 bg-accent/50 px-2 py-1 rounded-full hover:bg-accent transition-colors min-w-0">
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                  <User className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                </div>
                <div className="flex flex-col items-start leading-none min-w-0">
                  <span className="text-[10px] sm:text-xs font-bold text-foreground max-w-[50px] sm:max-w-[80px] truncate">
                    {displayName}
                  </span>
                </div>
              </NavLink>
              {/* Logout — desktop only */}
              <button
                id="logout-btn"
                onClick={handleLogout}
                title="লগআউট"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className="flex items-center gap-1.5 bg-accent/50 px-3 py-1.5 rounded-full hover:bg-accent transition-colors">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] sm:text-xs text-primary font-bold">গেস্ট মোড</span>
            </NavLink>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="মেনু"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-accent/60 text-foreground hover:bg-accent"
                      }`}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </NavLink>
                );
              })}
              {/* Logout — mobile menu, full width */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  লগআউট
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
