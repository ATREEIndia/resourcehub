'use client'

import React, { useEffect, useState, use } from 'react'
import Navbar from '../../Components/Navbar';
import ResultHero from '../ResultHero';
import { useMyContext } from '../../Context/MyContext';
import lottieSearching from '@/public/searching.json'
import Lottie from 'lottie-react';


const page = ({ params }: { params: Promise<{ query: string }> }) => {
    const { dbData } = useMyContext()

    const { query } = use(params);
    const querry = decodeURIComponent(query);

    const [searchQuerry, setSearchQuerry] = useState(querry)
    const [dbImageData, setDbImageData] = useState<any[]>([])
    const [dbVideoData, setDbVideoData] = useState<any[]>([])
    const [newQuerry, setNewQuerry] = useState(querry)
    const [filtering, setFiltering] = useState(true)

    // useEffect(() => {

    //     setDbImageData([]);
    //     setDbVideoData([]);
    //     setFiltering(true)


    //     let querryArray = searchQuerry.trim().toLowerCase().split(" ")
    //     querryArray = querryArray.filter((data) => data.length > 2)

    //     dbData.map((data, i) => {
    //         if (!data.tags) return
    //         const aiTagArray = data.tags.replace(",", " ").toLowerCase().split(" ")
    //         console.log(aiTagArray)
    //         console.log(data.id + "" + querryArray)


    //         const hasmatch_ai = querryArray.some((searchWord: string) =>
    //             aiTagArray.some((tag: string) =>
    //                 tag.toLowerCase().includes(searchWord.toLowerCase().trim())
    //             )
    //         );
    //         let hasmatch_manual = false
    //         if (data.m_tags) {
    //             const manualTagArray = data.m_tags.replace(",", "").toLowerCase().split(" ")
    //             hasmatch_manual = querryArray.some((searchWord: string) =>
    //             manualTagArray.some((tag: string) =>
    //                 tag.toLowerCase().includes(searchWord.toLowerCase().trim())
    //             )
    //         );

    //         }



    //         if (!hasmatch_ai && !hasmatch_manual) return

    //         console.log(data.id)

    //         if (data.fileType === 'image') {
    //             setDbImageData((prev) => [...prev, data])
    //         }

    //         if (data.fileType === 'video') {
    //             setDbVideoData((prev) => [...prev, data])
    //         }


    //     })

    //   setTimeout(() => setFiltering(false), 3000);


    // }, [dbData, searchQuerry]);


    useEffect(() => {
        setFiltering(true);

        // 1. Prepare the query: Normalize to handle simple plurals/singulars
        const queryWords = searchQuerry
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 2);

        // Helper to strip "s", "es", "ies" for fuzzy plural matching
        const normalize = (word: string) =>
            word.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');

        // 2. Filter the data into temporary arrays
        const matchedImages: any[] = [];
        const matchedVideos: any[] = [];

        dbData.forEach((item) => {
            const checkMatch = (tagsString: string | undefined) => {
                if (!tagsString) return false;

                // Normalize tag string (remove commas, split into array)
                const tags = tagsString.toLowerCase().replace(/,/g, " ").split(/\s+/);

                return queryWords.some((qWord) => {
                    const normQ = normalize(qWord);

                    return tags.some((tag) => {
                        const normTag = normalize(tag);
                        // Check original match OR normalized match (singular/plural)
                        return tag.includes(qWord) ||
                            qWord.includes(tag) ||
                            normTag.includes(normQ) ||
                            normQ.includes(normTag);
                    });
                });
            };

            const isMatch = checkMatch(item.tags) || checkMatch(item.m_tags) || checkMatch(item.exifLocationName) || checkMatch(item.exifTimestamp) || checkMatch(item.location) ||checkMatch(item.credits) ;

            if (isMatch) {
                if (item.fileType === 'image') matchedImages.push(item);
                if (item.fileType === 'video') matchedVideos.push(item);
            }
        });

        // 3. Update state once (prevents multiple re-renders)
        setDbImageData(matchedImages);
        setDbVideoData(matchedVideos);

        const timer = setTimeout(() => setFiltering(false), 3000);
        return () => clearTimeout(timer); // Cleanup timeout if dependencies change

    }, [dbData, searchQuerry]);







    const handleNewSearch = () => {
        setSearchQuerry(newQuerry)


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
