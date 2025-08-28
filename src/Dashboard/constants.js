import { TEST_URL,MAIN_URL,POLYGON_API_KEY,MORALIS_API_SECRET,ALCHEMY_PROVIDER_KEY,MORALIS_KEY,SMART_CONTRACT_ADD,JWTSECRET,BSC_RPC,MATIC_RPC,ETH_RPC,XRP_RPC,XRP_WS,ETH_WS,STELLAR_RPC,STELLAR_EXPERT_URL,USER_ENV,ONE_TAP_CONTRACT_ADD,ONE_TAP_USDC_ADD } from '@env';

export const urls = {
  testUrl: TEST_URL,
  mainUrl: MAIN_URL,
};

export const PolygonSecret = {
  apiKey: POLYGON_API_KEY,
};
export const MORALIS_API_KEY = {
  apiKey: MORALIS_API_SECRET,
};

export const API_KEYS ={
  MORALIS:MORALIS_KEY
}
export const EthereumSecret = {
  apiKey: ALCHEMY_PROVIDER_KEY,

};

export const smart_contract_Address=SMART_CONTRACT_ADD;

export const tokenAddresses = {
  BNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
  USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
  DAI: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
  ETH2: "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378",
};

export const faucets ={
  bscFaucet:'https://testnet.binance.org/faucet-smart/',
  ethFaucetGoerli:'https://goerlifaucet.com/',
  polygonFaucet:'https://faucet.polygon.technology/'
}

export const jwtSecret = JWTSECRET;

export const RPC = {
  BSCRPC: BSC_RPC,
  BSCRPC2:BSC_RPC,
  MATICRPC:MATIC_RPC,
  ETHRPC:ETH_RPC,
  ETHRPC2:ETH_RPC,
  XRPRPC:XRP_RPC
};

export const WSS = {
  XRPWSS: XRP_WS,
};

export const WSS_TEST = {
  WSS_SEP: ETH_WS,
};

export const STELLAR_URL={
  URL:STELLAR_RPC,
  EXPERT_URL:STELLAR_EXPERT_URL,
  USERTYPE:USER_ENV,

}

export const OneTapContractAddress={
  Address:ONE_TAP_CONTRACT_ADD
}
export const OneTapUSDCAddress={
  Address:ONE_TAP_USDC_ADD
}
