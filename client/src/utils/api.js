import axios from 'axios';
import keys from './keys';
import firebase from 'firebase';
const baseUri = keys.API.BASE_PATH;

/**
 * Create and process the request
 */
async function sendRequest(requestMethod, requestUrl, bodyData = null, headers = {}, auth = true){
    return sendRequestRaw(requestMethod, baseUri + requestUrl, bodyData, headers, auth)
}

async function sendRequestRaw(requestMethod, requestUrl, bodyData = null, headers = {}, auth = true){
    if (auth) {
        var accessToken = localStorage.getItem(keys.AUTH0.CLIENT_ID);

        if (!accessToken) {
            accessToken = await firebase.auth().currentUser.getIdToken()
            headers["x-api-token"]= accessToken
        } else {
            headers.Authorization = 'Bearer ' + accessToken;
        }
    }
    headers.audience = keys.AUTH0.CLIENT_ID;
    return axios({
        headers: headers,
        method: requestMethod,
        data: bodyData,
        url: requestUrl
    });
}

async function startPoll(eventId, questionIds) {
    var body = {
        questionIds: questionIds
    }
    return sendRequest('POST', `poll/start?eventId=${eventId}`, body);
}

async function updateResponsesStats(eventId, questionId) {
    return sendRequest('POST', `poll/updateStats?eventId=${eventId}&questionId=${questionId}`)
}

async function pickWinner(eventId, questionId) {
    return sendRequest('POST', `poll/pickWinner?eventId=${eventId}&questionId=${questionId}`)
}

async function updateUserCount(eventId){
    return sendRequest('GET', `checkin/userCount?eventId=${eventId}`);
}

async function approveCompetitionEntry(competitionId, personId, distance) {
    var body = {
        personId: personId,
        distance: 0,
        overrideMaxDistance: distance
    }
    return sendRequest('POST', `competition/entry?competitionId=${competitionId}`, body)
}

async function deleteQuestion(eventId, questionId) {
    return sendRequest('POST', `delete/event/${eventId}/question/${questionId}`)
}

async function deleteEvent(eventId) {
    return sendRequest('POST', `delete/event/${eventId}`)
}

async function exportData(toExport) {
    return sendRequest('POST', `impex/export`, toExport);
}

async function listExports() {
    return sendRequest('GET', `impex/listExports`);
}

async function importData(toImport) {
    return sendRequest('POST', `impex/import`, toImport);
}

async function collectionResults() {
    let results = await sendRequestRaw("GET", `${keys.API.BASE_PATH_V2}api/donationstatus`);
    if (results.status != 200) {
        console.error(results);
        return "";
    }

    let total = results.data.totalAmount.toFixed();
    return total.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

async function updateAgeBasedPollResults(eventID) {
    let results = await sendRequestRaw("GET", `${keys.API.BASE_PATH_V2}api/updatepollstatsbyage?EventID=${eventID}`);
    if (results.status < 200 || results.status > 299 ) {
        console.error(results);
        return
    }
}

async function updateChurchBasedPollResults(eventID) {
    let results = await sendRequestRaw("GET", `${keys.API.BASE_PATH_V2}api/updatepollstatsbychurch?EventID=${eventID}`);
    if (results.status < 200 || results.status > 299 ) {
        console.error(results);
        return
    }
}


async function createSubclip(assetId, title, tsin, tsout) {
    let results = await sendRequestRaw("POST", `${keys.API.BASE_PATH_V2}api/subclip`, {
        in: tsin,
        out: tsout,
        title,
        assetId
    });

    console.error(results);
}

/**
 * Intercept the 401 response
 */
axios.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        if (error.response.status === 401
            && error.response.data.error.code == 'invalid_token'
            && error.response.data.error.message == 'jwt expired') {
            console.log('Session expired');
            sessionStorage.setItem('returnUrl', location.href);
            location.href = keys.API.BASE_PATH + `firebase/login`;
        }
        return Promise.reject(error)
    }
);

export default {
    approveCompetitionEntry,
    collectionResults,
    createSubclip,
    deleteEvent,
    deleteQuestion,
    exportData,
    importData,
    listExports,
    pickWinner,
    sendRequestRaw,
    startPoll,
    updateAgeBasedPollResults,
    updateChurchBasedPollResults,
    updateResponsesStats,
    updateUserCount,
};
