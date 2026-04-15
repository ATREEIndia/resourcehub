
export type fileProb={
    id:string,
    file:File,
    localUrl:string,
    s3Url:string,
    previewUrl:string,
    fileType:string
    uploadedBy:string,
    m_Tags:string[],
    ai_Tags:string[],
    credits:string,
    collections:string,
    location:string,
    uploadProgress?:number,
    compressStatus?:string,
    exifTimestamp?:string,
    exifLocation?:string,
    exifLocationName?:string,

}

export const commonDataList=[
    'Biodiveristy',
    'Exploration'
]

export const locationIqAPI="https://us1.locationiq.com/v1/reverse?key=pk.ee92134ad8353c346b5cf44c13244650&"