import React, { useState } from 'react';
import { Star, MessageSquareCode, PlusCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { RiderLog } from '../types.ts';

interface SurvivorLogsProps {
  logs: RiderLog[];
  onSubmitLog: (logData: Partial<RiderLog>) => Promise<RiderLog | null>;
}

export default function SurvivorLogs({ logs, onSubmitLog }: SurvivorLogsProps) {
  const [riderName, setRiderName] = useState('');
  const [route, setRoute] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName || !feedback) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmitLog({ riderName, route, feedback, rating });
      if (result) {
        setRiderName('');
        setRoute('');
        setFeedback('');
        setRating(5);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-stone-900 text-[#E2DFD9] py-20 px-4 md:px-8 border-b border-stone-805" id="rider-logs">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Block */}
        <div className="mb-12 border-b border-stone-700 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-widest text-oxide-light uppercase bg-oxide/10 px-3 py-1 rounded-full">
              🌲 Guest Stories & Adventure Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight text-white uppercase mt-1">
              Rider Testimonials & Logs
            </h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-oxide text-white hover:bg-white hover:text-stone-950 transition-all font-bold text-xs uppercase px-5 py-3 rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            {showForm ? 'Close Review Panel' : 'Write a Guest Review'}
          </button>
        </div>

        {/* Testimonials Submission Form */}
        {showForm && (
          <div className="bg-stone-955 text-stone-100 border border-stone-800 p-6 md:p-8 mb-12 max-w-2xl mx-auto rounded-2xl shadow-xl text-left">
            <h3 className="text-xl font-bold font-sans uppercase tracking-tight mb-6 border-b border-stone-850 pb-3 flex items-center gap-2 text-white">
              <MessageSquareCode size={20} className="text-oxide" />
              Write A Travel Review
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-stone-400 tracking-wider">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    className="bg-stone-900 border border-stone-800 rounded-lg p-3 outline-none focus:border-oxide text-stone-100 font-medium min-h-[44px]"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-stone-400 tracking-wider">Route Completed</label>
                  <input
                    type="text"
                    placeholder="e.g. Sela Pass Loop"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="bg-stone-900 border border-stone-800 rounded-lg p-3 outline-none focus:border-oxide text-stone-100 font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold uppercase text-stone-400 tracking-wider">Select Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-800 rounded-lg p-3 outline-none focus:border-oxide font-bold text-stone-100 px-2.5 min-h-[44px]"
                  >
                    <option value={5} className="bg-stone-955 text-white">⭐⭐⭐⭐⭐ (Excellent Bikes & Guides)</option>
                    <option value={4} className="bg-stone-955 text-white">⭐⭐⭐⭐ (Very Helpful Support Team)</option>
                    <option value={3} className="bg-stone-955 text-white">⭐⭐⭐ (Fair Riding Experience)</option>
                    <option value={2} className="bg-stone-955 text-white">⭐⭐ (Average Maintenance)</option>
                    <option value={1} className="bg-stone-955 text-white">⭐ (Disappointing Setup)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase text-stone-400 tracking-wider">Your Tour Review Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the motorcycle comfort, throttle response, accessories, permit support, and team communication..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-lg p-3 outline-none focus:border-oxide text-stone-100 font-medium min-h-[44px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer transition-colors border border-stone-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-oxide text-white hover:bg-stone-100 hover:text-stone-950 rounded-lg font-bold cursor-pointer uppercase transition-colors shadow-md min-h-[44px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inline success toast */}
        {success && (
          <div className="p-4 bg-emerald-950 text-emerald-300 border border-emerald-800 text-center text-xs font-bold max-w-sm mx-auto mb-12 rounded-xl uppercase animate-bounce flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            🎉 Review submitted successfully. Posted.
          </div>
        )}

        {/* Testimonials grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-stone-955 border border-stone-800 p-6 flex flex-col justify-between hover:border-stone-750 transition-colors rounded-2xl shadow-lg"
            >
              <div>
                {/* Rating display */}
                <div className="flex items-center gap-1.5 mb-4 text-oxide">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < log.rating ? '#1B3C1F' : 'transparent'}
                      className={i < log.rating ? 'opacity-100' : 'opacity-30'}
                    />
                  ))}
                  <span className="text-[10px] text-stone-400 font-mono ml-2 uppercase">
                    Rated {log.rating}/5.0
                  </span>
                </div>

                {/* Feedback description block */}
                <p className="font-sans text-xs text-stone-300 leading-relaxed mb-6 italic border-l border-oxide/40 pl-3">
                  "{log.feedback}"
                </p>
              </div>

              {/* Rider profile footer metadata block */}
              <div className="mt-4 pt-4 border-t border-stone-850/50 flex justify-between items-end font-sans text-xs">
                <div>
                  <span className="text-stone-500 uppercase text-[9px] block leading-none font-semibold">Verified Traveler</span>
                  <span className="font-bold text-white mt-1 inline-block truncate max-w-[200px]">
                    {log.riderName}
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-oxide uppercase font-bold block leading-none flex items-center justify-end gap-0.5">
                    {log.route}
                    <ArrowUpRight size={10} />
                  </span>
                  <span className="text-stone-500 text-[10px] mt-1 inline-block">{log.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
