import { driversApi } from './api';

export async function approveDriverFull(driverId: number): Promise<void> {
    await driversApi.approveFull(driverId);
}
