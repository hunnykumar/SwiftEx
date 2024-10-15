import { useState } from "react";
import { SafeAreaView, View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import {widthPercentageToDP as wp,heightPercentageToDP as hp,} from "react-native-responsive-screen";
import { alert } from "../Dashboard/reusables/Toasts";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
const StellarSdk = require('stellar-sdk');

const importStellar = () => {
    const navigation = useNavigation();
    const [secretkey, setsecretkey] = useState("");
    const [show, setshow] = useState(false);
    const import_stellar=()=>{
        console.log("clicked")
        if (!secretkey) {
            alert('error', "Missing Secret Key.");
        }
        else {
            setshow(true);
            storeData(secretkey)
        }
    }
    const storeData = async (secretKey) => {
        
          try {
            await AsyncStorageLib.removeItem('myDataKey');
            console.log('Data cleared successfully');
            try {
                const keypair = StellarSdk.Keypair.fromSecret(secretKey);
                const publicKey = keypair.publicKey();
                const data = {
                  key1: publicKey,
                  key2: secretKey,
                };
              const jsonData = JSON.stringify(data);
              await AsyncStorageLib.setItem('myDataKey', jsonData);
              setshow(false);
              navigation.navigate("HomeScreen")
              alert('success',"Account Imported.");
            } catch (error) {
              console.error('Error storing data:', error);
              alert('error', "Account Not import yet.");
              setshow(false);
            }
          } catch (error) {
            console.error('Error clearing data:', error);
          }
         
      };

    return (
        <SafeAreaView>
            <View style={style.labelInputContainer}>
                <Text style={style.label}>Secret Key</Text>
                <TextInput
                    value={secretkey}
                    onChangeText={(text) => {
                        setsecretkey(text);
                    }}
                    style={{ width: wp("78%") }}
                    placeholder={secretkey ? secretkey : "Secret Key"}
                    placeholderTextColor={"gary"}
                />
            </View>
            <TouchableOpacity
                style={style.btn}
                onPress={() => { import_stellar() }}>
                <Text style={{ color: "white" }}>{show===true?<ActivityIndicator color={"white"}/>:"Import"}</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
export default importStellar

const style = StyleSheet.create({
    labelInputContainer: {
        position: "relative",
        width: wp(90),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        marginTop: hp(6),
        borderRadius: wp(2),
        backgroundColor: "white",
        borderWidth: 1,
        paddingLeft: wp(3),
        paddingVertical: hp(1.2),
        borderColor: "#DADADA",
        height: hp(6.9)
    },
    label: {
        position: "absolute",
        zIndex: 100,
        backgroundColor: "white",
        paddingHorizontal: 5,
        left: 12,
        color: "#4CA6EA",
        top: -12,
    },
    btn: {
        backgroundColor: "#4CA6EA",
        paddingVertical: hp(1.6),
        width: wp(90),
        alignSelf: "center",
        borderRadius: hp(1),
        alignItems: "center",
        marginTop: hp(10)
    },
})