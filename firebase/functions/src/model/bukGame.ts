import { BukGameEntry } from '../types/bukGame'
import { IUser } from '../types/user'
import { n } from './constants'
import { logger } from '../log'
import { firestore } from 'firebase-admin'

const log = logger('model/bukGame')

export class BukGameModel {
    db: firestore.Firestore
    bukGame: firestore.DocumentReference
    entries: firestore.CollectionReference
    banlist: firestore.CollectionReference
    gameId: string

    entry(personId: string): firestore.DocumentReference {
        return this.entries.doc(personId)
    }

    userBan(personId: string): firestore.DocumentReference {
        return this.banlist.doc(personId)
    }

    user(personId: string): firestore.DocumentReference {
        return this.db.collection(n.users).doc(personId)
    }

    async banUser(personId: string): Promise<void> {
        await this.banlist.doc(personId).set({
            timestamp: Date.now() + 60 * 60 * 1000,
        })
    }

    async unbanUser(personId: string): Promise<void> {
        await this.userBan(personId).set({
            timestamp: null,
        })
    }

    async updateEntry(
        personId: string,
        game: string,
        score: number
    ): Promise<BukGameEntry> {
        log.info(
            `POST /bukGames/entry?bukGameId=${this.gameId}, personId: ${personId}, game: ${game}, score: ${score}`
        )

        const entryDoc = await this.entry(personId).get()
        const personDoc = await this.user(personId).get()
        const person = personDoc.data() as IUser
        let newDoc: BukGameEntry = {
            displayName: person.displayName,
            churchName: person.churchName,
            countryName: person.countryName,
            profilePictureThumb: person.profilePicture,
        }

        if (!entryDoc.exists) {
            newDoc[game] = score
            await this.entry(personId).set(newDoc)
        } else {
            newDoc = { ...newDoc, ...entryDoc.data() }
            if ((newDoc[game] ?? 0) < score) {
                newDoc[game] = score
                await this.entry(personId).update(newDoc)
            }
        }
        return newDoc
    }
    constructor(firestore: firestore.Firestore, bukGameId: string) {
        this.db = firestore
        this.gameId = bukGameId

        this.bukGame = this.db.collection(n.bukGames).doc(bukGameId)
        this.entries = this.bukGame.collection(n.entries)
        this.banlist = this.bukGame.collection(n.banlist)
    }
}
