import mongoose from 'mongoose'
// import validator from 'validator'

// const ordertSchema = new mongoose.Schema()
const schema = new mongoose.Schema({
  // 這筆訂單的使用者_ID
  user: {
    type: mongoose.ObjectId,
    // schema資料來源:models/users
    ref: 'users'
    // required: [true, '缺少使用者欄位']
  },
  // 這筆訂單所購買商品們的資料
  products: [
    {
      // 個別商品_id
      product: {
        type: mongoose.ObjectId,
        // schema資料來源:models/products
        ref: 'products',
        required: [true, '缺少商品欄位']
      },
      // 個別商品的數量
      quantity: {
        type: Number,
        required: [true, '缺少數量欄位']
      }

    }
  ],
  // 訂單日期
  date: {
    type: Date,
    // 當下的時間
    default: Date.now()
  },
  // 訂單狀況
  tone: {

    // 0 = 確認訂單中
    // 1 = 出貨中
    // 2 = 訂單完成
    type: Number,
    //  預設是(確認中)
    default: 0
  }
  // category: {
  //   type: String,
  //   enum: {
  //     values: ['訂單確認中', '出貨中', '訂單完成'],
  //     message: '訂單狀況錯誤'
  //   }

}, { versionKey: false })

// export default mongoose.model('orders', orderSchema)
export default mongoose.model('orders', schema)
