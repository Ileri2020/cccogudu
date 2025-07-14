import React from 'react'
import Image from "next/image"
import Link from "next/link"

const Footer2 = () => {
  return (
<footer className="text-gray-600 body-font">
  <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
    <a className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
       <Image alt='' width={40} height={40} src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC6ElEQVR4Ae1WA4xkQRCd3TPXOzjbtm3bd8HZtu3B2Wacu+Bs20Z0tv2uKhlW/v/bu/nxdvJ2Z6Zfd79CV7UleCQPuxtlbC7M9cHqxsy8HqRRWutCdZsTG2ndQ8IPwjebG9d5H8ciZLMobjKMFiAYDjeyG61xrEJ64u0kwADfCP3NFzAVKYlzmABFjDFVAIVorJenij/xLhQ3R8AqpKL514L/heI+2rYY5a1OdKLvFzVEbDJFgMOJKpJrdaF5iIcWIAMnpeC9NEUAWdpDcN9o8lyYLPeMW4aM2jF1YXBSBdiduKrJc6Kf3JPywGrRUTtQXQAaC+7HrIuRTvIoF1YJ3i+6PeHqApagoBY32oPMNP87xAsurLUAYT4OJyPXAMHZz3PKApKAC4T5dNB2+v9TzlO1bWW2gJ/KXDf28jlmC+hOeK7AOxw7D5mMBTgxINECPChMiCPXzra68F7D6nt8E7hsWxIanPG0qB1XMVp4XO9QOugkoQPHM+cGpLUuQS6ucDLhvLhD+dBLZL7+iJqLCFp0WsH6PWwVbd6Ar6BK/MU11RhAGJGPKLvfiV1c/5X5sg8olFfGTe56hEH0+YzI/j8a/N/klfv8KNEMnwcVdQVwbMWCI0WmInVwB6S4H+CXD+VLVZr/J4tM7BI4mMrupt9WSAFkyFajx8WvkJrtRCWe4k35MREMOmyb2PwT50/InruRgoy6IsL2VPN8PkS60me9fTGqKcT3oM7VXiD31eKxy6Llpl6LVAUc0ilucwXvu1ElfCVi2stbH6oqCPjCBUmENZx+vyZ7hVESbhHkd5Q0dTgUDidKkzub0G+PDe76cV/75kcHJewajSScqSsgixMlZYv14i7hkmLj+cuJpnMNPzkWIjahWjBJsaj84jcg8c+pvohFK9YfdicmSE9IS8jKtszNvhxR9H13Aoe/8B6uPrjLcSHhbuYtt58JFzmGsU7YNZ5etb2PkIde/jMuWlxBWaTeOcnjP2WAxQeRmBSZAAAAAElFTkSuQmCC' />
      <Link href='/'><span className="cursor-pointer font-bold ml-3 text-xl">Harshit Kumar</span></Link>
    </a>
    <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 font-semibold  sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
    </p>
    <span className='inline-flex sm:ml-auto sm:mt-0 mt-2 font-semibold text-xl justify-center sm:justify-start'>Created with 💖 by <span className='hover:bg-blue-500 hover:text-white hover:scale-105 hover:-rotate-3 transition-all duration-300 rounded-lg cursor-pointer'>&nbsp;Harshit Kumar&nbsp;</span></span>
    <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
      <a className="text-gray-500 cursor-pointer hover:text-blue-900">
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
        </svg>
      </a>
      <a className="ml-3 cursor-pointer hover:text-cyan-400 text-gray-500">
        <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
        </svg>
      </a>
      <a className="ml-3 cursor-pointer hover:text-pink-600 text-gray-500">
        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
        </svg>
      </a>
      <a className="ml-3 cursor-pointer hover:text-indigo-900 text-gray-500">
        <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
          <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
          <circle cx="4" cy="4" r="2" stroke="none"></circle>
        </svg>
      </a>
    </span>
  </div>
</footer>
  )
}

export default Footer2
