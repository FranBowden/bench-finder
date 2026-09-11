import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "backend.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function formatArg(arg: unknown): string {
  if (arg instanceof Error) {
    const base = arg.stack ?? arg.message;
    // fetch's TypeError wraps the real network error (ETIMEDOUT, ENOTFOUND,
    // ECONNREFUSED, etc.) in `cause` — without this, the log only ever
    // shows the useless generic "fetch failed" message.
    return arg.cause instanceof Error ? `${base}\nCaused by: ${formatArg(arg.cause)}` : base;
  }
  if (typeof arg === "string") {
    return arg;
  }
  return JSON.stringify(arg);
}

function format(args: unknown[]): string {
  return args.map(formatArg).join(" ");
}

function write(level: "INFO" | "ERROR", args: unknown[]) {
  const line = `[${new Date().toISOString()}] [${level}] ${format(args)}\n`;
  fs.appendFile(LOG_FILE, line, () => {});
}

export const logger = {
  info: (...args: unknown[]) => {
    console.log(...args);
    write("INFO", args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
    write("ERROR", args);
  },
};
