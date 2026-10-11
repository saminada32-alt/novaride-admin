/** Single source of truth for the sidebar and every page's header description. */

export type BadgeKey =
    | 'pendingDrivers'
    | 'walletTopups'
    | 'payouts'
    | 'shamCash'
    | 'complaints';

export interface NavItem {
    href: string;
    ar: string;
    en: string;
    descAr: string;
    descEn: string;
    badge?: BadgeKey;
}

export interface NavGroup {
    id: string;
    ar: string;
    en: string;
    items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
    {
        id: 'overview',
        ar: 'نظرة عامة',
        en: 'Overview',
        items: [
            {
                href: '/dashboard',
                ar: 'الرئيسية',
                en: 'Home',
                descAr: 'ملخص التشغيل اليوم وأهم الأمور التي تحتاج قرارك',
                descEn: 'Today at a glance and what needs your decision',
            },
            {
                href: '/analytics',
                ar: 'التحليلات',
                en: 'Analytics',
                descAr: 'نمو الرحلات والإيرادات عبر الزمن',
                descEn: 'Ride and revenue growth over time',
            },
        ],
    },
    {
        id: 'operations',
        ar: 'العمليات المباشرة',
        en: 'Live Operations',
        items: [
            {
                href: '/live-ops',
                ar: 'غرفة العمليات',
                en: 'Control Room',
                descAr: 'السائقون والرحلات النشطة على الخريطة لحظة بلحظة',
                descEn: 'Active drivers and rides on the map, in real time',
            },
            {
                href: '/rides',
                ar: 'الرحلات',
                en: 'Rides',
                descAr: 'كل الرحلات وحالاتها مع البحث والتفاصيل',
                descEn: 'Every ride and its status, with search and details',
            },
            {
                href: '/safety-sos',
                ar: 'طوارئ SOS',
                en: 'SOS Desk',
                descAr: 'بلاغات الطوارئ التي تحتاج تدخلاً فورياً',
                descEn: 'Emergency alerts that need immediate action',
            },
        ],
    },
    {
        id: 'people',
        ar: 'السائقون والركاب',
        en: 'Drivers & Riders',
        items: [
            {
                href: '/drivers',
                ar: 'السائقون',
                en: 'Drivers',
                descAr: 'كل السائقين، وطلبات الانضمام الجديدة للقبول أو الرفض',
                descEn: 'All drivers, plus new applications to approve or reject',
                badge: 'pendingDrivers',
            },
            {
                href: '/documents',
                ar: 'مستندات السائقين',
                en: 'Driver Documents',
                descAr: 'مراجعة الهوية والرخصة وصور السيارة',
                descEn: 'Review IDs, licenses and vehicle photos',
            },
            {
                href: '/kyc',
                ar: 'التحقق من الهوية',
                en: 'Identity (KYC)',
                descAr: 'طلبات التحقق التي تحتاج مراجعة يدوية',
                descEn: 'Verification cases that need a manual review',
            },
            {
                href: '/passengers',
                ar: 'الركاب',
                en: 'Passengers',
                descAr: 'قائمة الركاب وإدارة حساباتهم',
                descEn: 'Passenger list and account management',
            },
        ],
    },
    {
        id: 'money',
        ar: 'المال',
        en: 'Money',
        items: [
            {
                href: '/wallet',
                ar: 'محفظة السائقين',
                en: 'Driver Wallet',
                descAr: 'اعتماد طلبات شحن الرصيد (بنك/كاش) ومتابعة رصيد كل سائق',
                descEn: 'Approve top-up requests (bank/cash) and track each driver\'s balance',
                badge: 'walletTopups',
            },
            {
                href: '/sham-cash-queue',
                ar: 'تأكيد مدفوعات الرحلات',
                en: 'Ride Payments',
                descAr: 'رحلات دُفعت عبر شام كاش وبانتظار تأكيدك',
                descEn: 'Rides paid via Sham Cash waiting for your confirmation',
                badge: 'shamCash',
            },
            {
                href: '/payouts',
                ar: 'سحب أرباح السائقين',
                en: 'Driver Payouts',
                descAr: 'طلبات السائقين بسحب أرباحهم المكتسبة',
                descEn: 'Drivers\' requests to withdraw their earnings',
                badge: 'payouts',
            },
            {
                href: '/earnings',
                ar: 'الأرباح',
                en: 'Earnings',
                descAr: 'أرباح السائقين وعمولة المنصة',
                descEn: 'Driver earnings and platform commission',
            },
            {
                href: '/finance',
                ar: 'المالية والتسويات',
                en: 'Finance',
                descAr: 'مطابقة المدفوعات والسجل المحاسبي',
                descEn: 'Payment reconciliation and the accounting ledger',
            },
            {
                href: '/pricing',
                ar: 'التسعير',
                en: 'Pricing',
                descAr: 'أسعار الرحلات والمناطق وأوقات الذروة',
                descEn: 'Fares, zones and surge pricing',
            },
        ],
    },
    {
        id: 'support',
        ar: 'الدعم والأمان',
        en: 'Support & Safety',
        items: [
            {
                href: '/complaints',
                ar: 'الشكاوى',
                en: 'Complaints',
                descAr: 'شكاوى الركاب والسائقين وحالة معالجتها',
                descEn: 'Rider and driver complaints and their resolution',
                badge: 'complaints',
            },
            {
                href: '/support-chat',
                ar: 'دردشة الدعم',
                en: 'Support Chat',
                descAr: 'محادثات الدعم المباشرة مع المستخدمين',
                descEn: 'Live support conversations with users',
            },
            {
                href: '/fraud',
                ar: 'مكافحة الاحتيال',
                en: 'Fraud Desk',
                descAr: 'عمليات مشبوهة رُصدت تلقائياً',
                descEn: 'Suspicious activity detected automatically',
            },
            {
                href: '/privacy-dsr',
                ar: 'طلبات الخصوصية',
                en: 'Privacy Requests',
                descAr: 'طلبات المستخدمين بتصدير بياناتهم أو حذفها',
                descEn: 'Users\' requests to export or delete their data',
            },
        ],
    },
    {
        id: 'growth',
        ar: 'النمو',
        en: 'Growth',
        items: [
            {
                href: '/promotions',
                ar: 'العروض والخصومات',
                en: 'Promotions',
                descAr: 'أكواد الخصم والحملات الترويجية',
                descEn: 'Promo codes and marketing campaigns',
            },
        ],
    },
    {
        id: 'system',
        ar: 'النظام',
        en: 'System',
        items: [
            {
                href: '/audit',
                ar: 'سجل التدقيق',
                en: 'Audit Log',
                descAr: 'من فعل ماذا ومتى داخل لوحة الإدارة',
                descEn: 'Who did what, and when, inside the admin panel',
            },
            {
                href: '/settings',
                ar: 'الإعدادات',
                en: 'Settings',
                descAr: 'الحساب والمظهر وكلمة المرور',
                descEn: 'Your account, appearance and password',
            },
        ],
    },
];

/** Finds the nav entry (and its group) for a pathname, e.g. /drivers/42 → Drivers. */
export function findNavMeta(pathname: string) {
    for (const group of NAV_GROUPS) {
        for (const item of group.items) {
            if (pathname === item.href || pathname.startsWith(item.href + '/')) {
                return { group, item };
            }
        }
    }
    return null;
}
