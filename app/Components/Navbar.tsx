'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import UploadForm from './UploadForm'
import SignIn from './SignIn'
import { useMyContext } from '../Context/MyContext'
import { signOut } from 'firebase/auth'
import { auth } from './MyFirebase'
import Link from 'next/link'
import { Hamburger, Heart, LogOut, Menu, Upload, UploadCloud } from 'lucide-react'

const Navbar = () => {

    const { user, regUserData } = useMyContext()

    const [openUploadForm, setOpenUploadForm] = useState(false)
    const [mobileMenu, setMobileMenu] = useState(false)
    const[isUserRegistred, setIsUserRegistered]=useState(false)

    const manageUploadForm = () => {
        setOpenUploadForm(!openUploadForm)
        setMobileMenu(false)
    }

    useEffect(()=>{
        if(!user || !regUserData) return;

       
        console.log(user?.email)

        if(regUserData.length<1){
             setIsUserRegistered(true)
             return;
        }

       const isMatch = regUserData.some(item => item.id === user?.email);
       setIsUserRegistered(isMatch)

    },[user, regUserData])



    return (
        <div className='w-full h-20 shadow-lg flex items-center  px-4 justify-between select-none'>
            {/* logo */}
            <Link href="/" aria-label="Go to Homepage">
                <Image
                    src="/logo.png"
                    alt="resourcHub" // Replace with actual name for SEO
                    width={150}
                    height={150}
                    className="h-7 w-auto"
                   // className="object-contain"
                    priority // Ensures the logo loads immediately as a key branding element
                    unoptimized // Necessary if using external hosting or specific static exports
                />
            </Link>

            <Menu onClick={()=>setMobileMenu(!mobileMenu)} className='sm:hidden' />


            <div className='hidden items-center gap-2 sm:flex'>
                <a href='/liked' target='_blank' className='cursor-pointer'>
                    <Heart />
                </a>

                <a href='/myuploads' target='_blank' className='cursor-pointer px-4 flex items-center flex-col '>
                    <Upload className='active:scale-95' />
                    <p className='text-[8px] opacity-60 hover:opacity-100'>My Uploads</p>
                </a>


                <div className='flex px-5 gap-1 '>
                    <div className='w-10 h-10 flex items-center justify-center '>
                        <img onError={(e) => (e.target as HTMLImageElement).src = "/person.png"} className='w-full h-full object-contain rounded-full ' src={user?.photoURL || "/person.png"} alt="" />
                    </div>

                    <div className='flex flex-col  '>

                        <p className='text-xs sm:text-sm  '>{user?.displayName}</p>
                        <p className='text-xs hover:text-red-500 cursor-pointer active:scale-75 ' onClick={() => signOut(auth)}>sign out</p>


                    </div>

                </div>



               {isUserRegistred &&
                <div onClick={() => setOpenUploadForm(true)} className='p-2 bg-blue-500 cursor-pointer text-white rounded-xl text-sm active:scale-75'>Upload</div>

               }

            </div>






            {/* menu items */}
            {mobileMenu &&
            <div className='absolute right-0 rounded-lg bg-white top-0 z-15 p-4 flex flex-col gap-2'>

                <div onClick={()=>setMobileMenu(!mobileMenu)} className='w-full text-end  '>x</div>
                <div className='flex flex-col gap-5 text-xs'>
                    {/* profile */}
                    <div className='bg-blue-100 p-2 px-4 rounded-xl'>
                        <h1 className='font-semibold'>{user?.displayName}</h1>
                        <h1 className='text-gray-500'>{user?.email}</h1>
                    </div>

                    <div className='p-2 flex flex-col gap-5'>
                        <div onClick={() => setOpenUploadForm(true)} className='flex gap-1 border-b py-2 border-gray-300'>
                            <Upload size={15} />
                            <p>Upload</p>

                        </div>

                        <a href='/liked' target='_blank'className='flex gap-1 border-b py-2 border-gray-300'>
                            <Heart size={15} />
                            <p>Liked</p>

                        </a>
                        <a href='/myuploads' target='_blank'className='flex gap-1 border-b py-2 border-gray-300'>
                            <UploadCloud size={15} />
                            <p>My Uploads</p>

                        </a>
                        <div onClick={() => {signOut(auth); setMobileMenu(false)}} className='flex gap-1 text-red-800 py-2 border-gray-300'>
                            <LogOut size={15} />
                            <p>SignOut</p>

                        </div>



                    </div>


                </div>



            </div>
            
            }



           




            {/* Upload form */}
            {openUploadForm && user && (<UploadForm manageUploadForm={manageUploadForm} />)}

            {/* sign in  */}
            {!user && <SignIn />}




        </div>
    )
}

export default Navbar
