import dotenv from "dotenv";
import {z} from "zod";

// loadEnv(): EnvConfig — reads and validates
//  .env (zod-parse it), returns a typed object: 
//  DATABASE_URL, JWT_SECRET, E2B_API_KEY, 
//  ANTHROPIC_API_KEY or OPENAI_API_KEY, PORT. 
// Throws on boot if any required var is missing — you want 
// this to fail loud, not at request time.

dotenv.config();

const envSchema = z.object({
    PORT : z.coerce.number().default(3000),
    DATABASE_URL : z.string().url(),
    E2B_API_KEY : z.string().url(),
    OPENAI_API_KEY : z.string().url(),
    JWT_SECRET : z.string()
})

const env= envSchema.parse(process.env)

export default env