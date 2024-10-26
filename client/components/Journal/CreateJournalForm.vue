<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const title = ref("");
const content = ref("");
const emit = defineEmits(["refreshJournals"]);

const createJournalEntry = async (title: string, content: string) => {
    try {
        await fetchy("/api/journals", "POST", {
            body: { title, content },
        });
    } catch (_) {
        return;
    }
    emit("refreshJournals");
    emptyForm();
};

const emptyForm = () => {
    title.value = "";
    content.value = "";
};
</script>

<template>
    <form @submit.prevent="createJournalEntry(title, content)">
        <label for="title">Journal Title:</label>
        <input id="title" v-model="title" placeholder="Title" required />

        <label for="content">Journal Entry:</label>
        <textarea id="content" v-model="content" placeholder="Write your journal entry here!" required> </textarea>

        <button type="submit" class="pure-button-primary pure-button">Create Journal Entry</button>
    </form>
</template>

<style scoped>
form {
    background-color: var(--base-bg);
    border-style: solid;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 1em;
}

input, textarea{
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