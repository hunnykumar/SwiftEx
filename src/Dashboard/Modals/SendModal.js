import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, View, Modal } from "react-native";
import {
  getBalance,
  getEthBalance,
  getMaticBalance,
  getXrpBalance,
} from "../../components/Redux/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { utils, providers } from "ethers";
import { useNavigation } from "@react-navigation/native";
import { getNonce } from "../../utilities/utilities";
import { Network, Alchemy } from "alchemy-sdk";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { EthereumSecret, PolygonSecret, RPC } from "../constants";
import ChooseTokens from "../tokens/ChooseTokens";
import "react-native-get-random-values";
import "@ethersproject/shims";
var ethers = require("ethers");
const xrpl = require("xrpl");

const SendModal = ({ modalVisible, setModalVisible }) => {
  const EthBalance = useSelector((state) => state.EthBalance);
  const MaticBalance = useSelector((state) => state.MaticBalance);
  const type = useSelector((state) => state.walletType);
  const [Loading, setLoading] = useState(false);
  const [balance, setBalance] = useState();
  const [recieverAddress, setAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [IsValid, setValid] = useState();
  const [disable, setDisable] = useState(false);
  const [Visible, SetVisible] = useState(false);
  const state = useSelector((state) => state);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  //console.log(state.walletBalance)
  //console.log(state.wallet)
  const SendMoney = async (
    recieverAddress,
    amount,
    decrypt,
    balance,
    setLoading
  ) => {
    let provider;
    let alchemyProvider;
    const walletType = await AsyncStorage.getItem("walletType");
    console.log(walletType);
    if (JSON.parse(walletType) == "BSC") {
      provider = new ethers.providers.JsonRpcProvider(
        RPC.BSCRPC
      );
    }
    const emailid = await state.user;
    setLoading(true);

    if (!recieverAddress && !amount) {
      setLoading(false);
      setDisable(true);

      return alert("no place can be left blank");
    }
    if (amount > balance) {
      setLoading(false);
      setDisable(true);

      return alert("You dont have enough balance to make this transaction");
    }
    const token = await state.token;
    const privateKey = decrypt ? decrypt : alert("no wallets connected");
    console.log(privateKey);
    const addressTo = recieverAddress; //"0x0E52088b2d5a59ee7706DaAabC880Aaf5A1d9974"//address;

    const addressFrom = state.wallet.address
      ? state.wallet.address
      : alert("please choose a wallet first");

    if (JSON.parse(walletType) == "Ethereum") {
      const settings = {
        apiKey: EthereumSecret.apiKey,
        network: Network.ETH_SEPOLIA,
      };

      alchemyProvider = new Alchemy(settings);
      const walletPrivateKey = new ethers.Wallet(privateKey);

      const nonce = await alchemyProvider.core.getTransactionCount(
        walletPrivateKey.address,
        "latest"
      );
      const maxFee = await alchemyProvider.core.getFeeData(
        walletPrivateKey.address
      );
      console.log(maxFee);
      let transaction = {
        to: addressTo,
        value: utils.parseEther(amount),
        gasLimit: 21000,
        maxPriorityFeePerGas: maxFee.maxPriorityFeePerGas,
        maxFeePerGas: maxFee.maxFeePerGas,
        nonce: nonce,
        type: 2,
        chainId: 5,
      };
      console.log(transaction);

      let rawTransaction = await walletPrivateKey.signTransaction(transaction);
      const info = {
        type: "Eth",
        fee: maxFee.maxPriorityFeePerGas,
        rawTransaction: rawTransaction,
        addressTo: addressTo,
        addressFrom: addressFrom,
        amount: amount,
        provider: alchemyProvider,
      };
      navigation.navigate("Confirm Tx", {
        info,
      });
    } else if (JSON.parse(walletType) == "Matic") {
      try {
        const walletPrivateKey = new ethers.Wallet(privateKey);

        const settings = {
          apiKey: PolygonSecret.apiKey,
          network: Network.MATIC_MUMBAI,
        };

        const alchemy = new Alchemy(settings);
        const nonce = await alchemy.core.getTransactionCount(
          walletPrivateKey.address,
          "latest"
        );
        const gasPrice = ethers.utils.hexlify(
          parseInt(await alchemy.core.getGasPrice())
        );
        console.log(alchemy.core.getNetwork());
        const transaction = {
          chainId: 80001,
          from: addressFrom,
          nonce: nonce,
          to: addressTo,
          data: "0x",
          value: ethers.utils.parseEther(amount),
          gasLimit: ethers.utils.hexlify(21000),
          gasPrice: gasPrice,
        };
        let rawTransaction = await walletPrivateKey.signTransaction(
          transaction
        );
        const info = {
          type: "Matic",
          fee: gasPrice,
          rawTransaction: rawTransaction,
          addressTo: addressTo,
          addressFrom: addressFrom,
          amount: amount,
          provider: alchemy,
        };
        navigation.navigate("Confirm Tx", {
          info,
        });
      } catch (e) {
        setDisable(true);

        console.log(e);
        setLoading(false);
      }
    } else if (JSON.parse(walletType) == "BSC") {
      provider = new ethers.providers.JsonRpcProvider(
        RPC.BSCRPC
      );

      const walletPrivateKey = new ethers.Wallet(privateKey);
      const nonce = await getNonce(addressFrom);
      console.log(nonce);
      const gasPrice = await provider.getGasPrice(addressFrom);
      var transaction = {
        gasLimit: 21000,
        gasPrice: await provider.getGasPrice(addressFrom),
        nonce: nonce, //provider.getTransactionCount(addressFrom),
        to: addressTo,
        data: "0x",
        value: ethers.utils.parseEther(amount),
      };
      const token = await state.token;
      console.log(token);
      const signer = await walletPrivateKey.signTransaction(transaction);
      console.log(signer);
      const info = {
        type: "BSC",
        fee: gasPrice,
        rawTransaction: signer,
        addressTo: addressTo,
        addressFrom: addressFrom,
        amount: amount,
        provider: provider,
      };
      navigation.navigate("Confirm Tx", {
        info,
      });
    } else if (JSON.parse(walletType) == "Xrp") {
      console.log("started");
      console.log(privateKey);
      const Wallet = xrpl.Wallet.fromSecret(privateKey);
      console.log("hi" + Wallet);
      const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      const wallet = await AsyncStorageLib.getItem("wallet");
      console.log(JSON.parse(wallet).classicAddress);
      const prepared = await client
        .autofill({
          TransactionType: "Payment",
          Account: JSON.parse(wallet).classicAddress,
          Amount: xrpl.xrpToDrops(`${amount}`),
          Destination: addressTo,
        })
        .catch((e) => {
          console.log(e);
        });
      const max_ledger = prepared.LastLedgerSequence;
      console.log("Prepared transaction instructions:", prepared);
      console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
      console.log("Transaction expires after ledger:", max_ledger);
      const signed = Wallet.sign(prepared);
      console.log("Identifying hash:", signed.hash);
      console.log("Signed blob:", signed.tx_blob);
      const info = {
        type: "XRP",
        fee: prepared.Fee,
        rawTransaction: signed,
        addressTo: addressTo,
        addressFrom: Wallet.classicAddress,
        amount: amount,
        provider: client,
      };
      navigation.navigate("Confirm Tx", {
        info,
      });
    } else {
      setDisable(true);

      setLoading(false);
      return alert("chain not supported yet");
    }
  };
  const Balance = async () => {
    try {
      const Type = await type;
      const wallet = await AsyncStorageLib.getItem("wallet");
      const address = (await state.wallet.address)
        ? await state.wallet.address
        : JSON.parse(wallet).address;
      console.log(state.wallet.address);
      if (!state.wallet.address) {
        setBalance(0);
      } else {
        AsyncStorageLib.getItem("walletType").then(async (Type) => {
          if (Type) {
            if (JSON.parse(Type) == "Ethereum") {
              const response = await dispatch(
                getEthBalance(
                  state.wallet.address ? state.wallet.address : address
                )
              )
                .then((res) => {
                  console.log(res.EthBalance);
                  setBalance(res.EthBalance);
                })
                .catch((e) => {
                  console.log(e);
                });
            } else if (JSON.parse(Type) == "Matic") {
              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              setBalance(bal);

              if (bal) {
                console.log("balance", bal);
                setBalance(bal);
              } else {
                console.log("coudnt get balance");
              }
              /* dispatch(getMaticBalance(address))
            .then(async(res) => {
              console.log(res)
              let bal = await AsyncStorageLib.getItem("MaticBalance")
              console.log(bal);
              //setBalance(bal);

              if (bal) {
                console.log("balance", bal)
                setBalance(bal);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });*/
            } else if (JSON.parse(Type) == "Xrp") {
              try {
                await AsyncStorageLib.getItem("wallet").then(async (wallet) => {
                  console.log(wallet);
                  const response = await dispatch(
                    getXrpBalance(JSON.parse(wallet).address)
                  )
                    .then((res) => {
                      console.log(res.XrpBalance);
                      setBalance(res.XrpBalance);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                });
              } catch (e) {
                console.log(e);
              }
            } else {
              const response = await dispatch(getBalance(state.wallet.address))
                .then(async (response) => {
                  console.log(response);
                  const res = await response;
                  if (res.status == "success") {
                    console.log(res);
                    setBalance(res.walletBalance);
                    console.log("success");
                  } else {
                    setBalance(0);
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect( () => {
   const get_bal=async()=>{
    try {
      await Balance();
      const token = await state.token;
      console.log(token);
    } catch (error) {
      console.log(error)
    }
     get_bal()
   }
  }, [state.wallet.address, MaticBalance]);

  useEffect(() => {
    Balance();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      // duration: 1000,
      duration:0,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationType="slide"
        transparent={true}
        animationIn="slideInUp"
        animationOut="slideOutRight"
        visible={modalVisible}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        statusBarTranslucent={true}
        hideModalContentWhileAnimating
        onModalHide={() => setModalVisible(false)}

        onBackdropPress={() => setModalVisible(false)}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
          <View style={{backgroundColor:'rgba(217, 217, 217, 0)',height:"100%",width:wp(100)}}>
        <View
          style={{
            // backgroundColor: "#131E3A",
            backgroundColor:state.THEME.THEME===false?"#145DA0":"black",
            // backgroundColor:"#2D90ED",
            paddingTop: hp(1),
            paddingBottom: hp(12),
            marginTop: hp(20),
            width: wp(95),
            borderRadius: hp(2),
            alignSelf: "center",
            borderWidth: 1,
            borderColor: state.THEME.THEME===false?"#E0E0E0":"#145DA0",
          }}
        >
          {/* <View style={styles.footer}> */}
          {/* <View style={styles.Amount}> */}
          <View style={{ right: Visible === false ? wp(0) : wp(100) }}>
            <ChooseTokens setModalVisible={setModalVisible} />
          </View>
          {/* </View> */}
          {/* </View> */}
        </View>
      </View>
      </Modal>

    </Animated.View>
  );
};

export default SendModal;

const styles = StyleSheet.create({
  Amount: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: hp("3"),
    padding: 26,
  },
  noteHeader: {
    backgroundColor: "#42f5aa",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  footer: {
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("95"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("5"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  textInput2: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("40"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("7"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 40,
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

//ssh -i "MunziAppTest.pem" ubuntu@ec2-3-19-76-40.us-east-2.compute.amazonaws.com
/*
<Text style={styles.headerText}>Enter Amount</Text>
      <View elevation={5}>
      <TextInput style={styles.textInput2} 
      onChangeText={(text) => {
       setAmount(text)
       if(text){
        setDisable(false)
       }else{
        setDisable(true)
       }
    }}
      />
      </View>


       <TouchableOpacity
    disabled={disable===true?true:false}
    style={{position: 'absolute',
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: disable===true?'grey':'green',
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,}}
    onPress={async () => {
      setDisable(true)
      const wallet = await AsyncStorageLib.getItem('wallet')
        console.log(JSON.parse(wallet))
        const privateKey = await state.wallet.privateKey?await state.wallet.privateKey:JSON.parse(wallet).privateKey
        console.log(privateKey)
        
      //setVisible(true)
       //SendMoney(recieverAddress, amount)
       if(privateKey){
        //await check2(decrypt)
        //setVisible(false)
        await SendMoney(recieverAddress, amount, privateKey, balance, setLoading)
        
       }
       else{
        //setVisible(false)
        return Alert.alert(
         "No privateKey found",
         "Do you want to enter private key manually?",
         [
           {
             text: "Cancel",
             onPress: () => console.log("Cancel Pressed"),
             style: "cancel"
           },
           { text: "OK", onPress: () =>        setVisible2(true)        }
         ]
       );
       }
       
       
        }}>
    <Text style={styles.addButtonText}>Send</Text>
  </TouchableOpacity>
   
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => {
        setModalVisible(!modalVisible);
      }}>
      <Text style={styles.addButtonText}>Close</Text>
    </TouchableOpacity>



     <DialogInput 
                isDialogVisible={visible2}
                title={"Private key"}
                message={"Do you want to enter private key manually?"}
                hintInput ={"Enter Private Key here"}
                submitInput={ async (inputText) => {
              const valid =  utils.isHexString(inputText, 32)
              if(valid){
                setVisible2(false)
                setVisible(false)
                await SendMoney(recieverAddress, amount, inputText, balance, setLoading)
                
              }
              else{
                alert("invalid private key. Please try again")
              }
                }}
                closeDialog={() => setVisible2(false)}>
            </DialogInput>

*/