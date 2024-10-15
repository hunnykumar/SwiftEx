import { useEffect, useState } from "react";
import {
  Generate_Wallet,
  importAllWallets,
  AddToAllWallets,
  getDirectoryUri,
} from "../components/Redux/actions/auth";
import React from "react";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import MyHeader from "./MyHeader";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome";
import MyHeader2 from "./MyHeader2";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { checkWalletValidity } from "../utilities/utilities";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { urls } from "./constants";
const CreateWallet = () => {
  const [address, setAddress] = useState("");
  const [Loading, setLoading] = useState(false);
  const state = useSelector((state) => state);
  const [extended, setExtended] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [allWallets, setAllWallets] = useState();
  const [change, setChange] = useState(false);
  const [privateKey, setPrivatekey] = useState("");
  const Load = false;
  const checkwallet = async () => {
    setLoading(true);
    let emailId = await state.user;
    const response = await fetch(`http://${urls.testUrl}/user/getallwallets`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailId: emailId,
      }),
    })
      .then((response) => response.json())
      .then(async (json) => {
        const accounts = json.accounts;
        console.log(accounts[0].length);
        if (accounts[0].length !== 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((e) => console.log(e));

    return response;
  };
  const getWallets = async () => {
    const user = await AsyncStorageLib.getItem("user");
    const oldWallets = await AsyncStorageLib.getItem(`${user}-wallets`);

    let data = JSON.parse(oldWallets)
      ? JSON.parse(oldWallets)
      : await state.wallets; //await state.wallets?await state.wallets:oldWallets//AsyncStorageLib.getItem(`${user}-wallets`)

    //data.push(await state.wallets)
    console.log(user);
    //console.log(JSON.parse(data))
    if (data) {
      if (data[0].name !== undefined) {
        console.log(data);
        AsyncStorageLib.setItem(`${user}-wallets`, JSON.stringify(data));
        setAllWallets(data);
        return data;
      } else {
        return;
      }
    }
    return data;
  };

  console.log(state.user);
  const Header = (title) => {
    return state.extended == true ? (
      <MyHeader2 title={title} setExtended={setExtended} extended={extended} />
    ) : (
      <MyHeader title={title} setExtended={setExtended} extended={extended} />
    );
  };
  console.log(state);

  const dispatch = useDispatch();

  const generate = async () => {
    let address;
    let privatekey;
    if (!name) {
      setLoading(false);
      return Alert.alert("Please select an account name to proceed");
    }
    if (!password) {
      setLoading(false);
      return Alert.alert("You must select a password to proceed furthur");
    }
    const accName = await state.user; //AsyncStorageLib.getItem('user')

    console.log(accName);
    const resp = await checkWalletValidity(name, accName);
    console.log(resp);
    setLoading(false);
    if (resp == 400) {
      return alert(
        "account with the same name already exists. Please use a different name instead"
      );
    } else {
      const Wallets = await getWallets();
      const check = await checkwallet();
      let Folderuri;
      if (check) {
        Folderuri = await state.directoryUri;
      }

      console.log(Folderuri);
      dispatch(
        Generate_Wallet(
          name,
          password,
          accName,
          dispatch,
          getDirectoryUri,
          Folderuri ? Folderuri : ""
        )
      )
        .then(async (response) => {
          const res = response;

          if (res.status == "success") {
            setAddress(res.wallet.address);
            setLoading(false);
            setPrivatekey(res.wallet.privateKey);
            privatekey = res.wallet.privateKey;
            address = res.wallet.address;

            if (Wallets) {
              const accounts = {
                address: address,
                privateKey: privatekey,
                name: name,
                wallets: Wallets ? Wallets : allWallets,
              };
              let wallets = [];
              wallets.push(accounts);
              const user = await AsyncStorageLib.getItem("user");
              dispatch(AddToAllWallets(wallets, user));
              setChange(true);
              await getWallets();
              // const data = await readData(state.user, dispatch, importAllWallets)
              //savePrivateKey(saveFile, name,res.wallet.privateKey,password, state.user)
              console.log("success");
            } else {
              let Wallets = await getWallets();
              if (privatekey) {
                const accounts = {
                  address: address,
                  privateKey: privatekey,
                  name: name,
                  wallets: Wallets ? Wallets : allWallets,
                };
                let wallet = [];
                wallet.push(accounts);
                try {
                  const user = await state.user; //AsyncStorageLib.getItem('user')

                  dispatch(AddToAllWallets(wallet, user));
                  setChange(true);
                  await getWallets();
                } catch (e) {
                  console.log(e);
                }

                console.log("success");
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(async () => {
    const wallets = await getWallets();
    setAllWallets(wallets);
  }, [change]);

  return (
    <View style={styles.container}>
      <View style={styles.accountBox}>
        <TouchableOpacity
          onPress={async () => {
            setLoading(!Loading);

            setTimeout(() => {
              generate();
            }, 1);
          }}
        >
          <Text style={styles.text}>
            {Loading ? (
              <ActivityIndicator size="large" color="green" />
            ) : (
              "Generate Wallet"
            )}
          </Text>
          <Icon
            name="chevron-right"
            size={30}
            color="white"
            style={{ marginLeft: 260, marginTop: -30 }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ marginLeft: wp("14") }}>
        <Text style={{ color: "white" }}>Set Account name</Text>
        <TextInput
          style={styles.input}
          theme={{ colors: { text: "white" } }}
          value={name}
          placeholder={"Please set an account name"}
          onChangeText={(text) => setName(text)}
          autoCapitalize={"none"}
          placeholderTextColor="#FFF"
        />
      </View>
      <View style={{ marginLeft: wp("14") }}>
        <Text style={{ color: "white" }}>Set encryption password</Text>
        <TextInput
          style={styles.input}
          theme={{ colors: { text: "white" } }}
          value={password}
          placeholder={"Please set a password"}
          onChangeText={(text) => setPassword(text)}
          autoCapitalize={"none"}
          placeholderTextColor="#FFF"
        />
      </View>
      <View style={styles.accountBox2}>
        <Text style={styles.text}>New Wallet Address</Text>
        <Text style={styles.text}>
          {Loading == true ? (
            <View>
              <Text
                style={{ marginTop: 40, color: "grey", fontWeight: "bold" }}
              >
                Generating Wallet Please Wait!
              </Text>
              <ActivityIndicator size="large" color="green" />
            </View>
          ) : (
            address
          )}
        </Text>
      </View>
    </View>
  );
};
export default CreateWallet;
const styles = StyleSheet.create({
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    marginLeft: wp("2"),
    color: "#fff",
    marginTop: hp("2"),
    width: wp("70"),
    paddingLeft: wp("7"),
    paddingRight: wp("7"),
    backgroundColor: "#000C66",
    borderRadius: wp("20"),
  },
  container: {
    height: 800,
    backgroundColor: "#131E3A",
  },
  text: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "sans-serif",
    fontStyle: "italic",
  },
  accountBox: {
    borderWidth: 5,
    paddingTop: 20,
    borderRadius: 20,
    borderColor: "#131E3A",
    height: 80,
    marginLeft: 40,
    marginRight: 40,
    marginTop: 100,
    backgroundColor: "#000C66",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
  },
  accountBox2: {
    borderWidth: 5,
    paddingTop: 20,
    borderRadius: 20,
    borderColor: "#131E3A",
    height: hp("30"),
    marginLeft: 40,
    marginRight: 40,
    marginTop: hp("5"),
    backgroundColor: "#000C66",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
  },
});
