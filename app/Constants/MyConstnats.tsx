
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