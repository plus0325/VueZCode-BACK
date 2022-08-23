import express from 'express'
import content from '../middleware/content.js'
import * as auth from '../middleware/auth.js'
import admin from '../middleware/admin.js'
import upload from '../middleware/upload.js'
import {
  createProduct,
  getProducts,
  getAllProducts,
  getProduct,
  editProduct
} from '../controllers/products.js'

const router = express.Router()

// 對商品請求需要過的關卡
// multipart/form-data

// ---------------------------------------------------------------------
// createProduct 新增商品
// ---------------------------------------------------------------------
router.post('/', content('multipart/form-data'), auth.jwt, admin, upload, createProduct)
// ---------------------------------------------------------------------
// getProducts 只顯示上架的商品
// ---------------------------------------------------------------------
router.get('/', getProducts)
// ---------------------------------------------------------------------
// getAllProducts 顯示全部的商品(含下架)。只有管理員可以看
// ---------------------------------------------------------------------
router.get('/all', auth.jwt, admin, getAllProducts)
// ---------------------------------------------------------------------
// getProduct 顯示單的商品 (*******順序有差，要先跑all ，如果位置放在all 上面all會被當成一個id)
// ---------------------------------------------------------------------
router.get('/:id', getProduct)
// ---------------------------------------------------------------------
// editProduct 編輯商品
// ---------------------------------------------------------------------
router.patch('/:id', content('multipart/form-data'), auth.jwt, admin, upload, editProduct)

export default router

/*

商品不做刪除。只做下架(怕訂單會有問題)

multipart/form-data
https://ithelp.ithome.com.tw/articles/10244974
https://blog.kalan.dev/2021-03-13-html-form-data/

*/
