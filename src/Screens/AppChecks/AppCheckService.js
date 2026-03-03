import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_HOST } from "../../Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";

export const CheckAppAvailable = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        body: "",
        redirect: "follow"
    };

    const response = await fetch(REACT_APP_HOST + "/v1/app-available", requestOptions);
    if (!response.ok) {
        return {
            status: false,
            error: `HTTP error: ${response.status}`,
        };
    }
    const result = await response.json();
    if (result) {
        await AsyncStorage.setItem("AppStatusChecks", JSON.stringify(result));
    }
}

export const AppNavigation = async (props, user = null) => {
    const res = await AsyncStorage.getItem("AppStatusChecks");
    const response = JSON.parse(res);
    if (response.isRestricted || response.maintenance === "true") {
        props.navigation.navigate("AppCheck", { info: response.isRestricted ? 0 : 1 });
    } else {
        if (user) {
            props.navigation.navigate(user ? "HomeScreen" : "Welcome");
        } else {
            props.navigation.navigate("Welcome");
        }
    }
}