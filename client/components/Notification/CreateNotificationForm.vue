<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { ref } from 'vue';

const notifyAbout = ref("");
const frequency = ref("daily");
const timeFrame = ref("morning");
const emit = defineEmits(["refreshNotifications"]);

const createNotification = async () => {
    try {
        await fetchy("/api/notifications", "POST", {
            body: {
                notifyAbout: notifyAbout.value,
                frequency: frequency.value,
                timeFrame: timeFrame.value,
            },
        });
        emit("refreshNotifications");
    } catch (_) {
        return;
    }
    emptyForm();
};

const emptyForm = () => {
    notifyAbout.value = "";
    frequency.value = "daily";
    timeFrame.value = "morning";
};
</script>

<template>
    <v-sheet class="mx-auto" width="300">
        <v-form @submit.prevent="createNotification">
            <!-- Notify About Field -->
            <v-text-field
                v-model="notifyAbout"
                label="Notify About"
                required
            ></v-text-field>

            <!-- Frequency Field (Daily/Weekly) -->
            <v-select
                v-model="frequency"
                :items="['daily', 'weekly']"
                label="Frequency"
                required
            ></v-select>

            <!-- Time Frame Field (Morning/Noon/Evening) -->
            <v-select
                v-model="timeFrame"
                :items="['morning', 'noon', 'evening']"
                label="Time Frame"
                required
            ></v-select>

            <!-- Submit Button -->
            <v-btn type="submit" color="primary">Create Notification</v-btn>
        </v-form>   
    </v-sheet>
</template>

<style scoped>
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
</style>
