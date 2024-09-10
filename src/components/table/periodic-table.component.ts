import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService, PeriodicElement } from '../../services/data.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.scss',
})
export class PeriodicTableComponent implements OnInit, OnDestroy {
  tableDataSource = new MatTableDataSource<PeriodicElement>();
  filterInput: FormControl;
  inputValueChangesSubscription: Subscription | null = null;
  dialogClosedSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;

  dialog = inject(MatDialog);

  constructor(private dataService: DataService) {
    this.filterInput = new FormControl('', []);
  }

  ngOnInit(): void {
    this.fetchData();
    this.inputValueChangesSubscription = this.filterInput.valueChanges
      .pipe(debounceTime(2000))
      .subscribe((value) => {
        this.tableDataSource.filter = value;
      });
  }

  ngAfterViewInit() {
    this.tableDataSource.sort = this.sort;
  }

  fetchData() {
    this.dataService.getData().subscribe((data) => {
      this.tableDataSource.data = data;
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
      });
  }

  ngOnDestroy(): void {
    this.inputValueChangesSubscription?.unsubscribe();
    this.dialogClosedSubscription?.unsubscribe();
  }
}
