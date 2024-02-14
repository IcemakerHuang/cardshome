// 有組合式先不用
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API
})
