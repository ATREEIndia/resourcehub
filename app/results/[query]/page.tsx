'use client'

import React, { useEffect, useState, use } from 'react'
import Navbar from '../../Components/Navbar';
import ResultHero from '../ResultHero';
import { useMyContext } from '../../Context/MyContext';
import lottieSearching from '@/public/searching.json'
import Lottie from 'lottie-react';
import { doc } from 'firebase/firestore';
import { db } from '@/app/Components/MyFirebase';
import { ref, update } from 'firebase/database';
import { locationIqAPI } from '@/app/Constants/MyConstnats';


const page = ({ params }: { params: Promise<{ query: string }> }) => {
    const { dbData } = useMyContext()

    const { query } = use(params);
    const querry = decodeURIComponent(query);

    const [searchQuerry, setSearchQuerry] = useState(querry)
    const [dbImageData, setDbImageData] = useState<any[]>([])
    const [dbVideoData, setDbVideoData] = useState<any[]>([])
    const [newQuerry, setNewQuerry] = useState(querry)
    const [filtering, setFiltering] = useState(true);
    const [triedLocationName, setTriedLocationName] = useState(false)


    useEffect(() => {
        if (!dbData || triedLocationName) return

        dbData.map((data) => {

            if (data.exifLocation?.length > 2 && data.exifLocationName === 'Error finding location' || data.exifLocationName === 'Location Unknown') {
                const latlong = data.exifLocation.split(',')
                tryForLocationName(latlong, data.fileType, data.id)

            } else {
                return
            }



        })


    }, [dbData])



    const tryForLocationName = async (latlong: string, fileType: string, id: string) => {
        const locationName = await getLocationName(latlong[0], latlong[1])

        if (locationName === "Error") return;
        console.log('locationName= ' + locationName)

        const folder = fileType === 'image' ? 'Images' : 'Videos';
        const dbRef = ref(db, `${folder}/${id}`);
        try {
            await update(dbRef, {

                exifLocationName: locationName || ""

            })

        } catch (error) {

        }


    }






    const getLocationName = async (lat: string, lon: string) => {
        try {
            const response = await fetch(
                `${locationIqAPI}&lat=${lat.trim()}&lon=${lon.trim()}&format=json`
            );
            const data = await response.json();
            if (data.error) return "Error"

            // 'display_name' gives the full address
            // 'address' object contains specific parts like city, state, or park name
            return data.display_name || "Location Unknown";
        } catch (error) {
            //console.error("Error fetching location:", error);
            return "Error";
        }
    };





    useEffect(() => {
        // 1. Guard clause: Minimum 2 characters
        if (!searchQuerry || searchQuerry.trim().length < 2) {
            setFiltering(false);
            // If  want to reset data when search is cleared:
            // setDbImageData(dbData.filter(i => i.fileType === 'image'));
            return;
        }

        setFiltering(true);

        // normalising the words to avoud plural and singualr conflicts

        const normalize = (word: string) =>
            word.toLowerCase()
                .replace(/ies$/, 'y')
                .replace(/es$/, '')
                .replace(/s$/, '');


        // excluding common stop words
        const stopWords = new Set(['and', 'or', 'the', 'with', 'for', 'in', 'at', 'a', 'an']);

        const queryWords = searchQuerry
            .toLowerCase()
            .replace(/,/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length >= 2 && !stopWords.has(word))
            .map(word => ({
                original: word,
                norm: normalize(word)
            }));

        const matchedImages: any[] = [];
        const matchedVideos: any[] = [];

        dbData.forEach((item) => {
            // Collect all text fields into one searchable string or array
            const searchBlob = [
                item.tags, item.m_tags, item.exifLocationName,
                item.exifTimestamp, item.location, item.credits
            ].filter(Boolean).join(" ").toLowerCase();

            console.log(searchBlob)

            // 2. Optimized Match Logic
            const isMatch = queryWords.some((q) => {
                // Check if any part of the searchBlob contains the full query word
                // This prevents "no" matching "nobin" because "no".includes("nobin") is false
                const normalizedBlob = normalize(searchBlob);

                return searchBlob.includes(q.original) || normalizedBlob.includes(q.norm);
            });

            if (isMatch) {
                item.fileType === 'image' ? matchedImages.push(item) : matchedVideos.push(item);
            }
        });

        setDbImageData(matchedImages);
        setDbVideoData(matchedVideos);

        const timer = setTimeout(() => setFiltering(false), 2500); // Reduced to 500ms for snappier feel
        return () => clearTimeout(timer);

    }, [dbData, searchQuerry]);










    const handleNewSearch = () => {
        if (newQuerry.length > 2) {
            setSearchQuerry(newQuerry)
        }



    }


    return (

        <div className='w-full h-full'>


            <div className='w-full  p-4 mt-5  text-xs'>
                <h1 className='px-2'>Try another search term</h1>
                <div className='sm:w-1/4 border flex items-center border-gray-200 rounded-xl  bg-gray-100'>
                    <input onKeyDown={(e) => e.key === "Enter" ? handleNewSearch() : null} onChange={(e) => setNewQuerry(e.target.value)} value={newQuerry} className='flex-1 outline-none p-2 ' type="text" />
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


    )
}

export default page
