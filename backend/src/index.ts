import "reflect-metadata";
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { AppDataSource } from "./data-source";
import 'dotenv/config'
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";


(async () => {
    //declare express app
    const app = express();
    app.use(cookieParser())


    await AppDataSource.initialize();

    //Graphql config 
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    });

    //start apollo server
    await apolloServer.start()
    //applying the middleware to the express app 
    apolloServer.applyMiddleware({ app });


    //routes 
    app.get("/", (_req, res) => res.send("Hello World!"));

    app.post("/refresh_token", async (_req, _res) => {
        const token = _req.cookies.jid
        if (!token) {
            _res.send({ ok: false, accessToken: "" })
        }
        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)

        } catch (err) {
            console.log(err)
            return _res.send({ ok: false, accessToken: "" })

        }
        //token is valid and we can send back the access token 
        const user = await User.findOne({ where: { id: payload.userId } })

        if (!user) {
            return _res.send({ ok: false, accessToken: "" })
        }
        if (user.tokenVersion !== payload.tokenVersion) {
            console.log("Revoked")
            return _res.send({ ok: false, accessToken: "" })

        }

        console.log(user?.email)
        sendRefreshToken(_res, createRefreshToken(user))

        return _res.send({ ok: true, accessToken: createAccessToken(user) })
    })

    // Start the server
    app.listen(
        4000,
        () => console.log("<<<<< Server is running on port 4000 >>>>>")
    )

})()




// AppDataSource.initialize().then(async () => {

//     console.log("Inserting a new user into the database...")
//     const user = new User()
//     user.firstName = "Timber"
//     user.lastName = "Saw"
//     user.age = 25
//     await AppDataSource.manager.save(user)
//     console.log("Saved a new user with id: " + user.id)

//     console.log("Loading users from the database...")
//     const users = await AppDataSource.manager.find(User)
//     console.log("Loaded users: ", users)

//     console.log("Here you can setup and run express / fastify / any other framework.")

// }).catch(error => console.log(error))
