import mongoose from 'mongoose'
import validator from 'validator'

// const userSchema = new mongoose.Schema()
const schema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: [true, '缺少帳號欄位'],
      minlength: [4, '帳號必須4個字以上'],
      maxlength: [20, '帳號必須20個字以下'],
      unique: true,
      match: [/^[A-Za-z0-9]+$/, '帳號格式錯誤']
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator (email) {
          return validator.isEmail(email)
        },
        message: '信箱格式錯誤'
      }
    },
    tokens: {
      type: [String]
    },
    cart: {
      type: [
        {
          product: {
            // models/products.js裡面的 單筆商品資料_id
            type: mongoose.ObjectId,
            ref: 'products',
            required: [true, '缺少商品欄位']
          },
          quantity: {
            type: Number,
            required: [true, '缺少數量欄位']
          }
        }
      ]
    },
    // 職權身分類別
    // role: {
    //   // 0 = 使用者
    //   // 1 = 管理員
    //   type: Number,
    //   //  預設是使用者
    //   default: 0
    // }
    role: {
      // false = 使用者
      // true = 管理員
      type: Boolean,
      //  預設是使用者
      default: false
    }
  },
  {
    versionkey: false
  }
)

// export default mongoose.model('users', userSchema)
export default mongoose.model('users', schema)
