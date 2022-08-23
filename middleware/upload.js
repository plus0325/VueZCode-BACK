// 需要靠cloudinary
// 使用者需要經過驗證，才能上傳和刪除照片 — 透過 auth.jwt Middleware 驗證後，含有用戶資訊的物件，將被儲存在 req.user上供後續使用
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
// Multer 是由推出 Express 的同一間公司所提供的第三方套件，專門用來處理文件上傳到伺服器
// https://www.npmjs.com/package/multer
import multer from 'multer'

// ---------------------------------
// 帶入cloudinary的環境變數(.env帳密)
// ---------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

// ---------------------------------
// multer 套件設定
// ---------------------------------
const upload = multer({
  // 指定上傳的檔案儲存到 cloudinary
  storage: new CloudinaryStorage({ cloudinary }),
  // 限制接受的上傳格式：fileFilter
  // 選項有一個函式，用來篩選符合條件的上傳檔案，接受三個參數：(request物件、帶有上傳檔案資訊的file物件、篩選完成後呼叫的cb 函式)。
  fileFilter (req, file, callback) {
    // 建立篩選條件＆邏輯判斷
    // 假如上傳的檔案格式不是圖片 回錯誤訊息
    // 網際網路媒體型式.mimetype
    // startsWith起始是不是以"image"，回傳blooean型態
    if (!file.mimetype.startsWith('image')) {
      // 若不接受該檔案：呼叫時帶入 false 並輸出錯誤訊息
      callback(new multer.MulterError('LIMIT_FORMAT'), false)
    } else {
      // 若接受該檔案：呼叫時帶入 true
      callback(null, true)
    }
  },
  // 限制 (fileSize檔案大小為 1MB)
  limits: {
    fileSize: 1024 * 1024
  }
})

// ---------------------------------
// 處理接收到的圖片執行發出requet
// ---------------------------------
export default async (req, res, next) => {
  // Error handling
  // http://expressjs.com/en/resources/middleware/multer.html
  // callback [ async (error)非同步錯誤]
  // 在路由中接收上傳檔案
  // .single(fieldname)接收來自名為 fieldname 欄位的「單一」上傳檔案，並將檔案資訊存放在 req.file
  // upload.single('image') 是一個function
  const uploadDate = upload.single('image')
  uploadDate(req, res, async function (error) {
    // 如果是 multer 的上傳錯誤
    if (error instanceof multer.MulterError) {
      let message = '上傳失敗'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FORMAT') {
        message = '檔案格式錯誤'
      } else {
        return res.status(400).send({ success: false, message: '' })
      }
    } else if (error) {
      // 其他錯誤
      return res.status(500).send({ success: false, message: '伺服器錯誤' })
    } else {
      next()
      // 這邊會得到req.file(給controller/products.js用)
    }
  })

  /* 老師縮寫成:
  upload.single('image')(req, res, async (error) => {
    // 如果是 multer 的上傳錯誤
    if (error instanceof multer.MulterError) {
      let message = '上傳失敗'
      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案太大'
      } else if (error.code === 'LIMIT_FORMAT') {
        message = '檔案格式錯誤'
      } else {
        return res.status(400).send({ success: false, message: '' })
      }
    } else if (error) {
      // 其他錯誤
      return res.status(500).send({ success: false, message: '伺服器錯誤' })
    } else {
      next()
    }
  })
  */
}

/*
麥克的半路出家筆記/筆記-使用-multer-實作大頭貼上傳-ee5bf1683113
https://medium.com/%E9%BA%A5%E5%85%8B%E7%9A%84%E5%8D%8A%E8%B7%AF%E5%87%BA%E5%AE%B6%E7%AD%86%E8%A8%98/%E7%AD%86%E8%A8%98-%E4%BD%BF%E7%94%A8-multer-%E5%AF%A6%E4%BD%9C%E5%A4%A7%E9%A0%AD%E8%B2%BC%E4%B8%8A%E5%82%B3-ee5bf1683113

*/
/*

function aaa () {
  return funtiocn(bb) {
    console.log(bb)
  }
}

function aaa () {
  return funtiocn(123) {
    console.log(123)
  }
}

aaa()(123)
123

*/
