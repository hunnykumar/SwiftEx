import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { colors } from "../../../../../Screens/ThemeColorsConfig";
import Icon from "../../../../../icon";
import { GetStellarUSDCAvilabelBalance } from "../../../../../utilities/StellarUtils";
import { getTokenBalancesUsingAddress, getWalletBalance } from "../utils/getWalletInfo/EtherWalletService";
import { onSwapETHtoUSDC } from "../utils/OneTapPayExecution";
import CustomInfoProvider from "./CustomInfoProvider";
import { ethers } from "ethers";
import { TokenTransferFlow } from "./OneTapFlow";
import { debounce } from "lodash";
import { getCUSTOMSwapQuote } from "../utils/QuotesUtil";
import { REACT_PROXY_HOST } from "../ExchangeConstants";
import { getToken, PPOST, proxyRequest } from "../api";
import { OneTapUSDCAddress } from "../../../../constants";

export default function OneTapComponet({ showInfo, showPurchase }) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [usdcBalance, setusdcBalance] = useState("0.00");
  const [fromAssetBalance, setfromAssetBalance] = useState("0.00");
  const [balanceLoading, setbalanceLoading] = useState(false);
  const [showFlow, setshowFlow] = useState(false);
  const [swapAbleAmount, setswapAbleAmount] = useState("0.00");
  const [quotesLoading, setquotesLoading] = useState(false);
  const [quotesResponse, setquotesResponse] = useState(null);
  const [swapquotesResponse, setswapquotesResponse] = useState(null);
  const [isTokenHaveBalances, setisTokenHaveBalances] = useState(false);
  const [statusMap, setStatusMap] = useState({
    'ETH→USDT': 'default',
    'USDT→USDC': 'default',
    'USDC→Wallet': 'default'
  });

  const assets = [
    { symbol: "ETH", address: "native", assetType: "NATIVE", name: "Ethereum", logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
    { symbol: "USDT", address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", assetType: "ERC", name: "Tether", logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
    { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", assetType: "ERC", name: "USD Coin", logoURI: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png" },
  ];
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const state = useSelector((state) => state);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const theme = useMemo(() => state.THEME?.THEME ? colors.dark : colors.light, [state.THEME?.THEME]);

  const openSheet = () => {
    setSheetVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const selectAsset = (selectedAsset) => {
    setSelectedAsset(selectedAsset);
    closeSheet();
  };
  const navigation = useNavigation();

  useEffect(() => {
    setswapAbleAmount('');
    setquotesResponse(null);
    setswapquotesResponse(null);
    setquotesLoading(false);
    setshowFlow(false);
    setbalanceLoading(true);
    const initService = async () => {
      const result = await GetStellarUSDCAvilabelBalance(
        state?.STELLAR_PUBLICK_KEY,
        "USDC",
        "GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"
      );
      if (result.status) {
        setusdcBalance(result.availableBalance)
      } else {
        setusdcBalance("0.00")
      }
      const walletNativeBala = await getWalletBalance(state && state.wallet && state.wallet.address, "ETH");
      if (walletNativeBala.status&&parseFloat(walletNativeBala.balance)>0) {
        setisTokenHaveBalances(true);
        setfromAssetBalance(walletNativeBala.balance);
      } else {
        setisTokenHaveBalances(false);
        setfromAssetBalance("0.00");
      }
      setbalanceLoading(false);
    }
    initService()
  }, [showInfo])

  useEffect(() => {
    setbalanceLoading(true);
    const initService = async () => {
      const result = await GetStellarUSDCAvilabelBalance(
        state?.STELLAR_PUBLICK_KEY,
        "USDC",
        "GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"
      );
      if (result.status) {
        setusdcBalance(result.availableBalance)
      } else {
        setusdcBalance("0.00")
      }
      if (selectedAsset.assetType === "ERC") {
        const walletNativeBala = await getTokenBalancesUsingAddress(selectedAsset.address, state && state.wallet && state.wallet.address, "ETH");
        if (walletNativeBala.status&&parseFloat(walletNativeBala.tokenInfo[0].balance)>0) {
          setisTokenHaveBalances(true);
          setfromAssetBalance(walletNativeBala.tokenInfo[0].balance);
        } else {
          setisTokenHaveBalances(false);
          setfromAssetBalance("0.00");
        }
      }
      if (selectedAsset.assetType === "NATIVE") {
        const walletNativeBala = await getWalletBalance(state && state.wallet && state.wallet.address, "ETH");
        if (walletNativeBala.status&&parseFloat(walletNativeBala.balance)>0) {
          setisTokenHaveBalances(true);
          setfromAssetBalance(walletNativeBala.balance);
        } else {
          setisTokenHaveBalances(false);
          setfromAssetBalance("0.00");
        }
      }
      setbalanceLoading(false);
    }
    initService()
  }, [selectedAsset])

  const handleStepUpdate = (stepKey, status) => {
    setStatusMap(prevStatus => ({
      ...prevStatus,
      [stepKey]: status
    }));
  };

  const executeOneTapPay = async (amount, privateKey, fee) => {
    handleStepUpdate("WETH→USDT", "pending");
    setshowFlow(true);
    const res = await onSwapETHtoUSDC(amount, privateKey, fee)
    if (res.status === true) {
      handleStepUpdate("WETH→USDT", "done");
      console.log("--onSwapETHtoUSDC-->", res)
      await sendEthToContract(res.outputAmount)
    } else {
      handleStepUpdate("WETH→USDT", "error");
      handleStepUpdate("USDT→USDC", "error");
      handleStepUpdate("USDC→Wallet", "error");
      CustomInfoProvider.show("info", "OneTap info", res.message)
    }
  }
  const sendEthToContract = async (amount) => {
    try {
      handleStepUpdate("USDT→USDC", "pending");

      const wallet = new ethers.Wallet(state?.wallet?.privateKey);
      const usdtAddress = OneTapUSDCAddress.Address;
      const usdtAbi = [
        "function transfer(address to, uint256 value) public returns (bool)"
      ];
      const usdtContract = new ethers.Contract("0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", usdtAbi, wallet);

      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 6);
      const unsigned = await usdtContract.populateTransaction.transfer(usdtAddress, formattedAmount);
      // Send transaction
      const preInfo = await proxyRequest("/v1/eth/transaction/prepare", PPOST, { unsignedTx: unsigned, walletAddress: wallet.address });
      if (preInfo.err) {
        CustomInfoProvider.show("error", "OneTap Faild", "something went wrong.");
      }
      console.log("Send transaction--- ", preInfo);
      if (preInfo?.err?.status) {
        console.log("Transaction Failed", err);
        handleStepUpdate("USDT→USDC", "error")
        handleStepUpdate("USDC→Wallet", "error")
      }
      const upgradedTx = {
        ...unsigned,
        nonce: preInfo.res.nonce,
        gasLimit: ethers.BigNumber.from(preInfo.res.gasLimit),
        gasPrice: ethers.BigNumber.from(preInfo.res.gasPrice),
        value: preInfo.res.value ? ethers.BigNumber.from(preInfo.res.value) : ethers.BigNumber.from(0),
        chainId: Number(preInfo.res.chainId),
      };
      const signedTx = await wallet.signTransaction(upgradedTx);
      const respoExe = await proxyRequest("/v1/eth/transaction/broadcast", PPOST, { signedTx: signedTx });
      if (respoExe.err) {
        CustomInfoProvider.show("error", "OneTap Faild to brodcast", "something went wrong.");
      }
      if (respoExe?.res?.txHash) {
        handleStepUpdate("USDT→USDC", "done")
        setTimeout(() => {
          handleStepUpdate("USDC→Wallet", "done")
        }, 2000);
      }
    } catch (error) {
      console.log("Transaction Failed", error);
      handleStepUpdate("USDT→USDC", "error")
      handleStepUpdate("USDC→Wallet", "error")
    }
  }

  const handleInputChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setswapAbleAmount(numericText);
    fetchQuote(numericText, selectedAsset.name, selectedAsset.address);
  };

  const fetchQuote = useCallback(
    debounce((value, token, tokenAddre) => {
      if (!isNaN(value)) {
        setquotesLoading(true)
        handleUSDT(value, tokenAddre, token)
      }
      else {
        CustomInfoProvider.show("error", "Invalid Amount");
      }
    }, 400),
    []
  );

  const handleUSDT = async (amount, tokenAddre, token) => {
    const res = await getCUSTOMSwapQuote(tokenAddre, amount, token)
    console.log("---Swap--->", res)
    if (res.status) {
      setswapquotesResponse(res)
      await handleUSDC(res?.minimumAmountOut, "ETH")
    }
    else {
      CustomInfoProvider.show("error", "Unable to provide qoutes.");
      setswapquotesResponse(null);
      setquotesLoading(false);
    }
  }

  const handleUSDC = async (value, typeOfchain) => {
    const deviceToken = await getToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + deviceToken);
    myHeaders.append("x-auth-device-token", deviceToken);

    const raw = JSON.stringify({
      "amount": value,
      "chainType": typeOfchain
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch(REACT_PROXY_HOST + `/v1/bridge/swap-quotes`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("---swap-quotes-->", result)
        if (result?.quotes) {
          setquotesResponse(result?.quotes)
          setquotesLoading(false);
        }
        else {
          setquotesLoading(false);
          setquotesResponse(null)
          console.log("--Info-err->", result)
          CustomInfoProvider.show("error", "Error", "An error occurred. Please try again later.")
        }
      })
      .catch((error) => {
        setquotesLoading(false);
        console.log(error)
      });
  }



  const styles = StyleSheet.create({
    container: {
      width: wp(100),
      backgroundColor: theme.bg
    },
    card: {
      backgroundColor: theme.cardBg,
      padding: 16,
      borderRadius: 14,
      marginBottom: 16
    },
    rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    label: {
      color: theme.inactiveTx,
      fontSize: 14
    },
    balance: {
      color: theme.inactiveTx,
      fontSize: 13
    },
    tokenSelector: {
      alignSelf: "flex-end",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: theme.bg,
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 10,
      width: wp(32),
      maxHeight:hp(6)
    },
    tokenText: {
      color: theme.headingTx,
      fontSize: 16,
      fontWeight: "500"
    },
    topHeading: {
      color: theme.headingTx,
      fontSize: 16.9,
      left: 5,
      textAlign: "center",
      fontWeight: "500",
      paddingVertical: 10,
      bottom: 3
    },
    amountInput: {
      fontSize: 28,
      color: theme.headingTx,
      marginTop: 2,
      maxWidth: "60%"
    },
    usdValue: {
      color: theme.inactiveTx,
      marginTop: 4
    },
    arrowCircle: {
      alignSelf: "center",
      backgroundColor: theme.cardBg,
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    summaryCard: {
      backgroundColor: theme.cardBg,
      padding: 16,
      borderRadius: 14,
      marginBottom: 16,
    },
    summaryTitle: {
      color: theme.headingTx,
      fontSize: 16,
      marginBottom: 12
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6
    },
    summaryLabel: {
      color: theme.inactiveTx,
      fontSize: 14
    },
    summaryValue: {
      color: theme.headingTx,
      fontSize: 14
    },
    divider: {
      height: 1,
      backgroundColor: theme.inactiveTx,
      marginVertical: 12
    },
    totalValue: {
      textAlign: "right",
      color: theme.headingTx,
      fontSize: 20,
      marginTop: 10
    },
    button: {
      backgroundColor: "#4052D6",
      paddingVertical: 16,
      borderRadius: 10,
      marginBottom: 40,
    },
    buttonText: {
      textAlign: "center",
      color: theme.headingTx,
      fontSize: 18,
      fontWeight: "600"
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    sheetContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.bg,
      padding: 20,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    sheetTitle: {
      color: theme.headingTx,
      fontSize: 18,
      marginBottom: 12,
      textAlign: "center"
    },
    assetRow: {
      flexDirection: "row",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.inactiveTx,
    },
    assetSymbol: {
      color: theme.headingTx,
      fontSize: 16
    },
    assetName: {
      color: theme.inactiveTx,
      fontSize: 13
    },
    assetImage: {
      width: 40,
      height: 40,
    },
    selectedAssetImg: {
      width: 29,
      height: 29,
    },
    quoteTextCon: {
      flexDirection: "row",
      padding: 9,
      backgroundColor: "#40BF6ACC",
      borderRadius: 8,
    },
    quoteText: {
      fontSize: 24,
      color: theme.headingTx,
      borderRadius: 8,
    },
  });
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: 15 }}>
          <Text style={styles.topHeading}>{isTokenHaveBalances ? "Deposit instantly from your available balance.":"Oops! You don't own this asset yet. Buy to get started."}</Text>
          {
            isTokenHaveBalances &&
            <>
              <View style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>From</Text>
                    <TouchableOpacity style={[styles.tokenSelector, { backgroundColor: "#FFA800",marginBottom:hp(0.8)}]} onPress={()=>{ navigation.navigate("KycComponent", { tabName: "Buy" })}}>
                    <Icon name="arrow-right-thin" type={"materialCommunity"} size={25} color={theme.bg} />
                    <Text style={[styles.tokenText, { marginLeft: wp(0.1), color: theme.bg }]}>Buy Now</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: "column" }}>
                    <TextInput
                      placeholder="0.0"
                      placeholderTextColor="#777"
                      style={styles.amountInput}
                      onChangeText={handleInputChange}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                    {balanceLoading ? <ActivityIndicator size={"small"} color={"green"} /> : <Text style={styles.balance}>Balance: {parseFloat(fromAssetBalance).toFixed(13)}</Text>}
                  </View>
                  <TouchableOpacity style={styles.tokenSelector} onPress={openSheet}>
                    <Image source={{ uri: selectedAsset.logoURI }} style={styles.selectedAssetImg} />
                    <Text style={[styles.tokenText, { marginLeft: wp(2) }]}>{selectedAsset.symbol}{" "}</Text>
                    <Icon name="chevron-down" type={"materialCommunity"} size={25} color={theme.headingTx} />
                  </TouchableOpacity>

                </View>
              </View>

              <View style={styles.arrowCircle}>
                <Icon name="swap-vertical" type={"materialCommunity"} size={25} color={theme.headingTx} />
              </View>
            </>
          }

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>{!isTokenHaveBalances?"":"To"}</Text>
               <TouchableOpacity style={[styles.tokenSelector, { backgroundColor: "#FFA800",marginBottom:hp(0.8) }]} onPress={()=>{ navigation.navigate("KycComponent", { tabName: "Buy" })}}>
                <Icon name="arrow-right-thin" type={"materialCommunity"} size={25} color={theme.bg} />
                <Text style={[styles.tokenText, { marginLeft: wp(0.1), color: theme.bg }]}>Buy Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
              <View style={{ flexDirection: "column" }}>
                <TextInput
                  placeholder="0.0"
                  placeholderTextColor="#777"
                  style={styles.amountInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  editable={false}
                  value={quotesResponse === null ? "0.0" : quotesResponse.minimumAmountOut}
                />
                {balanceLoading ? <ActivityIndicator size={"small"} color={"green"} /> : <Text style={styles.balance}>Balance: {usdcBalance}</Text>}
              </View>
              <TouchableOpacity style={styles.tokenSelector} disabled={true}>
                <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png" }} style={styles.selectedAssetImg} />
                <Text style={[styles.tokenText, { marginLeft: wp(2), color: theme.inactiveTx }]}>USDC</Text>
              </TouchableOpacity>

            </View>
          </View>

          {showFlow ?
            <TokenTransferFlow visible={showFlow} fistToken={"WETH"} statusMap={statusMap} onClose={() => { setshowFlow(false) }} /> :
            quotesLoading ? <ActivityIndicator color={"green"} size={"large"} /> :
              quotesResponse !== null && swapquotesResponse !== null ?
                <>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Transaction summary</Text>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Provider</Text>
                      <Text style={styles.summaryValue}>{selectedAsset.symbol === "ETH" ? "Uniswap" : "Pancake"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>SlippageTolerance</Text>
                      <Text style={styles.summaryValue}>{swapquotesResponse.slippageTolerance}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Unit Price</Text>
                      <Text style={styles.summaryValue}>1 {selectedAsset.symbol} = {swapquotesResponse.conversionRate} USDT</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Fee</Text>
                      <Text style={styles.summaryValue}>{swapquotesResponse.fee}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Minimum Received</Text>
                      <Text style={styles.summaryValue}>{parseFloat(swapquotesResponse.minimumAmountOut).toFixed(4)} USDT</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Max Received</Text>
                      <Text style={styles.summaryValue}>{parseFloat(swapquotesResponse.outputAmount).toFixed(4)} USDT</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Bridge Provider</Text>
                      <Text style={styles.summaryValue}>Allbridge</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Conversion Rate</Text>
                      <Text style={styles.summaryValue}>1 USDT = {parseFloat(quotesResponse.conversionRate).toFixed(4)} USDC</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Slippage Tolerance</Text>
                      <Text style={styles.summaryValue}>{quotesResponse.slippageTolerance}</Text>
                    </View>

                    {quotesResponse.fee && <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Fee</Text>
                      <Text style={styles.summaryValue}>{quotesResponse.fee}</Text>
                    </View>}

                    {quotesResponse.outputAmount && <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Maximum Received</Text>
                      <Text style={styles.summaryValue}>{quotesResponse.outputAmount} USDC</Text>
                    </View>}

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Minimum Received</Text>
                      <Text style={styles.summaryValue}>{parseFloat(quotesResponse.minimumAmountOut).toFixed(5)} USDC</Text>
                    </View>

                    <View style={styles.quoteTextCon}>
                      <Text style={styles.quoteText}>≈</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Text style={styles.quoteText}>{quotesResponse.minimumAmountOut}</Text>
                      </ScrollView>
                      <Text style={styles.quoteText}>USDC</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.button} onPress={() => { executeOneTapPay(swapAbleAmount, state?.wallet?.privateKey, swapquotesResponse?.fee) }}>
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </> : <></>}


        <Modal visible={sheetVisible} transparent animationType="slide">
          <Pressable style={styles.overlay} onPress={closeSheet} />

          <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
            <Text style={styles.sheetTitle}>Select Asset</Text>

            {assets.map((asset) => (
              <TouchableOpacity
                key={asset.symbol}
                style={styles.assetRow}
                onPress={() => selectAsset(asset)}
              >
                <Image source={{ uri: asset.logoURI }} style={styles.assetImage} />
                <View style={{ flexDirection: "column", marginLeft: wp(2) }}>
                  <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                  <Text style={styles.assetName}>{asset.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Modal>
      </ScrollView>
    </>
  );
}