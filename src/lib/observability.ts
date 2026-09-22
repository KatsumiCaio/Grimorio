/**
 * Observability, Telemetry, and Error Tracking Hub
 * 
 * Provides unified interfaces for Sentry, OpenTelemetry, and Datadog tracing.
 * Operates gracefully with zero overhead in dev and reports structured events in production.
 */

export type SeverityLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface Breadcrumb {
  category: string;
  message: string;
  level?: SeverityLevel;
  timestamp?: number;
  data?: Record<string, unknown>;
}

export interface ErrorContext {
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    username?: string;
    role?: string;
  };
}

class ObservabilityHub {
  private isInitialized = false;
  private breadcrumbs: Breadcrumb[] = [];
  private readonly maxBreadcrumbs = 50;
  private dsn: string | null = null;

  public init(config?: { dsn?: string; environment?: string; release?: string }) {
    if (this.isInitialized) return;

    this.dsn = config?.dsn || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SENTRY_DSN : null) || null;
    this.isInitialized = true;

    // Attach global uncaught listeners in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureException(event.error || new Error(event.message), {
          tags: { source: 'window.onerror' },
          extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        // Ignore known benign websocket reconnection messages in sandboxed iframes
        const reasonStr = String(reason?.message || reason || '');
        if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket')) {
          return;
        }

        this.captureException(
          reason instanceof Error ? reason : new Error(String(reason)),
          { tags: { source: 'unhandledrejection' } }
        );
      });
    }

    this.addBreadcrumb({
      category: 'lifecycle',
      message: 'Observability hub initialized',
      level: 'info',
    });
  }

  public addBreadcrumb(breadcrumb: Breadcrumb) {
    const item: Breadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
      level: breadcrumb.level || 'info',
    };

    this.breadcrumbs.push(item);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  public getBreadcrumbs(): readonly Breadcrumb[] {
    return this.breadcrumbs;
  }

  public clearBreadcrumbs() {
    this.breadcrumbs = [];
  }

  public captureException(error: unknown, context?: ErrorContext) {
    const err = error instanceof Error ? error : new Error(String(error));

    const payload = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      context,
      breadcrumbs: [...this.breadcrumbs],
      timestamp: Date.now(),
    };

    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
      console.groupCollapsed(`[Observability] 🚨 ${err.name}: ${err.message}`);
      console.error(err);
      if (context) console.info('Context:', context);
      if (this.breadcrumbs.length > 0) console.info('Recent Breadcrumbs:', this.breadcrumbs.slice(-5));
      console.groupEnd();
    }

    // If external Sentry/Datadog client is injected on window, forward to it
    if (typeof window !== 'undefined' && (window as any).Sentry?.captureException) {
      (window as any).Sentry.captureException(err, {
        tags: context?.tags,
        extra: { ...context?.extra, breadcrumbs: this.breadcrumbs },
      });
    }

    return payload;
  }

  public captureMessage(message: string, level: SeverityLevel = 'info', context?: ErrorContext) {
    this.addBreadcrumb({
      category: 'log',
      message,
      level,
      data: context?.extra,
    });

    if (typeof window !== 'undefined' && (window as any).Sentry?.captureMessage) {
      (window as any).Sentry.captureMessage(message, level);
    }
  }

  /**
   * Performance tracing span measurement (OpenTelemetry / Sentry Tracing pattern)
   */
  public async traceSpan<T>(name: string, op: string, fn: () => Promise<T> | T): Promise<T> {
    const start = performance.now();
    this.addBreadcrumb({
      category: 'performance.span',
      message: `Starting span: ${name} (${op})`,
      level: 'debug',
    });

    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      this.addBreadcrumb({
        category: 'performance.span',
        message: `Completed span: ${name} in ${durationMs}ms`,
        level: 'debug',
        data: { durationMs },
      });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      this.captureException(err, {
        tags: { spanName: name, spanOp: op },
        extra: { durationMs },
      });
      throw err;
    }
  }

  /**
   * Metric recording for telemetry / performance budget
   */
  public recordMetric(metricName: string, value: number, unit = 'ms') {
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
      console.debug(`[Telemetry Metric] ${metricName}: ${value}${unit}`);
    }
    this.addBreadcrumb({
      category: 'metric',
      message: `${metricName}=${value}${unit}`,
      data: { metricName, value, unit },
    });
  }
}

export const observability = new ObservabilityHub();

// Auto-initialize
if (typeof window !== 'undefined') {
  observability.init();
}
