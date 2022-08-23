import passport from 'passport'
import passportJWT from 'passport-jwt'
import passportLocal from 'passport-local'
import bcrypt from 'bcrypt'
// await users.findOne({ account }) 尋找是否有這位使用者(users.js)
// bcrypt.compareSync(password, user.password) 比對密碼(users.js)
import users from '../models/users.js'
const LocalStrategy = passportLocal.Strategy
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

// ---------------------------------------------------------------------
// LocalStrategy 本地驗證方法(登入/使用者/會員認證)
// ---------------------------------------------------------------------
// 帳號登入---------------------------------------------
// passport.use('login', new LocalStrategy({
//   usernameField: 'account',
//   passwordField: 'password'
// }, async (account, password, done) => {
//   try {
//     const user = await users.findOne({ account })
//     if (!user) {
//       // 如果是一般的驗證錯誤(error)如使用者不存在等，回傳(null, false, {message: '具體錯誤'})；
//       return done(null, false, { message: '帳號不存在' })
//     }
//     if (!bcrypt.compareSync(password, user.password)) {
//       // 如果是一般的驗證錯誤(error)如使用者不存在等，回傳(null, false, {message: '具體錯誤'})；
//       return done(null, false, { message: '密碼錯誤' })
//     } else {
//       // 如果一切正常，則回傳(null, user)
//       return done(null, user)
//     }
//   } catch (error) {
//     // 如果是伺服器錯誤(exception)，如資料庫連結錯誤等，則回傳(err, false)
//     return done(error, false)
//   }
//   // done(系統錯誤放error否則回傳null，有錯誤user設為false，驗證錯誤放info。)
// }))

// email登入---------------------------------------------
passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await users.findOne({ email })
    if (!user) {
      // 如果是一般的驗證錯誤(error)如使用者不存在等，回傳(null, false, {message: '具體錯誤'})；
      return done(null, false, { message: '註冊信箱不存在' })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      // 如果是一般的驗證錯誤(error)如使用者不存在等，回傳(null, false, {message: '具體錯誤'})；
      return done(null, false, { message: '密碼錯誤' })
    } else {
      // 如果一切正常，則回傳(null, user)
      return done(null, user)
    }
  } catch (error) {
    // 如果是伺服器錯誤(exception)，如資料庫連結錯誤等，則回傳(err, false)
    return done(error, false)
  }
  // done(系統錯誤放error否則回傳null，有錯誤user設為false，驗證錯誤放info。)
}))

// ---------------------------------------------------------------------
// ExtractJWT 驗證方法
// ---------------------------------------------------------------------
passport.use('jwt', new JWTStrategy({
  // 從 headers 提取 Bearer Token
  // jwtFromRequest：指定從請求中的哪裡提取 JWT，這裡可以使用 ExtractJwt 來輔助配置。
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  // JWT 驗證secret
  // secretOrKey：放入 JWT 簽章用的密鑰
  secretOrKey: process.env.JWT_SECRET,
  // 將req的資料傳入Callback(這樣我們以下function這可以使用req的參數)
  // passReqToCallback: 讓我們在後面的 callback 中可以使用 req 參數
  passReqToCallback: true,
  // 處理 token 舊換新(忽略過期)，不然舊(過期)的會不見。就不能拿來換新的?
  // ignoreExpiration：是否忽略過期的 JWT，預設是 false
  ignoreExpiration: true
}, async (req, payload, done) => {
  // 檢查是否過期的 token
  // 過期的時間單位是秒鐘，node.js的單位是毫秒所以要*1000(比目前的時間還要小，就代表過期了)
  // exp (Expiration Time) - jwt的過期時間，這個過期時間必須要大於簽發時間
  const expired = payload.exp * 1000 < Date.now()
  // 舊換新的方式(判斷)-->假如過期了。而且我的路由不是舊換新也不是登出的話
  if (expired && req.originalUrl !== '/users/extend' && req.originalUrl !== '/users/logout') {
    return done(null, false, { message: '登入逾期' })
  }
  // 驗證使用者和token
  try {
    // 找不到使用者user
    const user = await users.findById(payload._id)
    if (!user) {
      return done(null, false, { message: '使用者不存在' })
    }

    // 找不到token
    const token = req.headers.authorization.split(' ')[1]
    if (user.tokens.indexOf(token) === -1) {
      return done(null, false, { message: '驗證錯誤' })
    } else {
      // 都驗證確認都有就回傳使用者和token
      return done(null, { user, token })
    }
  } catch (error) {
    return done(error, false)
  }
}))

// http://www.passportjs.org/packages/passport-jwt/
// JSON Web Token(JWT) 簡單介紹
// https://mgleon08.github.io/blog/2018/07/16/jwt/
