import * as FileSystem from 'react-native-fs';
import { StorageAccessFramework } from 'react-native-fs';
import { Alert } from 'react-native';
import { RPC, tokenAddresses, urls } from '../Dashboard/constants';
import "react-native-get-random-values"
import "@ethersproject/shims"
import {  utils } from "ethers"
import CryptoES from "crypto-es";
import CryptoJS from "react-native-crypto-js";
import { getPassword } from '../constants/alertConstants';
import { useDispatch, useSelector } from "react-redux";
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import Web3 from 'web3';
import { useNavigation } from '@react-navigation/native';
import  Clipboard from "@react-native-clipboard/clipboard";
import React from 'react';
var ethers = require('ethers');


//var CryptoJS = require("crypto-js");
export const navigationRef = React.createRef();

export function NavigationController(location){
  navigationRef.current?.navigate(location);
}

export async function SendTransaction(signedTx, Token){
  let response
  const token = await AsyncStorageLib.getItem('token')
  try{

  
   response = await fetch(`http://${urls.testUrl}/user/sendtransaction`, {
    method: 'POST',
    headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json'
    },
   body: JSON.stringify({
             signedTx:signedTx,
            token:token})
   }).then((response) => response.json())
   .then(async (responseJson) => {
    console.log(responseJson)
   
    return {hash:responseJson.responseData}
    
  
  }).catch((error)=>{
    alert(error)
  })
}catch(e){
  console.log(e)
  alert(e)
}
  console.log(response)
  return response

}
export async function getNonce(address){
  console.log(address)
    const provider =  new ethers.providers.JsonRpcProvider(RPC.BSCRPC); // TESTNET
    const nonce = await provider.getTransactionCount(address)
    console.log(nonce)

    return nonce
  
}

export async function getGasPrice(){

  const provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC) // TESTNET
  const gasPrice = await provider.getGasPrice()
  console.log(gasPrice)
  return  gasPrice 
 
}


export async function sendSignedTx(signedTx, amount){
  let response
  try{

  
    response = await fetch(`http://${urls.testUrl}/user/approveSwap`, {
      method: 'POST',
      headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json'
      },
     body: JSON.stringify({
               signedTx:signedTx,
              amount:amount})
     }).then((response) => response.json())
     .then(async (responseJson) => {
      console.log(responseJson)
     
      
      return responseJson
    
    }).catch((error)=>{
      alert(error)
    })
  }catch(e){
    console.log(e)
    alert(e)
  }
  return response
}

export async function getTx (value){
  console.log(value)
  //const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  //0xb95d6b10ac0a25bd273b02c4a218a73421131c58f93ded639a464664913ecaa5
  //const amount=web3.utils.toWei(String(valuee), 'ether');
 // console.log(web3)
 
  const privKey = "0x8f9bf6100069b8a670bc26bf517fea21ce6eae3280f949f98a7d05d57d6314e4"//decrypt;
  const addressTo = "0x0E52088b2d5a59ee7706DaAabC880Aaf5A1d9974"//address;

  
const addressFrom = '0x4c817a1aba8069B12859e3249276844feCAE5051';
const  walletPrivateKey = new ethers.Wallet(privKey)
   // const provider =  new ethers.providers.StaticJsonRpcProvider('https://bsc.getblock.io/testnet/?api_key=a011daa0-3099-4f55-b22c-c3a3d55898d0'); // TESTNET
    const provider =  new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545'); // TESTNET
    const tx = {
        to: addressTo,
        value: ethers.utils.parseEther("0.0001")
       
        
      }
     // console.log(await provider.getGasPrice(addressFrom))
      //const wallet = walletPrivateKey.connect(provider)

const nonce = await getNonce(addressFrom)
console.log(nonce)
     var transaction = {
        gasLimit: 21000,
        gasPrice: 20000000000,//await provider.getGasPrice(addressFrom),
        nonce:nonce,//provider.getTransactionCount(addressFrom),
        to: addressTo,
        data: "0x",
        value: ethers.utils.parseEther("0.00666")
      };
  
      //console.log(wallet)
      const signer = await walletPrivateKey.signTransaction(transaction)
      console.log(signer)
     const result = await SendTransaction(signer)
     // const txx = await provider.sendTransaction(signer)
      //console.log(txx)
//const txxx =await wallet.sendTransaction(signer)
//console.log(txxx)
}
export const encryptFile =  (privateKey, password) =>{

  var ciphertext = CryptoJS.AES.encrypt(privateKey, password);
  console.log("encrypted text", ciphertext.toString());
  return ciphertext.toString()
 
}
export const decryptFile=  (privateKey, password) =>{
  var bytes  = CryptoJS.AES.decrypt(privateKey.toString(), password);
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
  //console.log("decrypted text", plaintext);
  return plaintext
}

export const saveWallet = async (emailId,path, password, name)=>{
  const response= await fetch(`http://${urls.testUrl}/user/savewallet`, {
    method: 'POST',
    headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json'
    },
   body: JSON.stringify({
    emailId:emailId,
    name:name,
    path: path,
    password:password

  })  
   }).then((response) => response.json())
.then((json) => {
 
  console.log(json);
})
.catch((error) => {
  console.error(error);
});
}

export const saveFile = async (name,privateKey, mnemonic,password, emailId, dispatch, getDirectoryUri, FolderUri) => {
  
  let permission = false
  
 return Alert.alert(
    "Save PrivateKey",
    "Press ok to save your private key",
    [
      {
        text: "Cancel",
        onPress: () =>{
           const decrypt = decryptFile(privateKey,password)
           alert(`Private key : ${decrypt}. Please write this key down for using your wallet in future`)
          
          },
        style: "cancel"
      },
      { text: "OK", onPress: async() =>       {
        
       let permission
       let directoryUri
        //console.log(folder_info)
       
        // Create file and pass it's SAF URI
        //const key = encryptFile(data, password)
        //console.log(key)
        console.log(FolderUri)
        if(!FolderUri){

          permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          directoryUri = permission.directoryUri//'content://com.android.externalstorage.documents/tree/primary%3AMunzi'//permission.directoryUri;//"content://com.android.externalstorage.documents/tree/primary%3AAndroid%2FMunzi"//permission.directoryUri;
          console.log(directoryUri)
          if(directoryUri){
            dispatch(getDirectoryUri(directoryUri))
          }
          if(permission.granted){
            
            await StorageAccessFramework.createFileAsync(directoryUri, `${name}.txt`, "application/text").then(async(fileUri) => {
              // Save data to newly created file
              await FileSystem.writeAsStringAsync(fileUri, privateKey, { encoding: FileSystem.EncodingType.UTF8 });
              console.log(fileUri)
              saveWallet(emailId,fileUri, password, name)
              alert("File Saved to Munzi folder in Internal storage")
              
            })
            .catch((e) => {
              console.log(e);
            });
            
            await StorageAccessFramework.createFileAsync(directoryUri, `${name}mnemonic.txt`, "application/text").then(async(fileUri) => {
              // Save data to newly created file
              await FileSystem.writeAsStringAsync(fileUri, mnemonic, { encoding: FileSystem.EncodingType.UTF8 });
              console.log(fileUri)
              // saveWallet(emailId,fileUri, password, name)
              //alert("File Saved")
              
            })
            .catch((e) => {
              console.log(e);
            });
            
          }else{
            alert('you must provide permission to save')
          }
          
        }else{
          await StorageAccessFramework.createFileAsync(FolderUri, `${name}.txt`, "application/text").then(async(fileUri) => {
            // Save data to newly created file
            await FileSystem.writeAsStringAsync(fileUri, privateKey, { encoding: FileSystem.EncodingType.UTF8 });
            console.log(fileUri)
            saveWallet(emailId,fileUri, password, name)
            alert("File Saved ")
            
          })
          .catch((e) => {
            console.log(e);
          });
          
          await StorageAccessFramework.createFileAsync(FolderUri, `${name}mnemonic.txt`, "application/text").then(async(fileUri) => {
            // Save data to newly created file
            await FileSystem.writeAsStringAsync(fileUri, mnemonic, { encoding: FileSystem.EncodingType.UTF8 });
            console.log(fileUri)
            // saveWallet(emailId,fileUri, password, name)
            //alert("File Saved")
            
          })
          .catch((e) => {
            console.log(e);
          });
          
        }
            
      
      }
      }
      ]
      );
      
}

export const readData = async (emailId, dispatch ,importAllWallets)=>{
  let result=0
  var allWallets =[]
  let password
  try{

    const response= await fetch(`http://${urls.testUrl}/user/getallwallets`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailId:emailId,
        
        
      })  
    }).then((response) => response.json())
    .then(async (json) => {
      const accounts =json.accounts
      console.log(accounts[0].length)
      if(accounts[0].length!==0){
        
        accounts.map(async (element )=> {
          
          
          for(let i=0;i<element.length;i++ ){
            
            const uri=element[i].filePath//'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FEncrypt/document/primary%3ADownload%2FEncrypt%2Fmaxy.txt'
            password=element[i].encryptionPassword
            result = await FileSystem.readAsStringAsync(uri,{ encoding: FileSystem.EncodingType.UTF8 }).then(async data => {
              
              let filedata={}
              filedata.privateKey=data
              
              console.log(element[i].accountName)
              const decrypt =  decryptFile(filedata.privateKey, password)
              
              allWallets.push({privateKey:decrypt, name :element[i].accountName}) 
              
              return  allWallets
              //console.log(allWallets)
              // are you sure you want to resolve the data and not the base64 string? 
            }).catch(err => {
              console.log("​getFile -> err", err);
              alert(`error while getting the file for account ${element[i].accountName}. Please make sure the file exists or is in valid format`)
            });;
          }
          
          dispatch(importAllWallets(allWallets))
          .then(async (response) => {
            if(response){
              console.log(response)
              alert('wallets import successful')
            }
            
            
          })
          .catch((error) => {
            
            console.log(error)
            alert('failed to import wallets. please try again')
            
          });
          
          
          
        });
        
      }
        else{
          console.log('no wallets found')
          alert('No wallets found. Try to create a wallet first with the app or import one')
        }
        
      })
      .catch((error) => {
        console.error(error);
      });
    }catch(e){
      console.log(e)
      alert('failed to import wallet')   
    }
    
    console.log(allWallets)
    return allWallets;
  }

  export const CheckWallet = async (emailId, dispatch, importAllWallets)=>{
    let result=0
    var allWallets =[]
    let password
    try{
  
      const response= await fetch(`http://${urls.testUrl}/user/getallwallets`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailId:emailId,
          
          
        })  
      }).then((response) => response.json())
      .then(async (json) => {
        const accounts =json.accounts
        console.log(accounts[0].length)
        if(accounts[0].length!==0){
          
          accounts.map(async (element )=> {
            
            
            for(let i=0;i<element.length;i++ ){
              
              const uri=element[i].filePath//'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FEncrypt/document/primary%3ADownload%2FEncrypt%2Fmaxy.txt'
              password=element[i].encryptionPassword
              result = await FileSystem.readAsStringAsync(uri,{ encoding: FileSystem.EncodingType.UTF8 }).then(async data => {
                
                let filedata={}
                filedata.privateKey=data
                
                console.log(element[i].accountName)
                const decrypt =  decryptFile(filedata.privateKey, password)
                
                allWallets.push({privateKey:decrypt, name :element[i].accountName}) 
                
                return  allWallets
                //console.log(allWallets)
                // are you sure you want to resolve the data and not the base64 string? 
              }).catch(err => {
                console.log("​getFile -> err", err);
                console.log('error while getting the file. Please make sure the file exists or is in valid format')
              });;
            }
            
            dispatch(importAllWallets(allWallets, emailId))
            .then(async (response) => {
              if(response){
                console.log(response)
                console.log('wallets import successful')
              }
              
              
            })
            .catch((error) => {
              
              console.log(error)
              console.log('failed to import wallets. please try again')
              
            });
            
            
            
          });
          
        }
          else{
            console.log('no wallets found')
            console.log('No wallets found. Try to create a wallet first with the app or import one')
          }
          
        })
        .catch((error) => {
          console.error(error);
        });
      }catch(e){
        console.log(e)
        console.log('failed to import wallet')   
      }
      
      console.log(allWallets)
      return allWallets;
    }
  

export const getWalletData = async (emailId, setData)=>{
      let result=0
      var allWallets =[]
      let password
      let response
      try{
    
         response= await fetch(`http://${urls.testUrl}/user/getallwallets`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emailId:emailId,
            
            
          })  
        }).then((response) => response.json())
        .then(async (json) => {
          const accounts =json.accounts
         //console.log(accounts)
          if(accounts[0].length!==0){
            
            accounts.map(async (element )=> {
              
              
              for(let i=0;i<element.length;i++ ){
                
                const uri=element[i].filePath//'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FEncrypt/document/primary%3ADownload%2FEncrypt%2Fmaxy.txt'
                password=element[i].encryptionPassword
                result = await FileSystem.readAsStringAsync(uri,{ encoding: FileSystem.EncodingType.UTF8 }).then(async data => {
                  
                  let filedata={}
                  filedata.privateKey=data
                  
                  //console.log(element[i].accountName)
                  //const decrypt =  decryptFile(filedata.privateKey, password)
                  
                
                  allWallets.push({privateKey:data, name :element[i].accountName}) 
                  return  allWallets
                  //console.log(allWallets)
                  // are you sure you want to resolve the data and not the base64 string? 
                }).catch(err => {
                  console.log("​getFile -> err", err);
                  alert(`error while getting the file for account ${element[i].accountName}. Please make sure the file exists or is in valid format`)
                });;
              }
              
             
              
              
            });
            
          }
            else{
              console.log('no wallets found')
              alert('No wallets found. Try to create a wallet first with the app or import one')
            }
            
          })
          .catch((error) => {
            console.error(error);
          });
        }catch(e){
          
          console.log(e)
          alert('failed to import wallet')   
        }
        
        console.log(allWallets)
        setData(allWallets)
         //dispatch(getWalletsData(allWallets))
        return response;
      }
    

export const VerifyTransaction = async (emailId,name,pass, SendMoney, balance,amount,address, setLoading, setVisible, setVisible2, visible2)=>{
  var isValid =[]
 
  var val ={}
  let result
  let resultt=0
 
  let data=[]
  let validity
console.log(name)
console.log(pass)
 const  response = await fetch(`http://${urls.testUrl}/user/getallwallets`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailId:emailId,
      
      
    })  
  }).then((response) => response.json())
  .then( async (json) => {
    const accounts =json.accounts
    console.log(accounts[0].length)
   // console.log(acc)
   //console.log(filteredHomes)
   let isValid1 =undefined
   console.log(json.accounts)


   //const newArray= accounts.map(element => element);
   //console.log(newArray)
const length = accounts[0].length
   for(let i=0;i<=length;i++){
    accounts.map((e)=>{
     // console.log(e[i])
      data.push(e[i])
      
     // console.log(data)
     })
    // console.log(accounts[i].accountName)
   }
   
if(data){
data.forEach( async(element, index, accounts) => {
   
     if(element){
    if(element.accountName===name){
        
      console.log(element)
      const uri=element.filePath//'content://com.android.externalstorage.documents/tree/primary%3ADownload%2FEncrypt/document/primary%3ADownload%2FEncrypt%2Fmaxy.txt'
     let password=pass
     result = await FileSystem.readAsStringAsync(uri,{ encoding: FileSystem.EncodingType.UTF8 })
     console.log(result)
     let filedata={}
     filedata.privateKey=result
     const decrypt = await decryptFile(filedata.privateKey, password)
     if(decrypt){
      setVisible(false)
      console.log(decrypt)
      isValid.push({privateKey:decrypt, valid:true}) 
      
      console.log(isValid)
      
     // const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
      //console.log(web3)
     //const data = await getTx(amount,decrypt,address)
    // const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  //0xb95d6b10ac0a25bd273b02c4a218a73421131c58f93ded639a464664913ecaa5
  
  


 let data =  await SendMoney(address, amount, decrypt, balance, setLoading)
     }
     else{
      Alert.alert(
        "Invalid Password",
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
       
      
    }
  }
    
});

}
 
  }).catch(err => {
    
    console.log(err);
    
  });
  
  

  }
    

export async function checkWalletValidity(name, emailId){

  const response = await fetch(`http://${urls.testUrl}/user/checkallwallets`, {
    method: 'POST',
    headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json'
    },
   body: JSON.stringify({
    emailId:emailId,       
    name:name})  
   }).then((response) => response.json())
   .then((responseJson) => {
    console.log(responseJson.validity)
    return responseJson.validity.status
  
  });
  console.log(response)
  return response


}

export async function getAmountsOut(amountIn,inToken,outToken,type){
  try{

    const factory = "0x182859893230dC89b114d6e2D547BFFE30474a21"
    const routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"
   // const {amountIn, inToken,outToken,type} = input
    
    const provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2)
    
    const router = new ethers.Contract(
        routerAddress,
        [
            'function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)',
        ],
        provider
        );
        let amounts
        let amountsOutMin
        
        if(type==='BNBTOTOKEN'){
            
            amounts = await router.getAmountsOut(amountIn, [tokenAddresses.WBNB, outToken]);
            amountsOutMin = amounts[1].sub(amounts[1].div(10));

        }
        else if(type==='TOKENTOBNB'){
            
            amounts = await router.getAmountsOut(amountIn, [inToken,tokenAddresses.WBNB]);
            amountsOutMin = amounts[1].sub(amounts[1].div(10));

        }
        else{
            amounts = await router.getAmountsOut(amountIn, [inToken, outToken]);
            amountsOutMin = amounts[1].sub(amounts[1].div(10));

            
        }
        if(amountsOutMin){

            return amountsOutMin//mapper.responseMappingWithData(usrConst.CODE.Success,usrConst.MESSAGE.Success,amountsOutMin)
        }
        else{
            return null//mapper.responseMapping(usrConst.CODE.BadRequest,usrConst.MESSAGE.TransactionFailure)

        }

        
    }catch(e){
        console.log(e)
        return null//mapper.responseMapping(usrConst.CODE.BadRequest,usrConst.MESSAGE.internalServerError)

    }

 /* const token = await AsyncStorageLib.getItem('token')
  const response = await fetch(`http://${urls.testUrl}/user/getAmountsOut`, {
    method: 'POST',
    headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json'
    },
   body: JSON.stringify({
    token:token,
    inToken:inToken,       
    outToken:outToken,
    amountIn:amountIn,
    type:type
  })  
   }).then((response) => response.json())
   .then((responseJson) => {
    console.log(responseJson)
    return responseJson.responseData

    
  });
  return response*/
}

export async function sendSwapTx(signedTx,TOKEN_ADD,amount,USER_ADD,token){
 // const {signedTx,TOKEN_ADD,amount,USER_ADD} = input
  const provider = new ethers.providers.JsonRpcBatchProvider(RPC.BSCRPC2)

  const ROUTER_ADD = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'
const erc20ABI = [
  'function allowance(address owner,address spender) public virtual view returns (uint256)',
]
const erc20Contact = new ethers.Contract(TOKEN_ADD, erc20ABI, provider)

const tx = await provider.sendTransaction(signedTx)
await tx.wait()

console.log(tx)
// Check the allowance
let routerAllowance = await erc20Contact.allowance(USER_ADD, ROUTER_ADD)
if (!routerAllowance.gte(amount)) {
  // wait for three sec
  await sleep(3000)

  routerAllowance = await erc20Contact.allowance(USER_ADD, ROUTER_ADD)
  if (!routerAllowance.gte(amount)) return 'Error in trasaction'
}

console.log(routerAllowance.toString())

return routerAllowance.toString()


}

export async function approveSwap(tokenAdd,amount,PRIVATE_KEY,token){
  console.log('starting approve')
  const wallet = new ethers.Wallet(PRIVATE_KEY)
  const ROUTER_ADD = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'

  const erc20ABI = [
    'function approve(address spender, uint value) public virtual returns (bool)',
  ]
  const erc20Contact = new ethers.Contract(tokenAdd, erc20ABI)
  // const amount = ethers.utils.parseEther('0.00000002') // amount is provided by user

  const  nonce  = await getNonce(wallet.address) // get from '/getNonce' route
  const  gasPrice  = await getGasPrice() // get from '/getGasPrice' route
  const gasLimit = 500000

  const unsignedTx = await erc20Contact.populateTransaction.approve(
    ROUTER_ADD,
    amount,
    {
      nonce,
      gasPrice,
      gasLimit,
    },
  )

  const signedTx = await wallet.signTransaction(unsignedTx)

  console.log(unsignedTx)
  console.log(signedTx)
  const tx = await sendSwapTx(signedTx,tokenAdd,amount,wallet.address,token)
  console.log(tx)
  return tx

}

export const SaveTransaction = async (type,hash,user,Token,walletType,chainType) => {
   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"+type+hash+user+Token+walletType+chainType)
  let userTransactions = [];
  
  await AsyncStorageLib.getItem(`${user}-transactions`)
   .then(async (transactions)=>{
    console.log(JSON.parse(transactions))
    const data = JSON.parse(transactions)
    if(data){
      data.map((item)=>{

        userTransactions.push(item)
      })
      console.log(userTransactions)
      let txBody ={
        hash,
        type,
        walletType,
        chainType
      }
     userTransactions.push(txBody)
     await AsyncStorageLib.setItem(`${user}-transactions`,JSON.stringify(userTransactions))
     return userTransactions
    }else{
      let transactions =[]
      let txBody ={
        hash,
        type,
        walletType,
        chainType
      }
      transactions.push(txBody)
      await AsyncStorageLib.setItem(`${user}-transactions`,JSON.stringify(transactions))
      return transactions
      }
   })    
  };

  export const SavePayout = async (senderId, receiverId, date, time, g_amount, g_ASSET, status) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + senderId + receiverId + date + time);
    let userTransactions = [];
  
    try {
        const transactions = await AsyncStorageLib.getItem(`${senderId}-transactions`);
        console.log(JSON.parse(transactions));
  
        const data = JSON.parse(transactions);
  
        if (data) {
            data.forEach((item) => {
                userTransactions.push(item);
            });
  
            console.log("Existing transactions:", userTransactions);
  
            let txBody = {
                senderId,
                receiverId,
                date,
                time,
                g_amount,
                g_ASSET,
                status,
            };
  
            userTransactions.push(txBody);
  
            await AsyncStorageLib.setItem(`${senderId}-transactions`, JSON.stringify(userTransactions));
        } else {
            let transactions = [];
            let txBody = {
                senderId,
                receiverId,
                date,
                time,
                g_amount,
                g_ASSET,
                status,
            };
            transactions.push(txBody);
  
            await AsyncStorageLib.setItem(`${senderId}-transactions`, JSON.stringify(transactions));
  
            userTransactions = transactions;
        }
  
        console.log("Updated userTransactions:", userTransactions);
  
        return userTransactions;
    } catch (error) {
        console.error("Error saving payout:", error);
        throw error;
    }
};

export const getAllDataAndShow = async (senderId) => {
  try {
      const transactions = await AsyncStorageLib.getItem(`${senderId}-transactions`);
      const data = JSON.parse(transactions);

      if (data) {
          const transactionList = data.map((item, index) => {
              return {
                  id: index + 1,
                  ...item,
              };
          });
          return transactionList;
      } else {
          console.log("No transactions found for the specified senderId.");
          return [];
      }
  } catch (error) {
      console.error("Error retrieving data:", error);
      throw error;
  }
};

  export const getEthPrice = async ()=>{
    const response =await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
    .then((res)=>res.json())
    .then((resJson)=>{
      //console.log("Eth Current price",resJson)
      return resJson
    })
    return response
  }

  export const getXLMPrice = async ()=>{
    const response =await fetch('https://min-api.cryptocompare.com/data/price?fsym=XLM&tsyms=USD')
    .then((res)=>res.json())
    .then((resJson)=>{
      return resJson
    })
    console.log(",.,.,.,.,",response)
    return response
  }

  export const getBnbPrice = async ()=>{
    const response =await fetch('https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD')
    .then((res)=>res.json())
    .then((resJson)=>{
      //console.log("Eth Current price",resJson)
      return resJson
    })
    return response
  }

  export const getXrpPrice = async ()=>{
    const response =await fetch('https://min-api.cryptocompare.com/data/price?fsym=XRP&tsyms=USD')
    .then((res)=>res.json())
    .then((resJson)=>{
      console.log("xrp Current price",resJson)
      return resJson
    })
    return response
  }


  export const getEtherBnbPrice = async (address,address2) => {
    const token = await AsyncStorageLib.getItem('token')
   const result = await fetch(`http://${urls.testUrl}/user/getEtherTokenPrice`, {
  method: 'POST',
  headers: {
           Accept: 'application/json',
           'Content-Type': 'application/json'
  },
 body: JSON.stringify({
          token:token,
           Ethaddress:address,
           Bnbaddress:address2
          })
 })
 .then((response)=>response.json())
 .then((response) => {
  console.log(response)
  return response.responseData
  
 })
 
 return result
  };

  export function isFloat(value) {
    if (
      !Number.isNaN(Number(value)) &&
      !Number.isInteger(Number(value))
    ) {
      return true;
    }
  
    return false;
  }

  export function isInteger(value)
  {
    console.log(value)
    if(value &&  Number.isSafeInteger(Number(value)))
    {
      return true
    }
    return false
  }
  
  export const Paste = async (func) => {
    try {
      const text = await Clipboard.getString();
      if (func && typeof func === 'function') {
        func(text);
      }
      return text;
    } catch (error) {
      console.error("Error accessing clipboard:", error);
      return null;
    }
  };