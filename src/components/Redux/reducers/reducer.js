import { combineReducers } from 'redux'
const defaultState=0
const loginReducer = (state=defaultState, action) => {
  switch(action.type) {
    case "LOGIN":
      return Object.assign({}, state, {
        user: action.payload.user,
        loginSuccess: true,
    });
    case "LOGOUT":
      return Object.assign({}, state, {
        loginSuccess: false,
      });
      case "WALLET_SUCCESS":
      return Object.assign({}, state, {
        wallet: action.payload.wallet
    });
    case "IMPORT_SUCCESS":
      return Object.assign({}, state, {
        wallets: action.payload.wallets
    });
    case "BALANCE_SUCCESS":
      return Object.assign({}, state, {
        walletBalance: action.payload.walletBalance
    });
    case "EXTENDED":
      return Object.assign({}, state, {
        extended: true
    });
    case "COLLAPSE":
      return Object.assign({}, state, {
        extended: false
    });
    case "CONFIRMOTP":
      return Object.assign({}, state, {
        OTP:action.payload.OTP
    });
    case "IMPORTALLWALLETS":
      return Object.assign({}, state, {
        wallets:action.payload.wallets
    });
    case "SETCURRENTWALLET":
      return Object.assign({}, state, {
        wallet:action.payload.wallet
    });
    case "ADDTOALLWALLETS":
      return Object.assign({}, state, {
        wallets:action.payload.wallets
    });
    case "CHECKWALLETS":
      return Object.assign({}, state, {
        wallets:action.payload.wallets
    });

    case "GETWALLETSDATA":
      return Object.assign({}, state, {
        walletsData:action.payload.walletsData
    });

    case "IMPORTUSINGFILE":
      return Object.assign({}, state, {
        wallets:action.payload.wallets
    });
    case "GETDIRECTORYURI":
      return Object.assign({}, state, {
        directoryUri:action.payload.directoryUri
    });
    case "SETTOKEN":
      return Object.assign({}, state, {
        token:action.payload.token
    });

    case "NEWWALLET":
      return Object.assign({}, state, {
        wallet:action.payload.wallet
    });

    case "SETUSER":
      return Object.assign({}, state, {
        user:action.payload.user
    });

    case "SETPROVIDER":
      return Object.assign({}, state, {
        provider:action.payload.provider
    });

    case "SETWALLETTYPE":
      return Object.assign({}, state, {
        walletType:action.payload.walletType
    });

    case "ETHBALANCESUCCESS":
      return Object.assign({}, state, {
        EthBalance:action.payload.EthBalance
    });

    case "MATICBALANCESUCCESS":
      return Object.assign({}, state, {
        MaticBalance:action.payload.MaticBalance
    });

    case "XRPBALANCESUCCESS":
      return Object.assign({}, state, {
        XrpBalance:action.payload.XrpBalance
    });
    case "SETPLATFORM":
      return Object.assign({}, state, {
        platform:action.payload.platform
    });
    
    default:
      return state;
  }
}

export default combineReducers({ login: loginReducer})