import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";
import JournalView from "../views/JournalView.vue";
import NotificationView from "../views/NotificationView.vue";
import UserProfileView from "../views/UserProfileView.vue";
import JournalEntryView from "../views/JournalEntryView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/journal",
      name: "Journal",
      component: JournalView,
      meta: { requiresAuth: true },
    },
    {
      path:"/notification",
      name: "Notifications",
      component:NotificationView,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/user/:username",
      name: "UserProfile",
      component: UserProfileView,
    },
    {
      path: "/journal/:id",
      name: "JournalEntry",
      component: JournalEntryView,
    },

    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
