import React, { useState } from 'react';
import { Calendar, Eye, MapPin, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types.ts';
import { SELA_PASS_IMAGE } from '../constants.ts';

interface ReportsJournalProps {
  reports: JournalEntry[]; // Reports prop mapped to JournalEntry lists
}

export default function ReportsJournal({ reports }: ReportsJournalProps) {
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);

  const getCategoryStyle = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('guide') || c.includes('route')) {
      return 'bg-emerald-600 text-white border-stone-900 font-bold rounded-none';
    }
    if (c.includes('advice') || c.includes('rider')) {
      return 'bg-amber-600 text-white border-stone-900 font-bold rounded-none';
    }
    return 'bg-oxide text-white border-stone-900 font-bold rounded-none';
  };

  return (
    <section className="w-full bg-stone-105 text-stone-900 py-20 px-4 md:px-8 border-b-4 border-stone-900 font-sans" id="active-journal">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="mb-12 border-b-2 border-stone-300 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-oxide-light uppercase bg-[#1B3C1F]/10 border border-oxide/30 px-3 py-1 rounded-none inline-block">
              🌲 Local Riding Insights & Guides
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight text-stone-900 uppercase mt-1">
              The RideHard Journal
            </h2>
          </div>
          <p className="max-w-sm font-sans text-xs font-bold leading-relaxed bg-[#F1EDE6] p-4 rounded-none border-2 border-stone-900 shadow-[4px_4px_0px_#1C1D1F]">
            📰 Essential packing checklists, safety advisories, and path breakdowns compiled by heavy-duty trail guides who know Northeast India's passes inside out. Check weather conditions before pushing out.
          </p>
        </div>

        {/* Scout Reports Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Sela Pass Graphic Media Banner */}
          <div className="relative border-4 border-stone-900 rounded-none bg-black h-[320px] lg:h-auto overflow-hidden flex flex-col justify-end p-4 md:p-8 group shadow-[6px_6px_0px_#1C1D1F]">
            <img
              src={SELA_PASS_IMAGE}
              alt="Sela Pass High Altitude Terrain - Tawang Mountain Expedition Route in Northeast India"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay Gradient context */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
 
            <div className="relative z-10 space-y-3 font-sans text-left">
              <span className="bg-oxide text-stone-100 font-bold uppercase text-[10px] py-1 px-3 rounded-none border border-white shadow inline-block">
                Featured Highlight: Sela Pass
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-tight text-white leading-tight">
                Navigating Arunachal's Alpine Pass
              </h3>
              <p className="text-xs text-stone-200 leading-relaxed">
                Reaching 13,700 feet, Sela Pass is the ultimate adrenaline stretch on our expeditions. Review weather windows, dual-sport tyres, and cold alpine gear checklists to tackle this pass confidently.
              </p>
            </div>
          </div>

          {/* CMS Blog reports lists */}
          <div className="space-y-6">
            {reports.map((post) => {
              const isExpanded = selectedJournalId === post.id;
              return (
                <div
                  key={post.id}
                  className="bg-[#F1EDE6] border-2 border-stone-900 p-6 hover:border-oxide transition-colors flex flex-col justify-between rounded-none shadow-[6px_6px_0px_#1C1D1F]"
                >
                  <div className="space-y-4">
                    {/* Badge alert and dispatch timestamp */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className={`text-[10px] font-sans font-bold py-1 px-3 uppercase border leading-none tracking-wider block border-stone-900 ${getCategoryStyle(post.warning)}`}>
                        {post.warning}
                      </span>
                      <span className="text-[10px] text-stone-600 font-bold font-mono tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-oxide" />
                        {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Metadata Header */}
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-stone-650 mb-1">
                        <MapPin size={12} className="text-oxide" />
                        <span>{post.territory.toUpperCase()}</span>
                      </div>
                      <h4 className="text-lg font-bold font-display text-stone-900 uppercase hover:text-oxide transition-colors">
                        {post.title}
                      </h4>
                    </div>

                    {/* Report Text Excerpt or body */}
                    <p className="font-sans text-xs text-stone-800 font-medium leading-relaxed text-left whitespace-pre-wrap border-l-3 border-oxide pl-3">
                      {isExpanded ? post.bodyText : post.excerpt}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-6 pt-4 border-t-2 border-stone-300 flex justify-between items-center font-sans text-xs font-bold">
                    <span className="text-stone-500 text-[10px] font-bold">GUIDE REF #{post.id.slice(0, 8).toUpperCase()}</span>
                    
                    <button
                      onClick={() => setSelectedJournalId(isExpanded ? null : post.id)}
                      className="text-stone-900 hover:text-oxide font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye size={14} />
                      {isExpanded ? 'Collapse' : 'Read Full Guide'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
