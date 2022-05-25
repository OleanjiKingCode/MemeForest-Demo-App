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

    const CreateMemes = async (name,file,des) => {
        try {
      
        // await Uploading();
        // const delay = ms => new Promise(res => setTimeout(res, ms));
        // await delay(20000);
        // console.log("nameLink")
        // console.log(nameLink)
        // let name = nameLink
        // let des = descriptionLink
        // let file = fileURL
        let time = new Date().toLocaleString();
        const create = await contractWithSigner.CreateMemeItems(name,person,file,time,des)
        await create.wait()
        console.log(nameLink)
        setLoading(false)
        Feed();
       
        
        } catch (error) {
            console.log(error)
        }
    }

    const Uploading = async () => {
        try {
            setLoading(true)
            let uploadOne = await bundlrInstance.uploader.upload(nameOfFile , [{name: "Content-Type", value: "text/plain"}])
            let id = uploadOne.data.id;
            setNameLink('http://arweave.net/'+ id)
            const name = `http://arweave.net/${uploadOne.data.id}`

            let uploadTwo = await bundlrInstance.uploader.upload(DescriptionOfFile, [{name: "Content-Type", value: "text/plain"}])
            setDescriptionLink(`http://arweave.net/${uploadTwo.data.id}`)
            const des = `http://arweave.net/${uploadTwo.data.id}`

            let uploadThree = await bundlrInstance.uploader.upload(Image, [{name: "Content-Type", value: "image/png"}])
            setFileURL(`http://arweave.net/${uploadThree.data.id}`)
            const file = `http://arweave.net/${uploadThree.data.id}`
            
            CreateMemes(name,file,des);
            
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
                    backgroundColor:"greenyellow",fontSize:"14px",float:"right" ,borderRadius:"10px"}}> 
                        Home
                    </button>
                </div>
            )
        }
        if(AMember){
            if(balance > 0.01) {
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
                                <button onClick={Uploading}  style={{border:"none", textAlign:"center", 
                                padding:"10px 20px",color:"white",  fontSize:"18px", 
                                backgroundColor:"greenyellow",marginTop:"20px",marginLeft:"20px", borderRadius:"10px"}}>
                                    Create Meme
                                </button>
                            )
                        }
                        {
                            fileURL && 
                            <> {console.log(nameLink+ " " + descriptionLink + " "+ fileURL)}
                            <a href={nameLink} target='_blank' > {nameLink} </a> <br/>
                            <a href={descriptionLink} target='_blank' > {descriptionLink} </a><br/>
                            <a href={fileURL} target='_blank' > {fileURL}</a>
                            </>
                        }
                    </div>
                    </div>
                    
                )
            }
            {
                return(
                    <div>
                    <div style={{fontSize:"18px"}}>
                        Go To Fund Your Account before Uploading Memes 
                    </div>
                    <button onClick={Fund} style={{padding:"10px 15px", marginLeft:"10px",color:"black",
                    backgroundColor:"greenyellow",fontSize:"14px",float:"right" ,borderRadius:"10px"}}> 
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
          {/* <main className={styles.main}> */}
              {renderButton()}
          {/* </main> */}
    
          
        </div>
      )
}