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

export default model('users', schema)