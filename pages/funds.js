import Head from 'next/head'
import Web3Modal from "web3modal";
import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useProvider,useSigner,useAccount,useBalance,useConnect  } from 'wagmi'
import {MemeForestAddress} from '../constant'
import { useEffect, useRef, useState, useContext } from "react";
import { MainContext } from '../context';
import { ethers,providers, Contract } from "ethers";
import MEME from '../artifacts/contracts/MemeForest.sol/MemeForest.json'
import { useRouter } from 'next/router';



export default function funds() {

    const {
        initialize,
        fetchBalance,
        balance,
        bundlrInstance
    } = useContext(MainContext)
    const { data} = useAccount()
    const person = data?.address;
    const [AMember,setAMember] = useState(false)
    const [fund, setFund] = useState(0)
    const[loading, setLoading] = useState(false)
    const provider = useProvider()
    const N = []
    const { data: signer, isError, isLoading } = useSigner()
    const contractWithSigner = useContract({
        addressOrName: MemeForestAddress,
        contractInterface: MEME.abi,
        signerOrProvider: signer,
    })

    const contractWithProvider = useContract({
        addressOrName: MemeForestAddress,
        contractInterface: MEME.abi,
        signerOrProvider: provider,
    })

    const counter = 1;
    const router = useRouter()
    useEffect(() => { 
        if(counter == 1){
            initialize()
            console.log("first time")
            counter +=1
        }
       
    } ,[])
    useEffect(() => {


        if(!AMember){
            checkIfAMember();
            console.log(AMember)
            if (counter == 2) {
                fetchBalanceOfMember();
            }
           
        
        }
    }, [AMember]);
   

    const checkIfAMember = async () => {
        try {
            console.log(person)
            const tx= await contractWithProvider.IsAMember(person)
            
            console.log(tx)
            if(tx) {
            
            setAMember(true)
            }
            else{
            setAMember(false)
            }
            console.log(AMember)
        } catch (e) {
            console.log(e)
            setAMember(false)
        }
    }

    const fetchBalanceOfMember = async () => {
        try {
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(5000);
            fetchBalance();
        } catch (error) {
            console.log(error)
        }
    }
    const  fundWallet = async () =>{
        try {
        setLoading(true)
          if (!fund  ) return
          const fundedamount = new BigNumber(fund).multipliedBy(bundlrInstance.currencyConfig.base[1])
          if(fundedamount.isLessThan(1)){
            window.alert("NOT ENOUGH")
            return
          }
          
          console.log(fundedamount)
          const funded = await bundlrInstance.fund(fundedamount)
          setLoading(false)
          fetchBalance()
          
        } catch (error) {
          console.log(error)
        }
    }

    return (
        <div>
          <Head>
            <title>Home</title>
            <meta name="description" content="By Oleanji" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
        <div className={styles.topper}>
          <div className={styles.Logo} >
    
          </div>
          <div className={styles.connect}>
            <ConnectButton />
          </div>
        </div>
          <div className={styles.mains}>
              {renderButton()}
          </div>
    
          
        </div>
      )




}