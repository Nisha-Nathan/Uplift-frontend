<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchy } from '@/utils/fetchy';
import PostComponent from '@/components/Post/PostComponent.vue';

const route = useRoute();
const username = computed(() => route.params.username as string);
const user = ref<{ username: string } | null>(null);
const posts = ref<Array<Record<string, string>>>([]);
const isFriended = ref(false);

const getUserData = async () => {
  try {
    const response = await fetchy(`/api/users/${username.value}`, 'GET');
    user.value = response.user;
    posts.value = response.posts;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const sendFriendRequest = async () => {
  try {
    isFriended.value = true;
    await fetchy(`/api/friend/requests/${username.value}`, 'POST');
 
  } catch (error) {
    console.error('Error sending friend request:', error);
  }
};

const removeFriendRequest = async () => {
  try {
    await fetchy(`/api/friend/requests/${username.value}`, 'DELETE');
    isFriended.value = false;
  } catch (error) {
    console.error('Error removing friend request:', error);
  }
};

onMounted(() => {
   getUserData();
});

watch(username, () => {
  getUserData();
});

</script>

<template>
<v-container>
    <v-row>
      <v-col cols="12">
        <h1>{{ user?.username}}</h1> 
        <v-btn v-if="isFriended" @click="removeFriendRequest" color="error">Remove Friend</v-btn>
        <v-btn v-else @click="sendFriendRequest" color="primary">Add Friend</v-btn>
      </v-col>
    </v-row>
    <v-row style="width: fit-content;">
      <v-col cols="12" >
        <h2>Posts</h2>
        <v-list>
          <v-list-item  v-for="post in posts" :key="post._id">
           <PostComponent :post="post" />
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>