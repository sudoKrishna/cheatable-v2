import { useState  , useContext, useEffect, lazy} from "react";
import * as SecureStore from 'expo-secure-store';
import { createContext } from "react";

export interface User {
    id :string;
    email : string;
    name : string;
    authToken?: string;
}
export interface AuthContextType {
    user : User | null;
    setUser : (user : User | null) => void
}

export function AuthProvider({ children} : any) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = createContext<AuthContextType>({
    user : null,
    setUser : () => {}
})

export const useUser = () => {
    const  {user, setUser} = useContext(AuthContext);
    const {setItem} = useSecureStorage();

    const addUser = (user : User) => {
        setUser(user);
        setItem("user", JSON.stringify(user))
    }
    const removeUser = () => {
        setUser(null);
        setItem("user" , "");
    };
    return {user, addUser , removeUser , setUser}
}

export const useAuth = () => {
    const { user , addUser , removeUser , setUser} = useUser();
    const [loading, setLoading] = useState(true);
    const {getItem}  = useSecureStorage();

useEffect(() => {
    const load = async() => {
        const user = await getItem("user")
        if(user) {
            addUser(JSON.parse(user));
        }
        setLoading(false);
    }
    load()
}, [])

    const login = (user : User) => {
        addUser(user);
    }
    const register = (user: User) => {
        addUser(user)
    }

    const logout = () => {
        removeUser();
    }
    return {user, login , logout ,register, setUser, loading}
}
export const useSecureStorage =() => {
const [value , setValue] = useState<string | null>(null);

const setItem = async(key : string , value : string) => {
    await SecureStore.setItemAsync(key , value)
    setValue(value)
}
const getItem = async(key : string) => {
    const value = await SecureStore.getItemAsync(key)
    setValue(value)
    return value
}

const removeItem = async(key : string) => {
    const value = await SecureStore.deleteItemAsync(key)
    setValue(null)
} 

return {value , setItem , getItem, removeItem}
}