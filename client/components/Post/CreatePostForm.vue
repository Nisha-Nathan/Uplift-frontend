<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPosts", "closeDialog"]);

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


const createPost = async (content: string, feedName: string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { content, feedName },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emit("closeDialog");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  feedName.value = "";
};

// Load feeds when the component is mounted
onMounted(() => {
  getFeeds();
});
</script>

<template>
  <form @submit.prevent="createPost(content, feedName)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>

    <label for="feed">Post to:</label>
    <v-combobox required variant="outlined" label="Choose a feed" v-model="feedName"
      :items="feeds.map(feed => feed.name)"></v-combobox>

    <v-btn type="submit" color="primary">Create Post</v-btn>
    <v-btn @click='emit("closeDialog")' color="error">Cancel</v-btn>

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

input,
textarea,
form,
select {
  border-style: solid;
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
