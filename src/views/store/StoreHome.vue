<template lang="pug">
main.page
  AppHeader(title="店家中心")
  el-tabs(v-model="activeTab" type="border-card")
    el-tab-pane(label="我的商品" name="products")
      .bar
        el-button(type="primary" plain @click="loadProducts") 刷新
        el-button(type="success" plain @click="showCreateDialog = true") + 新增商品
      
      DataTable(:data="products" :columns="productCols")
        template(#action="{ row }")
          el-button(type="danger" size="small" plain :disabled="!row.is_active" @click="handleDelete(row.id)") 刪除

    el-tab-pane(label="核銷兌換" name="verify")
      .bar
        el-button(type="primary" plain @click="loadExchanges") 刷新
      DataTable(:data="exchanges" :columns="exchangeCols")
        template(#action="{ row }")
          el-button(type="success" size="small" plain :disabled="row.status !== 'PENDING'" @click="handleVerify(row.id)") 核銷

FormDialog(
  v-model="showCreateDialog"
  title="新增商品"
  :form="form"
  :fields="productFields"
  @confirm="submitCreate"
)
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import {
  createProduct,
  deleteStoreProduct,
  listStoreExchanges,
  listStoreProducts,
  verifyStoreExchange,
} from "../../api/store";
import AppHeader from "../../components/AppHeader.vue";
import DataTable from "../../components/DataTable.vue";
import FormDialog from "../../components/FormDialog.vue";

const activeTab = ref("products");
const showCreateDialog = ref(false);

const productCols = [
  { prop: "id", label: "ID", width: "80" },
  { prop: "name", label: "商品名稱" },
  { prop: "required_points", label: "點數", width: "100" },
  { prop: "stock", label: "庫存", width: "100" },
  { prop: "is_active", label: "狀態", type: "status", statusType: "product", width: "80" },
];

const exchangeCols = [
  { prop: "exchange_code", label: "序號", width: "200" },
  { type: "product", label: "商品" },
  { prop: "quantity", label: "數量", width: "80" },
  { prop: "status", label: "狀態", type: "status", statusType: "exchange", width: "80" },
];

const productFields = [
  { label: '商品名稱', prop: 'name', type: 'input' },
  { label: '點數', prop: 'required_points', type: 'number', attrs: { min: 0 } },
  { label: '庫存', prop: 'stock', type: 'number', attrs: { min: 0 } },
  { label: '備註', prop: 'memo', type: 'textarea', attrs: { rows: 3 } }
];

const products = ref([]);
const exchanges = ref([]);
const form = ref({ name: "", required_points: 10, stock: 100, memo: "" });

const loadProducts = async () => {
  products.value = await listStoreProducts();
};

const loadExchanges = async () => {
  exchanges.value = await listStoreExchanges();
};

const submitCreate = async () => {
  await createProduct(form.value);
  ElMessage.success("商品新增成功");
  showCreateDialog.value = false;
  form.value = { name: "", required_points: 10, stock: 100, memo: "" };
  await loadProducts();
};

const handleVerify = async (id) => {
  await verifyStoreExchange(id);
  ElMessage.success("核銷成功");
  await loadExchanges();
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      "確定要刪除此商品嗎？此操作不可恢復。",
      "警告",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await deleteStoreProduct(id);
    ElMessage.success("已刪除");
    await loadProducts();
  } catch (e) {}
};

onMounted(() => {
  loadProducts();
  loadExchanges();
});
</script>

