import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from './MyFirebase'
import { useMyContext } from '../Context/MyContext'
import { divide } from 'firebase/firestore/pipelines'
import Lottie from 'lottie-react'
import lottieSignin from '@/public/lottieSignin.json'
import Image from 'next/image'

const SignIn = () => {
    const { user, loading } = useMyContext()


    const handleSignin = async () => {
        if (loading) {
            return
        }
        try {
            const result = signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.log(error)

        }
    }

    return (
        <div className='inset-0 fixed w-full h-full bg-gray-100 flex items-center justify-center z-15'>

            {loading &&
                <div className=''>
                    verifying User
                </div>

            }


            {!loading &&

                <div className='flex w-full max-w-4xl overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-2xl'>

                    {/* Left Side: Lottie Animation (Hidden on small screens for better UX) */}
                    <div className='hidden w-1/2 bg-gray-50 md:flex items-center justify-center p-8'>
                        <div className='w-full max-w-[300px]'>
                            <Lottie animationData={lottieSignin} loop={true} />
                        </div>
                    </div>

                    {/* Right Side: Sign In Content */}
                    <div className='flex flex-col justify-center flex-1 p-8 lg:p-12'>

                        {/* Logo Container */}
                        <div className='relative w-32 h-12 mb-8'>
                            <Image
                                className='object-contain object-left'
                                alt='ATREE Logo'
                                fill
                                src={'/logo.png'}
                            />
                        </div>

                        {/* Text Content */}
                        <div className='mb-8'>
                            <h1 className='text-2xl font-bold text-gray-800 tracking-tight'>
                                Welcome back
                            </h1>
                            <p className='text-gray-500 mt-2 text-sm'>
                                Please sign in with your ATREE Email ID to continue to the Resource Hub.
                            </p>
                        </div>

                        {/* Custom Sign-In Button */}
                        <button
                            onClick={handleSignin}
                            className='flex cursor-pointer items-center justify-center gap-3 w-full py-3 px-4 text-gray-700 font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-[0.98] shadow-sm'
                        >
                            {/* You can add a Google Icon here if applicable */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        {/* Footer info */}
                        <div className='mt-8'>
                            <p className=' text-center text-xs text-gray-400'>
                                Developed by ATREE Communications.
                            </p>

                            <p className=' text-center text-xs text-gray-400'>
                                © 2026 ATREE Resource Hub. All rights reserved.
                            </p>

                            
                        </div>
                    </div>
                </div>


            }



        </div>
    )
}

export default SignIn
