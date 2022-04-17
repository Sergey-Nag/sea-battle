export default class EventEmmiter {
  static instance: EventEmmiter = null;

  static getInstance(): EventEmmiter {
    EventEmmiter.instance = EventEmmiter.instance ?? new EventEmmiter();

    return EventEmmiter.instance;
  }

  events: {[key:string]: ((...args: any[]) => void)[]};
  
  constructor() {
    this.events = {};
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  remove(event: string, callback: (...args: any[]) => void) {
    if (typeof this.events[event] !== 'object') return;

    const index = this.events[event].indexOf(callback);

    if (index !== -1) this.events[event].splice(index, 1);
  }

  emit(event: string, ...args: any[]) {
    if (typeof this.events[event] !== 'object') return;

    this.events[event].forEach((callback) => callback.apply(this, args));
  }
}