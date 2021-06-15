import { TemplatedString } from './templated'

export interface FeedConfig {
        autoPush: boolean,
        frequency: number,
}

export interface StyleConfig {
        logo: TemplatedString,
        primaryColor: TemplatedString,
        primaryColorDark: TemplatedString,
}

export interface EventData {
    archived: boolean,
    background: TemplatedString
    banner: string,
    canSendInquiries: boolean,
    details: string,
    feed: FeedConfig,
    logo: TemplatedString,
    name: string,
    style: StyleConfig,
    testimonyMaxDuration: number,
    checkinFactor: number,
    additionalCheckins: number,
}

export interface EventExport {
    event: EventData
}
