import { loginUser, registerUser } from "@/api/auth-api";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {useState} from "react";
import {View , TextInput , Text , StyleSheet,Alert, ViewStyle , TextStyle , TextInputProps, TouchableOpacity} from "react-native";

export default function Login() {
    const {login} = useAuth();

    const [formDate ,setFormDate] = useState({ email : "", password : "" , })
    const [errors , setErrors] = useState({});
    const [loading , setLoading] = useState(false);

    const handleSubmit = async () => {
        if(!formDate.email || !formDate.password) {
            Alert.alert("Error" , "all file required")
            return
        }
        try {
            setLoading(true)
            const result = await loginUser(formDate.email , formDate.password)
            login(result.user)
            router.push("/")
        } catch (error) {
            Alert.alert("Error" , "login falied")
        } finally {
            setLoading(false)
        }
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput style={styles.input} placeholder="email"
        value={formDate.email}
        onChangeText = {(text) => setFormDate({...formDate, email : text})} />
         <TextInput  style={styles.input} placeholder="Password" value={formDate.password}
         onChangeText={(text) => setFormDate({...formDate, password : text})} />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}></Text>
        </TouchableOpacity>
         <TouchableOpacity onPress={() => router.push("/auth/signup")}>
         <Text>Don't have an account? Sign Up</Text>
       </TouchableOpacity>
      </View>
    )
  
}

const styles = StyleSheet.create({
    container : {padding : 20},
    input : {borderWidth : 1, padding : 10, marginBottom : 10},
    title : {fontSize : 32 },
    button : {backgroundColor : "#8f1a1a" , borderRadius : 33},
    buttonText : {color : "#0000"},
    link : {    textAlign: "center",
    marginTop: 15,
    color: "#666",
    fontSize: 14,}
})