import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoaded } = useProfile();

  const needsProfileCompletion = isLoaded && !profile.name;

  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${location.pathname === "/home" || location.pathname === "/" ? "on" : ""}`} 
        onClick={() => navigate("/home")}
      >
        <div className="nav-active-bar" style={{ display: location.pathname === "/home" || location.pathname === "/" ? "block" : "none" }}></div>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">হোম</span>
      </button>

      <button 
        className={`nav-item ${location.pathname.startsWith("/search") || location.pathname.startsWith("/doctors") ? "on" : ""}`} 
        onClick={() => navigate("/doctors")}
      >
        <div className="nav-active-bar" style={{ display: location.pathname.startsWith("/search") || location.pathname.startsWith("/doctors") ? "block" : "none" }}></div>
        <span className="nav-icon">🔍</span>
        <span className="nav-label">খুঁজুন</span>
      </button>

      <button 
        className={`nav-item ${location.pathname === "/chat" ? "on" : ""}`} 
        onClick={() => navigate("/chat")} 
        style={{ position: "relative" }}
      >
        <div className="nav-active-bar" style={{ display: location.pathname === "/chat" ? "block" : "none" }}></div>
        <div style={{ position: "absolute", top: "-22px", background: "var(--g5)", color: "#fff", borderRadius: "20px", padding: "7px 16px", fontSize: "11px", fontWeight: "700", boxShadow: "0 4px 14px rgba(15,110,86,.5)", whiteSpace: "nowrap", border: "2px solid var(--white)", zIndex: 10 }}>🤖 AI পরামর্শ</div>
        <span className="nav-icon">🤖</span>
        <span className="nav-label">AI</span>
      </button>

      <button 
        className={`nav-item ${location.pathname === "/appointments" ? "on" : ""}`} 
        onClick={() => navigate("/appointments")}
      >
        <div className="nav-active-bar" style={{ display: location.pathname === "/appointments" ? "block" : "none" }}></div>
        <span className="nav-icon">📅</span>
        <span className="nav-label">অ্যাপয়েন্ট</span>
      </button>

      <button 
        className={`nav-item ${location.pathname === "/profile" ? "on" : ""}`} 
        onClick={() => navigate(user ? "/profile" : "/auth")}
        style={{ position: "relative" }}
      >
        <div className="nav-active-bar" style={{ display: location.pathname === "/profile" ? "block" : "none" }}></div>
        {needsProfileCompletion && user && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
        <span className="nav-icon">👤</span>
        <span className="nav-label">প্রোফাইল</span>
      </button>
    </nav>
  );
}
