import express from "express";
import cors from "cors";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from 'fs/promises'; 
import bodyParser from "body-parser";
import dotenv from 'dotenv';


dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow every origin
app.use(bodyParser.urlencoded({ extended: false }));

const uploadDir = './uploads';

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const title = req.body.title || 'default-title'; 
        const suffix=`_${Date.now()}_`
        cb(null, title+ suffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

async function putobj(key, content_type, filetype) {
    let bucketName = '';
    if(filetype === "Thumbnail") {
        let k1=key.substring(0,key.indexOf("_"))
        let k2=key.substring(key.lastIndexOf("_")+1,key.length)
        key=(k1+k2)
        bucketName = process.env.S3_THUMBNAILBUCKET_NAME;
    } else if(filetype === "Video") {
        let k1=key.substring(0,key.indexOf("_"))
        let k2=key.substring(key.lastIndexOf("_")+1,key.length)
        key=(k1+k2)
        bucketName = process.env.S3_VIDEOBUCKET_NAME;
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: content_type
    });
    
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
}

async function uploader(files) {
    for (const fileData of files) {
        try {
            const filetype = fileData.fieldname;
            const data = await fs.readFile(fileData.path);
            const url = await putobj(`${fileData.filename}`, fileData.mimetype, filetype);

            try {
                await axios.put(url, data);
                await fs.unlink(fileData.path);
            } catch (error) {
                console.error(`Error occurred while uploading file ${fileData.originalname}:`, error);
            }
        } catch (fileError) {
            console.error(`Error occurred while handling file ${fileData.originalname}:`, fileError);
        }
    }
}

async function getobj(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
}

async function objectgetter(key) {
    try {
        const link = await getobj(key);
        return link;
    } catch (error) {
        console.error("Error getting object:", error);
        throw error;
    }
}

async function getobjectlist() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_VIDEOBUCKET_NAME,
        });
        const list = await client.send(command);
        return list.Contents;
    } catch (error) {
        console.error("Error getting object list:", error);
        throw error;
    }
}

app.post('/api/upload', upload.fields([{ name: 'Video' }, { name: 'Thumbnail' }]), async (req, res) => {
    if (!req.files) {
        return res.status(400).send({ message: 'No files were uploaded.' });
    }

    try {
        await uploader(req.files.Video || []);
        await uploader(req.files.Thumbnail || []);
        res.send({ message: 'Files uploaded successfully!', files: req.files });
    } catch (error) {
        res.status(500).send({ message: 'Error uploading files', error: error.message });
    }
});

app.post("/api/getObject", async (req, res) => {
    const key = req.headers.url;
    try {
        const link = await objectgetter(key);
        res.send(link);
    } catch (error) {
        res.status(500).send("Error getting object");
    }
});

app.post("/api/getThumbnail", async (req, res) => {
    const key = req.headers.url;
    try {
        const link = await getThumbnail(key);
        res.send(link);
    } catch (error) {
        res.status(500).send("Error getting object");
    }
});

app.post("/api/streamObject", async (req, res) => {
    const key = req.headers.url;
    try {
        const link = await objectgetter(key);
        res.send(link);
    } catch (error) {
        res.status(500).send("Error streaming object");
    }
});

app.get("/api/objectlist", async (req, res) => {
    try {
        const objlist = await getobjectlist();
        res.send(objlist);
    } catch (error) {
        res.status(500).send("Error getting object list");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(dirname, 'test.html'));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});