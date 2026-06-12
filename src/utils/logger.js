const stamps = {
  info: "info",
  warn: "warn",
  error: "error",
  success: "done"
};

function log(level, message, meta) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[${stamps[level]}] ${message}${suffix}`);
}

export const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  success: (message, meta) => log("success", message, meta)
};
