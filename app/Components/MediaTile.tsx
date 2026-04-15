'use client'
import { BookmarkPlus, Heart, Target } from 'lucide-react';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useMyContext } from '../Context/MyContext';
import { doc, setDoc } from 'firebase/firestore';
import { m_firestore } from './MyFirebase';
import { like } from 'firebase/firestore/pipelines';

type probs = {
    data: any;
    handleCollectionSelection:(id:string)=>void
    addALL:boolean
    _isBookmarked?:boolean

}

const MediaTile = ({ data,handleCollectionSelection,addALL, _isBookmarked=false }: probs) => {
    // console.log(data)
    const mediaType = data.fileType || ""

    const { userFirestoreData, user } = useMyContext()

    const isliked = userFirestoreData?.liked?.includes(data.id) || false
    const[isBookmarked, setIsBookmarked]=useState(_isBookmarked)

    useEffect(()=>{
        setIsBookmarked(false)

    },[_isBookmarked])



    const handleLikeMedia = (id: string) => {
        try {
            if (!user?.email) return
            const userFirestoreref = doc(m_firestore, 'users', user?.email)
            let liked = userFirestoreData?.liked

            if (liked.includes(id)) {
                liked = liked.replace(`,${id}`, "").replace(id, ",").replace(",,", ",");

            } else {
                liked = `${liked},${id}`
            }

            setDoc(userFirestoreref, {
                liked: `${liked}`

            }, { merge: true })

        } catch (e) {

        }
    }

    const handleBookmarkMedia=()=>{
        setIsBookmarked(!isBookmarked)
       
        handleCollectionSelection(data.id)

    }
    

    useEffect(()=>{
         setIsBookmarked(addALL)

    },[addALL])

    const opneDetailsPage=()=>{
        const url=`/details/${data.id}`
        window.open(url, "_blank")
    }



    return (
        <div  className='w-full h-full'>

            {/* if media is an image */}
            {mediaType === 'image' &&
                <div  className={`${data.tags==='Thinking'?"border-2 border-amber-400":""} w-full h-100 relative rounded-xl border p-4 py-10`}>
                    <div className='w-full h-full'>


                        <div onClick={opneDetailsPage} className='w-full h-full relative z-12 flex items-center justify-center p-4   '>
                            <Image
                                className='object-contain select-none cursor-pointer'
                                unoptimized
                                src={data.url ? data.url : "/image_notfound.png"}
                                fill
                                alt={''}
                                priority={true}
                            />

                        </div>

                        <div className='absolute inset-0  w-full h-full hover:opacity-90 rounded-xl opacity-50 flex flex-col justify-between'>
                            {/* top */}
                            <div className='w-full p-2 flex gap-2  justify-end '>
                                <BookmarkPlus onClick={handleBookmarkMedia} className={`hover:scale-115 cursor-pointer active:scale-95 ${isBookmarked?'fill-blue-500 stroke-blue-500':''}`} />
                                <Heart onClick={() => handleLikeMedia(data.id)} className={`hover:scale-115 cursor-pointer active:scale-95 ${isliked ? 'fill-red-700 stroke-red-700' : ""} `} />


                            </div>
                            <div className='w-full p-2 flex  bg-white  text-xs justify-between rounded-xl'>
                                <p className='select-none truncate'>📤: {data.uploadedBy || "unkown"}</p>
                                <p>PC: {data.credits || "unkown"}</p>

                            </div>

                        </div>
                    </div>
                </div>
            }



            {mediaType === "video" &&


                <div  className={`${data.tags==='Thinking'?"border-2 border-amber-400":""} w-full h-full  border py-4 relative rounded-xl`}>
                    <div onClick={opneDetailsPage} className='p-4'>
                        <video
                           
                            src={data.url}
                            controls
                            muted
                            className='object-cover w-full h-full cursor-pointer max-h-[200px]'
                        />
                    </div>

                    <div className='absolute inset-0 w-full h-1/4  z-12 flex justify-end p-1'>
                       <BookmarkPlus onClick={handleBookmarkMedia} className={`hover:scale-115 cursor-pointer active:scale-95 ${isBookmarked?'fill-blue-500 stroke-blue-500':''}`} />
                        <Heart onClick={() => handleLikeMedia(data.id)} className={`hover:scale-115 cursor-pointer active:scale-95 ${isliked ? 'fill-red-700 stroke-red-700' : ""} `} />

                    </div>
                </div>

            }



        </div>
    )
}

export default MediaTile
