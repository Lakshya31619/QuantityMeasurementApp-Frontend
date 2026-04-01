import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { QuantityService } from '../../core/services/quantity.service';
import { TokenService } from '../../core/services/token.service';
import { GuestHistoryService } from '../../core/services/guest-history.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  operation = 'convert';
  showHistory = false;

  form = {
    value1: 0,
    value2: 0,
    measurementType: 'LENGTH',
    unit1: 'METER',
    unit2: 'CENTIMETER'
  };

  result: any = null;
  history: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private quantityService: QuantityService,
    private tokenService: TokenService,
    private guestHistory: GuestHistoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.isLoggedIn) {
      this.loadHistory();
    }
  }

  get isLoggedIn() {
    return this.tokenService.isLoggedIn();
  }

  get currentUnits() {
    return this.unitOptions[this.form.measurementType] || [];
  }

  get isBinaryOperation() {
    return ['compare', 'add', 'subtract', 'multiply', 'divide'].includes(this.operation);
  }

  unitOptions: Record<string, { label: string; value: string }[]> = {
    LENGTH: [
      { label: 'Meter', value: 'METER' },
      { label: 'Centimeter', value: 'CENTIMETER' },
      { label: 'Inch', value: 'INCH' },
      { label: 'Foot', value: 'FOOT' },
      { label: 'Yard', value: 'YARD' }
    ],
    WEIGHT: [
      { label: 'Kilogram', value: 'KILOGRAM' },
      { label: 'Gram', value: 'GRAM' },
      { label: 'Pound', value: 'POUND' }
    ],
    VOLUME: [
      { label: 'Liter', value: 'LITER' },
      { label: 'Milliliter', value: 'MILLILITER' },
      { label: 'Gallon', value: 'GALLON' }
    ],
    TEMPERATURE: [
      { label: 'Celsius', value: 'CELSIUS' },
      { label: 'Fahrenheit', value: 'FAHRENHEIT' },
      { label: 'Kelvin', value: 'KELVIN' }
    ]
  };

  onMeasurementTypeChange() {
    const units = this.currentUnits;
    this.form.unit1 = units[0]?.value ?? '';
    this.form.unit2 = units[1]?.value ?? units[0]?.value ?? '';
    this.result = null;
    this.errorMessage = null;
  }

  private buildPayload() {
    if (this.operation === 'convert') {
      return {
        sourceQuantity: {
          value: this.form.value1,
          measurementType: this.form.measurementType,
          unitName: this.form.unit1
        },
        targetUnit: this.form.unit2
      };
    }
    return {
      firstQuantity: {
        value: this.form.value1,
        measurementType: this.form.measurementType,
        unitName: this.form.unit1
      },
      secondQuantity: {
        value: this.form.value2,
        measurementType: this.form.measurementType,
        unitName: this.form.unit2
      },
      resultUnit: this.form.unit1
    };
  }

  calculate() {
    this.result = null;
    this.errorMessage = null;
    this.isLoading = true;

    const payload = this.buildPayload();

    const opMap: Record<string, () => any> = {
      convert:  () => this.quantityService.convert(payload),
      compare:  () => this.quantityService.compare(payload),
      add:      () => this.quantityService.add(payload),
      subtract: () => this.quantityService.subtract(payload),
      multiply: () => this.quantityService.multiply(payload),
      divide:   () => this.quantityService.divide(payload)
    };

    opMap[this.operation]().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.result = { ...res };

        if (this.isLoggedIn) {
          this.loadHistory();
        } else if (this.operation !== 'compare') {
          this.guestHistory.add({
            operation: this.operation,
            payload,
            display: {
              operationType: this.operation.toUpperCase(),
              resultOperandValue: res?.resultQuantity?.value,
              resultUnit: res?.resultQuantity?.unitName
            }
          });
          this.history = this.guestHistory.getHistory().map((e: any) => e.display);
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Something went wrong. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  loadHistory() {
    if (this.isLoggedIn) {
      this.quantityService.getHistory().subscribe({
        next: (res: any[]) => {
          this.history = res.map(e => ({
            operationType: e.operationType,
            resultOperandValue: e.resultOperandValue,
            resultUnit: e.resultUnit   
          }));
          this.cdr.markForCheck();
        },
        error: () => {
          this.history = [];
          this.cdr.markForCheck();
        }
      });
    } else {
      this.history = this.guestHistory.getHistory().map((e: any) => e.display);
    }
  }

  toggleHistory() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.loadHistory();
    }
  }

  authAction() {
    if (this.isLoggedIn) {
      this.tokenService.clear();
      this.showHistory = false;
      this.history = [];
    }
    this.router.navigate(['/login']);
  }
}