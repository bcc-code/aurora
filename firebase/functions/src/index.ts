import * as functions from 'firebase-functions'
import cookieSession from 'cookie-session'
import cors from 'cors'
import express, { Response, Request, Application } from 'express'
import firebaseAdmin from 'firebase-admin'
import { ErrorHandler, addPrefix } from './handlers/handler'
import { adminCheck } from './middleware/adminCheck'
import { generateResizedImage } from './middleware/generateThumbnails'
import { jwtCheck, jwtCheckMiddleware } from './middleware/jwtCheck'
import { syncUserAndClaims } from './middleware/syncUserAndClaims'
import { checkin, checkinStateless, checkinStatus, userCount } from './handlers/checkin'
import { getDonationURL, getSignedRedirect } from './handlers/utils'
import { exportData, importData, listExports } from './handlers/impex'
import { config } from './utils'
import { eventList, getEventData } from './handlers/event'
import {
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
import {
    getLinkedUsers,
    getProfileImage,
    updateProfileImage,
} from './handlers/user'
import {
    getToken,
    login,
    processLoginCallback,
    getIdToken,
} from './handlers/firebaseToken'
import { newFeedPost } from './handlers/feed'
import { newInquiry } from './handlers/inquiry'
import { passport, sessionSettings } from './middleware/passport'
import { Bucket } from '@google-cloud/storage'

type HandlerWithDB = (db: firebaseAdmin.firestore.Firestore, req: Request, res: Response) => Promise<void>
type HandlerWithBucket = (db: firebaseAdmin.firestore.Firestore, bucket: Bucket , req: Request, res: Response) => Promise<void>
type Handler = (req: Request, res: Response) => void

const withDB = (db: firebaseAdmin.firestore.Firestore, f : HandlerWithDB) : Handler  =>  {
    return (req: Request, res: Response) => f(db, req, res)
}

const withBucket = (db: firebaseAdmin.firestore.Firestore, bucket: Bucket, f : HandlerWithBucket) : Handler  =>  {
    return (req: Request, res: Response) => f(db, bucket, req, res)
}

const log = logger('index')
const firebaseApp = firebaseAdmin.initializeApp({})

const impExBucket = firebaseApp.storage().bucket(config.app.impexBucket);

log.info('Cloud functions initializing...')

const insecureHandlerWithPrefix = (prefix: string): Application => {
    const handler = express()
    handler.use(cors())
    handler.use(addPrefix(prefix))
    handler.use(ErrorHandler)
    return handler
}

const handlerWithPrefix = (prefix: string): Application => {
    const handler = insecureHandlerWithPrefix(prefix)
    handler.use(jwtCheckMiddleware(firebaseApp))
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
checkinHandler.get('/checkin/', withDB(firestore, checkinStatus));
checkinHandler.post('/checkin/', withDB(firestore, checkin));
checkinHandler.get('/checkin/userCount', withDB(firestore, userCount));
checkinHandler.post('/checkin/stateless', withDB(firestore, checkinStateless));

const appHandler = handlerWithPrefix('app')

const competitionHandler = handlerWithPrefix('competition')
competitionHandler.post('/competition/entry', withDB(firestore, submitCompetitionEntry));

const deleteHandler = adminHandlerWithPrefix('delete')
deleteHandler.post('/delete/event/:event/question/:questionId', deleteQuestion)
deleteHandler.post('/delete/event/:event', deleteEvent)

const tokenHandler = insecureHandlerWithPrefix('firebase')
tokenHandler.use(cookieSession(sessionSettings))
tokenHandler.use(passport.initialize())
tokenHandler.use(passport.session())
tokenHandler.get('/firebase/', jwtCheck, syncUserAndClaims, getToken)
tokenHandler.get('/firebase/login', login)
tokenHandler.get('/firebase/callback', processLoginCallback)
tokenHandler.get('/firebase/idtoken', getIdToken)
tokenHandler.post('/firebase/', jwtCheck, syncUserAndClaims, getToken)
tokenHandler.post('/firebase/login', login)
tokenHandler.post('/firebase/callback', processLoginCallback)
tokenHandler.post('/firebase/idtoken', getIdToken)

const pollHandler = handlerWithPrefix('poll')
pollHandler.post('/poll/pickWinner', adminCheck, withDB(firestore, pickWinner));
pollHandler.post('/poll/updateStats', adminCheck, withDB(firestore, updatePollStats));
pollHandler.post('/poll/start', adminCheck, withDB(firestore, startPoll));
pollHandler.post('/poll/clearAll', adminCheck, withDB(firestore, pollClearAll));
pollHandler.post('/poll/response', withDB(firestore, submitPollResponse));

const feedHandler = handlerWithPrefix('feed')
feedHandler.post('/feed/incoming', withDB(firestore, newFeedPost));

const inquiryHandler = handlerWithPrefix('inquiry')
inquiryHandler.post('/inquiry/submit', withDB(firestore, newInquiry));

const bukGamesHandler = handlerWithPrefix('bukGames')
bukGamesHandler.get('/bukGames/rank', withDB(firestore, getRank));
bukGamesHandler.get('/bukGames/score', withDB(firestore, getScore));
bukGamesHandler.get('/bukGames/highscore', withDB(firestore, getHighScore));
bukGamesHandler.get('/bukGames/leaderboard', withDB(firestore, getLeaderboard));
bukGamesHandler.post('/bukGames/entry', withDB(firestore, addEntry))

const userHandler = handlerWithPrefix('user')
userHandler.post('/user/profileImage', withDB(firestore, updateProfileImage));
userHandler.get('/user/profileImage', withDB(firestore, getProfileImage));
userHandler.get('/user/linked', withDB(firestore, getLinkedUsers));

const utilsHandler = handlerWithPrefix('utils')
utilsHandler.get('/utils/signedDonationURL', getDonationURL);
utilsHandler.get('/utils/signedRedirectURL', withDB(firestore, getSignedRedirect));

const impexHandler = adminHandlerWithPrefix('impex')
impexHandler.post('/impex/export', withBucket(firestore, impExBucket, exportData));
impexHandler.post('/impex/import', withBucket(firestore, impExBucket, importData));
impexHandler.get('/impex/listExports', withBucket(firestore, impExBucket, listExports));

const eventHandler = handlerWithPrefix('events')
eventHandler.get('/events/list', (req: Request, res: Response) =>
    eventList(firestore, req, res)
)
eventHandler.get('/events/data', (req: Request, res: Response) =>
    getEventData(firestore, req, res)
)

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
    impex: functions.region('europe-west1').https.onRequest(impexHandler),
    events: functions.region('europe-west1').https.onRequest(eventHandler),
    thumbnail: functions
        .region('europe-west1', 'us-central1')
        .storage.object()
        .onFinalize((object) =>
            generateResizedImage(object, firebaseApp.firestore())
        ),
}
