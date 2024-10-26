<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
   
    <!-- <h1>Home Page</h1> -->
    <section>
      <h1 v-if="!isLoggedIn">Please login or register so you can continue your journey to Positivity</h1>
    </section>
    <PostListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
