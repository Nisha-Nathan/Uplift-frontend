/**
 * This code uses OpenAI's API to generate encouraging and positive notification texts.
 * API Documentation: https://beta.openai.com/docs/
 *
 * The notification content generated for users is powered by OpenAI's GPT model.
 * OpenAI, GPT-3, GPT-4, and associated models are trademarks of OpenAI.
 */
import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";
import OpenAI from "openai";
const openai = new OpenAI();

export interface NotificationDoc extends BaseDoc {
  user: ObjectId;
  notifyAbout: string;
  notificationTime: Date;
  status: "delivered" | "pending";
  notificationContent: string;
  frequency: "daily" | "weekly";
  timeFrame: "morning" | "noon" | "evening";
}

/**
 * concept: Notification [User]
 */
export default class NotificationConcept {
  public readonly notifications: DocCollection<NotificationDoc>;

  constructor(collectionName: string) {
    this.notifications = new DocCollection<NotificationDoc>(collectionName);
  }

  async createNotification(user: ObjectId, notifyAbout: string, frequency: "daily" | "weekly", timeFrame: "morning" | "noon" | "evening") {
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are a positive and  helpful and empathetic person",
    //     },
    //     {
    //       role: "user",
    //       content: `Notify user in a positive and warm manner about ${notifyAbout}. Notification:`,
    //     },
    //   ],
    // });
    const notificationContent = await this.generateNotificationContent(notifyAbout);
    const notificationTime = this.getRandomNotificationTime(timeFrame, frequency);
    const currentTime = new Date();

    if (!notificationTime || notificationTime <= currentTime) {
      throw new NotAllowedError("Notification time must be in the future");
    }

   
    const _id = await this.notifications.createOne({
      user,
      notifyAbout,
      notificationTime,
      status: "pending",
      notificationContent,
      frequency,
      timeFrame,
    });
    return await this.notifications.readOne({ _id });
  }

  private getRandomNotificationTime(timeFrame: "morning" | "noon" | "evening", frequency: "daily" | "weekly"): Date {
    const currentTime = new Date();
    let startHour = 0;
    let endHour = 0;

    switch (timeFrame) {
      case "morning":
        startHour = 5;
        endHour = 12;
        break;
      case "noon":
        startHour = 12;
        endHour = 16;
        break;
      case "evening":
        startHour = 16;
        endHour = 20;
        break;
    }

    const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);

    const notificationTime = new Date(currentTime);
    notificationTime.setHours(randomHour, randomMinute, randomSecond, 0);

    // If frequency is weekly, add 7 days to the date
    if (frequency === "weekly") {
      notificationTime.setDate(notificationTime.getDate() + 7);
    } else {
      // Set to the next day for daily notifications if time is in the past
      if (notificationTime <= currentTime) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
    }

    return notificationTime;
  }

  // async createNotification(user: ObjectId, notifyAbout: string, notificationTime: Date) {
  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-4o-mini",
  //     messages: [
  //       {
  //         role: "system",
  //         content: "You are a positive and  helpful and empathetic person",
  //       },
  //       {
  //         role: "user",
  //         content: `Notify user in a positive and warm manner about ${notifyAbout}. Notification:`,
  //       },
  //     ],
  //   });
  //   const currentTime = new Date();
  //   if (!notificationTime || notificationTime <= currentTime) {
  //     throw new NotAllowedError("Notification time must be in the future");
  //   }

  //   const notificationContent = completion.choices[0].message.content || notifyAbout;
  //   const _id = await this.notifications.createOne({ user, notifyAbout, notificationTime, status: "pending", notificationContent });
  //   return await this.notifications.readOne({ _id });
  // }

  // async deliverPendingNotifications() {
  //   const currentTime = new Date();
  //   const pendingNotifications = await this.notifications.readMany({ status: "pending" });

  //   for (const notification of pendingNotifications) {
  //     if (notification.notificationTime <= currentTime) {
  //       // Update status to 'delivered'
  //       await this.notifications.partialUpdateOne({ _id: notification._id }, { status: "delivered" });
  //     }
  //   }

  //   return { msg: "Pending notifications delivered successfully!" };
  // }

  async deliverPendingNotifications() {
    const currentTime = new Date();
    const pendingNotifications = await this.notifications.readMany({ status: "pending" });

    for (const notification of pendingNotifications) {
      if (notification.notificationTime <= currentTime) {
        // Update status to 'delivered'
        await this.notifications.partialUpdateOne({ _id: notification._id }, { status: "delivered" });

        // If frequency is daily or weekly, schedule the next notification
        if (notification.frequency) {
          const nextNotificationTime = this.getNextNotificationTime(notification.notificationTime, notification.frequency);
          const newNotificationContent = await this.generateNotificationContent(notification.notifyAbout);

          await this.notifications.partialUpdateOne(
            { _id: notification._id },
            {
              status: "pending",
              notificationTime: nextNotificationTime,
              notificationContent: newNotificationContent,
            }
          );
        }
      }
    }

    return { msg: "Pending notifications delivered successfully!" };
  }

  async deleteNotification(_id: ObjectId) {
    const notification = await this.notifications.deleteOne({ _id });
    return { msg: "Notification deleted successfully!", notification };
  }

  async getDeliveredNotifications(user: ObjectId) {
    return await this.notifications.readMany({ user, status: "delivered" });
  }

  async getPendingNotifications(user: ObjectId) {
    return await this.notifications.readMany({ user, status: "pending" });
  }

  private getNextNotificationTime(previousTime: Date, frequency: "daily" | "weekly"): Date {
    const nextNotificationTime = new Date(previousTime);
    if (frequency === "daily") {
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
    } else if (frequency === "weekly") {
      nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
    }
    return nextNotificationTime;
  }

  private async generateNotificationContent(notifyAbout: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a positive, helpful, and empathetic person",
        },
        {
          role: "user",
          content: `Notify user in a positive and warm manner about ${notifyAbout}. Notification:`,
        },
      ],
    });

    return completion.choices[0].message.content || notifyAbout;
  }

  
}
