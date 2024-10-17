<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const feedName = ref("");
const feedDescription = ref("");

const createFeed = async (feedName: string, feedDescription: string) => {
    try {
        await fetchy("/api/feed", "POST", {
            body: { name:feedName, feedDescription },
        });
    } catch (_) {
        return;
    }
    emptyForm();
};


const emptyForm = () => {
    feedName.value = "";
};

</script>

<template>
    <form @submit.prevent="createFeed(feedName, feedDescription)" class="pure-form">
        <legend>Create a new feed</legend>
        <input type="text" id="feedName" v-model="feedName" placeholder="new feed" required> </input>
        <textarea id="feedDescription" v-model="feedDescription" placeholder="Provide a short description of your feed"
            required> </textarea>
        <button type="submit" class="pure-button-primary pure-button">Create Feed</button>
    </form>
</template>

<style scoped>
form {
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
  width: 30em;
}

</style>

