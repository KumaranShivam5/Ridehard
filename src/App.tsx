import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Mail, Map, Users, AlertCircle, Terminal, HelpCircle, Triangle, ChevronDown, CheckSquare, Calendar, PhoneCall, ArrowDown } from 'lucide-react';
import { auth, triggerGoogleLogin, isFirebaseReal } from './lib/firebase.ts';
import { Vehicle, Booking, JournalEntry, RiderLog, Itinerary } from './types.ts';
import { HERO_IMAGE } from './constants.ts';

// Dynamic subcomponents imports
import Header from './components/Header.tsx';
import StatsArmor from './components/StatsArmor.tsx';
import FleetGrid from './components/FleetGrid.tsx';
import BookingForm from './components/BookingForm.tsx';
import ReportsJournal from './components/ReportsJournal.tsx';
import InstagramGrid from './components/InstagramGrid.tsx';
import SurvivorLogs from './components/SurvivorLogs.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ItinerariesList from './components/ItinerariesList.tsx';
import ItineraryView from './components/ItineraryView.tsx';
import VerifyBookingModal from './components/VerifyBookingModal.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<JournalEntry[]>([]);
  const [logs, setLogs] = useState<RiderLog[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  // Layout View State
  const [activeView, setView] = useState<'client' | 'admin'>('client');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);

  // Travel Date Filters State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean>(false);
  
  // Hero auto-suggest state
  const [suggestedItin, setSuggestedItin] = useState<Partial<Itinerary> | null>(null);
  const [suggestingItin, setSuggestingItin] = useState(false);

  // Filtered vehicles based on selected dates
  const filteredVehicles = React.useMemo(() => {
    if (!filterActive || !startDate || !endDate) {
      return vehicles;
    }
    
    // Generate ISO formatted dates in search range (inclusive)
    const getDatesInRange = (startStr: string, endStr: string): string[] => {
      const datesList: string[] = [];
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [];
      }
      const current = new Date(start);
      while (current <= end) {
        datesList.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return datesList;
    };

    const requestedDates = getDatesInRange(startDate, endDate);
    if (requestedDates.length === 0) return vehicles;

    // A vehicle is available if NONE of the requested dates are in its blockedDates lists
    return vehicles.filter(vehicle => {
      const blocked = vehicle.blockedDates || [];
      return !requestedDates.some(reqDate => blocked.includes(reqDate));
    });
  }, [vehicles, startDate, endDate, filterActive]);

  // Load initial backend database states
  const reloadData = async () => {
    try {
      const [vRes, bRes, rRes, lRes, iRes] = await Promise.all([
        fetch('/api/vehicles').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/journals').then(r => r.json()),
        fetch('/api/rider_logs').then(r => r.json()),
        fetch('/api/itineraries').then(r => r.json())
      ]);

      setVehicles(vRes);
      setBookings(bRes);
      setReports(rRes);
      setLogs(lRes);
      setItineraries(iRes);
    } catch (err) {
      console.error("[RideHard App] Failure fetching backend manifests:", err);
    }
  };

  useEffect(() => {
    reloadData();

    // Listen to actual Firebase Auth changes if configured
    if (isFirebaseReal && auth) {
      return auth.onAuthStateChanged((user: any) => {
        if (user) {
          setCurrentUser(user);
          // Auto-direct to Admin screen if they are the special bootstrapped admin
          if (user.email === 'kumaranshivam57@gmail.com') {
            setView('admin');
          }
        } else {
          setCurrentUser(null);
          setView('client');
        }
      });
    }
  }, []);

  // Dynamic SEO Metadata management
  useEffect(() => {
    let title = 'RideHard | Motorcycle Rentals & Adventure Tours in Northeast India';
    let description = 'Rent premium Royal Enfield Himalayans & rugged off-road machines. Expert multi-terrain mountain expeditions across Guwahati, Tawang, Meghalaya, and Arunachal Pradesh with RideHard.';
    
    if (activeView === 'admin') {
      title = 'Operation Control Room | RideHard Expeditions';
      description = 'Secure admin log panel, fleet operational status updates, booking locks, and scout report management console.';
    } else if (selectedVehicle) {
      title = `Rent ${selectedVehicle.name} in Guwahati | RideHard Fleet`;
      description = `Book the rugged ${selectedVehicle.name} (${selectedVehicle.modelName}) with custom crash guards, ${selectedVehicle.groundClearance}mm ground clearance, and ${selectedVehicle.torqueRating}. Best for extreme Northeast India routes.`;
    } else if (selectedItinerary) {
      title = `${selectedItinerary.title} - Northeast Overland Expedition | RideHard`;
      description = `Scout report & complete high-altitude road maps for ${selectedItinerary.title} itinerary. Experience ${selectedItinerary.days} of supreme off-road expedition adventures.`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [activeView, selectedVehicle, selectedItinerary]);

  // Secure / Auth flow triggers
  const handleLogin = async () => {
    try {
      const user = await triggerGoogleLogin();
      if (user) {
        setCurrentUser(user);
        // Alert if administrator email detected
        if (user.email === 'kumaranshivam57@gmail.com') {
          setView('admin');
        }
      }
    } catch (err) {
      console.error("Popup authenticated signature failed:", err);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseReal && auth) {
      await auth.signOut();
    }
    setCurrentUser(null);
    setView('client');
  };

  // POST: Create checkout booking
  const handleBookingSubmit = async (bookingData: Partial<Booking>): Promise<Booking | null> => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const newBooking = await res.json();
        reloadData(); // refresh local inventory arrays to log dates
        return newBooking;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // POST: Add new motorcycle to system fleet (Admin)
  const handleAddVehicle = async (bikeData: Partial<Vehicle>): Promise<Vehicle | null> => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bikeData)
      });
      if (res.ok) {
        const added = await res.json();
        reloadData();
        return added;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // PUT: Update motorcycle specifications / statuses (Admin)
  const handleUpdateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        reloadData();
        return updated;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // POST: Publish Adventure Journal entry in CMS (Admin)
  const handleAddReport = async (reportData: Partial<JournalEntry>): Promise<JournalEntry | null> => {
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        const added = await res.json();
        reloadData();
        return added;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // POST: Double Booking Lock & verification dispatches (Admin)
  const handleConfirmBooking = async (bookingId: string): Promise<any> => {
    try {
      const res = await fetch('/api/admin/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (res.ok) {
        const data = await res.json();
        reloadData(); // reload fresh blockedDates and statuses
        return data;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // POST: Add review testimonial (Client)
  const handleAddRiderLog = async (logData: Partial<RiderLog>): Promise<RiderLog | null> => {
    try {
      const res = await fetch('/api/rider_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      if (res.ok) {
        const added = await res.json();
        reloadData();
        return added;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleGenerateItinerary = async (destination: string, days: number): Promise<any> => {
     try {
       const res = await fetch('/api/gemini/generate-itinerary', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ destination, days })
       });
       if (res.ok) {
          return await res.json();
       }
       return null;
     } catch(err) {
       console.error(err);
       return null;
     }
  };

  const handleSaveItinerary = async (itinData: Partial<Itinerary>): Promise<Itinerary | null> => {
     try {
       const res = await fetch('/api/itineraries', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(itinData)
       });
       if (res.ok) {
          const added = await res.json();
          reloadData();
          return added;
       }
       return null;
     } catch(err) {
       console.error(err);
       return null;
     }
  };

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const triggerAutoSuggestRoute = async () => {
    if (!startDate || !endDate) return;
    setSuggestingItin(true);
    setSuggestedItin(null);
    const days = calculateDays(startDate, endDate);
    
    // Quick destination string generic for Northeast
    const dest = "Northeast India (Arunachal/Meghalaya)";
    try {
       const res = await handleGenerateItinerary(dest, days);
       if (res) {
          setSuggestedItin(res);
       }
    } catch (err) {
       console.error(err);
    } finally {
       setSuggestingItin(false);
    }
  };

  // POST: Reset & Seed premium demo fleet with high-quality bikes (Admin/Demo trigger)
  const handlePopulateDemo = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/populate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        await reloadData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#E2DFD9] text-[#1C1D1F] flex flex-col font-sans w-full max-w-[100vw] overflow-x-hidden" id="app-viewport">
      
      {/* Heavy Brutallist Header Nav */}
      <Header
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        activeView={activeView}
        setView={setView}
        onVerifyBooking={() => setIsVerifyOpen(true)}
      />

      {/* Breadcrumb Trail on Small Screens for Quick Navigation */}
      <div className="w-full bg-[#1C1D1F] text-stone-300 font-sans px-4 py-2.5 text-[11px] border-b border-stone-950 flex md:hidden items-center gap-1.5 overflow-x-auto whitespace-nowrap select-none">
        <button 
          onClick={() => {
            setView('client');
            setSelectedVehicle(null);
            setSelectedItinerary(null);
          }}
          className="hover:text-oxide font-bold uppercase transition-colors cursor-pointer"
        >
          RIDEHARD
        </button>
        <span className="text-stone-600 font-bold">/</span>
        
        {activeView === 'admin' ? (
          <span className="text-oxide font-bold uppercase">OPERATION CONTROL</span>
        ) : selectedVehicle ? (
          <>
            <button 
              onClick={() => {
                setSelectedVehicle(null);
                setSelectedItinerary(null);
              }}
              className="hover:text-oxide transition-colors cursor-pointer uppercase font-semibold"
            >
              EXPLORER
            </button>
            <span className="text-stone-600 font-bold">/</span>
            <span className="text-oxide font-bold uppercase truncate max-w-[120px]">{selectedVehicle.name}</span>
          </>
        ) : selectedItinerary ? (
          <>
            <button 
              onClick={() => {
                setSelectedVehicle(null);
                setSelectedItinerary(null);
              }}
              className="hover:text-oxide transition-colors cursor-pointer uppercase font-semibold"
            >
              EXPLORER
            </button>
            <span className="text-stone-600 font-bold">/</span>
            <span className="text-oxide font-bold uppercase truncate max-w-[120px]">{selectedItinerary.title}</span>
          </>
        ) : (
          <span className="text-stone-400 font-bold uppercase">EXPLORER PORTAL</span>
        )}
      </div>

      {/* ADMIN CONTEXT DISPLAY VIEW */}
      {activeView === 'admin' ? (
        <AdminPanel
          vehicles={vehicles}
          bookings={bookings}
          reports={reports}
          itineraries={itineraries}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onAddReport={handleAddReport}
          onConfirmBooking={handleConfirmBooking}
          onPopulateDemo={handlePopulateDemo}
          onGenerateItinerary={handleGenerateItinerary}
          onSaveItinerary={handleSaveItinerary}
        />
      ) : (
        /* CLIENT DISPATCHED VIEW */
        <main className="flex-grow">
          
          {/* Elegant Cozy Adventure Tour Operator HERO SECTION */}
          <section className="relative w-full overflow-hidden bg-stone-900 text-[#E2DFD9] border-b-4 border-stone-950 flex flex-col justify-center min-h-[80vh] py-16 animate-none" id="tour-hero-header">
            {/* Massive grayscale river splasher photo */}
            <div className="absolute inset-0 w-full h-full z-0">
              <img
                src={HERO_IMAGE}
                alt="Northeast India Motorcycle Overland Expedition - RideHard Adventure Tour Operator"
                className="w-full h-full object-cover opacity-60 filter brightness-95 object-center"
                referrerPolicy="no-referrer"
              />
              {/* Visual contrast darkening layers */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/40 to-black/30" />
            </div>

            {/* Authentic Human-written copy (Transparent Background) */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-left py-12">
               <div className="space-y-6 max-w-3xl drop-shadow-lg">
                  <span className="bg-oxide text-stone-100 font-bold text-[11px] md:text-xs tracking-wider uppercase py-1.5 px-4 rounded-none inline-block border border-oxide/50">
                    🌲 ALL-TERRAIN HIMALAYAN OFF-ROAD EXPEDITIONS
                  </span>
                  
                  <h1 className="font-bold tracking-wide uppercase text-white font-display leading-none" style={{ fontSize: 'clamp(44px, 8vw, 84px)' }}>
                    DISCOVER THE <br />
                    <span className="text-oxide">NORTHEAST</span>
                  </h1>

                  <p className="text-sm md:text-base text-stone-200 leading-relaxed font-sans font-medium drop-shadow-md max-w-2xl">
                    RideHard is your premier heavy-duty, off-road adventure tour operator in Northeast India. We provide rugged Royal Enfield and specialized all-terrain machines optimized for extreme routes, high-altitude mountain passes, and raw off-grid touring.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('plan-touring-window');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-oxide text-white hover:bg-white hover:text-stone-900 transition-colors py-3.5 px-8 rounded-none font-bold text-xs uppercase tracking-wider cursor-pointer border-2 border-transparent hover:border-stone-950 shadow-[4px_4px_0px_#1C1D1F] inline-flex items-center gap-2 min-h-[48px]"
                    >
                      Book a Motorcycle
                    </button>
                  </div>
                </div>
            </div>
            
            {/* Cozy Mountain Weather bulletin */}
            <div className="absolute bottom-0 w-full z-10 bg-stone-950/80 border-t border-stone-850 px-6 py-3 flex flex-wrap justify-between items-center text-[11px] text-stone-400 gap-4 backdrop-blur-md hidden lg:flex">
              <div className="flex items-center gap-1.5 font-sans">
                <Compass size={13} className="text-oxide" />
                <span>ROUTE UPDATE: Guwahati – Shillong – Cherrapunji – Ziro – Sela Pass – Tawang Circuit is active & beautifully clear.</span>
              </div>
              <div className="hidden md:flex items-center gap-4 font-sans text-stone-500">
                <span>Altitude coverage up to 13,700 ft</span>
                <span>Includes helmet, carriers & emergency medical kit</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Live Support Desk Active
                </span>
              </div>
            </div>
          </section>

          {/* Dedicated Full Width Plan Your Touring Window Section */}
          <section id="plan-touring-window" className="w-full bg-[#F1EDE6] text-stone-900 border-b-4 border-stone-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-stone-900 pb-5 mb-8 gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-stone-900 tracking-tight uppercase">
                    Plan Your Touring Window
                  </h3>
                  <p className="text-xs md:text-sm text-stone-605 font-sans font-medium mt-1">
                    Select your travel window to view available adventure-rigged fleet models.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-stone-950 text-[#E2DFD9] px-3.5 py-1.5 border border-stone-900 text-[10px] font-mono uppercase tracking-wider h-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse animate-none" />
                  Operator Connected
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white border-4 border-stone-950 p-6 shadow-[6px_6px_0px_#1C1D1F] space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                        Departure Date
                      </label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-700" />
                        <input
                          type="date"
                          min="2026-05-25"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setFilterActive(true);
                          }}
                          className="w-full bg-white border-2 border-stone-900 text-stone-900 rounded-none pl-10 pr-3 py-3.5 text-xs font-bold focus:ring-0 outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                        Return Date
                      </label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-700" />
                        <input
                          type="date"
                          min={startDate || "2026-05-25"}
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setFilterActive(true);
                          }}
                          className="w-full bg-white border-2 border-stone-900 text-stone-900 rounded-none pl-10 pr-3 py-3.5 text-xs font-bold focus:ring-0 outline-none min-h-[44px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        if (startDate && endDate) {
                          setFilterActive(true);
                          const el = document.getElementById('fleet-grid');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          alert("Please select both Departure and Return dates.");
                        }
                      }}
                      className="flex-1 bg-oxide text-white hover:bg-stone-900 transition-colors py-3.5 px-4 rounded-none font-bold text-xs uppercase tracking-wider cursor-pointer border-2 border-stone-900 shadow-[4px_4px_0px_#1C1D1F] flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      See Available Bikes
                    </button>
                    <button
                      onClick={() => {
                        if (startDate && endDate) {
                          triggerAutoSuggestRoute();
                        } else {
                          alert("Please select dates first to generate an itinerary.");
                        }
                      }}
                      disabled={suggestingItin}
                      className="flex-1 bg-stone-900 text-stone-100 disabled:opacity-75 hover:bg-[#1C1D1F] transition-colors py-3.5 px-4 rounded-none font-bold text-xs uppercase tracking-wider cursor-pointer border-2 border-stone-900 shadow-[4px_4px_0px_#1B3C1F] flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {suggestingItin ? 'AI Thinking...' : 'Suggest Route via AI'}
                    </button>
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setFilterActive(false);
                        const el = document.getElementById('fleet-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 bg-transparent hover:bg-stone-200 text-stone-900 border-2 border-stone-900 py-3.5 px-4 rounded-none font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors min-h-[44px]"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  {suggestedItin ? (
                    <div className="bg-white border-4 border-stone-950 p-6 shadow-[6px_6px_0px_#1C1D1F]">
                      <h4 className="text-oxide font-bold text-xs uppercase tracking-widest mb-3 flex justify-between items-center border-b border-stone-200 pb-2">
                        <span>AI Suggested Mission</span>
                        <button 
                          className="text-stone-500 hover:text-stone-900 cursor-pointer text-[10px] uppercase font-bold min-h-[30px]"
                          onClick={() => setSuggestedItin(null)}
                        >
                          ✕ Clear
                        </button>
                      </h4>
                      <div className="bg-stone-100 p-4 border-l-4 border-stone-900">
                        <p className="font-display uppercase text-sm font-bold mb-1 text-stone-900">{suggestedItin.title}</p>
                        <ul className="text-xs space-y-1 font-bold text-stone-600 block">
                          <li>• Duration: {suggestedItin.days}</li>
                          <li>• Ideal Terrain Vehicle: {suggestedItin.suggestedVehicle}</li>
                        </ul>
                      </div>
                      <button 
                        className="bg-stone-900 text-stone-100 hover:bg-oxide hover:text-white transition-colors border-2 border-stone-950 font-bold uppercase text-xs tracking-wider w-full py-3 mt-4 min-h-[44px] shadow-[2px_2px_0px_#1C1D1F]"
                        onClick={() => {
                          const mockItin: Itinerary = {
                             id: `TEMP-${Date.now()}`,
                             title: suggestedItin.title || 'Custom Adventure',
                             days: suggestedItin.days || '-',
                             thingsToDo: suggestedItin.thingsToDo || [],
                             suggestedVehicle: suggestedItin.suggestedVehicle || 'Himalayan 450',
                             bestTimeToVisit: suggestedItin.bestTimeToVisit || '-',
                             typicalWeather: suggestedItin.typicalWeather || '-',
                             mapImageUrl: suggestedItin.mapImageUrl || HERO_IMAGE,
                             createdAt: new Date().toISOString()
                          };
                          setSelectedItinerary(mockItin);
                        }}
                      >
                        View Full Intelligence Report
                      </button>
                    </div>
                  ) : (
                    <div className="bg-stone-900 text-stone-300 border-4 border-stone-950 p-6 shadow-[6px_6px_0px_#1C1D1F] flex flex-col justify-between h-full min-h-[220px]">
                      <div>
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-2">
                          Interactive Planner
                        </h4>
                        <div className="text-xs space-y-3 font-sans font-medium text-stone-400 leading-relaxed">
                          <p>Ready to push boundaries? Use the live calendar to verify matching mechanical configurations for any scheduled operation.</p>
                          <p>Or use our real-time AI itinerary coordinator above compiled directly for extreme roads.</p>
                        </div>
                      </div>
                      <div className="border-t border-stone-850 pt-3 mt-4 text-[9px] text-stone-400 font-mono uppercase tracking-widest">
                        Ridehard Himalayan Fleet // Guwahati Hub
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <FleetGrid
            vehicles={filteredVehicles}
            onBookVehicle={(bike) => setSelectedVehicle(bike)}
            startDate={startDate}
            endDate={endDate}
            filterActive={filterActive}
            onClearFilter={() => {
              setStartDate('');
              setEndDate('');
              setFilterActive(false);
            }}
          />

          {/* Core modules components integration */}
          <ItinerariesList 
            itineraries={itineraries} 
            onSelectItinerary={(itin) => setSelectedItinerary(itin)} 
          />

          <StatsArmor />

          <ReportsJournal reports={reports} />

          <InstagramGrid />

          <SurvivorLogs
            logs={logs}
            onSubmitLog={handleAddRiderLog}
          />

          {/* Frictionless Guest Booking interface */}
          {selectedVehicle && (
            <BookingForm
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
              onSubmitBooking={handleBookingSubmit}
            />
          )}

          {/* Render selected itinerary overlay */}
          {selectedItinerary && (
            <ItineraryView 
              itinerary={selectedItinerary} 
              onClose={() => setSelectedItinerary(null)} 
              onBookNow={() => {
                setSelectedItinerary(null);
                const el = document.getElementById('tour-hero-header');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

          {isVerifyOpen && (
            <VerifyBookingModal
              bookings={bookings}
              onClose={() => setIsVerifyOpen(false)}
            />
          )}

        </main>
      )}

      {/* Heavy Footer Section */}
      <footer className="bg-[#1C1D1F] text-[#E2DFD9] font-mono text-center border-t-4 border-[#1C1D1F] py-12 px-4 md:px-8 mt-auto text-xs space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-8 text-left">
          <div>
            <h5 className="font-bold text-[#1B3C1F] text-base font-display mb-1 uppercase tracking-tight">RIDEHARD ADVENTURE HQ</h5>
            <p className="text-gray-500 text-[11px] leading-relaxed max-w-sm">
              Established 2026. Custom motorcycle rentals, route planning, and guided adventure tours. Servicing Guwahati logistics, Ziro outpost, Sela Pass, and Tawang travel circuits.
            </p>
          </div>
          <div className="text-left md:text-right font-mono text-[10px] text-gray-400 space-y-1.5">
            <p className="flex items-center gap-1.5 justify-end">
              <span className="bg-[#1B3C1F] text-black font-bold px-1 text-[9px]">TEL</span> +91 990 0011 223 (Guwahati Support Desk)
            </p>
            <p className="flex items-center gap-1.5 justify-end">
              <span className="bg-[#1B3C1F] text-black font-bold px-1 text-[9px]">EMAIL</span> info@ridehard.in
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-[10px] pt-4">
          <p>© 2026 RIDEHARD TOURS & RENTALS. ALL BOOKINGS SUBJECT TO VALID DRIVER LICENSES & LOCAL BORDER PERMITS.</p>
          <p className="text-[#1B3C1F] font-bold">TERRAIN BRUTALISM // 100% CODE-FREE ENGINE ENGAGED</p>
        </div>
      </footer>

    </div>
  );
}
