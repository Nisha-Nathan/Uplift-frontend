<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';

const props = defineProps(["notification"]);
const emit = defineEmits(["refreshNotifications"]);

const deleteNotification = async () => {
    try {
        await fetchy(`/api/notifications/${props.notification._id}`, "DELETE");
    } catch (_) {
        return;
    }
    emit("refreshNotifications");
}



</script>

<template>
    <v-card>
        <v-card-title>{{ notification.notifyAbout }}</v-card-title>
        <v-card-subtitle>{{ notification.notificationTime }}</v-card-subtitle>
        <v-btn @click="deleteNotification">Delete</v-btn></v-card>
</template>

<style scoped>
.v-card {
    background-color: #DDA522;
    padding: 1px;
}

.v-card-title {
    font-size: 1.5em;
    color: black;
    font-weight: bold;
}

.v-card-subtitle{
    margin-top:-10px;
    font-weight: bold;
    margin-bottom:15px;
}


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
</style>