import React from 'react'

const Footer = () => {
  return (
    <div className='w-full p-4 select-none bg-blue-500 text-white flex flex-col items-center justify-around text-xs'>
        <h1>Developed by ATREE Communications</h1>
        <h1>©{new Date().getFullYear()} All rights reserved</h1>
      
    </div>
  )
}

export default Footer
