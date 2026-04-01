import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GuestHistoryService {

  private KEY = 'guest_history';

  getHistory(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  }

  add(entry: { operation: string; payload: any; display: any }) {
    try {
      const history = this.getHistory();
      history.unshift(entry);
      if (history.length > 50) history.pop();
      localStorage.setItem(this.KEY, JSON.stringify(history));
    } catch (e) {
      console.error('GuestHistoryService: could not save entry', e);
    }
  }

  clear() {
    localStorage.removeItem(this.KEY);
  }
}