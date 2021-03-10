const admin = require("firebase-admin");
const random = require('random-name')
const LoremIpsum = require("lorem-ipsum").LoremIpsum;
const { RandomPicture } = require('random-picture')

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 4,
    min: 2
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online-dev.firebaseio.com"
});
const db = admin.firestore();

const eventId = 0

const eventRef = db.collection('events').doc(`${eventId}`);

async function generateFeedElements(amount) { 
    for (var i=0; i<amount; i++) {
        let hasImage = Math.random() > 0.5
        let image;
        if (hasImage) image = await RandomPicture()
        let randomPerson = { firstName: random.first(), lastName: random.last() }
        let newFeedElement = {
            personId: 100000 + Math.round(Math.random() * 100000),
            firstName: randomPerson.firstName,
            lastName: randomPerson.lastName,
            displayName: randomPerson.firstName + ' ' + randomPerson.lastName,
            churchName: random.place(),
            countryName: 'Norway',
            text: lorem.generateParagraphs(1),
            imageUrl: hasImage ? image.url : null,
            date: Date.now()
        }
        await eventRef.collection('feed-incoming').add(newFeedElement);
    }
}

async function generateProgramElements(amount) { 
    for (var i=0; i<amount; i++) {
        let type = Math.floor(Math.random() * 6)
        await eventRef.collection('program').add({ order: i, texts: { no: random() }, type: type});
    }
}

async function generateInformation() {
    await eventRef.collection('desk').add({ type: 1, date: Date.now(), content: lorem.generateSentences(2) + '//' + lorem.generateSentences(2) })
}

async function generateQuote() {
    await eventRef.collection('desk').add({ type: 0, date: Date.now(), content: lorem.generateParagraphs(1), author: random(), source: random.place() })
}

async function generateBibleVerse() {
    await eventRef.collection('desk').add({ type: 3, date: Date.now(), content: lorem.generateParagraphs(1), author: random(), source: random.place() })
}

async function generateDefaultDesk() {
    await eventRef.collection('desk').add({ type: 4, date: Date.now(), title: lorem.generateSentences(1), content: lorem.generateParagraphs(1) })
}

async function generateDeskElements(amount) {
    for (var i=0; i<amount; i++) {
        let type = Math.floor(Math.random() * 5)
        switch(type){
            case 0:
                await generateInformation();
                break;
            case 1:
                await generateQuote();
                break;
            case 3:
                await generateBibleVerse();
                break;
            case 4:
                await generateDefaultDesk();
                break;
        }
    }
}

async function generateQuestions(amount) {
    for (var i=0; i<amount; i++) {
        let type = ['multiple-choice', 'slider', 'custom-text'][Math.floor(Math.random()*3)]
        let questionId = Math.floor(Math.random() * 10000);
        let question = { id: questionId, slider: {}, type: type, order: i, texts: { no: lorem.generateSentences(2) }, canChangeAnswer: false, defaultAnswer: null, defaultAnswerId: null}
        switch (type) {
            case 'slider':
                question.slider = { correct: 5, maxValue: 10, minValue: 0, step: 1 }
                break;
            case 'custom-text':
                question.icon = ['information', 'url', 'game', 'donation', 'survey'][Math.floor(Math.random()*5)]
                question.url = 'https://bcc.no'
                break;
        }
        await eventRef.collection('questions').doc(`${questionId}`).set(question)
        if (type == 'multiple-choice') {
            for (var j=0; j<4; j++) {
                let answerId = Math.floor(Math.random() * 10000);
                let answer = { 
                    color: ['pink', 'green', 'yellow', 'blue'][j],
                    correct: false,
                    id: answerId,
                    order: j,
                    texts: {
                        no: lorem.generateWords(2)
                    }
                }
                await eventRef.collection('questions').doc(`${questionId}`).collection('answers').doc(`${answerId}`).set(answer)
            }
        }
    }
}

async function generateInquiries(amount) { 
    for (var i=0; i<amount; i++) {
        let randomPerson = { firstName: random.first(), lastName: random.last() }
        let newInquiry = {
            personId: 100000 + Math.round(Math.random() * 100000),
            firstName: randomPerson.firstName,
            lastName: randomPerson.lastName,
            displayName: randomPerson.firstName + ' ' + randomPerson.lastName,
            churchName: random.place(),
            countryName: 'Norway',
            text: lorem.generateParagraphs(1),
            date: Date.now()
        }
        await eventRef.collection('inquiries-incoming').add(newInquiry);
    }
}

generateFeedElements(10)
//generateProgramElements(20)
//generateDeskElements(5)
//generateQuestions(5)
//generateInquiries(10)