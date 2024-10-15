import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AddToAllWallets,setCurrentWallet } from "../../components/Redux/actions/auth";
import { urls } from "../constants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import ModalHeader from "../reusables/ModalHeader";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";
const CheckNewWalletMnemonic = ({
  Wallet,
  Visible,
  SetVisible,
  setModalVisible,
  SetPrivateKeyVisible,
  setNewWalletVisible,
  onCrossPress
}) => {
  const state=useSelector((state)=>state);
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");

  const [mnemonic, setMnemonic] = useState("");
  const [Mnemonic, SetMnemonic] = useState([]);
  const [data, setData] = useState();

  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
    
  // New Menomic verify
  const [showVerification, setShowVerification] = useState(false);
  const [answers, setAnswers] = useState(Array(4).fill(null));
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const questions = [
    { question: "Word #1", options: [Wallet?.Mnemonic[0], Wallet?.Mnemonic[1],Wallet?.Mnemonic[2]], correct: Wallet?.Mnemonic[0] },
    { question: "Word #4", options: [Wallet?.Mnemonic[3], Wallet?.Mnemonic[4],Wallet?.Mnemonic[5]], correct: Wallet?.Mnemonic[3] },
    { question: "Word #7", options: [Wallet?.Mnemonic[6], Wallet?.Mnemonic[7],Wallet?.Mnemonic[8]], correct: Wallet?.Mnemonic[6] },
    { question: "Word #10", options: [Wallet?.Mnemonic[9], Wallet?.Mnemonic[10],Wallet?.Mnemonic[11]], correct: Wallet?.Mnemonic[9] },
  ];
  useEffect(() => {
    shuffleQuestions();
  }, []);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const shuffleQuestions = () => {
    const newShuffledQuestions = questions.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    setShuffledQuestions(newShuffledQuestions);
  };

  const handleAnswer = (index, option) => {
    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const deselectAll = () => {
    setData(prevData =>
      prevData.map(item => ({
        ...item,
        selected: false
      }))
    );
    setMnemonic([]);
  };
  
  const closeModal = () => {
    SetVisible(false);
  };

  function func(a, b) {
    return 0.5 - Math.random();
  }

  useEffect(() => {
    console.log(Wallet)
    let data = Wallet.Mnemonic.map((item) => {
      let data = {
        mnemonic: item,
        selected: false,
      };
      return data;
    });
    console.log(data);
    const newData = data.sort(func);
    setData(newData);
    console.log(newData)
  }, []);


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    let wallet = Wallet;
    console.log("mnemonic+++",Wallet.mnemonic)
    console.log(wallet);
  }, [fadeAnim, Spin]);



  console.log("000000000000000", Wallet?.Mnemonic);
 
  //   console.log("----------------------", item);
  //   let Data = data.map((item) => {
  //     return item;
  //   });
  //   let newArray = [];
  //   newArray = Mnemonic;
  //   return (
  //     <TouchableOpacity
  //       style={{
  //         borderColor: "#D7D7D7",
  //         borderWidth: 0.5,
  //         backgroundColor: item.selected ? "#4CA6EA" : "#F2F2F2",
  //         width: wp(30),
  //         justifyContent: "center",
  //         paddingVertical: hp(2),
  //         paddingHorizontal: 3,
  //         position: "relative",
  //       }}
  //       onPress={() => {
  //         console.log("pressed");
  //         if (!item.selected) {
  //           Data[index].selected = true;
  //           newArray.push(item.mnemonic);
  //           console.log(newArray);
  //           SetMnemonic(newArray);
  //           setData(Data);
  //         } else {
  //           Data[index].selected = false;
  //           const data = newArray.filter((Item) => {
  //             return Item != item.mnemonic;
  //           });
  //           console.log(data);
  //           SetMnemonic(data);
  //           setData(Data);
  //         }
  //       }}
  //     >
  //       <Text style={style.itemText}>{item.mnemonic}</Text>
  //     </TouchableOpacity>
  //   );
  // };
  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        useNativeDriver={true}
        onBackdropPress={() => SetVisible(false)}
        onBackButtonPress={() => {
          SetVisible(false);
        }}
      >
        <View style={[style.Body,{backgroundColor:state.THEME.THEME===false?"#011434":"black"}]}>
          {/* <ModalHeader Function={closeModal} name={'Check Mnemonic'}/> */}
          <Icon type={'entypo'} name='cross' color={'#fff'} size={24} style={style.crossIcon} onPress={onCrossPress}/>
          <Text style={style.verifyText}>Verify Secret Phrase</Text>
          <Text style={style.wordText}>
           Please top on the correct answer of the below seed phrases.
          </Text>
          {shuffledQuestions.map((q, index) => (
            <View key={index} style={{ marginVertical: 5 }}>
              <Text style={{marginLeft:wp(3),color:"#fff"}}>{q.question}</Text>
             <View style={{flexDirection:"row",marginLeft:wp(19)}}>
             {q.options.map((option, optIndex) => (
                <TouchableOpacity
                  key={optIndex}
                  style={{
                    backgroundColor: answers[index] === option ? 'lightblue' : 'white',
                    borderRadius:6,
                    borderColor:"#4CA6EA",
                    borderWidth:0.6,
                    marginHorizontal:wp(1.5),
                    width:wp(20),
                    height:hp(5),
                    alignItems:"center",
                    justifyContent:"center"
                  }}
                  onPress={() => handleAnswer(index, option)}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
             </View>
            </View>
          ))}
      

          {loading ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <Text> </Text>
          )}
          <View
            style={{
              display: "flex",
              alignSelf: "center",
              width: wp(30),
              margin: 10,
            }}
          >
            <TouchableOpacity
              style={style.ButtonView}
              onPress={async () => {
                const isCorrect = answers.every((answer, index) => answer === shuffledQuestions[index].correct);
                if (isCorrect) {
                  setLoading(true);
                  try {
                    const user = await AsyncStorageLib.getItem("user");
                      let wallets = [];
                      const data = await AsyncStorageLib.getItem(
                        `${user}-wallets`
                      )
                        .then((response) => {
                          console.log(response);
                          JSON.parse(response).map((item) => {
                            wallets.push(item);
                          });
                        })
                        .catch((e) => {
                          setWalletVisible(false);
                          setVisible(false);
                          setModalVisible(false);
                          console.log(e);
                        });
  
                      //wallets.push(accounts)
                      const allWallets = [
                        {
                          address: Wallet.address,
                          privateKey: Wallet.privateKey,
                          name: Wallet.accountName,
                          mnemonic: Wallet.mnemonic,
                          walletType: "Multi-coin",
                          xrp: {
                            address: Wallet.xrp.address,
                            privateKey: Wallet.xrp.privateKey,
                          },
                          wallets: wallets,
                        },
                      ];
                      // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))
  
                      dispatch(AddToAllWallets(allWallets, user)).then(
                        (response) => {
                          if (response) {
                            if (response.status === "Already Exists") {
                              alert(
                                "error",
                                "Account with same name already exists"
                              );
                              setLoading(false);
                              return;
                            } else if (response.status === "success") {
                              AsyncStorageLib.setItem("currentWallet",Wallet?.accountName)
                              dispatch(
                                setCurrentWallet(
                                  Wallet?.address,
                                  Wallet?.accountName,
                                  Wallet?.privateKey,
                                  Wallet?.mnemonic ? Wallet.mnemonic : ""
                                )
                              )
                              setTimeout(() => {
                                setLoading(false);
                                SetVisible(false);
                                setModalVisible(false);
                                SetPrivateKeyVisible(false);
                                setNewWalletVisible(false);
                                navigation.navigate("AllWallets");
                              }, 0);
                            } else {
                              alert("error", "failed please try again");
                              return;
                            }
                          }
                        }
                      );
  
                      // dispatch(getBalance(wallet.address))
                      //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
                  } catch (e) {
                    setLoading(false);
                    SetVisible(false);
                    setModalVisible(false);
                    SetPrivateKeyVisible(false);
                    setNewWalletVisible(false);
                    alert("error", "Failed to import wallet. Please try again");
                  }
                } else {
                  alert("error","Incorrect Answers, please try again");
                  setAnswers(Array(4).fill(null));
                  shuffleQuestions();
                }
              }}
            >
              <Text style={{ color: "white" }}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default CheckNewWalletMnemonic;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(85),
    width: wp(95),
    borderRadius: 20,
    alignSelf: "center",
    borderColor:"#145DA0",
    borderWidth:0.9,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: "200",
    color: "black",
    marginLeft: 10,
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
    display: "flex",
    flexDirection: "row",
    alignContent: "space-around",
    alignItems: "center",
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("85"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(20),
    width: wp(85),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  input2: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(5),
    width: wp(90),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  verifyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: hp(1),
  },
  wordText: {
    color: "#fff",
    textAlign: "center",
    marginTop: hp(1),
    width: wp(88),
    marginHorizontal: wp(5),
  },
  itemText: {
    textAlign: "left",
    marginVertical: 6,
    marginHorizontal: wp(1.5),
  },
  ButtonView: {
    backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    width: wp(85),
    alignSelf: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: hp(3),
    borderColor:"#145DA0",
    borderWidth:0.9,
  },
  crossIcon:{
    alignSelf:"flex-end",
    padding:hp(1.5)
  }
});
