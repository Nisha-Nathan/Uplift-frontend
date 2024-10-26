<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { ref, onMounted } from 'vue';

const notifications = ref<Array<Record<string, string>>>([]);

const getNotifications = async () => {
    try {
        const response = await fetchy("/api/notifications", "GET");
        notifications.value = response.deliveredNotifications;
    } catch {
        return;
    }
};

onMounted(() => {
    getNotifications();
});

</script>

<template>
    <div class="notification" v-for="notification in notifications" :key="notification._id">
        <v-alert type="success" dismissible>
            <p>{{ notification.notificationContent }}</p>
        </v-alert>

    </div>

</template>

<style scoped>
.notification-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 10px;
    z-index: 1000;
}
</style>