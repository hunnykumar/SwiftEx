import AsyncStorage from "@react-native-async-storage/async-storage";
import { utils } from "ethers";
import { Network, Alchemy } from "alchemy-sdk";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { EthereumSecret, PolygonSecret, WSS } from "../constants";
import { getNonce, getGasPrice } from "../../utilities/utilities";
import { useNavigation } from "@react-navigation/native";
import { RPC } from "../constants";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { alert } from "../reusables/Toasts";
var ethers = require("ethers");

const xrpl = require("xrpl");
const sendEth = async (
  privateKey,
  amount,
  addressTo,
  addressFrom,
  balance,
  setLoading
) => {
  let alchemyProvider;

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
  let fee = ethers.utils.formatEther(maxFee.maxFeePerGas)

  if(Number(amount)===Number(balance)){
    console.log(fee)
   let Amount=Number(amount)-(Number(fee)*22000).toFixed(6)
   amount = Amount.toString()
  }
  console.log(amount)
 
  let transaction = {
    to: addressTo,
    value: utils.parseEther(amount),
    gasLimit: 21000,
    maxPriorityFeePerGas: maxFee.maxPriorityFeePerGas,
    maxFeePerGas: maxFee.maxFeePerGas,
    nonce: nonce,
    type: 2,
    chainId: 11155111,
  };
  console.log(transaction);

  let rawTransaction = await walletPrivateKey.signTransaction(transaction);
  setLoading(false);
  const info = {
    type: "Eth",
    fee: maxFee.maxPriorityFeePerGas,
    rawTransaction: rawTransaction,
    addressTo: addressTo,
    addressFrom: addressFrom,
    amount: amount,
    provider: alchemyProvider,
  };
  return info;
};

const sendBNB = async (
  privateKey,
  amount,
  addressTo,
  addressFrom,
  balance,
  setLoading
) => {
  let provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2);
  //console.log(provider)
  console.log(addressFrom, addressTo, privateKey);
  const walletPrivateKey = new ethers.Wallet(privateKey, provider);
  const nonce = await provider.getTransactionCount(addressFrom); //getNonce(addressFrom)
  console.log(nonce);
  
  const gasPrice = await provider.getGasPrice(addressFrom);
  console.log("hi", gasPrice);
  let fee = ethers.utils.formatEther(gasPrice)

  if(Number(amount)===Number(balance)){
   let Amount=Number(amount)-(Number(fee)*22000).toFixed(6)
   amount = Amount.toString()
  }
  console.log(amount)
  let transaction = {
    gasLimit: 21000,
    gasPrice: gasPrice, //await provider.getGasPrice(addressFrom),
    nonce: nonce, //provider.getTransactionCount(addressFrom),
    to: addressTo,
    data: "0x",
    value: ethers.utils.parseEther(amount),
  };
  console.log(transaction);
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
  setLoading(false);

  return info;
};

const sendMatic = async (
  privateKey,
  amount,
  addressTo,
  addressFrom,
  balance,
  setLoading
) => {
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
  let fee = ethers.utils.formatEther(gasPrice)
  
  if(Number(amount)===Number(balance)){
   let Amount=Number(amount)-(Number(fee)*22000)
   amount = Amount.toString()
  }
  console.log(amount)
 
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
  let rawTransaction = await walletPrivateKey.signTransaction(transaction);
  const info = {
    type: "Matic",
    fee: gasPrice,
    rawTransaction: rawTransaction,
    addressTo: addressTo,
    addressFrom: addressFrom,
    amount: amount,
    provider: alchemy,
  };
  setLoading(false);

  return info;
};
const sendXRP = async (privateKey, amount, addressTo, balance,setLoading) => {
  console.log("started");
  console.log(privateKey);
  const Wallet = xrpl.Wallet.fromSecret(privateKey);
  console.log("hi" + Wallet.classicAddress);
  const client = new xrpl.Client(WSS.XRPWSS);
  await client.connect();
  const wallet = await AsyncStorageLib.getItem("wallet");
  console.log(JSON.parse(wallet).address);
  // const prepared = await client
  //   .autofill({
  //     TransactionType: "Payment",
  //     Account: Wallet.classicAddress,
  //     Amount: xrpl.xrpToDrops(`${amount}`),
  //     Destination: addressTo,
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });
  
 // const signed = Wallet.sign(prepared);
  
  
  if(Number(amount)===Number(balance)){
    let Amount=Number(amount)-10
    amount = Amount.toFixed(2).toString()
    console.log("XRP AMOUNT",amount)
   }
   const Prepared = await client
    .autofill({
      TransactionType: "Payment",
      Account: Wallet.classicAddress,
      Amount: xrpl.xrpToDrops(`${amount}`),
      Destination: addressTo,
    })
    .catch((e) => {
      console.log(e);
    });
    const Signed = Wallet.sign(Prepared);
    const max_ledger = Prepared.LastLedgerSequence;
    console.log("Prepared transaction instructions:", Prepared);
    console.log("Transaction cost:", xrpl.dropsToXrp(Prepared.Fee), "XRP");
    console.log("Transaction expires after ledger:", max_ledger);
  const info = {
    type: "XRP",
    fee: Prepared.Fee,
    rawTransaction: Signed,
    addressTo: addressTo,
    addressFrom: Wallet.classicAddress,
    amount: amount,
    provider: client,
  };
  setLoading(false);

  return info;
};
const SendCrypto = async (
  recieverAddress,
  amount,
  decrypt,
  balance,
  setLoading,
  walletType,
  setDisable,
  myAddress,
  Token,
  navigation
) => {
  let provider;

  // const walletType = await AsyncStorage.getItem('walletType')
  try{

    console.log(walletType);
    if (walletType == "BSC") {
      provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC);
    }
    setLoading(true);
    
    const privateKey = decrypt ? decrypt : alert("no wallets connected");
    console.log(privateKey);
    const addressTo = recieverAddress; //"0x0E52088b2d5a59ee7706DaAabC880Aaf5A1d9974"//address;
    
    const addressFrom = myAddress
    ? myAddress
    : alert("please choose a wallet first");
    
    if (walletType == "Ethereum") {
      await sendEth(privateKey, amount, addressTo, addressFrom, balance,setLoading).then(
        (response) => {
          console.log(response);
          let info = response;
          const txCost = info.fee.toString();
          let fee = ethers.utils.formatEther(txCost)
          let finalAmount = Number(info.amount)+Number(fee)
          info.finalAmount=finalAmount
          setLoading(false);
          if(Number(finalAmount)>Number(balance)){
            
            return alert("error","You don't have enough balance to do this transaction")
          }
          navigation.navigate("Confirm Tx", {
            info,
          });
        }
        );
      } else if (walletType == "Matic") {
        try {
          await sendMatic(
            privateKey,
            amount,
            addressTo,
            addressFrom,
            balance,
            setLoading
            ).then((response) => {
              console.log(response);
              let info = response;
              const txCost = info.fee.toString();
              let fee = ethers.utils.formatEther(txCost)
              let finalAmount = Number(info.amount)+Number(fee)
              info.finalAmount=finalAmount
              setLoading(false);
              if(Number(finalAmount)>=Number(balance)){
                return alert("error","You don't have enough balance to do this transaction")
              }
              navigation.navigate("Confirm Tx", {
                info,
              });
            });
          } catch (e) {
            setDisable(true);
            
            console.log(e);
            setLoading(false);
          }
        } else if (walletType == "BSC") {
          await sendBNB(privateKey, amount, addressTo, addressFrom, balance,setLoading).then(
            (response) => {
              console.log(response);
              let info = response;
              const txCost = info.fee.toString();
              let fee = ethers.utils.formatEther(txCost)
              let finalAmount = Number(info.amount)+Number(fee)
              info.finalAmount=finalAmount
              setLoading(false);
              if(Number(finalAmount)>Number(balance)){
                return alert("error","You don't have enough balance to do this transaction")
              }
              navigation.navigate("Confirm Tx", {
                info,
              });
            }
            );
          } else if (walletType == "Xrp") {
            await sendXRP(privateKey, amount, addressTo, balance,setLoading).then(
              (response) => {
                console.log(response);
                let info = response;
                const txCost = info.fee.toString();
                let fee = ethers.utils.formatEther(txCost)
                let finalAmount = Number(info.amount)+Number(fee)
                info.finalAmount=finalAmount
                setLoading(false);
                if(Number(balance)<11)
                {
                  return alert("error","Your minnimum balance should be 10 to send xrp")

                }
                if(Number(finalAmount)>=Number(balance)){
                  return alert("error","You don't have enough balance to do this transaction")
                }
                navigation.navigate("Confirm Tx", {
                  info,
                });
              }
              ).catch((e)=>{
                setLoading(false)
              });
            } else if (walletType === "Multi-coin") {
              if (Token === "Ethereum") {
                await sendEth(
                  privateKey,
                  amount,
                  addressTo,
                  addressFrom,
                  balance,
                  setLoading
                  ).then((response) => {
                    console.log(response);
        let info = response;
        const txCost = info.fee.toString();
        let fee = ethers.utils.formatEther(txCost)
        let finalAmount = Number(info.amount)+Number(fee)
        info.finalAmount=finalAmount
        setLoading(false);
        if(Number(finalAmount)>Number(balance)){
          return alert("error","You don't have enough balance to do this transaction")
        }        
        navigation.navigate("Confirm Tx", {
          info,
        });
      });
    } else if (Token === "BNB") {
      await sendBNB(
        privateKey,
        amount,
        addressTo,
        addressFrom,
        balance,
        setLoading
        ).then((response) => {
          console.log(response);
          let info = response;
          const txCost = info.fee.toString();
          let fee = ethers.utils.formatEther(txCost)
          setLoading(false);
         
          /*if(Number(amount)===Number(balance)){
            let finalAmount = Number(info.amount)-(Number(fee)*10)
            info.amount = finalAmount
            //return alert("You don't have enough balance to do this transaction")
          }*/
          let finalAmount = Number(info.amount)+Number(fee)
          info.finalAmount=finalAmount
          if(Number(finalAmount)>Number(balance)){
            return alert("error","You don't have enough balance to do this transaction")
          }
          navigation.navigate("Confirm Tx", {
            info,
          });
        });
      } else if (Token === "Matic") {
        await sendMatic(
          privateKey,
          amount,
          addressTo,
          addressFrom,
          balance,
          setLoading
          ).then((response) => {
            console.log(response);
            let info = response;
            const txCost = info.fee.toString();
            let fee = ethers.utils.formatEther(txCost)
            let finalAmount = Number(info.amount)+Number(fee)
            info.finalAmount=finalAmount
            setLoading(false);
            if(Number(finalAmount)>Number(balance)){
              return alert("error","You don't have enough balance to do this transaction")
            }
            navigation.navigate("Confirm Tx", {
              info,
            });
          });
        }else if(Token==='Multi-coin-Xrp'){
          await sendXRP(privateKey, amount, addressTo,balance,setLoading).then(
            (response) => {
              console.log(response);
              let info = response;
              const txCost = info.fee.toString();
              let fee = ethers.utils.formatEther(txCost)
              let finalAmount = Number(info.amount)+Number(fee)
              info.finalAmount=finalAmount
              setLoading(false);
              if(Number(balance)<11)
              {
                return alert("error","Your minnimum balance should be 10 to send xrp")

              }
              if(Number(finalAmount)>=Number(balance)){
                return alert("error","You don't have enough balance to do this transaction")
              }
              navigation.navigate("Confirm Tx", {
                info,
              });
            }
            );
          } 
          else if (Token === "Xrp") {
            await sendXRP(privateKey, amount, addressTo, balance,setLoading).then(
              (response) => {
                console.log(response);
                let info = response;
                const txCost = info.fee.toString();
                let fee = ethers.utils.formatEther(txCost)
                let finalAmount = Number(info.amount)+Number(fee)
                info.finalAmount=finalAmount
                setLoading(false);
                if(Number(finalAmount)>=Number(balance)){
                  return alert("error","You don't have enough balance to do this transaction")
                }
                 navigation.navigate("Confirm Tx", {
                  info,
                });
              }
              );
            }
          } else {
            setDisable(true);
            
            setLoading(false);
            return alert("error","chain not supported yet");
          }
          
          setLoading(false);
        }catch(e){
          if(e.message=='invalid arrayify value (argument="value", value="-0xbefe6f671f38", code=INVALID_ARGUMENT, version=bytes/5.7.0)'){
            setLoading(false);
            return alert("error","You don't have enough balance to do this transaction")
          }
          else if(e.message=='fractional component exceeds decimals [ See: https://links.ethers.org/v5-errors-NUMERIC_FAULT ] (fault="underflow", operation="parseFixed", code=NUMERIC_FAULT, version=bignumber/5.7.0)')
          {
            setLoading(false)
            return alert("error","You don't have enough balance to do this transaction")
          }
          alert("error",e)
          console.log(e.message)
          setLoading(false);

        }
        };
        export { SendCrypto };
        