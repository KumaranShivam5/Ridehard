export interface Vehicle {
  id: string;
  name: string;
  modelName: 'Himalayan 450' | 'Scram 411' | 'Interceptor 650' | string;
  groundClearance: number; // in mm
  torqueRating: string; // e.g. "40 Nm @ 5500 RPM (High Altitude Optimised)"
  crashGuardSetup: string; // e.g. "Full wraparound high-tensile steel crash-cage, skid plate"
  dailyRate: number; // INR per day
  imageUrl: string;
  blockedDates: string[]; // YYYY-MM-DD
  status: 'Active' | 'Under Maintenance' | 'Decommissioned';
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  vehicleId: string;
  vehicleName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalCost: number; // calculated total
  advancePaid: number; // 10%
  balancePending: number; // 90%
  securityDeposit: number; // e.g. 5000 flat
  status: 'Pending Verification' | 'Confirmed';
  paymentTxn: string; // UPI Txn ID or Bank Ref
  createdAt: string; // ISO String / server timestamp
  verificationLogs?: {
    verifiedAt: string;
    verifiedBy: string;
    emailSent: boolean;
    smsSent: boolean;
    sentLogs: string[];
  };
}

export interface JournalEntry {
  id: string;
  title: string;
  territory: string; // e.g. "Sela Pass Guide"
  warning: 'Travel Logs' | 'Route Guides' | 'Rider Advices' | string;
  excerpt: string; // brief overview card
  bodyText: string; // full blog body text
  imageUrl: string; // header image url
  createdAt: string; // string or timestamp
}

export interface RiderLog {
  id: string;
  riderName: string;
  route: string; // e.g. "Sela-Tawang Loop"
  feedback: string;
  rating: number; // 1-5 stars
  date: string; // Month/Year of expedition
}

export interface Itinerary {
  id: string;
  title: string;
  days: string; // e.g., "7 Days (+-1 Day)"
  mapImageUrl: string;
  thingsToDo: string[];
  suggestedVehicle: string;
  bestTimeToVisit: string;
  typicalWeather: string;
  createdAt: string;
}
