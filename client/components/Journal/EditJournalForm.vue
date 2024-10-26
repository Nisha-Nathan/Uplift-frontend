<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDate } from "@/utils/formatDate";

const props = defineProps(["journal"]);
const title = ref(props.journal.title);
const content = ref(props.journal.content);
const emit = defineEmits(["editJournal", "refreshJournals"]);

const editJournal = async (title: string, content: string) => {
    try {
        await fetchy(`/api/journal/${props.journal._id}`, "PATCH", { body: { title: title, content: content } });
    } catch (e) {
        return;
    }
    emit("editJournal");
    emit("refreshJournals");
};

</script>

<template>
    <form @submit.prevent="editJournal(title, content)">
        <label for="title">Journal Title:</label>
        <input id="title" v-model="title" placeholder="Title" required />

        <label for="content">Journal Entry:</label>
        <textarea id="content" v-model="content" placeholder="Write your journal entry here!" required> </textarea>
        <div class="base">
            <menu>
                <li> <v-btn class="mt-2" type="submit" block>Save</v-btn></li>
                <li><v-btn class="mt-2" @click="emit('editJournal')" block>Cancel</v-btn></li>
            </menu>
            <p v-if="props.journal.dateCreated !== props.journal.dateUpdated" class="timestamp">Edited on: {{
                formatDate(props.journal.dateUpdated) }}</p>
            <p v-else class="timestamp">Created on: {{ formatDate(props.journal.dateCreated) }}</p>
        </div>
    </form>

</template>

<style scoped>
.v-btn {
    background-color: black;
    color: white;
    margin-bottom: 15px;
    margin-left: 15px;
}

.v-btn:hover {
    color: black;
    background-color: white;
}
form {
    background-color: var(--base-bg);
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    border-style: solid;
    border-radius: 1em;
    margin: 1em;
    margin-top: 1%;
}

input,
textarea {
    border-style: solid;
    margin-left: 1em;
    margin-right: 1em;
}

label {
    margin-top: 15px;
    margin-left: 1em;
    font-weight: bold;
}

textarea {
    font-family: inherit;
    font-size: inherit;
    height: 6em;
    border-radius: 4px;
    resize: none;
}

p {
   margin-right:1em;
}

.title {
    font-weight: bold;
    font-size: 1.2em;
}

menu {
    list-style-type: none;
    display: flex;
    flex-direction: row;
    gap: 1em;
    padding: 0;
    margin: 0;
}

.base {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.timestamp {
    display: flex;
    justify-content: flex-end;
    font-size: 0.9em;
    font-style: italic;
}
</style>
