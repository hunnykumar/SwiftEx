import { ethers } from "ethers";
import { REACT_APP_HOST } from "../Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
const { getAuth, proxyRequest, PPOST, PGET } = require("../Dashboard/exchange/crypto-exchange-front-end-main/src/api");


async function hasEnoughFunds(fromAddress, txMeta, value = "0") {
    const resProxy = await proxyRequest(`/v1/bsc/${fromAddress}/balance`, PGET);
    const balance = ethers.BigNumber.from(resProxy?.res);
    const gasLimit = ethers.BigNumber.from(txMeta.gasLimit);
    const gasPrice = ethers.BigNumber.from(txMeta.feeData.gasPrice);
    const maxFeePerGas = ethers.BigNumber.from(txMeta.feeData.maxFeePerGas);
    const txValue = ethers.BigNumber.from(value);
    const requiredLegacy = txValue.add(gasLimit.mul(gasPrice));
    const requiredEip1559 = txValue.add(gasLimit.mul(maxFeePerGas));
    return {
        balance,
        requiredLegacy,
        requiredEip1559,
        hasLegacy: balance.gte(requiredLegacy),
        hasEip1559: balance.gte(requiredEip1559),
    };
}


export async function SwapPepare(privateKey, fromAddress, toAddress, amount, sourceToken, destinationToken, walletType, feePayType) {
    try {
        const firstResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
            "fromAddress": fromAddress,
            "toAddress": toAddress,
            "amount": amount,
            "sourceToken": sourceToken,
            "destinationToken": destinationToken,
            "walletType": walletType,
            "feePayType": feePayType === "native" ? "native" : "stablecoin"
        });

        console.log("First API call response:", firstResponse);

        if (firstResponse.err) {
            return {
                res: firstResponse.err?.message || "Swap failed",
                status_task: false
            };
        }

        if (!firstResponse.res.transaction) {
            return {
                res: "No transaction data received",
                status_task: false
            };
        }

        const transactionType = firstResponse.res.type;
        console.log(`Executing ${transactionType} transaction...`);
        if (feePayType === "native") {
            const fundCheck = await hasEnoughFunds(fromAddress, firstResponse.res.txMeta);
            console.log("Wallet Balance:", ethers.utils.formatEther(fundCheck.balance));
            console.log("Needed (EIP-1559):", ethers.utils.formatEther(fundCheck.requiredEip1559));
            if (!fundCheck.hasEip1559) {
                return {
                    res: `Insufficient funds: not enough ETH to pay for ${transactionType} gas.`,
                    status_task: false
                };
            }
        }
        const firstTxResult = await sendEvmRawTransaction(privateKey, firstResponse.res);
        console.log(`${transactionType} transaction result:`, firstTxResult);

        if (firstTxResult.status !== true) {
            return {
                res: `${transactionType} transaction failed`,
                status_task: false
            };
        }

        const firstTxHash = firstTxResult.res;
        console.log(`${transactionType} completed, hash:`, firstTxHash);
        if (transactionType === 'approve') {
            console.log("Approval completed, now executing transfer...");
            await waitForTransactionConfirmation(firstTxHash);
            const secondResponse = await proxyRequest("/v1/bridge/swap-transaction/prepare", PPOST, {
                "fromAddress": fromAddress,
                "toAddress": toAddress,
                "amount": amount,
                "sourceToken": sourceToken,
                "destinationToken": destinationToken,
                "walletType": walletType,
                "feePayType": feePayType === "native" ? "native" : "stablecoin"
            });
            console.log("Second API call response:", secondResponse);
            if (secondResponse.err) {
                return {
                    res: secondResponse.err?.message || "Transfer preparation failed",
                    status_task: false,
                    approvalTxHash: firstTxHash?.txHash
                };
            }

            if (!secondResponse.res.transaction) {
                return {
                    res: "No transfer transaction data received",
                    status_task: false,
                    approvalTxHash: firstTxHash?.txHash
                };
            }
            if (feePayType === "native") {
                const transferFundCheck = await hasEnoughFunds(fromAddress, secondResponse.res.txMeta);
                if (!transferFundCheck.hasEip1559) {
                    return {
                        res: "Insufficient funds for transfer transaction",
                        status_task: false,
                        approvalTxHash: firstTxHash?.txHash
                    };
                }
            }
            const secondTxResult = await sendEvmRawTransaction(privateKey, secondResponse.res);
            console.log("Transfer transaction result:", secondTxResult);

            if (secondTxResult.status === true) {
                return {
                    res: {
                        approvalTxHash: firstTxHash?.txHash,
                        transferTxHash: secondTxResult?.res?.txHash,
                        message: "Swap completed successfully! Both approval and transfer done."
                    },
                    status_task: true
                };
            } else {
                return {
                    res: "Transfer transaction failed",
                    status_task: false,
                    approvalTxHash: firstTxHash?.txHash
                };
            }
        }
        else if (transactionType === 'transfer') {
            return {
                res: {
                    transferTxHash: firstTxHash?.txHash,
                    message: "Swap completed successfully! Transfer done directly."
                },
                status_task: true
            };
        }
        else {
            return {
                res: "Unknown transaction type received",
                status_task: false
            };
        }

    } catch (error) {
        console.error("Error in SwapPrepare:", error);
        return {
            res: error.message || "Unknown error occurred",
            status_task: false
        };
    }
}

async function waitForTransactionConfirmation(paymentObj, maxWaitTime = 60000) {
    console.log(`Waiting for confirmation of tx: ${paymentObj}`);
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
        try {
            if (paymentObj.status === 1) {
                console.log(`Transaction confirmed: ${paymentObj?.txHash}`);
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
            console.warn("Error checking transaction status:", error);
        }
    }

    console.warn(`Transaction confirmation timeout: ${paymentObj?.txHash}`);
    return false;
}

async function sendEvmRawTransaction(privateKey, rawTransaction) {
    try {
        const account = new ethers.Wallet(privateKey);
        const tx = rawTransaction.transaction;
        const meta = rawTransaction.txMeta;

        if (!tx.from) {
            throw new Error("rawTransaction.from is undefined");
        }

        const { gas, ...cleanTx } = tx;

        let txToSign = {
            ...cleanTx,
            gasLimit: ethers.BigNumber.from(meta.gasLimit),
            nonce: meta.nonce,
            chainId: Number(meta.network.chainId),
        };


        txToSign.value = ethers.BigNumber.from(txToSign.value || 0);

        if (txToSign.data && !txToSign.data.startsWith("0x")) {
            txToSign.data = "0x" + txToSign.data;
        }

        if (meta.feeData.maxFeePerGas && meta.feeData.maxPriorityFeePerGas) {
            txToSign = {
                ...txToSign,
                type: 2,
                maxFeePerGas: ethers.BigNumber.from(meta.feeData.maxFeePerGas),
                maxPriorityFeePerGas: ethers.BigNumber.from(meta.feeData.maxPriorityFeePerGas),
            };
        } else if (meta.feeData.gasPrice) {
            txToSign = {
                ...txToSign,
                type: 0,
                gasPrice: ethers.BigNumber.from(meta.feeData.gasPrice),
            };
        } else {
            throw new Error("No valid fee data found (missing gasPrice and EIP-1559 fields)");
        }

        const signedTx = await account.signTransaction(txToSign);
        if (!signedTx) {
            throw new Error("signedTx is undefined");
        }

        const respoExe = await proxyRequest("/v1/bsc/transaction/broadcast", PPOST, { signedTx });
        if (respoExe?.res?.txHash) {
            console.log("Transaction Sent", `Tx Hash: ${respoExe?.res?.txHash}`);
            return { res: respoExe?.res, status: true };
        }
        if (respoExe?.err) {
            console.log("Transaction Failed", respoExe);
            return { res: respoExe.err, status: false };
        }
    } catch (error) {
        console.error("Error sending transaction:", error);
        throw error;
    }
}




// async function sendEvmRawTransaction(privateKey, rawTransaction) {
//     try {
//         const account = new ethers.Wallet(privateKey);
//         const tx = rawTransaction.transaction;
//         const meta = rawTransaction.txMeta;

//         if (!tx.from) {
//             throw new Error("rawTransaction.from is undefined");
//         }

//         const { gas, ...cleanTx } = tx;

//         let txToSign = {
//             ...cleanTx,
//             gasLimit: ethers.BigNumber.from(meta.gasLimit),
//             nonce: meta.nonce,
//             chainId: Number(meta.network.chainId),
//         };

//         // Normalize value
//         txToSign.value = ethers.BigNumber.from(txToSign.value || 0);

//         // Ensure data is hex-prefixed
//         if (txToSign.data && !txToSign.data.startsWith("0x")) {
//             txToSign.data = "0x" + txToSign.data;
//         }

//         // Handle EIP-1559 vs Legacy
//         if (meta.feeData.maxFeePerGas && meta.feeData.maxPriorityFeePerGas) {
//             txToSign = {
//                 ...txToSign,
//                 type: 2,
//                 maxFeePerGas: ethers.BigNumber.from(meta.feeData.maxFeePerGas),
//                 maxPriorityFeePerGas: ethers.BigNumber.from(meta.feeData.maxPriorityFeePerGas),
//             };
//         } else if (meta.feeData.gasPrice) {
//             txToSign = {
//                 ...txToSign,
//                 type: 0,
//                 gasPrice: ethers.BigNumber.from(meta.feeData.gasPrice),
//             };
//         } else {
//             throw new Error("No valid fee data found (missing gasPrice and EIP-1559 fields)");
//         }

//         // Sign transaction
//         const signedTx = await account.signTransaction(txToSign);
//         if (!signedTx) {
//             throw new Error("signedTx is undefined");
//         }

//         // Broadcast transaction
//         const respoExe = await proxyRequest("/v1/bsc/transaction/broadcast", PPOST, { signedTx });
//         if (respoExe?.res?.txHash) {
//             console.log("Transaction Sent", `Tx Hash: ${respoExe?.res?.txHash}`);
//             return { res: respoExe?.res, status: true };
//         }
//         if (respoExe?.err) {
//             console.log("Transaction Failed", respoExe);
//             return { res: respoExe.err, status: false };
//         }
//     } catch (error) {
//         console.error("Error sending transaction:", error);
//         throw error;
//     }
// }
