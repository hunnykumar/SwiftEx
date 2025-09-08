const TokenList = require("../Dashboard/tokens/tokenList.json");
const PancakeList = require("../Dashboard/tokens/pancakeSwap/PancakeList.json");
const { getTokenBalancesUsingAddress } = require(
  "../Dashboard/exchange/crypto-exchange-front-end-main/src/utils/getWalletInfo/EtherWalletService"
);
const AsyncStorage = require("@react-native-async-storage/async-storage").default;

async function getStoredAddresses(key) {
  try {
    const storedData = await AsyncStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : [];
  } catch (err) {
    console.error(`Error reading tokens from storage [${key}]:`, err);
    return [];
  }
}

const priceCache = {};

async function fetchPrices(symbols) {
  const unique = [...new Set(symbols.filter(Boolean))];
  if (unique.length === 0) return {};

  const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${unique.join(",")}&tsyms=USD`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    unique.forEach(sym => {
      priceCache[sym] = json[sym]?.USD || null;
    });
    return priceCache;
  } catch (err) {
    console.error("Error fetching batch prices:", err);
    return {};
  }
}

async function fetchTokenInfoGeneric(address, wallet, network, tokenList, fallback = {}) {
  try {
    if (!address || !wallet) return null;

    const fetched = await getTokenBalancesUsingAddress(address, wallet, network);
    const data = fetched.tokenInfo[0];

    const tokenMeta = tokenList.find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );

    return {
      name: data?.name || "Unknown",
      symbol: data?.symbol || "???",
      balance: data?.balance || "0",
      address: data?.address || address,
      network,
      img_url: tokenMeta?.logoURI || fallback.img_url || "",
      price: null, // filled later
      decimals: data?.decimals || 18
    };
  } catch (err) {
    console.error(`Error fetching token info for ${address} on ${network}:`, err);
    const tokenMeta = tokenList.find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return {
      name: "Unknown Token",
      symbol: fallback.symbol || "???",
      balance: "0",
      address,
      network,
      img_url: tokenMeta?.logoURI || fallback.img_url || "",
      price: null,
      decimals: 0,
      error: err.message
    };
  }
}

function compareTokens(a, b) {
  const balanceA = parseFloat(a.balance || 0);
  const balanceB = parseFloat(b.balance || 0);

  if (balanceA > 0 && balanceB === 0) return -1;
  if (balanceA === 0 && balanceB > 0) return 1;
  if (balanceA !== balanceB) return balanceB - balanceA;

  return (a.name || a.symbol || "").localeCompare(b.name || b.symbol || "");
}

async function fetchAllTokensData(WALLET_ADDRESS) {
  const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
  const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;

  const DEFAULT_TOKENS = [
    {
      symbol: "USDT",
      img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    },
    {
      symbol: "UNI",
      img_url: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    },
    {
      symbol: "1INCH",
      img_url: "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
      address: "0x111111111117dC0aa78b770fA6A738034120C302"
    }
  ];

  const DEFAULT_BNB_TOKENS = [
    {
      symbol: "USDT",
      img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
      address: "0x55d398326f99059fF775485246999027B3197955"
    }
  ];

  try {
    const [storedEthAddresses, storedBnbAddresses] = await Promise.all([
      getStoredAddresses(STORAGE_KEY),
      getStoredAddresses(STORAGE_BNB_KEY)
    ]);
    const fetchPromises = [
      ...DEFAULT_TOKENS.map((t) =>
        fetchTokenInfoGeneric(t.address, WALLET_ADDRESS, "ETH", TokenList, t)
      ),
      ...storedEthAddresses.map((addr) =>
        fetchTokenInfoGeneric(addr, WALLET_ADDRESS, "ETH", TokenList)
      ),
      ...DEFAULT_BNB_TOKENS.map((t) =>
        fetchTokenInfoGeneric(t.address, WALLET_ADDRESS, "BSC", PancakeList, t)
      ),
      ...storedBnbAddresses.map((addr) =>
        fetchTokenInfoGeneric(addr, WALLET_ADDRESS, "BSC", PancakeList)
      )
    ];

    const allTokensResults = await Promise.all(fetchPromises);
    const allTokens = allTokensResults.filter(Boolean);

    const symbols = allTokens.map(t => t.symbol);
    await fetchPrices(symbols);
    const enrichedTokens = allTokens.map(t => ({
      ...t,
      price: priceCache[t.symbol] ?? null
    }));
    const sortedTokens = enrichedTokens.sort(compareTokens);
    return {
      tokens: sortedTokens,
      timestamp: new Date().toISOString(),
      wallet: WALLET_ADDRESS
    };
  } catch (err) {
    console.error("Error fetching all tokens:", err);
    return {
      error: err.message,
      tokens: [],
      timestamp: new Date().toISOString(),
      wallet: WALLET_ADDRESS
    };
  }
}

module.exports = fetchAllTokensData;
