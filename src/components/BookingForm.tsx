import React, { useState, useEffect } from 'react';
import { X, Calendar, Flame, AlertOctagon, HelpCircle, CheckCircle2, QrCode, ArrowRight, ArrowLeft } from 'lucide-react';
import { Vehicle, Booking } from '../types.ts';

interface BookingFormProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSubmitBooking: (bookingData: Partial<Booking>) => Promise<Booking | null>;
}

export default function BookingForm({ vehicle, onClose, onSubmitBooking }: BookingFormProps) {
  if (!vehicle) return null;

  const [step, setStep] = useState<1 | 2>(1);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentTxn, setPaymentTxn] = useState('');
  
  const [totalDays, setTotalDays] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [dateConflict, setDateConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const SECURITY_DEPOSIT_FLAT = 5000;
  const advanceToPay = Math.round(totalCost * 0.1); // 10%
  const pendingAmount = totalCost - advanceToPay;

  // Calculate inclusive dates
  const getDatesInRange = (startStr: string, endStr: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
    
    const temp = new Date(start);
    while (temp <= end) {
      dates.push(temp.toISOString().split('T')[0]);
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  };

  // Re-calculate pricing and date overlaps
  useEffect(() => {
    if (!startDate || !endDate) {
      setTotalDays(0);
      setTotalCost(0);
      setDateConflict(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setTotalDays(0);
      setTotalCost(0);
      setDateConflict(false);
      return;
    }

    // Days computation
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive checkout days
    setTotalDays(days);
    setTotalCost(days * vehicle.dailyRate);

    // Conflict detection
    const requested = getDatesInRange(startDate, endDate);
    const isConflict = requested.some(date => vehicle.blockedDates.includes(date));
    setDateConflict(isConflict);
    
    if (isConflict) {
      setErrorMessage('Notice: This motorcycle is already reserved on one or more of your selected dates.');
    } else {
      setErrorMessage('');
    }
  }, [startDate, endDate, vehicle]);

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerPhone || !startDate || !endDate) {
      setErrorMessage('Please fill out Name, Phone, and choose dates.');
      return;
    }
    if (dateConflict) {
      setErrorMessage('Dates unavailable. Try different timeline.');
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!paymentTxn) {
      setErrorMessage('Please enter the payment reference to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmitBooking({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone,
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.name} (${vehicle.modelName})`,
        startDate,
        endDate,
        totalCost,
        advancePaid: advanceToPay,
        balancePending: pendingAmount,
        securityDeposit: SECURITY_DEPOSIT_FLAT,
        paymentTxn,
        status: 'Pending Verification'
      });

      if (result) {
        setSuccessBooking(result);
      } else {
        setErrorMessage('Booking process failed: System unable to record booking.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="booking-modal">
      
      {/* Container Card */}
      <div className="bg-white text-stone-900 border-4 border-stone-950 w-full max-w-xl rounded-none shadow-[8px_8px_0px_#1C1D1F] overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="bg-stone-950 text-stone-100 p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="text-oxide-dark shrink-0" size={18} />
            <span className="font-bold text-xs tracking-wider uppercase text-stone-200">
              Expedition Booking Request
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Manifest View */}
        {successBooking ? (
          <div className="p-4 md:p-8 text-center bg-[#F1EDE6]">
            <div className="mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-none w-14 h-14 mb-5 border-2 border-stone-900 shadow-[4px_4px_0px_#1C1D1F]">
              <CheckCircle2 size={30} />
            </div>
            
            <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-stone-900 mb-2">
              RESERVATION RECEIVED!
            </h3>
            <span className="text-xs text-stone-500 block mb-6">
              Confirmation Code: <strong className="text-white bg-oxide px-2.5 py-1 text-[11px] font-mono font-bold ml-1">{successBooking.id.toUpperCase()}</strong>
            </span>

            <div className="border-2 border-stone-900 p-5 bg-white text-left text-xs space-y-3 max-w-md mx-auto mb-6 shadow-[4px_4px_0px_#1C1D1F]">
              <p>👤 <strong className="text-stone-700">Traveler Name:</strong> {successBooking.customerName}</p>
              <p>🏍️ <strong className="text-stone-700">Rented Machine:</strong> {successBooking.vehicleName}</p>
              <p>📅 <strong className="text-stone-700">Tour Timing:</strong> {successBooking.startDate} to {successBooking.endDate} ({totalDays} Days)</p>
              <p>💳 <strong className="text-stone-700">Advance Paid:</strong> ₹{successBooking.advancePaid.toLocaleString('en-IN')}</p>
              <p>💰 <strong className="text-stone-700">Balance Pending:</strong> ₹{successBooking.balancePending.toLocaleString('en-IN')}</p>
              <p>💼 <strong className="text-stone-700">Status:</strong> <span className="bg-emerald-100 border border-emerald-900 text-emerald-800 font-bold py-0.5 px-2 text-[10px] uppercase ml-1">{successBooking.status}</span></p>
            </div>

            <p className="text-[11px] font-bold text-stone-500 leading-relaxed max-w-sm mx-auto uppercase tracking-wide">
              Your deposit payment reference {successBooking.paymentTxn} is confirmed. 
            </p>

            <div className="bg-stone-900 border-2 border-stone-950 p-4 mb-6 shadow-[2px_2px_0px_#1C1D1F] mt-4 max-w-md mx-auto">
              <p className="text-[10px] text-stone-300 font-medium leading-relaxed">
                <strong className="text-white uppercase font-bold tracking-wider mb-1 block">Email & SMS Disclaimer:</strong> This application relies on real-world third-party services (like SendGrid/Twilio) for live dispatch. In this demo, active outbound messages are muted. Track your trip instantly anytime using the <strong className="text-white">Verify Booking</strong> utility in the top menu.
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-stone-900 text-white hover:bg-oxide transition-colors font-bold uppercase py-3 px-4 md:px-8 cursor-pointer text-xs border-2 border-stone-900 shadow-[4px_4px_0px_#1C1D1F] min-h-[44px]"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="p-6 pb-8 bg-[#F1EDE6]">
            {/* Top Bike specifications summary */}
            <div className="bg-white p-4 border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <span className="text-[10px] text-stone-500 tracking-wider block uppercase font-bold">Selected Adventure Ride</span>
                <span className="text-lg font-bold font-display text-stone-900 uppercase leading-tight block">{vehicle.name}</span>
                <span className="text-xs tracking-tight text-oxide-dark font-bold uppercase">{vehicle.modelName} (₹{vehicle.dailyRate.toLocaleString('en-IN')}/day)</span>
              </div>
            </div>

            {/* Error notifications */}
            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-900 text-red-700 p-3 mb-4 text-xs flex items-start gap-2.5 font-bold shadow-[2px_2px_0px_#7f1d1d]">
                <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNextToPayment} className="space-y-6">
                <div className="bg-white border-2 border-stone-950 p-5 shadow-[4px_4px_0px_#1C1D1F]">
                  <h4 className="text-[11px] font-bold tracking-wider text-oxide-dark border-b-2 border-stone-900 pb-2 mb-4 uppercase">
                    1. Travel Guest Contact Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col text-xs gap-1.5">
                      <label className="font-bold text-stone-700 uppercase tracking-wide">Enter Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Captain Roy"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-stone-50 border-2 border-stone-300 p-2.5 rounded-none outline-none focus:border-stone-900 focus:bg-white text-stone-800 font-bold min-h-[44px]"
                      />
                    </div>

                    <div className="flex flex-col text-xs gap-1.5">
                      <label className="font-bold text-stone-700 uppercase tracking-wide">Contact Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +91 91234 56789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="bg-stone-50 border-2 border-stone-300 p-2.5 rounded-none outline-none focus:border-stone-900 focus:bg-white text-stone-800 font-bold min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col text-xs gap-1.5 mt-4">
                    <label className="font-bold text-stone-700 uppercase tracking-wide">Email Address <span className="text-stone-400 font-medium">(Optional)</span></label>
                    <input
                      type="email"
                      placeholder="e.g., explorer@trail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-stone-50 border-2 border-stone-300 p-2.5 rounded-none outline-none focus:border-stone-900 focus:bg-white text-stone-800 font-bold min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Step 1b: Date Selector */}
                <div className="bg-white border-2 border-stone-950 p-5 shadow-[4px_4px_0px_#1C1D1F]">
                  <h4 className="text-[11px] font-bold tracking-wider text-oxide-dark border-b-2 border-stone-900 pb-2 mb-4 uppercase">
                    2. Select Pick-up & Return Dates
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col text-xs gap-1.5">
                      <label className="font-bold text-stone-700 uppercase tracking-wide">Departure Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-stone-50 border-2 border-stone-300 p-2.5 rounded-none outline-none focus:border-stone-900 focus:bg-white text-stone-800 font-bold min-h-[44px]"
                      />
                    </div>

                    <div className="flex flex-col text-xs gap-1.5">
                      <label className="font-bold text-stone-700 uppercase tracking-wide">Return Date</label>
                      <input
                        type="date"
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-stone-50 border-2 border-stone-300 p-2.5 rounded-none outline-none focus:border-stone-900 focus:bg-white text-stone-800 font-bold min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                   <button
                     type="submit"
                     disabled={dateConflict || !startDate || !endDate}
                     className="bg-stone-950 hover:bg-oxide text-white p-3.5 px-6 font-bold uppercase text-xs tracking-wider border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                   >
                     Continue To Payment <ArrowRight size={14} />
                   </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-white border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F]">
                   <div className="bg-stone-950 text-stone-100 p-4 border-b-2 border-stone-950 flex justify-between items-center">
                     <div>
                       <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Trip Duration Cost</span>
                       <span className="text-sm font-bold uppercase text-white tracking-widest">{totalDays} Rental Days</span>
                     </div>
                     <div className="text-right">
                       <span className="text-xl font-bold font-display uppercase tracking-widest text-[#1B3C1F]">
                         ₹{totalCost.toLocaleString('en-IN')}
                       </span>
                     </div>
                   </div>
                   
                   <div className="p-5 font-mono text-[10px] md:text-xs">
                     <p className="border-b border-stone-200 pb-2 mb-2 flex justify-between">
                       <span>Days Total ({totalDays} Days × ₹{vehicle.dailyRate})</span>
                       <span className="font-bold text-stone-900">₹{totalCost.toLocaleString('en-IN')}</span>
                     </p>
                     <p className="border-b border-stone-200 pb-2 mb-2 flex justify-between">
                       <span>Security Deposit (Refundable)</span>
                       <span className="font-bold text-stone-900">₹{SECURITY_DEPOSIT_FLAT.toLocaleString('en-IN')}</span>
                     </p>
                     
                     <div className="bg-stone-50 border-2 border-oxide/30 p-3 mt-4 flex justify-between items-center text-sm">
                       <span className="uppercase font-bold tracking-tight text-oxide-dark flex flex-col">
                         Booking Advance Required (10%)
                         <span className="text-[9px] text-stone-500 font-sans tracking-normal mt-0.5">Pay this now to lock reservation</span>
                       </span>
                       <span className="font-bold text-xl text-stone-900">₹{advanceToPay.toLocaleString('en-IN')}</span>
                     </div>
                   </div>
                </div>

                <div className="bg-white border-2 border-stone-950 p-5 shadow-[4px_4px_0px_#1C1D1F]">
                  <h4 className="text-[11px] font-bold tracking-wider text-oxide-dark border-b-2 border-stone-900 pb-2 mb-4 uppercase">
                    3. Secure UPI Tour Deposit Payment
                  </h4>
                  
                  <div className="bg-stone-50 border border-stone-200 p-4 flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="bg-white p-2 border-2 border-stone-900 shrink-0 shadow-[2px_2px_0px_#1C1D1F]">
                      <QrCode size={80} className="text-stone-900" />
                    </div>
                    <div className="text-xs space-y-1.5 text-left">
                      <p className="font-bold text-stone-900 uppercase text-[11px] tracking-wide">Direct UPI Merchant Address</p>
                      <p className="text-stone-500 font-medium">Scan QR Code above or send exactly <strong className="text-stone-900">₹{advanceToPay.toLocaleString('en-IN')}</strong> to:</p>
                      <p className="bg-stone-900 text-stone-50 px-3 py-1 font-mono font-bold inline-block border border-stone-900">
                        ridehard@upi
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col text-xs gap-1.5">
                    <label className="font-bold uppercase text-stone-700 tracking-wide">
                      UPI Transaction Ref / UTR ID (12 chars)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UPI883291829"
                      value={paymentTxn}
                      onChange={(e) => setPaymentTxn(e.target.value)}
                      className="bg-stone-50 border-2 border-stone-300 p-2.5 outline-none focus:border-oxide text-xs font-mono font-bold text-stone-800 min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                   <button
                     type="button"
                     onClick={() => setStep(1)}
                     className="bg-transparent hover:bg-stone-200 text-stone-800 p-2.5 px-4 font-bold uppercase text-xs tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                   >
                     <ArrowLeft size={14} /> Back to Details
                   </button>
                   
                   <button
                     type="submit"
                     disabled={isSubmitting || !paymentTxn}
                     className="bg-oxide hover:bg-stone-950 text-white p-3.5 px-6 font-bold uppercase text-xs tracking-wider border-2 border-stone-950 shadow-[4px_4px_0px_#1C1D1F] transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                   >
                     {isSubmitting ? 'Confirming...' : 'Submit Deposit'}
                   </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
