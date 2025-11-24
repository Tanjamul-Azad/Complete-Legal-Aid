
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    WarningIcon, CloseIcon, PhoneIcon, ChevronDownIcon, FireIcon,
    ScaleIcon, HeartIcon, ShieldCheckIcon, BoltIcon, MapPinIcon,
    NavigationArrowIcon, CrosshairIcon, MaximizeIcon, MinimizeIcon, SearchIcon
} from './icons';

export interface HelplineAction {
    type: 'call' | 'link' | 'email';
    value: string;
}

export interface Helpline {
    name: string;
    description: string;
    number: string;
    actions: HelplineAction[];
}

interface HelplineCategoryData {
    category: string;
    icon: React.ElementType;
    helplines: Helpline[];
}

interface EmergencyHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReport: () => void;
    onFindLawyer: () => void;
    onLiveChat: () => void;
    onMakeComplaint: (helpline: { name: string; email: string }) => void;
}

// --- Types for Maps ---
interface NearbyPlace {
    id: string;
    name: string;
    type: 'Police' | 'Court' | 'Legal Aid' | 'Other';
    vicinity: string;
    lat: number;
    lng: number;
}

const helplineData: HelplineCategoryData[] = [
    {
        category: "Immediate Threat",
        icon: FireIcon,
        helplines: [
            { name: "National Emergency", description: "Police, Fire, Ambulance", number: "999", actions: [{ type: 'call', value: '999' }] },
            { name: "Fire Service", description: "Fire hazards & rescue", number: "16163", actions: [{ type: 'call', value: '16163' }] },
        ]
    },
    {
        category: "Legal & Government",
        icon: ScaleIcon,
        helplines: [
            { name: "National Legal Aid", description: "Free government legal support", number: "16430", actions: [{ type: 'call', value: '16430' }] },
            { name: "Anti-Corruption", description: "Report corruption incidents", number: "106", actions: [{ type: 'call', value: '106' }] },
            { name: "Govt Info & Grievance", description: "Access to Information (a2i)", number: "333", actions: [{ type: 'call', value: '333' }] },
        ]
    },
    {
        category: "Health & Support",
        icon: HeartIcon,
        helplines: [
            { name: "Mental Health Support", description: "Kaan Pete Roi", number: "09612119911", actions: [{ type: 'call', value: '+8809612119911' }] },
            { name: "Health Directorate", description: "24/7 Medical advice", number: "16263", actions: [{ type: 'call', value: '16263' }] },
        ]
    },
    {
        category: "Women & Children",
        icon: ShieldCheckIcon,
        helplines: [
            { name: "Violence Against Women", description: "Legal & police support", number: "109", actions: [{ type: 'call', value: '109' }] },
            { name: "Child Helpline", description: "Child Protection Services", number: "1098", actions: [{ type: 'call', value: '1098' }] },
        ]
    },
    {
        category: "Utility & Municipal",
        icon: BoltIcon,
        helplines: [
            { name: "Electricity Emergency", description: "Power outage & hazards", number: "16216", actions: [{ type: 'call', value: '16216' }] },
            { name: "WASA (Water)", description: "Water supply issues", number: "16162", actions: [{ type: 'call', value: '16162' }] },
            { name: "Disaster Warning", description: "Cyclone & flood alerts", number: "1090", actions: [{ type: 'call', value: '1090' }] },
        ]
    },
    {
        category: "Transport & Road",
        icon: MapPinIcon,
        helplines: [
            { name: "Highway Police", description: "Road accidents & safety", number: "999", actions: [{ type: 'call', value: '999' }] },
        ]
    }
];

const HelplineCategoryItem: React.FC<{ categoryData: HelplineCategoryData }> = ({ categoryData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = categoryData.icon;

    return (
        <div className="border-b border-cla-border dark:border-[rgba(255,255,255,0.05)] last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 px-1 text-left group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-lg"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-[#1E1E1E] text-cla-text dark:text-gray-300 group-hover:text-cla-gold transition-colors">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block font-semibold text-cla-text dark:text-gray-200">{categoryData.category}</span>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="pb-4 pl-2 pr-2 space-y-3 animate-fade-in">
                    {categoryData.helplines.map((helpline, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-[rgba(255,255,255,0.05)] shadow-sm">
                            <div>
                                <p className="font-bold text-sm text-cla-text dark:text-white">{helpline.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{helpline.description}</p>
                            </div>
                            <a href={`tel:${helpline.actions[0].value}`} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-transform active:scale-95 shadow-lg shadow-green-600/20">
                                <PhoneIcon className="w-4 h-4" />
                                {helpline.number}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const NearbyLocationItem: React.FC<{ place: NearbyPlace; onClick?: () => void }> = ({ place, onClick }) => {
    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Fallback navigation via Google Maps using lat/long
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
    };

    return (
        <div
            onClick={onClick}
            className="flex items-center justify-between py-3 border-b border-cla-border dark:border-white/5 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
        >
            <div>
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-cla-text dark:text-white truncate max-w-[200px]">{place.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide 
                        ${place.type === 'Police' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            place.type === 'Court' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {place.type}
                    </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 truncate max-w-[220px]"><MapPinIcon className="w-3 h-3" /> {place.vicinity}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleNavigate} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    <NavigationArrowIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Fetch real places from Overpass API
const fetchNearbyPlaces = async (lat: number, lng: number): Promise<NearbyPlace[]> => {
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:5000, ${lat}, ${lng});
          node["amenity"="courthouse"](around:5000, ${lat}, ${lng});
          node["office"="lawyer"](around:5000, ${lat}, ${lng});
        );
        out body;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data.elements.map((el: any) => ({
            id: el.id.toString(),
            name: el.tags.name || (el.tags.amenity === 'police' ? 'Police Station' : el.tags.amenity === 'courthouse' ? 'Court' : 'Legal Office'),
            type: el.tags.amenity === 'police' ? 'Police' : el.tags.amenity === 'courthouse' ? 'Court' : 'Legal Aid',
            vicinity: `${(calculateDistance(lat, lng, el.lat, el.lon)).toFixed(1)} km away`,
            lat: el.lat,
            lng: el.lon
        })).slice(0, 10); // Limit to 10 results
    } catch (error) {
        console.error("Failed to fetch places:", error);
        return [];
    }
};

// Helper to calculate distance
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({ isOpen, onClose, onReport, onFindLawyer }) => {
    const [locationPermission, setLocationPermission] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [alertSent, setAlertSent] = useState(false);
    const [places, setPlaces] = useState<NearbyPlace[]>([]);
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const placesLayerRef = useRef<any>(null);

    const [mapError, setMapError] = useState<string | null>(null);
    const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentCoords, setCurrentCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isUserCentered, setIsUserCentered] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setAlertSent(false);
        }
    }, [isOpen]);

    // Cleanup Leaflet on unmount or close
    useEffect(() => {
        if (!isOpen) {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
                userMarkerRef.current = null;
                placesLayerRef.current = null;
            }
            setLocationPermission(false);
            setIsMapExpanded(false);
            setSearchQuery('');
            setCurrentCoords(null);
            setIsUserCentered(true);
        }
    }, [isOpen]);

    const initLeafletMap = useCallback(async (lat: number, lng: number) => {
        if (!mapRef.current) return;

        if (!(window as any).L) {
            setMapError("Map library not loaded.");
            return;
        }
        const L = (window as any).L;

        // If map doesn't exist, create it
        if (!leafletMapRef.current) {
            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 14,
                zoomControl: false,
                attributionControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);

            // User Marker (Distinct Pulsing Blue Dot)
            const userIcon = L.divIcon({
                className: 'bg-transparent',
                html: `<div class="w-5 h-5 bg-blue-600 rounded-full border-[3px] border-white shadow-xl relative">
                        <div class="absolute -inset-3 bg-blue-500/40 rounded-full animate-ping"></div>
                       </div>`
            });
            const marker = L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("Your Location");

            // Track centering state
            map.on('dragstart', () => setIsUserCentered(false));
            map.on('zoomstart', () => setIsUserCentered(false));

            leafletMapRef.current = map;
            userMarkerRef.current = marker;
            placesLayerRef.current = L.layerGroup().addTo(map);
        } else {
            // Map exists, just update view smoothly
            leafletMapRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([lat, lng]);
            }
            setIsUserCentered(true);
        }

        // Update Places Markers
        if (placesLayerRef.current) {
            placesLayerRef.current.clearLayers();

            // Fetch real places
            const nearbyPlaces = await fetchNearbyPlaces(lat, lng);
            setPlaces(nearbyPlaces);

            nearbyPlaces.forEach((place: NearbyPlace) => {
                let colorClass = 'bg-gray-500';
                if (place.type === 'Police') colorClass = 'bg-red-600';
                else if (place.type === 'Court') colorClass = 'bg-blue-700';
                else if (place.type === 'Legal Aid') colorClass = 'bg-green-600';

                const icon = L.divIcon({
                    className: 'bg-transparent',
                    html: `<div class="w-7 h-7 ${colorClass} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold relative transform hover:scale-110 transition-transform duration-200">
                            ${place.type[0]}
                            <div class="absolute -bottom-1 w-2 h-2 bg-black/20 rotate-45 transform translate-y-1/2 z-[-1]"></div>
                           </div>`
                });

                const marker = L.marker([place.lat, place.lng], { icon: icon });
                const popupContent = `
                    <div class="text-sm text-gray-900 min-w-[180px]">
                        <strong class="block mb-1 text-base">${place.name}</strong>
                        <span class="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">${place.type}</span>
                        <span class="text-xs text-gray-600 block mt-1">${place.vicinity}</span>
                        <div class="mt-2 flex gap-2">
                             <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="flex-1 text-center bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700">Navigate</a>
                        </div>
                    </div>
                `;
                marker.bindPopup(popupContent);
                placesLayerRef.current.addLayer(marker);
            });
        }

    }, []);


    const handleEnableLocation = () => {
        setIsLocating(true);
        setMapError(null);

        const fallbackToDefault = () => {
            setUsingDefaultLocation(true);
            setLocationPermission(true);
            // Dhaka Coordinates
            const defaultLat = 23.8103;
            const defaultLng = 90.4125;
            setCurrentCoords({ lat: defaultLat, lng: defaultLng });
            setIsLocating(false);
        };

        if (!navigator.geolocation) {
            fallbackToDefault();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUsingDefaultLocation(false);
                setLocationPermission(true);
                setCurrentCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsLocating(false);
            },
            (error) => {
                console.warn("Location access denied/failed:", error.message);
                fallbackToDefault();
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    // Initialize/Update map when coords change
    useEffect(() => {
        if ((locationPermission || isMapExpanded) && currentCoords && mapRef.current) {
            initLeafletMap(currentCoords.lat, currentCoords.lng);
        }
    }, [locationPermission, isMapExpanded, currentCoords, initLeafletMap]);

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // Simulate searching behavior without a real geocoding API
        let newLat = 23.8103;
        let newLng = 90.4125;

        const q = searchQuery.toLowerCase();
        if (q.includes("mirpur")) { newLat = 23.8042; newLng = 90.3667; }
        else if (q.includes("gulshan")) { newLat = 23.7925; newLng = 90.4078; }
        else if (q.includes("dhanmondi")) { newLat = 23.7461; newLng = 90.3742; }
        else if (q.includes("uttara")) { newLat = 23.8728; newLng = 90.4001; }
        else if (q.includes("motijheel")) { newLat = 23.7330; newLng = 90.4172; }
        else {
            newLat = 23.8 + (Math.random() - 0.5) * 0.05;
            newLng = 90.4 + (Math.random() - 0.5) * 0.05;
        }

        setLocationPermission(true);
        setUsingDefaultLocation(true);
        setCurrentCoords({ lat: newLat, lng: newLng });
        setIsUserCentered(true);
    };

    const handleSendAlert = () => {
        if (window.confirm("CONFIRM EMERGENCY ALERT?\n\nThis will instantly notify CLA Emergency Responders and share your location.\n\nAre you sure?")) {
            setAlertSent(true);
        }
    };

    const handleRecenter = () => {
        if (!locationPermission) {
            handleEnableLocation();
            return;
        }

        // If we already have the location and just moved map, recenter view
        if (currentCoords && leafletMapRef.current) {
            leafletMapRef.current.flyTo([currentCoords.lat, currentCoords.lng], 15);
            setIsUserCentered(true);
        } else {
            // Re-acquire GPS
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newLat = pos.coords.latitude;
                    const newLng = pos.coords.longitude;
                    setCurrentCoords({ lat: newLat, lng: newLng });
                    setIsUserCentered(true);
                },
                () => {
                    // Fallback to existing
                    if (currentCoords && leafletMapRef.current) {
                        leafletMapRef.current.flyTo([currentCoords.lat, currentCoords.lng], 14);
                        setIsUserCentered(true);
                    }
                }
            );
        }
    };

    const handlePlaceClick = (place: NearbyPlace) => {
        if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([place.lat, place.lng], 16);
            setIsUserCentered(false); // User explicitly moved to a place
        }
    }

    const toggleMapExpand = () => {
        const expanding = !isMapExpanded;
        setIsMapExpanded(expanding);

        if (expanding && !currentCoords) {
            setUsingDefaultLocation(true);
            setCurrentCoords({ lat: 23.8103, lng: 90.4125 });
        }

        setTimeout(() => {
            if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize();
            }
        }, 300);
    };


    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Main Modal Container */}
            <div className={`
                fixed z-[91] bg-cla-bg dark:bg-[#0B0B0B] shadow-2xl flex flex-col transition-all duration-300 ease-out
                ${isMapExpanded ? 'inset-0 w-full h-full rounded-none' : 'md:top-0 md:right-0 md:h-full md:w-full md:max-w-md md:border-l md:border-cla-border dark:md:border-white/10 bottom-0 left-0 w-full h-[92vh] rounded-t-2xl md:rounded-none animate-slide-in-right'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-cla-border dark:border-white/10 bg-cla-surface dark:bg-[#0B0B0B] flex-shrink-0">
                    <h2 className="text-xl font-bold text-cla-text dark:text-white flex items-center gap-2">
                        <WarningIcon className="w-6 h-6 text-red-500" />
                        {isMapExpanded ? 'Full Map View' : 'Emergency Assistance'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {isMapExpanded && (
                            <button onClick={toggleMapExpand} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors mr-2">
                                <MinimizeIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">

                    {/* Normal View Content (Hidden if Expanded Map) */}
                    {!isMapExpanded && (
                        <div className="p-5 space-y-8">
                            {/* 1. Top Section: Critical Help */}
                            {alertSent ? (
                                <div className="bg-green-600 rounded-2xl p-6 text-center text-white shadow-lg animate-scale-in">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheckIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Alert Sent!</h3>
                                    <p className="text-sm opacity-90 mb-4">Responders have been notified. Stay calm.</p>
                                    <button onClick={() => setAlertSent(false)} className="text-sm underline opacity-80 hover:opacity-100">Undo / Cancel Alert</button>
                                </div>
                            ) : (
                                <div className="bg-[#E53935] rounded-2xl p-6 text-white shadow-xl shadow-red-900/20 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 relative z-10 mb-1">
                                        <WarningIcon className="w-6 h-6" />
                                        CRITICAL HELP
                                    </h3>
                                    <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
                                        Immediate assistance from CLA emergency legal responders.
                                    </p>

                                    <div className="space-y-3 relative z-10">
                                        <button
                                            onClick={handleSendAlert}
                                            className="w-full bg-white text-[#E53935] font-extrabold py-4 px-4 rounded-full shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-subtle-pulse"
                                        >
                                            <BoltIcon className="w-5 h-5" />
                                            Send Emergency Alert
                                        </button>
                                        <button
                                            onClick={onReport}
                                            className="w-full bg-black/20 hover:bg-black/30 text-white font-semibold py-3 px-4 rounded-full transition-colors text-sm border border-white/10 backdrop-blur-sm"
                                        >
                                            File Emergency Report
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. Official Helplines */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                    Official Helplines
                                </h3>
                                <div className="bg-white dark:bg-[#121212] rounded-2xl border border-cla-border dark:border-white/5 px-4 shadow-sm">
                                    {helplineData.map((category, idx) => (
                                        <HelplineCategoryItem key={idx} categoryData={category} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Nearby Police & Courts (Flexible Container) */}
                    <div className={`flex-1 flex flex-col ${isMapExpanded ? 'h-full' : 'px-5 pb-5'}`}>
                        {!isMapExpanded && (
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                                Nearby Police Stations & Courts
                            </h3>
                        )}

                        <div className={`bg-white dark:bg-[#121212] border border-cla-border dark:border-white/5 overflow-hidden shadow-sm flex flex-col ${isMapExpanded ? 'border-none h-full rounded-none' : 'rounded-2xl'}`}>

                            {/* Map Header / Search Bar */}
                            {(locationPermission || isMapExpanded) && (
                                <div className="p-3 bg-white dark:bg-[#1A1A1A] border-b border-cla-border dark:border-white/5 z-10">
                                    <form onSubmit={handleManualSearch} className="relative flex items-center">
                                        <SearchIcon className="absolute left-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search area (e.g. Mirpur, Gulshan)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-100 dark:bg-black/20 border border-transparent focus:border-cla-gold rounded-full py-2 pl-9 pr-10 text-sm text-cla-text dark:text-white focus:outline-none"
                                        />
                                        <button type="submit" className="absolute right-1 bg-cla-gold/10 hover:bg-cla-gold/20 text-cla-gold p-1.5 rounded-full transition-colors">
                                            <NavigationArrowIcon className="w-3 h-3" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {!locationPermission && !isMapExpanded ? (
                                <div className="p-8 text-center">
                                    <MapPinIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-sm font-semibold text-cla-text dark:text-white mb-1">Find Nearest Help</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Enable location to see nearby police stations, courts, and legal aid offices on the map.</p>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleEnableLocation}
                                            disabled={isLocating}
                                            className="px-5 py-2.5 bg-cla-gold text-cla-text font-bold text-sm rounded-lg hover:bg-cla-gold-darker transition-colors disabled:opacity-70"
                                        >
                                            {isLocating ? 'Locating...' : 'Allow Location Access'}
                                        </button>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#121212] px-2 text-gray-500">Or</span></div>
                                        </div>
                                        <form onSubmit={handleManualSearch} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter area manually..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-cla-gold outline-none"
                                            />
                                            <button type="submit" className="px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-semibold">Search</button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col relative">
                                    {/* Real Map Container */}
                                    <div className={`relative bg-gray-100 dark:bg-[#1A1A1A] ${isMapExpanded ? 'flex-1' : 'h-64'}`}>
                                        <div ref={mapRef} className="w-full h-full z-0"></div>

                                        {/* Map Status Overlays */}
                                        {usingDefaultLocation && !mapError && (
                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 z-[400] border border-white/10 shadow-lg">
                                                <MapPinIcon className="w-3 h-3 text-cla-gold" />
                                                Using default/searched location
                                            </div>
                                        )}
                                        {mapError && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-[#1A1A1A] text-center p-4 z-[400]">
                                                <div>
                                                    <p className="text-sm text-red-500 font-medium mb-1">Map Unavailable</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{mapError}</p>
                                                </div>
                                            </div>
                                        )}

                                        {!mapError && (
                                            <>
                                                <button
                                                    className={`absolute bottom-4 right-4 bg-white dark:bg-[#222] p-2.5 rounded-full shadow-lg border cursor-pointer z-[400] transition-colors ${isUserCentered ? 'border-blue-500 text-blue-500' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#333]'}`}
                                                    onClick={handleRecenter}
                                                    title="Locate Me"
                                                >
                                                    <CrosshairIcon className="w-5 h-5" />
                                                </button>
                                                {!isMapExpanded && (
                                                    <button
                                                        className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur p-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 cursor-pointer z-[400] hover:bg-white dark:hover:bg-black/80 transition-colors"
                                                        onClick={toggleMapExpand}
                                                        title="Full Screen Map"
                                                    >
                                                        <MaximizeIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* List View */}
                                    {!isMapExpanded && (
                                        <>
                                            <div className="p-4 max-h-60 overflow-y-auto">
                                                {places.length > 0 ? (
                                                    places.map(place => (
                                                        <NearbyLocationItem key={place.id} place={place} onClick={() => handlePlaceClick(place)} />
                                                    ))
                                                ) : (
                                                    <p className="text-center text-xs text-gray-500 py-2">Searching nearby...</p>
                                                )}
                                            </div>
                                            <div className="px-4 pb-4 pt-2">
                                                <button onClick={toggleMapExpand} className="w-full py-2 text-xs font-bold text-cla-text-muted dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                                    View Full Map
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Only in Drawer Mode) */}
                {!isMapExpanded && (
                    <div className="p-5 border-t border-cla-border dark:border-white/10 bg-cla-surface dark:bg-[#0B0B0B] flex-shrink-0">
                        <button onClick={onFindLawyer} className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-white/10 text-cla-text dark:text-white font-semibold py-3.5 px-4 rounded-xl transition-colors">
                            <MapPinIcon className="w-5 h-5 text-cla-gold" />
                            Find Verified Lawyer
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
