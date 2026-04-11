'use client'
import React, { use, useEffect, useState } from 'react'
import { useMyContext } from '../../Context/MyContext'

import Image from 'next/image'
import { AlignRight, Download, Edit, Package, Trash2Icon, View } from 'lucide-react'
import { ref, remove, update } from 'firebase/database'
import { db, m_firestore } from '../../Components/MyFirebase'
import { doc, setDoc } from 'firebase/firestore'


const page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { dbData, user, fcData } = useMyContext()
    const { id } = use(params);
    const assetID = decodeURIComponent(id);
    
   

    const [currentAsset, setCurrentAsset] = useState<any | null>(null)
    const [imgSrc, setImgSrc] = useState<string>('/logo.png')
    const [deleteWindow, setDeleteWidow] = useState(false)
    const [editWindow, setEditWidow] = useState(false)
    const [deleteAdminKey, setDeletAdminKey] = useState('')
    const [manualTagInput, setManualTagInput] = useState('')
    const [manualTagArray, setManualTagArray] = useState<string[]>([])
    const [aiTagArray, setAiTagArray] = useState<string[]>([])
    const [credit, setCredit] = useState('')
    const [collectionList, setCollectionList] = useState<string[]>([])

    useEffect(() => {
        // Find the specific asset
        const asset = dbData.find((data) => data.id === assetID)

        if (asset) {
            setCurrentAsset(asset)
           
            setManualTagArray(asset.m_tags.trim().split(',') || [])
            setAiTagArray(asset.tags.trim().split(',') || [])
            setCredit(asset.credits || '')

             if(asset.m_tags.trim()===''){
                 setManualTagArray([])
            }


        }
    }, [dbData, assetID])

    useEffect(() => {
        if(!fcData || !currentAsset) return
        fcData.map((fc) => {
            if (fc.assets.includes(currentAsset.id)) {
                setCollectionList((prev)=>[...prev,fc.id])
            }

        })


    }, [fcData,currentAsset])

    // If no asset is found yet, you could return a loader or the logo
    if (!currentAsset) {
        return <div className="w-full h-full flex items-center justify-center">Loading...</div>
    }

    const handleDeleteAsset = async () => {
        if (deleteAdminKey === 'Admin@403' || currentAsset.uploadedBy === user?.email) {
            const fileTypeRef = currentAsset.fileType === "image" ? "Images" : "Videos"
            const dataRef = ref(db, `${fileTypeRef}/${currentAsset.id}`)
            try {
                remove(dataRef).then(() => {
                    updateFc()

                })

            } catch (e) {
                console.log(e)

            }


        } else {
            alert('Key not matching')
        }

    }

    const updateFc = async () => {

        try {
            fcData.map(async (fc) => {
                const fcRef = doc(m_firestore, 'fc', fc.id)
                const fcAssetArray = fc.assets.split(",")
                if (fcAssetArray.some((a: string) => a === currentAsset.id)) {
                    const newFcAssetsArray = fcAssetArray.filter((a: string) => a !== currentAsset.id)
                    await setDoc(fcRef, {

                        assets: newFcAssetsArray.join(',')

                    }, { merge: true })
                }

            })


            setDeleteWidow(false)
            window.open('/')

        } catch (e) {

        }

    }

    const addManualtag = () => {

        if (manualTagArray.some((tag) => tag === manualTagInput) || manualTagInput.length<2 ) return

        setManualTagArray((prev) => [...prev, manualTagInput])
        setManualTagInput('')

    }


    const removeManualTag = (index: number) => {
        setManualTagArray((prev) => prev.filter((tag, i) => i !== index))
    }
    const removeAiTag = (index: number) => {
        setAiTagArray((prev) => prev.filter((tag, i) => i !== index))
    }

    const updateDbData = async () => {
        if (deleteAdminKey === 'Admin@403' || currentAsset.uploadedBy === user?.email) {
            const fileTypeRef = currentAsset.fileType === "image" ? "Images" : "Videos"
            const dataRef = ref(db, `${fileTypeRef}/${currentAsset.id}`)

            try {
                await update(dataRef, {
                    tags: aiTagArray.join(','),
                    m_tags: manualTagArray.join(','),
                    credits: credit,
                    updatedBy: user?.email,
                    updatedAt: new Date()


                })

                setEditWidow(false)

            } catch (e) {
                console.log(e)
            }


        } else {
            alert('Admin key not matching')
        }

    }

    return (
        
            <div className='w-full h-full flex justify-center items-center min-h-screen bg-gray-200'>
            <div className='SM:w-4/5 bg-white p-4 rounded-xl grid sm:grid-cols-2'>

                <div className='w-full h-full max-h-[80vh]'>
                    {currentAsset.fileType === 'image' &&
                        <img src={currentAsset.url} alt="" className='w-full h-full object-contain' />
                    }
                    {currentAsset.fileType === 'video' &&
                        <video src={currentAsset.url} controls className='w-full h-full object-contain' />
                    }


                </div>


                {/* right side */}

                <div className='p-2 px-4 text-sm flex flex-col w-full gap-2'>
                    <div className='w-full flex justify-end gap-5 '>
                        <Edit onClick={() => setEditWidow(true)} className='active:scale-90 hover:text-blue-600 cursor-pointer' />
                        <Trash2Icon onClick={() => setDeleteWidow(true)} className='active:scale-90 hover:text-red-600 cursor-pointer' />

                    </div>

                    <h1 className='text-blue-500 font-semibold'>{currentAsset.id}</h1>

                    <div className='flex gap-2'>
                        <h1>Uploaded by:</h1>
                        <p className='text-blue-500'>{currentAsset.uploadedBy}</p>
                    </div>

                    <div className=' flex gap-2'>
                        <h1>Media Credits:</h1>
                        <p className='text-blue-600'>{currentAsset.credits}</p>

                    </div>

                    <div className='flex gap-2'>
                        <h1>Original File Name:</h1>
                        <p className='text-blue-500'>{currentAsset.fileName}</p>
                    </div>

                    {collectionList.length>0 &&
                    <div className='mt-5 select-none'>
                        <h1 className='font-medium'>Collections</h1>
                        <div className=' flex gap-2'>
                            {collectionList.map((c) => (
                                <div key={c} className='flex gap-1 p-1 bg-orange-100 items-center text-xs rounded-lg'>
                                    <Package/>
                                    <p>{c}</p>
                                </div>
                            ))}


                        </div>
                    </div>
                    
                    }



                    <div className='mt-5'>
                        <p>Manual Tags</p>
                        <div className='flex gap-2 flex-wrap'>
                            {currentAsset.m_tags?.split(',').map((tag: string, i: number) => (

                                <div key={i} className='text-xs p-2  bg-blue-100'>{tag}</div>
                            ))}

                        </div>

                    </div>

                    <div className='mt-5'>
                        <p>🤖 Ai Tags</p>
                        <div className='flex gap-2 flex-wrap'>
                            {currentAsset.tags?.split(',').map((tag: string, i: number) => (

                                <div key={i} className='text-xs p-2  bg-blue-100'>{tag}</div>
                            ))}

                        </div>

                    </div>



                    <div className='w-full  flex'>

                        <div className='mt-5 select-none active:scale-95 cursor-pointer flex items-center gap-2 p-2 hover:bg-blue-600 text-white rounded-xl bg-blue-400'>
                            <View size={15} />
                            <a href={currentAsset.s3Url} target='_blank' download={'image.jpg'}>Open Original File</a>
                        </div>


                    </div>








                </div>


            </div>

            {deleteWindow &&
                <div className='w-full h-full inset-0 fixed bg-black/30 backdrop-blur-lg flex items-center justify-center'>
                    <div className='bg-white p-4 rounded-xl flex flex-col gap-5 m-2'>
                        <h1 className='text-xl font-black'>Delete</h1>

                        <div>
                            <h1 className='text-md font-semibold'>Confirm deleting asset <span className='text-red-700'>{currentAsset.id}</span></h1>
                            <p className='text-xs '>This action is not reversable. Please be mindful confirming </p>

                        </div>

                        {currentAsset.uploadedBy !== user?.email &&
                            <div>
                                <h1>🗝️ Enter admin key to confirm</h1>
                                <input value={deleteAdminKey} onChange={(e) => setDeletAdminKey(e.target.value.trim())} className='p-2 bg-gray-200 rounded-xl outline-red-100 w-full' type='text' />

                            </div>
                        }

                        <div className='w-full flex justify-between items-center select-none'>
                            <h1 onClick={() => setDeleteWidow(false)} className='cursor-pointer hover:text-blue-600 active:scale-95'>Cancel</h1>
                            <h1 onClick={handleDeleteAsset} className='p-2 cursor-pointer bg-red-700 text-white rounded-xl active:scale-95'>Delete</h1>

                        </div>




                    </div>


                </div>

            }



            {/* edit window */}
            {editWindow &&
                <div className='w-full h-full  flex fixed  inset-0 bg-black/30 backdrop-blur-xl items-center justify-center'>
                    <div className='bg-white rounded-xl p-4 flex flex-col gap-5 m-2 sm:w-2/5 max-h-[80vh] no-scrollbar overflow-y-scroll'>
                        <h1>Edit Meta Data for <span className='text-blue-600'>{currentAsset.id}</span></h1>

                        <div className='w-full h-[250px]'>
                            {currentAsset.fileType === 'image' &&
                                <img className='w-full h-full object-contain' src={currentAsset.url} alt="" />

                            }
                            {currentAsset.fileType === 'video' &&
                                <video className='w-full h-full object-contain' controls src={currentAsset.url} />

                            }

                        </div>

                        <div className='text-sm'>
                            <h1>Manual Tags</h1>

                            <div className='p-2 bg-gray-100 rounded-xl flex'>
                                <input onKeyDown={(e) => e.key === "Enter" || e.key === "," ? addManualtag() : null}
                                    value={manualTagInput}
                                    onChange={(e) => setManualTagInput(e.target.value.trim().replace(",", ""))}
                                    className=' rounded-xl w-full outline-none' type="text" />
                                <p onClick={addManualtag} className='p-2 bg-blue-600 active:scale-90 select-none text-white rounded-r-xl cursor-pointer'>+</p>
                            </div>

                            <div className='flex gap-2 flex-wrap m-2'>
                                {manualTagArray.map((tag, i) => (
                                    <div key={i} className='p-2 flex gap-2 select-none text-xs bg-blue-100'>
                                        <h1 className=''>{tag}</h1>
                                        <h1 onClick={() => removeManualTag(i)} className='hover:text-red-500 cursor-pointer active:scale-95'>x</h1>
                                    </div>

                                ))}
                            </div>

                            <div className='mt-5 p-2'>
                                <h1>Ai Tags</h1>

                                <div className='flex gap-2 flex-wrap  '>

                                    {aiTagArray.map((tag, i) => (
                                        <div key={i} className='p-2 flex gap-2 select-none text-xs bg-blue-100'>
                                            <h1 className=''>{tag}</h1>
                                            <h1 onClick={() => removeAiTag(i)} className='hover:text-red-500 cursor-pointer active:scale-95'>x</h1>
                                        </div>

                                    ))}
                                </div>

                            </div>

                            <div className='flex mt-5'>
                                <div className='w-full h-full  p-2'>
                                    <h1>Media Credits</h1>
                                    <input onChange={(e) => setCredit(e.target.value)} className='p-2 bg-gray-100 outline-none rounded-xl w-full' value={credit} type='text' />
                                </div>

                                {currentAsset.uploadedBy !== user?.email &&
                                    <div className='w-full h-full  p-2'>
                                        <h1>🗝️ Admin key</h1>
                                        <input onChange={(e) => setDeletAdminKey(e.target.value)} className='p-2 bg-gray-100 outline-none rounded-xl w-full' value={deleteAdminKey} type='text' />
                                    </div>
                                }

                            </div>

                            <div className='p-2 px-4 flex items-center justify-between'>
                                <div onClick={() => setEditWidow(false)} className='hover:text-blue-600 cursor-pointer active:scale-90'>Cancel</div>
                                <div onClick={updateDbData} className='p-2 bg-blue-500 hover:bg-blue-600 rounded-xl active:scale-90 text-white cursor-pointer'>Update</div>
                            </div>




                        </div>
                    </div>

                </div>

            }


        </div>
        
        
    )
}

export default page

