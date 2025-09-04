# Email & Notifications System

## Email Plugin Setup

```typescript
// apps/api/src/plugins/email.plugin.ts
import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

const emailPlugin: FastifyPluginAsync = async (fastify) => {
  const emailService = new EmailService(fastify);
  await emailService.initialize();

  fastify.decorate('emailService', emailService);
};

export default fp(emailPlugin, {
  name: 'email-plugin',
  dependencies: ['redis-plugin', 'event-bus-plugin'],
});

declare module 'fastify' {
  interface FastifyInstance {
    emailService: EmailService;
  }
}
```

### Email Service with Queue

```typescript
// apps/api/src/services/email.service.ts
export class EmailService {
  private transporter: nodemailer.Transporter;
  private templateCache = new Map<string, string>();

  constructor(private fastify: FastifyInstance) {}

  async initialize() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Register email event handlers
    this.registerEventHandlers();
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Queue email for background processing
      await this.queueEmail(options);

      this.fastify.log.info(`Email queued: ${options.to}`, {
        template: options.template,
        subject: options.subject,
      });
    } catch (error) {
      this.fastify.log.error('Failed to queue email:', error);
      throw error;
    }
  }

  private async queueEmail(options: EmailOptions): Promise<void> {
    const emailJob = {
      id: randomUUID(),
      ...options,
      queuedAt: new Date(),
      attempts: 0,
    };

    await this.fastify.redis.lpush('email_queue', JSON.stringify(emailJob));
  }

  async processEmailQueue(): Promise<void> {
    while (true) {
      try {
        const job = await this.fastify.redis.brpop('email_queue', 10);
        if (!job) continue;

        const emailJob = JSON.parse(job[1]);
        await this.sendEmailNow(emailJob);
      } catch (error) {
        this.fastify.log.error('Email queue processing error:', error);
      }
    }
  }

  private async sendEmailNow(options: EmailOptions): Promise<void> {
    const html = await this.renderTemplate(options.template, options.data);

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html,
    });
  }

  private async renderTemplate(templateName: string, data: any): Promise<string> {
    if (!this.templateCache.has(templateName)) {
      const template = await fs.readFile(`./templates/${templateName}.html`, 'utf-8');
      this.templateCache.set(templateName, template);
    }

    let html = this.templateCache.get(templateName)!;

    // Simple template replacement
    Object.entries(data).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return html;
  }

  private registerEventHandlers() {
    // Welcome email
    this.fastify.eventBus.subscribe('USER_CREATED', {
      handle: async (event) => {
        await this.sendWelcomeEmail(event.data.user);
      },
    });

    // Password reset
    this.fastify.eventBus.subscribe('PASSWORD_RESET_REQUESTED', {
      handle: async (event) => {
        await this.sendPasswordResetEmail(event.data);
      },
    });
  }

  private async sendWelcomeEmail(user: any): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Our Platform!',
      template: 'welcome',
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        loginUrl: `${process.env.USER_PORTAL_URL}/auth/login`,
      },
    });
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}
```

## Notification System

### Multi-Channel Notifications

```typescript
// apps/api/src/services/notification.service.ts
export class NotificationService {
  constructor(private fastify: FastifyInstance) {}

  async sendNotification(notification: NotificationRequest): Promise<void> {
    // Store notification
    const saved = await this.saveNotification(notification);

    // Send via multiple channels
    const promises = [];

    if (notification.channels.includes('email')) {
      promises.push(this.sendEmailNotification(saved));
    }

    if (notification.channels.includes('push')) {
      promises.push(this.sendPushNotification(saved));
    }

    if (notification.channels.includes('websocket')) {
      promises.push(this.sendWebSocketNotification(saved));
    }

    if (notification.channels.includes('sms')) {
      promises.push(this.sendSMSNotification(saved));
    }

    await Promise.allSettled(promises);
  }

  private async saveNotification(notification: NotificationRequest): Promise<SavedNotification> {
    const [saved] = await this.fastify
      .knex('notifications')
      .insert({
        id: randomUUID(),
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        channels: JSON.stringify(notification.channels),
        data: JSON.stringify(notification.data || {}),
        is_read: false,
        created_at: new Date(),
      })
      .returning('*');

    return saved;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.fastify.knex('notifications').where('id', notificationId).where('user_id', userId).update({ is_read: true, read_at: new Date() });
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<SavedNotification[]> {
    const query = this.fastify.knex('notifications').where('user_id', userId).orderBy('created_at', 'desc');

    if (unreadOnly) {
      query.where('is_read', false);
    }

    return await query;
  }
}
```

### Frontend Notification Center

```typescript
// features/notifications/components/notification-center.component.ts
@Component({
  selector: 'app-notification-center',
  standalone: true,
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
      <mat-icon matBadge="{{ unreadCount() }}" matBadgeColor="warn"> notifications </mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="w-80">
      <div class="p-4 border-b">
        <h3 class="font-semibold">Notifications</h3>
      </div>

      @for (notification of notifications(); track notification.id) {
        <div class="p-3 border-b hover:bg-gray-50" [class.bg-blue-50]="!notification.isRead" (click)="markAsRead(notification)">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-medium text-sm">{{ notification.title }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
              <p class="text-xs text-gray-400 mt-2">
                {{ notification.createdAt | timeAgo }}
              </p>
            </div>
            @if (!notification.isRead) {
              <div class="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
            }
          </div>
        </div>
      } @empty {
        <div class="p-4 text-center text-gray-500">No notifications</div>
      }
    </mat-menu>
  `,
})
export class NotificationCenterComponent implements OnInit {
  notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  ngOnInit() {
    this.notificationService.loadNotifications();

    // Connect to real-time notifications
    this.notificationService.connectToWebSocket();
  }

  async markAsRead(notification: any) {
    await this.notificationService.markAsRead(notification.id);
  }
}
```
