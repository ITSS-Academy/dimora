import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { ShareModule } from '../../shared/share.module';

@Component({
  selector: 'app-create-post',
  imports: [MaterialModule, ShareModule],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
})
export class CreatePostComponent {
  private _formBuilder = inject(FormBuilder);

  // ===== Step 1 =====
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });

  // ===== Step 2 =====
  secondFormGroup = this._formBuilder.group({
    propertyType: ['', Validators.required],
  });
  selectedType: string = '';

  selectType(type: string) {
    this.selectedType = type;
    this.secondFormGroup.get('propertyType')?.setValue(type);
  }
  onNextSecondStep() {
    if (this.secondFormGroup.valid) {
      console.log(
        'Loại chỗ ở đã chọn:',
        this.secondFormGroup.value.propertyType
      );
    }
  }

  // ===== Step 3 =====
  thirdFormGroup = this._formBuilder.group({
    guests: [0, [Validators.required, Validators.min(0)]],
    bedrooms: [0, [Validators.required, Validators.min(0)]],
    beds: [0, [Validators.required, Validators.min(0)]],
    bathrooms: [0, [Validators.required, Validators.min(0)]],
  });

  increase(controlName: string) {
    const control = this.thirdFormGroup.get(controlName);
    if (control) control.setValue((control.value || 0) + 1);
  }

  decrease(controlName: string) {
    const control = this.thirdFormGroup.get(controlName);
    if (control && control.value > 0) control.setValue(control.value - 1);
  }

  canGoNextFromThird(): boolean {
    const { guests, bedrooms, beds, bathrooms } = this.thirdFormGroup.value;
    return (
      (guests || 0) > 0 ||
      (bedrooms || 0) > 0 ||
      (beds || 0) > 0 ||
      (bathrooms || 0) > 0
    );
  }
  onNextThirdStep() {
    if (this.canGoNextFromThird()) {
      console.log('Giá trị Step 3:', this.thirdFormGroup.value);
    }
  }

  // ===== Step 4 =====
  fourFormGroup = this._formBuilder.group({
    fourCtrl: ['', Validators.required],
  });

  // ===== Step 5: Amenities =====
  fiveFormGroup: FormGroup = new FormGroup({
    amenities: new FormControl<string[]>([], Validators.required),
  });
  selectedAmenities: string[] = [];

  toggleAmenity(amenity: string) {
    const amenities = this.fiveFormGroup.get('amenities')?.value || [];
    let updated = [];
    if (amenities.includes(amenity)) {
      updated = amenities.filter((a: string) => a !== amenity);
    } else {
      updated = [...amenities, amenity];
    }
    this.fiveFormGroup.get('amenities')?.setValue(updated);
    this.selectedAmenities = updated;
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  onNextFiveStep() {
    if (this.fiveFormGroup.valid) {
      console.log('Amenities đã chọn:', this.fiveFormGroup.value.amenities);
    }
  }

  // ===== Step 6 =====
  sixFormGroup: FormGroup = new FormGroup({
    photos: new FormControl<File[]>([], Validators.required),
  });

  // ===== Step 7 =====
  sevenFormGroup: FormGroup = new FormGroup({
    confirmPhotos: new FormControl<File[]>(
      [],
      [Validators.required, Validators.minLength(5)]
    ),
  });
  previewUrls: string[] = [];

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const currentFiles: File[] =
      this.sevenFormGroup.get('confirmPhotos')?.value || [];
    const updatedFiles = [...currentFiles, ...newFiles];

    this.sixFormGroup.get('photos')?.setValue(updatedFiles);
    this.sevenFormGroup.get('confirmPhotos')?.setValue(updatedFiles);

    this.previewUrls = [];
    updatedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrls.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  onNextSevenStep() {
    if (this.sevenFormGroup.valid) {
      console.log(
        'Danh sách ảnh đã chọn:',
        this.sevenFormGroup.get('confirmPhotos')?.value
      );
    }
  }

  removeImage(index: number): void {
    const currentFiles: File[] =
      this.sevenFormGroup.get('confirmPhotos')?.value || [];
    currentFiles.splice(index, 1);

    this.sixFormGroup.get('photos')?.setValue(currentFiles);
    this.sevenFormGroup.get('confirmPhotos')?.setValue(currentFiles);
    this.previewUrls.splice(index, 1);
  }

  canGoToStepEight(): boolean {
    return this.sevenFormGroup.valid;
  }

  // ===== Step 8: Title =====
  eightFormGroup = this._formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
  });

  postData: any = { title: '' };

  onNextEightStep() {
    if (this.eightFormGroup.valid) {
      const title = this.eightFormGroup.get('title')?.value;
      this.postData.title = title;
      console.log('Tiêu đề đã nhập:', title);
      console.log('Dữ liệu postData:', this.postData);
    }
  }

  // ===== Step 9: Highlights =====
  nineFormGroup = this._formBuilder.group({
    // dùng Validators.minLength(1) để bắt buộc chọn ít nhất 1
    highlights: [<string[]>[], [Validators.required, Validators.minLength(1)]],
  });

  selectedOptions: string[] = [];

  /**
   * Toggle chọn / bỏ chọn highlight
   * - Không mutate mảng của FormControl, luôn setValue bằng mảng mới
   * - Giới hạn tối đa 2 mục
   */
  toggleHighlight(option: string) {
    const control = this.nineFormGroup.get('highlights') as FormControl<
      string[]
    >;
    if (!control) return; // an toàn nếu control null

    // Lấy giá trị hiện tại (một bản sao)
    const current: string[] = Array.isArray(control.value)
      ? [...control.value]
      : [];

    const idx = current.indexOf(option);
    if (idx > -1) {
      // bỏ chọn
      current.splice(idx, 1);
    } else {
      // nếu đã đủ 2 thì không thêm nữa
      if (current.length >= 2) {
        // bạn có thể hiện toast / snackbar ở đây nếu muốn
        return;
      }
      current.push(option);
    }

    // cập nhật state local (dùng cho UI) và FormControl (dùng cho validation)
    this.selectedOptions = current;
    control.setValue([...current]); // set value bằng 1 mảng mới (không phải cùng reference)
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  isHighlightSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  onNextNineStep() {
    if (this.nineFormGroup.valid) {
      const highlights = this.nineFormGroup.get('highlights')?.value;
      console.log('Highlights đã chọn:', highlights);

      // lưu dữ liệu nếu cần:
      // this.postData.highlights = highlights;
      // this.yourService.saveStep9(this.postData).subscribe(...)
    } else {
      console.warn('Chưa chọn highlight nào!');
    }
  }
  tenFormGroup: FormGroup;
  taxRate = 0.14; // giả định phí dịch vụ + thuế 14%
  guestPrice = 0;

  constructor(private fb: FormBuilder) {
    this.tenFormGroup = this.fb.group({
      basePrice: [null, [Validators.required, Validators.min(50000)]],
    });
  }

  onPriceChange() {
    const basePrice = this.tenFormGroup.get('basePrice')?.value || 0;
    this.guestPrice = Math.round(basePrice * (1 + this.taxRate));
  }

  onNextStep() {
    if (this.tenFormGroup.valid) {
      const price = this.tenFormGroup.get('basePrice')?.value;
      console.log('Giá nhập:', price);
      console.log('Giá khách (trước thuế):', this.guestPrice);
      // TODO: gọi API lưu dữ liệu
    }
  }
}
