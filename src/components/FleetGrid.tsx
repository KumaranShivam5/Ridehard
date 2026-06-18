import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Info, Gauge, AlertTriangle, CalendarRange, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '../types.ts';
import { getVehicleFallbackImage } from '../lib/imageFallbacks.ts';

interface FleetGridProps {
  vehicles: Vehicle[];
  onBookVehicle: (vehicle: Vehicle) => void;
  startDate?: string;
  endDate?: string;
  filterActive?: boolean;
  onClearFilter?: () => void;
}

export default function FleetGrid({ 
  vehicles, 
  onBookVehicle,
  startDate,
  endDate,
  filterActive,
  onClearFilter
}: FleetGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDetailBike, setSelectedDetailBike] = useState<Vehicle | null>(null);

  // Reset local category when date filters clear
  useEffect(() => {
    if (!filterActive) {
       setActiveCategory('All');
    }
  }, [filterActive]);

  const categories = ['All', 'Adventure', 'Off-road', 'Commuter'];

  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'All') return vehicles;
    
    return vehicles.filter(v => {
      const model = v.modelName?.toLowerCase() || '';
      if (activeCategory === 'Adventure') return model.includes('himalayan');
      if (activeCategory === 'Off-road') return model.includes('scram');
      if (activeCategory === 'Commuter') return model.includes('interceptor');
      return true;
    });
  }, [vehicles, activeCategory]);

  return (
    <section className="w-full bg-stone-900 text-stone-100 py-20 px-4 md:px-8 border-b border-stone-805" id="fleet-grid">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Design with cozy layout */}
        <div className="mb-12 border-b border-stone-700 pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#E2DFD9] uppercase bg-oxide/10 border border-oxide/40 px-3 py-1 rounded-none inline-block">
              🌲 ACTIVE ALL-TERRAIN EXPEDITION RIGS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight text-white uppercase">
              THE MOUNTAIN TOUR FLEET
            </h2>
          </div>
          
          <div className="flex items-center gap-3 font-sans text-xs text-stone-300 bg-stone-950 p-4 rounded-none border-2 border-stone-800">
            <ShieldCheck size={18} className="text-oxide shrink-0" />
            <span>All machinery includes custom tall-suspension tuning, dual-sport terrains, full-peripheral perimeter guards, and luggage mounts.</span>
          </div>
        </div>

        {/* Date Filter Status Ribbon */}
        {filterActive && startDate && endDate && (
          <div className="mb-6 p-4 bg-oxide/10 border-2 border-oxide/40 rounded-none flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans text-white shadow-[4px_4px_0px_#1B3C1F]">
            <div className="flex items-center gap-2.5">
              <CalendarRange size={16} className="text-oxide" />
              <p className="font-medium">
                Showing <strong className="text-oxide-light uppercase text-sm font-bold">{vehicles.length} ready rigs</strong> during the tour schedule window from <strong className="underline">{startDate}</strong> to <strong className="underline">{endDate}</strong>.
              </p>
            </div>
            <button
              onClick={onClearFilter}
              className="text-white hover:text-oxide font-bold text-xs uppercase flex items-center gap-1.5 px-3 py-1.5 bg-stone-850 hover:bg-white hover:text-stone-950 transition-colors rounded-none cursor-pointer border-2 border-stone-700 min-h-[44px] min-h-[44px]"
            >
              <X size={14} /> Reset Schedule Dates
            </button>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 font-bold text-xs uppercase tracking-wider border-2 transition-all cursor-pointer rounded-none ${
                activeCategory === cat
                  ? 'bg-oxide border-oxide text-stone-100 shadow-[4px_4px_0px_#1C1D1F]'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State when no vehicles match filtered window */}
        {filteredByCategory.length === 0 ? (
          <div className="bg-stone-950 border-2 border-stone-800 rounded-none p-6 md:p-12 text-center max-w-xl mx-auto font-sans">
            <AlertTriangle size={36} className="text-oxide mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white uppercase mb-2">Inventory All Locked or None matched</h4>
            <p className="text-xs text-stone-400 mb-6">
              There are no available active machines matching these filters. Try modifying your timeline or category.
            </p>
            <button
              onClick={() => {
                if (filterActive && onClearFilter) onClearFilter();
                setActiveCategory('All');
              }}
              className="bg-oxide hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-none transition-colors border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] cursor-pointer"
            >
              Show All Rigs
            </button>
          </div>
        ) : (
          /* Inventory Layout Grid with soft beautiful modern shadows */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredByCategory.map((bike, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={bike.id}
                  className="bg-stone-950 border-2 border-stone-850 rounded-none overflow-hidden flex flex-col justify-between hover:border-stone-700 transition-colors group shadow-[6px_6px_0px_#1C1D1F]"
                >
                  {/* Product Visual wrapper */}
                  <div className="relative h-60 border-b border-stone-805 bg-stone-950">
                    <img
                      src={bike.imageUrl || getVehicleFallbackImage(bike.modelName, bike.name)}
                      alt={`${bike.name} (${bike.modelName}) - Premium Adventure Motorcycle Rental in Guwahati, Northeast India`}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300 filter grayscale-[25%] group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Status Stickers */}
                    <span className="absolute top-3 left-3 bg-stone-950 text-stone-100 text-[10px] font-bold tracking-wider font-sans py-1 px-3 rounded-none border border-oxide max-w-[190px] truncate uppercase">
                      {bike.modelName}
                    </span>

                    <span className="absolute bottom-3 right-3 bg-stone-900/90 text-stone-300 text-[9px] font-mono tracking-widest py-1 px-2 rounded-none border border-stone-700/50">
                      ID: {bike.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Technical Specifications Block */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-sans tracking-tight text-white uppercase mb-4">
                        {bike.name}
                      </h3>
                      
                      {/* Specifications list */}
                      <div className="border border-stone-800 p-4 bg-stone-900/50 rounded-none font-sans text-xs space-y-2.5 mb-5 font-medium">
                        <div className="flex justify-between border-b border-stone-800 pb-2">
                          <span className="text-stone-400 font-bold">Ground Clearance:</span>
                          <span className="font-bold text-white">{bike.groundClearance} mm</span>
                        </div>
                        
                        <div className="flex flex-col border-b border-stone-800 pb-2 text-left">
                          <span className="text-stone-400 font-bold">Engine/Torque Tuning:</span>
                          <span className="font-bold text-oxide mt-0.5">{bike.torqueRating}</span>
                        </div>

                        <div className="flex flex-col text-left">
                          <span className="text-stone-400 font-bold">Guard Rigging:</span>
                          <span className="text-stone-300 mt-0.5 leading-tight font-semibold">{bike.crashGuardSetup}</span>
                        </div>
                      </div>
                    </div>

                    {/* Calendar details if blocked dates exist */}
                    {bike.blockedDates.length > 0 && (
                      <div className="text-[10px] font-sans bg-stone-900/80 border border-stone-800 text-stone-400 p-3 rounded-none mb-4 flex items-start gap-2.5">
                        <CalendarRange size={14} className="shrink-0 text-oxide mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-200 block uppercase tracking-wider">Booked Timelines:</span>
                          <p className="mt-0.5 leading-normal">
                            Unavailable on: {bike.blockedDates.slice(0, 4).join(', ')} 
                            {bike.blockedDates.length > 4 ? ` (+${bike.blockedDates.length - 4} more)` : ''}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking actions footer */}
                  <div className="p-6 pt-0 border-t border-stone-850/40 bg-stone-900/20 flex flex-wrap items-center justify-between gap-4 font-sans justify-items-stretch">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase block tracking-wider font-bold text-left">Standard Base Rate</span>
                      <span className="text-xl font-bold text-oxide leading-none mt-1 inline-block">
                        ₹{bike.dailyRate.toLocaleString('en-IN')}<span className="text-xs text-stone-400 font-medium">/day</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDetailBike(bike)}
                        className="bg-stone-800 text-stone-100 hover:bg-stone-700 border-2 border-stone-700 hover:border-stone-600 transition-all font-bold text-xs uppercase px-3 py-2.5 rounded-none cursor-pointer flex items-center gap-1 min-h-[44px]"
                      >
                        <Info size={14} />
                        Details
                      </button>
                      <button
                        onClick={() => onBookVehicle(bike)}
                        className="bg-oxide text-white hover:bg-stone-100 hover:text-stone-900 border-2 border-stone-900 shadow-[3px_3px_0px_#1C1D1F] transition-all font-bold text-xs uppercase px-4 py-2.5 rounded-none cursor-pointer min-h-[44px]"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bike Details Popup/Modal */}
      {selectedDetailBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all" id="bike-detail-popup">
          <div className="bg-[#F1EDE6] text-[#1C1D1F] border-4 border-stone-950 shadow-[8px_8px_0px_#1C1D1F] w-full max-w-2xl overflow-hidden rounded-none flex flex-col font-sans">
            
            {/* Header Block with exact title and close button */}
            <div className="bg-stone-900 text-stone-100 p-5 flex justify-between items-center border-b-2 border-stone-950">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-oxide" />
                <h3 className="font-display font-bold uppercase text-lg tracking-wider text-white">
                  Mechanical Profile Report
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailBike(null)}
                className="text-stone-400 hover:text-oxide p-2 rounded-none transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable specs sheet content */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Image Section */}
                <div className="border-2 border-stone-950 bg-stone-900 aspect-video md:aspect-square overflow-hidden relative shadow-[4px_4px_0px_#1C1D1F]">
                  <img
                    src={selectedDetailBike.imageUrl || getVehicleFallbackImage(selectedDetailBike.modelName, selectedDetailBike.name)}
                    alt={`${selectedDetailBike.name} - ${selectedDetailBike.modelName} Touring Rig specifications and details`}
                    loading="lazy"
                    className="w-full h-full object-cover filter brightness-95"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3 bg-oxide text-white font-mono text-[9px] uppercase px-2 py-0.5 font-bold">
                    Rig ID: {selectedDetailBike.id.toUpperCase()}
                  </div>
                </div>

                {/* Specs summary list */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-stone-500 uppercase">
                      Fleet Classification
                    </span>
                    <h4 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-stone-900 uppercase">
                      {selectedDetailBike.name}
                    </h4>
                    <p className="text-xs text-oxide font-bold uppercase mt-1">
                      Category model: {selectedDetailBike.modelName}
                    </p>
                  </div>

                  <div className="border border-stone-300 p-4 bg-white/70 space-y-3 font-sans text-xs">
                    <div className="flex justify-between border-b border-stone-200 pb-2 font-medium">
                      <span className="text-stone-550 font-bold">Ground Clearance</span>
                      <strong className="text-stone-900 font-bold">{selectedDetailBike.groundClearance} mm</strong>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2 font-medium">
                      <span className="text-stone-550 font-bold">Base Rate</span>
                      <strong className="text-oxide font-bold text-sm">₹{selectedDetailBike.dailyRate.toLocaleString('en-IN')} / day</strong>
                    </div>
                    <div className="flex flex-col border-b border-stone-200 pb-2 text-left">
                      <span className="text-stone-550 font-bold">Torque & Engine Tuning</span>
                      <strong className="text-stone-900 font-semibold mt-0.5 leading-snug">{selectedDetailBike.torqueRating}</strong>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-stone-550 font-bold">Perimeter Guards Setup</span>
                      <span className="text-stone-800 leading-normal font-semibold mt-0.5">{selectedDetailBike.crashGuardSetup}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Advanced Technical details list to prevent empty/underwhelming details popup */}
              <div className="border-t-2 border-stone-400/40 pt-4 space-y-4 font-sans text-left">
                <h5 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
                  🛡️ Tactical Equipment Summary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-normal">
                  <div className="bg-white/60 p-3 border-l-2 border-oxide font-medium text-stone-750">
                    <strong className="text-stone-900 font-bold block mb-1">Dual-Sport Tires</strong>
                    Optimized for deep mud river crossing, high-friction loose mud gravel, and slippery wet mountain slates.
                  </div>
                  <div className="bg-white/60 p-3 border-l-2 border-oxide font-medium text-stone-750">
                    <strong className="text-stone-900 font-bold block mb-1">Adventure Saddle Bags</strong>
                    Full waterproof high-durability rear luggage saddle bag carriers pre-fitted for high-altitude survival.
                  </div>
                  <div className="bg-white/60 p-3 border-l-2 border-oxide font-medium text-stone-750">
                    <strong className="text-stone-900 font-bold block mb-1">Long-Stroke Suspension</strong>
                    Specifically pre-tuned for Guwahati - Cherrapunji route terrain & heavy utility carrying capacities.
                  </div>
                  <div className="bg-white/60 p-3 border-l-2 border-oxide font-medium text-stone-750">
                    <strong className="text-stone-900 font-bold block mb-1">Tactical Security Sump</strong>
                    Custom protective aluminum shield lining the crankcase to protect from flying sharp stones and debris.
                  </div>
                </div>
              </div>

              {/* Status block and warning checks */}
              <div className="bg-stone-900/10 border-2 border-stone-900 p-4 text-xs font-medium text-stone-775 flex items-start gap-2.5">
                <Gauge size={16} className="text-stone-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-bold mb-0.5 uppercase tracking-wide">Ready for Active Deployment</strong>
                  This motorcycle has passed our 48-point mechanical inspection block and is pre-certified for Himalayan passes up to 13,700 ft. Included with full toolkits, high-altitude spare tubes, and tire iron mounts.
                </div>
              </div>

            </div>

            {/* Close / Action footer button */}
            <div className="p-4 bg-stone-150 border-t-2 border-stone-300 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDetailBike(null)}
                className="bg-stone-800 text-stone-100 hover:bg-stone-900 transition-colors font-bold text-xs uppercase px-5 py-3 rounded-none border-2 border-stone-800 cursor-pointer min-h-[44px]"
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  onBookVehicle(selectedDetailBike);
                  setSelectedDetailBike(null);
                }}
                className="bg-oxide text-white hover:bg-stone-100 hover:text-stone-900 border-2 border-stone-900 shadow-[3px_3px_0px_#1C1D1F] transition-all font-bold text-xs uppercase px-5 py-3 rounded-none cursor-pointer min-h-[44px]"
              >
                Book This Rig
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
