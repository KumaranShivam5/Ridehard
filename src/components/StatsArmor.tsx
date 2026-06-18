import React from 'react';
import { Settings, ShieldCheck, Radio } from 'lucide-react';
import { FIELD_STATIONS, ILP_REQUIREMENTS } from '../constants.ts';

export default function StatsArmor() {
  return (
    <section className="w-full bg-stone-100 text-stone-900 py-16 px-4 md:px-8 border-b border-stone-200" id="why-armor font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Visual Title Header with elegant subtle divider */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-stone-200 pb-8">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-oxide-light uppercase bg-[#1B3C1F]/10 border border-oxide/30 px-3 py-1 rounded-none inline-block">
               🌲 ALL-TERRAIN SPECS & LOGISTICS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight text-stone-900 uppercase mt-2">
              The RideHard Touring Advantage
            </h2>
          </div>
          <p className="max-w-md font-sans text-xs font-bold leading-relaxed text-stone-800 bg-white p-4 border-2 border-stone-900 shadow-[4px_4px_0px_#1C1D1F] rounded-none">
            Our adventure fleet is fully optimized and professionally prepped for grueling mountain tracks. We secure all regional permits, offer backup mechanics, and build direct on-wheels support so you can tackle are toughest circuits.
          </p>
        </div>

        {/* Triple Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
          {/* Spec Column 1: Mountain Tuning */}
          <div className="bg-[#F1EDE6] border-2 border-stone-900 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between hover:border-oxide transition-colors">
            <div>
              <div className="bg-stone-950 text-stone-100 w-12 h-12 flex items-center justify-center border-2 border-stone-950 rounded-none mb-6">
                <Settings size={22} className="text-oxide" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight mb-3 text-stone-900">
                HIGH-ALTITUDE ENGINE TUNING
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-6 font-medium">
                All Himalayan and Scram motorcycles are fuel-mapped and optimized to ensure precise throttle response in thin mountain air above 12,000 feet. We mount heavy-duty crash guards, sturdy aluminum engine plates, and dual-purpose tyres to handle severe terrain confidently.
              </p>
            </div>
            <div className="bg-white border-2 border-stone-900 p-4 rounded-none font-sans text-[11px] text-stone-800 font-medium">
              <span className="font-bold text-stone-900 uppercase block mb-1">Equipment specs:</span> Long-travel suspension setups, reinforced 4.5mm bash plates, and robust phone mounts with USB charge feeds.
            </div>
          </div>

          {/* Spec Column 2: ILP/PAP automation */}
          <div className="bg-[#F1EDE6] border-2 border-stone-900 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between hover:border-oxide transition-colors">
            <div>
              <div className="bg-stone-950 text-stone-100 w-12 h-12 flex items-center justify-center border-2 border-stone-950 rounded-none mb-6">
                <ShieldCheck size={22} className="text-oxide" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight mb-3 text-stone-900">
                PRE-SECURED TOUR PERMITS
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-6 font-medium">
                Skip local government queues and complex border checks. Every RideHard expedition booking triggers our automated travel office. We arrange Inner Line Permits (ILPs) for Arunachal Pradesh and assist foreign riders with Protected Area Permits (PAPs) smoothly.
              </p>
            </div>
            <div className="bg-oxide/5 border-2 border-oxide/40 p-4 rounded-none font-sans text-[11px] text-[#1B3C1F] text-left text-xs font-semibold">
              <span className="font-bold uppercase block mb-1 text-stone-900">Permit Guidelines:</span>
              <ul className="list-disc pl-4 space-y-1">
                {ILP_REQUIREMENTS.map((req, idx) => (
                  <li key={idx} className="font-bold text-stone-800">{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Spec Column 3: Satellite Mechanic Backline */}
          <div className="bg-[#F1EDE6] border-2 border-stone-900 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between hover:border-oxide transition-colors">
            <div>
              <div className="bg-stone-950 text-stone-100 w-12 h-12 flex items-center justify-center border-2 border-stone-950 rounded-none mb-6">
                <Radio size={22} className="text-oxide" />
              </div>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight mb-3 text-stone-900">
                ON-ROAD ASSISTANCE NETWORK
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed mb-6 font-medium">
                Our support partnership coordinates with skilled local workshops across key hubs like Sela Pass, Tawang, Ziro, or Daporijo. In the rare event of a tire puncture or accessory tweak, we guide you directly to vetted regional mechanics to deliver rapid assistance.
              </p>
            </div>
            <div className="bg-white border-2 border-stone-900 p-4 rounded-none font-sans text-[11px] text-left">
              <span className="font-bold text-stone-900 uppercase block mb-2">Regional Support Hubs:</span>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_STATIONS.map((stn, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 border border-stone-350 p-1.5 bg-stone-50 rounded-none shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-none inline-block ${stn.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                    <span className="font-bold text-stone-800 truncate">{stn.place}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
