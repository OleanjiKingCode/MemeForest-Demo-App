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
import 'bootstrap/dist/css/bootstrap.css'
import axios from "axios"




export default function Feed () {
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
    const [memes,setMemes] = useState([])
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
    useEffect(() => {
            fetchAllMemes();
    }, []);
    const fetchAllMemes = async () => {
        try {
            const data= await contractWithProvider.fetchAllMemes();
            const tx = await Promise.all(data.map(async i => {
                const Info = await axios.get(i.Memeinfo)
              
                let List = {
                    
                    Name:Info.data.nameOfFile,
                    AddressOfOwner : i.Owner,
                    Id :i.fileId.toNumber(),
                    File: Info.data.image,
                    IsStarred:i.starred,
                    NumberOfStars:i.Stars.toNumber(),
                    NumberOfLikes:i.Likes.toNumber(),
                    Date:i.DateOfCreation,
                    Description:Info.data.DescriptionOfFile,
                }
                return List
            }));
            setMemes(tx);
            console.log(tx)
        } catch (e) {
            console.log(e)
        }
    }

    //  const ToText = async(url) =>{
    //     fetch(url)
    //     .then(function(response){
    //         response.text().then(function(text){
    //             console.log(text)
              
    //             return text;
                
    //         })
            
    //     })
       
    // }
    // const renderElement =  (url) => {
    //     if (url!= "" ){
    //         fetch(url)
    //     .then(response => response.text())
    //     .then(data => {
        
    //     return data
    //     });
    //     }
        
    // }
    // const DescriptionText =  (url) => {
    //     if (url!= ""){
    //         fetch(url)
    //     .then(response => response.text())
    //     .then(data => {
    //        return data
    //         // setDescriptionOfFile(data) 
    //     });
    //     }
        
    // }
    const renderButton = () => {
        if(memes.length == 0) {
            return (
                <h4>
                    There are no Memes For Display
                </h4>
            )
        }
        if (memes.length >0){
            return(
                <div>
                    {
                        memes.map((card,i) => {
                            return(  
                                <div key={i} className='d-flex'>   
                                    {
                                        (!card.Name == " " && !card.Description == " ") &&
                                        <div className='col-md-3'> 
                                            <div className='card' style={{width:"18rem"}}>
                                            <img src={card.File} className="card-img-top" alt="..."/>
                                                <div>
                                                    <div>
                                                        {card.Name} 
                                                    </div>
                                                    <div>
                                                        {card.Description} 
                                                    </div>
                                                   
                                                </div>
                                                <div >Date : {card.Date}</div>
                                                <div >Stars:{card.NumberOfStars}</div>
                                                <div >Likes: {card.NumberOfLikes}</div> 
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