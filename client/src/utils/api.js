import axios from 'axios';
import keys from './keys';
const baseUri = keys.API.BASE_PATH;

/**
 * Create and process the request
 */
async function sendRequest(requestMethod, requestUrl, bodyData = null, headers = {}, auth = true){
    if (auth) {
        var accessToken = localStorage.getItem(keys.AUTH0.CLIENT_ID);
        headers.Authorization = 'Bearer ' + accessToken;
    }
    headers.audience = keys.AUTH0.CLIENT_ID;
    return axios({
        headers: headers,
        method: requestMethod,
        data: bodyData,
        url: baseUri + requestUrl
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

async function collectionResults() {
    return axios({
        method: 'GET',
        url: 'https://smscollection.azurewebsites.net/api/collectionresults/',
    });
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
    updateResponsesStats,
    pickWinner,
    updateUserCount,
    approveCompetitionEntry,
    collectionResults,
    startPoll,
    deleteEvent,
    deleteQuestion
};
