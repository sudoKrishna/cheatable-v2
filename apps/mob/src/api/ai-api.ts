import { API_URL } from "@/constants/env";


export async function generateCode(id : any , prompt : string, token : string ) {
    const res = await fetch(API_URL + id + "/generate" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authorization: `Bearer ${token}`
        },
        body : JSON.stringify({prompt : prompt})
    })
    const data = await res.json();

    if(!res.ok) {
        throw new Error(data.error || "falied")
    }
    return data;
}


export async function editgeneratedCode(id : any , instruction: string , token : string) {
    const res = await fetch(API_URL + id + "/edit" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authorization : `Bearer ${token}`
        },
        body : JSON.stringify({instruction : instruction})
    })
    const data = await res.json();
    if(!res.ok) {
        throw new Error(data.server || "falied")
    }
    return data ;
}
