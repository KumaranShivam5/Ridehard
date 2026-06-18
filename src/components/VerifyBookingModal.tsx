import React, { useState } from 'react';
import { Search, X, CheckCircle2, FileText, AlertOctagon } from 'lucide-react';
import { Booking } from '../types.ts';

interface VerifyBookingModalProps {
  onClose: () => void;
  bookings: Booking[];
}

export default function VerifyBookingModal({ onClose, bookings }: VerifyBookingModalProps) {
  const [bookingId, setBookingId] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [errorText, setErrorText] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    setErrorText('');

    const trimmed = bookingId.trim().toUpperCase();
    if (!trimmed) {
      setErrorText('Please enter your Booking ID, Email, or Phone Number.');
      return;
    }

    const found = bookings.find(b => {
      const isIdMatch = b.id.toUpperCase() === trimmed;
      const isEmailMatch = b.customerEmail.toUpperCase() === trimmed;
      
      const searchDigits = trimmed.replace(/\D/g, '');
      const phoneDigits = b.customerPhone.replace(/\D/g, '');
      const isPhoneMatch = searchDigits.length >= 8 && phoneDigits.includes(searchDigits);

      return isIdMatch || isEmailMatch || isPhoneMatch;
    });

    if (found) {
      setSearchedBooking(found);
    } else {
      setSearchedBooking(null);
      setErrorText('We could not find a booking matching this code. Please check for typos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white text-stone-900 border-4 border-stone-950 w-full max-w-lg rounded-none shadow-[8px_8px_0px_#1B3C1F] overflow-hidden font-sans relative">
        <div className="bg-stone-950 text-stone-100 p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Search className="text-oxide shrink-0" size={18} />
            <span className="font-bold text-xs tracking-wider uppercase text-stone-200">
              Check Trip Status
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 pb-8 bg-[#F1EDE6]">
          {/* Explanation Banner */}
          <div className="bg-stone-900 border-2 border-stone-950 p-4 mb-6 shadow-[2px_2px_0px_#1C1D1F]">
            <p className="text-[11px] text-stone-300 font-medium leading-relaxed">
              <strong className="text-white">Note regarding Emails/SMS:</strong> The platform demo does not actively dispatch live SMS or Email confirmations via third-party webhooks (e.g. Twilio / SendGrid) to prevent spam. You can verify your live booking record via the confirmation code provided during checkout.
            </p>
          </div>

          {!searchedBooking ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex flex-col text-xs gap-1.5">
                <label className="font-bold uppercase text-stone-700 tracking-wide">Enter Booking ID, Email, or Phone</label>
                <input
                  type="text"
                  placeholder="e.g. BK-774021 or +91 98765 43210"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="bg-white border-2 border-stone-300 p-3 rounded-none outline-none focus:border-stone-900 focus:bg-stone-50 text-stone-900 font-bold uppercase min-h-[44px]"
                />
              </div>

              {errorText && (
                <div className="bg-red-50 border-2 border-red-900 text-red-700 p-3 text-xs flex items-start gap-2.5 font-bold shadow-[2px_2px_0px_#7f1d1d]">
                  <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                 <button
                   type="submit"
                   className="bg-stone-950 hover:bg-oxide text-white p-3.5 px-6 font-bold uppercase text-xs tracking-wider border-2 border-stone-950 shadow-[4px_4px_0px_#1B3C1F] transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                 >
                   <Search size={14} /> Look Up Record
                 </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-none w-14 h-14 mb-4 border-2 border-stone-900 shadow-[2px_2px_0px_#1C1D1F]">
                <FileText size={24} />
              </div>
              <h3 className="text-xl text-center font-bold font-display uppercase tracking-tight text-stone-900 mb-2">
                Booking Found
              </h3>
              
              <div className="border-2 border-stone-900 p-5 bg-white text-left text-xs space-y-3 shadow-[4px_4px_0px_#1C1D1F]">
                <p>👤 <strong className="text-stone-700">Rider:</strong> {searchedBooking.customerName}</p>
                <p>🏍️ <strong className="text-stone-700">Machine:</strong> {searchedBooking.vehicleName}</p>
                <p>📅 <strong className="text-stone-700">Dates:</strong> {searchedBooking.startDate} to {searchedBooking.endDate}</p>
                <p>💳 <strong className="text-stone-700">Advance Paid:</strong> ₹{(searchedBooking.advancePaid || 0).toLocaleString('en-IN')}</p>
                <p>💰 <strong className="text-stone-700">Balance Pending:</strong> ₹{(searchedBooking.balancePending || 0).toLocaleString('en-IN')}</p>
                <p className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-200">
                  <strong className="text-stone-700">Status:</strong> 
                  <span className={`border px-2 py-0.5 font-bold uppercase text-[10px] ${
                    searchedBooking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-900' : 'bg-amber-100 text-amber-800 border-amber-900'
                  }`}>
                    {searchedBooking.status}
                  </span>
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                 <button
                   onClick={() => setSearchedBooking(null)}
                   className="bg-stone-200 hover:bg-stone-300 text-stone-800 p-2.5 px-4 font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer border-2 border-transparent"
                 >
                   New Search
                 </button>
                 <button
                   onClick={onClose}
                   className="bg-stone-950 hover:bg-oxide text-white p-2.5 px-6 font-bold uppercase text-[11px] tracking-wider border-2 border-stone-950 shadow-[4px_4px_0px_#1B3C1F] transition-colors cursor-pointer min-h-[44px]"
                 >
                   Close
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
