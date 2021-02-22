import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel, UserModel } from "../model/index";
import { FeedEntry } from "../model/modules/feed";
import { IUser } from "../types/user";

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
  await eventModel.feed.actions.submitFeedEntry(new FeedEntry(currentUser, req.body.text, req.body.imageUrl));
  return res.sendStatus(200);
});

feedHandler.use(ErrorHandler);
export default (firebaseDb: any) => {
  db = firebaseDb;
  return feedHandler;
};
