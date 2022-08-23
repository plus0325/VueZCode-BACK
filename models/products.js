import mongoose from 'mongoose'
// import validator from 'validator'
// const productSchema = new mongoose.Schema()
const schema = new mongoose.Schema({
  // 商品名稱
  name: {
    type: String,
    required: [true, '缺少名稱欄位']
  },
  // 商品價格
  price: {
    type: Number,
    min: [0, '價格格式錯誤'],
    required: [true, '缺少價格欄位']
  },
  // 商品描述
  description: {
    type: String
  },
  // 商品圖片
  image: {
    type: String
  },
  // 是否上架
  sell: {
    type: Boolean,
    // 預設上架
    default: false
  },
  // 分類 (這邊是寫死固定，如果想要動態修改要另外寫個models for category )
  category: {
    type: String,
    required: [true, '缺少分類欄位'],
    enum: {
      values: ['衣服', '其他'],
      message: '商品分類錯誤'
    }
  }
}, { versionKey: false })

// export default mongoose.model('products', productSchema)
export default mongoose.model('products', schema)
