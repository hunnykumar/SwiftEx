const Web3 = require("web3");
const { ETH_PROVIDER_NEW, REACT_APP_HOST } = require("./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants");
const { getAuth } = require("./src/Dashboard/exchange/crypto-exchange-front-end-main/src/api");


  export async function swap_prepare(privateKey,fromAddress,toAddress,amount,sourceToken,destinationToken,walletType) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer " + await getAuth());

  const raw = JSON.stringify({
    "fromAddress":fromAddress , //ether publickey
    "toAddress":toAddress ,//stellar publickey
    "amount": amount,
    "sourceToken": sourceToken,
    "destinationToken": destinationToken,
    "walletType": walletType
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(REACT_APP_HOST+"/users/swap_exchange_prepare", requestOptions);
    const result = await response.json();
    if (result.response.status_swap) {
     const res=await sendEvmRawTransaction(privateKey,result.response.res)
     console.log("@@@@@@@",res)
     if(res.status===true)
     {
       await swap_execute(privateKey,fromAddress,toAddress,amount,sourceToken,destinationToken,walletType)
     }
     else{
      return {
        res:error,
        status_task:false
      }
     }
    }
    return {
      res:error,
      status_task:false
    }
  } catch (error) {
    console.log(error);
    return {
      res:error,
      status_task:false
    }
  }
}

  async function swap_execute(privateKey,fromAddress,toAddress,amount,sourceToken,destinationToken,walletType) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer " + await getAuth());

  const raw = JSON.stringify({
    "fromAddress":fromAddress ,
    "toAddress": toAddress,
    "amount": amount,
    "sourceToken": sourceToken,
    "destinationToken": destinationToken,
    "walletType": walletType
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(REACT_APP_HOST+"/users/swap_exchange_execute", requestOptions);
    const result = await response.json();
    console.log("---===0",result)
    if (result.response.status_swap) {
     const res=await sendEvmRawTransaction(privateKey,result.response.res)
     console.log("@@@@@@@",res)
     if(res.status===true)
     {
      return {
        res:res,
        status_task:true
      }
     }
     else{
      return {
        res:error,
        status_task:false
      }
     }
    }
      return {
        res:error,
        status_task:false
      }
  } catch (error) {
    console.log(error);
    return {
      res:error,
      status_task:false
    }
  }
}




async function sendEvmRawTransaction(privateKey, rawTransaction) {
  console.log("--------",privateKey)
  console.log("----rawTransaction----",rawTransaction)

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(ETH_PROVIDER_NEW));
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    if (!rawTransaction.from) {
      throw new Error("rawTransaction.from is undefined");
    }

    // Estimate gas for the transaction
    const gasLimit = await web3.eth.estimateGas(rawTransaction);

    // Get the gas price and nonce
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(rawTransaction.from, 'pending');

    // Sign the transaction
    const signedTx = await account.signTransaction({
      ...rawTransaction,
      gas: gasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
    });

    if (!signedTx.rawTransaction) {
      throw new Error("signedTx.rawTransaction is undefined");
    }

    console.log("Sending transaction with hash:", signedTx.transactionHash);
    // Send the signed transaction
    return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}
