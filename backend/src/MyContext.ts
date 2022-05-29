import { Request, Response } from "express"
export interface MyContext {
    payload?: { userId: String }
    req: Request,
    res: Response
} 