<template lang="pug">
el-dialog(
  :model-value="modelValue"
  @update:model-value="$emit('update:modelValue', $event)"
  :title="title"
  :width="width"
  :center="center"
  destroy-on-close
)
  slot(name="header")

  el-form(v-if="fields.length" :model="form" label-position="left" label-width="80px")
    template(v-for="field in fields" :key="field.prop")
      el-form-item(:label="field.label" :prop="field.prop")
        el-input-number(v-if="field.type === 'number'" v-model="form[field.prop]" v-bind="field.attrs" style="width: 100%")
        el-input(v-else-if="field.type === 'textarea'" v-model="form[field.prop]" type="textarea" v-bind="field.attrs")
        el-select(v-else-if="field.type === 'select'" v-model="form[field.prop]" v-bind="field.attrs" style="width: 100%")
          el-option(v-for="opt in field.options" :key="opt.value" :label="opt.label" :value="opt.value")
        el-input(v-else v-model="form[field.prop]" v-bind="field.attrs")

  slot(name="footer-content")

  template(#footer)
    span.dialog-footer
      el-button(@click="$emit('update:modelValue', false)") 取消
      el-button(
        type="primary"
        :loading="loading"
        :disabled="disabled"
        @click="$emit('confirm')"
      ) {{ confirmText }}
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  loading: Boolean,
  disabled: Boolean,
  form: Object,
  fields: {
    type: Array,
    default: () => []
  },
  confirmText: {
    type: String,
    default: "確定"
  },
  width: { type: String, default: "400px" },
  center: { type: Boolean, default: false }
});

defineEmits(['update:modelValue', 'confirm']);
</script>