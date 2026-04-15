'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import { useMyContext } from '../Context/MyContext'
import Gallery from '../Components/Gallery'
import ResultHero from '../results/ResultHero'
import { divide } from 'firebase/firestore/pipelines'
import lottieFloatingImg from '@/public/floatingImg.json'
import Lottie from 'lottie-react'

const page = () => {
    const {user, userFirestoreData, dbData}=useMyContext()
   
    const[myImageAssetsData, setMyImageAssetsData]=useState<any[]>([])
    const[myVideoAssetsData, setMyVideoAssetsData]=useState<any[]>([])
    const[resultReady, setResultReady]=useState(false)
    const[failedAiTaggs, setFailedAiTaggs]=useState(0)
    

    useEffect(() => {
        setResultReady(false)
    // 1. Calculate the 'liked' array once
    const mine = userFirestoreData?.liked?.split(',').filter((id: string) => id.length >= 2) || [];
    
    // Update state for use elsewhere in the component
    

    // 2. Use the local variable 'liked' for immediate filtering 
    // to avoid waiting for a re-render
    const filteredData_img = dbData.filter((data) => {
        return data.uploadedBy===user?.email && data.fileType === 'image';
    });

    const filteredData_video = dbData.filter((data) => {
        return data.uploadedBy===user?.email && data.fileType === 'video';
    });

    // 3. Update the specific asset states
    setMyImageAssetsData(filteredData_img.reverse());
    setMyVideoAssetsData(filteredData_video.reverse());

    const allData=[...filteredData_img,...filteredData_video];
    const failedAi=allData.filter((file)=>file.tags==='Thinking')
    setFailedAiTaggs(failedAi.length)


    setTimeout(() => {
        setResultReady(true)
        
    }, 3000);

}, [userFirestoreData, dbData]);

  return (
    <div className='w-full h-full '>
      

        <div className='w-full p-4 '>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                My Uploads
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Manage and view your uploaded images and videos.
            </p>
           
           {failedAiTaggs>0 &&
           <div className='w-full flex text-xs items-center gap-2 select-none'>
             <div className=' p-2 px-4  bg-amber-400  rounded-2xl'>⚠︎ Ai Tagging failed {failedAiTaggs}</div>
             <p>Please open the asssets with orange border and retry</p>
           </div>
           
           }
           
             

        </div>


        {!resultReady && 
        <div className='h-1/2 w-full flex items-center justify-center p-4 '>

            <div className='flex flex-col items-center justify-center '>
                <Lottie
                className='w-full h-[550px] object-contain'
                animationData={lottieFloatingImg}
                loop={true}
                />
                <h1> Loading...</h1>

               
                
            </div>

        </div>


        }

       




        {resultReady && 
        <div className='w-full h-full'>
            <ResultHero dbImageData={myImageAssetsData} dbVideoData={myVideoAssetsData}/>

        </div>
        
        }



    </div>
  )
}

export default page

