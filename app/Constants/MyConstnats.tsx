
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

export const commonDataList = [
    "forests and governance",
    "climate change and mitigation",
    "landscapes and livelihoods",
    "restoration ecology",
    "himalaya",
    "Agasthyamalai Community Conservation Centre (ACCC)",
    "BR Hills Community Conservation Centre",
    "MM Hills Community Conservation Centre",
    "Vembanad Community Environmental Resource Centre (CERC)",
    "Eastern Himalayas Centre",

    "urban resilience and green cover",
    "water and food security",
    "ecosystem services and human well-being",
    "invasive alien species management",
    "human-wildlife coexistence",
    "hydrology and water resources",
    "nature-based solutions",
    "sustainable agriculture and agroecosystems",
    "open natural ecosystems and savannahs",

    "Centre for Policy Design",
    


];

export const locationIqAPI="https://us1.locationiq.com/v1/reverse?key=pk.ee92134ad8353c346b5cf44c13244650&"