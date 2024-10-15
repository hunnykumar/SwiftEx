import { CONNECTED_CHAIN_IDs } from './constants'

 const getDefaultChain = () => {
   const chainIdList = CONNECTED_CHAIN_IDs

   if (!chainIdList.length) {
     return console.log('Not connected to any wallet') // Note: here an error should or action suggestion should happen.
   }
   return chainIdList[0]
 }

 let currentCurrentChainId = getDefaultChain()

 export const getCurrentChain = () => currentCurrentChainId