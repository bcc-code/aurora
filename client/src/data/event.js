import { Components } from '@/models/components.js'

export const NewEvent = (name, order) => {
    return {
        name: name,
        order: order, 
        details: "",
        syncRate: 120,
        currentProgramElement: null,
        isActive: false,
        checkedInUsers: 0,
        extraCheckins: 0,
        feedApproval: true,
        automaticFeed: false,
        automaticFeedFrequency: 5,
        testimonyMaxDurationSeconds: 60,
        canSendInquiries: false,
        components: {
            program: true,
            feed: true
        },
        style: {
            primaryColor: null,
            primaryColorDark: null
        }
    }
}

export const NewScreen = (id, order) => {
    var newScreen = { 
        order: order,
        options: { showBackground: true },
        size: { width: 1920, height: 1080 }
    };
    switch (id[0]) {
        case 'L':
        case 'R':
            newScreen.size = { width: 2048, height: 820 }
            newScreen.options.feedPictures = { view: null, columns: null }
            newScreen.options.profilePictures = { frequency: null }
            newScreen.options.question = { question: null, view: null, viewType: null }
            newScreen.options.component = Components.PROFILEPICTURES;
            break;
        case 'M':
            newScreen.size = {  width: 3840, height: 1097 }
            newScreen.options.worldMap = { showCheckinsNumber: true }
            newScreen.options.question = { question: null, view: null, viewType: null }
            newScreen.options.component = Components.WORLDMAP
            break;
        case 'E':
            newScreen.options.worldMap = { showCheckinsNumber: true }
            newScreen.options.question = { question: null, view: null, viewType: null }
            newScreen.options.wwr = { autoSpin: null, selectedChurch: null }
            newScreen.options.feedPictures = { view: null, columns: null }
            newScreen.options.component = Components.WORLDMAP
            newScreen.options.bukGames = { game: null }
            break;
        case 'A':
            newScreen.options.squeezeBackSize = "normal"
            newScreen.options.donation = { showResults: false, size: null }
            newScreen.options.question = { question: null, view: null, showCorrectAnswer: true, finished: false }
            newScreen.options.information = { information: null }
            break;
        case 'F':
            newScreen.options.component = null
            newScreen.options.donation = { view: null }
            newScreen.options.question = { question: null, view: null, showCorrectAnswer: true, finished: false }
            newScreen.options.information = { information: null }
            break;
    }
    Object.defineProperty(newScreen, "id", { enumerable : false, value : id });
    return newScreen;      
}