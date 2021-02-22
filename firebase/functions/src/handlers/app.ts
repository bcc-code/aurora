import handler from './handler'
import express from "express";
import path from "path";

const app = handler();
app.use("*", express.static(path.join(__dirname, "public")));

export default app;