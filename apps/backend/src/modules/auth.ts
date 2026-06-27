import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from "@repo/db"


const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET!;

if(!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}

export async function hashPassword(password : string): Promise<string> {
    return bcrypt.hash(password , 10)
}

export async function verifyPassword(password :string, hashPassword :string) : Promise<boolean> {
    return bcrypt.compare(password , hashPassword)
}
export function signJwt(userId :string) : string {
    return jwt.sign(
        {userId},
        JWT_SECRET,
        {expiresIn : "7d"}
    )
}
export function verifyJwt(
    token :string
) : {userId :string} | null {
    try {
        return jwt.verify(token , JWT_SECRET)  as {userId:string}
    } catch (error) {
        return null;
    }
}

export async function createUser(email :string  , password : string, name :string)   {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data : {
            email,
            name,
            password : hashedPassword,
        },
    });
    return user;
}


export async function loginUser(email :string , password : string) {
    const user = await prisma.user.findUnique({
        where : {
            email,
        },
    });

    if(!user) {
        throw new Error("Invalid email or password")
    }

    const valid = await verifyPassword(password , user.password)

    if(!valid) {
        throw new Error("Invalid email or password")
    }

    const token = signJwt(user.id);
    return {
        user,
        token,
    };
}