import { ethers, BigNumber, Contract } from 'ethers';
import { useCallback } from 'react';


export async function adminWallet  (){
  const privateKey = 'd478bf4ac2bb350640ed297e9bcdf89c6736e63f5de5f9431b1260412262c00f'; // Replace with your private key
  const provider =  new ethers.providers.Web3Provider(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum
  )
  console.log(provider)
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(wallet)
  const amount = ethers.utils.parseUnits('10', 18);  // Replace with the amount of tokens (18 decimals)

const contractAddress = '0x000000000022D473030F116dDEE9F6B43aC78BA3'; // Replace with your contract address
const fromAddress = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'; // Sender address
const toAddress = '0xF3Be8230ac575e147621dCa068138922197D9f51'; // Receiver address
const tokenAddress = '0xe6863210e49B080C044Cc5df861e5A83435844D0'; // Token contract address

const currentNonce = await provider.getTransactionCount(wallet.address, 'latest');

// ERC20 Token ABI (for transferFrom)
const erc20Abi = [
    'function transferFrom(address from, address to, uint160 amount, address token)',
];

// Create the contract instance for the token
const tokenContract = new ethers.Contract(contractAddress, erc20Abi, provider);

// Step 1: Create the unsigned transaction for the transferFrom method
async function signAndSendTransferFrom() {
  // Define the transaction data
  const txData = await tokenContract.populateTransaction.transferFrom(fromAddress, toAddress, amount, tokenAddress);

  // Create the transaction object
  const unsignedTx = {
    to: tokenAddress,
    data: txData.data,  // The data to call `transferFrom`
    gasLimit: ethers.utils.hexlify(100000),  // Estimate or provide gas limit
    gasPrice: ethers.utils.parseUnits('10', 'gwei'),  // Custom gas price (10 gwei)
    chainId: 97,  // Mainnet chain ID (change if on a testnet),
    nonce: currentNonce, // Ensure to use the latest nonce
  };

  // Step 2: Sign the transaction
  const signedTx = await wallet.signTransaction(unsignedTx);

  console.log('Signed Transaction:', signedTx);

  // Step 3: Send the signed transaction to the network
  const txResponse = await provider.sendTransaction(signedTx);
  console.log('Transaction Hash:', txResponse.hash);

  // Wait for the transaction to be confirmed
  const receipt = await txResponse.wait();
  console.log('Transaction Confirmed:', receipt);
}

signAndSendTransferFrom().catch(console.error);

}
