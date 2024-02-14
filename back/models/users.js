import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const cartSchema = new Schema({ // cartSchema 獨立，是為了結構清晰、能夠被重複使用，避免 schema / cart 欄位又重複定義。
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, '缺少商品欄位']
  },
  quantity: {
    type: Number,
    required: [true, '缺少商品數量']
  }
})

const schema = new Schema({
  account: {
    type: String,
    required: [true, '缺少使用者帳號'],
    minlength: [4, '使用者帳號長度不符'],
    maxlength: [20, '使用者帳號長度不符'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '使用者帳號格式錯誤'
    }
  },
  email: {
    type: String,
    required: [true, '缺少使用者信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '使用者信箱格式錯誤'
    }
  },
  password: {
    type: String,
    required: [true, '缺少使用者密碼']
  },
  phone: { // 平的電話版本而新增
    type: String,
    required: [true, '缺少使用者電話'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isMobilePhone(value, 'zh-TW')
      },
      message: '使用者電話格式錯誤'
    }
  },
  tokens: {
    type: [String]
  },
  cart: {
    type: [cartSchema]
  },
  role: { // 帳號權限識別
    type: Number, // 0: 一般使用者, 1: 管理員 (預設為 0)
    default: UserRole.USER // 使用 enums/UserRole.js 的統一設定，避免硬編碼
  }
}, {
  timestamps: true, // 為了產生時間戳記 (createdAt、updatedAt) ，用途：為了讓前端能夠知道資料的建立時間與更新時間
  versionKey: false // 為了避免 __v 這個欄位被加入到資料庫中
})

// schema.pre() 的存在意義
// schema.pre('save', function (next) {}) 是在保存文檔到 MongoDB 數據庫之前先執行的函數。
// function (next) {} 是一個回調函數，完成操作後需調用 next() 以繼續保存文檔。
// 這種模式常用於保存文檔前(save)的操作，如密碼雜湊或數據驗證。
schema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    if (user.password.length < 4 || user.password.length > 20) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度不符' }))
      next(error)
      return
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)

// -!1/18 前後端整合-不一定使用
// 可能用途：為了讓前端能夠知道購物車內商品的數量
schema.virtual('cartQuantity')
  .get(function () {
    return this.cart.reduce((total, current) => {
      return total + current.quantity
    }, 0)
  })
