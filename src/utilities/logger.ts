import * as Environment from "../environment";

/**
 * The available levels of logging.
 */
type LogLevel = "debug" | "warning" | "error";

/**
 * Prints a message with the specified logging and plugin identifier.
 */
function print(level: LogLevel, message: string): void {
  console.log(`<RVE/${level}> ${message}`); // eslint-disable-line
}

export function debug(message: string): void {
  if (Environment.isDevelopment) {
    print("debug", message);
  }
}

export function warning(message: string): void {
  print("warning", message);
}

export function error(message: string): void {
  print("error", message);
}
