import { AppState, AppStateStatus } from 'react-native';

type IntervalHandle = number;
type TimeoutHandle = number;

class Scheduler {
  private intervals = new Set<IntervalHandle>();
  private timeouts = new Set<TimeoutHandle>();
  private pauseOnBackground = new Set<IntervalHandle>();
  private appState: AppStateStatus = AppState.currentState;

  constructor() {
    AppState.addEventListener('change', this.onAppStateChange);
  }

  private onAppStateChange = (next: AppStateStatus) => {
    if (this.appState.match(/inactive|background/) && next === 'active') {
      // Resume intervals if needed (no-op; JS intervals continue). Could re-sync timers here.
    }
    if (next.match(/inactive|background/)) {
      // Clear intervals that opted-in to pause on background
      for (const id of Array.from(this.pauseOnBackground)) {
        clearInterval(id);
        this.intervals.delete(id);
        this.pauseOnBackground.delete(id);
      }
    }
    this.appState = next;
  };

  setInterval(callback: () => void, ms: number, options: { pauseOnBackground?: boolean } = {}): IntervalHandle {
    const id = setInterval(callback, ms) as unknown as number;
    this.intervals.add(id);
    if (options.pauseOnBackground) this.pauseOnBackground.add(id);
    return id;
  }

  clearInterval(id: IntervalHandle): void {
    clearInterval(id as any);
    this.intervals.delete(id);
    this.pauseOnBackground.delete(id);
  }

  setTimeout(callback: () => void, ms: number): TimeoutHandle {
    const id = setTimeout(callback, ms) as unknown as number;
    this.timeouts.add(id);
    return id;
  }

  clearTimeout(id: TimeoutHandle): void {
    clearTimeout(id as any);
    this.timeouts.delete(id);
  }

  clearAll(): void {
    for (const id of this.intervals) clearInterval(id as any);
    for (const id of this.timeouts) clearTimeout(id as any);
    this.intervals.clear();
    this.timeouts.clear();
    this.pauseOnBackground.clear();
  }
}

export const scheduler = new Scheduler();
