import { Event } from '../types';

export class EventTestStore {
  private events: Map<string, Event>;

  constructor(initialEvents: Event[] = []) {
    this.events = new Map();
    initialEvents.forEach((event) => this.events.set(event.id, event));
  }

  getAll(): Event[] {
    return Array.from(this.events.values());
  }

  add(event: Event): Event {
    this.events.set(event.id, event);
    return event;
  }

  update(id: string, updates: Partial<Event>): Event | null {
    const existing = this.events.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.events.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.events.delete(id);
  }

  clear(): void {
    this.events.clear();
  }
}

const testStores = new Map<string, EventTestStore>();

export const cleanupTestStore = (testId: string) => {
  testStores.delete(testId);
};
