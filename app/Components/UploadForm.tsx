'use client'
import { Circle, Loader, RotateCcw, Trash2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { commonDataList, fileProb, locationIqAPI } from '../Constants/MyConstnats'
import { useMyContext } from '../Context/MyContext'
import Image from 'next/image'
import { ref, update } from 'firebase/database'
import { db } from './MyFirebase'
import ExifReader from 'exifreader';

type probs = {
    manageUploadForm: () => void
}

const UploadForm = ({ manageUploadForm }: probs) => {

    const { user, dbData } = useMyContext()


    const inputRef = useRef<HTMLInputElement | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<fileProb[]>([])
    const [isNext, setIsNext] = useState(false)
    const [activeFileIndex, setActiveFileIndex] = useState(0)
    const activeFile = selectedFiles[activeFileIndex] || null;
    const [currentManaulTag, setCurrentManualTag] = useState('')
    const [manualTags, setManualTags] = useState<string[]>([])
    const [aiTags, setAiTags] = useState<string[]>([])
    const [credits, setCredits] = useState('')
    const [peningUploads, setPendingUploads] = useState(0)
    const [currentLocation, setCurrentLocation] = useState('')
  

    useEffect(() => {
        if (!selectedFiles) return
        const pending = selectedFiles.filter((file) => file.uploadProgress && file.uploadProgress < 100).length
        setPendingUploads(pending)


    }, [selectedFiles])

    useEffect(() => {
        if (activeFile) {
            setManualTags(activeFile.m_Tags || [])
            setAiTags(activeFile.ai_Tags || [])
            setCredits(activeFile.credits || '')
            setCurrentLocation(activeFile.location || '')
           



        }
    }, [activeFileIndex, dbData])

   

    useEffect(() => {
        setSelectedFiles((prev) =>
            prev.map((file, i) => {
                const dbRecord = dbData.find((item) => item.id === file.id)

                if (dbRecord) {
                    const newTag = dbRecord.tags.split(",")
                    return {
                        ...file,
                        ai_Tags: newTag
                    }
                } else {
                    return file
                }
            }))




    }, [dbData]);






    useEffect(() => {
        if (!selectedFiles) return;

        setSelectedFiles((prev) => (
            prev.map((file, i) => {
                if (i === activeFileIndex) {
                    return {
                        ...file,
                        m_Tags: manualTags,
                        aiTags: aiTags,
                        credits: credits,
                        location: currentLocation
                    }
                } else {
                    return file;
                }
            })
        ));


    }, [manualTags, aiTags, credits, currentLocation])






    const getFileType = (file: File) => {
        const exn = file.name.split('.').pop()?.toLowerCase()
        if (['jpg', "jpeg", 'png', 'svg'].includes(exn || "")) return 'image'
        if (['mp4', 'mov'].includes(exn || "")) return 'video'
        return 'unknown'
    }

    const extractExif = async (file: File) => {


        try {
            // 1. Read the file as an ArrayBuffer
            const data = await file.arrayBuffer();

            // 2. Load the EXIF tags
            const tags = ExifReader.load(data);

            // 3. Extract Date/Time
            // 'DateTimeOriginal' is usually when the photo was actually taken
            const timestamp = tags['DateTimeOriginal']?.description;

            // 4. Extract Location (GPS)
            const latitude = tags['GPSLatitude']?.description;
            const longitude = tags['GPSLongitude']?.description;

            console.log(`File: ${file.name}`);
            console.log(`Taken on: ${timestamp || 'No date found'}`);
            console.log(`Location: https://www.google.com/maps?q=${latitude}, ${longitude}`);
             let location=''
           let namedLocation="No location found";
          
            if(latitude && longitude){
                  namedLocation= await getLocationName(latitude,longitude )
                  location=`${latitude}, ${longitude}`

            }

           

            return {
                timestamp: timestamp || 'No data found',
                exifLocation: location,
                exitLocationName:namedLocation

            }

            // Now you can store these in your state alongside the file
        } catch (error) {
            return {
                timestamp:  'No data found',
                exifLocation: '',
                exitLocationName:'No location found'

            }
            console.error('Error reading EXIF:', error);
        }

    };

    // Function to get location name
    const getLocationName = async (lat: string, lon: string) => {
        try {
            const response = await fetch(
               `${locationIqAPI}&lat=${String(lat).trim()}&lon=${String(lon).trim()}&format=json`
            );
            const data = await response.json();

            // 'display_name' gives the full address
            // 'address' object contains specific parts like city, state, or park name
            return data.display_name || "Location Unknown";
        } catch (error) {
            console.error("Error fetching location:", error);
            return "Error finding location";
        }
    };


    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files;
        if (files) {
            addToSelectedFiles(files)
        }
    }



    const addToSelectedFiles = (files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);
        fileArray.map(async (file, i) => {
            if (selectedFiles.some((f) => f.file.name === file.name && f.file.size === file.size)) return

            const exif = await extractExif(file)

            const newFile: fileProb = {
                id: `${Date.now()}${i}`,
                file: file,
                localUrl: URL.createObjectURL(file),
                s3Url: "",
                previewUrl: "",
                fileType: getFileType(file),
                uploadedBy: user?.email || "",
                m_Tags: [],
                ai_Tags: [],
                credits: '',
                collections: '',
                location: '',
                exifLocation: exif?.exifLocation,
                exifLocationName:exif?.exitLocationName,
                exifTimestamp: exif?.timestamp

            }
            setSelectedFiles((prev) => [...prev, newFile])

        })
    }


    const removeFromSelectedFiles = (id: string) => {
        setSelectedFiles((prev) => prev.filter((f) => {
            return f.id !== id
        }))
    }

    const handleNext = () => {
        setIsNext(true)
        selectedFiles.map((file, i) => {
            handleUploadToS3(file)

        })

    }


    const handleUploadToS3 = async (file: fileProb) => {

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: file.id,
                    fileMimeType: file.file.type,
                    folderName: `${file.fileType}s`
                })

            })
            const { signedUrl, s3Url, previewUrl } = await res.json();
            console.log('previewUrl' + previewUrl)

            setSelectedFiles((prev) => prev.map((f, i) => {
                if (f.id === file.id) {
                    return {
                        ...f,
                        s3Url: s3Url,
                        previewUrl: previewUrl
                    }
                } else {
                    return f
                }
            }))

            const updatedFile = {
                ...file,
                s3Url: s3Url,
                previewUrl: previewUrl
            }

            try {
                await uploadToS3(signedUrl, updatedFile)

            } catch (e) {
                console.log(e)
            }


        } catch (e) {

        }

    }

    const uploadToS3 = async (signedUrl: string, fileToUpload: fileProb) => {
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.status)
                } else {
                    reject("Upload Failed with code " + xhr.status)
                }


            })

            xhr.addEventListener('error', () => reject('Network Error'))

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progressPercentage = Math.round(event.loaded / event.total * 100)

                    setSelectedFiles((prev) => prev.map((f, i) => {
                        if (f.id === fileToUpload.id) {
                            return {
                                ...f,
                                uploadProgress: progressPercentage
                            }
                        } else {
                            return f
                        }
                    }))


                    if (progressPercentage === 100 && fileToUpload.fileType === 'video') {
                        poleForCompressedVideo(fileToUpload)
                    }

                    if (progressPercentage === 100 && fileToUpload.fileType === 'image') {
                        uploadToFirebase(fileToUpload)
                    }
                }



            })

            xhr.open('PUT', signedUrl)
            xhr.setRequestHeader('Conteent-Type', fileToUpload.file.type || 'application/octet-stream')
            xhr.send(fileToUpload.file)

        })

    }


    const poleForCompressedVideo = async (file: fileProb, maxAttempt = 12, interval = 5000) => {
        let attempt = 0
        const url = file.previewUrl;
        console.log("url" + url)

        setSelectedFiles((prev) => prev.map((f, i) => {
            if (f.id === file.id) {
                return {
                    ...f,
                    compressStatus: "Compressing Video"
                }
            } else {
                return f
            }
        }))



        while (attempt < maxAttempt) {
            try {
                const res = await fetch(url, { method: "HEAD", cache: 'no-store' })
                if (res.ok) {
                    setSelectedFiles((prev) => prev.map((f, i) => {
                        if (f.id === file.id) {
                            return {
                                ...f,
                                compressStatus: "Compressed Successfully"
                            }
                        } else {
                            return f
                        }
                    }))

                    uploadToFirebase(file)
                    return true
                }

                attempt++

                await new Promise((resolve) => setTimeout(resolve, interval))



            } catch (error) {
                console.log(error)
            }

        }

        if (attempt === maxAttempt) {
            setSelectedFiles((prev) => prev.map((f, i) => {
                if (f.id === file.id) {
                    return {
                        ...f,
                        compressStatus: "Compressing Failed"
                    }
                } else {
                    return f
                }
            }))

            return false;

        }




    }


    const uploadToFirebase = async (fileToUpload: fileProb) => {
        const folder = fileToUpload.fileType === 'image' ? 'Images' : 'Videos';
        const dbRef = ref(db, `${folder}/${fileToUpload.id}`);
        try {
            await update(dbRef, {
                id: fileToUpload.id,
                url: fileToUpload.previewUrl,
                s3Url: fileToUpload.s3Url,
                credits: fileToUpload.credits,
                fileType: fileToUpload.fileType,
                m_tags: fileToUpload.m_Tags.join(",") || '',
                tags: fileToUpload.ai_Tags.join(",") || "Thinking",
                uploadedBy: fileToUpload.uploadedBy,
                fileName: fileToUpload.file.name,
                location: fileToUpload.location,
                exifLocation: fileToUpload.exifLocation || "",
                exifTimestamp: fileToUpload.exifTimestamp || "",
                exifLocationName: fileToUpload.exifLocationName || ""

            })

        } catch (error) {

        }


    }

    const addManualTags = () => {
        if (currentManaulTag.length < 1 || manualTags.includes(currentManaulTag)) return

        const cleanTag = currentManaulTag.replace(',', "").trim()
        setManualTags((prev) => [...prev, cleanTag])
        setCurrentManualTag('')
    }

    const removeManualTag = (index: number) => {
        setManualTags((prev) => prev.filter((_, i) => (i !== index)))

    }

    const removeAiTag = (index: number) => {

        setSelectedFiles((prev) =>
            prev.map((file, i) => {
                if (i === activeFileIndex) {
                    return {
                        ...file,
                        // Filter the tags directly on the file object
                        ai_Tags: file.ai_Tags.filter((_, tagIndex) => tagIndex !== index),
                    };
                }
                return file;
            })
        );
    };



    const applyToAll = (dataType: string) => {
        if (dataType === 'mTags') {

            setSelectedFiles((prev) =>
                prev.map((file, i) => ({
                    ...file,
                    m_Tags: manualTags
                }))
            );

        }

        if (dataType === 'credits') {
            setSelectedFiles((prev) => prev.map((file, i) => (
                {
                    ...file,
                    credits: credits

                }
            )))
        }

        if (dataType === 'location') {
            setSelectedFiles((prev) => prev.map((file, i) => (
                {
                    ...file,
                    location: currentLocation

                }
            )))
        }

    }

    const finalUploadToFirebase = () => {
        if (selectedFiles.some((file) => file.uploadProgress && file.uploadProgress < 100 || file.fileType == 'video' && file.compressStatus !== 'Compressed Successfully' || peningUploads > 0)) {
            alert('Please wait for all the file to be processed.')
            return

        }


        selectedFiles.map((file, i) => {
            uploadToFirebase(file)
        })
        manageUploadForm()

    }






    return (
        <div className='inset-0  fixed w-full h-full z-15 '>
            <div className='w-full h-full relative flex items-center justify-center'>
                <div className='absolute inset-0 bg-black/15 w-full h-full backdrop-blur-md '></div>

                {/* formBox */}
                <div className='bg-white p-4 z-10 rounded-xl w-7/8 lg:w-3/5  flex flex-col gap-5 '>


                    <div className='w-full flex justify-between items-center'>
                        <h1 className='text-lg font-semibold'>Upload New File</h1>
                        <X className='hover:text-red-600 cursor-pointer' onClick={manageUploadForm} />
                    </div>

                    {!isNext &&

                        <div>
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleFileDrop(e)}


                                className='w-full hover:bg-blue-50 hover:border-blue-200 cursor-pointer border-2 border-dashed h-25 rounded-xl text-gray-600 flex flex-col items-center justify-center'>
                                <p>Drag and drop or click to choose file</p>
                                <p className='text-xs'>Only Images and Videos are supported</p>

                                <input
                                    ref={inputRef}
                                    onChange={(e) => addToSelectedFiles(e.target.files)}
                                    type="file"
                                    multiple
                                    className='hidden'
                                />

                            </div>


                            {selectedFiles.length > 0 &&
                                <div>

                                    <div className='w-full p-4 bg-gray-200 rounded-xl grid grid-cols-3 gap-5 max-h-100 overflow-y-scroll'>
                                        {selectedFiles.map((file, i) => (
                                            <div key={i} className='border flex items-center justify-center relative'>
                                                {file.fileType === 'image' && <Image className='object-contain h-auto' unoptimized alt='' src={file.localUrl} width={150} height={100} />}
                                                {file.fileType === 'video' && <video className='object-contain' src={file.localUrl} autoPlay muted />}

                                                <div onClick={() => removeFromSelectedFiles(file.id)} className='absolute top-0 right-0 p-2 bg-white cursor-pointer rounded-full flex items-center justify-center w-8 h-8 hover:text-red-600'>
                                                    <Trash2 size={10} className='w-full h-full' /></div>
                                            </div>
                                        ))}
                                    </div>


                                    <div onClick={handleNext} className='w-full flex justify-end p-4'>
                                        <div className='p-2 bg-blue-700 text-white rounded-xl cursor-pointer active:scale-95 hover:bg-blue-900'>Save & Next</div>
                                    </div>


                                </div>
                            }

                        </div>
                    }




                    {isNext &&
                        <div className='w-full flex flex-col sm:flex-row gap-2 max-h-[80vh]  h-full overflow-y-scroll sm:overflow-hidden scrollbar-hidden'>

                            {/* left */}


                            <div className='sm:w-1/3 max-h-2/3 py-4'>
                                <h1 className='font-semibold mb-2 px-4'>Selected Files</h1>


                                <div className='flex flex-col gap-3 h-full max-h-[70vh] overflow-y-scroll py-2 w-full px-4   '>
                                    {selectedFiles.map((file, i) => (
                                        <div onClick={() => setActiveFileIndex(i)} key={i} className={`p-2 border rounded-xl flex flex-col gap-1 select-none cursor-pointer ${activeFileIndex === i ? "boorder-2 border-blue-100 bg-blue-50" : ""}`}>

                                            {/* top */}
                                            <div className='flex gap-2 items-center justify-between'>

                                                <div className='w-5 h-5 p-5 flex items-center justify-center bg-black text-white font-semibold text-xs'>
                                                    {file.fileType == 'image' ? "IMG" : 'VID'}
                                                </div>

                                                <div className='flex flex-col gap-1 text-xs flex-1'>
                                                    <h1 className='text-blue-600 font-semibold'>{file.id}</h1>
                                                    <h1 className='text-gray-600 truncate w-40 '>{file.file.name}</h1>

                                                    <div className='w-full flex justify-between'>
                                                        <h1>Uploading</h1>
                                                        <p>{file.uploadProgress || 0}%</p>
                                                    </div>

                                                    <div className='bg-blue-800 h-1 rounded-xl' style={{ width: `${file.uploadProgress}%` }}></div>


                                                </div>

                                            </div>

                                            {/* bottom */}
                                            {file.fileType === 'video' &&

                                                <div className='w-full select-none flex items-center justify-between text-xs border-t-1 mt-2 pt-1 '>

                                                    <div className='flex items-center gap-2'>
                                                        <Loader size={12} className={`animate-spin ${file.compressStatus?.includes('Video') ? "flex" : "hidden"}`} />
                                                        <h1
                                                            className={`${file.compressStatus?.includes('Success') ? "text-green-800" : "text-amber-500"}
                                                    ${file.compressStatus?.includes('Failed') ? "text-red-700" : ""}
                                                    `} >{file.compressStatus}</h1>

                                                    </div>
                                                    <RotateCcw onClick={() => poleForCompressedVideo(file)} className={`${file.compressStatus?.includes('Failed') ? 'flex' : 'hidden'} active:scale-55 cursor-pointer`} size={15} />


                                                </div>


                                            }



                                        </div>

                                    ))}

                                </div>
                            </div>


                            <div className='sm:border-l-2 border-gray-200 flex-flex-col flex-1 max-h-2/3  py-4'>

                                <div className='w-full h-50 bg-gray-50'>
                                    {activeFile.fileType == 'image' &&
                                        <Image className=' w-full h-full object-contain' src={activeFile?.localUrl || "/logo.png"} alt={''} width={1000} height={10} />
                                    }
                                    {activeFile.fileType == 'video' &&
                                        <video className=' w-full h-full object-contain' controls muted src={activeFile?.localUrl || "/logo.png"} />
                                    }
                                </div>

                                <div className='w-full p-2 flex-1 h-full max-h-2/3 overflow-y-scroll no-scrollbar '>
                                     
                                     {/* exif data */}
                                     <div className='p-2 bg-blue-50 text-xs rounded-xl mb-4 flex flex-col gap-1'>
                                        <h1 className='text-sm font-semibold'>Data from Image</h1>
                                        <p >Timestamp: <span className='text-blue-600'>{activeFile?.exifTimestamp}</span></p>
                                        <p>Location: <span className='text-blue-600'>{activeFile?.exifLocation}</span></p>
                                        <p>Address: <span className='text-blue-600'>{activeFile?.exifLocationName}</span></p>
                                     </div>




                                    <h1 className='text-sm font-semibold select-none'>Add Meta Data</h1>

                                    




                                    {/*Manual Tgas  */}
                                    <div className='flex  items-center select-none'>
                                        <p className='text-xs mt-2 px-2'>Manual Tags</p>
                                        <p onClick={() => applyToAll('mTags')} className='text-xs cursor-pointer mt-2 active:scale-90  font-semibold text-blue-500 '>Apply to All</p>
                                    </div>
                                    <div className='w-full flex gap-1 border border-blue-200 rounded-xl '>
                                        <input list='search-suggestions' onKeyDown={(e) => e.key === 'Enter' || e.key === "," ? addManualTags() : null}
                                            value={currentManaulTag}
                                            onChange={(e) => setCurrentManualTag(e.target.value.replace(',', ""))} className=' outline-none p-2 text-xs flex-1' type="text" />

                                        <datalist id="search-suggestions">
                                            {commonDataList.map((data, i) => (
                                                <option key={i} value={data} />
                                            ))}

                                        </datalist>

                                        <div onClick={addManualTags} className='p-2 select-none cursor-pointer active:scale-95 bg-blue-700 text-white text-xs rounded-r-xl'>+</div>

                                    </div>

                                    {/* display manual Tgas */}
                                    <div className='w-full flex flex-wrap gap-2 p-2 '>
                                        {activeFile?.m_Tags.map((tag, i) => (
                                            <div className='p-1 bg-blue-50 text-xs flex gap-1 select-none' key={i}>
                                                <p>{tag}</p>
                                                <p onClick={() => removeManualTag(i)} className='hover:text-red-700 cursor-pointer'>x</p>
                                            </div>
                                        ))}

                                    </div>

                                    {/* display ai tags */}
                                    <p className='text-xs mt-2 px-2 select-none'> 🤖 Ai Tags</p>
                                    <div className='w-full flex flex-wrap gap-2 p-2 max-h-50 overflow-y-auto no-scrollbar '>
                                        {activeFile?.ai_Tags.map((tag, i) => (
                                            <div className='p-1 bg-blue-50 text-xs flex gap-1 select-none' key={i}>
                                                <p>{tag}</p>
                                                <p onClick={() => removeAiTag(i)} className='hover:text-red-700 cursor-pointer'>x</p>
                                            </div>
                                        ))}

                                    </div>

                                    {/* location */}
                                    <div className='flex  items-center select-none'>
                                        <p className='text-xs mt-2 px-2'>Location</p>
                                        <p onClick={() => applyToAll('location')} className='text-xs cursor-pointer mt-2 active:scale-90  font-semibold text-blue-500 '>Apply to All</p>
                                    </div>
                                    <input value={activeFile.location} onChange={(e) => setCurrentLocation(e.target.value)} className='p-2 text-xs outline-none border w-full rounded-xl border-blue-200' type="text" />

                                    {/* Credits */}
                                    <div className='flex  items-center select-none mt-5'>
                                        <p className='text-xs mt-2 px-2'>Credits</p>
                                        <p onClick={() => applyToAll('credits')} className='text-xs cursor-pointer mt-2 active:scale-90  font-semibold text-blue-500 '>Apply to All</p>
                                    </div>
                                    <input value={activeFile.credits} onChange={(e) => setCredits(e.target.value)} className='p-2 text-xs outline-none border w-full rounded-xl border-blue-200' type="text" />

                                    <div onClick={finalUploadToFirebase} className='w-full p-2 flex justify-end select-none'>
                                        <div className={`p-2 ${peningUploads === 0 ? 'bg-blue-600' : 'bg-gray-600'}  text-white text-sm active:scale-90 rounded-xl`}> {peningUploads > 0 ? `Uploading (${peningUploads})` : 'Save All'}</div>
                                    </div>


                                </div>



                            </div>


                        </div>

                    }



                </div>


            </div>

        </div>
    )
}

export default UploadForm
