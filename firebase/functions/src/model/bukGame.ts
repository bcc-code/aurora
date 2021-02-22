import { BukGameActions, BukGameEntry, BukGameRefs } from "../types/bukGame";
import { n } from "./index"

export class BukGameModel {
    refs: BukGameRefs;
    actions: BukGameActions;

    constructor(firestore: any, bukGameId: String) {
        const db = firestore;
    
        this.refs = {};
        this.actions = {};
        
        this.refs.bukGame = () => db.collection(n.bukGames).doc(bukGameId);
        this.refs.entries = () => this.refs.bukGame().collection(n.entries);
        this.refs.entry = (personId) => this.refs.entries().doc(`${personId}`)
        this.refs.banlist = () => this.refs.bukGame().collection(n.banlist)
        this.refs.userBan = (personId) => this.refs.banlist().doc(`${personId}`)
        this.refs.user = (personId) => db.collection(n.users).doc(`${personId}`);
            
        this.actions.banUser = async (personId) => {
            await this.refs.banlist().doc(`${personId}`).set({
                timestamp: Date.now() + 60 *  60 * 1000
            })
        }
    
        this.actions.unbanUser = async (personId) => {
            await this.refs.userBan(personId).set({
                timestamp: null
            })
        }
    
        this.actions.updateEntry = async (personId, game, score) => {
    
            console.log(`POST /bukGames/entry?bukGameId=${bukGameId}, personId: ${personId}, game: ${game}, score: ${score}`)
    
            const entryDoc = await this.refs.entry(personId).get();
            const personDoc = await this.refs.user(personId).get();
            const person = personDoc.data();
            let newDoc: BukGameEntry = {
                displayName: person.displayName || null,
                churchName: person.churchName || null,
                countryName: person.countryName || null,
                profilePictureThumb: person.profilePictureThumb || null
            };
            if (!entryDoc.exists) {
                newDoc[game] = score
                await this.refs.entry(personId).set(newDoc)
            } else {
                newDoc = {...newDoc, ...entryDoc.data() };
                if (!newDoc[game] || newDoc[game] < score) {
                    newDoc[game] = score;
                    await this.refs.entry(personId).update(newDoc)
                }
            }
            return newDoc;
        }
    }
}