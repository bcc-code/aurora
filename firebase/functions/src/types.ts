import * as express from "express";
import { IUser } from "./types/user";

export interface Request extends express.Request {
  user: IUser;
  userClaims: any;
}
