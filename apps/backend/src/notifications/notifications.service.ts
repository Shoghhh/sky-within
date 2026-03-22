import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (admin.apps.length > 0) return;

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.logger.warn(
        'Firebase not configured. Set GOOGLE_APPLICATION_CREDENTIALS for FCM.',
      );
      return;
    }

    try {
      admin.initializeApp();
      this.initialized = true;
      this.logger.log('Firebase Admin initialized for FCM.');
    } catch (err) {
      this.logger.error('Failed to initialize Firebase Admin', err);
    }
  }

  async sendDailyMessage(fcmToken: string, message: string): Promise<void> {
    if (!this.initialized) {
      this.logger.debug('FCM not initialized, skipping push.');
      return;
    }

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'Sky Within',
          body: message,
        },
        data: { type: 'daily_tip' },
      });
      this.logger.log('Daily message notification sent.');
    } catch (err) {
      this.logger.error('Failed to send FCM notification', err);
    }
  }
}
