import {
  Component,
  inject,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService, PeriodicElement } from '../../services/data.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { combineLatest, map, Observable, startWith, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { RxLet } from '@rx-angular/template/let';
import { debounceAfterFirst } from '../../rxjs-operators';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    RxLet,
  ],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.scss',
})
export class PeriodicTableComponent implements OnDestroy {
  tableDataSource: MatTableDataSource<PeriodicElement, MatPaginator> | null =
    null;
  filterInput: FormControl;
  dialogClosedSubscription: Subscription | null = null;
  elements$: Observable<PeriodicElement[]>;
  elementsDataSource$:
    | Observable<MatTableDataSource<PeriodicElement, MatPaginator>>
    | undefined;

  @ViewChildren(MatSort) sort!: QueryList<MatSort>;

  dialog = inject(MatDialog);

  constructor(private dataService: DataService) {
    this.filterInput = new FormControl('', []);
    this.elements$ = this.dataService.getElements();
  }

  ngOnInit() {
    this.elementsDataSource$ = combineLatest([
      this.elements$,
      this.filterInput.valueChanges.pipe(
        startWith(''),
        debounceAfterFirst(2000)
      ),
    ]).pipe(
      map(([elements, filterInput]) => {
        if (!this.tableDataSource) {
          this.tableDataSource = new MatTableDataSource(elements);
        }
        this.tableDataSource.filter = filterInput;
        return this.tableDataSource;
      })
    );
  }

  ngAfterViewInit() {
    this.sort.changes.subscribe((s) => {
      if (this.tableDataSource) this.tableDataSource.sort = s.first;
    });
  }

  onCellClick(element: PeriodicElement, cellType: string) {
    this.openDialog(cellType, element);
  }

  openDialog(cellType: string, element: PeriodicElement): void {
    const value = element[cellType];
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { cellType, value },
    });

    this.dialogClosedSubscription = dialogRef
      .afterClosed()
      .subscribe((newValue: string) => {
        if (newValue !== undefined) {
          const newElement = Object.assign({}, element);
          if (typeof element[cellType] === 'number') {
            const newValueNumber = Number(newValue);
            newElement[cellType] = newValueNumber;
          } else if (cellType === 'name' || cellType === 'symbol') {
            newValue =
              newValue.charAt(0).toUpperCase() +
              newValue.slice(1).toLowerCase();

            newElement[cellType] = newValue;
          }
          if (this.tableDataSource) {
            const indexInSource = this.tableDataSource.data.findIndex(
              (object) => {
                return object === element;
              }
            );

            const newData = [
              ...this.tableDataSource.data.slice(0, indexInSource),
              newElement,
              ...this.tableDataSource.data.slice(indexInSource + 1),
            ];

            this.tableDataSource.data = newData;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.dialogClosedSubscription?.unsubscribe();
  }
}
