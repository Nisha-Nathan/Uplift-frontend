<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { onBeforeMount, ref } from 'vue';
import FriendComponent from '@/components/Friends/FriendComponent.vue';

const friends = ref<Array<Record<string, string>>>([]);
const loaded = ref(false)

const getFriends = async () => {
    try {
        const response = await fetchy("/api/friends", "GET");
        friends.value = response.friends;

    } catch {
        return;

    }
};

onBeforeMount(async () => {
    await getFriends();
    loaded.value = true;
});
</script>

<template>
    <div>
        <h2>Friends:</h2>
        <section class="friends" v-if="loaded && friends.length !== 0">
            <article v-for="friend in friends" :key="friend._id">
                <FriendComponent :friend="friend" @refreshFriends="getFriends" />
            </article>
        </section>
        <p v-else-if="loaded">No Friends found</p>
        <p v-else>Loading...</p>
    </div>


</template>