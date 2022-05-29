import { Query, Resolver, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware } from "type-graphql";
import { User } from "./entity/User";
import { compare, hash } from "bcryptjs";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string;
}


@Resolver()
export class UserResolver {

    @Query(() => String)
    hello() {
        return "hi!";
    }


    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() { payload }: MyContext
    ) {

        return `your user id is : ${payload?.userId}`;
    }

    @Query(() => [User])
    async users() {
        return await User.find()
    }

    @Mutation(() => Boolean)
    async deleteUser(
        @Arg("id") id: number
    ) {
        await User.delete(id)
        return true
    }

    @Mutation(() => LoginResponse)
    async login(
        @Ctx() { res }: MyContext,
        @Arg("email") email: string,
        @Arg("password") password: string): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            throw new Error("invalid email or password")
        }

        const valid = await compare(password, user.password)

        if (!valid) {
            throw new Error("invalid email or password")
        }
        console.log(valid)


        //Successfully login
        res.cookie("jid", createRefreshToken(user))

        return {
            accessToken: createAccessToken(user)
        }

    }

    @Mutation(() => Boolean)
    async register(
        @Arg("email") email: string,
        @Arg("password") password: string) {
        try {

            const hashedPassword = await hash(password, 12);
            await User.insert({
                email,
                password: hashedPassword
            })
            return true

        } catch (e) {
            console.log(e)
            return false
        }
    }
}