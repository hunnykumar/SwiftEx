const { ethers } = require('ethers');
const { RPC } = require('../Dashboard/constants');
const TokenList = require('../Dashboard/tokens/tokenList.json');
const PancakeList =require ('../Dashboard/tokens/pancakeSwap/PancakeList.json');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function fetchAllTokensData(WALLET_ADDRESS) {
  const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC2);
  const providerBNB = new ethers.providers.JsonRpcProvider(RPC.BSCRPC2);
  
  // Storage keys
  const STORAGE_KEY = `tokens_${WALLET_ADDRESS}`;
  const STORAGE_BNB_KEY = `tokens_BNB${WALLET_ADDRESS}`;

  // ABIs
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)"
  ];

  const ERC20_BNB_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  // Function to fetch token price from CryptoCompare API
  const fetchTokenPrice = async (symbol) => {
    try {
      if (!symbol || symbol === "???" || symbol === "Unknown") {
        return null;
      }
      
      const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`)
      .then((res)=>res.json())
      .then((resJson)=>{
        return resJson
      })
      return response.USD || null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  };

  // Default tokens array
  const DEFAULT_TOKENS = [
    {
        symbol: "USDT",
        img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png",
        address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0" 
      },
      {
        symbol: "UNI",
        img_url: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png",
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
      },
      {
        symbol: "USDC",
        img_url: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png", 
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
      }
  ];
  
  // Default BNB Tokens
  const DEFAULT_BNB_TOKENS = [
    {
        symbol: "USDT",
        img_url: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png", 
        address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
      }
  ]

  // Fetch ETH token info
  const fetchTokenInfo = async (address, img_url = '', symbol = '') => {
    try {
      const imageData = TokenList.find(token => 
        token.address.toLowerCase() === address.toLowerCase()
      );
      const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
      const [name, fetchedSymbol, decimals, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(WALLET_ADDRESS)
      ]);
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      const tokenSymbol = fetchedSymbol || symbol;
      const price = await fetchTokenPrice(tokenSymbol);
      return { 
        name, 
        symbol: tokenSymbol, 
        balance: formattedBalance, 
        address,
        network: "ETH",
        img_url: imageData?.logoURI||'',
        price: price
      };
    } catch (error) {
      console.error(`Error fetching token info for ${address}:`, error);
      const price = await fetchTokenPrice(symbol);
      const imageData = TokenList.find(token => 
        token.address.toLowerCase() === address.toLowerCase()
      );
      return {
        name: "Unknown Token",
        symbol: symbol || "???",
        balance: "0",
        address,
        network: "ETH",
        img_url: imageData?.logoURI||'',
        price: price,
        error: error.message
      };
    }
  };

  // Fetch BNB token info
  const fetchBNBTokenInfo = async (address, img_url = '', symbol = '') => {
    try {
      const imageData = PancakeList.find(token => 
        token.address.toLowerCase() === address.toLowerCase()
      );
      const tokenContract = new ethers.Contract(address, ERC20_BNB_ABI, providerBNB);  
      const [name,fetchedSymbol, decimals, balance] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(WALLET_ADDRESS)
      ]);
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      const tokenSymbol = fetchedSymbol || symbol;
      const price = await fetchTokenPrice(tokenSymbol);
      
      return { 
        name,
        symbol: tokenSymbol,
        balance: formattedBalance, 
        address,
        network: "BSC",
        img_url:  imageData?.logoURI||'',
        price: price
      };
    } catch (error) {
      console.error(`Error fetching token info for ${address}:`, error);
      const imageData = PancakeList.find(token => 
        token.address.toLowerCase() === address.toLowerCase()
      );
      const price = await fetchTokenPrice(symbol);
      return {
        name: "Unknown Token",
        symbol: symbol || "???",
        balance: "0",
        address,
        network: "BSC",
        img_url:  imageData?.logoURI||'',
        price: price,
        error: error.message
      };
    }
  };

  try {
    // Get stored ETH token addresses
    let storedEthAddresses = [];
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      storedEthAddresses = storedData ? JSON.parse(storedData) : [];
    } catch (e) {
      console.error("Error reading ETH tokens from storage:", e);
    }

    // Get stored BNB token addresses
    let storedBnbAddresses = [];
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_BNB_KEY);
      storedBnbAddresses = storedData ? JSON.parse(storedData) : [];
    } catch (e) {
      console.error("Error reading BNB tokens from storage:", e);
    }

    // Fetch all tokens in parallel
    const fetchPromises = [
        // Default ETH tokens
        ...DEFAULT_TOKENS.map(({ address, img_url, symbol }) => 
          fetchTokenInfo(address, img_url, symbol)
        ),
        // Stored ETH tokens
        ...storedEthAddresses.map(address => 
          fetchTokenInfo(address)
        ),
        // Default BNB tokens
        ...DEFAULT_BNB_TOKENS.map(({ address, img_url, symbol }) => 
          fetchBNBTokenInfo(address, img_url, symbol)
        ),
        // Stored BNB tokens
        ...storedBnbAddresses.map(address => 
          fetchBNBTokenInfo(address)
        )
      ];

    // Wait for all tokens to be fetched
    const allTokens = await Promise.all(fetchPromises);
    // Sort all tokens with non-zero balance at the top
    const sortedTokens = allTokens.sort((a, b) => {
      // Convert balances to numbers
      const balanceA = parseFloat(a.balance || 0);
      const balanceB = parseFloat(b.balance || 0);
      
      // First sort by whether balance is > 0
      if (balanceA > 0 && balanceB === 0) {
        return -1; // a comes first
      }
      if (balanceA === 0 && balanceB > 0) {
        return 1; // b comes first
      }
      
      // If both have positive balances or both have zero balance,
      // then sort by balance amount (higher first)
      if (balanceA !== balanceB) {
        return balanceB - balanceA;
      }
      
      // If balances are equal, sort by name
      return a.name.localeCompare(b.name);
    });

    // Return a single result object with all tokens in one array
    const result = {
      tokens: sortedTokens,
      timestamp: new Date().toISOString(),
      wallet: WALLET_ADDRESS
    };

    return result;
  } catch (error) {
    console.error("Error fetching all tokens:", error);
    return {
      error: error.message,
      tokens: [],
      timestamp: new Date().toISOString(),
      wallet: WALLET_ADDRESS
    };
  }
}

module.exports = fetchAllTokensData;