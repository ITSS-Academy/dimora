import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePostComponent } from './update-post.component';


describe('UpdatePostComponent', () => {
  let component: UpdatePostComponent;
  let fixture: ComponentFixture<UpdatePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export class SliderConfigurableExample {
  disabled = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
}





