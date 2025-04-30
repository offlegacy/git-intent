export type EventMap = Record<string, unknown>;
export type EventHandler<T = unknown> = (data: T) => void;

export class TypedEventEmitter<T extends EventMap> {
  private listeners: Partial<Record<keyof T, EventHandler[]>> = {};

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const handlers = this.listeners[event] || (this.listeners[event] = []);
    handlers.push(handler as EventHandler);
  }

  off<K extends keyof T>(event: K, handler?: EventHandler<T[K]>): void {
    if (!handler) {
      delete this.listeners[event];
      return;
    }

    const handlers = this.listeners[event];
    if (handlers) {
      this.listeners[event] = handlers.filter((h) => h !== handler) as EventHandler[];
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const onceHandler: EventHandler = (data: unknown) => {
      this.off(event, onceHandler as EventHandler<T[K]>);
      handler(data as T[K]);
    };

    this.on(event, onceHandler as EventHandler<T[K]>);
  }
}

export function createEmitter<T extends EventMap>(): TypedEventEmitter<T> {
  return new TypedEventEmitter<T>();
}
