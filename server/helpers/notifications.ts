import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// Initialize the Expo SDK
const expo = new Expo();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send push notification to specific devices
   * @param pushTokens - Array of Expo push tokens
   * @param payload - Notification content
   */
  async sendNotifications(pushTokens: string[], payload: NotificationPayload) {
    // Create the messages array
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of pushTokens) {
      // Check if the token is valid
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid Expo push token: ${pushToken}`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      });
    }

    try {
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      // Send the chunks to the Expo push notification service
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }
}
