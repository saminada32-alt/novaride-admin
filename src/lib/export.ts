export function exportToCSV(data: any[], filename: string) {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(h => {
            const val = row[h] ?? '';
            const str = String(val).replace(/"/g, '""');
            return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
        }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
}

export function driversToCSV(drivers: any[]) {
    return drivers.map(d => ({
        ID: d.id,
        Phone: d.phone,
        Name: d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : '',
        Email: d.email ?? '',
        Status: d.status,
        Approval: d.isApproved ? 'APPROVED' : d.isRejected ? 'REJECTED' : 'PENDING',
        Rating: d.rating,
        'License Country': d.licenseCountry ?? '',
        'Is Company': d.isCompany ? 'Yes' : 'No',
        'Company Name': d.companyName ?? '',
        'Joined At': d.createdAt,
        'Approved At': d.approvedAt ?? '',
    }));
}

export function ridesToCSV(rides: any[]) {
    return rides.map(r => ({
        ID: r.id,
        Passenger: r.passenger?.phone ?? '',
        Driver: r.driver?.phone ?? '',
        Status: r.status,
        'Fare (SYP)': r.estimatedFare,
        'Original Fare (SYP)': r.originalFare ?? '',
        'Discount (SYP)': r.discountAmount ?? '',
        'Promo Code': r.promoCode ?? '',
        'Payment Method': r.paymentMethod ?? '',
        'Payment Reference': r.paymentReference ?? '',
        'Payment Confirmed': r.paymentConfirmedAt ?? '',
        'Distance (km)': r.estimatedDistanceKm,
        'Pickup Lat': r.pickupLat,
        'Pickup Lng': r.pickupLng,
        'Created At': r.createdAt,
        'Completed At': r.completedAt ?? '',
    }));
}

export function earningsToCSV(rows: any[]) {
    return rows.map(({ driver: d, dashboard: e }) => ({
        ID: d.id,
        Phone: d.phone,
        Name: d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : '',
        'Daily ($)': e.daily,
        'Weekly ($)': e.weekly,
        'Monthly ($)': e.monthly,
        'Total ($)': e.total,
        'Trips': e.trips,
    }));
}