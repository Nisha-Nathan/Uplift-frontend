<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import CreateFeedForm from "../components/Feed/CreateFeedForm.vue";
import UserPostsComponent from "@/components/Profile/UserPostsComponent.vue";
import FriendListComponent from "@/components/Friends/FriendListComponent.vue";
import { ref } from "vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();
const tab = ref(1);


async function logout() {
  await logoutUser();
  void router.push({ name: "Home" });
}

async function delete_() {
  await deleteUser();
  void router.push({ name: "Home" });
}
</script>

<template>
  <main class="column">
    <h1> {{ currentUsername }}</h1>
    <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    
    <v-card>
    <!-- Tabs at the top to switch between different components -->
    <v-tabs
      v-model="tab"
      align-tabs="center"
      color="deep-purple-accent-4"
    >
    <v-tab :value="1">User Posts</v-tab>
    <v-tab :value="2">Friend List</v-tab>
      <v-tab :value="3">Update User</v-tab>
      <v-tab :value="4">Create Feed</v-tab>
     
    </v-tabs>

    <!-- Tabs Window for showing different content -->
    <v-tabs-window v-model="tab">
    

      <!-- User Posts Component Tab -->
      <v-tabs-window-item :value="1">
        <v-container fluid>
          <UserPostsComponent />
        </v-container>
      </v-tabs-window-item>

      <!-- Friend List Component Tab -->
      <v-tabs-window-item :value="2">
        <v-container fluid>
          <FriendListComponent />
        </v-container>
      </v-tabs-window-item>

        <!-- Update User Form Tab -->
        <v-tabs-window-item :value="3">
        <v-container fluid>
          <UpdateUserForm />
        </v-container>
      </v-tabs-window-item>

      <!-- Create Feed Form Tab -->
      <v-tabs-window-item :value="4">
        <v-container fluid>
          <CreateFeedForm />
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
  </main>
</template>
<style scoped>
h1 {
  text-align: center;
}
</style>