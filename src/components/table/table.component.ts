import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataService, PeriodicElement } from '../../services/data.service';

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class PeriodicTableComponent {
  tableDataSource = new MatTableDataSource<PeriodicElement>();

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.dataService.getData().subscribe((data) => {
      this.tableDataSource.data = data;
    });
  }
}
