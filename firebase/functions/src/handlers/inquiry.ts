import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel, UserModel } from "../model/index";
import { Inquiry } from "../model/modules/inquiries";
import { IUser } from "../types/user";

var db = null;

const feedHandler = handler();

feedHandler.post("/submit", jwtCheck, syncUserAndClaims, async (req, res) => {
  var eventModel = new EventModel(db, req.query.eventId);
  var userModel = new UserModel(db);
  const currentUserObj = await userModel.refs.user(req.user[n.claims.personId]).get();
  if (!currentUserObj.exists)
    return res.status(400).send({ message: "User does not exist" })
  const currentUser = currentUserObj.data() as IUser;
  let newInquiry: Inquiry = {
    personId: currentUser.personId,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    displayName: currentUser.displayName,
    churchName: currentUser.churchName,
    countryName: currentUser.countryName,
    text: req.body.text || "",
    date: Date.now()
  }
  await eventModel.inquiries.actions.submitInquiry(newInquiry);
  return res.sendStatus(200);
});

feedHandler.use(ErrorHandler)

export default (firebaseDb: any) => {
  db = firebaseDb;
  return feedHandler;
};
