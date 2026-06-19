import React from 'react';
import { Itinerary } from '../types.ts';
import { Map, Calendar, Sun, Navigation, ArrowRight } from 'lucide-react';
import { SELA_PASS_IMAGE } from '../constants.ts';

interface ItinerariesListProps {
  itineraries: Itinerary[];
  onSelectItinerary: (itin: Itinerary) => void;
}

export default function ItinerariesList({ itineraries, onSelectItinerary }: ItinerariesListProps) {
  // If no itineraries from DB, provide a fallback common itinerary to preserve the section
  const displayItineraries = itineraries.length > 0 ? itineraries : [
    {
      id: 'default-itin-1',
      title: 'Tawang Monastic High-Altitude Circuit',
      days: '7 Days / 6 Nights',
      bestTimeToVisit: 'March to October',
      suggestedVehicle: 'Himalayan 450',
      typicalWeather: 'Chilly winds, possible snow, unpredictable rain.',
      mapImageUrl: SELA_PASS_IMAGE,
      thingsToDo: [
        'Conquer the icy Sela Pass (13,700 ft)',
        'Visit the historic Tawang Monastery',
        'Ride through misty pine-filled valleys in Bomdila'
      ],
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <section className="bg-stone-900 text-stone-100 py-16 px-4 md:px-8 border-b border-stone-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display uppercase tracking-tight text-white mb-2">
              Signature Northeast <span className="text-oxide">Expeditions</span>
            </h2>
            <p className="text-stone-400 font-sans text-sm md:text-base max-w-2xl">
              Curated, battle-tested routes through Arunachal, Meghalaya, and Assam. Select a detailed itinerary to explore day-by-day stops and terrain notes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItineraries.map((itin) => (
            <div 
              key={itin.id}
              className="bg-stone-950 border-2 border-stone-850 p-0 flex flex-col hover:border-oxide/50 transition-colors cursor-pointer group shadow-[4px_4px_0px_#1C1D1F] hover:shadow-[4px_4px_0px_#1B3C1F]"
              onClick={() => onSelectItinerary(itin)}
            >
              <div className="h-48 w-full relative overflow-hidden bg-stone-900 border-b-2 border-stone-850">
                <img 
                  src={itin.mapImageUrl} 
                  alt={`${itin.title} Route Map - Northeast India Motorcycle Overland Expedition`} 
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm border border-stone-700">
                  <Calendar size={12} className="inline mr-1" /> {itin.days}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-display uppercase text-white mb-3 group-hover:text-oxide transition-colors">
                  {itin.title}
                </h3>
                
                <div className="space-y-3 mb-6 mt-auto">
                  <div className="flex items-start gap-2 text-xs font-sans text-stone-400">
                    <Sun size={14} className="text-stone-500 shrink-0 mt-0.5" />
                    <span className="font-bold">Season:</span> {itin.bestTimeToVisit}
                  </div>
                  <div className="flex items-start gap-2 text-xs font-sans text-stone-400">
                    <Navigation size={14} className="text-stone-500 shrink-0 mt-0.5" />
                    <span className="font-bold">Bike:</span> {itin.suggestedVehicle}
                  </div>
                </div>

                <button className="w-full bg-stone-900 border-2 border-stone-800 text-stone-300 font-bold uppercase text-xs py-3 tracking-wider flex items-center justify-center gap-2 group-hover:bg-oxide group-hover:text-white group-hover:border-oxide transition-colors mt-auto rounded-none min-h-[44px]">
                  View Full Itinerary <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
