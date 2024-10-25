import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
  ScrollView,
} from "react-native";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { getBalance, getEthBalance } from "../../components/Redux/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RPC, urls } from "../constants";
import {
  getNonce,
  getGasPrice,
  sendSignedTx,
  getAmountsOut,
  SendTransaction,
  approveSwap,
  isFloat,
  isInteger,
} from "../../utilities/utilities";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

import Modal2 from "react-native-modal";
import TokenList from "../tokens/TokenList";
import TokenHeader from "../tokens/TokenHeader";
import {
  getETHtoTokenPrice,
  getTokentoEthPrice,
} from "../tokens/swapFunctions";
import { tokenTotokenPrice } from "../tokens/UniswapFunctions";
import tokenList from "../tokens/tokenList.json";
import PancakeList from "../tokens/pancakeSwap/PancakeList.json";
import chooseSwap from "../tokens/chooseSwap.json";
import { getSwapPrice } from "../tokens/pancakeSwap/pancakeFunctions";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import SwapPinModal from "./swapPinModal";
import Xrpimage from "../../../assets/xrp.png";

import {
  getBnbTokenBalance,
  getEthTokenBalance,
} from "../../utilities/web3utilities";
import { SwapEthForTokens } from "../tokens/swapFunctions";
import { SwapTokensToTokens, UniSwap } from "../tokens/UniswapFunctions";
import { useBiometricsForSwapTransaction } from "../../biometrics/biometric";
import { alert } from "../reusables/Toasts";
import { Wallet_screen_header } from "../reusables/ExchangeHeader";

const SwapModal = ({ modalVisible, setModalVisible, onCrossPress }) => {
  const FOCUSED=useIsFocused()
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [openChain, setOpenChain] = useState(false);
  const [chooseChain, setChooseChain] = useState([]);
  const [swapType, setSwapType] = useState("");
  const [name, setName] = useState("Swap");
  const [amount, setAmount] = useState("0");
  const [amount2, setAmount2] = useState("0");
  const [visible, setVisible] = useState(false);
  const [Tradevisible, setTradeVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [label2, setLabel2] = useState("");
  const [trade, setTrade] = useState();
  const [walletType, setWalletType] = useState("");
  const [pinViewVisible, setPinViewVisible] = useState(false);
  const [disable, setDisable] = useState(true);
  const [message, setMessage] = useState("");
  const [coin0, setCoin0] = useState(
    {
      name: "Ethereum",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      symbol: "WETH",
      ChainId: "1",
      logoUri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    }
    // {
    //   name: "Ethereum",
    //   address: "",
    //   symbol: "",
    //   ChainId: "",
    //   logoUri: "",
    // }
   );
  const [coin1, setCoin1] = useState({
    name: "1inch",
    address: "0x111111111117dC0aa78b770fA6A738034120C302",
    symbol: "1INCH",
    ChainId: "1",
    logoUri: "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
  });
  const [tradePrice, setTradePrice] = useState({
    token1totoken2: "0",
    token2totoken1: "0",
  });
  const [Data, setData] = useState([]);
  const [coinType, setCoinType] = useState();
  const navigation = useNavigation();
  console.log(state.wallet);
  
    useEffect(() => {
      setPinViewVisible(false)
      const fetchData = async () => {
        try {
          let bal = await AsyncStorageLib.getItem("EthBalance");
          setBalance(bal)
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
  }, [FOCUSED]);

  const dispatch = useDispatch();
  const SaveTransaction = async (type, hash, walletType, chainType) => {
    const user = await state.user;
    let userTransactions = [];

    await AsyncStorageLib.getItem(`${user}-transactions`).then(
      async (transactions) => {
        console.log(JSON.parse(transactions));
        const data = JSON.parse(transactions);
        if (data) {
          data.map((item) => {
            userTransactions.push(item);
          });
          console.log(userTransactions);
          let txBody = {
            hash,
            type,
            walletType,
            chainType,
          };
          userTransactions.push(txBody);
          await AsyncStorageLib.setItem(
            `${user}-transactions`,
            JSON.stringify(userTransactions)
          );
          return userTransactions;
        } else {
          let transactions = [];
          let txBody = {
            hash,
            type,
            walletType,
            chainType,
          };
          transactions.push(txBody);
          await AsyncStorageLib.setItem(
            `${user}-transactions`,
            JSON.stringify(transactions)
          );
          return transactions;
        }
      }
    );
  };

  const pancakeSwap = async (decrypt) => {
    setLoading(true);
    setVisible(false);
    const token = await state.token;

    const Wallet = await state.wallet.address;
    if (!Wallet) {
      return alert("error", "please select a wallet first");
    }
    if (!amount || !coin0.address || !coin1.address) {
      setLoading(false);

      return alert("error", "All places are mandatory");
    }

    /*if(balance<=0){
          setLoading(false)
          console.log(balance)
          return alert('You do not have enough balance to make this transaction')
        }
      
        if(amount>=balance){
          setLoading(false)
          console.log(balance)
          return alert('You do not have enough balance to make this transaction')
        }
      
        
        if(token1===token2){
          setLoading(false)
          return alert('Same tokens cannot be swaped')
        }*/

    const addresses = {
      WBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
      bnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
      USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      DAI: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
      ETH: "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378",
      factory: "0x182859893230dC89b114d6e2D547BFFE30474a21",
      router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
    };

    let address1 = coin0.address;
    let address2 = coin1.address;
    console.log(address1);

    console.log(address2);
    const PRIVATE_KEY = decrypt;

    const provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(wallet);
    const gasPrice = await provider.getGasPrice();

    // const amountIn = (await ethers).utils.parseUnits(input.amount, "ether");
    const gas = {
      gasPrice: gasPrice,
      gasLimit: "500000",
    };

    const amountIn = (await ethers).utils.parseUnits(amount, "ether");

    // console.log(Contract)
    try {
      if (coin0.symbol == "BNB") {
        const type = "BNBTOTOKEN";

        console.log("starting");
        const RouterABI = [
          "function swapExactETHForTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual returns (uint256[] memory amounts)",
          "function swapExactETHForTokensSupportingFeeOnTransferTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual",
        ];

        const pancakeRouterContract = new ethers.Contract(
          addresses.router,
          RouterABI
        );
        // const amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, address2]);
        const amountOutMin = await getAmountsOut(
          amountIn,
          address1,
          address2,
          type
        );

        const nonce = await provider.getTransactionCount(wallet.address); // get from '/getNonce' route
        const gasLimit = 500000;
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

        const unsignedTx =
          await pancakeRouterContract.populateTransaction.swapExactETHForTokens(
            amountOutMin,
            [addresses.WBNB, address2],
            wallet.address,
            deadline,
            {
              nonce,
              gasPrice,
              gasLimit,
              value: amountIn,
            }
          );

        const signedTx = await wallet.signTransaction(unsignedTx);
        console.log(signedTx);
        const tx = await provider.sendTransaction(signedTx); //SendTransaction(signedTx,token)
        // const txx = await tx.wait()
        console.log(tx);
        if (tx.hash) {
          const type = "Swap";
          try {
            const chainType = "BSC";
            const saveTransaction = await SaveTransaction(
              type,
              tx.hash,
              walletType,
              chainType
            );
            console.log(saveTransaction);
            // await getCustomBalance()
            alert("success", "Your Tx Hash : " + tx.hash);
            navigation.navigate("Transactions");
          } catch (e) {
            alert("error", e);
            console.log(e);
          }
        } else {
          alert("error", "transaction failed");
        }
      } else if (coin1.symbol === "BNB") {
        const type = "TOKENTOBNB";
        const approve = await approveSwap(address1, amountIn, decrypt, token);
        console.log(approve);
        console.log("starting swap to bnb");
        const wallet = new ethers.Wallet(PRIVATE_KEY);

        const RouterABI = [
          "function swapExactTokensForETH( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external virtual returns (uint256[] memory amounts)",
          "function swapExactTokensForETHSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual",
        ];

        const pancakeRouterContract = new ethers.Contract(
          addresses.router,
          RouterABI
        );

        const amountsOutMin = await getAmountsOut(
          amountIn,
          address1,
          address2,
          type
        );

        const nonce = await provider.getTransactionCount(wallet.address); // get from '/getNonce' route
        // get from '/getNonce' route
        const gasPrice = provider.getGasPrice(); // get from '/getGasPrice' route
        const gasLimit = 500000;
        const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10;

        const unsignedTx =
          await pancakeRouterContract.populateTransaction.swapExactTokensForETH(
            amountIn,
            amountsOutMin,
            [address1, addresses.WBNB],
            wallet.address,
            DEADLINE,
            {
              nonce,
              gasPrice,
              gasLimit,
            }
          );

        const signedTx = await wallet.signTransaction(unsignedTx);
        console.log(signedTx);
        const Tx = await provider.sendTransaction(signedTx); //SendTransaction(signedTx,token)
        //const tx = await sendSignedTx.wait()
        // console.log(tx.Hash)
        if (Tx.hash) {
          const type = "Swap";
          const chainType = "BSC";
          const saveTransaction = await SaveTransaction(
            type,
            Tx.hash,
            walletType,
            chainType
          );
          console.log(saveTransaction);
          //await getCustomBalance()
          alert("success", "Your Tx Hash : " + Tx.hash);
          navigation.navigate("Transactions");
        } else {
          alert("error", "Swap failed");
        }
      } else {
        const type = "TOKENTOTOKEN";

        const approve = await approveSwap(address1, amountIn, decrypt, token);
        console.log(approve);

        const RouterABI = [
          "function swapExactTokensForTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)",
          "function swapExactTokensForTokensSupportingFeeOnTransferTokens( uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external virtual returns (uint256[] memory amounts)",
        ];

        const pancakeRouterContract = new ethers.Contract(
          addresses.router,
          RouterABI
        );
        const amountsOutMin = getAmountsOut(amountIn, address1, address2, type);

        const nonce = await provider.getTransactionCount(wallet.address); // get from '/getNonce' route
        // get from '/getNonce' route
        const gasPrice = provider.getGasPrice();
        const gasLimit = 500000;
        const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10;

        const unsignedTx =
          await pancakeRouterContract.populateTransaction.swapExactTokensForTokens(
            amountIn,
            amountsOutMin,
            [address1, address2],
            wallet.address,
            DEADLINE,
            {
              nonce,
              gasPrice,
              gasLimit,
            }
          );

        const signedTx = await wallet.signTransaction(unsignedTx);
        console.log(signedTx);
        const Tx = await provider.sendTransaction(signedTx); //SendTransaction(signedTx,token)
        console.log(Tx.hash);
        if (Tx.hash) {
          const type = "Swap";
          const chainType = "BSC";
          const saveTransaction = await SaveTransaction(
            type,
            Tx.hash,
            walletType,
            chainType
          );
          console.log(saveTransaction);
          //await getCustomBalance()
          alert("success", "Your Tx Hash : " + Tx.hash);
          navigation.navigate("Transactions");
        } else {
          alert("error", "Swap failed");
        }
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      alert(e);
    }
    setLoading(false);
  };

  async function swapTokens() {
    try {
      setLoading(true);
      const walletType = await AsyncStorage.getItem("walletType");
      console.log(JSON.parse(walletType));
      const Wallet = await state.wallet;
      console.log(Wallet);
      if (JSON.parse(walletType) === "Ethereum") {
        if (Wallet) {
          if (coin0.symbol === "WETH") {
            await SwapEthForTokens(
              Wallet.privateKey,
              Wallet.address,
              coin1.address,
              amount
            )
              .then(async (response) => {
                console.log(response);
                if (response) {
                  if (response.code === 400) {
                    return alert("error", "server error please try again");
                  } else if (response.code === 401) {
                    console.log(response);
                    const type = "Swap";
                    const wallettype = JSON.parse(walletType);
                    const chainType = "Eth";
                    await SaveTransaction(
                      type,
                      response.tx.transactionHash,
                      wallettype,
                      chainType
                    )
                      .then((resp) => {
                        setLoading(false);
                        setTradeVisible(false);
                        setModalVisible(false);
                        alert(
                          "success",
                          "Your Tx Hash : " + response.tx.transactionHash
                        );
                        navigation.navigate("Transactions");
                      })
                      .catch((e) => {
                        setLoading(false);
                        alert("error", e.message);
                        console.log(e);
                      });
                  } else if (response.code === 404) {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "pair not found");
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", response);
                  }
                } else {
                  setLoading(false);
                  setTradeVisible(false);
                  return alert("success", "server error");
                }
              })
              .catch((e) => {
                setLoading(false);
                setTradeVisible(false);
                alert("error", e.message);
                console.log(e);
              });
          } else if (coin1.symbol === "WETH") {
            await UniSwap(
              Wallet.privateKey,
              Wallet.address,
              coin0.address,
              amount
            )
              .then(async (response) => {
                console.log(response);
                if (response) {
                  if (response.code === 401) {
                    console.log("Your Tx Hash : " + response.tx);
                    const type = "Swap";
                    const wallettype = JSON.parse(walletType);
                    const chainType = "Eth";
                    await SaveTransaction(
                      type,
                      response.tx,
                      wallettype,
                      chainType
                    )
                      .then((resp) => {
                        setLoading(false);
                        setTradeVisible(false);
                        setModalVisible(false);
                        setPinViewVisible(false);
                        alert("success", "Your Tx Hash : " + response.tx);
                        navigation.navigate("Transactions");
                      })
                      .catch((e) => {
                        setLoading(false);
                        setTradeVisible(false);
                        alert("error", e.message);
                        console.log(e);
                      });
                  } else if (response.code === 400) {
                    setLoading(false);
                    return alert(
                      "error",
                      "error while swapping. please try again"
                    );
                  } else if (response === 404) {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "pair not found");
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", response);
                  }
                } else {
                  setLoading(false);
                  setTradeVisible(false);
                  return alert("error", "server error");
                }
              })
              .catch((e) => {
                setLoading(false);
                setTradeVisible(false);
                console.log(e);
              });
          } else {
            await SwapTokensToTokens(
              Wallet.privateKey,
              Wallet.address,
              coin0.address,
              coin1.address,
              amount
            )
              .then(async (response) => {
                console.log(response);
                if (response) {
                  if (response.code == 401) {
                    console.log(response);
                    const type = "Swap";
                    const wallettype = JSON.parse(walletType);
                    const chainType = "Eth";
                    const saveTransaction = await SaveTransaction(
                      type,
                      response.tx,
                      wallettype,
                      chainType
                    )
                      .then((resp) => {
                        setLoading(false);
                        setTradeVisible(false);
                        setModalVisible(false);
                        alert("success", "Your Tx Hash : " + response.tx);
                        navigation.navigate("Transactions");
                      })
                      .catch((e) => {
                        setLoading(false);
                        setTradeVisible(false);
                        alert("error", e.message);
                        console.log(e);
                      });
                  } else if (response === 404) {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "pair not found");
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", response);
                  }
                } else {
                  setLoading(false);
                  setTradeVisible(false);
                  return alert("error", "server error");
                }
              })
              .catch((e) => {
                setLoading(false);
                setTradeVisible(false);
                alert(e.message);
                console.log(e);
              });
          }
        } else {
          setLoading(false);
          alert("error", "no wallets found");
        }
      } else if (JSON.parse(walletType) === "BSC") {
        const swap = await pancakeSwap(Wallet.privateKey);
        setLoading(false);
        setModalVisible(false);
        setTradeVisible(false);
      } else if (JSON.parse(walletType) === "Multi-coin") {
        if (swapType === "ETH") {
          if (Wallet) {
            if (coin0.symbol === "WETH") {
              await SwapEthForTokens(
                Wallet.privateKey,
                Wallet.address,
                coin1.address,
                amount
              )
                .then(async (response) => {
                  console.log(response);
                  if (response) {
                    if (response.code === 400) {
                      return alert("error", "server error please try again");
                    } else if (response.code === 401) {
                      console.log(response);
                      const type = "Swap";
                      const wallettype = JSON.parse(walletType);
                      const chainType = "Eth";
                      await SaveTransaction(
                        type,
                        response.tx.transactionHash,
                        wallettype,
                        chainType
                      )
                        .then((resp) => {
                          setLoading(false);
                          setTradeVisible(false);
                          setModalVisible(false);
                          alert(
                            "success",
                            "Your Tx Hash : " + response.tx.transactionHash
                          );
                          navigation.navigate("Transactions");
                        })
                        .catch((e) => {
                          setLoading(false);
                          console.log(e);
                        });
                    } else if (response.code === 404) {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert("error", "pair not found");
                    } else {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert("success", response);
                    }
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "server error");
                  }
                })
                .catch((e) => {
                  setLoading(false);
                  setTradeVisible(false);
                  alert("success", e.message);
                  console.log(e);
                });
            } else if (coin1.symbol === "WETH") {
              await UniSwap(
                Wallet.privateKey,
                Wallet.address,
                coin0.address,
                amount
              )
                .then(async (response) => {
                  console.log(response);
                  if (response) {
                    if (response.code === 401) {
                      console.log("Your Tx Hash : " + response.tx);
                      const type = "Swap";
                      const wallettype = JSON.parse(walletType);
                      const chainType = "Eth";
                      await SaveTransaction(
                        type,
                        response.tx,
                        wallettype,
                        chainType
                      )
                        .then((resp) => {
                          setLoading(false);
                          setTradeVisible(false);
                          setModalVisible(false);
                          alert("success", "Your Tx Hash : " + response.tx);
                          navigation.navigate("Transactions");
                        })
                        .catch((e) => {
                          setLoading(false);
                          setTradeVisible(false);
                          alert("error", e.message);
                          console.log(e);
                        });
                    } else if (response.code === 400) {
                      setLoading(false);
                      return alert(
                        "error",
                        "error while swapping. please try again"
                      );
                    } else if (response === 404) {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert("error", "pair not found");
                    } else {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert("error", response);
                    }
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "server error");
                  }
                })
                .catch((e) => {
                  setLoading(false);
                  setTradeVisible(false);
                  alert("error", e.message);
                  console.log(e);
                });
            } else {
              await SwapTokensToTokens(
                Wallet.privateKey,
                Wallet.address,
                coin0.address,
                coin1.address,
                amount
              )
                .then(async (response) => {
                  console.log(response);
                  if (response) {
                    if (response.code == 401) {
                      console.log(response);
                      const type = "Swap";
                      const wallettype = JSON.parse(walletType);
                      const chainType = "Eth";
                      const saveTransaction = await SaveTransaction(
                        type,
                        response.tx,
                        wallettype,
                        chainType
                      )
                        .then((resp) => {
                          setLoading(false);
                          setTradeVisible(false);
                          setModalVisible(false);
                          alert("success", "Your Tx Hash : " + response.tx);
                          navigation.navigate("Transactions");
                        })
                        .catch((e) => {
                          setLoading(false);
                          setTradeVisible(false);
                          console.log(e);
                        });
                    } else if (response === 404) {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert("error", "pair not found");
                    } else {
                      setLoading(false);
                      setTradeVisible(false);
                      return alert(response);
                    }
                  } else {
                    setLoading(false);
                    setTradeVisible(false);
                    return alert("error", "server error");
                  }
                })
                .catch((e) => {
                  setLoading(false);
                  setTradeVisible(false);
                  alert("error", e.message);
                  console.log(e);
                });
            }
          } else {
            setLoading(false);
            alert("error", "no wallets found");
          }
        } else if (swapType === "BSC") {
          const swap = await pancakeSwap(Wallet.privateKey);
          setLoading(false);
          setModalVisible(false);
          setTradeVisible(false);
        }
      }
    } catch (e) {
      setLoading(false);
      setTradeVisible(false);
      alert("error", e.message);
      console.log(e);
    }
  }
  useEffect( () => {
    const fetchData = async () => {
      try {
        AsyncStorage.getItem("walletType").then(async (type) => {
          console.log(JSON.parse(type));
          const Type = JSON.parse(type);
          setWalletType(Type);
    
          if (Type === "Multi-coin") {
            setData(chooseSwap);
            setChooseChain(chooseSwap);
          } else if (Type === "Ethereum") {
            const data = tokenList.reverse();
            // console.log(data)
            setChooseChain(data);
            setData(data);
          } else if (Type === "BSC") {
            const data = PancakeList;
            // console.log(data);
            setChooseChain(data);
            setData(data);
          }
        });
    
      } catch (e) {
        console.error(e);  // Use console.error for errors
      }
    };
  
    fetchData();
    /* await getPrice(coin0.address,coin1.address)
       .then((response)=>{
        console.log(response)
        setTradePrice(response)

       })*/
  }, []);

  useEffect( () => {
    const fetchData = async () => {
      try {
    AsyncStorage.getItem("walletType").then(async (type) => {
      console.log(JSON.parse(type));
      const Type = JSON.parse(type);
      setWalletType(Type);

      if (Type === "Multi-coin") {
        setData(chooseSwap);
        setChooseChain(chooseSwap);
      } else if (Type === "Ethereum") {
        const data = tokenList.reverse();
        // console.log(data)
        setChooseChain(data);
        setData(data);
      } else if (Type === "BSC") {
        const data = PancakeList;
        console.log(data);
        setChooseChain(data);
        setData(data);
      }
    });
  } catch (e) {
    console.error(e);  // Use console.error for errors
  }
};

fetchData();

    /* await getPrice(coin0.address,coin1.address)
       .then((response)=>{
        console.log(response)
        setTradePrice(response)

       })*/
  }, [state.wallet]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(coin0);
        if (coin0.ChainId === 1 || coin0.ChainId === 5) {
          const data = tokenList;
          // console.log(data)
          setData(data);
        } else {
          const data = PancakeList;
          //  console.log(data)
          setData(data);
        }
      } catch (e) {
        console.error(e);  // Use console.error for errors
      }
    }
    fetchData();
  }, [coin0.name]);

  useEffect( () => {
    const fetchData=async()=>{
      try {
        const walletType = await AsyncStorageLib.getItem("walletType");

        const address = await state.wallet.address;
    
        if (JSON.parse(walletType) === "Ethereum") {
          if (coin0.symbol === "WETH") {
            console.log(await state.EthBalance);
            setBalance(await state.EthBalance);
            return;
          } else if (coin0.ChainId === 1 || coin0.ChainId === 5) {
            await getEthTokenBalance(address, coin0.address).then((balance) => {
              console.log("My Token Balance", balance);
              setBalance(balance);
            });
          } else {
            setBalance(0);
          }
        } else if (JSON.parse(walletType) === "BSC") {
          if (coin0.symbol === "BNB") {
            console.log(await state.walletBalance);
            setBalance(await state.walletBalance);
            return;
          } else if (coin0.ChainId === 56) {
            await getBnbTokenBalance(address, coin0.address).then((balance) => {
              console.log(balance);
              setBalance(balance);
            });
          } else {
            setBalance(0);
          }
        } else if (JSON.parse(walletType) === "Multi-coin") {
          if (coin0.ChainId === 56) {
            if (coin0.symbol === "BNB") {
              console.log(await state.walletBalance);
              setBalance(await state.walletBalance);
              return;
            }
            await getBnbTokenBalance(address, coin0.address).then((balance) => {
              console.log(balance);
              setBalance(balance);
            });
          } else if (coin0.ChainId === 1 || coin0.ChainId === 5) {
            if (coin0.symbol === "WETH") {
              console.log(await state.EthBalance);
              setBalance(await state.EthBalance);
              return;
            }
            await getEthTokenBalance(address, coin0.address).then((balance) => {
              console.log("My Token Balance", balance);
              setBalance(balance);
            });
          }
        }
      } catch (error) {
        console.log(e)
      }
    }
    fetchData()
  }, [coin0.address]);

  useEffect(() => {
   const fetch=async()=>{
    try {
      let inputValidation;
      let inputValidation1;
      inputValidation = isFloat(amount);
      inputValidation1 = isInteger(amount);
  
      if (
        coin1.address &&
        coin0.address &&
        amount != 0 &&
        Number(amount) < Number(balance) &&
        (inputValidation || inputValidation1)
      ) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } catch (error) {
      console.log(e)
    }
   }
   fetch()
  }, [coin0, coin1, amount]);

  useEffect(() => {
    let inputValidation;
    let inputValidation1;
    inputValidation = isFloat(amount);
    inputValidation1 = isInteger(amount);

    if (amount != 0) {
      console.log(amount > balance);
      if (amount > balance) {
        setDisable(true);
        setMessage("Low Balance");
        alert("error", "Low Balance");
      } else if (!inputValidation && !inputValidation1) {
        setMessage("Please enter a valid amount");
        alert("error", "Please enter a valid amount");
      } else {
        setMessage("");
      }
    } else {
      setMessage("");
    }
  }, [amount]);

  const swap_get= async(amount)=>{
    setLoading2(true);
    console.log(coin1.address);
    const token = await state.token;

    const Wallet = await state.wallet;
    console.log(Wallet);
    console.log(amount);
    try {
      if (walletType === "Ethereum") {
        if (Wallet) {
          if (coin0.symbol === "WETH") {
            await getETHtoTokenPrice(coin1.address, amount)
              .then((resp) => {
                console.log(resp);
                if (resp) {
                  console.log(resp);
                  setLoading2(false);
                  setTradePrice({
                    token1totoken2: resp.token1totoken2,
                    token2totoken1: resp.token2totoken1,
                  });
                  setTrade(resp.trade);
                }
              })
              .catch((e) => {
                setLoading2(false);
                console.log(e);
              });
          } else if (coin1.symbol === "WETH") {
            await getTokentoEthPrice(coin0.address, amount)
              .then((resp) => {
                console.log(resp);
                if (resp) {
                  console.log(resp);
                  setTradePrice({
                    token1totoken2: resp.token1totoken2,
                    token2totoken1: resp.token2totoken1,
                  });
                  setTrade(resp.trade);
                  setLoading2(false);
                }
              })
              .catch((e) => {
                setLoading2(false);

                console.log(e);
              });
          } else {
            tokenTotokenPrice(
              Wallet.address,
              coin0.address,
              coin1.address,
              amount
            )
              .then((response) => {
                console.log(response);
                setTradePrice({
                  token1totoken2: response.token1totoken2,
                  token2totoken1: response.token2totoken1,
                });
                setTrade(response.trade);
                setLoading2(false);
              })
              .catch((e) => {
                console.log(e);
                setLoading2(false);
                return alert(
                  "error",
                  "error fetching pair prices. please try again"
                );
              });
          }
        }
      } else if (walletType === "BSC") {
        let amountIn = (await ethers).utils.parseUnits(
          amount,
          "ether"
        );
        let type;
        if (coin0.symbol === "BNB") {
          type = "BNBTOTOKEN";
          await getSwapPrice(
            amountIn,
            coin0.address,
            coin1.address,
            type
          )
            .then((response) => {
              console.log(response);
              const trade = {
                slippageTolerance: 1,
                minimumAmountOut: response.token1totoken2,
              };
              console.log(response.token1totoken2);
              setTradePrice({
                token1totoken2: response.token1totoken2,
                token2totoken1: response.token2totoken1,
              });
              setTrade(trade);
              setLoading2(false);
            })
            .catch((e) => {
              setLoading2(false);
              console.log(e);
            });
        } else if (coin1.symbol === "BNB") {
          type = "TOKENTOBNB";
          await getSwapPrice(
            amountIn,
            coin0.address,
            coin1.address,
            type
          )
            .then((response) => {
              const trade = {
                slippageTolerance: 1,
                minimumAmountOut: response.token1totoken2,
              };
              console.log(response.token1totoken2);
              setTradePrice({
                token1totoken2: response.token1totoken2,
                token2totoken1: response.token2totoken1,
              });
              setTrade(trade);
              setLoading2(false);
            })
            .catch((e) => {
              setLoading2(false);
              console.log(e);
            });
        } else {
          type = "TOKENTOTOKEN";
          const approve = await approveSwap(
            coin0.address,
            amountIn,
            Wallet.privateKey,
            token
          ).then(async (next) => {
            await getSwapPrice(
              amountIn,
              coin0.address,
              coin1.address,
              type
            )
              .then(async (response) => {
                const trade = {
                  slippageTolerance: 1,
                  minimumAmountOut: response.token1totoken2,
                };
                console.log(response.token1totoken2);
                setTradePrice({
                  token1totoken2: response.token1totoken2,
                  token2totoken1: response.token2totoken1,
                });
                setTrade(trade);
                setLoading2(false);
              })
              .catch((e) => {
                setLoading2(false);
                alert(
                  "error",
                  "Insufficient liquidity. please try with a different token"
                );
                console.log(e);
              });
          });
          console.log(approve);
          setLoading2(false);
        }
      } else if (walletType === "Multi-coin") {
        if (swapType === "ETH") {
          if (Wallet) {
            if (coin0.symbol === "WETH") {
              await getETHtoTokenPrice(coin1.address, amount)
                .then((resp) => {
                  console.log(resp);
                  if (resp) {
                    console.log(resp);
                    setLoading2(false);
                    setTradePrice({
                      token1totoken2: resp.token1totoken2,
                      token2totoken1: resp.token2totoken1,
                    });
                    setTrade(resp.trade);
                  }
                })
                .catch((e) => {
                  setLoading2(false);
                  console.log(e);
                });
            } else if (coin1.symbol === "WETH") {
              await getTokentoEthPrice(coin0.address, amount)
                .then((resp) => {
                  console.log(resp);
                  if (resp) {
                    console.log(resp);
                    setTradePrice({
                      token1totoken2: resp.token1totoken2,
                      token2totoken1: resp.token2totoken1,
                    });
                    setTrade(resp.trade);
                    setLoading2(false);
                  }
                })
                .catch((e) => {
                  setLoading2(false);

                  console.log(e);
                });
            } else {
              tokenTotokenPrice(
                Wallet.address,
                coin0.address,
                coin1.address,
                amount
              )
                .then((response) => {
                  console.log(response);
                  setTradePrice({
                    token1totoken2: response.token1totoken2,
                    token2totoken1: response.token2totoken1,
                  });
                  setTrade(response.trade);
                  setLoading2(false);
                })
                .catch((e) => {
                  console.log(e);
                  setLoading2(false);
                  return alert("error", e.message);
                });
            }
          }
        } else if (swapType === "BSC") {
          console.log(coin0.address, coin1.address);
          let amountIn = (await ethers).utils.parseUnits(
            amount,
            "ether"
          );
          console.log("My amount", amountIn);
          let type;
          if (coin0.symbol === "BNB") {
            type = "BNBTOTOKEN";
            await getSwapPrice(
              amountIn,
              coin0.address,
              coin1.address,
              type
            )
              .then((response) => {
                console.log(response);
                const trade = {
                  slippageTolerance: 1,
                  minimumAmountOut: response.token1totoken2,
                };
                console.log(response);
                setTradePrice({
                  token1totoken2: response.token1totoken2,
                  token2totoken1:
                    Number(amount) / Number(response.token1totoken2),
                });
                setTrade(trade);
                setLoading2(false);
              })
              .catch((e) => {
                setLoading2(false);
                console.log(e);

              });
          } else if (coin1.symbol === "BNB") {
            type = "TOKENTOBNB";
            await getSwapPrice(
              amountIn,
              coin0.address,
              coin1.address,
              type
            )
              .then((response) => {
                const trade = {
                  slippageTolerance: 1,
                  minimumAmountOut: response.token1totoken2,
                };
                console.log(response.token1totoken2);
                setTradePrice({
                  token1totoken2: response.token1totoken2,
                  token2totoken1:
                    Number(amount) / Number(response.token1totoken2),
                });
                setTrade(trade);
                setLoading2(false);
              })
              .catch((e) => {
                setLoading2(false);
                console.log(e);

              });
          } else {
            type = "TOKENTOTOKEN";
            const approve = await approveSwap(
              coin0.address,
              amountIn,
              Wallet.privateKey,
              token
            ).then(async (next) => {
              await getSwapPrice(
                amountIn,
                coin0.address,
                coin1.address,
                type
              )
                .then(async (response) => {
                  const trade = {
                    slippageTolerance: 1,
                    minimumAmountOut: response.token1totoken2,
                  };
                  console.log(response.token1totoken2);
                  setTradePrice({
                    token1totoken2: response.token1totoken2,
                    token2totoken1:
                      Number(amount) /
                      Number(response.token1totoken2),
                  });
                  setTrade(trade);
                  setLoading2(false);
                })
                .catch((e) => {
                  setLoading2(false);
                  alert(
                    "error",
                    "Insufficient liquidity. please try with a different token"
                  );
                  console.log(e);
                });
            });
            console.log(approve);
            setLoading2(false);
          }
        }
      } else {
        return alert("error", "Swap not supported for chain");
      }
    } catch (e) {
      setLoading2(false);
    }
  
          }


  return (
    <View
      // style={{ marginTop: hp(50) }}
      onStartShouldSetResponder={() => Keyboard.dismiss()}
    >
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating
        statusBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={[styles.mainContainermodal,{backgroundColor:state.THEME.THEME===false?"white":"black"}]}>
        <Wallet_screen_header title="Swap" onLeftIconPress={() => {setModalVisible(!modalVisible),setTrade(0)}} />
          <View style={styles.cardBoxContainer}>
            {/* <TokenHeader setVisible={setModalVisible} name={name} /> */}
            <View
              style={styles.cardmainContainer}
              onStartShouldSetResponder={() => Keyboard.dismiss()}
            >
              <View style={styles.tokenView}>
                {/* <Text style={{ color: "#C1BDBD" }}>You Pay</Text> */}
                <Text style={{ color: state.THEME.THEME===false?"black":"#fff" }}>You Pay</Text>
                {/* <Text style={{ color: state.THEME.THEME===false?"black":"#fff" }}>{coin0.name}</Text> */}
              </View>
              <View style={styles.tokenView}>
                <TextInput
                  keyboardType="numeric"
                  returnKeyType="done"
                  onChangeText={(text) => {
                    swap_get(text);
                    setAmount(text);
                  }}
                  placeholder="0"
                  placeholderTextColor={"gray"}
                  style={[styles.textinputCon,{backgroundColor:state.THEME.THEME===false?"#fff":"black",color:state.THEME.THEME===false?"black":"#fff",fontSize:19}]}
                />
                <TouchableOpacity
                  onPress={() => {
                    setCoinType("0");
                    setOpenChain(true);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: wp(5),
                  }}
                >
                  <Image
                    source={{
                      uri: coin0.logoUri
                        ? coin0.logoUri
                        : "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
                    }}
                    style={{ height: hp(4), width: wp(8.3) }}
                  />
                  <Text style={{ marginRight: wp(5),marginLeft:wp(1),color:state.THEME.THEME===false?"black":"#fff" }}>
                    {coin0.symbol ? coin0.symbol==="WETH"?" ETH":coin0.symbol : "ETH"}
                  </Text>

                <AntDesign
                  onPress={() => {
                    setCoinType("0");
                    setOpenChain(true);
                  }}
                  name={"right"}
                  size={15}
                  color={"#4CA6EA"}
                  style={{ marginRight: wp(1) }}
                  />
                  </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", width: wp(90) }}>
                <Text style={{ marginLeft: wp(5), marginTop: hp(2),color:state.THEME.THEME===false?"black":"#fff" }}>Balance:{" "}</Text>
                <View style={{ width: wp(13) }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(11) }}>
                    <Text style={{ marginLeft: wp(1), marginTop: hp(2),color:state.THEME.THEME===false?"black":"#fff" }}>
                      {balance ? balance : <Text style={{ color:state.THEME.THEME===false?"black":"#fff" }}>0</Text>}
                    </Text>
                  </ScrollView>
                </View>
              </View>

              {/* <Text style={{ color: "black", marginHorizontal: wp(5) }}>
                {" "}
                Balance:
                {balance ? (
                  Number(balance).toFixed(2)
                ) : (
                  <Text style={{ color: "#C1BDBD" }}>0</Text>
                )}
              </Text> */}
              <Text style={styles.color}></Text>
            </View>

            

            <View style={{width:"100%",flexDirection:"row",marginLeft:6,alignItems:"center",marginTop:-45}}>
              <View style={{  borderColor: 'rgba(28, 41, 77, 1)',borderBottomWidth:0.9,width:"60%",borderBlockEndColor: 'gray'}}/>
              <TouchableOpacity style={[styles.swapiconView, { borderColor: "#3574B6", borderWidth: 1, backgroundColor: "#2F7DFF66",marginHorizontal:10 }]} onPress={() => { setCoin0(coin1), setCoin1(coin0) }}>
                <Icon
                  name={"swap-vertical"}
                  size={22}
                  color={"#3574B6"}
                  style={{ alignSelf: "center", marginTop: hp(1) }}
                />
              </TouchableOpacity>
              <View style={{  borderColor: 'rgba(28, 41, 77, 1)',borderBottomWidth:0.9,width:"14%",borderBlockEndColor: 'gray'}}/>
            </View>
            <View
              style={styles.cardmainContainer1}
              onStartShouldSetResponder={() => Keyboard.dismiss()}
            >
              <View style={styles.tokenView}>
                {/* <Text style={{ color: "#C1BDBD" }}>You Get</Text> */}
                <Text style={{ color:state.THEME.THEME===false?"black":"#fff" }}>You Get</Text>
                {/* <Text style={{ color:state.THEME.THEME===false?"black":"#fff" }}> {coin1.name}</Text> */}
              </View>
              <View style={styles.tokenView}>
                <View style={{ flexDirection: "row", width: wp(19) }}>
                  <View style={{ width: wp(13) }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(16) }}>
                      <Text style={{ fontSize:19,marginLeft: wp(1), marginTop: hp(2),color:state.THEME.THEME===false?"black":"#fff" }}>
                        {trade ? `${trade.minimumAmountOut}` : <Text style={{ color:state.THEME.THEME===false?"black":"#fff"}}>0</Text>}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => {
                    setCoinType("1");
                    setVisible(true);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: wp(5),
                  }}
                >
                  <Image
                    source={{
                      uri: coin1.logoUri
                        ? coin1.logoUri
                        : "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png ",
                    }}
                    style={{ height: hp(4), width: wp(8.3) }}
                  />
                  <Text style={{ marginRight: wp(5),marginLeft:wp(1),color:state.THEME.THEME===false?"black":"#fff" }}>
                    { coin1.symbol ? coin1.symbol : "WBTC"}
                  </Text>
                <AntDesign
                  onPress={() => {
                    setCoinType("1");
                    setVisible(true);
                  }}
                  name={"right"}
                  size={15}
                  color={"#4CA6EA"}
                  style={styles.rightICon}
                  />
                  </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ marginTop: 20, color: "red" }}>{message}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              // backgroundColor: disable ? "grey" : "#000C66",
              backgroundColor: disable ? "grey" : "#3574B6",
              width: wp(90),
              padding: hp(1),
              borderRadius: hp(0.6),
              alignItems: "center",
              alignSelf: "center",
              marginTop: hp(8),
            }}
            // onPress={() => {
            //   setTradeVisible(true);
            // }}
            disabled={disable}
            onPress={async () => {
              //setVisible(true)
              setLoading2(true);
              console.log(coin1.address);
              const token = await state.token;

              const Wallet = await state.wallet;
              console.log(Wallet);
              console.log(amount);
              try {
                if (walletType === "Ethereum") {
                  if (Wallet) {
                    if (coin0.symbol === "WETH") {
                      await getETHtoTokenPrice(coin1.address, amount)
                        .then((resp) => {
                          console.log(resp);
                          if (resp) {
                            console.log(resp);
                            setLoading2(false);
                            setTradePrice({
                              token1totoken2: resp.token1totoken2,
                              token2totoken1: resp.token2totoken1,
                            });
                            setTrade(resp.trade);
                            setTradeVisible(true);
                          }
                        })
                        .catch((e) => {
                          setLoading2(false);
                          console.log(e);
                        });
                    } else if (coin1.symbol === "WETH") {
                      await getTokentoEthPrice(coin0.address, amount)
                        .then((resp) => {
                          console.log(resp);
                          if (resp) {
                            console.log(resp);
                            setTradePrice({
                              token1totoken2: resp.token1totoken2,
                              token2totoken1: resp.token2totoken1,
                            });
                            setTrade(resp.trade);
                            setTradeVisible(true);
                            setLoading2(false);
                          }
                        })
                        .catch((e) => {
                          setLoading2(false);

                          console.log(e);
                        });
                    } else {
                      tokenTotokenPrice(
                        Wallet.address,
                        coin0.address,
                        coin1.address,
                        amount
                      )
                        .then((response) => {
                          console.log(response);
                          setTradePrice({
                            token1totoken2: response.token1totoken2,
                            token2totoken1: response.token2totoken1,
                          });
                          setTrade(response.trade);
                          setTradeVisible(true);
                          setLoading2(false);
                        })
                        .catch((e) => {
                          console.log(e);
                          setLoading2(false);
                          return alert(
                            "error",
                            "error fetching pair prices. please try again"
                          );
                        });
                    }
                  }
                } else if (walletType === "BSC") {
                  let amountIn = (await ethers).utils.parseUnits(
                    amount,
                    "ether"
                  );
                  let type;
                  if (coin0.symbol === "BNB") {
                    type = "BNBTOTOKEN";
                    await getSwapPrice(
                      amountIn,
                      coin0.address,
                      coin1.address,
                      type
                    )
                      .then((response) => {
                        console.log(response);
                        const trade = {
                          slippageTolerance: 1,
                          minimumAmountOut: response.token1totoken2,
                        };
                        console.log(response.token1totoken2);
                        setTradePrice({
                          token1totoken2: response.token1totoken2,
                          token2totoken1: response.token2totoken1,
                        });
                        setTrade(trade);
                        setTradeVisible(true);
                        setLoading2(false);
                      })
                      .catch((e) => {
                        setLoading2(false);
                        console.log(e);
                        alert("error", e);
                      });
                  } else if (coin1.symbol === "BNB") {
                    type = "TOKENTOBNB";
                    await getSwapPrice(
                      amountIn,
                      coin0.address,
                      coin1.address,
                      type
                    )
                      .then((response) => {
                        const trade = {
                          slippageTolerance: 1,
                          minimumAmountOut: response.token1totoken2,
                        };
                        console.log(response.token1totoken2);
                        setTradePrice({
                          token1totoken2: response.token1totoken2,
                          token2totoken1: response.token2totoken1,
                        });
                        setTrade(trade);
                        setTradeVisible(true);
                        setLoading2(false);
                      })
                      .catch((e) => {
                        setLoading2(false);
                        console.log(e);
                        alert("error", e);
                      });
                  } else {
                    type = "TOKENTOTOKEN";
                    const approve = await approveSwap(
                      coin0.address,
                      amountIn,
                      Wallet.privateKey,
                      token
                    ).then(async (next) => {
                      await getSwapPrice(
                        amountIn,
                        coin0.address,
                        coin1.address,
                        type
                      )
                        .then(async (response) => {
                          const trade = {
                            slippageTolerance: 1,
                            minimumAmountOut: response.token1totoken2,
                          };
                          console.log(response.token1totoken2);
                          setTradePrice({
                            token1totoken2: response.token1totoken2,
                            token2totoken1: response.token2totoken1,
                          });
                          setTrade(trade);
                          setTradeVisible(true);
                          setLoading2(false);
                        })
                        .catch((e) => {
                          setLoading2(false);
                          alert(
                            "error",
                            "Insufficient liquidity. please try with a different token"
                          );
                          console.log(e);
                        });
                    });
                    console.log(approve);
                    setLoading2(false);
                  }
                } else if (walletType === "Multi-coin") {
                  if (swapType === "ETH") {
                    if (Wallet) {
                      if (coin0.symbol === "WETH") {
                        await getETHtoTokenPrice(coin1.address, amount)
                          .then((resp) => {
                            console.log(resp);
                            if (resp) {
                              console.log(resp);
                              setLoading2(false);
                              setTradePrice({
                                token1totoken2: resp.token1totoken2,
                                token2totoken1: resp.token2totoken1,
                              });
                              setTrade(resp.trade);
                              setTradeVisible(true);
                            }
                          })
                          .catch((e) => {
                            setLoading2(false);
                            console.log(e);
                          });
                      } else if (coin1.symbol === "WETH") {
                        await getTokentoEthPrice(coin0.address, amount)
                          .then((resp) => {
                            console.log(resp);
                            if (resp) {
                              console.log(resp);
                              setTradePrice({
                                token1totoken2: resp.token1totoken2,
                                token2totoken1: resp.token2totoken1,
                              });
                              setTrade(resp.trade);
                              setTradeVisible(true);
                              setLoading2(false);
                            }
                          })
                          .catch((e) => {
                            setLoading2(false);

                            console.log(e);
                          });
                      } else {
                        tokenTotokenPrice(
                          Wallet.address,
                          coin0.address,
                          coin1.address,
                          amount
                        )
                          .then((response) => {
                            console.log(response);
                            setTradePrice({
                              token1totoken2: response.token1totoken2,
                              token2totoken1: response.token2totoken1,
                            });
                            setTrade(response.trade);
                            setTradeVisible(true);
                            setLoading2(false);
                          })
                          .catch((e) => {
                            console.log(e);
                            setLoading2(false);
                            return alert("error", e.message);
                          });
                      }
                    }
                  } else if (swapType === "BSC") {
                    console.log(coin0.address, coin1.address);
                    let amountIn = (await ethers).utils.parseUnits(
                      amount,
                      "ether"
                    );
                    console.log("My amount", amountIn);
                    let type;
                    if (coin0.symbol === "BNB") {
                      type = "BNBTOTOKEN";
                      await getSwapPrice(
                        amountIn,
                        coin0.address,
                        coin1.address,
                        type
                      )
                        .then((response) => {
                          console.log(response);
                          const trade = {
                            slippageTolerance: 1,
                            minimumAmountOut: response.token1totoken2,
                          };
                          console.log(response);
                          setTradePrice({
                            token1totoken2: response.token1totoken2,
                            token2totoken1:
                              Number(amount) / Number(response.token1totoken2),
                          });
                          setTrade(trade);
                          setTradeVisible(true);
                          setLoading2(false);
                        })
                        .catch((e) => {
                          setLoading2(false);
                          console.log(e);
                          alert("error", e);
                        });
                    } else if (coin1.symbol === "BNB") {
                      type = "TOKENTOBNB";
                      await getSwapPrice(
                        amountIn,
                        coin0.address,
                        coin1.address,
                        type
                      )
                        .then((response) => {
                          const trade = {
                            slippageTolerance: 1,
                            minimumAmountOut: response.token1totoken2,
                          };
                          console.log(response.token1totoken2);
                          setTradePrice({
                            token1totoken2: response.token1totoken2,
                            token2totoken1:
                              Number(amount) / Number(response.token1totoken2),
                          });
                          setTrade(trade);
                          setTradeVisible(true);
                          setLoading2(false);
                        })
                        .catch((e) => {
                          setLoading2(false);
                          console.log(e);
                          alert("error", e);
                        });
                    } else {
                      type = "TOKENTOTOKEN";
                      const approve = await approveSwap(
                        coin0.address,
                        amountIn,
                        Wallet.privateKey,
                        token
                      ).then(async (next) => {
                        await getSwapPrice(
                          amountIn,
                          coin0.address,
                          coin1.address,
                          type
                        )
                          .then(async (response) => {
                            const trade = {
                              slippageTolerance: 1,
                              minimumAmountOut: response.token1totoken2,
                            };
                            console.log(response.token1totoken2);
                            setTradePrice({
                              token1totoken2: response.token1totoken2,
                              token2totoken1:
                                Number(amount) /
                                Number(response.token1totoken2),
                            });
                            setTrade(trade);
                            setTradeVisible(true);
                            setLoading2(false);
                          })
                          .catch((e) => {
                            setLoading2(false);
                            alert(
                              "error",
                              "Insufficient liquidity. please try with a different token"
                            );
                            console.log(e);
                          });
                      });
                      console.log(approve);
                      setLoading2(false);
                    }
                  }
                } else {
                  return alert("error", "Swap not supported for chain");
                }
              } catch (e) {
                setLoading2(false);
              }
            }}
          >
            <Text style={styles.addButtonText}>
              {loading2 ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                "Swap"
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal2
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={100}
          animationOutTiming={200}
          isVisible={openChain}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating
          onBackButtonPress={() => {
            // setShowModal(!showModal);
            setOpenChain(false);
          }}
        >
          <View
            style={{
              width: wp(99),
              backgroundColor: "#ddd",
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              left: wp(-4.5),
            }}
          >
            <TokenList
              setVisible={setOpenChain}
              setCoin0={setCoin0}
              setCoin1={setCoin1}
              data={chooseChain}
              coinType={coinType}
              walletType={walletType}
              setSwapType={setSwapType}
            />
          </View>
        </Modal2>
        <Modal2
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={100}
          animationOutTiming={200}
          isVisible={visible}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating
          onBackButtonPress={() => {
            //setShowModal(!showModal);
            setVisible(false);
          }}
        >
          <View
            style={{
              width: wp(99),
              backgroundColor: "#ddd",
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              left: wp(-4.5),
            }}
          >
            <TokenList
              setVisible={setVisible}
              setCoin0={setCoin0}
              setCoin1={setCoin1}
              data={Data}
              coinType={coinType}
              walletType={walletType}
              setSwapType={setSwapType}
            />
          </View>
        </Modal2>
        {/* /.......................This is Confirm model..................../ */}
        <Modal2
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={500}
          animationOutTiming={650}
          isVisible={Tradevisible}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating
          onBackdropPress={() => setTradeVisible(false)}
          onBackButtonPress={() => {
            setTradeVisible(false);
          }}
        >
          <View style={[styles.modelView,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
      <Wallet_screen_header title="Confirmation" onLeftIconPress={() => {setTradeVisible(false)}} />
           
            <View style={styles.container_view}>
              <View style={styles.token_details}>
                <Image
                  source={{
                    uri: coin0.logoUri
                      ? coin0.logoUri
                      : "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
                  }}
                  style={{ height: hp(5), width: wp(11) }}
                />
               <View style={{marginLeft:10}}>
               <Text style={{ fontWeight:"500",marginRight: wp(5), marginLeft: wp(1), color: state.THEME.THEME === false ? "black" : "#fff",fontSize:19 }}>
                  {coin0.name}
                </Text>
                <Text style={{ marginRight: wp(5), marginLeft: wp(1), color: state.THEME.THEME === false ? "black" : "#fff",fontSize:15 }}>
                {amount ? amount : 0}
                </Text>
               </View>
              </View>
              
              <View style={{ marginLeft: wp(2.2),paddingVertical:14 }}>
                <Icon
                  name={"arrow-down-outline"}
                  size={30}
                  color={state.THEME.THEME === false ? "black" : "#fff"}
                />
              </View>

              <View style={styles.token_details}>
                <Image
                  source={{
                    uri: coin1.logoUri
                      ? coin1.logoUri
                      : "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png ",
                  }}
                  style={{ height: hp(5), width: wp(11) }}
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontWeight:"500",marginRight: wp(5), marginLeft: wp(1), color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 19 }}>
                    {coin1.name}
                  </Text>
                  <Text style={{ marginRight: wp(5), marginLeft: wp(1), color: state.THEME.THEME === false ? "black" : "#fff", fontSize: 15 }}>
                    {trade ? trade.minimumAmountOut : 0}
                  </Text>
                </View>
               </View>

              </View>
           

            <View style={[styles.container_info,{width:wp(93),justifyContent:"center",paddingVertical:hp(2)}]}>
              <View style={[styles.token_details, { width: "100%", justifyContent: "space-between",borderColor: 'rgba(28, 41, 77, 1)',borderBottomWidth:0.9,borderBlockEndColor: 'gray',paddingBottom:hp(2) }]}>
                <Text style={[styles.data_text_, { width: wp(33),color:"gray",fontWeight:"500" }]} numberOfLines={1} >From Wallet :</Text>
                <View style={{ width: wp(40) }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={[styles.data_text_,{color:"gray",fontWeight:"500"}]} numberOfLines={1} >{state?.wallet?.address}</Text>
                  </ScrollView>
                </View>
              </View>

              <View style={[styles.token_details, { width: "100%", justifyContent: "space-between",marginTop:hp(2) }]}>
              <View style={{flexDirection:"row",width:wp(31),alignItems:"center"}}>
               <Text style={[styles.data_text_, { color:"gray",fontWeight:"500" }]} numberOfLines={1} >Provider </Text>
                <Icon name={"information-circle"} size={22} color={"#3574B6"} />
                </View>

                <View style={{alignContent:"flex-end" }}>
                    <Text style={[styles.data_text_,{color:"gray",fontWeight:"500"}]} numberOfLines={1} >UniSwap</Text>
                </View>
              </View>

              <View style={[styles.token_details, { width: "100%", justifyContent: "space-between",marginTop:hp(1.5) }]}>
              <View style={{flexDirection:"row",width:wp(31),alignItems:"center"}}>
               <Text style={[styles.data_text_, { color:"gray",fontWeight:"500" }]} numberOfLines={1} >Max Slippage </Text>
               <Icon name={"information-circle"} size={22} color={"#3574B6"} />
               </View>

                <View style={{alignContent:"flex-end" }}>
                    <Text style={[styles.data_text_,{color:"gray",fontWeight:"500"}]} numberOfLines={1} >{trade ? trade.slippageTolerance : 0} %</Text>
                </View>
              </View>

              <View style={[styles.token_details, { width: "100%", justifyContent: "space-between",marginTop:hp(1.5) }]}>
               <View style={{flexDirection:"row",width:wp(31),alignItems:"center"}}>
               <Text style={[styles.data_text_, { color:"gray",fontWeight:"500" }]} numberOfLines={1} >Network Fee </Text>
                <Icon name={"information-circle"} size={22} color={"#3574B6"} />
               </View>
                <View style={{alignContent:"flex-end" }}>
                    <Text style={[styles.data_text_,{color:"gray",fontWeight:"500"}]} numberOfLines={1} >null</Text>
                </View>
              </View>

            </View>

            

            <TouchableOpacity
              disabled={loading === true ? true : false}
              style={styles.addButton3}
              onPress={() => {
                setTimeout(async () => {
                  const biometric = await AsyncStorageLib.getItem("Biometric");
                  console.log("Biometric =", biometric);
                  if (biometric === "SET") {
                    try {
                      await useBiometricsForSwapTransaction(swapTokens);
                      return;
                    } catch (e) {
                      console.log(e);
                    }
                  }
                  if (Number(amount) >= Number(balance)) {
                    return alert(
                      "error",
                      "You Don't have enough balance to do this transaction"
                    );
                  }
                  setPinViewVisible(true);
                }, 0);
              }}
            >
              <Text style={styles.addButtonText}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  "Confirm"
                )}
              </Text>
            </TouchableOpacity>
          </View>
          <SwapPinModal
        pinViewVisible={pinViewVisible}
        setPinViewVisible={setPinViewVisible}
        setModalVisible={setModalVisible}
        setTradeVisible={setTradeVisible}
        pancakeSwap={pancakeSwap}
        coin0={coin0}
        coin1={coin1}
        SaveTransaction={SaveTransaction}
        swapType={swapType}
        setLoading={setLoading}
        amount={amount}
      />
        </Modal2>
      </Modal>
    </View>
  );
};

export default SwapModal;

const styles = StyleSheet.create({
  mainContainermodal: {
    alignSelf: "center",
    width: "100%",
    height:"100%"
    // marginTop: "auto",
    // backgroundColor: "#131E3A",
  },
  modelView: {
    paddingBottom: hp(5),
    width: wp(100),
    height:hp(100),
    alignSelf: "center",
    alignItems: "center",
  },
  modelmainContainer: {
    flexDirection: "row",
    marginTop: hp(5),
    width: wp(80),
    alignItems: "center",
    justifyContent: "space-between",
  },
  colon: {
    // color: "white",
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: wp(10),
  },
  textColor: {
    // color: "white",
    color: "black",
    fontSize: 12,
    // width: wp(20),
  },
  headingColor: {
    width: wp(35),
    // color: "white",
    color: "black",
    // fontSize: 14.5,
    fontSize: 16,
    fontWeight: "700",
    // textDecorationLine: "underline",
    textAlign: "left",
  },
  headingColor2: {
    width: wp(35),
    color: "white",
    fontSize: 14.5,
    fontWeight: "700",
    textAlign: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#fff",
  },
  cardBoxContainer: {
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "gray",
    marginTop: hp(5),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    borderColor:"#4CA6EA",
    borderWidth:0.5
  },
  swapText: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginRight: wp(45),
  },
  swapiconView: {
    backgroundColor: "white",
    height: 40,
    width: 40,
    borderRadius: hp(10),
    alignContent:"center",
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "gray",
    alignItems: "center",
  },
  rightICon: { marginRight: wp(1), },
  txtInput: {
    width: wp(20),
    padding: 4,
    height: hp(5),
    borderRadius: hp(1.4),
    backgroundColor: "white",
  },
  leftView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
    fontSize: 18,
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
    backgroundColor: "#ddd",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    width: 390,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: 40,
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
    width: 200,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: 50,
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
    bottom: 10,
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
    left: wp(10),
    bottom: hp(23),
    backgroundColor: "#000C66",
    width: wp(80),
    height: 70,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton3: {
    // backgroundColor: "#000C66",
    backgroundColor: "#53A3EA",
    width: wp(95),
    paddingVertical: hp(1.9),
    alignItems: "center",
    alignSelf: "center",
    borderRadius: hp(1.9),
    marginTop: hp(10),
  },
  addButtonText: {
    color: "#fff",
    fontWeight: '700',
    fontSize: 16
  },
  container: {
    backgroundColor: "#ddd",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "#ddd",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  tokenView: {
    height: hp(5),
    // marginVerticas: hp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: wp(80),
    alignItems: "center",
  },
  cardmainContainer1: {
    width: wp(93),
    borderRadius: hp(2),
    alignSelf: "center",
    // marginTop: hp(1),
  },
  cardmainContainer: {
    // backgroundColor:"red"
    // backgroundColor: "white",

    width: wp(93),
    borderRadius: hp(2),
    alignSelf: "center",
    // marginTop: hp(4),
  },
  color: {
    color: "#C1BDBD",
    margin: 2,
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "gray",
    padding: 10,
    marginHorizontal: wp(5),
    position: "relative",
    marginBottom: hp(3),
  },
  textinputCon: {
    width: wp(20),
    padding: 4,
    height: hp(5),
    borderRadius: hp(1.4),
    backgroundColor: "white",
  },
  crossIcon: {
    alignSelf: 'flex-end',
    padding: hp(1),
  },
  container_view: {
    width: wp(90),
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop:hp(6)
  },
  headings: {
    width: wp(50),
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
    marginLeft: "3.1%"
  },
  data_view: {
    flexDirection: "row",
    width: "90%",
    backgroundColor: "#f5f5f5",
    padding: "2.4%",
    marginTop: "4.9%",
    marginBottom: "6%",
    marginLeft: "3.3%"
  },
  data_text: {
    width: wp(100),
    color: "black",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "left"
  },
  data_text_: {
    color: "black",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "left"
  },
  token_details:{
    flexDirection:"row",
    alignItems:"center",
    width:wp(99),
    padding:5
  },
  container_info:{
    width:wp(95),
    padding:5,
    borderColor:"gray",
    borderWidth:1,
    borderRadius:10,
    marginTop:hp(5)
  }
});
