const noop = () => {};

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

let reporter = null;

export function setReporter(fn) {
  reporter = typeof fn === 'function' ? fn : null;
}

function emit(level, message, context) {
  const entry = {
    level,
    message: message instanceof Error ? message.message : String(message),
    stack: message instanceof Error ? message.stack : undefined,
    context: context || undefined,
    ts: Date.now(),
  };

  if (isDev) {
    const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logFn(`[${level}]`, entry.message, context || '');
  }

  if (reporter) {
    try {
      reporter(entry);
    } catch (_) {
      // never let the reporter break the app
    }
  }
}

export const logger = {
  info: isDev ? (msg, ctx) => emit('info', msg, ctx) : noop,
  warn: (msg, ctx) => emit('warn', msg, ctx),
  error: (msg, ctx) => emit('error', msg, ctx),
};
