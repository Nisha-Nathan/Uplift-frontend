<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref, watch } from "vue";

const emit = defineEmits(["getPostsByFilter"]);

const feedName = ref("");
let feeds = ref<Array<Record<string, string>>>([]);

const getFeeds = async () => {
  try {
    const result = await fetchy("/api/feeds", "GET");
    feeds.value = result.feeds;
  } catch (error) {
    console.error("Error fetching feeds:", error);
  }
};



onMounted(() => {
  getFeeds();
});
</script>

<template>
  <div>
    <v-combobox variant="outlined" label="Choose a feed" v-model="feedName" :items="['Home',...feeds.map(feed => feed.name)]"
      @update:model-value=" emit('getPostsByFilter', feedName)"></v-combobox>
  </div>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}

.v-combobox {
  align-self: center;
}

div {
  min-width: 20em;
}

select {
  min-width: 10em;
}
</style>
