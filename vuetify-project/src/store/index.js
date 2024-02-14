// Utilities
import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate' // -! add

const pinia = createPinia() // -! add
pinia.use(persistedstate) // -! add

export default createPinia()
