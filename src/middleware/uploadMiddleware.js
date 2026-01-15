import multer from "multer";
import path from "path";
import fs from "fs";

const __dirname = new URL(".", import.meta.url).pathname;

// Absolute path inside container
const UPLOAD_DIR = path.join("/app/uploads/documents");

// 1️⃣ Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 2️⃣ Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// 3️⃣ File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }

  cb(null, true);
};

// 4️⃣ Upload middleware
const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default uploadDocument;
