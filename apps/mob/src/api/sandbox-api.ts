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
