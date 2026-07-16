import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorTreeComponent } from './sector-tree';

describe('SectorTreeComponent', () => {
  let component: SectorTreeComponent;
  let fixture: ComponentFixture<SectorTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectorTreeComponent);
    fixture.componentRef.setInput('nodes', []);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
