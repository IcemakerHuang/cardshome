// -! add

// 定義商品Schema
import { Schema, model } from 'mongoose'

const schema = new Schema({
  name: {
    type: String,
    required: [true, '缺少商品名稱']
  },
  price: {
    type: Number,
    required: [true, '缺少商品價格']
  },
  image: {
    type: String,
    required: [true, '缺少商品圖片']
  },
  description: {
    type: String,
    required: [true, '缺少商品說明']
  },
  category: {
    type: String,
    required: [true, '缺少商品分類'],
    enum: {
      values: ['衣服', '食品', '3C', '遊戲'],
      message: '商品分類錯誤'
    }
  },
  sell: {
    type: Boolean,
    required: [true, '缺少商品上架狀態']
  }
}, {
  timestamps: true, // 出現建立日期和更新日期
  versionKey: false // 不會出現_V
})

export default model('products', schema)
