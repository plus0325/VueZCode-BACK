// 套件 全域集中管理區 ------------------------------------
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
// express-mongo-sanitize 防止查詢選擇器注入攻擊
import mongoSanitize from 'express-mongo-sanitize'
// express-rate-limit 防止來限制來自同一IP的重複請求
import rateLimit from 'express-rate-limit'

import './passport/passport.js'

// 路由 全域集中管理區  -------------------------------------------------
import usersRouter from './routes/users.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'

// mongoose 全域集中管理區  ----------------------------------------------------
// 連接的mongoose資料庫(資料夾網址DB_URL)
mongoose.connect(process.env.DB_URL)
// Mongoose.prototype.sanitizeFilter()
// Sanitizes query filters against query selector injection attacks by wrapping any nested objects that have a property whose name starts with $ in a $eq.
// https://mongoosejs.com/docs/api/mongoose.html#mongoose_Mongoose-sanitizeFilter
// 防止防止查詢選擇器注入攻擊(方法一)
mongoose.set('sanitizeFilter', true)

const app = express()

// ----------------------------------------------------------------------
// express-rate-limit (限制來自同一IP的重複請求)  [[太多請求]]
// ----------------------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler (req, res, next, options) {
    res.status(429).send({ success: false, message: '太多請求' })
  }
})
app.use(limiter)

// middleware ( 順序為 cors > app.use(express.json()) > app.use(mongoSanitize()) )

// ----------------------------------------------------------------------
// cors (設定跨域請求是否允許) import cors from 'cors' (middleware) (順序有差)
// ----------------------------------------------------------------------
app.use(cors({
  // 後端請求
  // origin代表進來的東西, callbackg是決定要不要讓他過關
  // undefined 是指類似POSTMEN的後端測試()
  origin (origin, callback) {
    if (origin === undefined || origin.includes('github') || origin.includes('localhost')) {
      // callback(null(沒有放錯誤), true(過關))
      callback(null, true)
    } else {
      // 不允許
      callback(new Error('Not Allowed'), false)
    }
  }
}))
// cors的如果接callback(new Error('Not Allowed'), false)，要回應訊息如下 [[請求被拒絕]]
app.use((_, req, res, next) => {
  res.status(404).send({
    success: false,
    message: '請求被拒絕'
  })
})

// ----------------------------------------------------------------------
// express(express.json()) 資料格式驗證  (middleware) (順序有差)
// ----------------------------------------------------------------------
app.use(express.json())
// 錯誤訊息忽略 app.use(err, req, res, next) [[請求格式錯誤]]
app.use((_, req, res, next) => {
  res.status(404).send({
    success: false,
    message: '請求格式錯誤'
  })
})

// ----------------------------------------------------------------------
// express-mongo-sanitize 防止防止查詢選擇器注入攻擊(方法2) (middleware) (順序有差)
// ----------------------------------------------------------------------
app.use(mongoSanitize())

// ----------------------------------------------------------------------
//  usersRouter(使用者路由)
// ----------------------------------------------------------------------
app.use('/users', usersRouter)
// ----------------------------------------------------------------------
//  productsRouter(商品路由)
// ----------------------------------------------------------------------
app.use('/products', productsRouter)
// ----------------------------------------------------------------------
//  ordersRouter(訂單路由)
// ----------------------------------------------------------------------
app.use('/orders', ordersRouter)

// ----------------------------------------------------------------------
//  all 的統一回應
// ----------------------------------------------------------------------
app.all('*', (req, res) => {
  res.status(404).send({
    success: false,
    message: '找不到'
  })
})

// ----------------------------------------------------------------------
// 伺服器監聽 http://localhost:4000
// ----------------------------------------------------------------------
app.listen(process.env.PORT || 4000, () => {
  console.log('Server is running 後端開好了!')
})
