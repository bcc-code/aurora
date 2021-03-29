import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel, UserModel } from "../model/index";
import { IUser } from "../types/user";
import { FeedEntry } from "../types/feed";

var db = null;

const feedHandler = handler();

feedHandler.post("/incoming", jwtCheck, syncUserAndClaims, async (req, res) => {
  const eventModel = new EventModel(db, req.query.eventId);
  const userModel = new UserModel(db);
  const personId = req.user[n.claims.personId];
  const currentUserObj = await userModel.refs.user(personId).get();
  if (!currentUserObj.exists)
    return res.status(400).send({ message: "User does not exist" })
  const currentUser = currentUserObj.data() as IUser
  const churchDoc = await userModel.refs.church(currentUser.churchId).get();
  currentUser.churchName = churchDoc.data().name
  currentUser.countryName = churchDoc.data().country
  let feedEntry: FeedEntry = {
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
    displayName: currentUser.displayName || "",
    churchName: currentUser.churchName || "",
    countryName: currentUser.countryName || "",
    text: req.body.text || "",
    imageUrl: req.body.imageUrl || ""
  }
  await eventModel.feed.actions.submitFeedEntry(personId, feedEntry)
  return res.sendStatus(200);
});

feedHandler.use(ErrorHandler);
export default (firebaseDb: any) => {
  db = firebaseDb;
  return feedHandler;
};
