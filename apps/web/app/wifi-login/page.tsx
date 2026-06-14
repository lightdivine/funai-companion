'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function WifiLoginPage() {
  const [status, setStatus] = useState<'detecting' | 'authenticating' | 'success' | 'error'>('detecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [networkInfo, setNetworkInfo] = useState<{ ip: string; ssid: string; trustLevel: string } | null>(null);

  useEffect(() => {
    detectNetworkAndAuthenticate();
  }, []);

  const detectNetworkAndAuthenticate = async () => {
    try {
      setStatus('detecting');
      // Step 1: Detect network gateway information from backend request context
      const netRes = await fetch('/api/wifi/detect-network');
      if (!netRes.ok) throw new Error('Could not verify your campus network connection.');
      
      const netData = await netRes.json();
      setNetworkInfo(netData);

      if (!netData.isCampusNetwork) {
        setStatus('error');
        setErrorMessage('You are not connected to any official AE-FUNAI Campus WiFi network. Please check your WiFi settings.');
        return;
      }

      // Step 2: Check for existing session token or local machine trust tokens
      setStatus('authenticating');
      const savedToken = localStorage.getItem('funai_wifi_trust_token');

      const authRes = await fetch('/api/wifi/auto-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trustToken: savedToken,
          ssid: netData.ssid,
          fingerprint: await generateBrowserFingerprint()
        })
      });

      const authData = await authRes.json();

      if (authRes.ok && authData.success) {
        if (rememberDevice && authData.newTrustToken) {
          localStorage.setItem('funai_wifi_trust_token', authData.newTrustToken);
        }
        setStatus('success');
        // Redirect to external login completion gateway or original destination if provided
        setTimeout(() => {
          window.location.href = authData.redirectUrl || 'https://www.funai.edu.ng';
        }, 1500);
      } else {
        // Fallback: If auto-submit fails, guide to explicit authentication path
        setStatus('error');
        setErrorMessage(authData.message || 'Automatic connection failed. Please sign into your portal account.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected connection error occurred. Tap retry to try again.');
    }
  };

  const generateBrowserFingerprint = async () => {
    if (typeof window === 'undefined') return '';
    const navigatorInfo = window.navigator;
    const screenInfo = window.screen;
    const dataString = `${navigatorInfo.userAgent}|${navigatorInfo.language}|${screenInfo.colorDepth}|${screenInfo.width}x${screenInfo.height}`;
    
    // Quick crypto-hash implementation for client security
    const msgUint8 = new TextEncoder().encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-4 font-sans text-slate-800">
      {/* Top Brand Header Section */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-8 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 mb-4 bg-emerald-50 rounded-full flex items-center justify-center p-2">
          <div className="w-20 h-20 relative rounded-full overflow-hidden bg-white flex items-center justify-center border border-emerald-600">
            <span className="font-bold text-xs text-emerald-700 tracking-tighter">AE-FUNAI</span>
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-emerald-800">
          Alex Ekwueme Federal University
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Ndufu-Alike Campus WiFi Network
        </p>
      </div>

      {/* Main Connection Controller Segment */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-100 p-6 my-auto space-y-6">
        {status === 'detecting' && (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-medium text-slate-700">Identifying campus network routing...</p>
          </div>
        )}

        {status === 'authenticating' && (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base font-medium text-slate-700">Authenticating secure device session...</p>
            {networkInfo && (
              <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-mono font-medium">
                Connected to: {networkInfo.ssid}
              </span>
            )}
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-6 space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">You are connected!</h3>
              <p className="text-sm text-slate-600 mt-1">Enjoy fast, uninterrupted campus internet access.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-2 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed px-2">{errorMessage}</p>
            </div>

            <button
              onClick={detectNetworkAndAuthenticate}
              className="w-full bg-emerald-600 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Try Reconnecting
            </button>
          </div>
        )}

        {/* Persistent Checkbox to Control Local Trust Storage */}
        {(status === 'detecting' || status === 'authenticating' || status === 'error') && (
          <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
            <input
              id="remember_device"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="remember_device" className="text-xs font-medium text-slate-600 select-none cursor-pointer">
              Remember this device for 30 days (Auto-Login on campus)
            </label>
          </div>
        )}
      </div>

      {/* Institutional Legal Footer Block */}
      <footer className="w-full max-w-md text-center py-4 text-xs font-medium text-slate-400">
        <p>Support Line: 08139833300 | ICT Center</p>
        <p className="mt-1">&copy; 2026 Alex Ekwueme Federal University</p>
      </footer>
    </main>
  );
}