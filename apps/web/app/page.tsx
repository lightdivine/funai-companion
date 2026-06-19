"use client";

import { useState } from "react";

interface StudyPack {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function SalesPage() {
  // State for controlling the email modal and loading indicator
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // The study packs available for students
  const packs: StudyPack[] = [
    {
      id: "funai-pack",
      name: "FUNAI Post-UTME Pack",
      price: 1500,
      priceLabel: "₦1,500",
      description: "Complete FUNAI past questions and answers from 2018 to 2024.",
      features: [
        "100% Verified Answers",
        "Saves Offline as PDF",
        "Includes Computer Based Test (CBT) Tips",
        "Free Updates Until Exam Day"
      ]
    },
    {
      id: "combo-pack",
      name: "The Ultimate Combo Bundle",
      price: 2000,
      priceLabel: "₦2,000",
      description: "Get both JAMB and FUNAI Past Questions combined at a huge discount.",
      features: [
        "Everything in FUNAI Pack",
        "Everything in JAMB Pack",
        "High-Score Exam Strategies",
        "Priority Email Support"
      ],
      popular: true
    },
    {
      id: "jamb-pack",
      name: "JAMB Past Questions",
      price: 1000,
      priceLabel: "₦1,000",
      description: "Comprehensive JAMB past questions across all major subjects (2015-2024).",
      features: [
        "Detailed explanations for formulas",
        "Works on Mobile & PC",
        "Core subject combinations included",
        "Immediate download access"
      ]
    }
  ];

  const openPaymentModal = (packId: string) => {
    setSelectedPack(packId);
    setIsOpen(true);
  };

  // Mock payment function to bypass Paystack restrictions locally
  const handleMockPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Simulate network delay to test your loading state spinner
    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
      
      // Redirect to the download page with mock query variables
      const randomRef = `MOCK_REF_${Math.floor(Math.random() * 900000 + 100000)}`;
      window.location.href = `/download?ref=${randomRef}&pack=${selectedPack}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Hero Header Banner */}
      <header className="bg-[#1B5E20] text-white text-center py-16 px-4 shadow-md">
        <div className="max-w-3xl mx-auto">
          <span className="bg-green-700 text-green-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            2026 Academic Session Updated
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tight">
            Score High In Your Exams With <br/> FUNAI Companion
          </h1>
          <p className="text-green-100 text-base md:text-lg mt-4 max-w-xl mx-auto font-light leading-relaxed">
            Download verified, up-to-date JAMB &amp; FUNAI Post-UTME Past Questions and Answers instantly to your smartphone.
          </p>
        </div>
      </header>

      {/* Pricing Grid Section */}
      <main className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Select Your Study Pack</h2>
        <p className="text-sm text-gray-500 text-center mb-12">One-time safe payment. Lifetime offline access.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {packs.map((pack) => (
            <div 
              key={pack.id} 
              className={`bg-white rounded-2xl shadow-sm border p-6 relative transition hover:shadow-md ${
                pack.popular ? "border-2 border-[#1B5E20] md:-translate-y-4 shadow-lg bg-gradient-to-b from-white to-green-50/20" : "border-gray-200"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B5E20] text-white text-[10px] tracking-wider font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Most Popular Pack
                </span>
              )}

              <h3 className="text-xl font-black text-gray-900 mb-1">{pack.name}</h3>
              <p className="text-xs text-gray-500 min-h-[32px] leading-relaxed mb-4">{pack.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-black text-gray-900">{pack.priceLabel}</span>
                <span className="text-xs text-gray-400 font-medium ml-1">/ instant download</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs font-medium text-gray-700 border-t border-gray-100 pt-4">
                {pack.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openPaymentModal(pack.id)}
                className={`w-full font-bold py-3 px-4 rounded-xl transition text-center shadow-sm active:scale-[0.98] ${
                  pack.popular 
                    ? "bg-[#1B5E20] hover:bg-green-800 text-white shadow-green-900/10" 
                    : "bg-gray-900 hover:bg-gray-850 text-white"
                }`}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} FUNAI Companion Educational Hub. All rights reserved.
      </footer>

      {/* Interactive Email Capture Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 relative">
            
            {/* Modal Header & Close Toggle */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-gray-900">Secure Checkout</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Please input the student email address below. Your download reference and matching PDF links will be delivered here instantly.
            </p>

            {/* Email Input Submission Form */}
            <form onSubmit={handleMockPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent transition text-sm disabled:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B5E20] hover:bg-green-800 disabled:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-green-900/10"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Payment Simulation...</span>
                  </>
                ) : (
                  <span>💳 Pay Securely (Test Redirect)</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}