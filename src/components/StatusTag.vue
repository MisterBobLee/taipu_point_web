<template lang="pug">
el-tag(:type="tagConfig.type" :size="size" :effect="effect")
  | {{ tagConfig.label }}
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: [String, Boolean],
    required: true
  },
  type: {
    type: String,
    default: 'exchange'
  },
  size: {
    type: String,
    default: 'small'
  },
  effect: {
    type: String,
    default: 'light'
  }
});

const tagConfig = computed(() => {
  if (props.type === 'exchange') {
    return props.status === 'VERIFIED' 
      ? { type: 'success', label: '已核銷' }
      : { type: 'warning', label: '待核銷' };
  }

  if (props.type === 'product') {
    return props.status
      ? { type: 'success', label: '上架中' }
      : { type: 'info', label: '已下架' };
  }

  if (props.type === 'transaction') {
    return props.status
      ? { type: 'success', label: '成功' }
      : { type: 'danger', label: '失敗' };
  }

  return { type: 'info', label: props.status };
});
</script>