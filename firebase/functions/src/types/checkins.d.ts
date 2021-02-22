import { CheckinStatus } from "../model/modules/checkins";

export interface CheckinRefs {
    checkins? (): FirebaseFirestore.CollectionReference,
    checkin? (personId: number): FirebaseFirestore.DocumentReference,
}

export interface CheckinActions {
    getCheckinStatus? (personId: number): Promise<CheckinStatus | CheckinError>,
    checkin? (currentPersonId: number, userIds: Array<number>, coords: any): Promise<void>,
    updateCheckinCount? (): Promise<{ checkedInUsers: number }>
}

export interface CheckinError {
    message: string,
    checkedIn: boolean,
    canCheckin?: boolean,
    linkedUsers?: Array<any>
}
