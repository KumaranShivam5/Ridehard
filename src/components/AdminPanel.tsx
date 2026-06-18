import React, { useState } from 'react';
import { Truck, BookOpen, Layers, Terminal, AlertTriangle, BadgeAlert, PlusSquare, Plus, Save, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { Vehicle, Booking, JournalEntry, Itinerary } from '../types.ts';
import ImageUploadZone from './ImageUploadZone.tsx';

interface AdminPanelProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  reports: JournalEntry[];
  itineraries: Itinerary[];
  onAddVehicle: (bikeData: Partial<Vehicle>) => Promise<Vehicle | null>;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<Vehicle | null>;
  onAddReport: (reportData: Partial<JournalEntry>) => Promise<JournalEntry | null>;
  onConfirmBooking: (bookingId: string) => Promise<any>;
  onPopulateDemo?: () => Promise<boolean>;
  onGenerateItinerary: (destination: string, days: number) => Promise<any>;
  onSaveItinerary: (itinerary: Partial<Itinerary>) => Promise<Itinerary | null>;
}

export default function AdminPanel({
  vehicles,
  bookings,
  reports,
  itineraries,
  onAddVehicle,
  onUpdateVehicle,
  onAddReport,
  onConfirmBooking,
  onPopulateDemo,
  onGenerateItinerary,
  onSaveItinerary
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'fleet' | 'reports' | 'ledger' | 'itineraries'>('ledger');
  const [verificationOutput, setVerificationOutput] = useState<string[] | null>(null);

  // Fleet Form state
  const [bikeName, setBikeName] = useState('');
  const [bikeModel, setBikeModel] = useState('Himalayan 450');
  const [bikeGround, setBikeGround] = useState(220);
  const [bikeTorque, setBikeTorque] = useState('40 Nm @ 5500 RPM (Altitude Tuned)');
  const [bikeGuard, setBikeGuard] = useState('Full peripheral crash-cage, aluminum engine skid plate');
  const [bikeRate, setBikeRate] = useState(2500);
  const [bikeImage, setBikeImage] = useState('');
  const [bikeFormMsg, setBikeFormMsg] = useState('');

  // Report Form state
  const [repTitle, setRepTitle] = useState('');
  const [repTerritory, setRepTerritory] = useState('');
  const [repWarning, setRepWarning] = useState('Route Guides');
  const [repExcerpt, setRepExcerpt] = useState('');
  const [repBody, setRepBody] = useState('');
  const [repImage, setRepImage] = useState('');
  const [repFormMsg, setRepFormMsg] = useState('');

  const [loading, setLoading] = useState(false);

  // Generate Itinerary State
  const [destName, setDestName] = useState('');
  const [destDays, setDestDays] = useState(7);
  const [itinMsg, setItinMsg] = useState('');
  const [generatedItin, setGeneratedItin] = useState<Partial<Itinerary> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateItin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName || !destDays) return;
    setIsGenerating(true);
    setItinMsg('AI is charting the route layout... please stand by.');
    setGeneratedItin(null);
    try {
       const res = await onGenerateItinerary(destName, destDays);
       if (res && res.title) {
         setGeneratedItin(res);
         setItinMsg('Topography blueprint successfully generated.');
       } else {
         setItinMsg('AI could not chart the route layout. Ensure the destination is clear.');
       }
    } catch (err: any) {
       setItinMsg(`Error generating itinerary: ${err.message || err}`);
    } finally {
       setIsGenerating(false);
    }
  };

  const handleSaveGeneratedItin = async () => {
    if (!generatedItin) return;
    setLoading(true);
    try {
       const res = await onSaveItinerary(generatedItin);
       if (res) {
         setItinMsg('Saved itinerary to active mission board.');
         setGeneratedItin(null);
         setDestName('');
       }
    } catch (err: any) {
       setItinMsg(`Error saving: ${err.message}`);
    } finally {
       setLoading(false);
    }
  };

  // Submit Fleet addition
  const handleAddBike = async (e: React.FormEvent) => {
    e.preventDefault();
    setBikeFormMsg('');
    if (!bikeName || !bikeRate) {
      setBikeFormMsg('Required: Display Name and Daily Rate are mandatory.');
      return;
    }

    setLoading(true);
    try {
      const res = await onAddVehicle({
        name: bikeName,
        modelName: bikeModel,
        groundClearance: Number(bikeGround),
        torqueRating: bikeTorque,
        crashGuardSetup: bikeGuard,
        dailyRate: Number(bikeRate),
        imageUrl: bikeImage || undefined,
        blockedDates: [],
        status: 'Active'
      });
      if (res) {
        setBikeName('');
        setBikeRate(2500);
        setBikeGround(220);
        setBikeTorque('40 Nm @ 5500 RPM (Altitude Tuned)');
        setBikeGuard('Full peripheral crash-cage, aluminum engine skid plate');
        setBikeImage('');
        setBikeFormMsg('Success: Motorcycle added to the rental registry.');
      }
    } catch (err: any) {
      setBikeFormMsg(`Error adding vehicle: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit Scout Report CMS dispatcher
  const handlePublishReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepFormMsg('');
    if (!repTitle || !repTerritory || !repBody) {
      setRepFormMsg('Required: Title, category tag, and article body are necessary.');
      return;
    }

    setLoading(true);
    try {
      const res = await onAddReport({
        title: repTitle,
        territory: repTerritory,
        warning: repWarning,
        excerpt: repExcerpt || repBody.substring(0, 100) + '...',
        bodyText: repBody,
        imageUrl: repImage || undefined
      });
      if (res) {
        setRepTitle('');
        setRepTerritory('');
        setRepExcerpt('');
        setRepBody('');
        setRepImage('');
        setRepFormMsg('Success: Blog article published successfully.');
      }
    } catch (err: any) {
      setRepFormMsg(`Error publishing report: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger UPI Bank verify
  const handleVerifyPayment = async (bookingId: string) => {
    setLoading(true);
    setVerificationOutput(null);
    try {
      const res = await onConfirmBooking(bookingId);
      if (res && res.success) {
        if (res.booking?.verificationLogs?.sentLogs) {
          setVerificationOutput(res.booking.verificationLogs.sentLogs);
        } else {
          setVerificationOutput([
            `Simulated Email to customer: Confirmed.`,
            `Simulated SMS to customer: Confirmed.`,
            `Simulated Notification to Admin: Confirmed.`
          ]);
        }
      }
    } catch (err: any) {
      alert(`Ledger Verification Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle vehicle maintenance status
  const handleToggleVehicleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Under Maintenance' : 'Active';
    try {
      await onUpdateVehicle(id, { status: newStatus as any });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="w-full bg-stone-900 text-stone-100 py-16 px-4 md:px-8 font-sans border-b-4 border-stone-950 text-left" id="admin-panel">
      <div className="max-w-7xl mx-auto">
        
        {/* Operations Cockpit branding */}
        <div className="border-4 border-stone-950 bg-[#F1EDE6] p-6 rounded-none mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[6px_6px_0px_#1B3C1F] text-stone-900">
          <div className="flex items-center gap-3">
            <div className="bg-stone-950 text-stone-100 font-bold text-lg px-3.5 py-1.5 rounded-none border-2 border-white">
              ADMIN
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-stone-950 uppercase flex items-center gap-2">
                <Terminal size={20} className="text-oxide" />
                Administration Portal
              </h2>
              <span className="text-[10px] text-stone-605 block uppercase font-bold tracking-wider mt-0.5">
                Tour Operator Center & Real-Time Trail Fleet Manager
              </span>
            </div>
          </div>
          
          <div className="text-xs text-stone-605 font-mono font-bold">
            Active Operator: <span className="text-oxide-dark font-bold underline">kumaranshivam57@gmail.com</span>
          </div>
        </div>

        {/* Tab Selection styling with rounded links */}
        <div className="flex border-b-2 border-stone-850 mb-8 font-sans text-xs overflow-x-auto gap-2 pb-0.5">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`cursor-pointer px-5 py-3 font-bold rounded-none border-t-2 border-r-2 border-l-2 transition-all ${
              activeTab === 'ledger'
                ? 'bg-[#F1EDE6] text-stone-900 border-stone-800 font-bold shadow'
                : 'bg-stone-850 text-stone-400 border-transparent hover:text-white hover:bg-stone-800'
            }`}
          >
            1. Rider Bookings & Ledger
          </button>
          
          <button
            onClick={() => setActiveTab('fleet')}
            className={`cursor-pointer px-5 py-3 font-bold rounded-none border-t-2 border-r-2 border-l-2 transition-all ${
              activeTab === 'fleet'
                ? 'bg-[#F1EDE6] text-stone-900 border-stone-800 font-bold shadow'
                : 'bg-stone-850 text-stone-400 border-transparent hover:text-white hover:bg-stone-800'
            }`}
          >
            2. Manage Travel Fleet
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`cursor-pointer px-5 py-3 font-bold rounded-none border-t-2 border-r-2 border-l-2 transition-all ${
              activeTab === 'reports'
                ? 'bg-[#F1EDE6] text-stone-900 border-stone-800 font-bold shadow'
                : 'bg-stone-850 text-stone-400 border-transparent hover:text-white hover:bg-stone-800'
            }`}
          >
            3. Route Journal & Blog Editor
          </button>
          
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`cursor-pointer px-5 py-3 font-bold rounded-none border-t-2 border-r-2 border-l-2 transition-all ${
              activeTab === 'itineraries'
                ? 'bg-[#F1EDE6] text-stone-900 border-stone-800 font-bold shadow'
                : 'bg-stone-850 text-stone-400 border-transparent hover:text-white hover:bg-stone-800'
            }`}
          >
            4. AI Route Architect
          </button>
        </div>

        {/* Display Communications logs receipt */}
        {verificationOutput && (
          <div className="bg-[#F1EDE6] text-stone-900 border-4 border-stone-950 p-6 mb-8 relative font-sans text-xs shadow-[6px_6px_0px_#1B3C1F]">
            <h3 className="text-base font-bold text-oxide-dark uppercase mb-4 flex items-center gap-2">
              <Mail size={18} />
              Booking Approved: Reservation Details Sent
            </h3>
            <button
              onClick={() => setVerificationOutput(null)}
              className="absolute top-4 right-4 text-stone-900 hover:text-white hover:bg-stone-950 font-bold cursor-pointer border-2 border-stone-950 bg-transparent px-2.5 py-1 text-xs rounded-none"
            >
              Close Log Overview
            </button>
            <div className="space-y-2 bg-[#1C1D1F] text-stone-100 p-4 border-2 border-stone-900 rounded-none text-left font-mono text-[11px]">
              {verificationOutput.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-oxide-dark font-bold shrink-0">►</span>
                  <p className="leading-relaxed">{log}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-600 mt-4 font-sans font-bold">
              📅 Availability updated: Timelines locked for customer convenience.
            </p>
          </div>
        )}

        {/* TAB 1: BOOKING MANIFEST LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-[#F1EDE6] text-stone-900 p-4 rounded-none border-2 border-stone-950 font-sans text-xs flex justify-between items-center font-bold">
              <span className="uppercase tracking-wider">Active Travel Reservations Ledger</span>
              <span className="bg-stone-950 text-stone-100 px-3 py-1 text-[11px] font-bold rounded-none border border-stone-850">{bookings.length} Records Counted</span>
            </div>

            {/* Chronological Table List */}
            <div className="bg-stone-950 border-4 border-stone-950 rounded-none overflow-x-auto shadow-[6px_6px_0px_#1C1D1F]">
              <table className="w-full text-left font-sans text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-stone-900 text-stone-300 border-b-2 border-stone-850 uppercase font-bold text-[10px] tracking-wider">
                    <th className="p-4">Reservation ID</th>
                    <th className="p-4">Traveler / Contact</th>
                    <th className="p-4">Bike Requested</th>
                    <th className="p-4">Selected Dates</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">UPI Receipt ID</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-stone-850 text-stone-300">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-900 transition-colors">
                      <td className="p-4 font-mono font-bold text-white uppercase">{booking.id.slice(0, 8)}...</td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{booking.customerName}</div>
                        <div className="text-stone-400 text-[10px] mt-0.5 font-bold">{booking.customerEmail}</div>
                        <div className="text-oxide-light text-[10px] mt-0.5 font-bold">{booking.customerPhone}</div>
                      </td>
                      <td className="p-4 text-stone-200 font-bold uppercase">{booking.vehicleName}</td>
                      <td className="p-4">
                        <span className="text-white font-bold">{booking.startDate}</span>
                        <span className="text-stone-400 mx-1.5 font-bold">to</span>
                        <span className="text-white font-bold">{booking.endDate}</span>
                      </td>
                      <td className="p-4 uppercase min-w-[120px]">
                        <div className="font-bold text-oxide-light text-sm mb-1">₹{booking.totalCost.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-emerald-500 font-bold mb-0.5 whitespace-nowrap">PAID: ₹{(booking.advancePaid || 0).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-amber-500 font-bold whitespace-nowrap">PEND: ₹{(booking.balancePending || 0).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="p-4 font-mono text-stone-400 select-all">{booking.paymentTxn}</td>
                      <td className="p-4 text-center">
                        {booking.status === 'Confirmed' ? (
                          <span className="bg-emerald-950 text-emerald-400 font-bold py-1.5 px-3 rounded-none text-[10px] uppercase border border-emerald-900">
                             Approved & Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyPayment(booking.id)}
                            disabled={loading}
                            className="bg-oxide text-white hover:bg-stone-100 hover:text-stone-900 transition-colors font-bold text-[10px] py-1.5 px-3.5 rounded-none border-2 border-stone-900 shadow-[2px_2px_0px_#1C1D1F] cursor-pointer uppercase shrink-0"
                          >
                            Approve Payment & Lock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 md:p-8 text-center text-stone-400 font-bold uppercase">
                        No active tour or motorcycle reservations at this time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE FLEET CONFIG */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side Form: Add New Bike */}
            <div className="bg-[#F1EDE6] text-stone-900 border-4 border-stone-950 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-xl font-bold font-sans uppercase tracking-tight mb-4 pb-2 border-b-2 border-stone-900 flex items-center gap-1.5 text-stone-900">
                  <PlusSquare size={18} className="text-oxide-dark" />
                  Add New Motorcycle
                </h3>

                {bikeFormMsg && (
                  <div className={`p-3 rounded-none text-xs mb-4 border-2 font-bold ${bikeFormMsg.startsWith('Required') || bikeFormMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-900' : 'bg-emerald-50 text-emerald-700 border-emerald-900'}`}>
                    {bikeFormMsg}
                  </div>
                )}

                <form onSubmit={handleAddBike} className="space-y-4 text-xs font-sans font-bold">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Motorcycle Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Summit Cruiser"
                      value={bikeName}
                      onChange={(e) => setBikeName(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Model Type Class</label>
                    <select
                      value={bikeModel}
                      onChange={(e) => setBikeModel(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    >
                      <option value="Himalayan 450">Royal Enfield Himalayan 450</option>
                      <option value="Scram 411">Royal Enfield Scram 411</option>
                      <option value="Interceptor 650">Royal Enfield Interceptor 650</option>
                      <option value="Hunter 350">Royal Enfield Hunter 350</option>
                      <option value="Honda Activa">Honda Activa Scrabbler</option>
                      <option value="TVS Ntorq">TVS Ntorque Explorer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-bold text-stone-700 uppercase text-[10px] tracking-wider">Ground Clearance (mm)</label>
                      <input
                        type="number"
                        required
                        value={bikeGround}
                        onChange={(e) => setBikeGround(Number(e.target.value))}
                        className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-bold text-stone-700 uppercase text-[10px] tracking-wider">Rental Rate (₹/Day)</label>
                      <input
                        type="number"
                        required
                        value={bikeRate}
                        onChange={(e) => setBikeRate(Number(e.target.value))}
                        className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Engine & Torque Output</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 40 Nm @ 5500 RPM (Altitude Tuned)"
                      value={bikeTorque}
                      onChange={(e) => setBikeTorque(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Fitted Accessories & Protective Guards</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full peripheral guards, aluminum skid panel"
                      value={bikeGuard}
                      onChange={(e) => setBikeGuard(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <ImageUploadZone
                      label="Motorcycle Image Profile"
                      value={bikeImage}
                      onChange={setBikeImage}
                      placeholder="Click to upload or provide URL link"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-950 text-stone-100 hover:bg-oxide hover:text-white border-2 border-stone-950 font-bold uppercase text-xs p-3.5 rounded-none shadow-[4px_4px_0px_#1B3C1F] transition-colors cursor-pointer mt-3 min-h-[44px]"
                  >
                    Save Bike to Fleet Registry
                  </button>
                </form>
              </div>
            </div>

            {/* Right side Table: Existing Fleet list to toggle statuses */}
            <div className="lg:col-span-2 space-y-4 font-sans">
              <div className="bg-[#F1EDE6] text-stone-900 border-2 border-stone-950 p-4 rounded-none text-xs font-bold uppercase tracking-widest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[4px_4px_0px_#1C1D1F]">
                <span>Active Rental Inventory Directory</span>
                {onPopulateDemo && (
                  <button
                    onClick={async () => {
                      setLoading(true);
                      const success = await onPopulateDemo();
                      setLoading(false);
                      if (success) {
                        alert('SUCCESS: Loaded custom Enfield explorer models into fleet.');
                      } else {
                        alert('ERROR: Could not populate demo fleet.');
                      }
                    }}
                    disabled={loading}
                    className="bg-oxide text-white hover:bg-[#1C1D1F] hover:text-white transition-colors border-2 border-stone-950 font-bold text-[10px] py-1.5 px-4 rounded-none shadow-[2px_2px_0px_#1C1D1F] cursor-pointer uppercase shrink-0"
                  >
                    ⚡ Reset Demo Fleet Models
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-stone-950 border-2 border-stone-850 p-5 rounded-none flex flex-col justify-between hover:border-stone-700 transition-colors shadow-[4px_4px_0px_#1C1D1F]">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-mono text-[9px] bg-stone-900 text-stone-300 px-2.5 py-1 rounded-none uppercase border border-stone-800">
                          {v.modelName}
                        </span>
                        <span className={`text-[10px] font-bold ${v.status === 'Active' ? 'text-green-400' : 'text-amber-400'}`}>
                          ● {v.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white uppercase">{v.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-1.5 font-bold">Ground Clearance: <span className="text-stone-200">{v.groundClearance}mm</span> | Base: <span className="text-oxide">₹{v.dailyRate}/day</span></p>
                      <p className="text-[10px] text-stone-400 mt-2.5 truncate italic border-l-2 border-oxide pl-2 font-bold">Setup: {v.crashGuardSetup}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-850/50 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-stone-400 uppercase tracking-wide">RESERVATIONS: {v.blockedDates.length} TIMEFRAMES LOCKS</span>
                      <button
                        onClick={() => handleToggleVehicleStatus(v.id, v.status)}
                        className="bg-stone-900 text-stone-300 hover:bg-oxide hover:text-white border-2 border-stone-800 hover:border-stone-900 py-1 px-3 uppercase font-sans font-bold scale-[0.95] rounded-none shadow-[2px_2px_0px_#121314] cursor-pointer transition-colors"
                      >
                        {v.status === 'Active' ? 'Set Out-of-Service' : 'Set In-Service'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

         {/* TAB 3: ADVENTURE JOURNAL / BLOG EDITOR */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left form CMS dispatcher */}
            <div className="bg-[#F1EDE6] text-stone-900 border-4 border-stone-950 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between h-fit">
              <div>
                <h3 className="text-xl font-bold font-sans uppercase tracking-tight mb-4 pb-2 border-b-2 border-stone-900 flex items-center gap-1.5 text-stone-900">
                  <BookOpen size={18} className="text-oxide-dark" />
                  Write Journal Post
                </h3>

                {repFormMsg && (
                  <div className={`p-3 rounded-none text-xs mb-4 border-2 font-bold ${repFormMsg.startsWith('Required') || repFormMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-900' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {repFormMsg}
                  </div>
                )}

                <form onSubmit={handlePublishReport} className="space-y-4 text-xs font-sans font-bold text-left">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Article Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sela Pass Weather Advice"
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Target Location / Route Circuit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tawang - Bomdila Loop"
                      value={repTerritory}
                      onChange={(e) => setRepTerritory(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Select Post Category</label>
                    <select
                      value={repWarning}
                      onChange={(e) => setRepWarning(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 outline-none rounded-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    >
                      <option value="Route Guides">🟢 Route Guides</option>
                      <option value="Rider Advices">🟡 Rider Advices</option>
                      <option value="Travel Logs">🔵 Travel Logs</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Brief Guide Summary / Excerpt</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief card summary description..."
                      value={repExcerpt}
                      onChange={(e) => setRepExcerpt(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Detailed Journal Content / Body Text</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your adventure story, tips, maintenance guides, or route observations here..."
                      value={repBody}
                      onChange={(e) => setRepBody(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <ImageUploadZone
                      label="Landscape Cover Photo"
                      value={repImage}
                      onChange={setRepImage}
                      placeholder="Upload cover image photo"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-955 text-stone-100 hover:bg-oxide hover:text-white border-2 border-stone-950 font-bold uppercase text-xs p-3.5 rounded-none shadow-[4px_4px_0px_#1B3C1F] transition-colors cursor-pointer mt-3 min-h-[44px]"
                  >
                    Publish Post to Live Journal
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side existing reports ledger */}
            <div className="lg:col-span-2 space-y-4 font-sans">
              <div className="bg-[#F1EDE6] text-stone-900 border-2 border-stone-950 p-4 rounded-none text-xs font-bold uppercase tracking-widest shadow-[4px_4px_0px_#1C1D1F]">
                Live Published Directory Entries
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                {reports.map((r) => (
                  <div key={r.id} className="bg-stone-950 border-2 border-stone-850 p-5 rounded-none flex flex-col hover:border-stone-750 transition-colors text-left relative shadow-[4px_4px_0px_#1C1D1F]">
                    <span className="absolute top-4 right-4 text-stone-500 font-bold font-mono text-[10px]">[ Post Ref: #{r.id.slice(0, 8)} ]</span>
                    <div className="flex gap-2 items-center mb-1.5 font-bold">
                      <span className="text-oxide-light font-bold uppercase shrink-0 text-[10px]">{r.warning.toUpperCase()}</span>
                      <span className="text-stone-705">|</span>
                      <span className="text-stone-300 text-[10px]">{r.territory}</span>
                    </div>
                    <h4 className="text-base font-bold text-white uppercase">{r.title}</h4>
                    <p className="text-stone-300 mt-2 text-xs leading-relaxed italic border-l-2 border-oxide pl-2.5 font-bold">{r.excerpt}</p>
                    <span className="text-[9px] text-stone-500 mt-4 block font-bold uppercase font-mono">Published: {new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ITINERARY ARCHITECT */}
        {activeTab === 'itineraries' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#F1EDE6] text-stone-900 border-4 border-stone-950 p-6 rounded-none shadow-[6px_6px_0px_#1C1D1F]">
              <h3 className="text-xl font-bold font-sans uppercase tracking-tight mb-4 pb-2 border-b-2 border-stone-900 flex items-center gap-1.5 text-stone-900">
                <Terminal size={18} className="text-oxide-dark" />
                AI Route Planner
              </h3>
              
              {itinMsg && (
                <div className={`p-3 rounded-none text-xs mb-4 border-2 font-bold ${itinMsg.includes('Error') ? 'bg-red-50 text-red-700 border-red-900' : 'bg-emerald-50 text-emerald-700 border-emerald-900'}`}>
                  {itinMsg}
                </div>
              )}
              
              <form onSubmit={handleGenerateItin} className="space-y-4 text-xs font-sans font-bold">
                 <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Target Destination / Region</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ziro Valley, Arunachal Pradesh"
                      value={destName}
                      onChange={(e) => setDestName(e.target.value)}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                 </div>
                 
                 <div className="flex flex-col gap-1">
                    <label className="font-bold text-stone-700 uppercase tracking-wider">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={30}
                      value={destDays}
                      onChange={(e) => setDestDays(Number(e.target.value))}
                      className="bg-white border-2 border-stone-900 p-2.5 rounded-none outline-none focus:border-oxide text-stone-900 font-bold min-h-[44px]"
                    />
                 </div>

                 <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-stone-950 text-stone-100 hover:bg-oxide hover:text-white border-2 border-stone-950 font-bold uppercase text-xs p-3.5 rounded-none shadow-[4px_4px_0px_#1B3C1F] transition-colors cursor-pointer mt-3 min-h-[44px]"
                  >
                    {isGenerating ? "Synthesizing Route Architecture..." : "Generate Route via AI Central"}
                  </button>
              </form>
              
              {generatedItin && (
                 <div className="mt-8 border-t-2 border-stone-900 pt-6">
                    <h4 className="font-display uppercase text-lg mb-2">{generatedItin.title}</h4>
                    <ul className="text-xs space-y-1 mb-4 text-stone-700">
                      <li><strong>Duration:</strong> {generatedItin.days}</li>
                      <li><strong>Bike:</strong> {generatedItin.suggestedVehicle}</li>
                      <li><strong>Season:</strong> {generatedItin.bestTimeToVisit}</li>
                    </ul>
                    <img src={generatedItin.mapImageUrl} alt="Generated Map" className="w-full h-40 object-cover border-2 border-stone-900 mb-4" />
                    
                    <button
                      onClick={handleSaveGeneratedItin}
                      disabled={loading}
                      className="w-full bg-oxide text-stone-100 border-2 border-oxide font-bold uppercase text-xs p-3.5 rounded-none shadow-[4px_4px_0px_#1C1D1F] transition-colors cursor-pointer min-h-[44px]"
                    >
                      Commit to Public Registry
                    </button>
                 </div>
              )}
            </div>

            <div className="bg-[#1C1D1F] text-stone-900 border-4 border-stone-950 p-6 rounded-none shadow-[6px_6px_0px_#1B3C1F]">
              <h3 className="text-xl font-bold font-sans uppercase tracking-tight mb-4 pb-2 border-b-2 border-stone-800 flex items-center gap-1.5 text-white">
                <Layers size={18} className="text-oxide-dark" />
                Active Route Blueprints
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                {itineraries.length === 0 && <p className="text-white text-xs">No active itineraries.</p>}
                {itineraries.map((itin) => (
                   <div key={itin.id} className="bg-stone-900 border-2 border-stone-800 p-4 shadow-[4px_4px_0px_#1C1D1F]">
                     <h4 className="font-bold text-white text-sm uppercase mb-1 flex items-center justify-between">
                       {itin.title}
                       <span className="text-oxide-light text-[10px] break-keep whitespace-nowrap">{itin.days}</span>
                     </h4>
                     <p className="text-stone-400 text-xs italic">{itin.suggestedVehicle}</p>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
