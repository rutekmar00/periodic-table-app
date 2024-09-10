import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService, PeriodicElement } from '../../services/data.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subscription } from 'rxjs';

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
export class PeriodicTableComponent {
  tableDataSource = new MatTableDataSource<PeriodicElement>();
  filterInput: FormControl;
  inputValueChangesSubscription: Subscription | null = null;

  @ViewChild(MatSort) sort!: MatSort;

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

  ngOnDestroy(): void {
    this.inputValueChangesSubscription?.unsubscribe();
  }
}
