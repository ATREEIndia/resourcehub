import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

type postProbs = {
    fileName: string,
    fileMimeType: string,
    folderName: string
}

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const myS3Client = new S3Client(
    {
        region: AWS_REGION as string,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
        }
    }
)

export async function POST(request: NextRequest) {
    try {
        const { fileName, fileMimeType, folderName }: postProbs = await request.json();
        const folder = `assets/${folderName}/raw`
        const key = `${folder}/${fileName}`

        const command = new PutObjectCommand({
            Key: key,
            Bucket: AWS_S3_BUCKET_NAME,
            ContentType: fileMimeType
        })

        //get presigned url
        const signdUrl = await getSignedUrl(myS3Client, command, { expiresIn: 600 })

        const s3Url = `https://digispace-atree.s3.ap-south-1.amazonaws.com/${key}`
        let previewUrl = `https://digispace-atree.s3.ap-south-1.amazonaws.com/${key}`
        if (folderName == 'videos') {
            previewUrl = `https://digispace-atree.s3.ap-south-1.amazonaws.com/assets/${folderName}/preview/${fileName}.mp4`

        }


        return NextResponse.json(
            {
                signedUrl: signdUrl,
                s3Url: s3Url,
                previewUrl: previewUrl
            }
        )


    } catch (e) {
        console.log('error ' + e)
        return NextResponse.json({
            error: e
        })
    }


}