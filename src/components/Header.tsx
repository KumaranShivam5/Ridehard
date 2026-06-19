import React, { useState } from 'react';
import { ShieldAlert, Compass, UserCheck, Terminal, LogOut, Menu, X } from 'lucide-react';
import { COMPASS_COORDINATES } from '../constants.ts';

interface HeaderProps {
  currentUser: any;
  onLogin: () => void;
  onLogout: () => void;
  activeView: 'client' | 'admin';
  setView: (view: 'client' | 'admin') => void;
  onVerifyBooking: () => void;
}

export default function Header({ currentUser, onLogin, onLogout, activeView, setView, onVerifyBooking }: HeaderProps) {
  const isAdmin = currentUser?.email === 'kumaranshivam57@gmail.com';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-stone-900 text-stone-100 border-b-4 border-stone-950 font-sans select-none" id="command-header">
      {/* Top Banner Alert Segment */}
      <div className="w-full bg-oxide text-white font-bold text-[11px] md:text-xs py-2.5 px-4 flex justify-between items-center tracking-wider border-b border-stone-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-white animate-pulse" />
          <span className="uppercase font-semibold tracking-wide text-[10px] md:text-xs">Live Route Dispatch Update — Sela Pass & Tawang Roadways Open & Beautifully Clear</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 font-sans text-[10px] bg-black/40 px-3 py-1 rounded-none border border-white/10">
          <Compass size={12} className="text-white" />
          <span>ROUTE HUB: Guwahati – Shillong – Ziro – Sela – Tawang</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex justify-between items-center gap-4">
        {/* Logo and Tactical Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('client')}>
          <div className="bg-oxide text-stone-100 font-bold text-xl px-4 py-1.5 rounded-none border-2 border-white shadow-[2px_2px_0px_#1C1D1F] tracking-tighter">
            RIDE
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold font-display tracking-tight leading-none text-white uppercase">
              RIDEHARD TOURS
            </div>
            <p className="text-[10px] text-stone-300 font-bold tracking-wider uppercase leading-none mt-1.5">
              Heavy-Duty Motorcycle Rentals & Multi-Terrain Mountain Expeditions
            </p>
          </div>
        </div>

        {/* Mobile Hamburger menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border-2 border-stone-700 bg-stone-800 text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-1 font-bold uppercase text-[11px]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span>Menu</span>
          </button>
        </div>

        {/* Tactical Actions and User profile login status - Desktop Only */}
        <div className="hidden lg:flex items-center justify-end gap-1.5 xl:gap-3 whitespace-nowrap overflow-hidden">
          <button
            onClick={onVerifyBooking}
            className="px-2 xl:px-4 py-2 text-[10px] xl:text-xs font-bold bg-oxide text-white hover:bg-stone-105 transition-colors uppercase rounded-none border-2 border-stone-700 shadow-[2px_2px_0px_#1C1D1F] cursor-pointer flex items-center gap-1.5 min-h-[40px] xl:min-h-[44px]"
          >
            Verify Booking
          </button>
          <a
            href="#why-armor"
            className="px-2 xl:px-4 py-2 text-[10px] xl:text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-650 transition-colors uppercase rounded-none border-2 border-stone-700 font-bold block flex items-center min-h-[40px] xl:min-h-[44px]"
          >
            Our Advantage
          </a>
          <a
            href="#fleet-grid"
            className="px-2 xl:px-4 py-2 text-[10px] xl:text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-650 transition-colors uppercase rounded-none border-2 border-stone-700 font-bold block flex items-center min-h-[40px] xl:min-h-[44px]"
          >
            Rental Fleet
          </a>
          <a
            href="#active-journal"
            className="px-2 xl:px-4 py-2 text-[10px] xl:text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-650 transition-colors uppercase rounded-none border-2 border-stone-700 font-bold block flex items-center min-h-[40px] xl:min-h-[44px]"
          >
            Adventure Journal
          </a>

          {/* Admin Command Core Trigger */}
          {isAdmin && (
            <button
              onClick={() => setView(activeView === 'admin' ? 'client' : 'admin')}
              className={`px-2 xl:px-4 py-2 text-[10px] xl:text-xs font-bold border-2 rounded-none uppercase cursor-pointer flex items-center gap-1 transition-all min-h-[40px] xl:min-h-[44px] ${
                activeView === 'admin'
                  ? 'bg-stone-950 text-oxide border-oxide font-bold'
                  : 'bg-oxide text-white border-oxide hover:bg-stone-100 hover:text-stone-900 border-2'
              }`}
            >
              <Terminal size={12} />
              {activeView === 'admin' ? 'User Preview' : 'Admin Panel'}
            </button>
          )}

          {/* Core Auth Mechanism for Veteran login */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-stone-950 border-2 border-stone-800 p-1 xl:p-1.5 pr-2 xl:pr-4 rounded-none min-h-[40px] xl:min-h-[44px]">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Explorer'}
                  className="w-6 h-6 xl:w-7 xl:h-7 border border-stone-700 rounded-none shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 xl:w-7 xl:h-7 shrink-0 bg-oxide text-white font-bold flex items-center justify-center border border-stone-750 rounded-none text-[10px] xl:text-xs">
                  E
                </div>
              )}
              <div className="flex flex-col text-left font-sans shrink-0">
                <span className="text-[9px] xl:text-[10px] font-bold leading-none text-stone-200 w-16 xl:w-24 truncate uppercase">
                  {currentUser.displayName || 'Guest Explorer'}
                </span>
                <span className="text-[8px] xl:text-[9px] text-[#A29F99] truncate w-16 xl:w-24 font-bold overflow-hidden mt-0.5">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign out of account"
                className="ml-0.5 hover:text-oxide transition-colors cursor-pointer text-stone-400"
              >
                <LogOut size={12} className="xl:hidden" />
                <LogOut size={14} className="hidden xl:block" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-2 xl:px-4 py-2 bg-oxide text-white hover:bg-stone-100 hover:text-stone-900 border-2 border-stone-900 rounded-none transition-all flex items-center gap-1 text-[10px] xl:text-xs font-bold shadow-[2px_2px_0px_#1C1D1F] cursor-pointer min-h-[40px] xl:min-h-[44px]"
            >
              <UserCheck size={12} />
              Guest Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-955 border-t-2 border-stone-950 p-4 space-y-3 font-sans flex flex-col">
          <button
            onClick={() => {
              onVerifyBooking();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-center px-4 py-3 text-xs font-bold bg-oxide text-white hover:bg-stone-105 transition-colors uppercase rounded-none border-2 border-stone-700 shadow-[2px_2px_0px_#1C1D1F] cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            Verify Booking
          </button>
          
          <a
            href="#why-armor"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center px-4 py-3 text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-750 transition-colors uppercase rounded-none border-2 border-stone-700 block min-h-[44px] flex items-center justify-center"
          >
            Our Advantage
          </a>
          
          <a
            href="#fleet-grid"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center px-4 py-3 text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-750 transition-colors uppercase rounded-none border-2 border-stone-700 block min-h-[44px] flex items-center justify-center"
          >
            Rental Fleet
          </a>
          
          <a
            href="#active-journal"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center px-4 py-3 text-xs font-bold bg-stone-800 text-stone-100 hover:bg-stone-750 transition-colors uppercase rounded-none border-2 border-stone-700 block min-h-[44px] flex items-center justify-center"
          >
            Adventure Journal
          </a>

          {/* Admin Toggle */}
          {isAdmin && (
            <button
              onClick={() => {
                setView(activeView === 'admin' ? 'client' : 'admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full justify-center px-4 py-3 text-xs font-bold border-2 rounded-none uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
                activeView === 'admin'
                  ? 'bg-stone-950 text-oxide border-oxide font-bold'
                  : 'bg-oxide text-white border-oxide hover:bg-stone-100 hover:text-stone-900 border-2'
              }`}
            >
              <Terminal size={14} />
              {activeView === 'admin' ? 'User Preview' : 'Admin Panel'}
            </button>
          )}

          {/* User profile */}
          {currentUser ? (
            <div className="flex items-center justify-between bg-stone-900 border-2 border-stone-800 p-2.5 rounded-none">
              <div className="flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Explorer'}
                    className="w-8 h-8 border border-stone-700 rounded-none animate-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 bg-oxide text-white font-bold flex items-center justify-center border border-stone-750 rounded-none text-xs">
                    E
                  </div>
                )}
                <div className="flex flex-col text-left font-sans">
                  <span className="text-[10px] font-bold leading-none text-stone-200 max-w-[150px] truncate uppercase">
                    {currentUser.displayName || 'Guest Explorer'}
                  </span>
                  <span className="text-[9px] text-[#A29F99] scale-[0.9] origin-left truncate max-w-[150px] font-bold">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="hover:text-oxide text-stone-400 p-2 rounded-none cursor-pointer min-h-[44px] flex items-center justify-center"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onLogin();
                setIsMobileMenuOpen(false);
              }}
              className="w-full justify-center px-4 py-3 bg-oxide text-white hover:bg-stone-100 hover:text-stone-900 border-2 border-stone-900 rounded-none transition-all flex items-center gap-1.5 text-xs font-bold shadow-[2px_2px_0px_#1C1D1F] cursor-pointer min-h-[44px]"
            >
              <UserCheck size={14} />
              Guest Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
