<template lang="pug">
el-card.product-card(shadow="hover")
  template(#header)
    b.product-card__name {{ product.name }}
  
  .product-card__body
    .product-card__info
      p.product-card__points 點數: #[el-tag(type="warning" size="small") {{ product.required_points }}]
      p.product-card__stock 庫存: {{ product.stock }}
      p.product-card__memo(v-if="product.memo") {{ product.memo }}
    
    el-button.product-card__btn(
      type="primary" 
      plain
      :disabled="product.stock <= 0" 
      @click="$emit('exchange', product)"
    ) {{ product.stock > 0 ? '兌換' : '庫存不足' }}
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
});

defineEmits(['exchange']);
</script>

<style scoped lang="sass">
.product-card
  display: flex
  flex-direction: column
  height: 100%

.product-card__name
  font-size: 16px

.product-card__body
  display: flex
  flex-direction: column
  justify-content: space-between
  height: 100%

.product-card__info
  p
    margin: 6px 0
    font-size: 14px

.product-card__memo
  font-size: 12px
  color: #999
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden

.product-card__btn
  width: 100%
  margin-top: auto
</style>