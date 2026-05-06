<template lang="pug">
main.page
  AppHeader(title="會員中心")
    template(#extra)
      el-button(type="warning" plain @click="handleDeposit") + 儲值 100 點

  el-tabs(v-model="activeTab" type="border-card")
    el-tab-pane(label="兌換商品" name="redeem")
      .product-scroll-container
        .product-grid
          ProductCard(
            v-for="p in products" 
            :key="p.id" 
            :product="p"
            @exchange="handleExchange"
          )

    el-tab-pane(label="我的兌換紀錄" name="coupons")
      .bar
        el-button(type="primary" plain @click="loadExchanges") 刷新
      DataTable(:data="exchanges" :columns="exchangeCols")

    el-tab-pane(label="點數流水帳" name="history")
      .bar
        el-button(type="primary" plain @click="loadTransactions") 刷新
      DataTable(:data="transactions" :columns="transactionCols")
          
FormDialog(
  v-model="exchangeDialogVisible"
  title="確認兌換"
  :form="exchangeForm"
  :fields="exchangeFields"
  :disabled="auth.me?.balance < totalPoints"
  @confirm="confirmExchange"
)
  template(#header)
    p 確定要兌換 #[strong {{ selectedProduct?.name }}] 嗎？
  template(#footer-content)
    .points-info(style="font-size: 13px; color: #aaa; margin-top: 10px;")
      p 目前點數：{{ auth.me?.balance }}
      p 兌換所需：{{ totalPoints }}
      p( :style="{ color: (auth.me?.balance - totalPoints) < 0 ? '#f56c6c' : '#67c23a' }") 
        | 剩餘點數：{{ auth.me?.balance - totalPoints }}
</template>

<script setup>
import { ElMessage } from "element-plus";
import { onMounted, ref, computed } from "vue";
import {
  depositPoints,
  exchangeProduct,
  listAllProducts,
  listMyExchanges,
  listMyTransactions,
} from "../../api/member";
import { useAuthStore } from "../../stores/auth";
import AppHeader from "../../components/AppHeader.vue";
import ProductCard from "../../components/ProductCard.vue";
import DataTable from "../../components/DataTable.vue";
import FormDialog from "../../components/FormDialog.vue";

const exchangeDialogVisible = ref(false);
const selectedProduct = ref(null);
const submitting = ref(false);

const exchangeCols = [
  { prop: "exchange_code", label: "兌換序號", width: "200" },
  { type: "product", label: "商品" },
  { prop: "status", label: "狀態", type: "status", statusType: "exchange", width: "80" },
  { prop: "created_at", label: "日期", type: "date", width: "135" },
];

const transactionCols = [
  { prop: "tx_type", label: "類型", width: "120" },
  { prop: "amount", label: "金額", width: "300"},
  { prop: "memo", label: "備註" },
  { prop: "is_success", label: "狀態", type: "status", statusType: "transaction", width: "80" },
  { prop: "created_at", label: "日期", type: "date", width: "135" },
];

const exchangeForm = ref({
  quantity: 1
});

const exchangeFields = computed(() => {
  const stock = selectedProduct.value?.stock ?? 0;
  const maxQuantity = Math.min(5, stock);

  return [
    { 
      label: '兌換數量', 
      prop: 'quantity', 
      type: 'number', 
      attrs: { 
        min: 1, 
        max: maxQuantity > 0 ? maxQuantity : 1
      } 
    }
  ];
});

const totalPoints = computed(() => {
  return (selectedProduct.value?.required_points || 0) * exchangeForm.value.quantity;
});

const auth = useAuthStore();
const activeTab = ref("redeem");

const products = ref([]);
const exchanges = ref([]);
const transactions = ref([]);

const loadProducts = async () => {
  products.value = (await listAllProducts()).filter(p => p.is_active);
};

const loadExchanges = async () => {
  exchanges.value = await listMyExchanges();
};

const loadTransactions = async () => {
  transactions.value = await listMyTransactions();
};

function handleExchange(product) {
  selectedProduct.value = product;
  exchangeForm.value.quantity = 1;
  exchangeDialogVisible.value = true;
}

async function confirmExchange() {
  if (!selectedProduct.value) return;
  submitting.value = true;
  try {
    await exchangeProduct(selectedProduct.value.id, exchangeForm.value.quantity);
    ElMessage.success(`成功兌換 ${exchangeForm.value.quantity} 個 ${selectedProduct.value.name}`);
    exchangeDialogVisible.value = false;
    await Promise.all([auth.bootstrap(), loadProducts(), loadExchanges(), loadTransactions()]);
  } finally {
    submitting.value = false;
  }
}

const handleDeposit = async () => {
  await depositPoints(100);
  ElMessage.success("儲值成功！已增加 100 點");
  await auth.bootstrap();
  await loadTransactions();
};

onMounted(() => {
  loadProducts();
  loadExchanges();
  loadTransactions();
});
</script>

<style scoped lang="sass">
.product-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
  gap: 20px
.product-scroll-container
  flex: 1
  min-height: 0
  overflow-y: auto
  padding: 4px
.product-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))
  gap: 20px
  padding-bottom: 20px
</style>
