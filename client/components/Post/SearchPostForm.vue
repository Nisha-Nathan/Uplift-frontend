<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";

const author = ref("");
const emit = defineEmits(["getPostsByFilter"]);

const feedName = ref("");
let feeds = ref<Array<Record<string, string>>>([]);

const getFeeds = async () => {
  try {
    const result = await fetchy("/api/feeds", "GET");
    feeds.value = result.feeds;
  } catch (error) {
    console.error("Error fetching feeds:", error);
  }
};

onMounted(() => {
  getFeeds();
});
</script>

<template>
  <form @submit.prevent="emit('getPostsByFilter', author, feedName)" class="pure-form">
    <fieldset>
      <legend>Search by Feed</legend>
      <select id="feed" v-model="feedName">
        <option value="" disabled>Select a feed</option>
        <option value="">Home</option>
        <option v-for="feed in feeds" :key="feed._id" :value="feed.name">
          {{ feed.name }}
        </option>
      </select>
    </fieldset>
    <fieldset>
      <legend>Search by Author</legend>
      <input id="author" type="text" v-model="author" placeholder="Username" />

    </fieldset>
    <button type="submit" class="pure-button pure-button-primary">Search</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
