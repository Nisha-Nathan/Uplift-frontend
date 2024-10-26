<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchy } from '@/utils/fetchy';
import EditJournalForm from '@/components/Journal/EditJournalForm.vue';

const route = useRoute();
const router = useRouter();
const journalId = route.params.id;
const journal = ref<Record<string, string> | null>(null);

const getJournalEntry = async () => {
    try {
        const response = await fetchy(`/api/journal/${journalId}`, 'GET');
        journal.value = response.journal;
    } catch (error) {
        console.error('Error fetching journal entry:', error);
    }
};

const goBack = () => {
    router.push({ name: 'Journal' });
};

onMounted(() => {
    getJournalEntry();
});
</script>

<template>
    <v-contaner>
        <v-btn @click="goBack" >Back</v-btn>
        <div v-if="journal">
            <EditJournalForm :journal="journal" @editJournal="goBack" />
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </v-contaner>
</template>

<style scoped>
.v-btn {
    background-color: black;
    color: white;
    margin:2%;
    
}

.v-btn:hover {
    color: black;
    background-color: white;
}
</style>