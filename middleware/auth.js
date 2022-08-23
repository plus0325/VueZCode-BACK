// 當成功登入後可以得到 req.user 這個物件
// 如果定義的 Strategy 驗證失敗，會在 callback 中回傳 err ，後續的路由不會被執行，並回傳 401 Unauthorized 的 response
// 要求物件 (req)、回應物件 (res)，下一個Middleware(next)

import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'

// -------------------------------------------
// 使用passsport.js裡面的login驗證策略
// -------------------------------------------
export const login = (req, res, next) => {
  // 在成功登入後，Passport 會建立一個 login session。如果不需要可以把它停用（passport.authenticate('<strategyName>', { session: false })）
  //  (err, user, info) 是 passport/passport.js/ done 傳出來的三個參數
  // 客制化的 callback，passport.authenticate('<strategyName>', callback<err, user, info>)
  passport.authenticate('login', { session: false }, (err, user, info) => {
    // console.log(err, user, info)
    // 假如錯或沒有這個使用者
    if (err || !user) {
      // 假如傳出來的訊息是 Missing Credentials 就將訊息改成'欄位驗證錯誤'並回傳
      if (info.message === 'Missing credentials') {
        info.message = '欄位驗證錯誤'
        return res.status(401).send(
          {
            success: false,
            message: info.message
          }
        )
      } else {
        // 如果欄位格式正確，就回傳 passport/passport.js/login/ done 傳出來的三個參數其中的info訊息
        return res.status(401).send(
          {
            success: false,
            message: info.message
          }
        )
      }
    }
    // 當成功登入後可以得到 req.user 這個物件
    req.user = user
    next()
  })(req, res, next)
}

// -------------------------------------------
// 使用passsport.js裡面的jwt驗證策略
// -------------------------------------------
export const jwt = (req, res, next) => {
  // done(系統錯誤放error否則回傳null，有錯誤user(data)設為false，驗證錯誤放info。)
  // 參數會改名為data是因為JWT回傳會有(使用者+TOKEN)資料
  passport.authenticate('jwt', { session: false }, (err, data, info) => {
    // 假如錯或沒有資料 就檢查錯誤
    if (err || !data) {
      // 如果是JWT的套件錯誤的話
      // info()
      // instanceof 是用來判斷 A是否為B的實例，比較的是原型(prototype)
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        // 如果是JWT的格式錯誤就回傳
        return res.status(401).send({ success: false, message: '驗證錯誤' })
      } else {
        // 如果JWT格式正確，就回傳 passport/passport.js/jwt/ done 傳出來的三個參數其中的info訊息(登入逾期)
        return res.status(401).send({ success: false, message: info.message })
      }
    }
    // Token 驗證成功且找到符合的使用者資料後，分別存至req.token和 req.user上供後續使用
    req.user = data.user
    req.token = data.token
    next()
  })(req, res, next)
}
