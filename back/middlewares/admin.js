// -!1/18 前後端整合-不一定使用
// 用途：判斷使用者是不是管理員
import UserRole from '../enums/UserRole.js'
import { StatusCodes } from 'http-status-codes'

// 判斷使用者是不是管理員，是的話就繼續，不是的話就回傳錯誤訊息，原理：使用者的role是不是ADMIN
export default (req, res, next) => {
  if (req.user.role !== UserRole.ADMIN) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: '沒有權限'
    })
  } else {
    next()
  }
}
