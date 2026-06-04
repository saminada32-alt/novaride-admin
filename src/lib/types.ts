export type DriverStatus = 'online' | 'offline' | 'on_trip';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AdminRole = 'SUPERADMIN' | 'ADMIN' | 'SUPPORT';
export type VehicleType = 'car' | 'motorcycle' | 'van';
export type RideStatus =
    | 'SCHEDULED'
    | 'SEARCHING'
    | 'DRIVER_ASSIGNED'
    | 'DRIVER_ARRIVED'
    | 'PASSENGER_ONBOARD'
    | 'TRIP_STARTED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_DRIVER_FOUND';

export interface Admin {
    id: number;
    email: string;
    role: AdminRole;
    createdAt: string;
}

export interface Driver {
    id: number;
    phone: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    licenseCountry?: string;
    nationalId?: string;
    isCompany: boolean;
    companyName?: string;
    companyAddress?: string;
    rating: number;
    isAvailable: boolean;
    isApproved: boolean;
    isRejected: boolean;
    rejectionReason?: string;
    approvedAt?: string;
    status: DriverStatus;
    createdAt: string;
    currentRideId?: number | null;
}

export interface Vehicle {
    id: number;
    type: VehicleType;
    plateNumber: string;
    manufactureYear: number;
    color: string;
    brand?: string;
    model?: string;
    passengerCount?: number;
}

export interface DriverDocument {
    id: number;
    idFront?: string;
    idBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    vehicleFront?: string;
    vehicleBack?: string;
    driverPhoto?: string;
    reviewStatus: ReviewStatus;
    rejectionReason?: string;
    createdAt: string;
    driver: Driver;
}

export interface Ride {
    id: number;
    passenger?: { id: number; phone: string; firstName?: string; lastName?: string; name?: string };
    driver?: { id: number; phone: string; firstName?: string; lastName?: string };
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    pickupAddress?: string;
    dropoffAddress?: string;
    estimatedDistanceKm: number;
    estimatedFare: number;
    originalFare?: number;
    discountAmount?: number;
    promoCode?: string;
    etaMinutes?: number;
    status: RideStatus;
    vehicleType?: string;
    paymentMethod?: 'cash' | 'sham_cash';
    paymentReference?: string;
    paymentConfirmedAt?: string;
    shamCashReference?: string;
    cancelReason?: string;
    scheduledAt?: string;
    createdAt: string;
    completedAt?: string;
}

export interface EarningDashboard {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
    trips: number;
}