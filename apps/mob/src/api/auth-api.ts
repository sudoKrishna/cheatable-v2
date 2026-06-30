import {API_URL} from "../constants/env";

export async function registerUser(email : any, password : any, name : any) {
    const res = await fetch(API_URL + "/auth/register", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({email : email, password : password, name : name})
    })

    const data = await res.json();

    if(!res.ok) {
        throw new Error(data.error || "Register falied")
    }

    return data;
}

export async function loginUser(email : any , password : any) {
    const res = await fetch(API_URL + "/auth/login", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({email : email , password : password}) 
    })
    const data = await res.json();

    if(!res.ok) {
        throw new Error(data.error || "Login falied")
    }
    return data;
}