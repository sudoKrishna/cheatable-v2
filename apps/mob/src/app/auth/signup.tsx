import { useState } from "react";
import React from "react";
import {View , TextInput , Text , StyleSheet,Alert, ViewStyle , TextStyle , TextInputProps, TouchableOpacity} from "react-native";
import {FieldError} from 'react-hook-form';
import { Button } from "expo-router/build/react-navigation";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { registerUser } from "@/api/auth-api";


export default function Signup() {
    const {register} = useAuth();

    const [formDate , setFormDate] = useState({name : "" , email: "" , password : ""})
    const [errors , setErrors] = useState(false);
    const [loading , setLoading] = useState(false);
 
   const handleSubmit = async () => {
    if(!formDate.name || !formDate.email || !formDate.password) {
        Alert.alert("Error" , "all file required")
        return;
    }
    try {
        setLoading(true)
        const result = await registerUser(formDate.email ,formDate.name , formDate.password)
        register(result.user)
        router.push("/")
    } catch (error: any) {
  console.log("SIGNUP ERROR:", error?.response?.data || error);
  Alert.alert(
    "Signup Error",
    error?.response?.data?.error || error.message || "Signup failed"
  );
} finally {
        setLoading(false)
    }
   }

    return (
        <View style={styles.container}>
           <Text style={styles.title}>Sign up</Text>

           <TextInput 
           style={styles.input}
           placeholder="name"
           value={formDate.name}
           onChangeText = {(text) => setFormDate({ ...formDate, name : text})}
           />
           <TextInput
           style={styles.input}
           placeholder="Email"
           value={formDate.email}
           onChangeText={(text) => setFormDate({ ...formDate , email : text})}
           />
           <TextInput
           style={styles.input}
           placeholder="Password"
           value={formDate.password}
           onChangeText = {(text) => setFormDate({...formDate, password : text})}
           />

           <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}></Text>

           </TouchableOpacity>
           <TouchableOpacity onPress={() => router.push("/auth/login")}>
             <Text style={styles.link}>
                Already have account? Login
             </Text>
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