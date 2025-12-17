// const TokenList = require("../Dashboard/tokens/tokenList.json");
// const PancakeList = require("../Dashboard/tokens/pancakeSwap/PancakeList.json");
// const { getTokenBalancesUsingAddress } = require(
//   "../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService"
// );
// const AsyncStorage = require("@react-native-async-storage/async-storage").default;

// async function getStoredAddresses(key) {
//   try {
//     const storedData = await AsyncStorage.getItem(key);
//     return storedData ? JSON.parse(storedData) : [];
//   } catch (err) {
//     console.error(`Error reading tokens from storage [${key}]:`, err);
//     return [];
//   }a
// }

// const priceCache = {};

// async function fetchPrices(symbols) {
//   const unique = [...new Set(symbols.filter(Boolean))];
//   if (unique.length === 0) return {};

//   const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${unique.join(",")}&tsyms=USD`;
//   try {
//     const res = await fetch(url);
//     const json = await res.json();
//     unique.forEach(sym => {
//       priceCache[sym] = json[sym]?.USD || null;
//     });
//     return priceCache;
//   } catch (err) {
//     console.error("Error fetching batch prices:", err);
//     return {};
//   }
// }

// async function fetchTokenInfoGeneric(address, wallet, network, tokenList, fallback = {}) {
//   try {
//     if (!address || !wallet) return null;

//     const fetched = await getTokenBalancesUsingAddress(address, wallet, network);
//     const data = fetched.tokenInfo[0];

//     const tokenMeta = tokenList.find(
//       (t) => t.address.toLowerCase() === address.toLowerCase()
//     );

//     return {
//       name: data?.name || "Unknown",
//       symbol: data?.symbol || "???",
//       balance: data?.balance || "0",
//       address: data?.address || address,
//       network,
//       img_url: tokenMeta?.logoURI || fallback.img_url || "",
//       price: null, // filled later
//       decimals: data?.decimals || 18
//     };
//   } catch (err) {
//     console.error(`Error fetching token info for ${address} on ${network}:`, err);
//     const tokenMeta = tokenList.find(
//       (t) => t.address.toLowerCase() === address.toLowerCase()
//     );
//     return {
//       name: "Unknown Token",
//       symbol: fallback.symbol || "???",
//       balance: "0",
//       address,
//       network,
//       img_url: tokenMeta?.logoURI || fallback.img_url || "",
//       price: null,
//       decimals: 0,
//       error: err.message
//     };
//   }
// }

// function compareTokens(a, b) {
//   const balanceA = parseFloat(a.balance || 0);
//   const balanceB = parseFloat(b.balance || 0);

//   if (balanceA > 0 && balanceB === 0) return -1;
//   if (balanceA === 0 && balanceB > 0) return 1;
//   if (balanceA !== balanceB) return balanceB - balanceA;

//   return (a.name || a.symbol || "").localeCompare(b.name || b.symbol || "");
// }

// async function fetchAllTokensData(WALLET_ADDRESS) {
//   const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
//   const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;

//   const DEFAULT_TOKENS = [
//     {
//       symbol: "USDT",
//       img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
//       address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
//     },
//     {
//       symbol: "UNI",
//       img_url: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
//       address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
//     },
//     {
//       symbol: "1INCH",
//       img_url: "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
//       address: "0x111111111117dC0aa78b770fA6A738034120C302"
//     }
//   ];

//   const DEFAULT_BNB_TOKENS = [
//     {
//       symbol: "USDT",
//       img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
//       address: "0x55d398326f99059fF775485246999027B3197955"
//     }
//   ];

//   try {
//     const [storedEthAddresses, storedBnbAddresses] = await Promise.all([
//       getStoredAddresses(STORAGE_KEY),
//       getStoredAddresses(STORAGE_BNB_KEY)
//     ]);
//     const fetchPromises = [
//       ...DEFAULT_TOKENS.map((t) =>
//         fetchTokenInfoGeneric(t.address, WALLET_ADDRESS, "ETH", TokenList, t)
//       ),
//       ...storedEthAddresses.map((addr) =>
//         fetchTokenInfoGeneric(addr, WALLET_ADDRESS, "ETH", TokenList)
//       ),
//       ...DEFAULT_BNB_TOKENS.map((t) =>
//         fetchTokenInfoGeneric(t.address, WALLET_ADDRESS, "BSC", PancakeList, t)
//       ),
//       ...storedBnbAddresses.map((addr) =>
//         fetchTokenInfoGeneric(addr, WALLET_ADDRESS, "BSC", PancakeList)
//       )
//     ];

//     const allTokensResults = await Promise.all(fetchPromises);
//     const allTokens = allTokensResults.filter(Boolean);

//     const symbols = allTokens.map(t => t.symbol);
//     await fetchPrices(symbols);
//     const enrichedTokens = allTokens.map(t => ({
//       ...t,
//       price: priceCache[t.symbol] ?? null
//     }));
//     const sortedTokens = enrichedTokens.sort(compareTokens);
//     return {
//       tokens: sortedTokens,
//       timestamp: new Date().toISOString(),
//       wallet: WALLET_ADDRESS
//     };
//   } catch (err) {
//     console.error("Error fetching all tokens:", err);
//     return {
//       error: err.message,
//       tokens: [],
//       timestamp: new Date().toISOString(),
//       wallet: WALLET_ADDRESS
//     };
//   }
// }

import axios from "axios";
import UniSwapTokenList from "../Dashboard/tokens/tokenList.json";
import PancakeTokenList from "../Dashboard/tokens/pancakeSwap/PancakeList.json";
import StellarTokenList from "../Dashboard/exchange/crypto-exchange-front-end-main/src/pages/stellar/Tokens.json";
import { STELLAR_URL } from "../Dashboard/constants";
import * as StellarSdk from '@stellar/stellar-sdk';
import { BINPLORER, BSC_BASE_RPC, ETHPLORER, MULTICHIAN_BASE_RPC, REACT_APP_COIN_GECKO_SIMPLE_PRICE_URL } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";

const CONFIG = {
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  APIS: {
    ETHPLORER: ETHPLORER,
    BINPLORER: BINPLORER,
    BSC_RPC: BSC_BASE_RPC,
    COINGECKO: REACT_APP_COIN_GECKO_SIMPLE_PRICE_URL,
    STELLAR_HORIZON:STELLAR_URL.URL
  },
  TOKEN_LISTS: {
    ETH: UniSwapTokenList,
    BNB: PancakeTokenList,
    XLM: StellarTokenList
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidAddress = (address) => {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true;
  if (/^G[A-Z2-7]{55}$/.test(address)) return true;
  return false;
};

const withRetry = async (fn, retries = CONFIG.MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(CONFIG.RETRY_DELAY * (i + 1));
    }
  }
};

const parseNumber = (value, decimals = 6) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : parseFloat(num.toFixed(decimals));
};


let tokenImageCache = { eth: {}, bnb: {}, xlm: {}, symbols: {} };

const loadTokenLists = () => {
  try {
    if (Array.isArray(CONFIG.TOKEN_LISTS.ETH)) {
      CONFIG.TOKEN_LISTS.ETH.forEach(token => {
        const address = (token.address || '').toLowerCase();
        const logoURI = token.logoURI || null;
        if (address && logoURI) {
          tokenImageCache.eth[address] = logoURI;
        }
      });
    }


    if (Array.isArray(CONFIG.TOKEN_LISTS.BNB)) {
      CONFIG.TOKEN_LISTS.BNB.forEach(token => {
        const address = (token.address || '').toLowerCase();
        const logoURI = token.logoURI || null;
        if (address && logoURI) {
          tokenImageCache.bnb[address] = logoURI;
        }
      });
    }
    
    if (Array.isArray(CONFIG.TOKEN_LISTS.XLM.assets)) {
      CONFIG.TOKEN_LISTS.XLM.assets.forEach(token => {
        const code = token.code || '';
        const issuer = token.issuer || '';
        const assetKey = code && issuer ? `${code}:${issuer}` : '';
        const symbol = code.toUpperCase();
        const logoURI = token.icon || token.logoURI || token.image || null;
        if (assetKey && logoURI) {
          tokenImageCache.xlm[assetKey.toLowerCase()] = logoURI;
        }
        if (symbol && logoURI) {
          tokenImageCache.symbols[symbol] = logoURI;
        }
      });
    }
  } catch (error) {
    console.log("error-existsSync", error)
  }
};

loadTokenLists();

const getTokenImage = (contractAddress, chain, symbol = null, issuer = null) => {
  if (chain === 'Stellar' && symbol && issuer) {
    const assetKey = `${symbol}:${issuer}`.toLowerCase();
    if (tokenImageCache.xlm[assetKey]) {
      return tokenImageCache.xlm[assetKey];
    }
  }

  if (contractAddress === 'Native' && symbol) {
    const symbolKey = symbol.toUpperCase();
    if (tokenImageCache.symbols[symbolKey]) {
      return tokenImageCache.symbols[symbolKey];
    }
  }
  
  const address = contractAddress.toLowerCase();
  const chainKey = chain === 'ETH' ? 'eth' : chain === 'BSC' ? 'bnb' : 'xlm';
  return tokenImageCache[chainKey][address] || null;
};

const getBNBPrice = async () => {
  try {
    const response = await axios.get(CONFIG.APIS.COINGECKO, {
      params: {
        ids: 'binancecoin',
        vs_currencies: 'usd'
      },
      timeout: CONFIG.TIMEOUT
    });
    return response.data?.binancecoin?.usd || 600;
  } catch (error) {
    return 600;
  }
};

const getXLMPrice = async () => {
  try {
    const response = await axios.get(CONFIG.APIS.COINGECKO, {
      params: {
        ids: 'stellar',
        vs_currencies: 'usd'
      },
      timeout: CONFIG.TIMEOUT
    });
    return response.data?.stellar?.usd || 0.10;
  } catch (error) {
    return 0.10;
  }
};

const getEthereumTokens = async (walletAddress, onProgress = null) => {
  if (!isValidAddress(walletAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  try {
    const url = `${CONFIG.APIS.ETHPLORER}/getAddressInfo/${walletAddress}?apiKey=freekey`;

    const response = await withRetry(() =>
      axios.get(url, { timeout: CONFIG.TIMEOUT })
    );

    const data = response.data;
    const tokens = [];
    let totalValueUSD = 0;

    if (data.ETH) {
      const ethBalance = parseNumber(data.ETH.balance || 0);
      const ethPrice = data.ETH.price?.rate || 0;
      const ethValue = ethBalance * ethPrice;

      const ethToken = {
        chain: 'ETH',
        name: 'Ethereum',
        symbol: 'ETH',
        balance: ethBalance,
        balanceUSD: parseNumber(ethValue, 2),
        decimals: 18,
        contractAddress: 'Native',
        price: parseNumber(ethPrice, 2),
        imageUrl: getTokenImage('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'ETH') || null
      };
      tokens.push(ethToken);
      totalValueUSD += ethValue;
      if (onProgress) {
        onProgress({
          chain: 'ETH',
          tokens: [ethToken],
          totalValueUSD: parseNumber(ethValue, 2),
          isPartial: true
        });
      }
    }

    if (Array.isArray(data.tokens) && data.tokens.length > 0) {
      for (const token of data.tokens) {
        const balance = token.balance / Math.pow(10, token.tokenInfo.decimals);

        if (balance > 0) {
          const tokenPrice = token.tokenInfo.price?.rate || 0;
          const tokenValue = balance * tokenPrice;

          tokens.push({
            chain: 'ETH',
            name: token.tokenInfo.name || 'Unknown',
            symbol: token.tokenInfo.symbol || '???',
            balance: parseNumber(balance),
            balanceUSD: parseNumber(tokenValue, 2),
            decimals: token.tokenInfo.decimals,
            contractAddress: token.tokenInfo.address,
            price: parseNumber(tokenPrice, 2),
            imageUrl: getTokenImage(token.tokenInfo.address, 'ETH') || null
          });
          totalValueUSD += tokenValue;
        }
      }
      if (onProgress) {
        onProgress({
          chain: 'ETH',
          tokens: tokens,
          totalValueUSD: parseNumber(totalValueUSD, 2),
          isPartial: false
        });
      }
    }

    return { tokens, totalValueUSD: parseNumber(totalValueUSD, 2) };
  } catch (error) {
    console.log('Ethereum fetch failed:', error);
    return { tokens: [], totalValueUSD: 0 };
  }
};
const getBSCTokensFromBinplorer = async (walletAddress, onProgress = null) => {
  if (!isValidAddress(walletAddress)) {
    throw new Error('Invalid BSC address');
  }

  try {
    const url = `${CONFIG.APIS.BINPLORER}/getAddressInfo/${walletAddress}?apiKey=freekey`;
    const response = await withRetry(() =>
      axios.get(url, { timeout: CONFIG.TIMEOUT })
    );

    const data = response.data;
    const tokens = [];
    let totalValueUSD = 0;

    if (data.ETH) {
      const bnbBalance = parseNumber(data.BNB.balance || 0);
      const bnbPrice = data.BNB.price?.rate || 0;
      const bnbValue = bnbBalance * bnbPrice;

      const bnbToken = {
        chain: 'BSC',
        name: 'Binance Coin',
        symbol: 'BNB',
        balance: bnbBalance,
        balanceUSD: parseNumber(bnbValue, 2),
        decimals: 18,
        contractAddress: 'Native',
        price: parseNumber(bnbPrice, 2),
        imageUrl: getTokenImage('Native', 'BSC', 'BNB') || null
      };

      tokens.push(bnbToken);
      totalValueUSD += bnbValue;
      if (onProgress) {
        onProgress({
          chain: 'BSC',
          tokens: [bnbToken],
          totalValueUSD: parseNumber(bnbValue, 2),
          isPartial: true
        });
      }
    }

    if (Array.isArray(data.tokens) && data.tokens.length > 0) {
      for (const token of data.tokens) {
        const balance = token.balance / Math.pow(10, token.tokenInfo.decimals);

        if (balance > 0) {
          const tokenPrice = token.tokenInfo.price?.rate || 0;
          const tokenValue = balance * tokenPrice;

          tokens.push({
            chain: 'BSC',
            name: token.tokenInfo.name || 'Unknown',
            symbol: token.tokenInfo.symbol || '???',
            balance: parseNumber(balance),
            balanceUSD: parseNumber(tokenValue, 2),
            decimals: token.tokenInfo.decimals,
            contractAddress: token.tokenInfo.address,
            price: parseNumber(tokenPrice, 2),
            imageUrl: getTokenImage(token.tokenInfo.address, 'BSC') || null
          });
          totalValueUSD += tokenValue;
        }
      }

      if (onProgress) {
        onProgress({
          chain: 'BSC',
          tokens: tokens,
          totalValueUSD: parseNumber(totalValueUSD, 2),
          isPartial: false
        });
      }
    }

    return { tokens, totalValueUSD: parseNumber(totalValueUSD, 2) };
  } catch (error) {
    console.error('Binplorer failed, using RPC fallback:', error);
    return await getBNBBalanceViaRPC(walletAddress, onProgress);
  }
};

const getBNBBalanceViaRPC = async (walletAddress, onProgress = null) => {
  try {
    const response = await axios.post(CONFIG.APIS.BSC_RPC, {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [walletAddress, 'latest'],
      id: 1
    }, {
      timeout: CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data?.result) {
      const balanceWei = parseInt(response.data.result, 16);
      const balance = parseNumber(balanceWei / 1e18);
      const bnbPrice = await getBNBPrice();
      const balanceUSD = parseNumber(balance * bnbPrice, 2);

      const bnbToken = {
        chain: 'BSC',
        name: 'Binance Coin',
        symbol: 'BNB',
        balance,
        balanceUSD,
        decimals: 18,
        contractAddress: 'Native',
        price: parseNumber(bnbPrice, 2),
        imageUrl: getTokenImage('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 'BSC', 'BNB') || null
      };

      if (onProgress) {
        onProgress({
          chain: 'BSC',
          tokens: [bnbToken],
          totalValueUSD: balanceUSD,
          isPartial: false
        });
      }

      return { tokens: [bnbToken], totalValueUSD: balanceUSD };
    }
  } catch (error) {
    console.error('RPC fallback failed:', error);
  }

  const bnbPrice = await getBNBPrice();
  const emptyToken = {
    chain: 'BSC',
    name: 'Binance Coin',
    symbol: 'BNB',
    balance: 0,
    balanceUSD: 0,
    decimals: 18,
    contractAddress: 'Native',
    price: parseNumber(bnbPrice, 2),
    imageUrl: getTokenImage('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 'BSC', 'BNB') || null
  };

  if (onProgress) {
    onProgress({
      chain: 'BSC',
      tokens: [emptyToken],
      totalValueUSD: 0,
      isPartial: false
    });
  }

  return { tokens: [emptyToken], totalValueUSD: 0 };
};

const getBSCTokens = async (walletAddress, onProgress = null) => {
  return await getBSCTokensFromBinplorer(walletAddress, onProgress);
};

const getStellarTokens = async (walletAddress, onProgress = null) => {
  try {
    const server = new StellarSdk.Horizon.Server(CONFIG.APIS.STELLAR_HORIZON);
    const account = await server.accounts().accountId(walletAddress).call();
    const tokens = [];
    let totalValueUSD = 0;
    const xlmPrice = await getXLMPrice();

    for (const balance of account.balances) {
      if (balance.asset_type === 'native') {
        const xlmBalance = parseNumber(balance.balance);
        const xlmValue = xlmBalance * xlmPrice;

        const xlmToken = {
          chain: 'Stellar',
          name: 'Stellar Lumens',
          symbol: 'XLM',
          balance: xlmBalance,
          balanceUSD: parseNumber(xlmValue, 2),
          decimals: 7,
          contractAddress: 'Native',
          price: parseNumber(xlmPrice, 2),
          imageUrl: getTokenImage('Native', 'Stellar', 'XLM') || null
        };

        tokens.push(xlmToken);
        totalValueUSD += xlmValue;

        if (onProgress) {
          onProgress({
            chain: 'Stellar',
            tokens: [xlmToken],
            totalValueUSD: parseNumber(totalValueUSD, 2),
            isPartial: false
          });
        }
        break;
      }
    }

    return { tokens, totalValueUSD: parseNumber(totalValueUSD, 2) };
  } catch (error) {
    console.error('Stellar fetch failed:', error);
    const xlmPrice = await getXLMPrice();
    const emptyToken = {
      chain: 'Stellar',
      name: 'Stellar Lumens',
      symbol: 'XLM',
      balance: 0,
      balanceUSD: 0,
      decimals: 7,
      contractAddress: 'Native',
      price: parseNumber(xlmPrice, 2),
      imageUrl: getTokenImage('Native', 'Stellar', 'XLM') || null
    };

    if (onProgress) {
      onProgress({
        chain: 'Stellar',
        tokens: [emptyToken],
        totalValueUSD: 0,
        isPartial: false
      });
    }

    return { tokens: [emptyToken], totalValueUSD: 0 };
  }
};

export async function GetWalletTokens(evmAddress = null, stellarAddress = null, onProgress = null) {
  console.log("GetWalletTokens", evmAddress, stellarAddress);
  if (!evmAddress && !stellarAddress) {
    throw new Error('At least one wallet address is required');
  }

  try {
    if (!Promise.allSettled) {
      Promise.allSettled = function (promises) {
        return Promise.all(
          promises.map((p) =>
            Promise.resolve(p)
              .then((value) => ({ status: "fulfilled", value }))
              .catch((reason) => ({ status: "rejected", reason }))
          )
        );
      };
    }
    const allTokens = [];
    let totalValueUSD = 0;
    const fetchPromises = [];

    if (evmAddress) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(evmAddress)) {
        throw new Error('Invalid EVM address format');
      }
      fetchPromises.push(
        getEthereumTokens(evmAddress, (update) => {
          if (onProgress) {
            onProgress({
              ...update,
              allTokens: [...allTokens, ...update.tokens],
              totalValueUSD: totalValueUSD + update.totalValueUSD
            });
          }
        })
      );

      fetchPromises.push(
        getBSCTokens(evmAddress, (update) => {
          if (onProgress) {
            onProgress({
              ...update,
              allTokens: [...allTokens, ...update.tokens],
              totalValueUSD: totalValueUSD + update.totalValueUSD
            });
          }
        })
      );
    }

    if (stellarAddress) {
      if (!/^G[A-Z2-7]{55}$/.test(stellarAddress)) {
        throw new Error('Invalid Stellar address format');
      }
      fetchPromises.push(
        getStellarTokens(stellarAddress, (update) => {
          if (onProgress) {
            onProgress({
              ...update,
              allTokens: [...allTokens, ...update.tokens],
              totalValueUSD: totalValueUSD + update.totalValueUSD
            });
          }
        })
      );
    }

    const results = await Promise.allSettled(fetchPromises);
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allTokens.push(...result.value.tokens);
        totalValueUSD += result.value.totalValueUSD;
      }
    });
    allTokens.sort((a, b) => b.balance - a.balance);
    return {
      tokens: allTokens,
      totalValueUSD: parseNumber(totalValueUSD, 2)
    };
  } catch (error) {
    throw new Error(`Failed to fetch wallet tokens: ${error.message}`);
  }
}

export const TemporaryTokens=[
  {
      "balance": 0.000,
      "balanceUSD": 0.000,
      "chain": "Stellar",
      "contractAddress": "Native",
      "decimals": 7,
      "imageUrl": "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq",
      "name": "Stellar Lumens",
      "price": 0.000,
      "symbol": "XLM"
  },
  {
      "balance": 0.000,
      "balanceUSD": 0,
      "chain": "ETH",
      "contractAddress": "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
      "decimals": 6,
      "imageUrl": null,
      "name": "USDT",
      "price": 0,
      "symbol": "USDT"
  },
  {
      "balance": 0.000,
      "balanceUSD": 0,
      "chain": "ETH",
      "contractAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "decimals": 6,
      "imageUrl": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      "name": "USDC",
      "price": 0,
      "symbol": "USDC"
  },
  {
      "balance": 0.000,
      "balanceUSD": 0,
      "chain": "ETH",
      "contractAddress": "Native",
      "decimals": 18,
      "imageUrl": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
      "name": "Ethereum",
      "price": 0,
      "symbol": "ETH"
  },
  {
      "balance": 0,
      "balanceUSD": 0,
      "chain": "BSC",
      "contractAddress": "Native",
      "decimals": 18,
      "imageUrl": "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png",
      "name": "Binance Coin",
      "price": 0.000,
      "symbol": "BNB"
  },
  {
      "balance": 0,
      "balanceUSD": 0,
      "chain": "BTC",
      "contractAddress": "Native",
      "decimals": 7,
      "imageUrl": "https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png",
      "name": "Bitcoin",
      "price": 0,
      "symbol": "BTC"
  }
]