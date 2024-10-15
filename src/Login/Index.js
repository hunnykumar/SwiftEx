import './shim'
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { login } from "../components/Redux/actions/auth";
const Login = ({ navigation }) => {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const dispatch = useDispatch();
const onLogin = () => {
    let user = {
      username: username,
      password: password,
    };
dispatch(login(user))
      .then((response) => {
        if (response.status == "success") {
          navigation.replace("HomeScreen");
        }
      })
      .catch((error) => {
        navigation.replace("LoginScreen");
      });
  };
return (
    <View style={Styles.container}>
      <Text style={Styles.headerTitle}>Please Login to your account</Text>
      <TextInput
        style={Styles.input}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="username"
      />
      <TextInput
        style={Styles.input}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
        placeholder="password"
      />
      <Button onPress={() => onLogin()} title="Login" />
    </View>
  );
};
export default Login;
const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
  },
  input: {
    width: 360,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "gray",
    paddingVertical: 10,
    marginVertical: 10,
  },
});