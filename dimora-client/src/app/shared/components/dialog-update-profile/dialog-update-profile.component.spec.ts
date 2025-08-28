import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogUpdateProfileComponent } from './dialog-update-profile.component';

describe('DialogUpdateProfileComponent', () => {
  let component: DialogUpdateProfileComponent;
  let fixture: ComponentFixture<DialogUpdateProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogUpdateProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogUpdateProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
