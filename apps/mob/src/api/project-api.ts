import {API_URL} from "../constants/env";

export async function createProject(name: string , token : string) {
    const res = await fetch(API_URL + "/projects", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "Authorization": "Bearer " + token
        },
        body : JSON.stringify({name : name})
    })
    const data = await res.json();

    if(!res.json) {
        throw new Error(data.error || "create falied")
    }
    return data;
}

export async function getProjectsId(id : number,token : string) {
    const res = await fetch(API_URL + "/projects/" + id , {
        method : "GET",
        headers : {
            "Content-Type" : "application/json",
            "Authorization": "Bearer " + token
        },
        
    })
    const data = await res.json();
    if(!res.ok) {
        throw new Error(data.error || "create failed")
    }
    return data;
}

export async function getProjects(token : any) {
    const res = await fetch(API_URL + "/projects/", {
        method : "GET",
        headers : {
            "Authorization" : "Bearer " + token 
        }
    })
    const data = await res.json()
    if(!res.ok) {
        throw new Error(data.error || "falied retry" )
    }
    return data;
}
export async function updateProject(id: number, name : string, token : string) {
    const res = await fetch(`${API_URL}/projects/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed, retry");
    }

    return data;
}
export async function deleteProject(id : number , token : string) {
    const res = await fetch(API_URL + "/projects/" + id , {
        method : "DELETE",
        headers : {
            "Authorication" : `Bearer ${token}`
        }
    }) 
    const data = await res.json();
    if(!res.ok) {
        throw new Error(data.error || "failed,  retuy")
    }
    return data ;
}