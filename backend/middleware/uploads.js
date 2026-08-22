import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

console.log("UPLOAD DIRECTORY:", uploadDir);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads directory");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Saving file to:", uploadDir);
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        const filename =
            uniqueName + path.extname(file.originalname);

        console.log("Uploading:", filename);

        cb(null, filename);
    }
});

const uploads = multer({
    storage
});

export default uploads;