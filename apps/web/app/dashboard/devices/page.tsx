'use client';

import React, { useState, useEffect } from 'react';

interface Device {
  id: string;
  deviceName: string;
  registeredAt: string;
  lastSeenAt: string;
  trustLevel: 'FULL' | 'LIMITED' | 'BLOCKED';
  isActive: boolean;
}

export default function StudentDevicesDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ deviceName: '', rawMacAddress: '' });
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hardcoded for development verification context; read dynamic context safely in production build pipelines
  const currentStudentId = "usr_funai_2026_test"; 

  useEffect(() => {
    fetchConnectedDevices();
  }, []);

  const fetchConnectedDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wifi/my-devices?studentId=${currentStudentId}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Failed to load registered hardware instances.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);

    if (!formData.deviceName || !formData.rawMacAddress) {
      setActionMessage({ type: 'error', text: 'Please fill in all layout fields completely.' });
      return;
    }

    try {
      const res = await fetch('/api/wifi/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudentId,
          deviceName: formData.deviceName,
          rawMacAddress: formData.rawMacAddress,
          deviceFingerprint: "manual-onboarding-context"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: 'success', text: 'Device successfully bound to your network access profile!' });
        setFormData({ deviceName: '', rawMacAddress: '' });
        fetchConnectedDevices();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Verification rejected.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network request error occurred during processing.' });
    }
  };

  const handleRemoveDevice = async (id: String) => {
    if (!confirm('Are you absolutely certain you want to remove authorization access for this device hardware?')) return;
    try {
      const res = await fetch(`/api/wifi/remove-device/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDevices(devices.filter(d => d.id !== id));
      }
    } catch (err) {
      alert('Could not delete selected target resource.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Campus WiFi Device Registration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage authorized personal endpoints linked to the AE-FUNAI central authentication engine. (Maximum: 3 Devices)
        </p>
      </div>

      {/* Main Form/Grid Configuration Split Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Device Registration Segment */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
          <h3 className="text-base font-bold text-slate-800">Authorize New Endpoint</h3>
          
          {actionMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              {actionMessage.text}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Device Label</label>
              <input
                type="text"
                placeholder="e.g. Tecno Camon 20"
                value={formData.deviceName}
                onChange={e => setFormData({ ...formData, deviceName: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">MAC Address (Physical Address)</label>
              <input
                type="text"
                placeholder="e.g. AA:BB:CC:11:22:33"
                value={formData.rawMacAddress}
                onChange={e => setFormData({ ...formData, rawMacAddress: e.target.value })}
                className="w-full font-mono text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                Found under Settings &rarr; About Phone &rarr; Status &rarr; WiFi MAC Address. Disable &quot;Randomized MAC&quot; for the campus networks.
              </span>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              Bind Access Configuration
            </button>
          </form>
        </div>

        {/* Device Listing Dashboard Segment */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Active Authorized Hardwares</h3>

          {loading ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
              Polling backend synchronization schemas...
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
              No personal endpoints bound to this matric index yet. Register a device to bypass the daily landing portal login screen.
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-800">{device.deviceName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        device.trustLevel === 'FULL' ? 'bg-emerald-50 text-emerald-800' : device.trustLevel === 'LIMITED' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {device.trustLevel} Trust
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Registered: {new Date(device.registeredAt).toLocaleDateString('en-GB')} | Last Used: {new Date(device.lastSeenAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-slate-50 transition"
                    title="Revoke device clearance permissions"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h10M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}