import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';

function numberValidator(): ValidatorFn {
  return (
    control: AbstractControl<string>
  ): { [key: string]: { value: string } } | null => {
    if (control.value.length === 0) {
      return { empty: { value: control.value } };
    }

    const controlValueNumber = Number(control.value);
    const valid = !isNaN(controlValueNumber);

    if (controlValueNumber < 0) {
      return { positiveNumbersOnly: { value: control.value } };
    }
    return valid ? null : { numbersOnly: { value: control.value } };
  };
}

function stringValidator(cellType: string): ValidatorFn {
  return (
    control: AbstractControl<string>
  ): { [key: string]: { value: string } } | null => {
    if (control.value.length === 0) {
      return { empty: { value: control.value } };
    }

    let stringValid = /^[a-zA-z]+$/.test(control.value);
    let valid = stringValid;
    if (stringValid && cellType === 'symbol') {
      const controlValueStringLength = String(control.value).length;
      let symbolValid =
        controlValueStringLength === 1 || controlValueStringLength === 2;
      valid = valid && symbolValid;
      return valid ? null : { symbolOnly: { value: control.value } };
    }
    return valid ? null : { stringOnly: { value: control.value } };
  };
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  readonly data = inject<{ cellType: string; value: string | number }>(
    MAT_DIALOG_DATA
  );
  initialValue: string;
  inputFormControl: FormControl<string | number | null>;
  inputStatusChanges: Subscription | null = null;
  errorMessage: string = 'Error';

  constructor() {
    const valueType = typeof this.data.value;
    const validators =
      valueType === 'number'
        ? [numberValidator()]
        : [stringValidator(this.data.cellType)];
    this.inputFormControl = new FormControl(this.data.value, validators);
    this.initialValue = String(this.data.value);
  }

  ngAfterContentInit() {
    this.inputStatusChanges = this.inputFormControl.statusChanges.subscribe(
      (status) => {
        if (status === 'INVALID') {
          this.errorMessage = this.getErrorMessage(
            this.inputFormControl.errors
          );
        }
      }
    );
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    this.dialogRef.close(this.inputFormControl.value);
  }

  getTypeOf(input: string | number) {
    return typeof input;
  }

  isTheSameValue() {
    if (typeof this.data.value === 'number') {
      return Number(this.inputFormControl.value) === Number(this.initialValue);
    }
    return this.inputFormControl.value === this.initialValue;
  }

  getErrorMessage(errors: ValidationErrors | null): string {
    if (errors?.['empty']) {
      return 'Value cannot be empty!';
    } else if (errors?.['stringOnly']) {
      return 'Please enter only letters!';
    } else if (errors?.['symbolOnly']) {
      return 'Please enter only one or two characters!';
    } else if (errors?.['positiveNumbersOnly']) {
      return 'Please enter only positive numbers!';
    } else {
      return 'Please enter only numbers!';
    }
  }

  ngOnDestoy() {
    this.inputStatusChanges?.unsubscribe();
  }
}
