import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal";
import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useProvider,useSigner,useAccount,useBalance,useConnect  } from 'wagmi'
import {MemeForestAddress} from '../constant'
import { useEffect, useRef, useState, useContext } from "react";
import { MainContext } from '../context';
import BigNumber from 'bignumber.js';
import { ethers,providers, Contract } from "ethers";
import MEME from '../artifacts/contracts/MemeForest.sol/MemeForest.json'

export default function Home() {
  const {
    initialize,
    fetchBalance,
    balance,
    bundlrInstance
  } = useContext(MainContext)
  const { data} = useAccount()
  const person = data?.address;
  const {isConnected, isDisconnected, isIdle} = useConnect()
  const [name, setName] = useState("")
  const [fund, setFund] = useState(0)
  const [loading,setLoading] = useState(false)
  const [haveInitialised,setHaveInitialised] = useState(false)
  const [AMember,setAMember] = useState(false)
  const[uploads, setUploads] = useState(0)
  const[memberDetails,setMemberDetails] = useState([])
  const web3ModalRef = useRef();
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
     
  useEffect(() => {
    

        if(!AMember){
           checkIfAMember();
        
         setInterval( async () => {
             await fetchByAddress()
         }, 5*1000);
        }
    }, [AMember]);


  const joinMembership = async () => {
    try {
      setLoading(true)
      let _time =  new Date().toLocaleString();
      
      
      const join = await contractWithSigner.CreateMembers(name, _time)
      
      await join.wait()
      setLoading(false)
      setAMember(true)
      await checkIfAMember();
    } catch (w) {
      console.log(w)
    }
  }

  const Initialize = async () => {
    try {
      initialize();
      
      setHaveInitialised(true)
    } catch (error) {
      console.log(error)
    }

  
  }

  const  fundWallet = async () =>{
    try {

      if (!fund  ) return
      const fundedamount = new BigNumber(fund).multipliedBy(bundlrInstance.currencyConfig.base[1])
      if(fundedamount.isLessThan(1)){
        window.alert("NOT ENOUGH")
        return
      }
      
      console.log(fundedamount)
      const funded = await bundlrInstance.fund(fundedamount)
     
      fetchBalance()
      
    } catch (error) {
      console.log(error)
    }
   }

   const fetchByAddress = async () => {
    try {
      const data= await contractWithProvider.fetchMembers();
    
      const tx = await Promise.all(data.map(async i =>{
         let list = {
          Name : i.Name,
          Address : i.MemeberAddress,
          Date: i.Datejoined,
          Memes : i.MyMemes.toNumber(),
          Starred :i.MyStarredMemes.toNumber()
         
        }
        return list
       }));
       setMemberDetails(tx)
     } catch (w) {
       console.log(w)
     }
   }

  const checkIfAMember = async () => {
    try {
     
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


const renderButton = () => {

  if (AMember && !haveInitialised) {
    
    return(
     <div>
       <h3 className={styles.title}>
          Welcome to Meme Forest
        </h3>
        <br/>
      <button onClick={Initialize}  style={{border:"none", textAlign:"center", 
            padding:"10px 20px",color:"white",  fontSize:"10px", 
            backgroundColor:"blue",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
              Initialize
          </button>
             
               </div>
    )
  }
  if(balance <= 0) {
    console.log(AMember)
    return (
      <div>
          You are a Now a member. <br/>
          But No funding to work with.<br/>
        <input
          placeholder='Fund your wallet'
          type="number"
          onChange={e => setFund(e.target.value)}
          style={{padding:"10px", border:"1px solid black" , marginLeft:"20px",borderRadius:"10px",width:"400px", fontSize:"10px"}}
        />
        <button onClick={fundWallet}  style={{border:"none", textAlign:"center", 
          padding:"10px 20px",color:"white",  fontSize:"10px", 
          backgroundColor:"blue",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
            Fund Wallet
        </button>
      </div>
    )
  
  }
  if(haveInitialised && balance > 0) {
    return(
      <div style={{fontSize:"19px", fontWeight:"700"}}>
        You are a member with Funding balance of {balance}
        <br/> <br/>
        {
          memberDetails.map((lists,i) => {
            
            return(
                
                <div key={i}  style={{fontSize:"20px", fontWeight:"700"}}>
                  {
                    lists.Address == person &&
                    <div>
                    <div style={{ padding:"30px 10px", display:"flex", alignItems:"center"}} > 
                    Name: 
                    <div style={{fontSize:"14px", fontWeight:"500", padding:"30px 0px"}}>
                    {lists.Name}
                    </div>
                   
                   </div>
                   <div style={{ padding:"30px 10px"}}> 
                    Address: {lists.Address}
                   </div>
                   <div style={{ padding:"30px 10px"}}> 
                     Number of Uploads: {lists.Memes}
                   </div>
                   <div style={{ padding:"30px 10px"}}>
                     Number Of Starred Memes: {lists.Starred}
                    </div>
                   <div style={{ padding:"30px 10px"}}> 
                    Date Joined: {lists.Date}
                   </div>
                    </div>
                  }
                  
                </div>
            ) 
          })
                   
        }
      </div>
    )
  }

  if(!AMember){
    return (
      <div>
        <input
          placeholder='Enter Any Name'
          type="text"
          onChange={e => setName(e.target.value)}
          style={{padding:"10px", border:"1px solid black" , borderRadius:"10px",width:"400px", fontSize:"10px"}}
        />
        
        {
          loading? 
            (
              <button   style={{border:"none", textAlign:"center", 
                  padding:"10px 20px",color:"white",  fontSize:"10px", 
                  backgroundColor:"blue",marginTop:"20px", marginLeft:"20px", borderRadius:"10px"}}>
                    ...Loading...
              </button>
            ) 
            :
            (
              <button onClick={joinMembership}  style={{border:"none", textAlign:"center", 
                padding:"10px 20px",color:"white",  fontSize:"10px", 
                backgroundColor:"blue",marginTop:"20px", marginLeft:"20px", borderRadius:"10px"}}>
                  Become A Member
              </button>    
            )
        }       
    </div>
    )
  }
}








  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <meta name="description" content="By Oleanji" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    <div className={styles.topper}>
      <div className={styles.Logo}>
      </div>
      <div className={styles.connect}>
        <ConnectButton />
      </div>
    </div>
      <div  className={styles.main}> 
        
          {renderButton()}
        

      </div>

      
    </div>
  )
}
