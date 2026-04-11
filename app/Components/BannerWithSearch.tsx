'use client'
import Lottie from 'lottie-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import lottieSearch from '@/public/lottieSearch.json'
import { Target } from 'lucide-react'


const BannerWithSearch = () => {
    const BannerImages = [
        "https://cdn.pixabay.com/photo/2023/04/05/21/09/bird-7902319_1280.jpg",
        'https://cdn.pixabay.com/photo/2022/02/03/18/49/blossoms-6991112_1280.jpg',
        "https://cdn.pixabay.com/photo/2017/11/15/13/27/river-2951997_1280.jpg",
        "https://cdn.pixabay.com/photo/2025/01/14/13/55/nature-9332892_1280.jpg"
    ]

    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [querryText, setQuerryText] = useState('')
   

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) =>
                prev === BannerImages.length - 1 ? 0 : prev + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [BannerImages.length]);


    const navigateToResultPage = () => {
        
        if(querryText.length>2){
            const url=`/results?q=${querryText}`
           window.open(url,'_blank',"noopener,noreferrer")
        }


    }




    return (
        <div className='w-full h-70  p-2 relative  flex items-center justify-center '>

            {BannerImages.map((img, i) => (
                <Image className={`brightness-60 object-cover transform duration-400 ${i === currentImageIndex ? "opacity-100" : "opacity-0"}`} key={i} alt={''} src={img} fill />

            ))}

            <div className='md:w-1/3  z-10 flex flex-col gap-2'>

                <h1 className='text-white text-2xl font-black text-center'>Explore Resources in ResourceHub</h1>
                <div className='w-full p-2 bg-white rounded-xl flex gap-2 '>

                    <div className='w-8 h-8 rounded-full bg-blue-500'>
                        <Lottie
                            animationData={lottieSearch}
                            loop={true}


                        />

                    </div>

                    <input onKeyDown={(e)=>e.key=="Enter"?navigateToResultPage():null} value={querryText} onChange={(e) => setQuerryText(e.target.value)} placeholder='Search for Image and Videos' className='outline-none flex-1 text-xs' type="text" />
                   
                        <div onClick={navigateToResultPage}  className='p-2 hover:bg-blue-700 bg-blue-500 active:scale-90 text-white cursor-pointer rounded-xl text-xs flex items-center select-none'>Search</div>
                   
                </div>

            </div>








        </div>
    )
}

export default BannerWithSearch
