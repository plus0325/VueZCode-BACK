import products from '../models/products.js'

// ---------------------------------------------------------------------
// createProduct 新增商品
// ---------------------------------------------------------------------
export const createProduct = async (req, res) => {
  try {
    // req.body ??????
    // 後台網頁會顯示的表單欄位選項
    const result = await products.create({
      // 商品名稱
      name: req.body.name,
      // 商品價格
      price: req.body.price,
      // 商品描述
      description: req.body.description,
      // 商品圖片(?怕沒有上傳東西而回傳 undefined 改回'')
      image: req.file?.path || '',
      // 是否上架
      sell: req.body.sell,
      // 分類
      category: req.body.category
    })
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

// ---------------------------------------------------------------------
// editProduct 編輯商品
// ---------------------------------------------------------------------
export const editProduct = async (req, res) => {
  try {
    // req.body ??????
    const data = {
      // 商品名稱
      name: req.body.name,
      // 商品價格
      price: req.body.price,
      // 商品描述
      description: req.body.description,
      // 商品圖片(?怕沒有上傳東西而回傳 undefined 改回'')
      image: req.file?.path,
      // 是否上架
      sell: req.body.sell,
      // 分類
      category: req.body.category
    }
    if (req.file) data.image = req.file.path
    // if (req.file) {
    //   return data.image = req.file.path
    // }
    //  .findByIdAndUpdate { new: true })表示會返回修改後的 item ，而非原始 item
    const result = await products.findByIdAndUpdate(req.params.id, data, { new: true })

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

// ---------------------------------------------------------------------
// getProducts 只顯示上架的商品
// ---------------------------------------------------------------------
export const getProducts = async (req, res) => {
  try {
    // { sell: true } 找上架的
    const result = await products.find({ sell: true })
    return res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getAllProducts 顯示全部的商品(含下架)。只有管理員可以看
// ---------------------------------------------------------------------
export const getAllProducts = async (req, res) => {
  try {
    // .find()沒東西就是找全部囉
    const result = await products.find()
    return res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

// ---------------------------------------------------------------------
// getProduct 顯示單的商品
// ---------------------------------------------------------------------
export const getProduct = async (req, res) => {
  try {
    // .findById(req.params.id) 透過商品ID找要的商品
    const result = await products.findById(req.params.id)
    return res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    return res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
