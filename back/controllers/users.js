import users from '../models/users.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

export const create = async (req, res) => {
  try {
    // 創建一個新的使用者並回應一個 HTTP 200 狀態碼和一個 JSON 對象。
    await users.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    // 處理不同類型的錯誤並回應相應的 HTTP 狀態碼和訊息。
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已註冊'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 處理使用者的登入請求。
// #region 用途說明
// 當使用者嘗試登入時，系統會生成一個包含使用者 _id 的 JSON Web Token（JWT），並將此 token 添加到使用者的 tokens 陣列中。然後，系統會儲存使用者的資訊，包括新添加的 token。
// 如果上述操作成功，系統會回應一個 HTTP 200 狀態碼和一個 JSON 對象，該對象包含了操作的結果，包括 token、帳號、電郵、角色，以及購物車中商品的總數量。
// 如果在處理登入請求時出現錯誤，系統會回應一個 HTTP 500 狀態碼和一個包含錯誤訊息的 JSON 對象。
// #endregion
export const login = async (req, res) => {
  try {
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    // 5.執行來自 middlewares / auth.js 的 req.user.save()，將 token 儲存到資料庫中。
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        token,
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart.reduce((total, current) => {
          return total + current.quantity
        }, 0)
      }
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}
