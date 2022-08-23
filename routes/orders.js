import express from 'express'
// 訂單管理(管理員需要驗證)
import admin from '../middleware/admin.js'
import * as auth from '../middleware/auth.js'
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  editOrders
} from '../controllers/orders.js'

const router = express.Router()

// ---------------------------------------------------------------------
// createOrder 建立訂單(結帳)
// ---------------------------------------------------------------------
router.post('/', auth.jwt, createOrder)

// ---------------------------------------------------------------------
// getMyOrders 取得使用者訂單
// ---------------------------------------------------------------------
router.get('/', auth.jwt, getMyOrders)

// ---------------------------------------------------------------------
// getAllOrders 取得全部訂單(管理員)
// ---------------------------------------------------------------------
router.get('/all', auth.jwt, admin, getAllOrders)

// ---------------------------------------------------------------------
// editOrders 編輯全部訂單(管理員)
// ---------------------------------------------------------------------
router.patch('/:id', auth.jwt, admin, editOrders)

export default router
