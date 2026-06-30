export type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export type Logger = {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
};

export function createLogger(minimumLevel: LogLevel): Logger {
  const shouldLog = (level: LogLevel) => levelWeights[level] >= levelWeights[minimumLevel];

  const write = (level: LogLevel, message: string, context?: LogContext) => {
    if (!shouldLog(level)) {
      return;
    }

    const payload = {
      level,
      message,
      ...(context ? { context } : {}),
      timestamp: new Date().toISOString()
    };

    const line = JSON.stringify(payload);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  };

  return {
    debug: (message, context) => write("debug", message, context),
    info: (message, context) => write("info", message, context),
    warn: (message, context) => write("warn", message, context),
    error: (message, context) => write("error", message, context)
  };
}
