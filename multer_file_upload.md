# Multer File Upload Flow in Express.js

## 1. What is Multer?
Multer is a Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files.  
It works with Express.js and helps store uploaded files either in memory or on disk.

---

## 2. Key Concepts in Multer

### (a) Storage Engine
Multer needs to know **where** and **how** to store files.  
We configure this using `multer.diskStorage()`.

```js
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp') // save files to ./public/temp
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // keep original filename
  }
})
```

- **destination** → tells Multer the folder to put files in.  
- **filename** → decides the final name of the file on disk.

---

### (b) Upload Middleware
We pass the `storage` engine into Multer.

```js
export const upload = multer({ storage });
```

Now `upload` can be used inside routes to handle file uploads.

---

### (c) Form Field
To upload a file, the client must send a form field with **type="file"**.  
Example (HTML):

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar" />
  <button type="submit">Upload</button>
</form>
```

- `enctype="multipart/form-data"` → required for sending files.  
- `name="avatar"` → matches the field name in Multer.

---

### (d) Why `req` is important
Multer attaches the uploaded file info to the request object:

- `req.file` → contains metadata about a **single uploaded file** (when using `upload.single('avatar')`).  
- `req.files` → contains an array when multiple files are uploaded.  
- `req.body` → still exists, but only for **text fields**, not the file itself.

The file is never stored in `req.body`.  
Instead, Multer parses the file, saves it, and attaches **metadata** (path, filename, size, mimetype, etc.) to `req.file`.

---

## 3. Simulating File Upload

### Express Route Example
```js
import express from "express";
import { upload } from "./multerConfig.js";

const app = express();

app.post("/upload", upload.single("avatar"), (req, res) => {
  console.log("Form fields:", req.body); // text fields
  console.log("File metadata:", req.file); // file info
  res.send("File uploaded successfully!");
});
```

---

## 4. Dry Run (Step-by-Step)

1. **User selects a file in the form**  
   - Browser prepares the form data with text fields + the selected file.  
   - Because of `enctype="multipart/form-data"`, the request can carry files.

2. **Request sent to server (`/upload`)**  
   - Express receives the request.  
   - Multer intercepts the request before it reaches the route handler.

3. **Multer processes file**  
   - Reads the incoming `multipart/form-data`.  
   - Extracts the file from the request.  
   - Saves it to `./public/temp` (based on our storage config).  
   - Attaches file metadata to `req.file`.

4. **Route handler executes**  
   - Can access `req.file` (metadata like filename, path, mimetype).  
   - Can access `req.body` (other text inputs).  
   - Sends response to client.

5. **File is now stored**  
   - Physical file exists in `./public/temp/filename.ext`.  
   - Server has metadata in `req.file`.  
   - Client sees `"File uploaded successfully!"`.

---

## 5. Summary
- Multer handles `multipart/form-data`.  
- Storage engine defines **where/how** files are stored.  
- `req.file` / `req.files` hold file metadata.  
- `req.body` holds text fields, not files.  
- Upload flow = *Form → Request → Multer → Disk → req.file → Route Handler*.
## Body
## Example of `req.file` Metadata

```json
{
  "fieldname": "myfile",           // name of the form field
  "originalname": "photo.png",     // file’s name on user's computer
  "encoding": "7bit",              // how the file was transmitted
  "mimetype": "image/png",         // file type (MIME)
  "destination": "./public/temp",  // folder chosen by storage config
  "filename": "photo.png",         // final name Multer saved
  "path": "public/temp/photo.png", // full path on server
  "size": 12345                    // file size in bytes
}
