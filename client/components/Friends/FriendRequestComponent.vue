<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { fetchy } from '@/utils/fetchy';
import { storeToRefs } from 'pinia';

const { currentUsername } = storeToRefs(useUserStore());

const props = defineProps(["friend"])
const emit = defineEmits(["refreshFriendRequests"]);

const acceptFriendRequest = async () => {
    try {
        await fetchy(`/api/friend/accept/${props.friend.from}`, "PUT");
    } catch {
        return;
    }
    emit("refreshFriendRequests");
};

const rejectFriendRequest = async () => {
    try {
        await fetchy(`/api/friend/reject/${props.friend.from}`, "PUT");
    } catch {
        return;
    }
    emit("refreshFriendRequests");
};

</script>

<template>
    <div>
        <v-card v-if="props.friend.to == currentUsername && props.friend.status == 'pending'">
            <template v-slot:title>
                <router-link :to="{ name: 'UserProfile', params: { username: props.friend.from } }">
                    <p>{{ props.friend.from }}</p>
                </router-link>
            </template>
            <template v-slot:actions>
                <v-btn @click="acceptFriendRequest">Accept</v-btn>
                <v-btn @click="rejectFriendRequest">Reject</v-btn>
            </template>
        </v-card>
    </div>
</template>