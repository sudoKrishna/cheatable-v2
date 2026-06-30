import { API_URL } from "@/constants/env";  

export async function startSandbox(id : any , token : string) {
    const res = await fetch(API_URL + id + "/start"  , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authorization: `Bearer ${token}`
        },
        

    })
    const data =await res.json()
    if(!res.ok) {
        throw new Error(data.error || "start sandbox falied")
    }
    return data;
}

export async function stopSandbox(id : any , token : string) {
    const res = await fetch(API_URL + id + "/stop", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authrization : `Bearer ${token}`
        } 
    });
    const data =await res.json()

    if(!res.ok) {
        throw  new Error(data.error || "stop sandbox falied")
    }
    return data;
}
export async function exexCommad(id :string , token : string) {
    const res = await fetch(API_URL + id + "/exec" , {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authrization : `Beares ${token}`
        }
    })
    const data = await res.json()
    if(!res.ok) {
        throw new Error("exec command run error")
    }
    return data;
}

export async function statusCheck(id :string , token : string) {
    const res = await fetch(API_URL + id + "/status" ,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            Authrizaton : `Bearer ${token}`
        }
    });
    const data= await res.json()
    if(!res.json) {
        throw new Error("status check falied")
    }
    return data;
}