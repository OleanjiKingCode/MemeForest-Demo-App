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
import BigNumber from 'bignumber.js';


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
    const [withdrawal, setWithdrawal] = useState(0)
    const[loading, setLoading] = useState(false)
    const [haveInitialised,setHaveInitialised] = useState(false)
    const provider = useProvider()
    
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
    const Initialize = async () => {
        try {
          setLoading(true)
          await initialize();
          
          setHaveInitialised(true)
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
    
      
      }
    const fetchBalanceOfMember = async () => {
        try {
           if(haveInitialised) {
            fetchBalance();
           }
            
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
          
        //   console.log(fundedamount)
          const funded = await bundlrInstance.fund(fundedamount)
          setLoading(false)
          fetchBalance()
          
        } catch (error) {
          console.log(error)
        }
    }
    const  withdrawFromWallet = async () => {
        try {
            console.log(document.getElementById("withdraw").value)
           
            if (!withdrawal  ) return
            setLoading(true)
          const withdrawalamount = new BigNumber(withdrawal).multipliedBy(bundlrInstance.currencyConfig.base[1])
        //   if(withdrawalamount.isLessThan(1)){
        //     window.alert("NOT ENOUGH")
        //     return
        //   }
          
        //   console.log(fundedamount)

          const withdraw = await bundlrInstance.withdrawBalance(withdrawalamount)
          setLoading(false)
          fetchBalance()
         
        } catch (r) {
            console.log(r)
        }
    }

    const gohome = () => {
        router.push('/')
    }




    const renderButton = () => {
        if(!AMember){
            return (
                <div style={{ padding:"20px", textAlign:"center",margin:"5px 0 5px 0" }}> 
                    <div style={{fontSize:"18px"}}>
                        Go Back Home and Register before you can interact with wallet
                    </div>
                    <button onClick={gohome} style={{padding:"10px 15px", marginLeft:"10px",color:"black",marginTop:"10px",
                    backgroundColor:"greenyellow",fontSize:"14px",borderRadius:"10px"}}> 
                        Home
                    </button>
                </div>
            )
        }
        if (AMember && !haveInitialised) {
          
          return(
           <div >
              
                <button onClick={Initialize}  style={{border:"none", textAlign:"center", 
                  padding:"10px 20px",color:"white",  fontSize:"10px", 
                  backgroundColor:"blue",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
                    Initialize
                </button>
                   
            </div>
          )
        }
        if(haveInitialised) {
          console.log(AMember)
          return (
            <div className='container-fluid'>

           <div style={{textAlign:"center", fontSize:"20px", fontWeight:"600"}}>
               Balance in Wallet : {balance}
           </div>
            <div className='row d-flex align-items-center ' style={{justifyContent:"space-between"}}>
              <div className='col-md-6 p-3' >
              <div className={styles.Memebox} style={{borderRadius:"25px", padding:"20px",width:"100%", textAlign:"center",margin:"20px 0 20px 0" }}> 
                <h3>
                    Fund Your Wallet
                </h3>
               
                <div style={{padding:"10px 5px", margin:"15px",  display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}>
                    <div style={{width:"100%",  display:"flex", alignItems:"center", justifyContent:"space-evenly",textAlign:"left"}}>
                    
                    Amount: 
                    
                <input
                    placeholder='Fund your wallet'
                    type="number"
                    onChange={e => setFund(e.target.value)}
                    style={{padding:"10px", border:"1px solid black", marginLeft:"10px",borderRadius:"10px",width:"300px", fontSize:"10px"}}
                />
                </div>
                {
                    loading ? 
                    (
                        <button   style={{border:"none", textAlign:"center", 
                        padding:"10px 20px",color:"white",  fontSize:"10px", 
                        backgroundColor:"green",marginTop:"40px", borderRadius:"10px"}}>
                        . . .
                    </button>
                    )
                    :
                    (
                        <button onClick={fundWallet}  style={{border:"none", textAlign:"center", 
                        padding:"10px 20px",color:"white",  fontSize:"10px", 
                        backgroundColor:"green",marginTop:"40px", borderRadius:"10px"}}>
                        Fund 
                    </button>
                    )
                }
               
              </div>
              
              </div>
              </div>

              <div className='col-md-6 p-3' >
              <div className={styles.Memebox} style={{borderRadius:"25px", padding:"20px",width:"100%", textAlign:"center",margin:"20px 0 20px 0" }}> 
                <h3>
                    Withdraw From Wallet
                </h3>
               
                <div style={{padding:"10px 5px", margin:"15px",  display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}>
                    <div style={{width:"100%",  display:"flex", alignItems:"center", justifyContent:"space-evenly",textAlign:"left"}}>
                    
                    Amount: 
                    
                <input
                    placeholder='withdraw funds'
                    type="number"
                    onChange={e => setWithdrawal(e.target.value)}
                    style={{padding:"10px", border:"1px solid black", marginLeft:"10px",borderRadius:"10px",width:"300px", fontSize:"10px"}}
                />
                </div>
                {
                    loading ?
                    (
                        <button style={{border:"none", textAlign:"center", 
                    padding:"10px 20px",color:"white",  fontSize:"10px", 
                    backgroundColor:"red",marginTop:"40px", borderRadius:"10px"}}>
                    . . .
                </button>
                    ) 
                    :
                    (
                        <button onClick={withdrawFromWallet} id='withdraw'  style={{border:"none", textAlign:"center", 
                    padding:"10px 20px",color:"white",  fontSize:"10px", 
                    backgroundColor:"red",marginTop:"40px", borderRadius:"10px"}}>
                    Withdraw
                </button>
                    )
                }
                
              </div>
              
              </div>
              </div>
              
            </div>
            </div>
          )
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