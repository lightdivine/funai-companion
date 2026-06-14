"use client";

import React, { useState, useEffect } from "react";
import { saveCredentials, getCredentials, clearCredentials, hasCredentialsSaved } from "../../utils/vault";

interface NetworkProfile {
  id: string;
  name: string;
  location: string;
  type: "Open" | "Portal Secured";
  trustLevel: "High" | "Limited";
}

export default function WifiHelperPage() {
  const [matricNumber, setMatricNumber] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [vaultMsg, setVaultMsg] = useState("");
  const [portalStatus, setPortalStatus] = useState("Checking network state...");
  const [activeTab, setActiveTab] = useState<"vault" | "profiles" | "sessions">("vault");

  // Pre-loaded official FUNAI WiFi Networks
  const funaiNetworks: NetworkProfile[] = [
    { id: "net-1", name: "FUNAI Student Free WiFi", location: "Central Library & ICT Zone", type: "Portal Secured", trustLevel: "High" },
    { id: "net-2", name: "AE-FUNAI Faculty Open WiFi", location: "Faculties Area", type: "Open", trustLevel: "Limited" },
    { id: "net-3", name: "Ndufu-Alike Admin Wireless", location: "Administrative Block", type: "Portal Secured", trustLevel: "High" },
    { id: "net-4", name: "FUNAI Hostel Hotspot", location: "Male & Female Hostels", type: "Portal Secured", trustLevel: "High" },
  ];

  useEffect(() => {
    // Check if credentials exist on initial mount
    const checkVault = async () => {
      const saved = hasCredentialsSaved();
      setIsSaved(saved);
      if (saved) {
        const creds = await getCredentials();
        if (creds) {
          setMatricNumber(creds.matricNumber);
          // Mask password for display safety
          setPortalPassword("••••••••••••");
        }
      }
    };
    
    checkVault();
    simulatePortalDetection();
  }, []);

  const simulatePortalDetection = () => {
    const states = [
      "Detecting captive redirect...",
      "FUNAI Portal Intercepted! Auto-filling credentials...",
      "Connected to FUNAI WiFi ✓",
    ];
    let step = 0;
    const interval = setInterval(() => {
      if (step < states.length) {
        setPortalStatus(states[step]);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleVaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultMsg("");

    if (!matricNumber.trim() || !portalPassword.trim()) {
      setVaultMsg("Please enter a valid Matric Number and Password.");
      return;
    }

    try {
      await saveCredentials({ matricNumber, portalPassword });
      setIsSaved(true);
      setPortalPassword("••••••••••••");
      setVaultMsg("Credentials secured successfully on this phone! ✓");
      simulatePortalDetection();
    } catch (err: any) {
      setVaultMsg(err.message || "An error occurred while accessing secure vault storage.");
    }
  };

  const handleClearVault = () => {
    clearCredentials();
    setMatricNumber("");
    setPortalPassword("");
    setIsSaved(false);
    setVaultMsg("Credentials permanently wiped from this device.");
    setPortalStatus("Disconnected / Missing Configuration");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-[#1B5E20] selection:text-white">
      {/* Header Banner */}
      <header className="w-full bg-[#1B5E20] text-white px-4 py-5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg text-[#1B5E20]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10.5 10.5 0 0114.142 0M1.414 6.586a17 17 0 0121.172 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">WiFi Auto-Login Helper</h1>
            <p className="text-xs text-emerald-200">Skip the repetitive login forms on campus networks</p>
          </div>
        </div>
      </header>

      {/* Main Panel Content Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-8 flex-grow flex flex-col">
        
        {/* Real-time Status Widget */}
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`relative flex h-3 w-3 ${portalStatus.includes("✓") ? "text-emerald-500" : "text-amber-500"}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
            </span>
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Automation Status</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{portalStatus}</p>
            </div>
          </div>
          <button 
            onClick={simulatePortalDetection}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-all"
          >
            Refresh Link
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-200 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab("vault")}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${activeTab === "vault" ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            Credential Vault
          </button>
          <button
            onClick={() => setActiveTab("profiles")}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${activeTab === "profiles" ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            Campus Profiles
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${activeTab === "sessions" ? "border-[#1B5E20] text-[#1B5E20]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            Saved Sessions
          </button>
        </div>

        {/* Tab panels components implementation */}
        <div className="flex-grow">
          {activeTab === "vault" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Secure Encryption Engine</h2>
              <p className="text-xs text-slate-400 mb-5">Your authentication tokens are hashed locally using hardware-locked signatures.</p>

              <form onSubmit={handleVaultSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Matriculation Number</label>
                  <input
                    type="text"
                    disabled={isSaved}
                    placeholder="e.g., FUNAI/2022/10432"
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1B5E20] disabled:bg-slate-100 disabled:text-slate-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Portal Password</label>
                  <input
                    type="password"
                    disabled={isSaved}
                    placeholder={isSaved ? "••••••••••••" : "Enter your portal credentials"}
                    value={portalPassword}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1B5E20] disabled:bg-slate-100 disabled:text-slate-500 text-sm"
                  />
                </div>

                {vaultMsg && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${vaultMsg.includes("✓") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    {vaultMsg}
                  </div>
                )}

                <div className="pt-2 flex space-x-3">
                  {!isSaved ? (
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#154718] text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                    >
                      Lock Credentials
                    </button>
                    ) : (
                    <button
                      type="button"
                      onClick={handleClearVault}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
                    >
                      Wipe Configuration
                    </button>
                  )}
                </div>
              </form>

              {/* Strict Privacy Notice Block */}
              <div className="mt-6 p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B5E20] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-700">Device Lock Protocol Notice:</span> Saved on this device only. Your information is never synchronized, uploaded, or leaked outside this application frame sandbox.
                </p>
              </div>
            </div>
          )}

          {activeTab === "profiles" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm max-w-2xl">
                <h2 className="text-base font-bold text-slate-800 mb-1">Configured Campus Transmitters</h2>
                <p className="text-xs text-slate-400 mb-4">App automatically selects the best matching verification engine based on the SSID fingerprint.</p>

                <div className="divide-y divide-slate-100">
                  {funaiNetworks.map((net) => (
                    <div key={net.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h3 className="text-sm font-bold text-slate-700">{net.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{net.location}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{net.type}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${net.trustLevel === "High" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {net.trustLevel} Trust
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Session Management</h2>
              <p className="text-xs text-slate-400 mb-4">Background security tokens remain cached to prevent redundant portal interception.</p>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Last Token Handshake</span>
                  <span className="font-semibold text-slate-700">Active (Refreshed recently)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Background Expiration Interval</span>
                  <span className="font-semibold text-slate-700">Every 23 Hours</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">Interruption Alerts Filter</span>
                  <span className="font-semibold text-emerald-600">Suppressed (Single Alert Mode)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}