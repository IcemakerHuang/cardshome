# cardshome
*定義商品Schema｜ models/products.js*
0:35 定義商品Schema: back/models/products.js ，開始定義Schema 各項資料
4:11 如果想做動態新增-> category 這一項必須要做成models/category.js，然後記ID，紀錄各分類 （僅概念kento沒做)
6:22   timestamps: true ：出現建立日期和更新日期、versionKey: false：不會出現_V

*上傳檔案功能建立｜middlewares/upload.js*
9:07  multer 、 multer-storage-cloudinary  套件: 讓人可以上傳檔案 -> 因此新增 back/middlewares/upload.js （當中間件用）
12:16 雲端平台設定，.env 要對齊 cloudinary.config 裡的設定 （12/28教學有提到 CLOUDINARY三個值）
14:42 const upload = multer -> fileFilter 限制上傳的檔案類型（req: 請求的資訊, file: 檔案資訊, callback: 判斷是否允許檔案）
20:29 輸出export -> 並設定此網站做單一檔案上傳
題外話：月曆元件 28:09 、分頁 28:34 、一直往下捲的功能 28:50 （可能的問題 32:19

*判斷使用者是不是管理員｜ back/middlewares/admin.js* 33:20

*如何處理商品相關的請求，包括新增、查詢、修改*
37:22 建立 back/controllers/products.js ，建立新增功能 create
47:10 增加了新增請求 (create) ，路由也要補上路徑 -> 建立新路由 back/routes/products.js ，定義如何根據請求觸發處理程序（驗證）
49:02 router.post('/', auth.jwt, admin, upload, create) 驗證過程講解
51:37 回 back/index.js 建立對應路由（用import 

*寫前端後台的管理員商品管理頁* 1:00:24 
1:00:50 前端路由要設定路徑 ，回 views/admin/新增對應頁面.vue 
1:07:36 管理員介面之常用元件之一 Data table 介紹
1:13:24 用元件把表單變成對話框，對話框想要同時使用新增或編輯去重複利用 1:18:30
1:23:06 比vuetify 好看的檔案上傳元件vue file agent ，npm安裝 1:25:24 ，刻表單 1:27:23，有串後端models/products.js 設定 1:31:46
1:33:18 發布文章的編輯器可用ckediter ( kento忘了怎麼用 但可支援vue
1:39:19 安裝 vue file agent，注意plugins外掛順序 1:41:05 (ex: 先router再pinia，會抓不到store)
1:50:15 商品登錄表單的引入與驗證yup
2:00:57 以下 const { handleSubmit, isSubmitting, resetForm } 回應 user 使用表單元件的各種動作 ，開始串動作進<template>前端 2:26:00
2:08:26 vue file agent 的 <VueFileAgent>功能，重設上傳圖片(類似清掉) 2:54:19 、送出表單關對話框 2:59:53
2:32:53 用formData上傳物件(新增商品)的好處:同時新增物件和資料
2:44:37 格式沒有正確的處理方式
以上是新增

*後端寫查詢* 2:57:07
2:57:42 server side table 翻頁(或排序)跟server要資料
3:01:33 增修 back/controllers/products.js 管理員查商品getAll(無限制上下架) 、前台查商品(只有上架)get、查找單一商品getId
3:10:45 MongoDB 查詢語法：$or  、關鍵字查詢要用正則表達式 3:13:01 
3:22:00 新增動作，路由 back/routes/products.js 也要新增請求路徑
3:25:11 用postman測試是否有動作、說明 req.query如何傳資料給後端 3:27:45  、搜尋 req.query.search 的正則表達式  3:29:24 
->參數設好，進查詢步驟.find、.sort、.skip、.limit 來顯示結果、動作設定完，記得補上路由 3:39:05

3:42:08 後端寫完查詢，回前端的後台管理頁 views/admin/ProductsView.vue，並透過 VDataTableServer 表格元件與const完的參數用v-model 綁定，把顯示查詢步驟.find、.sort、.skip、.limit 出來的結果，送到前端顯示。(待check)
4:02:02 寫 VDataTableServer 元件與已綁定動作的fn  (tableLoadItems) tableLoadItems
4:50:37 tableLoadItems 細項修正: itemsPerPage: tableItemsPerPage.value
4:51:28 修改表格顯示方式(用插槽slots)，先用data看收到了什麼資料(json)，再另取單一項目4:53:52
5:00:44 插槽slots 使用搜尋欄位、整體說明5:08:15
5:06:00 VScode volar 功能:把你元件的script、css、template組合在一起(html)
5:09:24 製作 插槽slot裡的編輯功能 @click="openDialog 
5:16:34 改寫fn handleSubmit 如果遇到錯誤的判斷式結構 

5:24:29 修改 vuetify 語言設定: locale
5:26:58 補上後端編輯、-1的bug
5:30:34 getAll的例外情境: ItemsPerPage  -1 和 undefined  (為了完整查詢功能)

*後端寫編輯* 
5:35:44 增修 back/controllers/products.js  編輯edit ，路由要補、測試修bug 5:40:31、講解5:42:52