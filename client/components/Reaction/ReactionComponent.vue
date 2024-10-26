<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { onMounted, ref } from 'vue';

const definedReactions = [{ "happy": "😊" }, { "sad": "😢" }, { "love": "❤️" }, { "like": "👍" }];
const props = defineProps(["item"]);
const userReaction = ref<string | null>(null);

const fetchUserReaction = async (itemId: string) => {
    try {
        const response = await fetchy(`/api/reactions/${itemId}`, "GET");
        if (response.reaction) {
            userReaction.value = response.reaction;
        }
    } catch (_) {
        return;
    }
}


const addReaction = async (itemId: string, reaction: string) => {
    try {
        await fetchy("/api/reactions", "POST", {
            body: { itemId, reaction },
        });
    } catch (_) {
        return;
    }

};

const removeReaction = async (itemId: string) => {
    try {
        await fetchy(`/api/reactions/${itemId}`, "DELETE");
    } catch (_) {
        return;
    }

};

const toggleReaction = async (itemId: string, reaction: string) => {

    if (userReaction.value === reaction) {
        await removeReaction(itemId);
        userReaction.value = null;
    } else {
        if (userReaction.value) {
            await removeReaction(itemId);
        }
        await addReaction(itemId, reaction);
        userReaction.value = reaction;
    }
    await fetchReactionCounts(itemId); // Update reaction counts after toggling
};


let reactionCounts = ref<Record<string, number>>({});


const fetchReactionCounts = async (itemId: string) => {
    try {
        const response = await fetchy(`/api/reactions/type/${itemId}`, "GET");
        reactionCounts.value = response.count;
    } catch (error) {
        console.error("Error fetching reaction counts:", error);
    }
};

onMounted(() => {
    fetchReactionCounts(props.item._id);
    fetchUserReaction(props.item._id);
});

</script>

<template>
    <div>
        <div v-for="reaction in definedReactions" :key="Object.keys(reaction)[0]">
            <button @click="toggleReaction(props.item._id, Object.keys(reaction)[0])"
                :class="{ active: userReaction === Object.keys(reaction)[0] }">
                {{ Object.values(reaction)[0] }} ({{ reactionCounts[Object.keys(reaction)[0]] || 0 }})
            </button>
        </div>
    </div>
</template>