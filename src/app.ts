import express from "express";
import friendsRoutes from "./routes/FriendRoutesAuth";
import dotenv from "dotenv";
import path from "path";
import { Request, Response } from "express"
import { ApiError } from "./errors/apiErrors";
import cors from "cors"
const bp = require('body-parser')
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';
import authMiddleware from "./middleware/basic-auth"


dotenv.config();
const app = express();
const debug = require("debug")("app")

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
import logger, { stream } from "./middleware/logger";
const morganFormat = process.env.NODE_ENV == "production" ? "combined" : "dev"
app.use(require("morgan")(morganFormat, { stream }));
logger.log("info", "Server started");

//åbner public folderen for tilgående
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cors())
//app.use("/graphql", cors(), authMiddleware)
// app.use("/graphql", (req, res, next) => {
//   const body = req.body;
//   if (body && body.query && body.query.includes("createFriend")) {
//     console.log("Create")
//     return next();
//   }
//   if (body && body.operationName && body.query.includes("IntrospectionQuery")) {
//     return next();
//   }
//   if (body.query && (body.mutation || body.query)) {
//     return authMiddleware(req, res, next)
//   }
//   next()
// })

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.use("/api/friends", cors(), friendsRoutes)



app.get("/demo", (req, res) => {
  res.send("Hello World");
});



//404 handlers for api-request
app.use("/api", (req, res, next) => {
  res.status(404).json({ errorCode: 404, msg: "not found!!!!" })
})


app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof (ApiError)) {
    if (err.errorCode != undefined)
      res.status(err.errorCode).json({ errorcode: err.errorCode, msg: err.message })
  } else {
    next()
  }
})
export default app;
