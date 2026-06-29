import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CivicIssue, UserProfile, ToastMessage, IssueCategory } from './types';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import IssueDetailSheet from './components/IssueDetailSheet';
import ReportIssueSheet from './components/ReportIssueSheet';
import ToastContainer from './components/ToastContainer';
import DashboardDrawer from './components/DashboardDrawer';
import HelpGuideModal from './components/HelpGuideModal';
import { MapPin, Plus, Loader2, Sparkles, AlertCircle, LayoutDashboard, Activity, CheckCircle, ShieldAlert, Minimize2, Maximize2 } from 'lucide-react';

const BHOPAL_COORDS = { lat: 23.2599, lng: 77.4126 };

// Seed issues on first startup
const INITIAL_ISSUES: CivicIssue[] = [
  // BHOPAL ISSUES
  {
    id: 'pothole-bhopal-1',
    title: 'Hazardous deep asphalt cracks on Link Road 1',
    description: 'A cluster of deep, sharp-edged potholes near the main lane divider. Vehicles are braking abruptly to swerve, creating a major collision risk for two-wheelers during evening rush hour.',
    category: 'Pothole',
    status: 'Verified',
    latitude: 23.2435,
    longitude: 77.4180,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Suresh Kumar',
    timestamp: '2026-06-25T11:20:00Z',
    votesConfirm: 12,
    votesReject: 1,
    userVoted: null,
    aiConfidence: 94,
    address: 'Link Road 1, near MP Nagar transition zone, Bhopal',
    city: 'Bhopal'
  },
  {
    id: 'garbage-bhopal-2',
    title: 'Decomposing garbage pile block on sidewalk',
    description: 'Decomposing household food waste and toxic plastic containers dumped unchecked on the commercial walking path. Foul smell is spreading and stray animals are scattering the trash into the road.',
    category: 'Garbage',
    status: 'Reported',
    latitude: 23.2312,
    longitude: 77.4365,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Amit Sharma',
    timestamp: '2026-06-26T04:10:00Z',
    votesConfirm: 4,
    votesReject: 0,
    userVoted: null,
    aiConfidence: 89,
    address: 'Commercial Walkway, MP Nagar Zone II, Bhopal',
    city: 'Bhopal'
  },
  {
    id: 'water-leak-bhopal-3',
    title: 'Ruptured subsurface water supply line flooding',
    description: 'Subsurface municipal pipeline burst. Thousands of gallons of clean drinking water are bubbling up through tarmac cracks, washing away soil roadbed and flooding adjacent storm drains.',
    category: 'Water Leak',
    status: 'In Progress',
    latitude: 23.2205,
    longitude: 77.4221,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Ramesh Patel',
    timestamp: '2026-06-25T16:45:00Z',
    votesConfirm: 18,
    votesReject: 2,
    userVoted: null,
    aiConfidence: 91,
    address: 'E-7 Block, near Sector Circle, Arera Colony, Bhopal',
    city: 'Bhopal'
  },
  
  // INDORE ISSUES
  {
    id: 'pothole-indore-1',
    title: 'Severe street degradation on Vijay Nagar road',
    description: 'Asphalt has completely eroded due to heavy rains, forming three consecutive cavernous holes. Vehicles are forced to switch lanes abruptly, disrupting traffic near the C21 Mall crossing.',
    category: 'Pothole',
    status: 'Reported',
    latitude: 22.7480,
    longitude: 75.8950,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Rahul Maheshwari',
    timestamp: '2026-06-26T01:30:00Z',
    votesConfirm: 3,
    votesReject: 0,
    userVoted: null,
    aiConfidence: 92,
    address: 'Vijay Nagar Main Rd, opposite C21 Mall, Indore',
    city: 'Indore'
  },
  {
    id: 'garbage-indore-2',
    title: 'Overflowing commercial bins near Rajwada Palace',
    description: 'Severe accumulation of single-use cups, cardboard boxes, and stale food waste near the tourist entry gates. Creates an eyesore for visitors and is attracting stray cows.',
    category: 'Garbage',
    status: 'Verified',
    latitude: 22.7196,
    longitude: 75.8577,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Divya Joshi',
    timestamp: '2026-06-25T09:45:00Z',
    votesConfirm: 14,
    votesReject: 1,
    userVoted: null,
    aiConfidence: 95,
    address: 'Rajwada Palace Heritage Gate, Indore',
    city: 'Indore'
  },

  // NEW DELHI ISSUES
  {
    id: 'broken-delhi-1',
    title: 'Damaged steel safety barrier in Connaught Place',
    description: 'Heavy steel pedestrian guard railing has been knocked down and twisted, leaving a 15-foot gap where pedestrians could accidentally slip into the deep outer-ring storm drainage channel.',
    category: 'Broken Infrastructure',
    status: 'In Progress',
    latitude: 28.6280,
    longitude: 77.2180,
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Vikram Seth',
    timestamp: '2026-06-24T14:15:00Z',
    votesConfirm: 22,
    votesReject: 0,
    userVoted: null,
    aiConfidence: 97,
    address: 'Block E Outer Circle, Connaught Place, New Delhi',
    city: 'New Delhi'
  },
  {
    id: 'water-delhi-2',
    title: 'Major sprinkler main valve bursting on Shanti Path',
    description: 'High-pressure mainline valve rupture causing water to shoot 15 feet into the air. Green belt lawns are waterlogged and excess water is cascading onto the high-speed transit lane.',
    category: 'Water Leak',
    status: 'Reported',
    latitude: 28.5990,
    longitude: 77.1950,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Priyanka Sen',
    timestamp: '2026-06-26T06:05:00Z',
    votesConfirm: 6,
    votesReject: 1,
    userVoted: null,
    aiConfidence: 91,
    address: 'Shanti Path diplomatic enclave, New Delhi',
    city: 'New Delhi'
  },

  // MUMBAI ISSUES
  {
    id: 'pothole-mumbai-1',
    title: 'Crater-sized pothole on Carter Road promenade',
    description: 'A huge water-filled crater right on the curve of the Bandra promenade road. Highly dangerous for local autos and night-time sports bikes, and splashes seawater onto the walking path.',
    category: 'Pothole',
    status: 'Verified',
    latitude: 19.0600,
    longitude: 72.8220,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Farhan Ansari',
    timestamp: '2026-06-25T18:30:00Z',
    votesConfirm: 35,
    votesReject: 2,
    userVoted: null,
    aiConfidence: 96,
    address: 'Carter Road Promenade, near Cafe Coffee Day curve, Bandra West, Mumbai',
    city: 'Mumbai'
  },
  {
    id: 'water-mumbai-2',
    title: 'Drinking water distribution joint leak near Dadar',
    description: 'Fresh water main line pipe joint leaking severely. Water is bubbling up constantly from the curb, flooding the Dadar station taxi line with stagnant muddy water.',
    category: 'Water Leak',
    status: 'Reported',
    latitude: 19.0175,
    longitude: 72.8425,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Siddharth Shah',
    timestamp: '2026-06-26T03:50:00Z',
    votesConfirm: 8,
    votesReject: 0,
    userVoted: null,
    aiConfidence: 93,
    address: 'Dadar Station East taxi stand, Mumbai',
    city: 'Mumbai'
  },

  // BENGALURU ISSUES
  {
    id: 'garbage-bengaluru-1',
    title: 'Massive illegal commercial pile in Indiranagar',
    description: 'Tons of plastics, styrofoam containers, and packaging cartons dumped on the public walking path behind the Defense Colony wall. Creating massive odor issues for the surrounding neighborhood.',
    category: 'Garbage',
    status: 'Verified',
    latitude: 12.9720,
    longitude: 77.6380,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Anjali Rao',
    timestamp: '2026-06-25T08:10:00Z',
    votesConfirm: 19,
    votesReject: 1,
    userVoted: null,
    aiConfidence: 94,
    address: 'Indiranagar 100 Feet Road, near Defense Colony corner, Bengaluru',
    city: 'Bengaluru'
  },
  {
    id: 'pothole-bengaluru-2',
    title: 'Violent bridge transition potholes on Richmond Flyover',
    description: 'The expansion metal joint on the flyover entrance ramp has degraded, creating a jagged, deep pothole gap that causes severe vehicle alignment shocks and morning slowdowns.',
    category: 'Pothole',
    status: 'In Progress',
    latitude: 12.9630,
    longitude: 77.6010,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80',
    reportedBy: 'Karthik S',
    timestamp: '2026-06-24T10:00:00Z',
    votesConfirm: 29,
    votesReject: 0,
    userVoted: null,
    aiConfidence: 95,
    address: 'Richmond Circle Flyover entry ramp, Bengaluru',
    city: 'Bengaluru'
  }
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('civiclens_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const addToastRef = useRef<(message: string, type: 'success' | 'location' | 'warning' | 'info') => void>(() => {});

  useEffect(() => {
    addToastRef.current = addToast;
  }, [toasts]);

  useEffect(() => {
    localStorage.setItem('civiclens_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // App navigation & UI State
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  
  // Map positioning & captures
  const [mapCenter, setMapCenter] = useState(BHOPAL_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  
  // Custom haptic animation trigger
  const [hapticFlash, setHapticFlash] = useState(false);
  const [isScorecardMinimized, setIsScorecardMinimized] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const profileRef = useRef<UserProfile | null>(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const updateRegionFromCoordsRef = useRef<(lat: number, lng: number) => Promise<void>>(async () => {});

  // Initialize Profile and Issues from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('civiclens_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedIssues = localStorage.getItem('civiclens_issues');
    if (savedIssues) {
      const parsed = JSON.parse(savedIssues);
      const hasIndore = parsed.some((i: any) => i.city === 'Indore');
      if (!hasIndore) {
        localStorage.setItem('civiclens_issues', JSON.stringify(INITIAL_ISSUES));
        setIssues(INITIAL_ISSUES);
      } else {
        setIssues(parsed);
      }
    } else {
      localStorage.setItem('civiclens_issues', JSON.stringify(INITIAL_ISSUES));
      setIssues(INITIAL_ISSUES);
    }
  }, []);

  // Update localStorage when issues list is updated
  const saveIssuesToLocalStorage = (updated: CivicIssue[]) => {
    setIssues(updated);
    localStorage.setItem('civiclens_issues', JSON.stringify(updated));
  };

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'location' | 'warning' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audio synthesis tick to simulate physical mobile haptic feedback
  const playHapticFeedbackTick = (type: 'light' | 'medium' | 'success') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      
      if (type === 'light') {
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'medium') {
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        // High double beep
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(587, ctx.currentTime + 0.08);
        gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        osc2.start(ctx.currentTime + 0.08);
        osc2.stop(ctx.currentTime + 0.16);
      }
    } catch (e) {
      // AudioContext fails gracefully if browser blocks interaction
    }

    // Trigger standard device physical vibration if supported
    if (navigator.vibrate) {
      if (type === 'light') navigator.vibrate(35);
      else if (type === 'medium') navigator.vibrate(60);
      else if (type === 'success') navigator.vibrate([40, 30, 70]);
    }

    // Visual Haptic Flash ripple
    setHapticFlash(true);
    setTimeout(() => setHapticFlash(false), 150);
  };

  // Profile onboarding complete handler
  const handleOnboardingComplete = (newProfile: UserProfile) => {
    playHapticFeedbackTick('success');
    setProfile(newProfile);
    localStorage.setItem('civiclens_profile', JSON.stringify(newProfile));
    
    // Automatically trigger app guide modal on very first login/onboarding!
    setTimeout(() => {
      setShowHelpGuide(true);
    }, 1200);
    
    // Toast setup
    addToast(`Welcome to CivicLens AI, ${newProfile.name}!`, 'success');
  };

  // Profile logout handler
  const handleLogout = () => {
    playHapticFeedbackTick('medium');
    setProfile(null);
    localStorage.removeItem('civiclens_profile');
    addToast('Logged out of CivicLens Ledger.', 'info');
  };

  // Nearby proximity clustering simulation
  const countNearbyIssues = (target: CivicIssue, all: CivicIssue[]) => {
    return all.filter((other) => {
      const latDiff = Math.abs(other.latitude - target.latitude);
      const lngDiff = Math.abs(other.longitude - target.longitude);
      // Roughly 1.5 km threshold for close proximity clustering
      return latDiff < 0.015 && lngDiff < 0.015;
    }).length;
  };

  // Render glowing markers dynamically onto Leaflet map
  const getMarkerIconHTML = (category: IssueCategory, nearbyCount: number) => {
    let color = '#ef4444'; // Pothole
    let emoji = '🔴';
    if (category === 'Garbage') { color = '#10b981'; emoji = '🟢'; }
    else if (category === 'Water Leak') { color = '#3b82f6'; emoji = '🔵'; }
    else if (category === 'Broken Infrastructure') { color = '#f59e0b'; emoji = '🟠'; }

    return `
      <div class="relative custom-marker marker-drop">
        <!-- Pulsing halo -->
        <div class="marker-pulse" style="background-color: ${color}1c; border: 1.5px solid ${color}35"></div>
        <!-- Colored teardrop pin -->
        <div class="marker-pin" style="background-color: ${color}">
          <div class="marker-icon-wrapper text-xs">
            ${emoji}
          </div>
        </div>
        <!-- Slight Proximity Cluster badge indicator -->
        ${nearbyCount > 1 ? `
          <div class="absolute -top-1.5 -right-1.5 bg-slate-800 text-white font-extrabold text-[8px] tracking-wide w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-md animate-bounce">
            ${nearbyCount}
          </div>
        ` : ''}
      </div>
    `;
  };

  // Initialize Map
  useEffect(() => {
    if (!profile || !mapContainerRef.current || mapRef.current) return;

    // Build leaflet map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([mapCenter.lat, mapCenter.lng], 14);

    // Dynamic tiles from CartoDB Positron based on theme
    const activeTileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const tileLayer = L.tileLayer(activeTileUrl, {
      maxZoom: 20
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Custom attribution positioning to keep it clean
    L.control.attribution({
      position: 'bottomleft'
    }).addTo(map);

    mapRef.current = map;

    // Track active map center during drag
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
      updateRegionFromCoordsRef.current?.(center.lat, center.lng);
    });

    return () => {
      if (mapRef.current) {
        // Safely remove markers before destroying the map
        markersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch (e) {
            // ignore
          }
        });
        markersRef.current = [];

        if (userMarkerRef.current) {
          try {
            userMarkerRef.current.remove();
          } catch (e) {
            // ignore
          }
          userMarkerRef.current = null;
        }

        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [profile]);

  // Sync Leaflet Map tile layer with theme
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    tileLayerRef.current.setUrl(theme === 'dark' ? darkUrl : lightUrl);
  }, [theme]);

  // Sync Issues array with Leaflet map markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Reset markers safely
    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (e) {
        // ignore
      }
    });
    markersRef.current = [];

    // Add markers
    issues.forEach((issue) => {
      const nearbyCount = countNearbyIssues(issue, issues);
      const iconHTML = getMarkerIconHTML(issue.category, nearbyCount);

      const markerIcon = L.divIcon({
        html: iconHTML,
        className: 'custom-leaflet-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: markerIcon })
        .addTo(mapRef.current!)
        .on('click', () => {
          playHapticFeedbackTick('light');
          setSelectedIssue(issue);
          setShowReportSheet(false);
          // Auto center slightly offset to accommodate the bottom sheet
          mapRef.current?.setView([issue.latitude - 0.002, issue.longitude], 15, {
            animate: true,
            duration: 0.5
          });
        });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch (e) {
          // ignore
        }
      });
      markersRef.current = [];
    };
  }, [issues, profile]);

  // Trigger fake "Capture My Location"
  const handleUseMyLocation = () => {
    playHapticFeedbackTick('medium');
    setIsLocating(true);
    setSelectedIssue(null);

    // Simulate 1 second precision satellite coordinates lock delay
    setTimeout(() => {
      setIsLocating(false);
      
      // Captured center coordinate (Bhopal region fallback or actual coords if mock-provided)
      const capturedCoords = L.latLng(BHOPAL_COORDS.lat, BHOPAL_COORDS.lng);
      setUserLocation(capturedCoords);

      if (mapRef.current) {
        mapRef.current.setView(capturedCoords, 16, {
          animate: true,
          duration: 0.8
        });

        // Clear existing location marker if any
        if (userMarkerRef.current) {
          try {
            userMarkerRef.current.remove();
          } catch (e) {
            // ignore
          }
          userMarkerRef.current = null;
        }

        // Add user captured blue dot
        const userIcon = L.divIcon({
          html: `
            <div class="relative w-8 h-8 flex items-center justify-center">
              <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div class="absolute inset-1.5 bg-white border border-blue-100 rounded-full shadow-lg" />
              <div class="w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-md z-10" />
            </div>
          `,
          className: 'user-pos-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        userMarkerRef.current = L.marker(capturedCoords, { icon: userIcon }).addTo(mapRef.current);
      }

      playHapticFeedbackTick('success');
      addToast('📍 Location captured & locked', 'location');
    }, 1000);
  };

  // Launch Report form
  const handleOpenReportForm = () => {
    playHapticFeedbackTick('medium');
    setSelectedIssue(null);
    setShowReportSheet(true);
  };

  // Submit new reported issue
  const handleIssueSubmit = (issueData: Partial<CivicIssue>) => {
    const id = `report-${Date.now()}`;
    const newIssue: CivicIssue = {
      ...(issueData as CivicIssue),
      id,
      city: profile?.city || 'Bhopal'
    };

    const updatedIssues = [newIssue, ...issues];
    saveIssuesToLocalStorage(updatedIssues);

    // Update user profile stats
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        reportCount: profile.reportCount + 1,
        trustScore: Math.min(profile.trustScore + 3, 100) // filing a valid AI-confirmed report boosts trust!
      };
      setProfile(updatedProfile);
      localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));
    }

    setShowReportSheet(false);
    
    // Zoom/Center on newly created issue on the map
    if (mapRef.current) {
      mapRef.current.setView([newIssue.latitude, newIssue.longitude], 15, {
        animate: true,
        duration: 0.6
      });
    }

    playHapticFeedbackTick('success');
    addToast('Issue reported successfully!', 'success');
  };

  // Submit community confirmation vote on active issue
  const handleIssueVote = (issueId: string, voteType: 'confirm' | 'reject') => {
    playHapticFeedbackTick('success');

    const updatedIssues = issues.map((issue) => {
      if (issue.id !== issueId) return issue;

      return {
        ...issue,
        userVoted: voteType,
        votesConfirm: voteType === 'confirm' ? issue.votesConfirm + 1 : issue.votesConfirm,
        votesReject: voteType === 'reject' ? issue.votesReject + 1 : issue.votesReject,
        // Upgrade reported issues to verified dynamically if confirms match a standard
        status: (issue.status === 'Reported' && voteType === 'confirm' && (issue.votesConfirm + 1) >= 5) 
                ? 'Verified' 
                : issue.status
      } as CivicIssue;
    });

    saveIssuesToLocalStorage(updatedIssues);

    // Update Selected Issue sheet state
    const current = updatedIssues.find((i) => i.id === issueId);
    if (current) {
      setSelectedIssue(current);
    }

    // Award trust rating score points (+2) to user
    if (profile) {
      const updatedProfile = {
        ...profile,
        trustScore: Math.min(profile.trustScore + 2, 100)
      };
      setProfile(updatedProfile);
      localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));
    }

    addToast('+2 Trust Score earned!', 'success');
  };

  // Show an issue on the map from the dashboard
  const handleShowIssueOnMap = (issue: CivicIssue) => {
    playHapticFeedbackTick('success');
    setShowDashboard(false);
    setSelectedIssue(issue);
    setMapCenter({ lat: issue.latitude, lng: issue.longitude });
    if (mapRef.current) {
      mapRef.current.setView([issue.latitude, issue.longitude], 16);
    }
  };

  const handleCityChange = (cityName: string, lat: number, lng: number) => {
    playHapticFeedbackTick('success');
    
    // Update profile with the selected city
    const updatedProfile = { ...profile!, city: cityName };
    setProfile(updatedProfile);
    localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));

    // Pan map to new city coordinates
    setMapCenter({ lat, lng });
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14, { animate: true, duration: 1.0 });
    }

    addToast(`📍 Location shifted to ${cityName}`, 'success');
  };

  const updateRegionFromCoords = async (lat: number, lng: number) => {
    const currentProfile = profileRef.current;
    if (!currentProfile) return;

    // Calculate distance to all preset cities
    const PRESET_CITIES = [
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
      { name: 'Indore', lat: 22.7196, lng: 75.8577 },
      { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    ];

    let nearestCity = PRESET_CITIES[0];
    let minDistance = Infinity;

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    PRESET_CITIES.forEach(city => {
      const dist = getDistance(lat, lng, city.lat, city.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCity = city;
      }
    });

    // If we are within 50km of a preset city, lock to that preset city
    if (minDistance < 50) {
      if (currentProfile.city !== nearestCity.name) {
        const updatedProfile = { ...currentProfile, city: nearestCity.name };
        setProfile(updatedProfile);
        localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));
        addToast(`📍 Switched Region: ${nearestCity.name} Ledger`, 'success');
        playHapticFeedbackTick('success');
      }
      return;
    }

    // Otherwise, try to reverse geocode using Nominatim API (with a fallback)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const cityName = address.city || address.town || address.village || address.suburb || address.state_district || address.state || 'Unknown Region';
        
        if (currentProfile.city !== cityName) {
          const updatedProfile = { ...currentProfile, city: cityName };
          setProfile(updatedProfile);
          localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));
          addToast(`📍 Switched Region: ${cityName} Ledger`, 'success');
          playHapticFeedbackTick('success');
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding map center:', error);
      const customLabel = `Region (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      if (currentProfile.city !== customLabel) {
        const updatedProfile = { ...currentProfile, city: customLabel };
        setProfile(updatedProfile);
        localStorage.setItem('civiclens_profile', JSON.stringify(updatedProfile));
        addToast(`📍 Region locked to: ${customLabel}`, 'info');
      }
    }
  };

  useEffect(() => {
    updateRegionFromCoordsRef.current = updateRegionFromCoords;
  }, [profile]);

  // Render onboarding screen if user has no completed profile
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Calculate dynamic stats for activeCity
  const activeCityName = profile.city || 'Bhopal';
  const cityIssues = issues.filter(
    (issue) => (issue.city || 'Bhopal').toLowerCase() === activeCityName.toLowerCase()
  );
  const cityTotal = cityIssues.length;
  const cityResolved = cityIssues.filter((i) => i.status === 'Resolved').length;
  const cityInProgress = cityIssues.filter((i) => i.status === 'In Progress' || i.status === 'Verified').length;
  const cityPending = cityIssues.filter((i) => i.status === 'Reported').length;

  // Compute a premium looking "Integrity Score" or "Civic Index"
  const cityIndexScore = cityTotal === 0 ? 100 : Math.round(100 - (cityPending * 12) - (cityInProgress * 5));
  const finalIndexScore = Math.max(35, Math.min(100, cityIndexScore));

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-slate-50 font-sans select-none ${hapticFlash ? 'haptic-flash' : ''}`}>
      
      {/* Dynamic stacked toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Navbar */}
      <Navbar
        profile={profile}
        onProfileClick={() => {
          playHapticFeedbackTick('light');
          setShowProfileModal(true);
        }}
        activeCity={profile.city}
        onDashboardClick={() => {
          playHapticFeedbackTick('light');
          setShowDashboard(true);
        }}
        onCityChange={handleCityChange}
        onHelpClick={() => {
          playHapticFeedbackTick('light');
          setShowHelpGuide(true);
        }}
        theme={theme}
        onThemeToggle={() => {
          playHapticFeedbackTick('light');
          const nextTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(nextTheme);
          addToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'success');
        }}
      />

      {/* FULL-SCREEN LEAFLET MAP ELEMENT */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Active City Ledger Scorecard - Glassmorphism Card */}
      {isScorecardMinimized ? (
        <button
          onClick={() => {
            playHapticFeedbackTick('light');
            setIsScorecardMinimized(false);
          }}
          className="absolute top-24 left-4 md:left-6 z-[1001] pointer-events-auto flex items-center gap-2.5 px-3 py-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-102 active:scale-98 animate-fade-in text-left select-none group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Ledger Index</span>
            <span className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
              {activeCityName}: <span className="text-blue-600">{finalIndexScore}%</span>
            </span>
          </div>
          <div className="p-1 rounded bg-slate-50 text-slate-400 group-hover:text-slate-600 transition-colors ml-1">
            <Maximize2 className="w-3 h-3" />
          </div>
        </button>
      ) : (
        <div className="absolute top-24 left-4 md:left-6 z-[1001] pointer-events-auto flex flex-col gap-3 w-[280px] sm:w-72 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-xl select-none animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
              <h4 className="text-[10px] font-bold text-slate-800 tracking-wider font-display uppercase">
                {activeCityName} Ledger Index
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-100 uppercase tracking-wide">
                Live Audit
              </span>
              <button
                onClick={() => {
                  playHapticFeedbackTick('light');
                  setIsScorecardMinimized(true);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Minimize scorecard"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Big Radial/Meter layout */}
          <div className="flex items-center gap-4 py-1">
            <div className="relative flex items-center justify-center shrink-0">
              {/* SVG circle meter */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-slate-100"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className={`transition-all duration-1000 ${
                    finalIndexScore >= 80 
                      ? 'stroke-emerald-500' 
                      : finalIndexScore >= 60 
                      ? 'stroke-blue-500' 
                      : 'stroke-amber-500'
                  }`}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - finalIndexScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-800 font-display">
                {finalIndexScore}%
              </span>
            </div>

            <div className="flex-1 space-y-0.5 min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Civic Health Index</p>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {finalIndexScore >= 85 
                  ? 'Excellent Welfare' 
                  : finalIndexScore >= 70 
                  ? 'Active Community Guard' 
                  : 'Action Required'}
              </p>
            </div>
          </div>

          {/* Numeric stats row */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-2 text-center bg-slate-50/50 rounded-lg">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total Logs</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{cityTotal}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Pending</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{cityPending}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Resolved</p>
              <p className="text-xs font-bold text-emerald-600 mt-1">{cityResolved}</p>
            </div>
          </div>

          {/* Dynamic tips section */}
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-1.5">
            {cityPending > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-600 font-medium leading-normal">
                  <span className="font-bold text-slate-700">{cityPending} report(s)</span> await peer verification. Tap markers on the map to vote!
                </p>
              </>
            ) : cityTotal > 0 ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-600 font-medium leading-normal">
                  All logged issues verified by community ledger. No active bottlenecks!
                </p>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] text-slate-600 font-medium leading-normal">
                  Perfect Clean Slate! Be the first to report issues in <span className="font-bold text-slate-700">{activeCityName}</span>.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Regions label & floating widgets */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none flex flex-col items-center gap-2">
        <span className="glass-panel px-4 py-2 rounded-full text-[11px] font-bold text-slate-700 shadow-md flex items-center gap-2 border border-slate-100/60 leading-none">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Showing issues near {profile.city}
        </span>
      </div>

      {/* FLOATING ACTION CONTROL WHEEL (BOTTOM RIGHT) */}
      <div className="absolute bottom-6 right-6 z-[1001] flex flex-col gap-3 pointer-events-auto items-end">
        {/* Use My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-100/80 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group shrink-0"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4.5 h-4.5 text-blue-500 animate-spin" />
              <span>Locating Satellite...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4.5 h-4.5 text-rose-500 group-hover:animate-bounce" />
              <span>Use My Location</span>
            </>
          )}
        </button>

        {/* Report Issue Button */}
        <button
          onClick={handleOpenReportForm}
          className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-indigo-200 shadow-blue-500/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* MAP DETAIL OVERLAYS & SHEETS */}
      
      {/* Report Issue Form Panel */}
      {showReportSheet && (
        <ReportIssueSheet
          mapCenter={mapCenter}
          onClose={() => {
            playHapticFeedbackTick('light');
            setShowReportSheet(false);
          }}
          onSubmit={handleIssueSubmit}
          onAddToast={addToast}
          activeCity={profile.city}
        />
      )}

      {/* Issue Detail Info Bottom Sheet */}
      {selectedIssue && (
        <IssueDetailSheet
          issue={selectedIssue}
          onClose={() => {
            playHapticFeedbackTick('light');
            setSelectedIssue(null);
          }}
          onVote={handleIssueVote}
        />
      )}

      {/* Profile Modal Drawer */}
      <ProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => {
          playHapticFeedbackTick('light');
          setShowProfileModal(false);
        }}
        onLogout={handleLogout}
      />

      {/* Audit Ledger Dashboard Drawer */}
      <DashboardDrawer
        issues={issues}
        isOpen={showDashboard}
        onClose={() => {
          playHapticFeedbackTick('light');
          setShowDashboard(false);
        }}
        onShowOnMap={handleShowIssueOnMap}
        activeCity={profile?.city || 'Bhopal'}
      />

      {/* App Guide & Interactive Features Help Modal */}
      <HelpGuideModal
        isOpen={showHelpGuide}
        onClose={() => {
          playHapticFeedbackTick('light');
          setShowHelpGuide(false);
        }}
        playHaptic={(type) => {
          const mappedType = type === 'warning' ? 'medium' : type;
          playHapticFeedbackTick(mappedType);
        }}
      />
    </div>
  );
}
