import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Posting, Sessioning, Reaction, Feed, Notification, Reporting } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    const user = await Authing.getUserByUsername(username);
    const posts = await Posting.getByAuthor(user._id, "public");

    return { user: user, posts: await Responses.posts(posts) };
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional(), feedName: z.string().optional() }))
  async getPosts(author?: string, feedName?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id, "public");
    } else {
      posts = await Posting.getPosts();
    }
    if (feedName && feedName !== "Home") {
      const feedOid = await Feed.getFeedBIdyFeedname(feedName);
      const feedPosts = (await Feed.getFeedPosts(feedOid)).posts;
      const feedPostIds = new Set(feedPosts.map((postId) => postId.toString()));
      posts = posts.filter((post) => feedPostIds.has(post._id.toString()));
    }
    const postsReturned = await Responses.posts(posts);
    return { posts: postsReturned, feedName: feedName || "Home" };
  }

  @Router.get("/journals")
  async getJournalEntries(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const journals = await Posting.getByAuthor(user, "private");
    return { journals: await Responses.posts(journals) };
  }

  @Router.get("/journal/:id")
  async getJournalEntry(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    const journal = await Posting.getJournalEntry(oid, user);
    return { journal: await Responses.post(journal) };
  }

  @Router.post("/journals")
  async createJournalEntry(session: SessionDoc, title: string, content: string, options: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, "private", options, title);
    if (!created.journal?._id) {
      return { msg: "Failed to create journal entry", post: null };
    }
    return { msg: created.msg, journal: await Responses.post(created.journal) };
  }

  @Router.patch("/journal/:id")
  async updateJournalEntry(session: SessionDoc, id: string, title?: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, "private", user);
    return await Posting.update(oid, "private", content, options, title);
  }

  @Router.delete("/journal/:id")
  async deleteJournalEntry(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);

    await Posting.assertAuthorIsUser(oid, "private", user);
    return Posting.delete(oid, "private");
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, feedName: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, "public", options);

    if (!created.post?._id) {
      return { msg: "Failed to create post", post: null };
    }

    const feedOid = await Feed.getFeedBIdyFeedname(feedName);
    const postOid = created.post?._id;
    const feedMsg = await Feed.addPostToFeed(feedOid, postOid);
    return { msg: created.msg + "" + feedMsg.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, "public", user);
    return await Posting.update(oid, "public", content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);

    await Posting.assertAuthorIsUser(oid, "public", user);
    const feedMsg = await Feed.removePostFromAllFeeds(oid);
    return Posting.delete(oid, "public") + " " + feedMsg;
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return { friends: await Authing.idsToUsernames(await Friending.getFriends(user)) };
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return { friendRequests: await Responses.friendRequests(await Friending.getRequests(user)) };
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.post("/feed")
  async createFeed(name: string, feedDescription: string) {
    const feed = await Feed.createFeed(name, feedDescription);
    return { msg: feed.msg, feed: feed };
  }

  @Router.get("/feeds")
  async getFeeds() {
    const feeds = await Feed.getFeeds();
    return { feeds: feeds };
  }

  @Router.patch("/feed/:name/post/remove")
  async removePostFromFeed(name: string, postId: string) {
    const id = await Feed.getFeedBIdyFeedname(name);
    const feedOid = new ObjectId(id);
    const postOid = new ObjectId(postId);
    const response = await Feed.removePostFromFeed(feedOid, postOid);
    return { msg: response.msg, feed: response.feed };
  }

  @Router.get("/feed/:name")
  async getFeedPosts(name: string) {
    const id = await Feed.getFeedBIdyFeedname(name);
    const feedOid = new ObjectId(id);
    const feed = await Feed.getFeedPosts(feedOid);
    return { name: feed.name, posts: feed.posts };
  }

  @Router.get("/reactions/:itemId")
  async getReaction(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemOid = new ObjectId(itemId);
    const reaction = (await Reaction.getReactionOnItemByUser(user, itemOid))?.reaction;
    return { reaction: reaction };
  }

  @Router.post("/reactions")
  async addReaction(session: SessionDoc, itemId: string, reaction: string) {
    const user = Sessioning.getUser(session);
    const itemOid = new ObjectId(itemId);
    const addedReaction = await Reaction.addReaction(user, itemOid, reaction);
    return { msg: addedReaction.msg, reaction: addedReaction.reaction };
  }

  @Router.delete("/reactions/:itemId")
  async removeReaction(session: SessionDoc, itemId: string) {
    const user = Sessioning.getUser(session);
    const itemOid = new ObjectId(itemId);
    const msg = await Reaction.removeReaction(user, itemOid);
    return { msg };
  }

  @Router.get("/reactions/total/:id")
  async getPostReactions(id: string) {
    const itemOid = new ObjectId(id);
    const item = await Reaction.getReactionCount(itemOid);
    return { itemId: id, ReactionCount: item };
  }

  @Router.get("/reactions/type/:id")
  async getPostReactionsByType(id: string) {
    const itemOid = new ObjectId(id);
    const item = await Reaction.getReactionCountsByType(itemOid);
    return { itemId: id, count: item };
  }

  @Router.post("/notifications")
  async createNotification(session: SessionDoc, notifyAbout: string, frequency: "daily" | "weekly", timeFrame: "morning" | "noon" | "evening") {
    const user = Sessioning.getUser(session);
    const notification = await Notification.createNotification(user, notifyAbout, frequency, timeFrame);
    return { msg: "Notification created successfully", notification };
  }

  @Router.get("/notifications/deliver")
  async deliverNotifications() {
    const result = await Notification.deliverPendingNotifications();
    return result;
  }

  @Router.delete("/notifications/:id")
  async deleteNotification(id: string) {
    const notificationOid = new ObjectId(id);
    const result = await Notification.deleteNotification(notificationOid);
    return result;
  }

  @Router.get("/notifications/pending")
  async getPendingNotifications(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const pending = await Notification.getPendingNotifications(user);
    return { pendingNotifications: pending };
  }

  @Router.get("/posts/content/:id")
  async getPostContent(id: string) {
    const itemOid = new ObjectId(id);
    const content = await Posting.getPostContent(itemOid);
    return { content: content };
  }

  @Router.post("/report")
  async flagPosts(session: SessionDoc, itemId: string, flaggingReason: string) {
    const user = Sessioning.getUser(session);
    const itemOid = new ObjectId(itemId);
    const content = (await Posting.getPostContent(itemOid)) || "";
    const result = await Reporting.flagItem(itemOid, user, content, flaggingReason);
    return { msg: "Item flagged for review", report: result };
  }

  @Router.get("/reports")
  async getFlaggedItems() {
    const flaggedItems = await Reporting.getFlaggedItems();
    return { flaggedItems: flaggedItems };
  }

  @Router.get("/report/reviews")
  async reviewPosts() {
    await Reporting.reviewFlaggedItems();
    const reviewedItems = await Reporting.getReviewedItems();
    for (const item of reviewedItems) {
      if (item.reviewOutcome === "remove") {
        await Posting.delete(item.item, "public");
      }
    }
    return { msg: "Flagged items reviewed and actions taken accordingly." };
  }

  @Router.get("/reports/reviewed")
  async getReviewedItems() {
    const reviewedItems = await Reporting.getReviewedItems();
    return { reviewedItems: reviewedItems };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
