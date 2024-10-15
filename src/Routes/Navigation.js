import React, { useState, useEffect, useRef } from "react";
import { AppState, View } from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import store from "../components/Redux/Store";
import Dashboard from "../Dashboard/Home";
import { Register } from "../../Register";
import { LoginPage } from "../Login/Login";
import MyWallet from "../Dashboard/MyWallet";
import { useDispatch, useSelector } from "react-redux";
import CreateWallet from "../Dashboard/CreateWallet";
import ImportWallet from "../Dashboard/ImportWallet";
import MyHeader from "../Dashboard/MyHeader";
import MyHeader2 from "../Dashboard/MyHeader2";
import { Extend, Collapse } from "../components/Redux/actions/auth";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { ConfirmOtp } from "../Register/confirmOtp";
import Generate from "../../Generate";
import { CoinDetails } from "../Dashboard/CoinDetail";
import { TxDetail } from "../Dashboard/TxDetail";
import Welcome from "../Dashboard/Welcome";
import GenerateWallet from "../Dashboard/GenerateWallet";
import PrivateKey from "../Dashboard/PrivateKey";
import Passcode from "../Dashboard/Passcode";
import ImportAccount from "../Dashboard/ImportAccount";
import ImportMunziWallet from "../Dashboard/importMunziWallet";
import ImportOtherWallets from "../Dashboard/ImportOtherWallets";
import ImportBscWallet from "../Dashboard/importBscWallet";
import ImportPolygon from "../Dashboard/importPolygon";
import ImportXrp from "../Dashboard/importXrp";
import CheckMnemonic from "../Dashboard/CheckMnemonic";
import ConfirmTransaction from "../Dashboard/ConfirmTransaction";
import SendTokens from "../Dashboard/tokens/SendTokens";
import Transactions from "../Dashboard/Transactions";
import AllWallets from "../Dashboard/Wallets/allWallets";
import { ExchangeLogin } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/auth/ExchangeLogin";
import { ExchangeRegister } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/auth/signup";
import LockApp from "../Dashboard/lockApp";
import { navigationRef } from "../utilities/utilities";
import { ExchangeNavigation } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/Navigation";
import BiometricPage from "../Dashboard/BiometricPage";
import SplashScreen from "../Screens/splash";
import Nfts from "../Dashboard/Nfts";
import Token from "../Dashboard/Token";
import Settings from "../../Settings";
import Wallet from "../Dashboard/Wallet";
import {
  OfferListView,
  OfferListViewHome,
  OfferView,
} from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/offers";
import {
  ExchangeHeader,
  ExchangeHeaderIcon,
  WalletHeader,
} from "../Dashboard/header";
import MyPrivateKey from "../Dashboard/myPrivateKey";
import MarketChart from "../Dashboard/MarketChart";
import RecieveAddress from "../Dashboard/Modals/ReceiveAddress";
import ImportMultiCoinWalletModal from "../Dashboard/Modals/importMultiCoinWalletModal";
import SelectWallet from "../Dashboard/Modals/SelectWallet";
import TokenList from "../Dashboard/tokens/TokenList";
import Payout from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/payout";
import Payment from "../Dashboard/exchange/crypto-exchange-front-end-main/src/components/Payment";
import importStellar from "../Dashboard/importStellar";
import { NewOfferModal } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/components/newOffer.modal";
import classic from "../Dashboard/exchange/crypto-exchange-front-end-main/src/components/classic";
import Assets_manage from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/stellar/Assets_manage";
import send_recive from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/stellar/send_recive";
import SendXLM from "../Dashboard/tokens/sendXLM";
import Asset_info from "../Dashboard/Asset_info";
import Subscription from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/auth/Subscription";
import Subscription_det from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/auth/Subscription_det";
import Subcription_payment from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/auth/Subcription_payment";

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <NavigationContainer
    // theme={{ colors: { background: "#000C66" } }}
    theme={{ colors: { background: "black" } }}
    ref={navigationRef}
  >
    <Stack.Navigator
      // initialRouteName="TokenList"
      mode="modal"
      screenOptions={{
        animation: "slide_from_right",
      }}
    >
     <Stack.Screen
        name="Passcode"
        component={Passcode}
        options={{
          headerShown: false,gestureEnabled:false,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{ headerShown: false,gestureEnabled:false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginPage}
        options={{ headerShown: false,gestureEnabled:false }}
      />
      <Stack.Screen
        name="RegisterScreen"
        component={Register}
        options={{ headerShown: false,gestureEnabled:false }}
      />
      <Stack.Screen
        name="confirmOtp"
        component={ConfirmOtp}
        options={{ headerShown: false,gestureEnabled:false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={Dashboard}
        options={{
          headerShown: false,gestureEnabled:false,
          //header: ({route}) => state.extended===false?Header1( getHeaderTitle(route), state):Header1(getHeaderTitle(route), state)
        }}
      />
      <Stack.Screen
        name="MyWallet"
        component={MyWallet}
        options={{
          header: () => {
            return (
              <WalletHeader
                title={"Wallet"}
                IconName="delete"
                IconType="material"
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="CreateWallet"
        component={CreateWallet}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <Stack.Screen
        name="OfferListView"
        component={OfferListView}
        options={{ headerShown: false,gestureEnabled:false }}
      />
      <Stack.Screen
        name="OfferListViewHome"
        component={OfferListViewHome}
        options={{ headerShown: false,gestureEnabled:false }}
      />

      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{  header: () => {
          return (
            <WalletHeader
              title={"Wallet"}
              IconName="delete"
              IconType="material"
            />
          );
        },}}
      />
      <Stack.Screen
        name="ImportWallet"
        component={ImportWallet}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
       <Stack.Screen
        name="buycrypto"
        component={Generate}
        // options={{ headerShown: true ,headerStyle:{backgroundColor:"#4CA6EA"},headerTintColor:"white"}}
        options={{
          header: () => {
            return (
              <WalletHeader
                title={"Buy"}
                IconName="delete"
                IconType="material"
              />
            );
          },
        }}
      />

      <Stack.Screen
        name="CoinDetails"
        component={CoinDetails}
        options={{
          gestureEnabled:true,
          header: () => {
            return <WalletHeader title="Coin-Detail" />;
          },
        }}
      />

      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
       <Stack.Screen
        name="classic"
        component={classic}
        options={{
          headerShown: false,
        }}
      />

      {/* <Stack.Screen
        name="ScoringTopTab"
        component={ScoringTopTab}
        options={{
          headerShown: true,
          header: () => {
            return <ProfileHeader />;
          },
        }}
      /> */}
      <Stack.Screen
        name="Token"
        component={Token}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
      <Stack.Screen
        name="Nfts"
        component={Nfts}
        options={{
          headerShown: false,gestureEnabled:false,
          //header: ({route}) => state.extended===false?Header1( getHeaderTitle(route), state):Header1(getHeaderTitle(route), state)
        }}
      />

      <Stack.Screen
        name="TxDetail"
        component={TxDetail}
        options={{
          header: () => {
            return <ExchangeHeaderIcon isLogOut={false} title="Tx-Detail" />;
          },
        }}
      />
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{
          headerShown: false,gestureEnabled:false,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      
      <Stack.Screen
        name="GenerateWallet"
        component={GenerateWallet}
        options={{
          headerShown: false,gestureEnabled:false,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <Stack.Screen
        name="PrivateKey"
        component={PrivateKey}
        options={{
          header: () => {
            return <WalletHeader title="Private-Key" />;
          },
        }}
      />

     

      <Stack.Screen
        name="Import"
        component={ImportAccount}
        options={{
          header: () => {
            return <WalletHeader title="Import" />;
          },
        }}
      />

      <Stack.Screen
        name="Import Multi-Coin Wallet"
        component={ImportMunziWallet}
        options={{
          header: () => {
            return <WalletHeader title="Import Multi-Chain Wallet" />;
          },
        }}
      />

      <Stack.Screen
        name="Import Ethereum"
        component={ImportOtherWallets}
        options={{
          header: () => {
            return <WalletHeader title="Import Ethereum" />;
          },
        }}
      />

      <Stack.Screen
        name="Import Binance"
        component={ImportBscWallet}
        options={{
          header: () => {
            return <WalletHeader title="Import Binance" />;
          },
        }}
      />

      <Stack.Screen
        name="Import Polygon"
        component={ImportPolygon}
        options={{
          header: () => {
            return <WalletHeader title="Import Polygon" />;
          },
        }}
      />

      <Stack.Screen
        name="Import Xrp"
        component={ImportXrp}
        options={{
          header: () => {
            return <WalletHeader title="Import Xrp" />;
          },
        }}
      />

<Stack.Screen
        name="ImportStellar"
        component={importStellar}
        options={{
          header: () => {
            return <WalletHeader title="Import Stellar" />;
          },
        }}
      />

      <Stack.Screen
        name="Check Mnemonic"
        component={CheckMnemonic}
        options={{
          header: () => {
            // return <WalletHeader title="Check-Mneumonic" />;
            return <WalletHeader title="Check-Mnemonic"/>;
          },
        }}
      />

      <Stack.Screen
        name="My PrivateKey"
        component={MyPrivateKey}
        options={{
          header: () => {
            return <WalletHeader title="Secret Key" />;
          },
        }}
      />

      <Stack.Screen
        name="Send"
        component={SendTokens}
        options={{
          headerShown: false,
        }}
      />

<Stack.Screen
        name="SendXLM"
        component={SendXLM}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Asset_info"
        component={Asset_info}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Confirm Tx"
        component={ConfirmTransaction}
        options={{
          header: () => {
            return <WalletHeader title="Confirm Tx" />;
          },
        }}
      />

      <Stack.Screen
        name="Transactions"
        component={Transactions}
        options={{
          header: () => {
            return <WalletHeader title="Transaction" />;
          },
        }}
      />
      <Stack.Screen
        name="AllWallets"
        component={AllWallets}
        options={{
          gestureEnabled:true,
          header: () => {
            return <WalletHeader title="All Wallets" />;
          },
        }}
      />
      <Stack.Screen
        name="Biometric"
        component={BiometricPage}
        options={{
          headerShown: false,
          headerTitleAlign:"center",
          headerTitle:"Authentication",
          // headerStyle: { backgroundColor: "#000C66" },
          headerStyle: { backgroundColor: "#4CA6EA"},
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="exchangeLogin"
        component={ExchangeLogin}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
      <Stack.Screen
        name="exchangeRegister"
        component={ExchangeRegister}
        options={{
          header: () => {
            return (
              <ExchangeHeaderIcon isLogOut={false} title="Exchange " />
            );
          },
        }}
      />
      <Stack.Screen
        name="exchange"
        component={ExchangeNavigation}
        options={{
          headerShown: false,gestureEnabled:false,
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
            gestureEnabled: false
          },
        }}
      />
       <Stack.Screen
        name="Subscription"
        component={Subscription}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
      <Stack.Screen
        name="Subscription_det"
        component={Subscription_det}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
      <Stack.Screen
        name="Subcription_payment"
        component={Subcription_payment}
        options={{
          headerShown: false,gestureEnabled:false,
        }}
      />
      <Stack.Screen
        name="appLock"
        component={LockApp}
        options={{
          headerShown: false,gestureEnabled:false,
          headerStyle: { backgroundColor: "#000C66" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

<Stack.Screen
        name="payout"
        component={Payout}
        options={{
          headerShown: false,
    // statusBarHidden:true,
          headerStyle: { backgroundColor: "#4CA6EA" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

<Stack.Screen
        name="newOffer_modal"
        component={NewOfferModal}
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: "#4CA6EA" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />   

      <Stack.Screen
        name="Assets_manage"
        component={Assets_manage}
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: "#4CA6EA" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />    
      <Stack.Screen
        name="send_recive"
        component={send_recive}
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: "#4CA6EA" },
          headerTintColor: "white",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      /> 

<Stack.Screen
        name="Payment"
        component={Payment}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4CA6EA',
          },
          headerTitleAlign: 'center',
          headerTintColor:'white'
        }}
        
      />
    </Stack.Navigator>
  </NavigationContainer>
);
const NavigationProvider = () => {
  let statee = useSelector((state) => state);
  const [extended, setExtended] = useState(false);
  const [state, setState] = useState(statee);

  const updateState = () => {
    let data = store.getState();
    return setState(data);
  };

  function changeState() {
    const data = dispatch(Extend())
      .then((response) => {
        console.log(response);
        const res = response;
        if (res.status == "success") {
          console.log(res);
          console.log("success");
          updateState();
        }
      })
      .catch((error) => {
        console.log(error);
      });
    console.log(data);
  }

  function collapseState() {
    const data = dispatch(Collapse())
      .then((response) => {
        console.log(response);
        const res = response;
        if (res.status == "success") {
          console.log(res);
          console.log("success");
          updateState();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const Header1 = (title, state) => {
    return (
      <MyHeader
        title={title}
        state={state}
        changeState={changeState}
        extended={extended}
        setExtended={setExtended}
      />
    );
  };
  const Header2 = (title, state) => {
    return (
      <MyHeader2
        title={title}
        state={state}
        changeState={collapseState}
        extended={extended}
        setExtended={setExtended}
      />
    );
  };

  const dispatch = useDispatch();

  function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route);
    console.log(routeName);
    switch (routeName) {
      case "Home":
        return "Home";
      case "Market":
        return "Market";
      case "Account":
        return "Account";
      case "Wallet":
        return "Wallet";
      case "Assets":
        return "Assets";
      default:
        return "Home";
    }
  }

  return (
    <AuthStack
      getHeaderTitle={getHeaderTitle}
      extended={extended}
      state={state}
      Header1={Header1}
      Header2={Header2}
      dispatch={dispatch}
    />
  );
};
export default NavigationProvider;
