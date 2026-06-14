"use client";

import React, { useState } from "react";

export default function PublicHomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Silent authentication/verification or routing to student onboarding occurs here
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const quickLinks = [
    { name: "Reprint PUTME Acknowledgement Slip", url: "https://portal.funai.edu.ng/Pages/Applications/PUTME/ReprintSlip.aspx" },
    { name: "Check PUTME Screening Result", url: "https://portal.funai.edu.ng/Pages/Applications/PUTME/CheckScreeningResult.aspx" },
    { name: "2025/2026 Supplementary Registration", url: "https://portal.funai.edu.ng/Pages/Applications/PUTME_SUPP/ScreeningForm.aspx" },
    { name: "Apply for PG Programme", url: "https://portal.funai.edu.ng/modules/PG/applications/PGApplicationLogin.aspx" },
    { name: "Work and Study Program (WASP)", url: "#" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-[#1B5E20] selection:text-white">
      {/* Hero Section with Drone Video Background */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/campus-poster.jpg"
          className="absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover"
        >
          <source src="/videos/funai-campus-drone.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark High-Contrast Overlay */}
        <div className="absolute z-20 inset-0 bg-black/60 backdrop-blur-[1px]" />

        {/* Hero Overlay Content */}
        <div className="relative z-30 text-center px-4 max-w-4xl mx-auto flex flex-col items-center flex-grow justify-center">
          {/* Emblem Wrapper */}
          <div className="mb-6 w-24 h-24 bg-white/95 rounded-full flex items-center justify-center shadow-xl border-2 border-[#1B5E20] animate-fade-in p-2">
            <span className="text-[#1B5E20] font-black text-2xl tracking-tighter">FUNAI</span>
          </div>
          
          <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl drop-shadow-md">
            Alex Ekwueme Federal University, Ndufu-Alike
          </h1>
          <p className="text-emerald-400 text-lg md:text-2xl font-semibold mt-3 tracking-wide drop-shadow">
            Student Companion Portal
          </p>
        </div>

        {/* Animated Scroll Indicator */}
        <div className="relative z-30 pb-8 animate-bounce">
          <a href="#portal-content" className="text-white/80 hover:text-white transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Main Interactive Portal Layout Area */}
      <main id="portal-content" className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 scroll-mt-6">
        
        {/* Left Column: Quick Access Resource Board */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 order-2 lg:order-1">
          <div className="border-l-4 border-[#1B5E20] pl-4 mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              Portal Quick Access Links
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Direct secure paths to official FUNAI application engines.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target={link.url !== "#" ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 bg-white hover:bg-[#1B5E20]/5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:border-[#1B5E20]/40"
              >
                <div className="flex items-center space-x-4 pr-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1B5E20]/10 text-[#1B5E20] group-hover:bg-[#1B5E20] group-hover:text-white flex items-center justify-center transition-all duration-200 font-bold">
                    {index + 1}
                  </div>
                  <span className="text-slate-700 group-hover:text-slate-900 font-medium text-sm md:text-base transition-colors duration-150">
                    {link.name}
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-[#1B5E20] transform group-hover:translate-x-1 transition-all duration-150 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: High-Security Identity Terminal */}
        <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 w-full backdrop-blur-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Student Identity Terminal</h3>
              <p className="text-xs text-slate-400 mt-1">Sign in to manage offline profiles and configurations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Username / Matric Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FUNAI/202X/XXXXX"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all duration-150 text-sm placeholder-slate-400 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Portal Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all duration-150 text-sm placeholder-slate-400 text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-[#1B5E20] hover:bg-[#154718] disabled:bg-slate-300 text-white font-semibold rounded-xl tracking-wide transition-all duration-150 shadow-md flex items-center justify-center text-sm active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Secure Authenticate"
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-medium px-1">
              <a href="#" className="text-[#1B5E20] hover:underline transition-all">Verify Account</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="text-slate-500 hover:text-slate-700 transition-all">Locked Account? Recover</a>
            </div>
          </div>
        </div>
      </main>

      {/* High-Accessibility Institutional Footer Bar */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1 font-medium tracking-tight">
            <span>Support Hotline:</span>
            <a href="tel:08139833300" className="text-white hover:text-emerald-400 font-bold transition-colors">
              08139833300
            </a>
          </div>
          <div className="text-xs text-center md:text-right text-slate-500 font-normal">
            Copyright © 2026 Alex Ekwueme Federal University, Ndufu-Alike. All institutional rights preserved.
          </div>
        </div>
      </footer>
    </div>
  );
}