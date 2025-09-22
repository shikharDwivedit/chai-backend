import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {       //cb = callback
    cb(null, './public/temp')                   // looking for destination
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname)                 // looking for name
  }
})

export const upload = multer({ storage})