import express from "express";
import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {prisma} from "@repo/db"
import z from "zod";


const router = Router()

const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET!;

if(!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
}
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});


export async function hashPassword(password : string): Promise<string> {
    return bcrypt.hash(password , 10)
}

export async function verifyPassword(password :string, hashPassword :string) : Promise<boolean> {
    return bcrypt.compare(password , hashPassword)
}
export function signJwt(ownerId :string) : string {
    return jwt.sign(
        {ownerId},
        JWT_SECRET,
        {expiresIn : "7d"}
    )
}
export function verifyJwt(
    token :string
) : {ownerId :string} | null {
    try {
        return jwt.verify(token , JWT_SECRET)  as {ownerId:string}
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
            passwordHash : hashedPassword,
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

    const valid = await verifyPassword(password , user.passwordHash)

    if(!valid) {
        throw new Error("Invalid email or password")
    }

    const token = signJwt(user.id);
    return {
        user,
        token,
    };
}

router.post("/register", async (req, res, next) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "invalid request body", issues: parsed.error.flatten() });
        }
        const { email, password, name } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: "user already exists" });
        }

        const user = await createUser(email, password, name);
        const token = signJwt(user.id);

        return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "invalid request body", issues: parsed.error.flatten() });
        }
        const { email, password } = parsed.data;

        const { user, token } = await loginUser(email, password);

        return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
        if (error instanceof Error && error.message === "Invalid email or password") {
            return res.status(401).json({ error: error.message });
        }
        next(error);
    }
});

export default router;
