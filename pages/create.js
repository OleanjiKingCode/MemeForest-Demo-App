import Head from 'next/head'
import Image from 'next/image'
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


export default function Create () {

    const {
        initialize,
        fetchBalance,
        balance,
        bundlrInstance
    } = useContext(MainContext)
    const { data} = useAccount()
    const person = data?.address;
    const [AMember,setAMember] = useState(false)
    const [nameLink,setNameLink] = useState("")
    const [descriptionLink,setDescriptionLink] = useState("")
    const [fileURL, setFileURL] = useState("")
    const [nameOfFile, setNameOfFile] = useState("")
    const [DescriptionOfFile, setDescriptionOfFile] = useState("")
    const [Image, setImage] = useState()
    const [viewing,setViewing] = useState()
    const[loading, setLoading] = useState(false)
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
    const router = useRouter()
    useEffect(() => {


        if(!AMember){
            checkIfAMember();
            console.log(AMember)
            fetchBalanceOfMember();
        
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
            initialize();
            const delay = ms => new Promise(res => setTimeout(res, ms));
            await delay(5000);
            fetchBalance();
        } catch (error) {
            console.log(error)
        }
    }

    const CreateMemes = async () => {
        try {
        await Uploading();
       
        let time = new Date().toLocaleString();
        const create = await contractWithSigner.CreateMemeItems(nameLink,person,fileURL,time,descriptionLink)
        await create.wait()
        setLoading(false)
        Feed();
        } catch (error) {
            console.log(error)
        }
    }

    const Uploading = async () => {
        try {
            let uploadOne = await bundlrInstance.uploader.upload(nameOfFile , [{name: "Content-Type", value: "text/plain"}])
            setLoading(true)
            setNameLink(`http://arweave.net/${uploadOne.data.id}`)
            let uploadTwo = await bundlrInstance.uploader.upload(DescriptionOfFile, [{name: "Content-Type", value: "text/plain"}])
           
            setDescriptionLink(`http://arweave.net/${uploadTwo.data.id}`)
            let uploadThree = await bundlrInstance.uploader.upload(Image, [{name: "Content-Type", value: "image/png"}])
           
            setFileURL(`http://arweave.net/${uploadThree.data.id}`)
            
        } catch (e) {
            console.log(e)
        }
    }
    const gohome = () => {
        router.push('/')
    }
    const Fund = () => {
        router.push('/funds')
    }
    const Feed = () => {
        router.push('/Feed')
    }

    function OnFileChange(e) {
        const file = e.target.files[0]
        if(file){
            const image = URL.createObjectURL(file)
            setViewing(image)
            let reader = new FileReader()
            reader.onload = function () {
                if(reader.result){
                    setImage(Buffer.from(reader.result))
                }
            }
            reader.readAsArrayBuffer(file)
        }
    }
    const renderButton = () =>{
        if(!AMember){
            return (
                <div>
                    <div style={{fontSize:"18px"}}>
                        Go Back Home and Register before Uploading Memes 
                    </div>
                    <button onClick={gohome} style={{padding:"10px 15px", marginLeft:"10px",color:"black",
                    backgroundColor:"greenyellow",fontSize:"14px", borderRadius:"10px"}}> 
                        Home
                    </button>
                </div>
            )
        }
        if(AMember){
            if(balance > 0.05) {
                return( 
                    <div>
                        <h2>
                            UPLOAD YOUR MEME 
                        </h2>
                        <div className={styles.createBox}>
                        <div>
                            Name: 
                            <input type='text' 
                             placeholder='Name Of Meme'
                             onChange={e => setNameOfFile(e.target.value)}
                             style={{padding:"10px", border:"1px solid black" , marginLeft:"20px",borderRadius:"10px",width:"400px", fontSize:"10px"}}
                           />
                        </div>
                        <div>
                            File: 
                            <input type='file' 
                             onChange={OnFileChange}
                             style={{padding:"10px", border:"1px solid black" , marginLeft:"20px",borderRadius:"10px",width:"400px", fontSize:"10px"}}
                           />
                        </div>
                        <div>
                            Description: 
                            <input type='Describe your meme' 
                             placeholder='Name Of Meme'
                             onChange={e => setDescriptionOfFile(e.target.value)}
                             style={{padding:"10px", border:"1px solid black" , marginLeft:"20px",borderRadius:"10px",width:"400px", fontSize:"10px"}}
                           />
                        </div>
                        {
                            viewing && 
                            <div>
                            <img src={viewing} alt='Your Image' style={{width:"400px", margin:"15px"}}/>
                        </div> 
                        }
                        
                        {
                            loading ? 
                            (
                                <button   style={{border:"none", textAlign:"center", 
                                padding:"10px 20px",color:"white",  fontSize:"18px", 
                                backgroundColor:"greenyellow",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
                                    ...Loading...
                                </button>
                            ) : 
                            (
                                <button onClick={CreateMemes}  style={{border:"none", textAlign:"center", 
                                padding:"10px 20px",color:"white",  fontSize:"18px", 
                                backgroundColor:"greenyellow",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
                                    Create Meme
                                </button>
                            )
                        }
                        {
                            fileURL && 
                            <>
                            <a href={nameLink} target='_blank' > 1 </a>
                            <a href={descriptionLink} target='_blank' > 2 </a>
                            <a href={fileURL} target='_blank' > 3</a>
                            </>
                        }
                        
                    </div>
                    </div>
                    
                )
            }
            {
                return(
                    <div>
                    <h3>
                        Go To Fund Your Account before Uploading Memes 
                    </h3>
                    <button onClick={Fund} style={{padding:"10px 15px", marginLeft:"10px",color:"black",
                    backgroundColor:"greenyellow",fontSize:"18px", borderRadius:"10px"}}> 
                        Fund
                    </button>
                </div>
                )
            }

        }
    }


    return (
        <div className={styles.container}>
          <Head>
            <title>Home</title>
            <meta name="description" content="By Oleanji" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
        <div className={styles.topper} >
          <div className={styles.Logo} >
    
          </div>
          <div className={styles.connect}>
            <ConnectButton />
          </div>
        </div>
          <main className={styles.main}>
              {renderButton()}
          </main>
    
          
        </div>
      )
}