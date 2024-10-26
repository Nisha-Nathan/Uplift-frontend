<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';

const flaggingReasons = [
    "Hatred or violence",
    "Spam or misleading",
    "Selling or self-promotion",
    "Scam, spam or phishing",
    "Self-harm",
    "Sexually explicit",
];

const props = defineProps(["item"])

const reportItem = async (reason: string) => {
    try {
        await fetchy("/api/report", "POST", {
            body: {
                itemId: props.item._id,
                flaggingReason: reason,
            },
        });

    } catch (_) {
        return;
    }

};

</script>

<template>
    <div class="text-center">
        <v-menu location="center">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-flag"></v-btn>
            </template>

            <v-list>
                <v-list-item @click="reportItem(reason)" v-for="reason in flaggingReasons" :key="reason">
                    <v-list-item-title>{{ reason }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>

</template>

<style scoped>
.v-btn:hover {
    color: #DDA522;
}
</style>