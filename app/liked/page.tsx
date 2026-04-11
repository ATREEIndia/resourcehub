'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import { useMyContext } from '../Context/MyContext'
import Gallery from '../Components/Gallery'
import ResultHero from '../results/ResultHero'
import { divide } from 'firebase/firestore/pipelines'
import lottieHeartLoading from '@/public/Loading_Heart.json'
import Lottie from 'lottie-react'

const page = () => {
    const {user, userFirestoreData, dbData}=useMyContext()
    const[likedIds, setLikedIds]=useState<string[]>([])
    const[likedImageAssetsData, setLikedImageAssetsData]=useState<any[]>([])
    const[likedVideoAssetsData, setLikedVideoAssetsData]=useState<any[]>([])
    const[resultReady, setResultReady]=useState(false)
    

    useEffect(() => {
        setResultReady(false)
    // 1. Calculate the 'liked' array once
    const liked = userFirestoreData?.liked?.split(',').filter((id: string) => id.length >= 2) || [];
    
    // Update state for use elsewhere in the component
    setLikedIds(liked);

    // 2. Use the local variable 'liked' for immediate filtering 
    // to avoid waiting for a re-render
    const filteredData_img = dbData.filter((data) => {
        return liked.includes(data.id) && data.fileType === 'image';
    });

    const filteredData_video = dbData.filter((data) => {
        return liked.includes(data.id) && data.fileType === 'video';
    });

    // 3. Update the specific asset states
    setLikedImageAssetsData(filteredData_img);
    setLikedVideoAssetsData(filteredData_video);

    setTimeout(() => {
        setResultReady(true)
        
    }, 3000);

}, [userFirestoreData, dbData]);

  return (
    <div className='w-full h-full '>
      

        <div className='w-full p-4 '>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Your Collection
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Manage and view your liked images and videos.
            </p>
             

        </div>


        {!resultReady && 
        <div className='h-1/2 w-full flex items-center justify-center p-4 '>

            <div className='flex flex-col items-center justify-center '>
                <Lottie
                className='w-full h-[550px] object-contain'
                animationData={lottieHeartLoading}
                loop={true}
                />
                <h1> Loading...</h1>

               
                
            </div>

        </div>


        }

       




        {resultReady && 
        <div className='w-full h-full'>
            <ResultHero dbImageData={likedImageAssetsData} dbVideoData={likedVideoAssetsData}/>

        </div>
        
        }



    </div>
  )
}

export default page

