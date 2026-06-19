'use client';

import React, { useEffect, useState } from 'react';

interface Pack {
  id: string;
  title: string;
  price: number;
  priceLabel: string;
  description: string;
  badge?: string;
  emoji: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export default function SalesPage() {
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const packs: Pack[] = [
    {
      id: 'jamb-pack',
      title: 'JAMB Past Questions 2015-2024',
      price: 150000,
      priceLabel: '₦1,500',
      description: 'All 4 subjects with answers and clear explanations included completely.',
      emoji: '📚',
    },
    {
      id: 'funai-pack',
      title: 'FUNAI POST-UTME Past Questions',
      price: 100000,
      priceLabel: '₦1,000',
      description: '2018-2024 all years covered plus full institutional marking scheme.',
      emoji: '🦅',
    },
    {
      id: 'combo-pack',
      title: 'COMBO PACK — Best Value 🔥',
      price: 200000,
      priceLabel: '₦2,000',
      description: 'JAMB + FUNAI complete resource bundle. Maximize your admission chances.',
      badge: 'Most Popular',
      emoji: '⚡',
    },
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBuyClick = (pack: Pack) => {
    setErrorMessage('');
    setSelectedPack(pack);
    setShowEmailModal(true);
  };

  const executePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedPack || !scriptLoaded) return;

    setShowEmailModal(false);
    const reference = 'TX-' + Math.floor(Math.random() * 1000000000 + 1);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
      email: email,
      amount: selectedPack.price,
      currency: 'NGN',
      ref: reference,
      callback: function (response) {
        window.location.href = `/download?ref=${response.reference}&pack=${selectedPack.id}`;
      },
      onClose: function () {
        setErrorMessage('Payment cancelled. Try again.');
      },
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center items-start antialiased selection:bg-green-200">
      <main className="w-full max-width-[480px] min-h-screen bg-white shadow-2xl flex flex-col justify-between px-5 py-6 mx-auto" style={{ maxWidth: '480px' }}>
        <div>
          {/* Header */}
          <div className="text-center mt-4 mb-8">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Academic Access Hub</h1>
            <p className="text-xs text-neutral-500 font-medium mt-1">Instant Direct PDF Download Mapped Instantly</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded">
              {errorMessage}
            </div>
          )}

          {/* Cards Stack */}
          <div className="space-y-5">
            {packs.map((pack) => (
              <div key={pack.id} className={`relative border-2 rounded-xl p-5 transition-all bg-white ${pack.badge ? 'border-green-600 ring-1 ring-green-600/30' : 'border-neutral-200'}`}>
                {pack.badge && (
                  <span className="absolute -top-3 right-4 bg-green-700 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                    {pack.badge}
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5" role="img" aria-label="pack-icon">{pack.emoji}</span>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">{pack.title}</h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{pack.description}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Price</span>
                    <span className="text-xl font-black text-neutral-900">{pack.priceLabel}</span>
                  </div>
                  <button
                    onClick={() => handleBuyClick(pack)}
                    disabled={!scriptLoaded}
                    className="bg-[#1B5E20] hover:bg-green-800 disabled:bg-neutral-300 text-white font-bold text-xs px-4 py-2.5 rounded-lg tracking-wide shadow-md active:scale-95 transition-all"
                  >
                    Buy Now — Instant Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Free Sample Gateway */}
          <div className="mt-6 border border-dashed border-green-300 bg-green-50/40 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-neutral-700">Want to inspect the content structure first?</p>
            <a href="/free-sample" className="text-xs font-bold text-[#1B5E20] underline inline-block mt-1 hover:text-green-800">
              Download Free Preview Sample Here 📄
            </a>
          </div>

          {/* Trust Footprint */}
          <div className="mt-8 bg-neutral-50 rounded-xl p-4 border border-neutral-100 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
              <span className="text-green-600">✅</span> <span>Instant direct download after payment processing</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
              <span className="text-green-600">✅</span> <span>WhatsApp support channel line: 080XXXXXXXX</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
              <span className="text-green-600">✅</span> <span>100% complete with full verifiable answer keys</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
              <span className="text-green-600">✅</span> <span>Over 200 high-tier local students using this model</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-6 border border-neutral-200/60 rounded-xl p-4 bg-white italic shadow-sm">
            <p className="text-xs text-neutral-600 leading-relaxed">
              &ldquo;The POST-UTME solutions saved me days of unnecessary hunting. Exactly matches the curriculum schema.&rdquo;
            </p>
            <span className="text-[10px] font-bold text-neutral-400 block mt-2 not-italic uppercase tracking-wide">— Chioma, Pre-Admission Lead</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-4 border-t border-neutral-100">
          <p className="text-[11px] font-bold text-neutral-500">
            Questions? <a href="https://wa.me/2348000000000" className="text-[#1B5E20] underline font-extrabold">WhatsApp Support Channel</a>
          </p>
        </footer>
      </main>

      {/* Input Overlay Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-base">Delivery Context Confirmed</h3>
            <p className="text-xs text-neutral-500 mt-1">Input your active email address where download vouchers will be stored.</p>
            <form onSubmit={executePayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@domain.com"
                  className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-green-600 text-neutral-900"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="w-1/2 border border-neutral-200 text-neutral-700 font-bold text-xs py-2.5 rounded-lg active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#1B5E20] hover:bg-green-800 text-white font-bold text-xs py-2.5 rounded-lg active:scale-95 transition-all shadow-md"
                >
                  Proceed to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}