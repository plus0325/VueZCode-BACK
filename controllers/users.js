// controllers 拿 資料庫models/users.js 建立的資料 來操作funstion
// controllers 這邊建立好的工具會提供給route/users.js使用(通過各個mideelware然後取得這邊弄出來的req)
import users from '../models/users.js'
import products from '../models/products.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// ---------------------------------------------------------------------
// register 會員註冊
// [最後關卡]：router.post('/', content('application/json'), register)
// ---------------------------------------------------------------------
export const register = async (req, res) => {
  // 先資料格式驗證 ----------------------------
  // 傳送資料的格式必須為Header tab 與 Body tab 內的 Content-type 是否一致
  // application/json ： JSON數據格式
  // 如果API的請求沒有任何類型內容格式，或這個請求沒有包含json格式
  // Request Header 客戶端要求伺服器時傳送(req.headers)

  // if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
  //   return res.status(400).send({ success: false, message: '資料格式錯誤' })
  // }

  // 原本這要套用資料格式驗證。
  // 老師將他拉出去單一來套入(讓其他人也可以用)，不然每個如果需要資料格式驗證時都要這行code
  // 需要資料格式內容驗證(在路由的時候會先執行middleware/content.js)
  // ------------------------------------------

  // 驗證註冊密碼欄位 --------------------------------
  // 少了那些，伺服器判斷後會回傳的錯誤訊息
  // req.body.password(是使用者在視窗前輸入的內容要求給資料????)
  const password = req.body.password
  // 使用者沒有輸入密碼的話
  if (!password) {
    return res.status(400).send({ success: false, message: '缺少密碼欄位' })
  }
  // 使用者輸入的密碼長度小於4個字
  if (password.length < 4) {
    return res.status(400).send({ success: false, message: '密碼必須4個字以上' })
  }
  // 使用者輸入的密碼長度超過20個字
  if (password.length > 20) {
    return res.status(400).send({ success: false, message: '密碼必須20個字以下' })
  }
  // 使用者輸入的密碼內容不符合一個字以上的英文大小寫和0-9的數字的組合內容
  if (!password.match(/^[A-Za-z0-9]+$/)) {
    return res.status(400).send({ success: false, message: '密碼格式錯誤' })
  }
  // 以上都OK過關的話。將使用者剛申請的密碼內容用bcrypt來加密顯示
  req.body.password = bcrypt.hashSync(password, 10)
  try {
    await users.create(req.body)
    return res.status(200).send({ success: true, message: '' })
  } catch (error) {
    // console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const messageError = error.errors[key].message
      return res.status(400).send({ success: false, message: messageError })
    } else if (error.name === 'MongServerError' && error.code === 11000) {
      return res.status(400).send({ success: false, message: '帳號已存在' })
    } else {
      return res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

// ---------------------------------------------------------------------
// login 會員登入
// [最後關卡]：router.post('/login', content('application/json'), auth.login, login)
// ---------------------------------------------------------------------
export const login = async (req, res) => {
  // 需要資料格式內容驗證(在路由的時候會先執行middleware/content.js)
  try {
    // 產生 JWT
    const token = jwt.sign(
      // req.user (來自auth.login處理好的req.user資料)
      { _id: req.user._id },
      // token加密驗證KEY
      process.env.JWT_SECRET,
      // token保存期限
      { expiresIn: '7 day' }
    )
    // 將新產出token放入使用者的tokens內容
    req.user.tokens.push(token)
    await req.user.save()
    // 登入成功回傳資料給前台使用
    return res.status(200).send({
      success: true,
      message: '',
      result: {
        // token
        token,
        // 帳號
        account: req.user.account,
        // 信箱
        email: req.user.email,
        // 購物車的長度
        cart: req.user.cart.length,
        // 身分別(權力)
        role: req.user.role
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// logout 會員登出
// [最後關卡]：router.post('/login', content('application/json'), auth.login, login)
// ---------------------------------------------------------------------
export const logout = async (req, res) => {
  try {
    // 將這次請求的 JWT 從使用者資料移除 (登出時，將使用著原本登入提供token也移除)
    // 登出的運作方式就是將當次的 Token 從使用者資料中 tokens 欄位刪除
    // 將當前的 Token 從使用者 Tokens 欄位資料中篩掉，並存回資料庫當中。
    // 篩選掉當前的 Token
    req.user.tokens = req.user.tokens.filter((token) => {
      return token !== req.token
    })
    // 將包含剩餘 Token 的使用者資料存回資料庫
    await req.user.save()
    return res.status(200).send({ success: true, message: '' })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// extend 延續 token 使用時間(舊換新)
// [最後關卡]：router.post('/extend', auth.jwt, extend)
// ---------------------------------------------------------------------
export const extend = async (req, res) => {
  try {
    // 找出舊的token(找所有的註冊後的使用者的tokens有符合目前的token)的位置
    const idx = req.user.tokens.findIndex(token => token === req.token)
    // 產生 JWT
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    const token = jwt.sign(
      // payload --> req.user (來自auth.login處理好的req.user資料)
      { _id: req.user._id },
      // secretOrPrivateKey: token加密驗證KEY
      process.env.JWT_SECRET,
      // expiresIn：設定 Token 多久後會過期（自動在 Payload 新增 exp）
      { expiresIn: '7 day' }
    )
    // 找出來的舊token變成新tokem(舊換新)
    req.user.tokens[idx] = token
    // 存檔
    await req.user.save()
    return res.status(200).send({ success: true, message: '', result: token })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getUser 取得使用者資料
// [最後關卡]：router.get('/', auth.jwt, getUser)
// ---------------------------------------------------------------------
export const getUser = async (req, res) => {
  try {
    return res.status(200).send({
      success: true,
      message: '',
      result: {
        // 帳號
        account: req.user.account,
        // 信箱
        email: req.user.email,
        // 購物車的長度
        cart: req.user.cart.length,
        // 身分別(權力)
        role: req.user.role
      }
    })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getAllUser  取得所有使用者資料
// [最後關卡]：router.get('/all', auth.jwt, admin, getAllUser)
// ---------------------------------------------------------------------
export const getAllUser = async (req, res) => {
  try {
    const result = await users.find()
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getUser 刪除使用者資料
// [最後關卡]：router.delete('/:id', auth.jwt, admin, getDelUser)
// ---------------------------------------------------------------------
export const getDelUser = async (req, res) => {
  try {
    const result = await users.findByIdAndDelete(req.params.id)
    res.status(200).send({ success: true, message: '刪除帳號成功', result })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// editAllUser 編輯使用者資料
// [最後關卡]：router.patch('/:id', auth.jwt, admin, editAllUser)
// ---------------------------------------------------------------------
export const editAllUser = async (req, res) => {
  try {
    // findByIdAndUpdate(id, {欄位: 值})
    // { new: true } 設定回傳更新後的資料
    const result = await users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (result) {
      res.status(200).json({ success: true, message: '', result })
    } else {
      res.status(404).json({ success: false, message: '找不到資料' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: '資料格式錯誤' })
    } else if (error.name === 'ValidationError') {
      // 取出第一個驗證失敗的欄位名稱
      const key = Object.keys(error.errors)[0]
      // 用取出的欄位名稱取出錯誤訊息
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(409).json({ success: false, message: '帳號已存在' })
    } else {
      res.status(500).json({ success: false, message: '伺服器錯誤' })
    }
  }
}

// ---------------------------------------------------------------------
// addCart 加入購物車
// [最後關卡]：router.post('/cart', content('application/json'), auth.jwt, addCart)
// ---------------------------------------------------------------------
export const addCart = async (req, res) => {
  // 先驗證商品是否存在(要引入models/products.js)
  try {
    // #### A.驗證商品是否有找到
    const result = await products.findById(req.body.product)
    //  假如沒有找不到這商品 or 商品已經下架了
    if (!result || !result.sell) {
      // 回傳錯誤訊息是404 商品不存在
      return res.status(404).send({ success: false, message: '商品不存在' })
    }
    // #### B.看購物車內有沒有這商品
    // (product_id > type: mongoose.ObjectId)所以要轉型態，因為req.body.product是文字
    // arr.findIndex(callback[, thisArg])
    // (req-body) https://blog.heitang.info/2022/05/07/2022-04-28-Day15-req-body/
    const idx = req.user.cart.findIndex((item) => { return item.product.toString() === req.body.product })
    // 寫法2
    // const idx = req.user.cart.findIndex((item) => { return item.product === mongsoose.ObjectId(req.body.product) })
    // 假如購物車有商品(可以調整此商品數量?傳入的數量?)
    if (idx > -1) {
      // req.user.cart[idx].quantity += req.body.quantity
      req.user.cart[idx].quantity = req.user.cart[idx].quantity + req.body.quantity
    } else {
      // 如果沒有的話.puch
      req.user.cart.push({
        product: req.body.product,
        quantity: req.body.quantity
      })
    }
    await req.user.save()
    // 同商品累計數量
    // 注意補了這行會出現前台加入購物車時會有問題。但後端會有要的資料
    // console.log(req.user.cart[idx].quantity)
    res.status(200).send({ success: true, message: '', result: req.user.cart.length })
    // res.status(200).send({
    //   success: true,
    //   message: '',
    //   // 回傳給前台(購物車的長度。沒有回有放了那些品項?)
    //   result: req.user.cart.length
    // })
  } catch (error) {
    // 驗證錯誤
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      return res.status(400).send({ success: false, message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

// ---------------------------------------------------------------------
// editCart 編輯購物車
// [最後關卡]：router.post('/cart', content('application/json'), auth.jwt, addCart)
// ---------------------------------------------------------------------
export const editCart = async (req, res) => {
  // 寫法1 (用mongodb的寫法)
  try {
    //  假如目前的編輯數量小於等於0
    if (req.body.quantity <= 0) {
      // 刪除內容
      await users.findOneAndUpdate(
        // findIneAndUpdate(第一個參數)是指查詢的條件
        {
          // _id要符合目前查詢的使用者id
          _id: req.user.id,
          // 此使用者的購物車裏面也要有這個商品
          'cart.product': req.body.product
        },
        // findIneAndUpdate(第2個參數)是指要修改的內容
        {
          // $pull是把陣列的內容刪除
          $pull: {
            // cart是指要刪除的內容(陣列)，是 條件式product: req.body.product(我請求(查詢)的商品ID)
            cart: { product: req.body.product }
          }
        }
      )
    } else {
      // 修改內容
      await users.findOneAndUpdate(
        // 條件: 找使用者的id，然後這個使用者裡面的購物車也要有這商品 cart.product等於我傳入的商品的值
        // (假如我樂高A數量2(原本)，但我這便輸入成數量5，他就會先去找原本一開始的樂高A數量2的索引比對找到後。輸入數量5，最後的結果會是樂高A數量5)
        { _id: req.user._id, 'cart.product': req.body.product },
        {
          // $set是把陣列的內容(數量)修改
          $set: {
            // cart.$.quantity 的$代表符合陣列搜尋條件的索引(會去比對請求的商品id的位置[index]--> $ ) (修改的數量)
            'cart.$.quantity': req.body.quantity
          }
        }
      )
    }
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    // 驗證錯誤
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      return res.status(400).send({ success: false, message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }

//   // 寫法2 (直接用req)(老師通常會這樣寫JS語法) ---------------------------
//   // try {
//   //   if (req.body.quantity <= 0) {
//   //     const idx = req.user.cart.findIndex(item => item.product.toString() === req.body.product)
//   //     req.user.cart.splice(idx, 1)
//   //     await req.user.save()
//   //   } else {
//   //     const idx = req.user.cart.findIndex(item => item.product.toString() === req.body.product)
//   //     req.user.cart[idx].quantity = req.body.quantity
//   //     await req.user.save()
//   //   }
//   // } catch (error) {
//   //   if (error.name === 'ValidationError') {
//   //     const key = Object.keys(error.errors)[0]
//   //     const message = error.errors[key].message
//   //     return res.status(400).send({ success: false, message })
//   //   } else {
//   //     res.status(500).send({ success: false, message: '伺服器錯誤' })
//   //   }
//   // }
}

// ---------------------------------------------------------------------
// getCart 取得購物車資料
// [最後關卡]：router.post('/cart', content('application/json'), auth.jwt, addCart)
// ---------------------------------------------------------------------
export const getCart = async (req, res) => {
  try {
    // .populate('cart.product') 補上這行。取得資料時候有models/product.js(這個商品所有資訊)
    const result = await users.findById(req.user._id, 'cart').populate('cart.product')
    res.status(200).send({ success: true, message: '', result: result.cart })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

/* Mongoose 有提供 populate() 方法，可以將其他 collection 的資料關聯到目前在操作的 collection
    // https://developer.mozilla.org/zh-TW/docs/Learn/Server-side/Express_Nodejs/mongoose
    // https://hackmd.io/@peterchen1024/r1Fe1wII9
    // https://blog.heitang.info/2022/05/07/2022-05-03-Day17-Mongoose-Populate/
    // https://vanessa7591.medium.com/%E7%AD%86%E8%A8%98-populat%E8%88%87-mongodb%E7%9A%84%E8%B3%87%E6%96%99%E9%97%9C%E8%81%AF-ffc619137910
*/
