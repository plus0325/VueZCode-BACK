import express from 'express'
import * as auth from '../middleware/auth.js'
// 驗證傳進來的資料格式 content-type
import content from '../middleware/content.js'
import admin from '../middleware/admin.js'
import {
  register,
  login,
  logout,
  extend,
  getUser,
  addCart,
  editCart,
  getCart,
  getAllUser,
  getDelUser,
  editAllUser
} from '../controllers/users.js'

const router = express.Router()

// Content-Type: application/json 代表請求內容是 JSON
router.post('/', content('application/json'), register)
router.post('/login', content('application/json'), auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.post('/extend', auth.jwt, extend)
router.get('/', auth.jwt, getUser)
// ---------------------------------------------------------------------
// getAllUser 取得全部會員資料(管理員)
// ---------------------------------------------------------------------
router.get('/all', auth.jwt, admin, getAllUser)
router.delete('/:id', auth.jwt, admin, getDelUser)
router.patch('/:id', auth.jwt, admin, editAllUser)
// ---------------------------------------------------------------------
// addCart 購物車 - 新增選購商品(加入購物車)
// ---------------------------------------------------------------------
router.post('/cart', content('application/json'), auth.jwt, addCart)

// ---------------------------------------------------------------------
// editCart 購物車 - 編輯選購商品(修改購物車內容)
// ---------------------------------------------------------------------
router.patch('/cart', content('application/json'), auth.jwt, editCart)

// ---------------------------------------------------------------------
// getCart 購物車 - 取得選購商品(取購物車內容)
// ---------------------------------------------------------------------
router.get('/cart', auth.jwt, getCart)

export default router

/*

補充 router.post('/', content('application/json'), register)
content('application/json')
套 middleware/content.js 程式碼

if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
  return res.status(400).send({ success: false, message: '資料格式錯誤' })
}

*/
