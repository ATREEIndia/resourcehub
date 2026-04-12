'use client'
import React, { useEffect, useState } from 'react'
import { useMyContext } from '../Context/MyContext'
import { collection, doc, setDoc } from 'firebase/firestore'
import { m_firestore } from './MyFirebase'

const FeaturedCollections = () => {
    const { user, fcData, dbData, loading } = useMyContext()
    const [newCollectionName, setNewCollectionName] = useState('')
    const [newCollectionForm, setNewCollectionForm] = useState(false)
    const [accessIndex, SetAccessIndex] = useState(0)
    const accessArray = ['Public', 'Only Me', 'Contributers']
    const[contributerInput,setContributerInput]=useState('')
    const[contributersArray, setContributersArray]=useState<string[]>([])


    useEffect(()=>{
        if(accessIndex!==2){
            setContributersArray([])
        }
        // if(accessIndex===1){
        //     const userEmail=user?.email || ''
        //     setContributersArray([userEmail])
        // }

    },[accessIndex])

    const createNewCollection = async () => {
        try {
            const docRef = doc(m_firestore, 'fc', newCollectionName)
            await setDoc(docRef, {
                assets: '',
                createdBy: user?.email,
                access: contributersArray.join(',')||''
            }, { merge: true })
            setNewCollectionForm(false)
            setNewCollectionName('')



        } catch (e) {

        }




    }

    const handleContributersArray=()=>{
        if(contributersArray.some((contributer)=>contributer===contributerInput) || contributerInput.length<1 ) return
        setContributersArray((prev=>[...prev,contributerInput]))
        setContributerInput('')

    }

    const removeFromContributerArray=(index:number)=>{
        setContributersArray((prev)=>prev.filter((c,i)=>i!==index))

    }

    const openCollection = (id: string) => {
        const url = `collection/${id}`
        window.open(url, '_blank', 'noopener,noreferrer');

    }
    return (
        <div className='w-full h-full p-8 '>

            <div className='flex gap-3 items-center select-none'>
                <h1 className='text-lg font-medium'>Explore Featured Collections</h1>
                <h1 onClick={() => setNewCollectionForm(true)} className='text-sm text-blue-500 cursor-pointer hover:font-semibold active:scale-95'>+ Add New</h1>
            </div>


            <div className='w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  p-4 gap-5  '>
                {fcData.map((fc, i) => {
                    const assetsArray = fc.assets.length < 2 ? [] : fc.assets.split(",")
                    let thumnailUrl = `https://digispace-atree.s3.ap-south-1.amazonaws.com/assets/images/raw/${fc.assets.split(",")[0]}`

                    const firstAssetId = fc.assets?.split(",")[0];
                    const dataType = firstAssetId
                        ? dbData.find((d) => d.id === firstAssetId)?.fileType
                        : "image";
                    if (dataType === 'video') {
                        thumnailUrl = `https://digispace-atree.s3.ap-south-1.amazonaws.com/assets/videos/preview/${fc.assets.split(",")[0]}.mp4`

                    }





                    return <div onClick={() => openCollection(fc.id)} key={i} className='w-full h-full flex flex-col sm:flex-row gap-2 items-center hover:bg-blue-100 rounded-xl select-none cursor-pointer'>
                        <div className='w-20 h-20 '>
                            <img className={`object-cover w-full h-full rounded-xl ${dataType === 'image' ? '' : 'hidden'}`} src={thumnailUrl} alt=""
                                onError={(e) => (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2014/04/03/00/33/box-308680_1280.png"} />
                            <video className={`object-cover w-full h-full rounded-xl ${dataType === 'video' ? '' : 'hidden'}`} src={thumnailUrl}
                            />

                        </div>

                        <div className='text-xs'>
                            <h1>{fc.id}</h1>
                            <h1>{assetsArray.length} items</h1>
                        </div>



                    </div>
                })}

            </div>

            {newCollectionForm &&
                <div className='fixed inset-0 w-full h-full backdrop-blur-md bg-black/20 z-15 flex items-center justify-center'>

                    <div className='p-4 bg-white rounded-xl px-8 sm:max-w-2/3'>
                        <h1 className='font-black text-gray-600'>Add New Collection</h1>
                        <div className='text-xs mt-5 flex flex-col gap-2'>
                            <h1>Enter collection name </h1>
                            <input value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className='bg-gray-200 w-full p-2 outline-none rounded-xl' type="text" name="" id="" />

                            <div className='p-2 rounded-xl border mt-5'>

                                <h1 className='font-semibold py-2 '>🗝️ Access</h1>
                                <div className='flex gap-2 select-none'>
                                    {accessArray.map((a, i) => (
                                        <div onClick={() => SetAccessIndex(i)} className={`p-2 text-xs cursor-pointer rounded-xl ${accessIndex === i ? 'bg-blue-200' : ''}`} key={i}>{a}</div>
                                    ))}

                                </div>

                                {accessIndex==2 &&
                                <div className=' flex gap-1 flex-col mt-3'>
                                    <p className='text-gray-400'>Enter email ids seperate by comma</p>

                                    <div className='bg-gray-200 flex gap-1 rounded-xl items-center'>
                                        <input onKeyDown={(e)=>e.key==='Enter'|| e.key===","?handleContributersArray():null} value={contributerInput} onChange={(e)=>setContributerInput(e.target.value.trim().replace(',',''))} className='flex-1 p-2 outline-none px-2' type="text" />
                                        <div onClick={handleContributersArray} className='p-2 text-white font-semibold bg-blue-500 rounded-r-xl active:scale-75 cursor-pointer'>+</div>

                                    </div>

                                    <div className='flex gap-2 p-2 flex-wrap'>
                                        {contributersArray.map((c,i)=>(
                                            <div  className='p-2 flex gap-2 bg-blue-100 select-none' key={i}>
                                               <p>{c}</p> 
                                               <p onClick={()=>removeFromContributerArray(i)}>x</p>
                                                </div>
                                            
                                        ))}

                                    </div>
                            
                                   

                                </div>
                                
                                }

                            </div>

                            <div className='m-2 flex justify-between select-none '>
                                <div onClick={() => setNewCollectionForm(false)} className='p-2 cursor-pointer text-red-500 rounded-xl'>Cancel</div>
                                <div onClick={createNewCollection} className='p-2 cursor-pointer bg-blue-500 text-white rounded-xl'>Create</div>
                            </div>
                        </div>
                    </div>



                </div>

            }


        </div>



    )
}

export default FeaturedCollections
