import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShareModule } from '../../share.module';
import { Observable, Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SearchModel } from '../../../models/search.model';
import { Store } from '@ngrx/store';
import { AmenitiesState } from '../../../ngrx/state/amenities.state';
import { AmenitiesModel } from '../../../models/amenities.model';

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule, ShareModule],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss'
})
export class FilterDialogComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  subscriptions: Subscription[] = [];
  amenities$ !: Observable<AmenitiesModel[]>
  // Price range FormControls for ngModel
  minPrice = new FormControl(0);
  maxPrice = new FormControl(1000000);

  constructor(
    private dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { searchData: SearchModel | null },
    private store: Store<{
      amenities: AmenitiesState
    }>
  ) {
    this.amenities$ = this.store.select('amenities', 'amenities');
  }

  ngOnInit() {
    this.initForm();
    this.loadSearchData();
    this.loadFiltersFromStorage();
    
    this.subscriptions.push(
      this.amenities$.subscribe(amenities => {
        if (amenities.length > 0) {
          this.setupAmenitiesForm(amenities);
          this.loadSavedFilters();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private initForm() {
    this.filterForm = new FormGroup({
      selectedPropertyTypes: new FormControl([]),
      selectedBedrooms: new FormControl(''),
      amenities: new FormGroup({}),
      selectedRating: new FormControl('')
    });
  }

  private loadSearchData() {
    if (this.data.searchData) {
      // Load price range from search data
      this.minPrice.setValue(this.data.searchData.minPrice || 0);
      this.maxPrice.setValue(this.data.searchData.maxPrice || 1000000);
    }
  }

  private setupAmenitiesForm(amenities: AmenitiesModel[]) {
    const amenitiesGroup = this.filterForm.get('amenities') as FormGroup;
    
    // Clear existing controls
    Object.keys(amenitiesGroup.controls).forEach(key => {
      amenitiesGroup.removeControl(key);
    });
    
    // Add new controls for each amenity
    amenities.forEach(amenity => {
      amenitiesGroup.addControl(amenity.id.toString(), new FormControl(false));
    });
  }

  private loadFiltersFromStorage() {
    try {
      const savedFilters = localStorage.getItem('userFilters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        this.applySavedFilters(filters);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
  }

  private loadSavedFilters() {
    try {
      const savedFilters = localStorage.getItem('userFilters');
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        this.applySavedFilters(filters);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
  }

  private applySavedFilters(filters: any) {
    // Apply saved filters to form
    if (filters.minPrice !== undefined) this.minPrice.setValue(filters.minPrice);
    if (filters.maxPrice !== undefined) this.maxPrice.setValue(filters.maxPrice);
    if (filters.selectedPropertyTypes) this.filterForm.patchValue({ selectedPropertyTypes: filters.selectedPropertyTypes });
    if (filters.selectedBedrooms) this.filterForm.patchValue({ selectedBedrooms: filters.selectedBedrooms });
    if (filters.selectedRating) this.filterForm.patchValue({ selectedRating: filters.selectedRating });
    
    // Apply amenities after form is set up
    if (filters.amenities && Array.isArray(filters.amenities)) {
      this.subscriptions.push(
        this.amenities$.subscribe(amenities => {
          if (amenities.length > 0) {
            const amenitiesGroup = this.filterForm.get('amenities') as FormGroup;
            filters.amenities.forEach((amenityId: number) => {
              const control = amenitiesGroup.get(amenityId.toString());
              if (control) {
                control.setValue(true);
              }
            });
          }
        })
      );
    }
  }

  clearFilters() {
    this.minPrice.setValue(0);
    this.maxPrice.setValue(1000000);
    this.filterForm.patchValue({
      selectedPropertyTypes: [],
      selectedBedrooms: '',
      selectedRating: ''
    });
    
    // Clear amenities dynamically
    const amenitiesGroup = this.filterForm.get('amenities') as FormGroup;
    Object.keys(amenitiesGroup.controls).forEach(key => {
      amenitiesGroup.get(key)?.setValue(false);
    });
  }

  applyFilters() {
    if (this.filterForm.valid) {
      // Convert amenities to array of IDs
      const amenitiesFormValue = this.filterForm.get('amenities')?.value;
      const selectedAmenityIds: number[] = [];
      
      if (amenitiesFormValue) {
        Object.keys(amenitiesFormValue).forEach(key => {
          if (amenitiesFormValue[key]) {
            selectedAmenityIds.push(Number(key));
          }
        });
      }

      const filters = {
        ...this.filterForm.value,
        minPrice: this.minPrice.value,
        maxPrice: this.maxPrice.value,
        amenities: selectedAmenityIds // Send array of IDs instead of object
      };

      // Save filters to localStorage
      this.saveFiltersToStorage(filters);
      console.log('Applied filters:', filters);
      
      // Close dialog and return filters
      this.dialogRef.close({ filters });
    }
  }

  private saveFiltersToStorage(filters: any) {
    try {
      localStorage.setItem('userFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }

  // Getter methods for easy access in template
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
    return price.toLocaleString('vi-VN');
  }
}
