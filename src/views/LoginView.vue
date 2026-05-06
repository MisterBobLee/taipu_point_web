<template lang="pug">
.login-container
  .bg-glow
  el-card.login-card(shadow="always")
    .login-header
      .logo-icon
        el-icon(size="40" color="#409eff"): Lock
      h1.login-title TAIPU POINT
      p.login-subtitle 點數兌換管理系統

    el-form.login-form(label-position="top" @submit.prevent="onSubmit")
      el-form-item(label="帳號")
        el-input(
          v-model="username" 
          placeholder="請輸入帳號" 
          :prefix-icon="User"
        )
      
      el-form-item(label="密碼")
        el-input(
          v-model="password" 
          type="password" 
          placeholder="請輸入密碼" 
          :prefix-icon="Key" 
          show-password
        )
      
      el-button.submit-btn(
        type="primary" 
        native-type="submit" 
        :loading="loading"
      ) 登入系統

    .quick-login-section
      .login-subtitle 快速測試登入
      .quick-btns
        el-button(circle @click="quickLogin('admin', 'admin12345!')" title="管理員"): el-icon: StarFilled
        el-button(circle @click="quickLogin('teststore', 'store123!')" title="店家"): el-icon: Shop
        el-button(circle @click="quickLogin('testuser', 'user123!')" title="會員"): el-icon: UserFilled
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import { User, Key, Lock, StarFilled, Shop, UserFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const username = ref("");
const password = ref("");
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function onSubmit() {
  if (!username.value || !password.value) {
    ElMessage.warning("請輸入帳號與密碼"); 
    return;
  }
  
  loading.value = true;
  try {
    await auth.login({ username: username.value, password: password.value });
    ElMessage.success("登入成功，歡迎回來");
    await router.replace(auth.homePathForRole(auth.role));
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

async function quickLogin(u, p) {
  username.value = u;
  password.value = p;
  await onSubmit();
}
</script>
<style scoped lang="sass">
.login-container
  height: 100vh
  display: flex
  justify-content: center
  align-items: center
  background: #0f0f1a
  position: relative
  overflow: hidden

.bg-glow
  position: absolute
  width: 500px
  height: 500px
  background: radial-gradient(circle, rgba(64, 158, 255, 0.15) 0%, transparent 70%)
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 0

.login-card
  width: 100%
  max-width: 400px
  border: 1px solid rgba(255, 255, 255, 0.1) !important
  background: rgba(30, 30, 46, 0.8) !important
  backdrop-filter: blur(20px)
  border-radius: 16px
  padding: 20px

.login-header
  text-align: center
  margin-bottom: 30px

.logo-icon
  margin-bottom: 16px
  display: inline-flex
  padding: 12px
  background: rgba(64, 158, 255, 0.1)
  border-radius: 12px

.login-title
  margin: 0
  font-size: 28px
  letter-spacing: 2px
  color: #fff
  font-weight: 700

.login-subtitle
  margin: 8px 0 0
  color: #888
  font-size: 14px
  text-align: center

.login-form
  :deep(.el-form-item__label)
    color: #aaa
    padding-bottom: 4px
  :deep(.el-input__wrapper)
    background: rgba(0, 0, 0, 0.2)
    box-shadow: none
    border: 1px solid #333
    &:hover, &.is-focus
      border-color: #409eff

.submit-btn
  width: 100%
  height: 44px
  font-size: 16px
  font-weight: 600
  margin-top: 10px
  border-radius: 8px

.quick-login-section
  margin-top: 30px
  :deep(.el-divider__text)
    background: transparent
    color: #666
    font-size: 12px
  
.quick-btns
  display: flex
  justify-content: center
  gap: 20px
  margin-top: 10px
  .el-button
    background: rgba(255, 255, 255, 0.05)
    border: 1px solid #333
    color: #aaa
    &:hover
      color: #409eff
      border-color: #409eff
      background: rgba(64, 158, 255, 0.1)
</style>
