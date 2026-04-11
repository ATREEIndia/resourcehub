'use client'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar';
import ResultHero from './ResultHero';
import { useMyContext } from '../Context/MyContext';
import lottieSearching from '@/public/searching.json'
import Lottie from 'lottie-react';
import { Suspense } from 'react'

const page = () => {
    const { dbData } = useMyContext()

    const searchParams = useSearchParams();
    const querry = searchParams.get('q') || ""
    const[searchQuerry, setSearchQuerry]=useState(querry)
    const [dbImageData, setDbImageData] = useState<any[]>([])
    const [dbVideoData, setDbVideoData] = useState<any[]>([])
    const[newQuerry, setNewQuerry]=useState(querry)
    const[filtering, setFiltering]=useState(true)

    useEffect(() => {

        setDbImageData([]);
        setDbVideoData([]);
        setFiltering(true)


        let querryArray = searchQuerry.trim().toLowerCase().split(" ")
        querryArray = querryArray.filter((data) => data.length > 2)

        dbData.map((data, i) => {
            if (!data.tags) return
            const aiTagArray = data.tags.replace(",", " ").toLowerCase().split(" ")
            console.log(aiTagArray)
            console.log(data.id + "" + querryArray)


            const hasmatch_ai = querryArray.some((searchWord: string) =>
                aiTagArray.some((tag: string) =>
                    tag.toLowerCase().includes(searchWord.toLowerCase().trim())
                )
            );
            let hasmatch_manual = false
            if (data.m_tags) {
                const manualTagArray = data.m_tags.replace(",", "").toLowerCase().split(" ")
                hasmatch_manual = querryArray.some((searchWord: string) =>
                manualTagArray.some((tag: string) =>
                    tag.toLowerCase().includes(searchWord.toLowerCase().trim())
                )
            );

            }



            if (!hasmatch_ai && !hasmatch_manual) return

            console.log(data.id)

            if (data.fileType === 'image') {
                setDbImageData((prev) => [...prev, data])
            }

            if (data.fileType === 'video') {
                setDbVideoData((prev) => [...prev, data])
            }


        })

      setTimeout(() => setFiltering(false), 3000);


    }, [dbData, searchQuerry]);

    const handleNewSearch=()=>{
        setSearchQuerry(newQuerry)
        

    }


    return (
        <Suspense>
             <div className='w-full h-full'>
            

            <div className='w-full  p-4 mt-5  text-xs'>
                <h1 className='px-2'>Try another search term</h1>
                <div className='w-1/4 border flex items-center border-gray-200 rounded-xl  bg-gray-100'> 
                  <input onKeyDown={(e)=>e.key ==="Enter"?handleNewSearch():null} onChange={(e)=>setNewQuerry(e.target.value)} value={newQuerry}  className='flex-1 outline-none p-2 ' type="text" />
                  <div onClick={handleNewSearch} className='p-2 bg-blue-600 rounded-r-xl text-xs text-white select-none cursor-pointer active:scale-95 hover:bg-blue-800'>Search</div>


                </div>
             

            </div>


            <div className='flex p-4 flex-col mt-4'>
                <div className=' text-xl '>Showing Results for <span className='font-black text-blue-500'>{searchQuerry} </span></div>
                <p className='text-sm text-gray-500'>The results are based on the tags attached to the resources</p>
            </div>

            {!filtering &&            
            <ResultHero dbVideoData={dbVideoData} dbImageData={dbImageData} />
             }


             {filtering && 
             <div className='w-full h-full flex items-center justify-center' > 

             <Lottie
             className='w-1/4'
             animationData={lottieSearching}
             loop={true} />            

             </div>
             
             }

            
            



        </div>
        </Suspense>
       
    )
}

export default page
