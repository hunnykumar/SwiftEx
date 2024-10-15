export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
]

export const ETH_ERC20_ADDRESSES = {
  USDT: '0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49',
  WBTC: '0x8869DFd060c682675c2A8aE5B21F2cF738A0E3CE',
  DAI: '0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464',
}

export const NOTIFICATION_TYPES = {
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_ADDED: 'BID_ADDED',
  OFFER_FINALIZED: 'OFFER_FINALIZED',
}

export const OFFER_STATUS_ENUM = {
  ACTIVE: 'ACTIVE',
  MATCHED: 'MATCHED',
  CANCELED: 'CANCELED',
  FINALIZIED: 'FINALIZIED',
}

export const CHAIN_NATIVE_CURRENCY = 'NATIVE'; // used to represent native currencies
export const APP_FEE_PERCENTAGE = 0.005
export const TX_FEE_IN_USD = 2
export const CONNECTED_CHAIN_IDs = [5, 97] // NOTE: this chain Ids list has to be gotten from the connected wallet

export const COUNTRY_TO_ROUTING_NUMBER_ALIAS = {
  IN: 'IFSC Code',
  US: 'Routing Number',
  UK: 'Sort Code',
  CA: 'Transit Number',
  AU: 'BSB Code',
  NZ: 'Bank/Branch Number',
  JP: 'Bank Code/Branch Code',
  KR: 'Bank Code/Branch Code',
  HK: 'Clearing Code/Branch Code',
  SG: 'Bank Code/Branch Code',
  AD: 'IBAN',
  AL: 'IBAN',
  AT: 'IBAN',
  BA: 'IBAN',
  BE: 'IBAN',
  BG: 'IBAN',
  CH: 'IBAN',
  CY: 'IBAN',
  CZ: 'IBAN',
  DE: 'IBAN',
  DK: 'IBAN',
  EE: 'IBAN',
  ES: 'IBAN',
  FI: 'IBAN',
  FO: 'IBAN',
  FR: 'IBAN',
  GI: 'IBAN',
  GL: 'IBAN',
  GR: 'IBAN',
  HR: 'IBAN',
  HU: 'IBAN',
  IE: 'IBAN',
  IL: 'IBAN',
  IS: 'IBAN',
  IT: 'IBAN',
  KW: 'IBAN',
  KZ: 'IBAN',
  LB: 'IBAN',
  LI: 'IBAN',
  LT: 'IBAN',
  LU: 'IBAN',
  LV: 'IBAN',
  MC: 'IBAN',
  MD: 'IBAN',
  ME: 'IBAN',
  MK: 'IBAN',
  MT: 'IBAN',
  MU: 'IBAN',
  NL: 'IBAN',
  NO: 'IBAN',
  PL: 'IBAN',
  PT: 'IBAN',
  QA: 'IBAN',
  RO: 'IBAN',
  RS: 'IBAN',
  SA: 'IBAN',
  SE: 'IBAN',
  SI: 'IBAN',
  SK: 'IBAN',
  SM: 'IBAN',
  TN: 'IBAN',
  TR: 'IBAN',
}

export const BID_STATUS_ENUM = {
  ACTIVE: 'ACTIVE',
  MATCHED: 'MATCHED',
  CANCELED: 'CANCELED',
  FINALIZIED: 'FINALIZIED',
}