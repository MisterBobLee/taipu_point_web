<template lang="pug">
header.app-header
  div.app-header__info
    h1.app-header__title {{ title }}
    p.app-header__meta {{ meText }}
  div.app-header__actions
    slot(name="extra")
    el-button(type="danger" plain @click="handleLogout") 登出
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const auth = useAuthStore();
const router = useRouter();

const meText = computed(() => {
  const m = auth.me;
  if (!m) return "載入中...";
  const roleName = m.role === 'ADMIN' ? '管理員' : (m.role === 'STORE' ? '店家' : '會員');
  
  const isMember = m.role === 'MEMBER';
  if (isMember) {
    return `${m.username} (${roleName}) / 餘額: ${m.balance}`;
  } else {
    return `${m.username} (${roleName})`;
  }
});

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped lang="sass">
.app-header
  display: flex
  justify-content: space-between
  align-items: flex-start
  margin-bottom: 20px
  padding-bottom: 15px
  border-bottom: 1px solid #eee

.app-header__title
  margin: 0 0 4px
  font-size: 24px

.app-header__meta
  margin: 0
  font-size: 13px
  font-weight: 800
  color: #666

.app-header__actions
  display: flex
  gap: 12px
  align-items: center
</style>
