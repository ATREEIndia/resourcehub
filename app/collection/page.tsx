'use client'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useMyContext } from '../Context/MyContext';
import ResultHero from '../results/ResultHero';
import lottieSearch from '@/public/searching.json'
import Lottie from 'lottie-react';
import { Suspense } from 'react'

const page = () => {
    const searchParams = useSearchParams();
    const fcId = searchParams.get('c') || ""
    const { dbData, fcData } = useMyContext()
    const [imgData, setImgData] = useState<any[]>([])
    const [videoData, setVideoData] = useState<any[]>([])
    const [filtering, setFiltering] = useState(false)

    useEffect(() => {

        if (!fcData) return
        setFiltering(true)

        const currentFcData = fcData.filter((data) => data.id.toLowerCase() === fcId.toLowerCase())
        const assetsArray = currentFcData[0]?.assets.split(',')

        if (!assetsArray){ 
           
            return}

        setImgData([])
        

        dbData.map((data, i) => {
            if (assetsArray.some((id: string) => id === data.id)) {
                if (data.fileType === 'image') {
                    setImgData((prev) => [...prev, data])
                }
                if (data.fileType === 'video') {
                    setVideoData((prev) => [...prev, data])
                }


            }
        })

        setTimeout(() => {
            setFiltering(false)
        }, 3000);



    }, [dbData, fcData])



    return (
        <Suspense>
             <div className='w-full h-full p-4 min-h-screen'>
            <div className='flex flex-col gap-1'>
                <h1 className='text-2xl'>Collection <span className='text-blue-500 font-medium'>{fcId}</span></h1>
                <p className='text-xs'>Manage and view the featured Collection.</p>
            </div>

            {filtering &&
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    
                    <Lottie
                        animationData={lottieSearch}
                        loop={true}
                        className="w-64 h-64 md:w-80 md:h-80 transition-opacity duration-500"
                        aria-label="Searching animation"
                    />
                    <p>Checking for resources...</p>
                </div>
            }


            {!filtering &&
                <div>
                    <ResultHero dbImageData={imgData} dbVideoData={videoData} />
                </div>

            }


        </div>

        </Suspense>
       
    )
}

export default page
