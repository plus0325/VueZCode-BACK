// 分別匯入models資料庫schema(使用者/訂單)
import users from '../models/users.js'
import orders from '../models/orders.js'

// ---------------------------------------------------------------------
// createOrder  建立訂單(結帳)
// [最後關卡]：router.post('/', auth.jwt, createOrder)
// ---------------------------------------------------------------------
export const createOrder = async (req, res) => {
  try {
    // [[ 結帳前的條件 ]]
    // A.假如使用者的購物車內容是0(沒東西)，不能結帳，並回傳請求錯誤訊息
    if (req.user.cart.length === 0) {
      return res.status(400).send({ success: false, message: '購物車為空' })
    }

    // B.檢查訂單內是否有下架商品，不能結帳，並回傳請求錯誤訊息
    // 資料庫查詢資料，使用 findById，使用此方法只會返回一筆資料，以 id 去尋找資料(購物車cart這欄位內容)
    // 來源為models/users.js
    let result = await users.findById(req.user._id, 'cart').populate('cart.product')
    // .every(檢查陣列中是否「全部」都符合條件，如果「每一個」都符合條件，才會回傳 true ，否則會回傳 false。)
    // some()可以用來檢查陣列中是否有「某一個」元素符合條件。如果「其中一個」元素符合條件就回傳 true。

    const canCheckout = result.cart.every(item => { return item.product.sell })
    if (!canCheckout) {
      return res.status(400).send({ success: false, message: '包含下架商品' })
    }
    // 最後結果建立新訂單內容有(使用者ID和使用者購物車內容)
    result = await orders.create({
      // 來源為models/orders.js
      user: req.user._id,
      products: req.user.cart
    })
    // 結帳完後。清空購物車，並存資料，回傳訂單的ID
    req.user.cart = []
    await req.user.save()
    res.status(200).send({
      success: true,
      message: '',
      // 訂單的ID
      result: result._id
    })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getMyOrders 取得使用者訂單
// [最後關卡]：router.get('/', auth.jwt, getMyOrders)
// ---------------------------------------------------------------------
export const getMyOrders = async (req, res) => {
  try {
    // 訂單.find({ user: req.user._id }) 針對使用者ID去找塞進去
    // 塞入models/orders.js/products裡面 product 的內容
    // ref: 'products' 連到models/products.js的資料
    // 回傳出去
    const result = await orders.find({ user: req.user._id }).populate('products.product')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getAllOrders 取得全部訂單(管理員)
// [最後關卡]：router.get('/all', auth.jwt, admin, getAllOrders)
// ---------------------------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    // find()空的。沒放條件就是找全部
    // 找到後這筆訂單後。塞入models/orders.js/products裡面 product 的內容
    // ref: 'products' 連到models/products.js的資料
    // 再塞入models/orders.js/user裡面(ref: 'users')
    // ref: 'users' 連到models/users.js/ 放你要的資料(通常密碼不放可以用-passoword)
    // 目前我只取email
    // 回傳出去
    const result = await orders.find().populate('products.product').populate('user', 'email')
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }

  // .populate('user', 'account')
  // 自動抓 user 欄位對應的 ref 資料，只取 account 欄位
  // (這是老師版本的設定)
}

// ---------------------------------------------------------------------
// editOrders 編輯全部訂單(管理員)
// [最後關卡]：router.patch('/:id', auth.jwt, admin, editOrders)
// ---------------------------------------------------------------------
export const editOrders = async (req, res) => {
  try {
    // req.body ??????
    const data = {
      // 訂購人信箱
      // email: req.body.email,
      // 狀態分類
      tone: req.body.tone
    }
    const result = await orders.findByIdAndUpdate(req.params.id, data, { new: true })

    // 成功後回傳 result (就上面的內容)
    return res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    // console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const messageError = error.errors[key].message
      return res.status(400).send({ success: false, message: messageError })
    } else {
      return res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}
