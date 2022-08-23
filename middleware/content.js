/*

設定一個 middleware 的 content-type 驗證傳進來的資料格式
因為傳進來的格式必須要是json。
type這個參數改成比較彈性，不是一開始設定 application/json
由使用者自訂套入參數讓，就比較能動態更換不用只能固定 application/json
優點(不用每個地方要補上以下)
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    return res.status(400).send({ success: false, message: '資料格式錯誤' })
  }
變成模板統一套用(這樣修改一個地方就全部連動)

目前會需要資料格式驗證的有
register, login,
*/

export default (type) => {
  return (req, res, next) => {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes(type)) {
      return res.status(400).send({ success: false, message: '資料格式錯誤' })
    }
    next()
  }
}

// export const content = (type) => {
//   return (req, res, next) => {
//     if (!req.headers['content-type'] || !req.headers['content-type'].includes(type)) {
//       return res.status(400).send({ success: false, message: '資料格式錯誤' })
//     }
//     next()
//   }
// }
