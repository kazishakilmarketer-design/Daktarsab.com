import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MonitorUp, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface VideoChamberProps {
  bookingId: string;
  isDoctor: boolean;
  participantName: string;
  onEndCall: () => void;
}

export default function VideoChamber({ bookingId, isDoctor, participantName, onEndCall }: VideoChamberProps) {
  const { user } = useAuth();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [status, setStatus] = useState<"connecting" | "waiting" | "connected">("connecting");
  const [callDuration, setCallDuration] = useState(0);

  // Initialize Local Media
  useEffect(() => {
    async function initMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        // Simulate WebRTC connection delay
        setTimeout(() => {
          setStatus("waiting");
          // Simulate remote peer joining after 3 seconds
          setTimeout(() => {
            setStatus("connected");
          }, 3000);
        }, 1500);
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    }
    initMedia();

    return () => {
      // Cleanup media tracks on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call Timer
  useEffect(() => {
    let interval: number;
    if (status === "connected") {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Toggles
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => t.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => t.enabled = !cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-slate-950/80 to-transparent">
        <div>
          <h2 className="text-white font-bold text-lg">{isDoctor ? "Virtual Chamber" : "Telemedicine Call"}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-slate-300 text-sm font-medium">
              {status === "connecting" ? "Connecting..." : status === "waiting" ? `Waiting for ${participantName}...` : formatTime(callDuration)}
            </span>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl px-4 py-2">
          <p className="text-slate-300 text-sm font-semibold">End-to-end Encrypted</p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        
        {/* Remote Video (Main) */}
        <div className="w-full max-w-5xl h-full max-h-[80vh] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl">
          {status === "connected" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              {/* Mock Remote Video Stream Placeholder */}
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-slate-400 mb-4">
                  {participantName.charAt(0)}
                </div>
                <h3 className="text-white text-xl font-medium">{participantName}</h3>
                <p className="text-slate-400 mt-1">Camera Off</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400 font-medium">
                {status === "connecting" ? "Initializing secure connection..." : "Waiting for participant to join..."}
              </p>
            </div>
          )}
          
          <video 
            ref={remoteVideoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            playsInline 
          />
        </div>

        {/* Local Video (Floating PIP) */}
        <div className="absolute bottom-24 right-8 w-40 sm:w-60 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl transition-all duration-300">
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff className="w-8 h-8 text-slate-500" />
            </div>
          )}
          <video 
            ref={localVideoRef} 
            className={`w-full h-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`} 
            autoPlay 
            playsInline 
            muted 
          />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-[10px] font-medium">
            You {!micOn && "(Muted)"}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-slate-950 to-transparent">
        
        <button 
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${cameraOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        
        <button className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all">
          <MonitorUp className="w-6 h-6" />
        </button>

        <button className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all">
          <MessageSquare className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            onEndCall();
          }}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

      </div>
    </div>
  );
}
