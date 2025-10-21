import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COINCAP_BASE_URL, COINGECKO_BASE_URL } from '../ExchangeConstants';

const CONFIG = {
  baseURL: COINGECKO_BASE_URL,
  fallbackURL: COINCAP_BASE_URL,
  cacheExpiry: 60000,
  persistentCacheExpiry: 300000,
  maxRequestsPerMinute: 25,
  maxRetries: 3,
  retryDelay: 2000,
  requestTimeout: 10000,
  batchSize: 5,
  batchDelay: 500,
};

// Token mapping
const TOKEN_MAP = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'BSC': 'binancecoin',
  'SOL': 'solana',
  'USDC': 'usd-coin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'TRX': 'tron',
  'MATIC': 'matic-network',
  'POLYGON': 'matic-network',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'AVALANCHE': 'avalanche-2',
  'LINK': 'chainlink',
  'ATOM': 'cosmos',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'FTM': 'fantom',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'BITCOIN': 'bitcoin',
  'ETHEREUM': 'ethereum',
  'BINANCE': 'binancecoin',
  'SOLANA': 'solana',
  'ARBITRUM': 'arbitrum',
  'OPTIMISM': 'optimism',
  'BASE': 'ethereum',
};

const COINCAP_MAP = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'binancecoin': 'binance-coin',
  'solana': 'solana',
  'ripple': 'xrp',
  'cardano': 'cardano',
  'dogecoin': 'dogecoin',
  'matic-network': 'polygon',
};

// State management
let memoryCache = new Map();
let requestTimestamps = [];
let isInitialized = false;

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getTokenId = (tokenOrNetwork) => {
  const normalized = tokenOrNetwork.toUpperCase().trim();
  return TOKEN_MAP[normalized] || tokenOrNetwork.toLowerCase();
};

const canMakeRequest = () => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  requestTimestamps = requestTimestamps.filter(ts => ts > oneMinuteAgo);
  
  return requestTimestamps.length < CONFIG.maxRequestsPerMinute;
};

const waitForRateLimit = async () => {
  while (!canMakeRequest()) {
    const oldestRequest = requestTimestamps[0];
    const waitTime = (oldestRequest + 60000) - Date.now() + 100;
    
    if (waitTime > 0) {
      await sleep(waitTime);
    }
  }
};

// Cache management
const loadPersistentCache = async () => {
  try {
    const cached = await AsyncStorage.getItem('crypto_price_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CONFIG.persistentCacheExpiry) {
        memoryCache = new Map(Object.entries(parsed.data));
      }
    }
  } catch (error) {
    console.warn('Failed to load persistent cache:', error);
  }
};

const savePersistentCache = async () => {
  try {
    const cacheData = {
      data: Object.fromEntries(memoryCache),
      timestamp: Date.now()
    };
    await AsyncStorage.setItem('crypto_price_cache', JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save persistent cache:', error);
  }
};

const getCachedPrice = (tokenId) => {
  const cacheKey = `price_${tokenId}`;
  const cached = memoryCache.get(cacheKey);
  
  if (cached) {
    return cached.price;
  }
  
  return null;
};

const setCachePrice = (tokenId, price) => {
  const cacheKey = `price_${tokenId}`;
  memoryCache.set(cacheKey, {
    price,
    timestamp: Date.now()
  });
  
  savePersistentCache().catch(() => {});
};

const isCacheValid = (tokenId) => {
  const cacheKey = `price_${tokenId}`;
  const cached = memoryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CONFIG.cacheExpiry) {
    return true;
  }
  
  return false;
};

// API functions
const fetchFromCoinGecko = async (tokenId) => {
  await waitForRateLimit();
  requestTimestamps.push(Date.now());
  
  const response = await axios.get(`${CONFIG.baseURL}/simple/price`, {
    params: {
      ids: tokenId,
      vs_currencies: 'usd'
    },
    timeout: CONFIG.requestTimeout
  });

  return response.data[tokenId]?.usd || null;
};

const fetchFromCoinCap = async (tokenId) => {
  const coinCapId = COINCAP_MAP[tokenId] || tokenId;
  
  const response = await axios.get(`${CONFIG.fallbackURL}/assets/${coinCapId}`, {
    timeout: CONFIG.requestTimeout
  });

  return parseFloat(response.data.data.priceUsd);
};

const fetchPriceWithRetry = async (tokenId, retries = 0) => {
  try {
    const price = await fetchFromCoinGecko(tokenId);
    
    if (!price) {
      return await fetchFromCoinCap(tokenId);
    }

    return price;
    
  } catch (error) {
    // Handle rate limiting
    if (error.response?.status === 429) {
      if (retries < CONFIG.maxRetries) {
        const delay = CONFIG.retryDelay * Math.pow(2, retries);
        await sleep(delay);
        return fetchPriceWithRetry(tokenId, retries + 1);
      }
      return getCachedPrice(tokenId);
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      if (retries < CONFIG.maxRetries) {
        await sleep(CONFIG.retryDelay);
        return fetchPriceWithRetry(tokenId, retries + 1);
      }
    }
    
    // Try fallback API
    if (retries === 0) {
      try {
        return await fetchFromCoinCap(tokenId);
      } catch (fallbackError) {
        return getCachedPrice(tokenId);
      }
    }
    
    throw error;
  }
};

export const getTokenPrice = async (tokenOrNetwork) => {
  const tokenId = getTokenId(tokenOrNetwork);
  
  // Check cache first
  if (isCacheValid(tokenId)) {
    return getCachedPrice(tokenId);
  }

  try {
    const price = await fetchPriceWithRetry(tokenId);
    
    if (price === null) {
      throw new Error(`Unable to fetch price for "${tokenOrNetwork}". Please try again later.`);
    }

    setCachePrice(tokenId, price);
    return price;
    
  } catch (error) {
    // Try to use cached price even if expired
    const cachedPrice = getCachedPrice(tokenId);
    if (cachedPrice) {
      console.warn(`Using stale cache for ${tokenOrNetwork}`);
      return cachedPrice;
    }
    throw error;
  }
};

// Main conversion function
export const convertToUSD = async (tokenOrNetwork, amount) => {
  try {
    // Validation
    if (!tokenOrNetwork || tokenOrNetwork.trim() === '') {
      throw new Error('Token or network name is required');
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      throw new Error('Amount must be a valid number');
    }

    if (numAmount < 0) {
      throw new Error('Amount must be positive');
    }

    // Get price
    const price = await getTokenPrice(tokenOrNetwork);
    const usdValue = price * numAmount;

    return {
      success: true,
      token: tokenOrNetwork.toUpperCase(),
      amount: numAmount,
      pricePerToken: price,
      usdValue: usdValue,
      formattedUSD: `$${usdValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unable to convert. Please try again.',
      token: tokenOrNetwork,
      amount: amount
    };
  }
};

// Batch conversion
export const convertMultiple = async (conversions) => {
  const results = [];
  
  for (let i = 0; i < conversions.length; i += CONFIG.batchSize) {
    const batch = conversions.slice(i, i + CONFIG.batchSize);
    const batchResults = await Promise.all(
      batch.map(({ token, amount }) => convertToUSD(token, amount))
    );
    results.push(...batchResults);
    
    if (i + CONFIG.batchSize < conversions.length) {
      await sleep(CONFIG.batchDelay);
    }
  }
  
  return results;
};

// Preload common tokens
const preloadCommonTokens = async () => {
  const commonTokens = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'XRP'];
  
  try {
    await Promise.all(
      commonTokens.map(token => getTokenPrice(token).catch(() => {}))
    );
  } catch (error) {
    console.warn('Failed to preload tokens:', error);
  }
};



// Initialize service
const initialize = async () => {
  if (!isInitialized) {
    await loadPersistentCache();
    preloadCommonTokens().catch(() => {});
    isInitialized = true;
  }
};

initialize();
