<script setup lang="ts">
import ReactionComponent from "@/components/Reaction/ReactionComponent.vue";
import ReportingForm from "../Report/ReportingForm.vue";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { RouterLink } from "vue-router";


const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};
</script>

<template>



  <v-card class="mx-auto text-white" color="#000000" max-width="600">
    <v-card-title class="text-h5">
      <router-link :to="{ name: 'UserProfile', params: { username: props.post.author } }">
        <p class="author">{{ props.post.author }}</p>
      </router-link>
    </v-card-title>

    <v-card-text class="text-h5 py-2">
      {{ props.post.content }}

    </v-card-text>
    <v-card-subtitle>
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}
      </p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </v-card-subtitle>

    <v-card-actions>
      <ReactionComponent :item="props.post" />
      <ReportingForm :item="props.post" class="report" />
      <div v-if="props.post.author == currentUsername">
        <v-btn color="error" icon="mdi-delete" @click="deletePost"></v-btn>
        <v-btn icon="mdi-pen" @click="emit('editPost', props.post._id)"></v-btn>
      </div>


    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-card{
  width:100%
  
}
.v-card-actions {
  display: flex;
  justify-content: space-between;
}
.report{
  margin-left: auto;
}
p {
  margin: 0em;
}

a {
  color: white;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
  color: white;
  ;
}

.author:hover {
  color: #DDA522;
}


menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
