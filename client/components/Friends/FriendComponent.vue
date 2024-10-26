<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { RouterLink } from 'vue-router';

const props = defineProps(["friend"])
const emit = defineEmits(["refreshFriends"]);

const removeFriend = async () => {
    try {
        await fetchy(`/api/friends/${props.friend}`, "DELETE");
    } catch {
        return;
    }
    emit("refreshFriends");
};

</script>

<template>
    <div>
        <v-card>
            <template v-slot:title>
                <router-link :to="{ name: 'UserProfile', params: { username: props.friend } }">
                    <p>{{ props.friend }}</p>
                </router-link>
            </template>
            <template v-slot:actions>
                <v-btn @click="removeFriend">Remove</v-btn>
            </template>
        </v-card>

    </div>
</template>

<style scoped>
.v-card{
    background-color:#DDA522 ;
}

.v-btn{
    background-color: black;
    color: white;
}

.v-btn:hover{
    color: black;
    background-color: white;
}
p{
    font-size: 1.5em;
    color:black;
}

p:hover,a:hover{
    color: white;
}


a{
    color:black;
}

</style>