<template>
<!-- 導覽列 -->
<VAppBar color="primary">
  <VContainer class="d-flex align-center">
    <VBtn to="/" :active="false">
      <VAppBarTitle>購物網</VAppBarTitle>
    </VBtn>
  </VContainer>

  <VSpacer></VSpacer>
  <!-- 電腦版導覽列 -->
    <template v-for="item in navItems" :key="item.to">
      <VBtn :to="item.to" :prepend-icon="item.icon">{{ item.text }}
        <v-dialog
        v-model="dialog"
        activator="parent"
        width="auto"
      >
        <v-card min-width="800">
          <v-tabs
            v-model="tab"
            bg-color="primary"
          >
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
  <RouterView></RouterView>
</VMain>
</template>

<script setup>
import { ref } from 'vue'
import Register from '@/components/UserRegister.vue'
import Login from '@/components/UserLogin.vue'

const tab = ref('one')

// 導覽列項目
const navItems = [
  { to: '/register', text: '註冊', icon: 'mdi-account-plus' },
  { to: '/login', text: '登入', icon: 'mdi-login' }
]
</script>
