<template lang="pug">
.data-table-container
  el-table(:data="data" border stripe v-loading="loading" height="100%")
    template(v-for="col in columns" :key="col.prop || col.label")
      
      el-table-column(
        v-if="col.type === 'status'" 
        :label="col.label || '狀態'" 
        :width="col.width"
        header-align="center"
        align="center"
      )
        template(#default="{ row }")
          StatusTag(:status="row[col.prop]" :type="col.statusType")
          
      el-table-column(
        v-else-if="col.type === 'date'" 
        :label="col.label" 
        :width="col.width"
        header-align="center"
      )
        template(#default="{ row }")
          | {{ formatDate(row[col.prop]) }}
      
      el-table-column(
        v-else
        :prop="col.prop" 
        :label="col.label" 
        :width="col.width"
        header-align="center"
      )
        template(v-if="col.type === 'user'" #default="{ row }") 
          | {{ row.user_username || row.user }}
        template(v-else-if="col.type === 'product'" #default="{ row }") 
          | {{ row.product?.name || row.product }}

    el-table-column(
      v-if="$slots.action" 
      label="操作" 
      :width="actionWidth" 
      fixed="right"
      header-align="center"
      align="center"
    )
      template(#default="{ row }")
        slot(name="action" :row="row")
</template>

<script setup>
import StatusTag from "./StatusTag.vue";

defineProps({
  data: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  columns: { type: Array, required: true },
  actionWidth: { type: String, default: "80" },
  height: { type: [String, Number], default: null }
});

function formatDate(val) {
  if (!val) return "-";
  const date = new Date(val);
  if (isNaN(date.getTime())) return val; // 如果不是有效日期就原樣回傳
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  
  return `${y}-${m}-${d} ${hh}:${hh}`;
}
</script>