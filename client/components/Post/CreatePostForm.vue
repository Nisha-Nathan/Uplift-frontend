<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts"]);

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


const createPost = async (content: string, feedName:string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { content , feedName},
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  feedName.value= "";
};

// Load feeds when the component is mounted
onMounted(() => {
  getFeeds();
});
</script>

<template>
  <form @submit.prevent="createPost(content,feedName)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>

    <label for="feed">Select Feed:</label>
    <select id="feed" v-model="feedName" required>
      <option value="" disabled>Select a feed</option>
      <option v-for="feed in feeds" :key="feed._id" :value="feed.name"> 
        {{ feed.name }}
      </option>
    </select>
    
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
