import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import { Vehicle, Booking, JournalEntry, RiderLog, Itinerary } from './src/types.ts';

// 1. Safe detection of real Firebase configuration
let isFirebaseReal = false;
let db: any = null;

try {
  const rawConfig = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
  const firebaseConfig = JSON.parse(rawConfig);
  isFirebaseReal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'MOCK_API_KEY';

  if (isFirebaseReal) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    console.log('[RideHard Server] Successfully initialized Firebase Firestore backend connection.');
  } else {
    console.info("[RideHard Server] Fallback Local Engine Mode active. Default mock database in-memory.");
  }
} catch (configErr) {
  console.warn("[RideHard Server] Could not read firebase config or setup connection. Falling back to local engine.", configErr);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Initial seed arrays
const defaultVehicles: Vehicle[] = [
  {
    id: 'enfield-himalayan-450-01',
    name: 'Gravel Conqueror',
    modelName: 'Himalayan 450',
    groundClearance: 230,
    torqueRating: '40 Nm @ 5500 RPM (Altitude Tuned)',
    crashGuardSetup: 'Full perimeter high-tensile steel crash cage, heavy anodized aluminum engine skid plate, reinforced handguards',
    dailyRate: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1609137144814-1e0e47087050?auto=format&fit=crop&q=80&w=1000',
    blockedDates: ['2026-06-12', '2026-06-13', '2026-06-14'],
    status: 'Active'
  },
  {
    id: 'enfield-scram-411-02',
    name: 'Mud Trooper',
    modelName: 'Scram 411',
    groundClearance: 200,
    torqueRating: '32 Nm @ 4250 RPM',
    crashGuardSetup: 'Compact steel frame bars, heavy-gauge aluminum engine belly guard, customized rugged double-rail panniers',
    dailyRate: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
    blockedDates: ['2026-06-25'],
    status: 'Active'
  },
  {
    id: 'enfield-intercept-650-03',
    name: 'High-Pass Highwayman',
    modelName: 'Interceptor 650',
    groundClearance: 174,
    torqueRating: '52 Nm @ 5250 RPM (Steep Climb Mapping)',
    crashGuardSetup: 'Double-cradle chassis guards, custom stainless steel headers, brush protectors',
    dailyRate: 3500,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
    blockedDates: [],
    status: 'Active'
  },
  {
    id: 'enfield-himalayan-450-soldout',
    name: 'Sela Summit Explorer',
    modelName: 'Himalayan 450',
    groundClearance: 230,
    torqueRating: '40 Nm @ 5500 RPM (Fully Booked)',
    crashGuardSetup: 'Heavy-duty steel wrapping crash cage, dual pannier holders, water resistant soft bags',
    dailyRate: 2900,
    imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=1000',
    blockedDates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30'],
    status: 'Active'
  },
  {
    id: 'enfield-hunter-350-maint',
    name: 'Urban Wanderer',
    modelName: 'Hunter 350',
    groundClearance: 150,
    torqueRating: '27 Nm @ 4000 RPM',
    crashGuardSetup: 'Standard frame protectors, polished engine covers',
    dailyRate: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
    blockedDates: [],
    status: 'Under Maintenance'
  },
  {
    id: 'enfield-scram-411-soldout',
    name: 'Wilderness Nomad',
    modelName: 'Scram 411',
    groundClearance: 200,
    torqueRating: '32 Nm @ 4250 RPM',
    crashGuardSetup: 'High-tensile side frame bars, hard aluminum bash plate',
    dailyRate: 2300,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
    blockedDates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15'],
    status: 'Active'
  },
  {
    id: 'scooter-activa-01',
    name: 'Guwahati City Glide',
    modelName: 'Honda Activa',
    groundClearance: 145,
    torqueRating: '9 Nm @ 5500 RPM',
    crashGuardSetup: 'All-around steel perimeter guard bumpers, front basket option',
    dailyRate: 800,
    imageUrl: '',
    blockedDates: [],
    status: 'Active'
  },
  {
    id: 'scooter-ntorq-01',
    name: 'Tawang Hill Spirit',
    modelName: 'TVS Ntorq',
    groundClearance: 155,
    torqueRating: '10.5 Nm @ 5500 RPM (Sport hill-climb tune)',
    crashGuardSetup: 'Reinforcement body sliders, heavy duty break levers, floor-board lock cage',
    dailyRate: 1000,
    imageUrl: '',
    blockedDates: [],
    status: 'Active'
  }
];

const defaultBookings: Booking[] = [
  {
    id: 'BK-774021',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@expedition.org',
    customerPhone: '+91 98765 43210',
    vehicleId: 'enfield-himalayan-450-01',
    vehicleName: 'Gravel Conqueror (Himalayan 450)',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
    totalCost: 8400,
    advancePaid: 840,
    balancePending: 7560,
    securityDeposit: 5000,
    status: 'Confirmed',
    paymentTxn: 'UPI-9928172901-SBIN',
    createdAt: new Date().toISOString()
  },
  {
    id: 'BK-105582',
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@rider-mail.com',
    customerPhone: '+44 7911 123456',
    vehicleId: 'enfield-scram-411-02',
    vehicleName: 'Mud Trooper (Scram 411)',
    startDate: '2026-06-25',
    endDate: '2026-06-25',
    totalCost: 2200,
    advancePaid: 220,
    balancePending: 1980,
    securityDeposit: 5000,
    status: 'Pending Verification',
    paymentTxn: 'TXN-BANK-REF881907',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  }
];

const defaultJournals: JournalEntry[] = [
  {
    id: 'JN-889',
    title: 'The Ultimate Guide to Traversing Sela Pass',
    territory: 'Guwahati - Sela Pass - Tawang Circuit',
    warning: 'Route Guides',
    excerpt: 'Planning to ride through the spectacular Sela Pass to Tawang? Here is the complete breakdown of road conditions, seasonal weather, and advice for a secure mountain journey.',
    bodyText: 'Riding to Sela Pass (13,700 feet) is the ultimate dream of every adventure motorcyclist. The route begins in the plains of Guwahati, climbing steadily through the dense forests of Bhalukpong and the historic town of Bomdila.\n\nThe roads are well-paved in major segments, but approaching the mountain pass can be challenging. Because the weather shifts quickly with high vertical winds and occasional fog, starting your climb early in the morning is highly recommended.\n\nEnsure your motorcycle fuel mapping is ready to handle elevations higher than 12,000 feet. Our customized Royal Enfield Himalayan 450 is adjusted to run seamlessly in high-altitude environments, bringing consistent power to steep switchbacks.',
    imageUrl: '',
    createdAt: '2026-05-31T09:12:00Z'
  },
  {
    id: 'JN-602',
    title: 'Selecting the Perfect Machine for Northeast Exploration',
    territory: 'All Mountain Routes',
    warning: 'Rider Advices',
    excerpt: 'Unsure whether to book the high-clearance Himalayan 450 or the agile Scram 411 for your journey? Let us compare weight distribution, seat heights, and accessories.',
    bodyText: 'Northeast India roads offer diverse terrains, from smooth paved state highways to rough gravel and muddy interior trails. Choosing the right motorcycle depends entirely on your experience and route complexity.\n\n1. Royal Enfield Himalayan 450: Built with a raw 452cc liquid-cooled engine and long-travel suspension, it is superb for riders planning heavy luggage loads or crossing rugged river-beds.\n\n2. Royal Enfield Scram 411: Light and highly manoeuvrable, with a low-slung seat, it is highly recommended for twisting mountain bends and responsive control.\n\nChoose the model that fits your comfort level, so you can enjoy the beautiful valleys of the region with peace of mind.',
    imageUrl: '',
    createdAt: '2026-05-30T17:40:00Z'
  }
];

const defaultRiderLogs: RiderLog[] = [
  {
    id: 'L-201',
    riderName: 'Vikram Singh',
    route: 'Full Arunachal Highway Circuit',
    feedback: 'The Royal Enfield Himalayan 450 I rented from RideHard was in absolutely pristine mechanical condition. The custom engine tuning made climbing Sela Pass a complete joy. To make it even better, they handled all Inner Line Permits (ILP) on my behalf. Highly professional!',
    rating: 5,
    date: 'April 2026'
  },
  {
    id: 'L-102',
    riderName: 'Elena Rostova',
    route: 'Meghalaya Valley Loops',
    feedback: 'Riding the custom Scram 411 through the wet hills of Cherrapunji was an incredible experience. The transaction was clean and professional, the staff set up the luggage gears perfectly, and the motorcycle handled the mud and steep slopes beautifully.',
    rating: 5,
    date: 'May 2026'
  }
];

// Fallback in-memory states (in case Firebase is not connected or fails)
const defaultItineraries: Itinerary[] = [
  {
    id: 'ITIN-DUMMY-1',
    title: 'Tawang Monastic High-Altitude Trail',
    days: '7 Days (+-1 Day)',
    mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000',
    thingsToDo: ['Cross the Sela Pass (13,700 ft)', 'Visit Tawang Monastery', 'Camp near Nuranang Falls'],
    suggestedVehicle: 'Royal Enfield Himalayan 450',
    bestTimeToVisit: 'March - May, Sep - Nov',
    typicalWeather: 'Cold at high altitudes, 0°C to 15°C',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ITIN-DUMMY-2',
    title: 'Meghalaya Cloud Circuit',
    days: '5 Days (+-1 Day)',
    mapImageUrl: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=1000',
    thingsToDo: ['Ride the Cherrapunji twisties', 'Visit living root bridges', 'Dawki crystal river traverse'],
    suggestedVehicle: 'Royal Enfield Scram 411',
    bestTimeToVisit: 'October - April',
    typicalWeather: 'Pleasant, heavy rain during monsoon, 10°C to 20°C',
    createdAt: new Date().toISOString()
  }
];

let vehicles = [...defaultVehicles];
let bookings = [...defaultBookings];
let journals = [...defaultJournals];
let riderLogs = [...defaultRiderLogs];
let itineraries: Itinerary[] = [...defaultItineraries];

// Safe dates sequence helper
function getDatesInRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  const temp = new Date(start);
  while (temp <= end) {
    dates.push(temp.toISOString().split('T')[0]);
    temp.setDate(temp.getDate() + 1);
  }
  return dates;
}

// Seeder Utility
async function seedCollectionIfEmpty(collectionName: string, defaultData: any[]) {
  if (!db) return;
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      console.log(`[RideHard Seeder] Seeding empty Firestore collection: ${collectionName}`);
      for (const item of defaultData) {
        if (item.id) {
          await setDoc(doc(db, collectionName, item.id), item);
        } else {
          await addDoc(colRef, item);
        }
      }
      console.log(`[RideHard Seeder] Loaded ${defaultData.length} documents into '${collectionName}'.`);
    } else {
      console.log(`[RideHard Seeder] Collection '${collectionName}' already initialized with ${snap.size} documents.`);
    }
  } catch (err) {
    console.error(`[RideHard Seeder] Error seeding ${collectionName}:`, err);
  }
}

async function seedDatabase() {
  if (isFirebaseReal && db) {
    await seedCollectionIfEmpty('vehicles', defaultVehicles);
    await seedCollectionIfEmpty('bookings', defaultBookings);
    await seedCollectionIfEmpty('journals', defaultJournals);
    await seedCollectionIfEmpty('rider_logs', defaultRiderLogs);
  }
}

// Dynamic server-side data getters
async function getVehiclesList(): Promise<Vehicle[]> {
  if (isFirebaseReal && db) {
    try {
      const snap = await getDocs(collection(db, 'vehicles'));
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vehicle));
    } catch (err) {
      console.error('[RideHard DB] Error fetching vehicles, falling back to cache:', err);
    }
  }
  return vehicles;
}

async function getBookingsList(): Promise<Booking[]> {
  if (isFirebaseReal && db) {
    try {
      const snap = await getDocs(collection(db, 'bookings'));
      const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Booking));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[RideHard DB] Error fetching bookings, falling back to cache:', err);
    }
  }
  return bookings;
}

async function getJournalsList(): Promise<JournalEntry[]> {
  if (isFirebaseReal && db) {
    try {
      const snap = await getDocs(collection(db, 'journals'));
      const list = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as JournalEntry));
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('[RideHard DB] Error fetching journals, falling back to cache:', err);
    }
  }
  return journals;
}

async function getRiderLogsList(): Promise<RiderLog[]> {
  if (isFirebaseReal && db) {
    try {
      const snap = await getDocs(collection(db, 'rider_logs'));
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as RiderLog));
    } catch (err) {
      console.error('[RideHard DB] Error fetching rider logs, falling back to cache:', err);
    }
  }
  return riderLogs;
}

async function getItinerariesList(): Promise<Itinerary[]> {
  if (isFirebaseReal && db) {
    try {
      const snap = await getDocs(collection(db, 'itineraries'));
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Itinerary));
    } catch (err) {
      console.error('[RideHard DB] Error fetching itineraries, falling back to cache:', err);
    }
  }
  return itineraries;
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Seed database initially if connected
  await seedDatabase();

  // --- FULL STACK CORE API ENDPOINTS ---

  // Health and connection check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      firebaseConnected: isFirebaseReal,
      timestamp: new Date().toISOString()
    });
  });

  // GET: Fleet retrieval
  app.get('/api/vehicles', async (req, res) => {
    const list = await getVehiclesList();
    res.json(list);
  });

  // POST: CMS Admin - register or inject a new motorcycle
  app.post('/api/vehicles', async (req, res) => {
    const { name, modelName, groundClearance, torqueRating, crashGuardSetup, dailyRate, imageUrl } = req.body;
    
    if (!name || !modelName || !dailyRate) {
      return res.status(400).json({ error: 'Incomplete mechanical manifest specification payload.' });
    }

    const newVehicle: Vehicle = {
      id: `enfield-custom-${Date.now()}`,
      name,
      modelName,
      groundClearance: Number(groundClearance) || 200,
      torqueRating: torqueRating || 'Standard Altitude Output',
      crashGuardSetup: crashGuardSetup || 'Standard Engine Protection Bars',
      dailyRate: Number(dailyRate),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
      blockedDates: [],
      status: 'Active'
    };

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'vehicles', newVehicle.id), newVehicle);
        // Refresh local cache representation as fallback
        const updated = await getVehiclesList();
        vehicles = updated;
        return res.status(201).json(newVehicle);
      } catch (err) {
        console.error('[RideHard DB] Error creating vehicle:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      vehicles.push(newVehicle);
      res.status(201).json(newVehicle);
    }
  });

  // PUT: Update vehicle details or toggle global status (CMS Fleet Commander Panel)
  app.put('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;

    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'vehicles', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          return res.status(404).json({ error: 'Machine ID not located in database.' });
        }
        const updatedData = { ...docSnap.data(), ...req.body };
        await setDoc(docRef, updatedData);
        // Refresh local cache
        const updated = await getVehiclesList();
        vehicles = updated;
        return res.json(updatedData);
      } catch (err) {
        console.error('[RideHard DB] Error updating vehicle:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      const idx = vehicles.findIndex(v => v.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Machine ID not located in command files.' });
      }

      vehicles[idx] = {
        ...vehicles[idx],
        ...req.body
      };
      res.json(vehicles[idx]);
    }
  });

  // GET: Booking Ledger
  app.get('/api/bookings', async (req, res) => {
    const list = await getBookingsList();
    res.json(list);
  });

  // POST: Frictionless Booking checkout
  app.post('/api/bookings', async (req, res) => {
    const { customerName, customerEmail, customerPhone, vehicleId, vehicleName, startDate, endDate, totalCost, advancePaid, balancePending, securityDeposit, paymentTxn } = req.body;

    if (!customerName || !customerPhone || !vehicleId || !startDate || !endDate || !totalCost) {
      return res.status(400).json({ error: 'Missing core booking manifest dates or contact metrics.' });
    }

    // 1. Double booking pre-check
    const currentVehicles = await getVehiclesList();
    const vehicle = currentVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const requestedDates = getDatesInRange(startDate, endDate);
      const isOverlapping = requestedDates.some(d => (vehicle.blockedDates || []).includes(d));
      if (isOverlapping) {
        return res.status(409).json({ error: 'Auto-Conflict: Machine has already been booked for selected dates.' });
      }
    }

    const newBooking: Booking = {
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName,
      customerEmail,
      customerPhone,
      vehicleId,
      vehicleName: vehicleName || (vehicle ? `${vehicle.name} (${vehicle.modelName})` : 'Royal Enfield'),
      startDate,
      endDate,
      totalCost: Number(totalCost),
      advancePaid: Number(advancePaid || 0),
      balancePending: Number(balancePending || 0),
      securityDeposit: Number(securityDeposit || 5000),
      status: 'Pending Verification',
      paymentTxn: paymentTxn || 'UPI-PENDING-GUEST',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
        // Refresh local cache
        const updated = await getBookingsList();
        bookings = updated;
        return res.status(201).json(newBooking);
      } catch (err) {
        console.error('[RideHard DB] Error creating booking:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      bookings.push(newBooking);
      res.status(201).json(newBooking);
    }
  });

  // POST: Auto-Inventory Lockout & Administrative Booking confirmation logic
  app.post('/api/admin/confirm-booking', async (req, res) => {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'Missing critical booking UID reference.' });
    }

    let booking: Booking | undefined;
    if (isFirebaseReal && db) {
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          booking = { ...docSnap.data(), id: docSnap.id } as Booking;
        }
      } catch (err) {
        console.error('[RideHard DB] Error fetching booking:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      booking = bookings.find(b => b.id === bookingId);
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking manifest record not found in database.' });
    }

    if (booking.status === 'Confirmed') {
      return res.json({ message: 'Booking already verified and locked.', booking });
    }

    // Transition state
    booking.status = 'Confirmed';

    // Auto-Inventory Lockout Logic:
    const requestedDates = getDatesInRange(booking.startDate, booking.endDate);

    if (isFirebaseReal && db) {
      try {
        // Toggle vehicle blockedDates in Firestore
        const vDocRef = doc(db, 'vehicles', booking.vehicleId);
        const vDocSnap = await getDoc(vDocRef);
        if (vDocSnap.exists()) {
          const vData = vDocSnap.data() as Vehicle;
          const uniqueDates = Array.from(new Set([
            ...(vData.blockedDates || []),
            ...requestedDates
          ]));
          await updateDoc(vDocRef, { blockedDates: uniqueDates });
        }
      } catch (err) {
        console.error('[RideHard DB] Error updating vehicle lockout dates:', err);
        return res.status(500).json({ error: 'Database transaction failed on vehicle date lockout.' });
      }
    } else {
      const vehicleIdx = vehicles.findIndex(v => v.id === booking!.vehicleId);
      if (vehicleIdx !== -1) {
        const uniqueDates = Array.from(new Set([
          ...vehicles[vehicleIdx].blockedDates,
          ...requestedDates
        ]));
        vehicles[vehicleIdx].blockedDates = uniqueDates;
      }
    }

    // Email and SMS Dispatch Logging (Required state action flow)
    const customerSmsLog = `To SMS [${booking.customerPhone}]: CONQUER ACTIVE! RideHard has LOCKED Unit [${booking.vehicleName}] for dates ${booking.startDate} to ${booking.endDate}. UPI Verified. Carry high-altitude warm gear.`;
    const customerEmailLog = `To Email [${booking.customerEmail}]: SUBJECT: RIDEHARD EXPEDITION ORDER [${booking.id}] COMMITTED. Your military-grade tuning is active. Your Royal Enfield is reserved. Secure ILP permits before assembly at Guwahati base.`;
    const adminNotificationLog = `To System Admin Dashboard [info@ridehard.in]: INVENTORY LOCKENGAGED - Unit [${booking.vehicleName}] blocked exclusively from standard search for ${booking.startDate} to ${booking.endDate}. Verified Transaction ID: ${booking.paymentTxn}.`;

    console.log('\n--- SYSTEM COMMUNICATIONS DISPATCH CONTROLLER ---');
    console.log(customerSmsLog);
    console.log(customerEmailLog);
    console.log(adminNotificationLog);
    console.log('---------------------------------------------------\n');

    booking.verificationLogs = {
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'Corporate Ops Commander',
      emailSent: true,
      smsSent: true,
      sentLogs: [customerSmsLog, customerEmailLog, adminNotificationLog]
    };

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'bookings', booking.id), booking);
        // Refresh local cache
        const updated = await getBookingsList();
        bookings = updated;
      } catch (err) {
        console.error('[RideHard DB] Error updating confirmation booking:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      const bookingIdx = bookings.findIndex(b => b.id === bookingId);
      if (bookingIdx !== -1) {
        bookings[bookingIdx] = booking;
      }
    }

    res.json({
      success: true,
      message: 'Expedition locked, double-booking lockout system engaged, confirmation logging completed.',
      booking,
      locksAdded: requestedDates
    });
  });

  // GET: CMS Journals / Blogs list
  app.get('/api/journals', async (req, res) => {
    const list = await getJournalsList();
    res.json(list);
  });

  // POST: Publish a new Adventure Journal / Blog entry
  app.post('/api/journals', async (req, res) => {
    const { title, territory, warning, excerpt, bodyText, imageUrl } = req.body;

    if (!title || !territory || !bodyText) {
      return res.status(400).json({ error: 'Title, category/tag, and body details are mandatory.' });
    }

    const newJournalItem: JournalEntry = {
      id: `JN-${Math.floor(100 + Math.random() * 900)}`,
      title,
      territory,
      warning: warning || 'Travel Logs',
      excerpt: excerpt || bodyText.substring(0, 150) + '...',
      bodyText,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1000',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'journals', newJournalItem.id), newJournalItem);
        const updated = await getJournalsList();
        journals = updated;
        return res.status(201).json(newJournalItem);
      } catch (err) {
        console.error('[RideHard DB] Error creating journal:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      journals.unshift(newJournalItem);
      res.status(201).json(newJournalItem);
    }
  });

  // GET: Rider Logs
  app.get('/api/rider_logs', async (req, res) => {
    const list = await getRiderLogsList();
    res.json(list);
  });

  // POST: Rider Logs
  app.post('/api/rider_logs', async (req, res) => {
    const { riderName, route, feedback, rating } = req.body;

    if (!riderName || !feedback || !rating) {
      return res.status(400).json({ error: 'Name, rating, and feedback body required.' });
    }

    const newLog: RiderLog = {
      id: `L-${Date.now()}`,
      riderName,
      route: route || 'Seven Sisters Open Loop',
      feedback,
      rating: Number(rating) || 5,
      date: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    };

    if (isFirebaseReal && db) {
      try {
        await setDoc(doc(db, 'rider_logs', newLog.id), newLog);
        const updated = await getRiderLogsList();
        riderLogs = updated;
        return res.status(201).json(newLog);
      } catch (err) {
        console.error('[RideHard DB] Error creating rider log:', err);
        return res.status(500).json({ error: 'Database transaction failed.' });
      }
    } else {
      riderLogs.unshift(newLog);
      res.status(201).json(newLog);
    }
  });

  // GET: Itineraries
  app.get('/api/itineraries', async (req, res) => {
    const list = await getItinerariesList();
    res.json(list);
  });

  // POST: Create Itinerary manually
  app.post('/api/itineraries', async (req, res) => {
    const data = req.body;
    if (!data.title) {
       return res.status(400).json({ error: 'Title is required' });
    }
    
    const newItinerary: Itinerary = {
      id: `ITIN-${Date.now()}`,
      title: data.title,
      days: data.days || 'N/A',
      mapImageUrl: data.mapImageUrl || '',
      thingsToDo: data.thingsToDo || [],
      suggestedVehicle: data.suggestedVehicle || 'Royal Enfield Himalayan 450',
      bestTimeToVisit: data.bestTimeToVisit || 'Oct-May',
      typicalWeather: data.typicalWeather || 'Varies',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseReal && db) {
       try {
         await setDoc(doc(db, 'itineraries', newItinerary.id), newItinerary);
         itineraries = await getItinerariesList();
         return res.status(201).json(newItinerary);
       } catch (err) {
         console.error('[RideHard DB] Error creating itinerary:', err);
         return res.status(500).json({ error: 'Database transaction failed.' });
       }
    } else {
       itineraries.push(newItinerary);
       res.status(201).json(newItinerary);
    }
  });

  // POST: Generate Itinerary using Gemini
  app.post('/api/gemini/generate-itinerary', async (req, res) => {
     try {
       const { destination, days } = req.body;
       const response = await ai.models.generateContent({
         model: 'gemini-3.5-flash',
         contents: `Design a motorcycle adventure itinerary for ${destination} in Northeast India lasting approximately ${days} days. Be highly specific to motorcycle touring. Incorporate altitudes, road conditions, and scenic spots.`,
         config: {
           systemInstruction: "You are an expert adventure touring guide for Northeast India specialzing in motorcycle expeditions.",
           responseMimeType: "application/json",
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               title: { type: Type.STRING, description: "Catchy title for the route" },
               days: { type: Type.STRING, description: "Number of days (e.g. '7 Days (+-1 Day)')" },
               thingsToDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key stops and things to do/see." },
               suggestedVehicle: { type: Type.STRING, description: "Suggested motorcycle (e.g., Himalayan 450, Scram 411, etc.)" },
               bestTimeToVisit: { type: Type.STRING, description: "Months/seasons best suited for this route" },
               typicalWeather: { type: Type.STRING, description: "Brief weather summary, mention temperatures and rain risk" },
               mapImageUrl: { type: Type.STRING, description: "A highly descriptive image generation prompt (string) for a stylized, hand-drawn aesthetic adventure map of this route. We will pass this to an image gen model next." }
             },
             required: ["title", "days", "thingsToDo", "suggestedVehicle", "bestTimeToVisit", "typicalWeather", "mapImageUrl"]
           }
         }
       });

       const jsonStr = response.text || "{}";
       const data = JSON.parse(jsonStr);

       // Now attempt to generate map image using gemini-2.5-flash-image
       let generatedImageBase64 = "";
       try {
         const imgResponse = await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: {
                 parts: [{ text: data.mapImageUrl + " Use a highly stylized, aesthetic, rough adventure topography map style." }]
             }
         });
         
         for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
             if (part.inlineData) {
                 generatedImageBase64 = `data:image/jpeg;base64,${part.inlineData.data}`;
                 break;
             }
         }
       } catch (imgErr) {
         console.warn("[Gemini Image Gen] Failed to generate map image:", imgErr);
       }

       data.mapImageUrl = generatedImageBase64 || "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000";

       res.json(data);
     } catch (err: any) {
       console.error('[Gemini API] Generate Itinerary failed:', err);
       res.status(500).json({ error: 'Failed to generate itinerary. ' + (err.message || '') });
     }
  });

  // POST: Reset & Populate Demo Fleet (Admin trigger)
  app.post('/api/admin/populate-demo', async (req, res) => {
    const demoVehicles: Vehicle[] = [
      {
        id: 'enfield-himalayan-450-01',
        name: 'Gravel Conqueror',
        modelName: 'Himalayan 450',
        groundClearance: 230,
        torqueRating: '40 Nm @ 5500 RPM (Altitude Tuned)',
        crashGuardSetup: 'Full perimeter high-tensile steel crash cage, heavy anodized aluminum engine skid plate, reinforced handguards',
        dailyRate: 2800,
        imageUrl: 'https://images.unsplash.com/photo-1609137144814-1e0e47087050?auto=format&fit=crop&q=80&w=1000',
        blockedDates: ['2026-06-12', '2026-06-13', '2026-06-14'],
        status: 'Active'
      },
      {
        id: 'enfield-scram-411-02',
        name: 'Mud Trooper',
        modelName: 'Scram 411',
        groundClearance: 200,
        torqueRating: '32 Nm @ 4250 RPM',
        crashGuardSetup: 'Compact steel frame bars, heavy-gauge aluminum engine belly guard, customized rugged double-rail panniers',
        dailyRate: 2200,
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
        blockedDates: ['2026-06-25'],
        status: 'Active'
      },
      {
        id: 'enfield-intercept-650-03',
        name: 'High-Pass Highwayman',
        modelName: 'Interceptor 650',
        groundClearance: 174,
        torqueRating: '52 Nm @ 5250 RPM (Steep Climb Mapping)',
        crashGuardSetup: 'Double-cradle chassis guards, custom stainless steel headers, brush protectors',
        dailyRate: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
        blockedDates: [],
        status: 'Active'
      },
      {
        id: 'enfield-himalayan-450-soldout',
        name: 'Sela Summit Explorer',
        modelName: 'Himalayan 450',
        groundClearance: 230,
        torqueRating: '40 Nm @ 5500 RPM (Fully Booked)',
        crashGuardSetup: 'Heavy-duty steel wrapping crash cage, dual pannier holders, water resistant soft bags',
        dailyRate: 2900,
        imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=1000',
        blockedDates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30'],
        status: 'Active'
      },
      {
        id: 'enfield-hunter-350-maint',
        name: 'Urban Wanderer',
        modelName: 'Hunter 350',
        groundClearance: 150,
        torqueRating: '27 Nm @ 4000 RPM (City & Valley Touring)',
        crashGuardSetup: 'Standard frame protectors, polished engine covers',
        dailyRate: 1800,
        imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
        blockedDates: [],
        status: 'Under Maintenance'
      },
      {
        id: 'enfield-scram-411-soldout',
        name: 'Wilderness Nomad',
        modelName: 'Scram 411',
        groundClearance: 200,
        torqueRating: '32 Nm @ 4250 RPM',
        crashGuardSetup: 'High-tensile side frame bars, hard aluminum bash plate',
        dailyRate: 2300,
        imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000',
        blockedDates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30', '2026-05-31', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15'],
        status: 'Active'
      },
      {
        id: 'enfield-himalayan-450-new',
        name: 'Tawang Trailblazer',
        modelName: 'Himalayan 450',
        groundClearance: 230,
        torqueRating: '40 Nm @ 5800 RPM (Raw Switchback Tune)',
        crashGuardSetup: 'Extra large steel bashplate, double engine guards, handlebar risers, heavy trail-luggage setup',
        dailyRate: 3100,
        imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=1000',
        blockedDates: [],
        status: 'Active'
      },
      {
        id: 'enfield-scram-411-forest',
        name: 'Ziro Forest Ranger',
        modelName: 'Scram 411',
        groundClearance: 200,
        torqueRating: '32 Nm @ 4300 RPM (High Traction Setup)',
        crashGuardSetup: 'Reinforced dual side frames, custom sliders, hard engine covers, knobby heavy duty tyres',
        dailyRate: 2400,
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000',
        blockedDates: [],
        status: 'Active'
      },
      {
        id: 'scooter-activa-01',
        name: 'Guwahati City Glide',
        modelName: 'Honda Activa',
        groundClearance: 145,
        torqueRating: '9 Nm @ 5500 RPM',
        crashGuardSetup: 'All-around steel perimeter guard bumpers, front basket option',
        dailyRate: 800,
        imageUrl: '',
        blockedDates: [],
        status: 'Active'
      },
      {
        id: 'scooter-ntorq-01',
        name: 'Tawang Hill Spirit',
        modelName: 'TVS Ntorq',
        groundClearance: 155,
        torqueRating: '10.5 Nm @ 5500 RPM (Sport hill-climb tune)',
        crashGuardSetup: 'Reinforcement body sliders, heavy duty break levers, floor-board lock cage',
        dailyRate: 1000,
        imageUrl: '',
        blockedDates: [],
        status: 'Active'
      }
    ];

    if (isFirebaseReal && db) {
      try {
        for (const bike of demoVehicles) {
          await setDoc(doc(db, 'vehicles', bike.id), bike);
        }
        const updated = await getVehiclesList();
        vehicles = updated;
        return res.json({ success: true, count: vehicles.length, vehicles });
      } catch (err: any) {
        console.error('[RideHard DB] Error populating demo vehicles:', err);
        return res.status(500).json({ error: 'Database populate failed.' });
      }
    } else {
      vehicles = [...demoVehicles];
      res.json({ success: true, count: vehicles.length, vehicles });
    }
  });

  // --- VITE DEV MIDDLEWARE / INDEX ROUTING ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RideHard Server] Command Center Active at http://localhost:${PORT}`);
  });
}

startServer();
