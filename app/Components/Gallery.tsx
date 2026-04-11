import React, { useState } from 'react'
import MediaTile from './MediaTile'
import { useMyContext } from '../Context/MyContext'
import Lottie from 'lottie-react'
import lottieEmpty from '@/public/empty.json'
import { doc, setDoc } from 'firebase/firestore'
import { m_firestore } from './MyFirebase'

type probs = {
    galleryType?: string
    mediaData: any[]
}


const Gallery = ({ galleryType, mediaData }: probs) => {
    const [isBookmarked, setIsBookmarked] = useState(false)

    const { loading, userFirestoreData, fcData } = useMyContext()
    const [collectionSelectios, setCollectionSelections] = useState<string[]>([])
    const [addAll, setAddAll] = useState(false)
    const [choosenFcs, setChoosenFcs]=useState<string[]>([])
    const [updateCollectionForm, setUpdateCollectionForm]=useState(false)
    const[collectionAction, setCollectionAction]=useState('')

    const handleCollectionSelection = (id: string) => {
        if (collectionSelectios.some((item) => item === id)) {
            setCollectionSelections((prev) => prev.filter((item, i) => item !== id))
        } else {
            setCollectionSelections((prev) => [...prev, id])

        }

    }

    const addAllToCollectionSelection = () => {
        if (collectionSelectios.length === mediaData.length) {
            setCollectionSelections([])
            setAddAll(false)
            return
        }


        setCollectionSelections([])
        setAddAll(true)

        mediaData.map((data) => {
            setCollectionSelections((prev) => [...prev, data.id])
        })

    }

    const handleCollectionAction=()=>{

        if(collectionAction==="+"){
            updateCollectionAssets()

        }else{
            removeFromCollection()

        }

    }



    const handleFcCheckbox=(checked:boolean, fcName:string)=>{
        if(checked){
           setChoosenFcs((prev)=>[...prev, fcName])
        }else{
             setChoosenFcs((prev)=>prev.filter((item)=>item!==fcName))
        }

    }

   const updateCollectionAssets = async () => {
    try {
        // 1. Filter the data first to avoid unnecessary iterations
        const updates = fcData
            .filter((data) => choosenFcs.includes(data.id))
            .map(async (data) => {
                const currentAssetArray = data.assets ? data.assets.split(',') : [];
                
                // 2. Create a unique set of assets to avoid duplicates
                // This replaces the complex .some() logic
                const assetSet = new Set([...currentAssetArray, ...collectionSelectios]);
                const updatedAssetsString = Array.from(assetSet).join(',');

                // 3. Update Firestore
                const _ref = doc(m_firestore, 'fc', data.id);
                return setDoc(_ref, {
                    assets: updatedAssetsString
                }, { merge: true });
            });

        // 4. Wait for all updates to complete
        await Promise.all(updates);
        console.log("All assets updated successfully");
        setUpdateCollectionForm(false)
         setCollectionSelections([])
            setAddAll(false)
            setIsBookmarked(!isBookmarked)

    } catch (e) {
        console.error("Error updating collection assets:", e);
    }
};

const removeFromCollection = async () => {
    try {
        // 1. Filter data to only include chosen IDs
        const updates = fcData
            .filter((data) => choosenFcs.includes(data.id))
            .map(async (data) => {
                const currentAssetArray = data.assets ? data.assets.split(',') : [];
                
                // 2. Filter OUT the assets that are in collectionSelectios
                // We keep assets ONLY if they are NOT in the selection list
                const updatedAssetsArray = currentAssetArray.filter(
                    (asset:string) => !collectionSelectios.includes(asset)
                );
                
                const updatedAssetsString = updatedAssetsArray.join(',');

                // 3. Update Firestore
                const _ref = doc(m_firestore, 'fc', data.id);
                return setDoc(_ref, {
                    assets: updatedAssetsString
                }, { merge: true });
            });

        // 4. Wait for all updates to complete
        await Promise.all(updates);
        
        console.log("Assets removed successfully");
        
        // Reset UI State
        setUpdateCollectionForm(false);
        setCollectionSelections([]);
        setAddAll(false);
        window.location.reload();
        

    } catch (e) {
        console.error("Error updating collection assets:", e);
    }
};


    return (
        <div className='w-full h-full'>


            {!loading && mediaData.length === 0 &&
                <div className='flex items-center justify-center flex-col'>
                    <div className='w-100'>
                        <Lottie
                            animationData={lottieEmpty}
                            loop={true}

                        />

                    </div>
                    Sorry, couldn't find any matches for {galleryType}.
                </div>

            }


            <div className='w-full h-full grid sm:grid-cols-2 md:grid-cols-4 gap-5 '>
                {mediaData.map((data, i) => (
                    <MediaTile key={i} data={data} handleCollectionSelection={handleCollectionSelection} addALL={addAll} _isBookmarked={isBookmarked} />
                ))}

            </div> 

            {collectionSelectios.length>0 && 

            <div className=' bottom-10 right-10 fixed p-5 rounded-xl shadow-2xl bg-white z-15 select-none cursor-pointer flex gap-2 items-center '>
                <h1 onClick={addAllToCollectionSelection} className='text-blue-500'>{!addAll ? 'Select all' : "Remove all"}</h1>

                <div onClick={()=>{setUpdateCollectionForm(true); setCollectionAction("+")}} className='p-2 active:scale-95 bg-blue-500 text-white rounded-xl '>Add to Collections (<span>{collectionSelectios.length}</span>)</div>
                <div onClick={()=>{setUpdateCollectionForm(true); setCollectionAction("-")}} className='p-2 active:scale-95 bg-red-500 text-white rounded-xl '>Remove from Collections (<span>{collectionSelectios.length}</span>)</div>
            </div>
            }

           

           {updateCollectionForm && 
            
            <div className='w-full h-full inset-0 fixed backdrop-blur-xl bg-black/35 z-15 flex items-center justify-center'>

                <div className='p-4 bg-white flex flex-col gap-2 rounded-xl min-w-1/4'>
                    <h1 className='text-lg font-semibold text-gray-700'>Add to collections</h1>
                    <div className='flex gap-2 p-4'>
                        <div className='flex flex-col gap-2'>
                            {fcData.map((data, i) => (
                            <div key={i} className='flex gap-1'>
                                <input onChange={(e)=>handleFcCheckbox(e.target.checked, data.id)} type="checkbox" name="" id="" />
                                <h1>{data.id}</h1>

                            </div>
                        ))}

                        </div>
                        


                    </div>
                    <div className='flex items-center justify-between text-xs select-none px-5'>
                        <div onClick={()=> setUpdateCollectionForm(false)} className='hover:text-red-600 active:scale-90 cursor-pointer'>Cancel</div>
                        <div onClick={handleCollectionAction} className='p-2 text-white bg-blue-500 rounded-xl active:scale-90 cursor-pointer'>Update</div>

                    </div>
                </div>




            </div>}
            
            



        </div>

    )
}

export default Gallery
