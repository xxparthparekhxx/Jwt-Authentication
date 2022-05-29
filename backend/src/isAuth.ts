import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";
import { MyContext } from "./MyContext";


// bearer 1eeqweqwe
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];
    console.log(context.req.headers)

    try {

        const token = authorization!.split(' ')[1];
        console.log(token)

        const payload = verify(token!, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any;
    } catch (err) {
        console.log(err)
        throw new Error("not Authenticated")
    }
    return next();
}