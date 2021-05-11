import * as functions from 'firebase-functions'
import cookieSession from 'cookie-session'
import cors from 'cors'
import express, { Response, Request, Application } from 'express'
import firebaseAdmin from 'firebase-admin'
import { ErrorHandler, addPrefix } from './handlers/handler'
import { adminCheck } from './middleware/adminCheck'
import { generateResizedImage } from './middleware/generateThumbnails'
import { jwtCheck } from './middleware/jwtCheck'
import { syncUserAndClaims } from './middleware/syncUserAndClaims'
import { checkin, checkinStateless, checkinStatus, userCount } from './handlers/checkin'
import { getDonationURL } from './handlers/utils'
import { config } from './utils'
import {
    generatePoll,
    submitPollResponse,
    pickWinner,
    updatePollStats,
    startPoll,
    pollClearAll,
} from './handlers/poll'
import {
    getRank,
    getScore,
    getHighScore,
    getLeaderboard,
    addEntry,
} from './handlers/bukGames'
import { logger } from './log'
import { submitCompetitionEntry } from './handlers/competition'
import { deleteEvent, deleteQuestion } from './handlers/delete'
import { getProfileImage, updateProfileImage } from './handlers/user'
import {
    getToken,
    login,
    processLoginCallback,
    getIdToken,
} from './handlers/firebaseToken'
import { newFeedPost } from './handlers/feed'
import { newInquiry } from './handlers/inquiry'
import { passport, sessionSettings } from './middleware/passport'

const log = logger('index')

const firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(config.firebaseServiceAccount),
    databaseURL: `https://${config.firebaseServiceAccount.projectId}.firebaseio.com`,
})

log.info('Cloud functions initializing...')

const insecureHandlerWithPrefix = (prefix: string): Application => {
    const handler = express()
    handler.use(cors())
    handler.use(addPrefix(prefix)) // ?? Type sig?
    handler.use(ErrorHandler) // ?? What's going on with the type sig?
    return handler
}

const handlerWithPrefix = (prefix: string): Application => {
    const handler = insecureHandlerWithPrefix(prefix)
    handler.use(jwtCheck)
    handler.use(syncUserAndClaims)
    return handler
}

const adminHandlerWithPrefix = (prefix: string): Application => {
    const handler = handlerWithPrefix(prefix)
    handler.use(adminCheck)
    return handler
}

const firestore = firebaseApp.firestore()

const checkinHandler = handlerWithPrefix('checkin')
checkinHandler.get('/checkin/', (req: Request, res: Response) =>
    checkinStatus(firestore, req, res)
)
checkinHandler.post('/checkin/', (req: Request, res: Response) =>
    checkin(firestore, req, res)
)
checkinHandler.get('/checkin/userCount', (req: Request, res: Response) =>
    userCount(firestore, req, res)
)
checkinHandler.post('/checkin/stateless', (req: Request, res: Response) =>
    checkinStateless(firestore, req, res)
)

const appHandler = handlerWithPrefix('app')

const competitionHandler = handlerWithPrefix('competition')
competitionHandler.post('/competition/entry', (req: Request, res: Response) =>
    submitCompetitionEntry(firestore, req, res)
)

const deleteHandler = adminHandlerWithPrefix('delete')
deleteHandler.post('/event/:event/question/:questionId', deleteQuestion)
deleteHandler.post('/event/:event', deleteEvent)

const tokenHandler = insecureHandlerWithPrefix('firebase')
tokenHandler.use(cookieSession(sessionSettings))
tokenHandler.use(passport.initialize())
tokenHandler.use(passport.session())
tokenHandler.get('/firebase/', jwtCheck, syncUserAndClaims, getToken)
tokenHandler.get('/firebase/login', login)
tokenHandler.get('/firebase/callback', processLoginCallback)
tokenHandler.get('/firebase/idtoken', getIdToken)

const pollHandler = handlerWithPrefix('poll')
pollHandler.post(
    '/poll/pickWinner',
    adminCheck,
    (req: Request, res: Response) => pickWinner(firestore, req, res)
)
pollHandler.post(
    '/poll/updateStats',
    adminCheck,
    (req: Request, res: Response) => updatePollStats(firestore, req, res)
)
pollHandler.post('/poll/start', adminCheck, (req: Request, res: Response) =>
    startPoll(firestore, req, res)
)
pollHandler.post('/poll/clearAll', adminCheck, (req: Request, res: Response) =>
    pollClearAll(firestore, req, res)
)
pollHandler.post('/poll/generate', (req: Request, res: Response) =>
    generatePoll(firestore, req, res)
)
pollHandler.post('/poll/response', (req: Request, res: Response) =>
    submitPollResponse(firestore, req, res)
)

const feedHandler = handlerWithPrefix('feed')
feedHandler.post('/feed/incoming', (req: Request, res: Response) =>
    newFeedPost(firestore, req, res)
)

const inquiryHandler = handlerWithPrefix('inquiry')
inquiryHandler.post('/inquiry/submit', (req: Request, res: Response) =>
    newInquiry(firestore, req, res)
)

const bukGamesHandler = handlerWithPrefix('bukGames')
bukGamesHandler.get('/bukGames/rank', (req: Request, res: Response) =>
    getRank(firestore, req, res)
)
bukGamesHandler.get('/bukGames/score', (req: Request, res: Response) =>
    getScore(firestore, req, res)
)
bukGamesHandler.get('/bukGames/highscore', (req: Request, res: Response) =>
    getHighScore(firestore, req, res)
)
bukGamesHandler.get('/bukGames/leaderboard', (req: Request, res: Response) =>
    getLeaderboard(firestore, req, res)
)
bukGamesHandler.post('/bukGames/entry', (req: Request, res: Response) =>
    addEntry(firestore, req, res)
)

const userHandler = handlerWithPrefix('user')
userHandler.post('/user/profileImage', (req: Request, res: Response) =>
    updateProfileImage(firestore, req, res)
)
userHandler.get('/user/profileImage', (req: Request, res: Response) =>
    getProfileImage(firestore, req, res)
)

const utilsHandler = handlerWithPrefix('utils')
utilsHandler.get('/utils/signedDonationURL', getDonationURL);

log.info('Ready.')

module.exports = {
    app: functions.region('europe-west1').https.onRequest(appHandler),
    bukGames: functions.region('europe-west1').https.onRequest(bukGamesHandler),
    checkin: functions.region('europe-west1').https.onRequest(checkinHandler),
    competition: functions
        .region('europe-west1')
        .https.onRequest(competitionHandler),
    delete: functions.region('europe-west1').https.onRequest(deleteHandler),
    feed: functions.region('europe-west1').https.onRequest(feedHandler),
    firebase: functions.region('europe-west1').https.onRequest(tokenHandler),
    inquiry: functions.region('europe-west1').https.onRequest(inquiryHandler),
    poll: functions.region('europe-west1').https.onRequest(pollHandler),
    utils: functions.region('europe-west1').https.onRequest(utilsHandler),
    user: functions.region('europe-west1').https.onRequest(userHandler),
    thumbnail: functions
        .region('europe-west1', 'us-central1')
        .storage.object()
        .onFinalize((object) =>
            generateResizedImage(object, firebaseApp.firestore())
        ),
}
