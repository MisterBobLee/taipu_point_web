<template lang="pug">
main.page
  AppHeader(title="管理員中心")
  el-tabs(v-model="activeTab" type="border-card")
    el-tab-pane(label="點數流水帳" name="tx")
      .bar
        el-button(type="primary" plain :loading="txLoading" @click="loadTransactions") 刷新
      DataTable(:data="txRows" :loading="txLoading" :columns="txCols")
    el-tab-pane(label="兌換紀錄" name="ex")
      .bar
        el-button(type="primary" plain :loading="exLoading" @click="loadExchanges") 刷新
        .lookup__title 按序號查詢
        el-input.grow(v-model="lookupCode" placeholder="序號" clearable @clear="loadExchanges")
        el-button(@click="doLookup") 查詢
      el-scrollbar(v-if="lookupResult" style="height: 240px;")
        pre.mono {{ JSON.stringify(lookupResult, null, 2) }}
      DataTable(:data="exRows" :loading="exLoading" :columns="exCols")
        template(#action="{ row }")
          el-button(type="success" size="small" plain :disabled="row.status !== 'PENDING'" @click="doVerify(row.id)") 驗證
    el-tab-pane(label="商品" name="prod")
      .bar
        el-button(type="primary" plain :loading="prodLoading" @click="loadProducts") 刷新
      DataTable(:data="prodRows" :loading="prodLoading" :columns="prodCols")
        template(#action="{ row }")
          el-button(type="danger" size="small" plain :disabled="!row.is_active" @click="doSoftDeleteProduct(row.id)") 刪除
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import {
  deleteProduct,
  listPointExchanges,
  listPointTransactions,
  listProducts,
  lookupExchangeByCode,
  verifyExchange,
} from "../../api/admin.js";
import AppHeader from "../../components/AppHeader.vue";
import DataTable from "../../components/DataTable.vue";

const activeTab = ref("tx");

const txCols = [
  { prop: "id", label: "ID", width: "90" },
  { prop: "amount", label: "金額" },
  { prop: "tx_type", label: "類型", width: "140" },
  { prop: "is_success", label: "狀態", type: "status", statusType: "transaction", width: "80" },
  { prop: "created_at", label: "日期", type: "date", width: "135" },
];

const exCols = [
  { prop: "id", label: "ID", width: "90" },
  { prop: "exchange_code", label: "序號" },
  { type: "user", label: "用戶" },
  { type: "product", label: "商品" },
  { prop: "quantity", label: "數量", width: "80" },
  { prop: "points_spent", label: "點數", width: "110" },
  { prop: "status", label: "狀態", type: "status", statusType: "exchange", width: "80" },
];
const prodCols = [
  { prop: "id", label: "ID", width: "90" },
  { prop: "name", label: "商品名稱" },
  { prop: "required_points", label: "點數", width: "110" },
  { prop: "stock", label: "庫存", width: "100" },
  { prop: "is_active", label: "狀態", type: "status", statusType: "product", width: "80" },
];

async function doVerify(id) {
  await verifyExchange(id); 
  ElMessage.success("驗證成功");
  await loadExchanges();
}

async function doSoftDeleteProduct(id) {
  try {
    await ElMessageBox.confirm(`確定要刪除商品 ID: ${id} 嗎？`, "警告", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteProduct(id);
    ElMessage.success("商品已刪除");
    await loadProducts();
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error(e?.response?.data?.detail || "刪除失敗");
    }
  }
}

const txLoading = ref(false);
const txRows = ref([]);
const txType = ref("");
const txSuccess = ref("");

async function loadTransactions() {
  txLoading.value = true;
  try {
    const params = { tx_type: txType.value, is_success: txSuccess.value };
    txRows.value = await listPointTransactions(params);
  } finally {
    txLoading.value = false;
  }
}

const exLoading = ref(false);
const exRows = ref([]);
const exStatus = ref("");
const exProductId = ref("");

async function loadExchanges() {
  exLoading.value = true;
  try {
    const params = {};
    if (exStatus.value) params.status = exStatus.value;
    if (exProductId.value) params.product = exProductId.value;

    exRows.value = await listPointExchanges(params);
  } finally {
    exLoading.value = false;
    lookupResult.value = null;
    lookupCode.value = "";
  }
}

const lookupCode = ref("");
const lookupResult = ref(null);

async function doLookup() {
  try {
  const data = await lookupExchangeByCode(lookupCode.value);
    lookupResult.value = data;
    if (data) {
      exRows.value = [data];
    }
  } catch (e) {
  }
}

const prodLoading = ref(false);
const prodRows = ref([]);

async function loadProducts() {
  prodLoading.value = true;
  try {
    prodRows.value = await listProducts();
  } finally {
    prodLoading.value = false;
  }
}

onMounted(() => {
  loadProducts();
  loadTransactions();
  loadExchanges();
});
</script>

<style scoped lang="sass">
.title
  margin: 0 0 6px
.meta
  margin: 0
  opacity: .75
  font-size: 13px
.tbl
  width: 100%
.lookup__title
  font-weight: 600
.mono
  margin: 0
  font-size: 12px
</style>
