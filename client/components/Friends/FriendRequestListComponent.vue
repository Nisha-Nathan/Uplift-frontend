<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { onBeforeMount, ref } from 'vue';
import FriendRequestComponent from '@/components/Friends/FriendRequestComponent.vue';

const friendRequests = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

const getFriendRequests = async () => {
    try {
        const response = await fetchy("/api/friend/requests", "GET");
        friendRequests.value = response.friendRequests;
    } catch {
        return;
    }
};

onBeforeMount(async () => {
    await getFriendRequests();
    loaded.value = true;
});
</script>

<template>
    <div>
        <h2>Friend Requests:</h2>
        <section class="requests" v-if="loaded && friendRequests.length !== 0">
            <article v-for="friendRequest in friendRequests" :key="friendRequest._id">
                <FriendRequestComponent :friend="friendRequest" @refreshFriendRequests="getFriendRequests" />
            </article>
        </section>
        <p v-else-if="loaded">No Friend Requests found</p>
        <p v-else>Loading...</p>

    </div>


</template>