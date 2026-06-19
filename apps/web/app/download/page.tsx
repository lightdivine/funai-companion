"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DownloadContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const pack = searchParams.get("pack");

  // Format the pack name nicely for the student
  const getPackName = (id: string | null) => {
    if (id === "funai-pack") return "FUNAI POST-UTME Past Questions (2018-2024)";
    if (id === "combo-pack") return "COMBO PACK (JAMB + FUNAI) Complete Bundle";
    if (id === "jamb-pack") return "JAMB Past Questions (2015-2024)";
    return "Official Study Pack";
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-black">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center border border-gray-100">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1B5E20]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1">Payment Verified!</h1>
        <p className="text-xs text-gray-500 mb-6">Your download link is generated and ready below.</p>

        {/* Transaction Details Box */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-xs border border-gray-100 space-y-2">
          <div>
            <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">Material:</span>
            <span className="font-semibold text-gray-800 text-sm">{getPackName(pack)}</span>
          </div>
          <div>
            <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">Receipt Ref:</span>
            <span className="font-mono text-gray-600 bg-gray-200/50 px-1.5 py-0.5 rounded text-[11px]">{ref || "PRST-TEMPREF"}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => alert("Simulating PDF Download! (Your file download will trigger here)")}
          className="w-full bg-[#1B5E20] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-green-800 transition shadow-md shadow-green-900/20 active:scale-95"
        >
          📥 Download PDF Now
        </button>

        <p className="text-[11px] text-gray-400 mt-4">
          A backup link has also been sent to your email.
        </p>
      </div>
    </main>
  );
}

// Next.js 14 requires useSearchParams to be wrapped in a Suspense boundary
export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm font-medium">
        Verifying transaction status...
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}