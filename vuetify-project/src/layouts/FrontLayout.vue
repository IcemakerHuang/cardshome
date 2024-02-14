<template>
<!-- 導覽列 -->
<VAppBar color="primary">
  <VContainer class="d-flex align-center">
    <VBtn to="/" :active="false">
      <VAppBarTitle>卡底家</VAppBarTitle>
    </VBtn>
  </VContainer>
  <VContainer class="d-flex flex-row-reverse">
    <VBtn to="/" :active="false">
      <VAppBarTitle>論壇</VAppBarTitle>
    </VBtn>
    <VBtn to="/" :active="false">
      <VAppBarTitle>認同卡</VAppBarTitle>
    </VBtn>
    <VBtn to="/" :active="false">
      <VAppBarTitle>討論區</VAppBarTitle>
    </VBtn>
  </VContainer>
  <VSpacer></VSpacer>
  <!-- 電腦版導覽列 -->
    <template v-for="item in navItems" :key="item.to">
      <VBtn :to="item.to" :prepend-icon="item.icon">{{ item.text }}
        <v-dialog
        v-model="dialog"
        activator="parent"
        width="auto">
        <v-card min-width="600">
          <v-tabs
          v-model="tab"
          bg-color="primary">
            <v-tab value="one">登入</v-tab>
            <v-tab value="two">註冊</v-tab>
          </v-tabs>

          <VCardText>
            <VWindow v-model="tab">
          <Register></Register>
          <Login></Login>
            </VWindow>
          </VCardText>
          <v-card-actions>
          </v-card-actions>
        </v-card>
      </v-dialog>
      </VBtn>
    </template>
</VAppBar>
  <!-- 頁面內容 -->
<VMain>
  <RouterView :key="$route.path"></RouterView>
</VMain>
</template>

<script setup>
import { ref, computed } from 'vue'
import Register from '@/components/UserRegister.vue'
import Login from '@/components/UserLogin.vue'
// import { useDisplay } from 'vuetify' // 應該是手機版
import { useUserStore } from '@/store/user'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useRouter } from 'vue-router'

const tab = ref('one')
// -! add
const { apiAuth } = useApi()
const router = useRouter()
const createSnackbar = useSnackbar()
const user = useUserStore()

// 導覽列項目
// const navItems = [
//   // { to: '/register', text: '註冊', icon: 'mdi-account-plus' },
//   { to: '/login', text: '登入', icon: 'mdi-login' }
// ]
const navItems = computed(() => {
  return [
    { to: '/register', text: '註冊', icon: 'mdi-account-plus', show: !user.isLogin },
    { to: '/login', text: '登入', icon: 'mdi-login', show: !user.isLogin },
    { to: '/cart', text: '購物車', icon: 'mdi-cart', show: user.isLogin },
    { to: '/orders', text: '訂單', icon: 'mdi-list-box', show: user.isLogin },
    { to: '/admin', text: '管理', icon: 'mdi-cog', show: user.isLogin && user.isAdmin }
  ]
})

// -! add
const logout = async () => {
  try {
    await apiAuth.delete('/users/logout')
    user.logout()
    createSnackbar({
      text: '登出成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    router.push('/')
  } catch (error) {
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
}
</script>
