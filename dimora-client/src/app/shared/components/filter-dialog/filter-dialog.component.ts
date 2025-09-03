import { Component, OnInit, OnDestroy } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../share.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule, ShareModule],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss'
})
export class FilterDialogComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  private subscription = new Subscription();

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initForm() {
    this.filterForm = new FormGroup({
      priceRange: new FormControl([0, 1000000]),
      selectedPropertyTypes: new FormControl([]),
      selectedBedrooms: new FormControl(''),
      amenities: new FormGroup({
        wifi: new FormControl(false),
        parking: new FormControl(false),
        pool: new FormControl(false),
        kitchen: new FormControl(false),
        ac: new FormControl(false),
        tv: new FormControl(false)
      }),
      selectedRating: new FormControl('')
    });
  }

  onPriceRangeChange(event: any) {
    const newValue = event.value;
    this.priceRangeControl.setValue(newValue);
  }

  clearFilters() {
    this.filterForm.patchValue({
      priceRange: [0, 1000000],
      selectedPropertyTypes: [],
      selectedBedrooms: '',
      amenities: {
        wifi: false,
        parking: false,
        pool: false,
        kitchen: false,
        ac: false,
        tv: false
      },
      selectedRating: ''
    });
  }

  applyFilters() {
    if (this.filterForm.valid) {
      const filters = this.filterForm.value;
      console.log('Applied filters:', filters);
      // Emit event or close dialog with filters
    }
  }

  // Getter methods for easy access in template
  get priceRangeControl(): FormControl {
    return this.filterForm.get('priceRange') as FormControl;
  }

  get selectedPropertyTypesControl(): FormControl {
    return this.filterForm.get('selectedPropertyTypes') as FormControl;
  }

  get selectedBedroomsControl(): FormControl {
    return this.filterForm.get('selectedBedrooms') as FormControl;
  }

  get amenitiesGroup(): FormGroup {
    return this.filterForm.get('amenities') as FormGroup;
  }

  get selectedRatingControl(): FormControl {
    return this.filterForm.get('selectedRating') as FormControl;
  }

  // Helper method to format price
  formatPrice(price: number): string {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  }

  // Get current price values for display
  get currentMinPrice(): number {
    const value = this.priceRangeControl.value;
    return Array.isArray(value) ? value[0] : 0;
  }

  get currentMaxPrice(): number {
    const value = this.priceRangeControl.value;
    return Array.isArray(value) ? value[1] : 1000000;
  }
}
