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

    const fetchAllMemes = async () => {
        try {
            const data= await contractWithProvider.fetchAllMemes();
            const tx = await Promise.all(data.map(async i => {
                let List = {
                    Name: i.NameLink,
                    AddressOfOwner : i.Owner,
                    Id :i.fileId,
                    File: i.fileLink,
                    IsStarred:starred,
                    NumberOfStars:i.Stars,
                    NumberOfLikes:i.Likes,
                    Date:i.DateOfCreation,
                    Description:i.DescriptionLink
                }
                return List
            }));
            setMemes(tx);

        } catch (e) {
            console.log(e)
        }
    }

    return(
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