import React from 'react';
import { Itinerary } from '../types.ts';
import { X, Calendar, Sun, Navigation, Map, CloudRain, CheckSquare } from 'lucide-react';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onClose: () => void;
  onBookNow: () => void;
}

export default function ItineraryView({ itinerary, onClose, onBookNow }: ItineraryViewProps) {
  React.useEffect(() => {
    // Scroll to top when mounted
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#E2DFD9] text-[#1C1D1F] font-sans flex flex-col overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="bg-stone-950 text-white p-4 border-b-4 border-oxide flex justify-between items-center shrink-0">
        <h3 className="font-display uppercase tracking-widest text-lg flex items-center gap-2">
          <Map className="text-oxide" /> Route Intelligence
        </h3>
        <button 
          onClick={onClose}
          className="bg-stone-900 border-2 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 p-2 font-bold uppercase text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#1B3C1F] min-h-[44px]"
        >
          <X size={16} /> Close Report
        </button>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar">
        {/* Header Cover */}
        <div className="w-full h-64 md:h-80 relative bg-stone-900 border-b-4 border-stone-950">
          <img 
            src={itinerary.mapImageUrl} 
            alt={`${itinerary.title} - High Altitude Route Map & Overland Scouting Blueprint`} 
            loading="lazy"
            className="w-full h-full object-cover filter contrast-125 opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1 font-mono text-[10px] font-bold uppercase text-oxide-light border border-stone-800">
            AI GENERATED ROUTE MAP
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <span className="bg-oxide text-stone-100 font-bold text-[10px] md:text-xs tracking-wider uppercase py-1 px-3 mb-4 rounded-none border border-oxide">
              {itinerary.days} EXPEDITION
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display text-white uppercase max-w-3xl leading-tight">
              {itinerary.title}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] p-4 flex flex-col">
              <span className="text-oxide-light flex items-center gap-1.5 font-bold uppercase text-[10px] mb-2 font-mono"><Calendar size={14} /> Duration</span>
              <span className="font-bold text-sm">{itinerary.days}</span>
            </div>
            <div className="bg-white border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] p-4 flex flex-col">
              <span className="text-oxide-light flex items-center gap-1.5 font-bold uppercase text-[10px] mb-2 font-mono"><Navigation size={14} /> Ideal Machine</span>
              <span className="font-bold text-sm uppercase">{itinerary.suggestedVehicle}</span>
            </div>
            <div className="bg-white border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] p-4 flex flex-col">
              <span className="text-oxide-light flex items-center gap-1.5 font-bold uppercase text-[10px] mb-2 font-mono"><Sun size={14} /> Best Window</span>
              <span className="font-bold text-sm">{itinerary.bestTimeToVisit}</span>
            </div>
            <div className="bg-white border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] p-4 flex flex-col">
              <span className="text-oxide-light flex items-center gap-1.5 font-bold uppercase text-[10px] mb-2 font-mono"><CloudRain size={14} /> Terrain Weather</span>
              <span className="font-bold text-sm">{itinerary.typicalWeather}</span>
            </div>
          </div>

          <div className="bg-[#F1EDE6] border-4 border-stone-950 p-6 md:p-8 shadow-[8px_8px_0px_#1C1D1F] mb-12">
            <h2 className="text-2xl font-display font-bold uppercase text-stone-900 border-b-2 border-stone-900 pb-3 mb-6">
              Things To Do / Points of Interest
            </h2>
            <ul className="space-y-4">
              {itinerary.thingsToDo.map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="text-oxide mt-0.5"><CheckSquare size={18} /></span>
                  <p className="font-sans font-bold text-stone-800 leading-relaxed text-sm md:text-base">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center pb-24">
            <h3 className="text-xl md:text-2xl font-display font-bold uppercase mb-4 text-stone-900">
              Ready to deploy on this route?
            </h3>
            <button 
              onClick={onBookNow}
              className="bg-oxide text-white font-bold text-sm uppercase px-4 md:px-8 py-4 border-2 border-stone-950 shadow-[6px_6px_0px_#1C1D1F] hover:bg-stone-900 hover:text-white transition-colors cursor-pointer min-h-[44px]"
            >
              Choose Dates & Book Motorcycle
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
