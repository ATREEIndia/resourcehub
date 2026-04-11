
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
    
    uploadProgress?:number,
    compressStatus?:string,

}