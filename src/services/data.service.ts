import { Injectable } from '@angular/core';
import { of, shareReplay, tap } from 'rxjs';
import { RxState } from '@rx-angular/state';

export type PeriodicElement = {
  position: number;
  name: string;
  weight: number;
  symbol: string;
  [key: string]: string | number;
};

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

interface AppState {
  elements: PeriodicElement[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService extends RxState<AppState> {
  constructor() {
    super();
    this.setup();
  }

  setup() {
    return this.fetchElements()
      .pipe(
        tap((elements) => this.set({ elements })),
        shareReplay(1)
      )
      .subscribe();
  }

  private fetchElements() {
    return of(ELEMENT_DATA);
  }
  getElements() {
    return this.select('elements');
  }
}
