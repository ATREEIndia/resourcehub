'use client'
import React, { useEffect, useState } from 'react'
import { useMyContext } from '../Context/MyContext'
import Gallery from '../Components/Gallery'

type params = {
    
    dbImageData:any[];
    dbVideoData:any[]
}

const ResultHero = ({ dbImageData,dbVideoData }: params) => {
    const [currentMediaType, setCurrentMediaType] = useState('Images')
    const mediaTypes = ["Images", "Videos"]
    
    useEffect(()=>{
        if(dbImageData.length<1 && dbVideoData.length>0){
            setCurrentMediaType('Videos')
        }

    },[dbImageData,dbVideoData])
   

    



    return (
        <div className='w-full h-full p-4'>
                      
           
            <div className='w-fill flex gap-5 text-xs p-4'>
                {mediaTypes.map((type, i) => (
                    <div onClick={() => setCurrentMediaType(type)} key={i} className={`p-2 cursor-pointer select-none active:scale-95 rounded-xl hover:bg-gray-300 ${currentMediaType === type ? "bg-blue-200 " : "bg-gray-200 "}   `}>
                        {type} ({type===mediaTypes[0]?dbImageData.length:dbVideoData.length})
                        </div>

                ))}

            </div>


            <div className='w-full p-4'>

                {currentMediaType === mediaTypes[0] &&
                    <Gallery galleryType={currentMediaType} mediaData={dbImageData} />

                }
                 {currentMediaType === mediaTypes[1] &&
                    <Gallery galleryType={currentMediaType} mediaData={dbVideoData} />

                }


            </div>






        </div>
    )
}

export default ResultHero
