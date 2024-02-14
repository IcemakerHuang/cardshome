// 這個 users.js 檔案定義了與使用者相關的路由。在 Express.js 中，路由是用來定義應用程式如何回應特定端點的客戶端請求，包括 URI（或路徑）和特定的 HTTP 請求方法（GET、POST 等）。
// 這裡就是定義如何處理與使用者相關的 HTTP 請求。
import { Router } from 'express'
import { create, login, logout, extend, getProfile, editCart, getCart } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'

const router = Router()
router.post('/', create)
router.post('/login', auth.login, login)
// 定義一個處理 POST 請求的路由。當客戶端發送一個到 '/login' 的 POST 請求時，會先執行 auth.login 中間件，然後是 login 函數。
// 這裡的 auth.login 是一個中間件，它的主要用途是處理使用者的登入請求並進行身份驗證

// -!以下皆為新增
// 這裡的 auth.jwt 是一個中間件，它的主要用途是驗證使用者的身份，並檢查使用者的 token 是否有效。
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/me', auth.jwt, getProfile)
router.patch('/cart', auth.jwt, editCart)
router.get('/cart', auth.jwt, getCart)

export default router // 導出路由，以便在其他檔案中使用
