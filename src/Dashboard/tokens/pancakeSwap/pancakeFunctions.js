import "@ethersproject/shims";
import { ethers } from "ethers";
import { RPC, tokenAddresses } from "../../constants";
//import { getAmountsOut } from "../../../utilities/utilities"
async function getAmountsOut(amountIn, inToken, outToken, type) {
  console.log("hi getting amounts out");
  console.log("======================================GETTING ERROR FROM SWAP")
  try {
    const factory = "0x182859893230dC89b114d6e2D547BFFE30474a21";
    const routerAddress = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    //const {amountIn, inToken,outToken,type} = input
    // console.log(amountIn, inToken,outToken,type)
    const provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC);

    const router = new ethers.Contract(
      routerAddress,
      [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns(uint[] memory amounts)",
      ],
      provider
    );
    let amounts;
    let amountsOutMin;

    if (type === "BNBTOTOKEN") {
      amounts = await router.getAmountsOut(amountIn, [
        tokenAddresses.WBNB,
        outToken,
      ]);
      amountsOutMin = amounts[1].sub(amounts[1].div(10));
    } else if (type === "TOKENTOBNB") {
      amounts = await router.getAmountsOut(amountIn, [
        inToken,
        tokenAddresses.WBNB,
      ]);
      amountsOutMin = amounts[1].sub(amounts[1].div(10));
    } else {
      amounts = await router.getAmountsOut(amountIn, [inToken, outToken]);
      amountsOutMin = amounts[1].sub(amounts[1].div(10));
    }
    if (amountsOutMin) {
      return amountsOutMin;
    } else {
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

const getSwapPrice = async (amountIn, address1, address2, type) => {
  const addresses = {
    WBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    bnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
    USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    DAI: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
    ETH: "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378",
    factory: "0x182859893230dC89b114d6e2D547BFFE30474a21",
    router: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
  };

  const RouterABI = [
    "function swapExactETHForTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual returns (uint256[] memory amounts)",
    "function swapExactETHForTokensSupportingFeeOnTransferTokens( uint256 amountOutMin, address[] calldata path, address to, uint256 deadline ) external payable virtual",
  ];

  const pancakeRouterContract = new ethers.Contract(
    addresses.router,
    RouterABI
  );
  // const amounts = await router.getAmountsOut(amountIn, [addresses.WBNB, address2]);
  console.log(amountIn, address1, address2, type);
  const amountOutMin = await getAmountsOut(amountIn, address1, address2, type);
  console.log(amountOutMin);
  const response = {
    token1totoken2: ethers.utils.formatEther(amountOutMin),
    token2totoken1: 0,
  };
  return response;
};

export { getSwapPrice };
