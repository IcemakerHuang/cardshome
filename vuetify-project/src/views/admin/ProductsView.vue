<!-- 本頁用途：後台商品管理頁 -->
<!-- 這裡有用到：簡單的對話筐式表單，去建商品資訊 -->
<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1.text-center 商品管理
    VDivider
    VCol(cols="12")
      VBtn(color="green" @click="openDialog()") 新增商品
    VCol(cols="12")
      VDataTableServer(
        v-model:items-per-page="tableItemsPerPage"
        v-model:sort-by="tableSortBy"
        v-model:page="tablePage"
        :items="tableProducts"
        :headers="tableHeaders"
        :loading="tableLoading"
        :items-length="tableItemsLength"
        :search="tableSearch"
        @update:items-per-page="tableLoadItems"
        @update:sort-by="tableLoadItems"
        @update:page="tableLoadItems"
        hover
      )
        template(#top)
          VTextField(
            label="搜尋"
            append-icon="mdi-magnify"
            v-model="tableSearch"
            @click:append="tableApplySearch"
            @keydown.enter="tableApplySearch"
          )
        template(#[`item.image`]="{ item }")
          VImg(:src="item.image" height="50px")
        template(#[`item.sell`]="{ item }")
          VIcon(icon="mdi-check" v-if="item.sell")
        template(#[`item.edit`]="{ item }")
          VBtn(icon="mdi-pencil" variant="text" color="blue" @click="openDialog(item)")
VDialog(v-model="dialog" persistent width="500px")
  VForm(:disabled="isSubmitting" @submit.prevent="submit")
    VCard
      VCardTitle {{ dialogId === '' ? '新增商品' : '編輯商品' }}
      VCardText
        VTextField(
          label="名稱"
          v-model="name.value.value"
          :error-messages="name.errorMessage.value"
        )
        VTextField(
          label="價格"
          type="number" min="0"
          v-model="price.value.value"
          :error-messages="price.errorMessage.value"
        )
        VSelect(
          label="分類"
          :items="categories"
          v-model="category.value.value"
          :error-messages="category.errorMessage.value"
        )
        VCheckbox(
          label="上架"
          v-model="sell.value.value"
          :error-messages="sell.errorMessage.value"
        )
        VTextarea(
          label="說明"
          v-model="description.value.value"
          :error-messages="description.errorMessage.value"
        )
        VueFileAgent(
          v-model="fileRecords"
          v-model:rawModelValue="rawFileRecords"
          accept="image/jpeg,image/png"
          deletable
          :error-text="{type: '檔案格式不支援', size: '檔案超過 1MB 大小限制'}"
          help-text="選擇檔案或拖曳到這裡"
          :max-files="1"
          max-size="1MB"
          ref="fileAgent"
        )
      VCardActions
        VSpacer
        VBtn(color="red" :disabled="isSubmitting" @click="closeDialog") 取消
        VBtn(color="green" type="submit" :loading="isSubmitting") 送出
</template>
<!-- VDialog(v-model="dialog" persistent讓在對話筐下，點外面不會自動關閉 width="500px") -->
<script setup>
// ref="fileAgent" // 用途：在表單提交時，可以使用 fileAgent.value.deleteFileRecord() 來刪除上傳的檔案 // 配合 vue file agent 重設上傳圖片(類似清掉)

// VDataTableServer 的案例，我可以理解  v-model 是將會變動的參數與前端的按鈕(或是任何形式的物件)，彼此連結起來，一旦後端提供出來參數有變動，這個變動值就會同步更新的前端物件裡，被暫時存放著，對嗎？
// 是的，你的理解是正確的。在 Vue.js 中，v-model 是一種雙向數據綁定的語法糖，它可以讓你在元件和父組件之間同步數據。也就是說，當這些參數的值變化時，對應的 VDataTableServer 元件的屬性也會跟著變化，反之亦然。
// @update 表示當 items-per-page、sort-by 和 page 的值更新時，會執行 tableLoadItems 函數。重新從伺服器獲取數據，並更新 tableProducts 和 tableItemsLength，用來更新表格。

// template(#top) 是 Vue 的插槽（slot）的語法。插槽是 Vue 組件中的一種功能，它允許你在不同的組件之間重用和組合代碼。
// 在這個例子中，template(#top) 創建了一個名為 "top" 的具名插槽。這個插槽可以被父組件(應該是 VDataTableServer)填充，也就是說，父組件可以在這個插槽中插入自己的模板或組件。
// 插槽的概念可以比喻為一個背包。你可以將背包（插槽）給別人（其他組件），然後他們可以在背包裡放任何他們想放的東西（模板或組件）。這樣，背包的主人（插槽的創建者）就可以在需要的地方使用這個背包，而不需要關心背包裡具體有什麼，這就實現了代碼的重用和組合。

// 上方為<template> 註解，請用搜尋找

// 下方為 <script setup> 裡的程式碼
import { ref } from 'vue'
import * as yup from 'yup' // 引入 yup 進行商品登錄表單驗證
import { useForm, useField } from 'vee-validate' // Vee-Validate 是一個強大的表單驗證庫，它可以幫助你輕鬆地驗證表單的輸入值，並管理錯誤訊息和表單狀態。
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const { apiAuth } = useApi()
const createSnackbar = useSnackbar()

const fileAgent = ref(null) // 配合 vue file agent 重設上傳圖片(類似清掉)

// 表單對話框的開啟狀態
const dialog = ref(false) // 引入後，使用 ref 創建一個名為 dialog 的響應，用來控制對話框的顯示狀態。
// 表單對話框正在編輯的商品 ID，空的話代表是新增商品
const dialogId = ref('') // 先用成空的，在判斷是否新增還是編輯，下方 openDialog 判斷

const openDialog = (item) => { // 打開編輯對話框
  if (item) {
    dialogId.value = item._id
    name.value.value = item.name
    price.value.value = item.price
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
  } else {
    dialogId.value = ''
  }
  dialog.value = true
}

const closeDialog = () => { // 關閉對話框
  dialog.value = false
  resetForm()
  fileAgent.value.deleteFileRecord() // 配合 vue file agent 重設上傳圖片(類似清掉)
}

// vue file agent
// 做表單的分類
const categories = ['衣服', '食品', '3C', '遊戲'] // 串 models/products.js 的 category

// 商品登錄表單的驗證
const schema = yup.object({
  name: yup
    .string()
    .required('缺少商品名稱'),
  price: yup
    .number()
    .typeError('商品價格格式錯誤')
    .required('缺少商品價格')
    .min(0, '商品價格不能小於 0'),
  description: yup
    .string()
    .required('缺少商品說明'),
  category: yup
    .string()
    .required('缺少商品分類')
    .test('isCategory', '商品分類錯誤', value => categories.includes(value)),
  sell: yup
    .boolean()
})

// 以下處理 回應user使用表單元件的動作
// 這段程式碼是使用 Vee-Validate 的 useForm 函數來創建和管理表單的狀態。
const { handleSubmit, isSubmitting, resetForm } = useForm({ // handleSubmit, isSubmitting, resetForm 分別使用者送出表單、是否送出中、對話筐關閉時要重置
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: '',
    sell: false
  }
})

// 設定各個欄位的狀態，用來連接 <template> 裡面各個表單欄位VTextField 的 v-model
const name = useField('name')
const price = useField('price')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')

const fileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案
const rawFileRecords = ref([]) // vue file agent 功能，用來存放上傳的檔案

// const submit = handleSubmit(async (values) 用途是：當使用者點擊送出按鈕時，會觸發 handleSubmit 函數，並且傳入一個回調函數，這個回調函數會在表單驗證成功後執行。
const submit = handleSubmit(async (values) => {
  if (fileRecords.value[0]?.error) return // 防止在有錯誤的情況下提交表單(擋住不給使用者送出)。
  if (dialogId.value === '' && fileRecords.value.length === 0) return // 如果都是空的，代表我現在在新增->判斷現在是新增還是編輯
  try {
    // 建立 FormData 物件 // 用途：將表單資料轉換成 FormData 物件，這樣才能使用 POST 或 PUT 方法上傳檔案
    // 使用 fd.append(欄位, 值) 將資料放進去
    const fd = new FormData()
    for (const key in values) {
      fd.append(key, values[key])
    }

    if (fileRecords.value.length > 0) {
      fd.append('image', fileRecords.value[0].file)
    }

    // 判斷你是新增還是編輯，決定你向哪個路徑發請求
    if (dialogId.value === '') { // 是空的，送去新增路徑
      await apiAuth.post('/products', fd)
    } else {
      await apiAuth.patch('/products/' + dialogId.value, fd) // 不是空的，送去編輯路徑
    }

    createSnackbar({
      text: dialogId.value === '' ? '新增成功' : '編輯成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    closeDialog() // 送出表單後，關閉對話框
    tableApplySearch() // 編輯或新增完了 -> 跳到下方的 tableApplySearch()歸零，搜尋重啟
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
})

// 以下處理 查詢請求經過後端處理完，並透過 VDataTableServer 元件將查詢結果顯示在前端
// VDataTableServer 要先設定好(const)以下的變數，才去前端綁定
const tableItemsPerPage = ref(10) // 表格每頁幾個

const tableSortBy = ref([ // 表格排序
  { key: 'createdAt', order: 'desc' }
])

const tablePage = ref(1) // 表格頁碼

const tableProducts = ref([]) // 表格商品資料陣列

const tableHeaders = [ // 表格欄位設定
  { title: '圖片', align: 'center', sortable: false, key: 'image' },
  { title: '名稱', align: 'center', sortable: true, key: 'name' },
  { title: '價格', align: 'center', sortable: true, key: 'price' },
  // { title: '說明', align: 'center', sortable: true, key: 'description' },
  { title: '分類', align: 'center', sortable: true, key: 'category' },
  { title: '上架', align: 'center', sortable: true, key: 'sell' },
  { title: '編輯', align: 'center', sortable: false, key: 'edit' }
]

const tableLoading = ref(true) // 表格載入狀態

const tableItemsLength = ref(0) // 表格全部資料數

const tableSearch = ref('') // 表格搜尋文字

// 寫 VDataTableServer 元件與已綁定動作的fn
const tableLoadItems = async () => { // 當表格載入新資料時，執行以下程式碼
  tableLoading.value = true // 表格開始要載入了(載入中)
  try {
    const { data } = await apiAuth.get('/products/all', {
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        sortBy: tableSortBy.value[0]?.key || 'createdAt',
        sortOrder: tableSortBy.value[0]?.order === 'asc' ? 1 : -1,
        search: tableSearch.value
      }
    })
    tableProducts.value.splice(0, tableProducts.value.length, ...data.result.data)
    tableItemsLength.value = data.result.total
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
  tableLoading.value = false // 表格最後載入完畢了
}
tableLoadItems()
// 表格套用搜尋
const tableApplySearch = () => {
  tablePage.value = 1
  tableLoadItems()
}
</script>
<!-- -! 以上1/18 -->
