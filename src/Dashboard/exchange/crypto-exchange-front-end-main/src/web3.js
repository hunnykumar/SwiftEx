// import { Transaction } from '@ethereumjs/tx'
import { useState } from 'react'
import Web3 from 'web3'
import { ERC20_ABI, ETH_ERC20_ADDRESSES } from './utils/constants'
import { Button } from 'react-native'
import { StyleSheet, Text, View} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { REACT_APP_ETH_RPC_URL } from './ExchangeConstants';
import { ethers } from 'ethers'
import { RPC } from '../../../constants';
import { CHAIN_NATIVE_CURRENCY } from './utils/constants'


const PRIVATE_KEY = "0x0cc27a4468a19efa2b727e57eb226c2fc07441228de6681f581c6763b4572bd4"
  //'e35f135a0db8fdee9a7f5ee8fcb9890f16694203372fae3c211949f34a6b9acb'

const ALLOWED_NETWORK_ID = 5
export const ConnectToWallet = ({ setMessage }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectedAccount, setConnectedAccount] = useState(null)

  const connect = async () => {
     
     try {
    if (!window.ethereum) throw new Error('No MetaMask Wallet found')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      window.web3 = new Web3(window.ethereum)
      setConnectedAccount(accounts[0])
      const chain = await window.web3.eth.getChainId()

      if (chain !== ALLOWED_NETWORK_ID) {
        // Todo: request for chain switch
        throw new Error(
          `Only Goerli Chain Allowed to Connect, connected chain Id: ${chain}`
        )
      }

      window.isWeb3Connected = true
      setIsConnected(true)
    } catch (error) {
      return setMessage(
        error.message || 'Something went wrong while connecting to wallet'
      )
    }
  }

  const disConnect = async () => {
    window.isWeb3Connected = false
    setIsConnected(false)
  }

  return (
    <View >
      {isConnected ? (
        <View style={{width:'40'}}>

       

          <Button onPress={disConnect} title='Disconnect' >
           
          </Button>
       
          <View >
            Connected Account: {connectedAccount}
          </View>
        </View>
        
      ) : (
        <View style={{width:wp(40), display:'flex', alignContent:'center',alignItems:'center'}} >
        <Button onPress={connect} title={'connect'} color={'green'} >
         
        </Button>
        </View>
      )}
</View>
  )
}
export const CHAIN_ID_TO_TX_TYPE = {
   5: 2,
   11155111: 2,
   97: 0,
   80001: 2,
 }


export const isWalletConnected = () => window.isWeb3Connected
export const getWeb3Provider = () =>
  window.isWeb3Connected ? window.web3 : null

export const transfer = (tokenAddress, receiver, amount, sender, senderAddress,chainId ) => {
  const provider = CHAIN_ID_TO_PROVIDER[chainId]

  if (tokenAddress === CHAIN_NATIVE_CURRENCY)
  return _transferEth(receiver, amount, sender, provider,chainId)

  
  return _transferEthToken(tokenAddress, receiver, amount,provider,chainId)
}

// <------------------------------< Helpers >------------------------------>

const _transferEth = async (receiver, amount,sender, provider,chainId) => {
  
  try {
    const wallet = new ethers.Wallet(sender, provider)


    const rawTx = {
      to: receiver,
      value: ethers.utils.parseEther(amount.toString()),
      type: CHAIN_ID_TO_TX_TYPE[chainId],
    }

    const populatedTx = await wallet.populateTransaction(rawTx)
    console.log(populatedTx)

    const signedTx = await wallet.signTransaction(populatedTx)
    const parsedSignedTx = await ethers.utils.parseTransaction(signedTx)

    return {
      signedTx: { rawTransaction: signedTx },
      txHash: parsedSignedTx.hash,
    }
    } catch (err) {
    console.log(err)
    return { err }
  }
}

const _transferEthToken = async (tokenAddress, receiver, amount, provider,chainId) => {
  try {
    
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)

    const decimals = await tokenContract.decimals()
    const amountInWei = ethers.utils.parseUnits(amount, decimals)

    // Get tx data
    await tokenContract.callStatic.transfer(receiver, amountInWei, {
      from: '0xc3090cd5160CB689051F0083944cbcEa6a1be19B', // NOTE: Replace the static address with the connected address
    })

    const rawTx = await tokenContract.populateTransaction.transfer(
      receiver,
      amountInWei,
       { type: CHAIN_ID_TO_TX_TYPE[chainId] }
    )
    const populatedTx = await wallet.populateTransaction(rawTx)
    const signedTx = await wallet.signTransaction(populatedTx)
    const parsedSignedTx = ethers.utils.parseTransaction(signedTx)


    // Create raw tx
    return {
      signedTx: { rawTransaction: signedTx },
      txHash: parsedSignedTx.hash,
    }
  } catch (err) {
    console.log(err)
    return { err }
  }
}

const _getWeiValue = (amount, decimals, web3) => {
  const multiple = 10 ** decimals

  if (Number(amount) < 1) return Math.floor(amount * 10 ** decimals)
  return web3.utils.toBN(amount).mul(web3.utils.toBN(multiple))
}

export const CHAIN_ID_TO_PROVIDER = {
  // 1: new ethers.providers.JsonRpcProvider(
  //   process.env.REACT_APP_ETH_MAINNET_RPC
  // ),
  5: new ethers.providers.JsonRpcProvider(RPC.ETHRPC),
  11155111: new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_SEPOLIA_RPC
  ),
  97: new ethers.providers.JsonRpcProvider(
    RPC.BSCRPC
  ),
  80001: new ethers.providers.JsonRpcProvider(
    RPC.MATICRPC
  ),
  // Here goes the list of other nets
}

export const CHAIN_ID_TO_SCANNER = {
  5: 'https://goerli.etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  97: 'https://testnet.bscscan.com',
  80001: 'https://mumbai.polygonscan.com',
}