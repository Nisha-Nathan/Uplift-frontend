<script setup lang="ts">
import NotificationListComponent from '@/components/Notification/NotificationListComponent.vue';
import FriendRequestListComponent from '@/components/Friends/FriendRequestListComponent.vue';

import { ref } from 'vue';

const tab=ref(1);
</script>

<template>
  <main>
      <h1>Notifications</h1>
      <v-card>
    <!-- Tabs at the top to switch between different components -->
    <v-tabs
      v-model="tab"
      align-tabs="center"
      color="deep-purple-accent-4"
    >
      <v-tab :value="1">Notifications</v-tab>
      <v-tab :value="2">Friend Requests</v-tab>
    </v-tabs>

    <!-- Tabs Window for showing different content -->
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="1">
        <v-container fluid>
          <NotificationListComponent />
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item :value="2">
        <v-container fluid>
          <FriendRequestListComponent />
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
