import {AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {MaterialModule} from '../../../shared/material.module';
import {MatCalendar} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-schedule',
  imports: [ MaterialModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ScheduleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('calendar') calendar!: MatCalendar<Date>;
  @ViewChild('calendar', { read: ElementRef }) calendarEl!: ElementRef;
  selectedDate: Date = new Date(2025, 8, 2); // September 2, 2025 (vòng đỏ)
  startAt: Date = new Date(2025, 8, 12); // Bắt đầu từ September 12, 2025 để khớp hình (hoặc thay bằng new Date(2025, 7, 23) nếu muốn August)

  private mutationObserver: MutationObserver | null = null;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.setupMutationObserver();
    this.updateCalendarCells(); // Initial update
  }

  ngOnDestroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  dateClass = (date: Date): string => {
    const day = date.getDate();
    if (day === 5) {
      return 'gray-bg';
    } else if (day === 6) {
      return 'black-bg';
    } else if (day === 2) {
      return 'red-circle';
    } else if (day === 12) {
      return 'bordered';
    }
    return '';
  };

  private getPrice(date: Date): string {
    const day = date.getDate();
    if (day === 5 || day === 6) {
      return 'đ650,757';
    }
    return 'đ529,678';
  }

  updateCalendarCells() {
    setTimeout(() => {
      if (!this.calendar || !this.calendar.activeDate) {
        console.warn('Lịch chưa ready - thử lại sau.');
        return;
      }

      const month = this.calendar.activeDate.getMonth() + 1;
      const year = this.calendar.activeDate.getFullYear();

      // Query trong phạm vi calendar element để chắc chắn
      const cells = this.calendarEl.nativeElement.querySelectorAll('.mat-calendar-body-cell-content');
      if (cells.length === 0) {
        console.warn('Không tìm thấy cells - có thể ở year/month view.');
        return;
      }

      cells.forEach((cell: Element) => {
        const htmlCell = cell as HTMLElement;
        const dateNumElement = htmlCell.querySelector('.date-num') as HTMLElement | null;
        let dayText: string;

        if (dateNumElement) {
          // Đã custom rồi, chỉ update price
          dayText = dateNumElement.innerText.trim();
        } else {
          // Chưa custom, lấy từ innerText gốc
          dayText = htmlCell.innerText.trim();
        }

        const day = parseInt(dayText, 10);
        if (isNaN(day)) return;

        const currentDate = new Date(year, month - 1, day);

        const parentTd = htmlCell.closest('td');
        if (parentTd?.classList.contains('mat-calendar-body-disabled')) {
          if (!dateNumElement) {
            htmlCell.innerHTML = `<div class="date-num">${day}</div><div class="price"></div>`;
          } else {
            const priceElement = htmlCell.querySelector('.price') as HTMLElement | null;
            if (priceElement) priceElement.innerText = '';
          }
          return;
        }

        const price = this.getPrice(currentDate);

        if (!dateNumElement) {
          // Custom lần đầu
          htmlCell.innerHTML = `<div class="date-num">${day}</div><div class="price">${price}</div>`;
        } else {
          // Update price thôi
          const priceElement = htmlCell.querySelector('.price') as HTMLElement | null;
          if (priceElement) priceElement.innerText = price;
        }
      });

      console.log('Đã update cells với giá cho tháng ' + month + '/' + year);
    }, 200); // Tăng delay lên 200ms để DOM ổn định
  }

  private setupMutationObserver() {
    const calendarTable = this.calendarEl.nativeElement.querySelector('.mat-calendar-table');
    if (!calendarTable) {
      console.warn('Không tìm thấy table - thử lại.');
      setTimeout(() => this.setupMutationObserver(), 500);
      return;
    }

    this.mutationObserver = new MutationObserver(() => {
      this.updateCalendarCells();
    });

    this.mutationObserver.observe(calendarTable, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'] // Chỉ watch class changes để tối ưu
    });
  }
}
