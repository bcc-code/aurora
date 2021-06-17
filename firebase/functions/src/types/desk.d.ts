import { Verse } from './verse'

export interface DeskData {
    content: string,
    author?: string,
    date: number,
    source?: string,
    type: number,
    verse?: Verse,
}
