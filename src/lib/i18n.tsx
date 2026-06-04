'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const translations = {
    en: {
        // Nav
        dashboard: 'Dashboard',
        drivers: 'Drivers',
        documents: 'Documents',
        rides: 'Rides',
        earnings: 'Earnings',
        settings: 'Settings',
        signOut: 'Sign out',
        adminConsole: 'Admin Console',

        // Dashboard
        systemStatus: 'System Status',
        totalDrivers: 'TOTAL DRIVERS',
        onlineDrivers: 'ONLINE DRIVERS',
        totalRides: 'TOTAL RIDES',
        activeRides: 'ACTIVE RIDES',
        recentRides: 'Recent Rides',
        driverOverview: 'Driver Overview',
        approvedDrivers: 'Approved Drivers',
        pendingReview: 'Pending Review',
        onlineNow: 'Online Now',
        completedRides: 'Completed Rides',
        cancelledRides: 'Cancelled Rides',
        pendingApproval: 'pending approval',
        activeRightNow: 'Active right now',
        completed: 'completed',
        inProgressNow: 'In progress now',
        noRidesYet: 'No rides yet',
        total: 'total',
        uptime: 'Uptime',

        // Drivers
        manage: 'Manage and review driver accounts',
        all: 'All',
        approved: 'Approved',
        pending: 'Pending',
        rejected: 'Rejected',
        searchDrivers: 'Search drivers...',
        driver: 'Driver',
        status: 'Status',
        approval: 'Approval',
        rating: 'Rating',
        joined: 'Joined',
        approve: 'Approve',
        reject: 'Reject',
        view: 'View',
        noDriversFound: 'No drivers found',
        rejectDriver: 'Reject Driver',
        rejectMsg: 'Rejecting will prevent them from going online.',
        reason: 'Reason (optional)',
        reasonPlaceholder: 'e.g. Incomplete documents...',
        cancel: 'Cancel',
        online: 'Online',
        offline: 'Offline',
        onTrip: 'On Trip',


        // Documents
        documentReview: 'Document Review',
        pendingReviewDesc: 'documents pending review',
        allCaughtUp: 'All caught up!',
        noDocsPending: 'No documents pending review',
        idFront: 'ID Front',
        idBack: 'ID Back',
        licFront: 'Lic. Front',
        licBack: 'Lic. Back',
        carFront: 'Car Front',
        carBack: 'Car Back',
        photo: 'Photo',
        rejectDocs: 'Reject Documents',

        // Rides
        monitorRides: 'Monitor all ride activity',
        searching: 'Searching',
        assigned: 'Assigned',
        inProgress: 'In Progress',
        cancelled: 'Cancelled',
        noDriver: 'No Driver',
        passenger: 'Passenger',
        distance: 'Distance',
        fare: 'Fare',
        date: 'Date',
        noRidesFound: 'No rides found',

        // Earnings
        revenueOverview: 'Driver revenue overview',
        totalEarnings: 'TOTAL EARNINGS',
        todayRevenue: "TODAY'S REVENUE",
        totalTrips: 'TOTAL TRIPS',
        topDrivers: 'Top Drivers by Earnings',
        searchDriver: 'Search driver...',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        allTime: 'All Time',
        trips: 'Trips',
        allTimeLower: 'All time',
        acrossAll: 'Across all drivers',
        completedLower: 'Completed',

        // Settings
        manageAccount: 'Manage your account and preferences',
        profile: 'PROFILE',
        changePassword: 'CHANGE PASSWORD',
        currentPass: 'Current Password',
        newPass: 'New Password',
        confirmPass: 'Confirm New Password',
        updatePassword: 'Update Password',
        apiConfig: 'API CONFIGURATION',
        backendURL: 'Backend URL',
        version: 'Version',
        environment: 'Environment',
        development: 'Development',

        // Common
        back: 'Back',
        noName: '— No name —',
        noDocsYet: 'No documents uploaded yet',

        //analytics
        byDay: 'Rides by Day',
        statusGroups: 'Rides by Status',
        byMonth: 'Revenue by Month',
        driverGrowth: 'Driver Growth by Month',


        analytics: 'Analytics',
        exportCSV: 'Export CSV',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications yet',

        // Live Ops / Control room
        liveOps: 'Live Ops',
        controlRoom: 'Control Room',
        controlRoomDesc: 'Real-time fleet, dispatch and incidents',
        liveMap: 'Live Map',
        activeRidesNow: 'Active Rides',
        dispatchQueue: 'Dispatch Queue',
        socketConnections: 'Socket Connections',
        onlineDriversShort: 'Online Drivers',
        completedToday: 'Completed Today',
        awaitingPayment: 'Awaiting Payment',
        systemAlerts: 'System Alerts',
        noAlerts: 'No active alerts — all systems normal',
        driversOnMap: 'drivers online',
        cancelRide: 'Cancel ride',
        cancelRideConfirm: 'Cancel this ride?',
        noActiveRides: 'No active rides right now',
        scheduledRidesTitle: 'Scheduled Rides',
        noScheduledRidesOps: 'No upcoming scheduled rides',
        scheduledFor: 'Scheduled for',
        scheduledKpi: 'Scheduled',
        refresh: 'Refresh',
        loadingMap: 'Loading map…',
        opsHealthy: 'All systems normal',
        opsDegraded: 'Degraded',
        opsDown: 'System down',
    },

    ar: {
        // Nav
        dashboard: 'الرئيسية',
        drivers: 'السائقون',
        documents: 'الوثائق',
        rides: 'الرحلات',
        earnings: 'الأرباح',
        settings: 'الإعدادات',
        signOut: 'تسجيل الخروج',
        adminConsole: 'لوحة التحكم',

        // Dashboard
        systemStatus: 'حالة النظام',
        totalDrivers: 'إجمالي السائقين',
        onlineDrivers: 'السائقون المتاحون',
        totalRides: 'إجمالي الرحلات',
        activeRides: 'الرحلات النشطة',
        recentRides: 'آخر الرحلات',
        driverOverview: 'نظرة عامة على السائقين',
        approvedDrivers: 'السائقون المعتمدون',
        pendingReview: 'في انتظار المراجعة',
        onlineNow: 'متاح الآن',
        completedRides: 'الرحلات المكتملة',
        cancelledRides: 'الرحلات الملغية',
        pendingApproval: 'في انتظار الموافقة',
        activeRightNow: 'نشط الآن',
        completed: 'مكتملة',
        inProgressNow: 'جارية الآن',
        noRidesYet: 'لا توجد رحلات بعد',
        total: 'الإجمالي',
        uptime: 'وقت التشغيل',

        // Drivers
        manage: 'إدارة ومراجعة حسابات السائقين',
        all: 'الكل',
        approved: 'معتمد',
        pending: 'معلّق',
        rejected: 'مرفوض',
        searchDrivers: 'ابحث عن سائق...',
        driver: 'السائق',
        status: 'الحالة',
        approval: 'الاعتماد',
        rating: 'التقييم',
        joined: 'تاريخ الانضمام',
        approve: 'اعتماد',
        reject: 'رفض',
        view: 'عرض',
        noDriversFound: 'لا يوجد سائقون',
        rejectDriver: 'رفض السائق',
        rejectMsg: 'سيمنع الرفض السائق من العمل.',
        reason: 'السبب (اختياري)',
        reasonPlaceholder: 'مثال: وثائق غير مكتملة...',
        cancel: 'إلغاء',
        online: 'متاح',
        offline: 'غير متاح',
        onTrip: 'في رحلة',

        // Documents
        documentReview: 'مراجعة الوثائق',
        pendingReviewDesc: 'وثيقة في انتظار المراجعة',
        allCaughtUp: 'تمت المراجعة!',
        noDocsPending: 'لا توجد وثائق معلّقة',
        idFront: 'الهوية (أمام)',
        idBack: 'الهوية (خلف)',
        licFront: 'الرخصة (أمام)',
        licBack: 'الرخصة (خلف)',
        carFront: 'السيارة (أمام)',
        carBack: 'السيارة (خلف)',
        photo: 'الصورة الشخصية',
        rejectDocs: 'رفض الوثائق',

        // Rides
        monitorRides: 'متابعة جميع الرحلات',
        searching: 'جاري البحث',
        assigned: 'تم التعيين',
        inProgress: 'جارية',
        cancelled: 'ملغية',
        noDriver: 'لا يوجد سائق',
        passenger: 'الراكب',
        distance: 'المسافة',
        fare: 'الأجرة',
        date: 'التاريخ',
        noRidesFound: 'لا توجد رحلات',

        // Earnings
        revenueOverview: 'نظرة عامة على إيرادات السائقين',
        totalEarnings: 'إجمالي الأرباح',
        todayRevenue: 'إيرادات اليوم',
        totalTrips: 'إجمالي الرحلات',
        topDrivers: 'أفضل السائقين بالأرباح',
        searchDriver: 'ابحث عن سائق...',
        today: 'اليوم',
        thisWeek: 'هذا الأسبوع',
        thisMonth: 'هذا الشهر',
        allTime: 'الإجمالي',
        trips: 'رحلة',
        allTimeLower: 'منذ البداية',
        acrossAll: 'لجميع السائقين',
        completedLower: 'مكتملة',

        // Settings
        manageAccount: 'إدارة حسابك وتفضيلاتك',
        profile: 'الملف الشخصي',
        changePassword: 'تغيير كلمة المرور',
        currentPass: 'كلمة المرور الحالية',
        newPass: 'كلمة المرور الجديدة',
        confirmPass: 'تأكيد كلمة المرور',
        updatePassword: 'تحديث كلمة المرور',
        apiConfig: 'إعدادات الـ API',
        backendURL: 'رابط الخادم',
        version: 'الإصدار',
        environment: 'البيئة',
        development: 'تطوير',

        // Common
        back: 'رجوع',
        noName: '— بدون اسم —',
        noDocsYet: 'لم يتم رفع وثائق بعد',
        //analytics
        byDay: 'Rides by Day',
        statusGroups: 'Rides by Status',
        byMonth: 'Revenue by Month',
        driverGrowth: 'Driver Growth by Month',


        analytics: 'التحليلات',
        exportCSV: 'تصدير CSV',
        markAllRead: 'قراءة الكل',
        noNotifications: 'لا توجد إشعارات',

        // Live Ops / Control room
        liveOps: 'العمليات الحية',
        controlRoom: 'غرفة العمليات',
        controlRoomDesc: 'الأسطول والتوزيع والحوادث لحظياً',
        liveMap: 'الخريطة الحية',
        activeRidesNow: 'الرحلات النشطة',
        dispatchQueue: 'طابور التوزيع',
        socketConnections: 'اتصالات Socket',
        onlineDriversShort: 'سائقون متصلون',
        completedToday: 'مكتملة اليوم',
        awaitingPayment: 'بانتظار الدفع',
        systemAlerts: 'تنبيهات النظام',
        noAlerts: 'لا تنبيهات نشطة — كل الأنظمة طبيعية',
        driversOnMap: 'سائق متصل',
        cancelRide: 'إلغاء الرحلة',
        cancelRideConfirm: 'إلغاء هذه الرحلة؟',
        noActiveRides: 'لا توجد رحلات نشطة حالياً',
        scheduledRidesTitle: 'الرحلات المجدولة',
        noScheduledRidesOps: 'لا توجد رحلات مجدولة قادمة',
        scheduledFor: 'موعد الرحلة',
        scheduledKpi: 'مجدولة',
        refresh: 'تحديث',
        loadingMap: 'جاري تحميل الخريطة…',
        opsHealthy: 'كل الأنظمة طبيعية',
        opsDegraded: 'متدهور',
        opsDown: 'النظام معطّل',
    },
};

type Lang = 'en' | 'ar';
type T = typeof translations.en;

interface I18nContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: T;
    isAr: boolean;
}

const I18nContext = createContext<I18nContextType>({
    lang: 'en',
    setLang: () => { },
    t: translations.en,
    isAr: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('en');

    useEffect(() => {
        const saved = localStorage.getItem('lang') as Lang | null;
        if (saved === 'ar' || saved === 'en') {
            setLangState(saved);
            document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = saved;
        }
    }, []);

    function setLang(l: Lang) {
        setLangState(l);
        localStorage.setItem('lang', l);
        document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = l;
    }

    return (
        <I18nContext.Provider value={{
            lang,
            setLang,
            t: translations[lang],
            isAr: lang === 'ar',
        }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}