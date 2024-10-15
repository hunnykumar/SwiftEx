import axios from 'axios'
import { getBnbTokenBalance, getEthTokenBalance } from '../../../../../utilities/web3utilities'
import { REACT_APP_COIN_GECKO_SIMPLE_PRICE_URL } from '../ExchangeConstants'
 export const getAssetToUsd = async (assetId) => {
   const {
     data: {
       [assetId]: { usd },
     },
   } = await axios.get(
     `${REACT_APP_COIN_GECKO_SIMPLE_PRICE_URL}?ids=${assetId}&vs_currencies=usd`
   )

   return usd
 }

 