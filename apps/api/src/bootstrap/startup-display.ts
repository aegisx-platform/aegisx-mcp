/**
 * Startup Display Utility
 *
 * Visual display for development environment only
 * - ASCII art logo
 * - Startup summary box
 *
 * Production: These are skipped, only structured JSON logs
 */

export interface StartupSummaryInfo {
  host: string;
  port: number;
  environment: string;
  apiPrefix: string;
  totalTime: number;
  nodeVersion: string;
  processId: number;
  swaggerUrl?: string;
}

export interface PerformanceMetrics {
  envTime: number;
  configLoadTime: number;
  serverCreateTime: number;
  pluginLoadTime: number;
  serverStartTime: number;
  totalTime: number;
}

/**
 * Display AegisX ASCII art logo
 * Development only
 */
export function displayStartupBanner(): void {
  // Skip in production and test environments
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('');
  console.log('     █████╗ ███████╗ ██████╗ ██╗███████╗██╗  ██╗');
  console.log('    ██╔══██╗██╔════╝██╔════╝ ██║██╔════╝╚██╗██╔╝');
  console.log('    ███████║█████╗  ██║  ███╗██║███████╗ ╚███╔╝ ');
  console.log('    ██╔══██║██╔══╝  ██║   ██║██║╚════██║ ██╔██╗ ');
  console.log('    ██║  ██║███████╗╚██████╔╝██║███████║██╔╝ ██╗');
  console.log('    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝');
  console.log('');
  console.log('    🛡️  Enterprise-Ready Full Stack Application  🛡️');
  console.log('');
}

/**
 * Display startup summary box
 * Development only
 */
export function displayStartupSummary(info: StartupSummaryInfo): void {
  // Skip in production and test environments
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('');
  console.log('🎉 AegisX Platform Ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server: http://${info.host}:${info.port}`);
  console.log(
    `🔗 API Prefix: ${info.apiPrefix ? `"${info.apiPrefix}"` : '(none - routes at root level)'}`,
  );
  console.log(`🌍 Environment: ${info.environment}`);
  console.log(`📊 Startup Time: ${info.totalTime}ms`);
  console.log(`📦 Node Version: ${info.nodeVersion}`);
  console.log(`🔧 Process ID: ${info.processId}`);

  if (info.swaggerUrl) {
    console.log(`📚 Swagger UI: ${info.swaggerUrl}`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Ready to accept connections!');
  console.log('');
}

/**
 * Display performance metrics breakdown
 * Development only
 */
export function displayPerformanceMetrics(metrics: PerformanceMetrics): void {
  // Skip in production and test environments
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('');
  console.log('📊 Performance Metrics:');
  console.log(`   Environment: ${metrics.envTime}ms`);
  console.log(`   Config Load: ${metrics.configLoadTime}ms`);
  console.log(`   Server Create: ${metrics.serverCreateTime}ms`);
  console.log(`   Plugin Load: ${metrics.pluginLoadTime}ms`);
  console.log(`   Server Start: ${metrics.serverStartTime}ms`);
  console.log(`   ⏱️  Total: ${metrics.totalTime}ms`);
}
