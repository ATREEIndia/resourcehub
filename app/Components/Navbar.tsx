'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import UploadForm from './UploadForm'
import SignIn from './SignIn'
import { useMyContext } from '../Context/MyContext'
import { signOut } from 'firebase/auth'
import { auth } from './MyFirebase'
import Link from 'next/link'
import { Heart } from 'lucide-react'

const Navbar = () => {

    const { user } = useMyContext()

    const [openUploadForm, setOpenUploadForm] = useState(false)

    const manageUploadForm = () => {
        setOpenUploadForm(!openUploadForm)
    }



    return (
        <div className='w-full h-20 shadow-lg flex items-center  px-4 justify-between select-none'>
            {/* logo */}
            <Link href="/" aria-label="Go to Homepage">
                <Image
                    src="/logo.png"
                    alt="resourcHub" // Replace with actual name for SEO
                    width={150}
                    height={150}
                    className="object-contain"
                    priority // Ensures the logo loads immediately as a key branding element
                    unoptimized // Necessary if using external hosting or specific static exports
                />
            </Link>


            <div className='flex items-center gap-2'>
                <a href='/liked' target='_blank' className='cursor-pointer'>
                    <Heart />
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




                <div onClick={() => setOpenUploadForm(true)} className='p-2 bg-blue-500 cursor-pointer text-white rounded-xl text-sm active:scale-75'>Upload</div>

            </div>


            {/* Upload form */}
            {openUploadForm && user && (<UploadForm manageUploadForm={manageUploadForm} />)}

            {/* sign in  */}
            {!user && <SignIn />}




        </div>
    )
}

export default Navbar
