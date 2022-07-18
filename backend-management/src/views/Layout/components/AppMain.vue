<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <!-- <router-view :key="key"></router-view> -->
      <router-view></router-view>
    </transition>
  </section>
</template>

<script>
import {defineComponent} from 'vue'
export default defineComponent({
  name: 'AppMain',
  
})
</script>
