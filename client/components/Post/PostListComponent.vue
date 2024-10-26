<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let currentFeedName = ref("");
const dialog = ref(false);

async function getPosts(feedName?: string) {
  let query: Record<string, string> = {};

  if (feedName) {
    query.feedName = feedName;
  }
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  posts.value = postResults.posts;
  currentFeedName.value = postResults.feedName;

}

function updateEditing(id: string) {
  editing.value = id;
}

function openDialog() {
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">

    <nav>
      <p id="feed">{{ currentFeedName }}</p>
      <SearchPostForm @getPostsByFilter="getPosts" />
    </nav>

    <v-btn elevation="4" icon="mdi-plus" @click="openDialog"></v-btn>

    <v-dialog v-model="dialog" max-width="600">
      <v-sheet class="pa-4 text-center mx-auto" elevation="12" rounded="lg" width="100%">
        <h2>Create a post:</h2>
        <CreatePostForm @refreshPosts="getPosts" @closeDialog="closeDialog" />
      </v-sheet>
    </v-dialog>

    <div class="row">

    </div>
    <section class="posts" v-if="loaded && posts.length !== 0">
      <article v-for="post in posts" :key="post._id">
        <PostComponent v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
        <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      </article>
    </section>
    <p v-else-if="loaded">No posts found</p>
    <p v-else>Loading...</p>
  </section>
</template>

<style scoped>
.v-btn {
  background-color: black;
  color: white;
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 1em;
}

.v-btn:hover {
  color: black;
  background-color: white;
}

nav {
  padding: 1em 2em;
  background-color: black;
  display: flex;
  align-items: center;
  width: 100%;
  color: white;
  justify-content: space-between;
  align-items: center;
}

#feed {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  position: relative;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
