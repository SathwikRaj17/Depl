import express from "express";
import cors from "cors";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from 'fs';
import bodyParser from "body-parser";
import dotenv from 'dotenv';


dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow every origin
app.use(bodyParser.urlencoded({ extended: false }));

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

async function putobj(key, content_type) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: content_type
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
}

async function uploader(fileData) {
    const data = fs.readFileSync(fileData.path);
    const url = await putobj(`${Date.now()}${fileData.originalname}`, fileData.mimetype);
    try {
        await axios.put(url, data);
        fs.unlinkSync(fileData.path);
    } catch (error) {
        console.error("Error Occurred while uploading file:", error);
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
            Bucket: process.env.S3_BUCKET_NAME,
        });
        const list = await client.send(command);
        return list.Contents;
    } catch (error) {
        console.error("Error getting object list:", error);
        throw error;
    }
}

app.post("/upload", upload.single('upload_file'), async (req, res) => {
    try {
        await uploader(req.file);
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error uploading file");
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