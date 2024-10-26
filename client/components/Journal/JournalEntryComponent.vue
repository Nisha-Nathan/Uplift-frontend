<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { formatDate } from '@/utils/formatDate';
import { storeToRefs } from 'pinia';
import { fetchy } from '../../utils/fetchy';

const props = defineProps(["journalEntry"]);
const emit = defineEmits(["editJournal", "refreshJournal"]);

const { currentUsername } = storeToRefs(useUserStore());

const deleteJournalEntry = async () => {
  try {
    await fetchy(`/api/journal/${props.journalEntry._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshJournal");
};

</script>

<template>

  <v-card class="mx-auto text-white" color="#000000" max-width="800">
    <v-card-title class="text-h5">

      <p class="title">{{ props.journalEntry.title }}</p>
    </v-card-title>

    <v-card-text class="text-h5 py-2 ">
      {{ props.journalEntry.content.substring(0, 200) }}

    </v-card-text>
    <v-card-subtitle>
      <p v-if="props.journalEntry.dateCreated !== props.journalEntry.dateUpdated">Edited on: {{
        formatDate(props.journalEntry.dateUpdated) }}
      </p>
      <p v-else>Created on: {{ formatDate(props.journalEntry.dateCreated) }}</p>
    </v-card-subtitle>

    <v-card-actions>
      <div v-if="props.journalEntry.author == currentUsername">
        <v-btn icon="mdi-pen" @click="emit('editJournal', props.journalEntry._id)"></v-btn>
        <v-btn color="error" icon="mdi-delete" @click="deleteJournalEntry"></v-btn>

      </div>


    </v-card-actions>
  </v-card>
</template>


<style scoped>

.v-card {
  align-self: flex-start;
  width: 100%;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}




</style>
