// -!1/18 前後端整合-不一定使用

// 意義：在 back/controllers/products.js 中，你定義了如何處理商品相關的請求，例如建立商品、獲取商品列表、編輯商品等。
// 然而，這些功能需要透過 HTTP 請求來觸發，這就是為什麼你需要在 back/routes/products.js 中定義路由。
import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { create, getAll, edit, get, getId } from '../controllers/products.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'

const router = Router()

// 路由是一種規則，它告訴你的應用程式如何回應特定的 HTTP 請求（例如 GET、POST 或 PATCH）。在這個例子中，你定義了以下的路由：
router.post('/', auth.jwt, admin, upload, create) // 建立新的商品
router.get('/all', auth.jwt, admin, getAll) // 獲取所有商品的列表
router.patch('/:id', auth.jwt, admin, upload, edit) // 根據商品 ID 編輯商品
router.get('/', get) // 獲取所有銷售中的商品列表
router.get('/:id', getId) // 根據商品 ID 獲取商品資訊

export default router