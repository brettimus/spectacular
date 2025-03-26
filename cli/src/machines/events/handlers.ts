import path from "node:path";
import { appendToLog } from "../../utils/credentials";
import type { AnalyticsEvent, LogEvent, HealingEvent } from "../core/types";

/**
 * Centralizes event handling for analytics, logging, and healing events
 * This allows us to:
 * 1. Consistently format and process events
 * 2. Send events to multiple destinations
 * 3. Add new destinations without changing machine implementations
 */
export class EventHandler {
  private logsDir: string;
  
  constructor(cwd: string) {
    this.logsDir = path.join(cwd, ".spectacular", "logs");
  }
  
  /**
   * Handle analytics events
   */
  async handleAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    const { action, data } = event;
    
    const analyticsData = {
      timestamp: new Date().toISOString(),
      action,
      data,
    };
    
    // Log to file
    await this.appendToLogFile("analytics.json", `${JSON.stringify(analyticsData)}\n`);
    
    // In the future, we could send to an analytics API
    // await fetch('https://api.example.com/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(analyticsData),
    // });
  }
  
  /**
   * Handle logging events
   */
  async handleLogEvent(event: LogEvent): Promise<void> {
    const { level, message, data } = event;
    
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    
    // Log to file
    await this.appendToLogFile("machine-logs.json", `${JSON.stringify(logData)}\n`);
    
    // Also log to console based on level
    switch (level) {
      case "info":
        console.info(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "error":
        console.error(message);
        break;
      case "debug":
        console.debug(message);
        break;
    }
  }
  
  /**
   * Handle healing events
   * These are especially important to track for improving the system
   */
  async handleHealingEvent(event: HealingEvent): Promise<void> {
    const { errors, file, solution, successful } = event;
    
    const healingData = {
      timestamp: new Date().toISOString(),
      file,
      errors,
      solution,
      successful,
    };
    
    // Log to dedicated healing log file
    await this.appendToLogFile("healing-events.json", `${JSON.stringify(healingData)}\n`);
  }
  
  /**
   * Handle any event by type
   */
  async handleEvent(event: AnalyticsEvent | LogEvent | HealingEvent): Promise<void> {
    switch (event.type) {
      case "ANALYTICS":
        return this.handleAnalyticsEvent(event as AnalyticsEvent);
      case "LOG":
        return this.handleLogEvent(event as LogEvent);
      case "HEALING":
        return this.handleHealingEvent(event as HealingEvent);
    }
  }
  
  /**
   * Append to a log file
   */
  private async appendToLogFile(filename: string, content: string): Promise<void> {
    appendToLog(this.logsDir, filename, content);
  }
}

// Create singleton instance for easy import
let globalEventHandler: EventHandler | null = null;

/**
 * Get or create the global event handler
 */
export function getEventHandler(cwd: string): EventHandler {
  if (!globalEventHandler) {
    globalEventHandler = new EventHandler(cwd);
  }
  return globalEventHandler;
}

/**
 * Utility function to send an analytics event
 */
export function sendAnalyticsEvent(
  cwd: string,
  action: string,
  data: Record<string, unknown> = {}
): void {
  const handler = getEventHandler(cwd);
  const event: AnalyticsEvent = {
    type: "ANALYTICS",
    action,
    data,
  };
  handler.handleEvent(event).catch(console.error);
}

/**
 * Utility function to send a log event
 */
export function sendLogEvent(
  cwd: string,
  level: "info" | "warn" | "error" | "debug",
  message: string,
  data: Record<string, unknown> = {}
): void {
  const handler = getEventHandler(cwd);
  const event: LogEvent = {
    type: "LOG",
    level,
    message,
    data,
  };
  handler.handleEvent(event).catch(console.error);
}

/**
 * Utility function to send a healing event
 */
export function sendHealingEvent(
  cwd: string,
  errors: string[],
  file: string,
  solution?: string,
  successful?: boolean
): void {
  const handler = getEventHandler(cwd);
  const event: HealingEvent = {
    type: "HEALING",
    errors,
    file,
    solution,
    successful,
  };
  handler.handleEvent(event).catch(console.error);
} 