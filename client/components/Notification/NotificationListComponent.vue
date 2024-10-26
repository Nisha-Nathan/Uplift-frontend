<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { fetchy } from '@/utils/fetchy';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref } from 'vue';
import NotificationComponentPending from './NotificationComponentPending.vue';
import CreateNotificationForm from './CreateNotificationForm.vue';

const notifications = ref<Array<Record<string, string>>>([]);
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);

const getPendingNotifications = async () => {
    try {
        const response = await fetchy("/api/notifications/pending", "GET");
        notifications.value = response.pendingNotifications;
    } catch {
        return;
    }
};

onBeforeMount(async () => {
    await getPendingNotifications();
    loaded.value = true;
});
</script>

<template>
    <section v-if="isLoggedIn">
        <h2>Create a Notification:</h2>
        <CreateNotificationForm @refreshNotifications="getPendingNotifications" />

        <h2>Pending Notifications:</h2>
        <section class="notifications" v-if="loaded && notifications.length !== 0">
            <div class="notification" v-for="notification in notifications" :key="notification._id">
                <NotificationComponentPending :notification="notification"
                    @refreshNotifications="getPendingNotifications" />
            </div>
        </section>
        <p v-else-if="loaded">No Pending notifications found</p>
        <p v-else>Loading...</p>
    </section>
</template>