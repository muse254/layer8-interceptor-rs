<script setup>
import { RouterView } from "vue-router";
import { initEncryptedTunnel } from 'layer8-interceptor-rs'
const BACKEND_URL =  import.meta.env.VITE_BACKEND_URL
const PROXY_URL =  import.meta.env.VITE_PROXY_URL

try{
  initEncryptedTunnel({
    providers: [BACKEND_URL],
    proxy: PROXY_URL
  }, "dev")
}catch(err){
  console.log(".initEncryptedTunnel error: ", err)
}
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style scoped>
</style>
