import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateGraphComponent } from './template-graph.component';

describe('TemplateGraphComponent', () => {
  let component: TemplateGraphComponent;
  let fixture: ComponentFixture<TemplateGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
