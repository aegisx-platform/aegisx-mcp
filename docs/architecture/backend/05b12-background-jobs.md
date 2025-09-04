# Background Jobs & Queues

## Job Queue Setup

### Bull Queue with Redis

```typescript
// apps/api/src/queues/queue.setup.ts
import Queue from 'bull';

export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const reportQueue = new Queue('reports', process.env.REDIS_URL);
export const notificationQueue = new Queue('notifications', process.env.REDIS_URL);
```

## Job Processors

### Email Job Processor

```typescript
// apps/api/src/jobs/email.processor.ts
import { emailQueue } from '../queues/queue.setup';

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

emailQueue.process('send-email', async (job) => {
  const { to, subject, template, data } = job.data as EmailJob;

  try {
    await emailService.send({
      to,
      subject,
      html: await renderTemplate(template, data),
    });

    return { success: true, sentAt: new Date() };
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
});

// Add email to queue
export async function sendEmail(emailData: EmailJob) {
  await emailQueue.add('send-email', emailData, {
    priority: emailData.template === 'welcome' ? 10 : 1,
    delay: emailData.template === 'reminder' ? 5000 : 0,
  });
}
```

### Report Generation

```typescript
// apps/api/src/jobs/report.processor.ts
reportQueue.process('generate-report', async (job) => {
  const { reportType, userId, filters } = job.data;

  // Update job progress
  job.progress(10);

  const data = await fetchReportData(reportType, filters);
  job.progress(50);

  const report = await generatePDF(data);
  job.progress(80);

  const fileUrl = await uploadToStorage(report);
  job.progress(100);

  // Notify user
  await notificationQueue.add('report-ready', {
    userId,
    reportUrl: fileUrl,
  });

  return { reportUrl: fileUrl };
});
```

## Scheduled Jobs

### Cron Jobs with node-cron

```typescript
// apps/api/src/jobs/scheduler.ts
import cron from 'node-cron';

// Daily cleanup at 2 AM
cron.schedule('0 2 * * *', async () => {
  await cleanupQueue.add('daily-cleanup', {
    olderThan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
  });
});

// Weekly reports on Monday 9 AM
cron.schedule('0 9 * * 1', async () => {
  await reportQueue.add('weekly-summary', {
    reportType: 'weekly',
    recipients: await getAdminEmails(),
  });
});
```

## Job Monitoring

### Queue Dashboard

```typescript
// apps/api/src/routes/admin/queues.ts
fastify.get('/admin/queues', async (request, reply) => {
  const stats = await Promise.all([emailQueue.getJobCounts(), reportQueue.getJobCounts(), notificationQueue.getJobCounts()]);

  return {
    queues: [
      { name: 'email', ...stats[0] },
      { name: 'reports', ...stats[1] },
      { name: 'notifications', ...stats[2] },
    ],
  };
});
```

### Failed Job Retry

```typescript
// Retry failed jobs
fastify.post('/admin/queues/:queue/retry-failed', async (request, reply) => {
  const { queue } = request.params;
  const targetQueue = getQueueByName(queue);

  const failedJobs = await targetQueue.getFailed();

  for (const job of failedJobs) {
    await job.retry();
  }

  return { retriedJobs: failedJobs.length };
});
```

## Job Types

### Common Job Patterns

```typescript
// User registration workflow
export async function processUserRegistration(userId: string) {
  // Send welcome email
  await emailQueue.add(
    'send-email',
    {
      to: user.email,
      template: 'welcome',
      data: { user },
    },
    { delay: 1000 },
  );

  // Send onboarding series
  await emailQueue.add(
    'send-email',
    {
      template: 'onboarding-day-1',
      data: { user },
    },
    { delay: 24 * 60 * 60 * 1000 },
  ); // 1 day delay
}

// File processing
export async function processFileUpload(fileId: string) {
  await fileQueue.add('process-file', {
    fileId,
    steps: ['validate', 'scan', 'resize', 'store'],
  });
}
```

## Error Handling

### Job Failure Handling

```typescript
emailQueue.on('failed', async (job, error) => {
  logger.error(
    {
      jobId: job.id,
      queue: 'email',
      error: error.message,
      data: job.data,
    },
    'Job failed',
  );

  // Alert on critical failures
  if (job.opts.attempts <= 1) {
    await alertService.sendAlert({
      type: 'job_failure',
      message: `Email job ${job.id} failed permanently`,
      data: job.data,
    });
  }
});
```

## Worker Management

### Dedicated Worker Process

```typescript
// apps/api/src/worker.ts
import { emailQueue, reportQueue, notificationQueue } from './queues/queue.setup';
import './jobs/email.processor';
import './jobs/report.processor';
import './jobs/notification.processor';

class WorkerManager {
  private workers: Map<string, any> = new Map();
  private isShuttingDown = false;

  async start() {
    console.log('🚀 Starting worker processes...');

    // Start queue processors
    this.workers.set('email', emailQueue);
    this.workers.set('reports', reportQueue);
    this.workers.set('notifications', notificationQueue);

    // Setup graceful shutdown
    this.setupGracefulShutdown();

    // Health monitoring
    this.startHealthMonitoring();

    console.log('✅ All workers started successfully');
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;

      console.log(`📴 Received ${signal}, shutting down workers...`);

      // Close all queues gracefully
      const promises = Array.from(this.workers.values()).map(
        (queue) => queue.close(5000), // Wait up to 5 seconds for jobs to complete
      );

      await Promise.all(promises);
      console.log('✅ All workers shut down gracefully');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  private startHealthMonitoring() {
    setInterval(async () => {
      for (const [name, queue] of this.workers) {
        const health = await this.checkQueueHealth(queue);
        if (!health.healthy) {
          console.error(`❌ Queue ${name} is unhealthy:`, health.issues);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkQueueHealth(queue: any) {
    try {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const failed = await queue.getFailed();

      const issues = [];
      if (waiting.length > 1000) issues.push(`Too many waiting jobs: ${waiting.length}`);
      if (active.length > 50) issues.push(`Too many active jobs: ${active.length}`);
      if (failed.length > 100) issues.push(`Too many failed jobs: ${failed.length}`);

      return {
        healthy: issues.length === 0,
        issues,
        stats: {
          waiting: waiting.length,
          active: active.length,
          failed: failed.length,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        issues: [`Health check failed: ${error.message}`],
      };
    }
  }
}

// Start worker if in worker mode
if (process.env.WORKER_MODE === 'true') {
  const manager = new WorkerManager();
  manager.start().catch(console.error);
}
```

### PM2 Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'false',
      },
    },
    {
      name: 'worker-email',
      script: 'dist/worker.js',
      instances: 2,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'true',
        WORKER_TYPE: 'email',
      },
    },
    {
      name: 'worker-reports',
      script: 'dist/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        WORKER_MODE: 'true',
        WORKER_TYPE: 'reports',
      },
    },
  ],
};
```

### Bull Board Dashboard

```typescript
// apps/api/src/plugins/bull-board.plugin.ts
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { emailQueue, reportQueue, notificationQueue } from '../queues/queue.setup';

export default fp(
  async function bullBoardPlugin(fastify: FastifyInstance) {
    if (process.env.NODE_ENV === 'development') {
      const serverAdapter = new FastifyAdapter();

      createBullBoard({
        queues: [new BullAdapter(emailQueue), new BullAdapter(reportQueue), new BullAdapter(notificationQueue)],
        serverAdapter,
      });

      serverAdapter.setBasePath('/admin/queues');
      await fastify.register(serverAdapter.registerPlugin(), {
        prefix: '/admin/queues',
        basePath: '/admin/queues',
      });

      console.log('🎛️  Bull Board available at http://localhost:3000/admin/queues');
    }
  },
  {
    name: 'bull-board-plugin',
  },
);
```

### Worker Health Check

```typescript
// apps/api/src/routes/worker-health.ts
async function workerHealthRoutes(fastify: FastifyInstance) {
  fastify.get('/worker/health', async (request, reply) => {
    const queueStats = await Promise.all([emailQueue.getJobCounts(), reportQueue.getJobCounts(), notificationQueue.getJobCounts()]);

    const health = {
      status: 'healthy',
      timestamp: new Date(),
      queues: {
        email: {
          ...queueStats[0],
          status: queueStats[0].failed > 50 ? 'degraded' : 'healthy',
        },
        reports: {
          ...queueStats[1],
          status: queueStats[1].failed > 10 ? 'degraded' : 'healthy',
        },
        notifications: {
          ...queueStats[2],
          status: queueStats[2].failed > 20 ? 'degraded' : 'healthy',
        },
      },
    };

    const hasIssues = Object.values(health.queues).some((q) => q.status !== 'healthy');
    health.status = hasIssues ? 'degraded' : 'healthy';

    return hasIssues ? reply.error('QUEUE_UNHEALTHY', 'Queue system has issues', 503, health) : reply.success(health);
  });

  // Clear failed jobs
  fastify.post('/worker/clear-failed/:queue', async (request, reply) => {
    const { queue } = request.params as { queue: string };

    let targetQueue;
    switch (queue) {
      case 'email':
        targetQueue = emailQueue;
        break;
      case 'reports':
        targetQueue = reportQueue;
        break;
      case 'notifications':
        targetQueue = notificationQueue;
        break;
      default:
        throw new Error('Invalid queue name');
    }

    const failedJobs = await targetQueue.getFailed();
    await Promise.all(failedJobs.map((job) => job.remove()));

    return { cleared: failedJobs.length };
  });
}
```

## Production Setup

### Environment Configuration

```bash
# Queue configuration
REDIS_URL=redis://redis:6379
QUEUE_CONCURRENCY=5
QUEUE_MAX_JOBS=1000

# Job settings
EMAIL_QUEUE_ATTEMPTS=3
REPORT_QUEUE_TIMEOUT=300000

# Worker configuration
WORKER_MODE=true
WORKER_TYPE=all  # or: email, reports, notifications
```

### Docker Compose with Workers

```yaml
services:
  api:
    image: myapp/api
    environment:
      WORKER_MODE: false
    deploy:
      replicas: 2

  worker-email:
    image: myapp/api
    environment:
      WORKER_MODE: true
      WORKER_TYPE: email
    command: ['node', 'dist/worker.js']
    deploy:
      replicas: 3

  worker-reports:
    image: myapp/api
    environment:
      WORKER_MODE: true
      WORKER_TYPE: reports
    command: ['node', 'dist/worker.js']
    deploy:
      replicas: 1

  worker-notifications:
    image: myapp/api
    environment:
      WORKER_MODE: true
      WORKER_TYPE: notifications
    command: ['node', 'dist/worker.js']
    deploy:
      replicas: 2
```

### Kubernetes Worker Deployment

```yaml
# k8s/worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker-email
spec:
  replicas: 3
  selector:
    matchLabels:
      app: worker-email
  template:
    metadata:
      labels:
        app: worker-email
    spec:
      containers:
        - name: worker
          image: ghcr.io/yourorg/api:latest
          command: ['node', 'dist/worker.js']
          env:
            - name: WORKER_MODE
              value: 'true'
            - name: WORKER_TYPE
              value: 'email'
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: redis-url
          resources:
            requests:
              memory: '128Mi'
              cpu: '100m'
            limits:
              memory: '256Mi'
              cpu: '200m'
          livenessProbe:
            httpGet:
              path: /worker/health
              port: 3000
            initialDelaySeconds: 30
```

### Worker Monitoring Commands

```bash
# PM2 commands
pm2 start ecosystem.config.js          # Start all processes
pm2 status                              # Check status
pm2 logs worker-email                   # View logs
pm2 restart worker-email                # Restart specific worker
pm2 scale worker-email +2               # Scale up workers

# Docker commands
docker-compose up -d --scale worker-email=5    # Scale workers
docker-compose logs -f worker-email             # View logs
```

## Best Practices

1. **Job Isolation**: Each job type in separate queue
2. **Retry Strategy**: Exponential backoff with limits
3. **Monitoring**: Track job success/failure rates
4. **Resource Management**: Limit concurrent jobs
5. **Error Handling**: Graceful failure handling
6. **Testing**: Test job processors in isolation
7. **Scaling**: Separate worker processes
