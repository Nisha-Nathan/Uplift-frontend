<script setup lang="ts">
import CreateJournalForm from "./CreateJournalForm.vue";
import JournalEntryComponent from "./JournalEntryComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";

const tab = ref(1);


const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let journals = ref<Array<Record<string, string>>>([]);
const router = useRouter();
let editing = ref("");

async function getJournals() {
  let journalResults;
  try {
    journalResults = await fetchy("/api/journals", "GET");
  } catch (_) {
    return;
  }
  journals.value = journalResults.journals;
}

const goToJournalEntry = (id: string) => {
  router.push({ name: 'JournalEntry', params: { id } });
};

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getJournals();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <v-card>
      <!-- Tabs at the top to switch between different components -->
      <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-4">
        <v-tab :value="1">Journals</v-tab>
        <v-tab :value="2">Create Journal</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item :value="1">
          <v-container fluid>
            <section class="journals" v-if="loaded && journals.length !== 0">
              <article v-for="journal in journals" :key="journal._id" @click="goToJournalEntry(journal._id)">
                <JournalEntryComponent v-if="editing !== journal._id" :journalEntry="journal"
                  @refreshJournal="getJournals" @editJournal="updateEditing" />
              </article>
            </section>
            <p v-else-if="loaded">No Journal Entries found</p>
            <p v-else>Loading...</p>
          </v-container>
        </v-tabs-window-item>

        <v-tabs-window-item :value="2">
          <v-container fluid>
            <CreateJournalForm @refreshJournals="getJournals" />
          </v-container>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card>
  </section>
</template>

<style scoped>
.v-card{
  width: 100%;
}

section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}


section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: #DDA522;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding:1em;
  width: 90%;
}

.journals {
  padding: 1em;
  justify-items: flex-start;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
