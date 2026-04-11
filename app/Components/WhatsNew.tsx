'use client'
import React, { useEffect, useState } from 'react'
import { useMyContext } from '../Context/MyContext'
import ResultHero from '../results/ResultHero'

const WhatsNew = () => {
    const {dbData}=useMyContext()
    const [imgData, setImageData]=useState<any[]>([])
    const [videoData, setVideoData]=useState<any[]>([])

    useEffect(()=>{

        const images= dbData.filter((data)=>data.fileType==='image')
        const videos= dbData.filter((data)=>data.fileType==='video')
        setImageData(images.reverse().slice(0,12))
        setVideoData(videos.reverse().slice(0,12))

    },[dbData])


  return (
    <div className='w-full h-full p-8'>
        <h1 className='font-semibold'>Whats New</h1>

        <h1 className='text-gra-600 '>Latest Images and videos</h1>

        <ResultHero dbImageData={imgData} dbVideoData={videoData}/>


        

        
      
    </div>
  )
}

export default WhatsNew
