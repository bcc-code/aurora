const firebase = require("@firebase/rules-unit-testing");
const fs = require("fs");
const http = require("http");

/**
 * The emulator will accept any project ID for testing.
 */

const PROJECT_ID = "test";

/**
 * The FIRESTORE_EMULATOR_HOST environment variable is set automatically
 * by "firebase emulators:exec"
 */

const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;

/**
 * Creates a new client FirebaseApp with authentication and returns the Firestore instance.
 */

function getAuthedFirestore(auth) {
    return firebase
        .initializeTestApp({ projectId: PROJECT_ID, auth })
        .firestore();
}

beforeEach(async () => {
    // Clear the database between tests
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });

    let adminApp = firebase.initializeAdminApp({ projectId: PROJECT_ID });
    let perms = adminApp.firestore().collection("user-groups/bcc/permissions")
    await perms.doc("1").set({"role": "administrator"}, {})

    let user = adminApp.firestore().collection("user-groups/bcc/users")
    await user.doc("2").set({"personId": "2"}, {})
});

before(async () => {
    // Load the rules file before the tests begin
    const rules = fs.readFileSync("firestore.rules", "utf8");
    await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

after(async () => {
    // Delete all the FirebaseApp instances created during testing
    // Note: this does not affect or clear any data
    await Promise.all(firebase.apps().map((app) => app.delete()));

    // Write the coverage report to a file
    const coverageFile = 'firestore-coverage.html';
    const fstream = fs.createWriteStream(coverageFile);
    await new Promise((resolve, reject) => {
        http.get(COVERAGE_URL, (res) => {
            res.pipe(fstream, { end: true });
            res.on("end", resolve);
            res.on("error", reject);
        });
    });

    console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

describe("BCC.online", () => {
    it("new collections permitted only for admins", async () => {
        let db = getAuthedFirestore({ uid: "2@person.id", personId: "2" });
        var notExists = db.collection("i-dont-exist").doc("alice");
        await firebase.assertFails(notExists.set({ birthday: "January 1" }));

        db = getAuthedFirestore({ uid: "1@person.id", personId: "1" });
        notExists = db.collection("i-dont-exist").doc("alice");
        await firebase.assertSucceeds(notExists.set({ birthday: "January 1" }));
    });

    it("User should be able to read only their user doc", async () => {
        let db = getAuthedFirestore({ uid: "2@person.id", personId: "2" });
        var notMine = db.collection("/user-groups/bcc/users").doc("1");
        await firebase.assertFails(notMine.get());

        var mine = db.collection("/user-groups/bcc/users").doc("2");
        await firebase.assertSucceeds(mine.get());
    });

    it("Most things should not be accessible if you are not logged in", async () => {
        let db = getAuthedFirestore(null);
        await firebase.assertFails(db.collection("/configs").doc("1").get());
        await firebase.assertFails(db.collection("/churches").doc("1").get());
        await firebase.assertFails(db.collection("/competitions").doc("1").get());
        await firebase.assertFails(db.collection("/buk-games").doc("1").get());
        await firebase.assertFails(db.collection("/events").doc("1").get());
        await firebase.assertFails(db.collection("/gameboard").doc("1").get());
        await firebase.assertFails(db.collection("/questions").doc("1").get());
    });

    it("should allow logged in users to read most of the things", async () => {
        let db = getAuthedFirestore({ uid: "2@person.id", personId: "2" });
        await firebase.assertSucceeds(db.collection("/configs").doc("test-config").get());
        await firebase.assertSucceeds(db.collection("/churches").doc("1").get());
        await firebase.assertSucceeds(db.collection("/competitions").doc("1").get());
        await firebase.assertSucceeds(db.collection("/events").doc("22").get());
        await firebase.assertSucceeds(db.collection("/events/22/questions").get());
        await firebase.assertSucceeds(db.collection("/events/22/questions").doc("1").get());
        await firebase.assertSucceeds(db.collection("/events/22/questions/12/answers").get());
        await firebase.assertSucceeds(db.collection("/events/22/questions/12/answers").doc("1").get());
        await firebase.assertSucceeds(db.collection("/configs").doc("brunstadtv-app").get());
        await firebase.assertSucceeds(db.collection("/events/33/feed-outgoing").get());
        await firebase.assertSucceeds(db.collection("/events/32/feed-outgoing").doc("234").get());
        await firebase.assertSucceeds(db.collection("/events/32/gameboard").doc("current").get());
        await firebase.assertSucceeds(db.collection("/events/34/responses").doc("23").get());
        await firebase.assertSucceeds(db.collection("/events/34/program").doc("23").get());
    });

    it("should be not be able to create a response directly", async () => {
        let db = getAuthedFirestore({ uid: "2@person.id", personId: "2" });
        await firebase.assertFails(db.collection("/events/23/responses").doc("17").set({"Data": "Data"}))
    })

});
