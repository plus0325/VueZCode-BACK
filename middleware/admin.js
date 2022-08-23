// 等auth.jwt驗證使用者資料後存入 req.user 後。給admin.js檢查身分是否為1就是管理員
export default (req, res, next) => {
  if (req.user.role !== true) {
    res.status(403).send({ success: false, message: '權限不足' })
  } else {
    next()
  }
}
