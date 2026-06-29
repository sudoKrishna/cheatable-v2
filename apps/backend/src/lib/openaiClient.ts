import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {role : "system" | "user" | "assistant" ; content : string};

export function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function askModelForJSON<T>(systemPrompt : string, userMessage : string) : Promise<T>{
    const messages = [
        {
            role : "system" as const, 
            content : systemPrompt
        },
        {
            role : "user" as const,
            content : userMessage
        }
    ]

    const response = await client.responses.create({
        model : "gpt-4.1",
        input : messages,
        temperature : 0.2,
    });
    const text= response.output_text;
    const jsonText = stripCodeFences(text)

    try {
        return JSON.parse(jsonText) as T;
    } catch (error) {
        throw new Error("model did not return valid JSON")
    }
}

export async function askModelForText(systemPrompt : string, userMessage : string) : Promise<string> {
const messages = [
    {
    role : "system" as const,
    content : systemPrompt
   },{
    role : "user" as const,
    content : userMessage
   }
]

const response = await client.responses.create({
    model : "gpt-4.1",
    input : messages,
    temperature : 0.2,
})

const text = response.output_text;
return stripCodeFences(text);
}

// export async function callFileGenModel(messages : ChatMessage[]) : Promise<string> {
//     const completion = await openai.chat.completions.create({
//         model : "gpt-4.1",
//         messages,
//         temperature : 0.2,
//         response_format : {type : "json_object"}
//     });

//     const content = completion.choices[0]?.message?.content;
//     if(!content) {
//         throw new Error("openai returned the empty response")
//     }
//     return content;
// }