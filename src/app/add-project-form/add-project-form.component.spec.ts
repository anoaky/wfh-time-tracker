import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProjectFormComponent } from './add-project-form.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AddProjectFormComponent', () => {
  let component: AddProjectFormComponent;
  let fixture: ComponentFixture<AddProjectFormComponent>;
  let inputElement: HTMLInputElement;
  let buttonElement: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProjectFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    const inputDebugEl = fixture.debugElement.query(By.css('input'));
    inputElement = inputDebugEl.nativeElement;
    const buttonDebugEl = fixture.debugElement.query(By.css('button'));
    buttonElement = buttonDebugEl.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit project name when button is clicked', () => {
    const projectName = 'New Project';
    let emittedValue: string | undefined;
    
    component.addProject.subscribe((value: string) => {
      emittedValue = value;
    });
    
    component.newProjectName.setValue(projectName);
    fixture.detectChanges();
    buttonElement.click();
    
    expect(emittedValue).toBe(projectName);
  });

  it('should clear input after emitting', () => {
    component.newProjectName.setValue('Test Project');
    fixture.detectChanges();
    expect(component.newProjectName.value).toBe('Test Project');
    
    component.onClick();
    
    expect(component.newProjectName.value).toBe('');
  });

  it('should emit project name when Enter key is pressed', () => {
    const projectName = 'Enter Key Project';
    let emittedValue: string | undefined;
    
    component.addProject.subscribe((value: string) => {
      emittedValue = value;
    });
    
    component.newProjectName.setValue(projectName);
    fixture.detectChanges();
    
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
    component.onKey(enterEvent);
    
    expect(emittedValue).toBe(projectName);
    expect(component.newProjectName.value).toBe('');
  });

  it('should not emit when Enter is pressed with empty value', () => {
    let emitCount = 0;
    
    component.addProject.subscribe(() => {
      emitCount++;
    });
    
    component.newProjectName.setValue('');
    
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
    component.onKey(enterEvent);
    
    expect(emitCount).toBe(0);
  });

  it('should not emit when non-Enter key is pressed', () => {
    let emitCount = 0;
    
    component.addProject.subscribe(() => {
      emitCount++;
    });
    
    component.newProjectName.setValue('Test');
    
    const spaceEvent = new KeyboardEvent('keypress', { key: ' ' });
    component.onKey(spaceEvent);
    
    expect(emitCount).toBe(0);
  });

  it('should not emit when form control has null value', () => {
    let emitCount = 0;
    
    component.addProject.subscribe(() => {
      emitCount++;
    });
    
    // Force null value
    component.newProjectName.setValue(null);
    fixture.detectChanges();
    component.onClick();
    
    expect(emitCount).toBe(0);
  });

  it('should update input element when form control value changes', () => {
    component.newProjectName.setValue('Updated Value');
    fixture.detectChanges();
    
    expect(inputElement.value).toBe('Updated Value');
  });

  it('should detect duplicate project names (case insensitive)', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Project One', 'Project Two']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('project one');
    fixture.detectChanges();
    
    expect(component.isDuplicateName()).toBe(true);
  });

  it('should allow unique project names', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Project One', 'Project Two']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('Project Three');
    fixture.detectChanges();
    
    expect(component.isDuplicateName()).toBe(false);
  });

  it('should trim whitespace when checking for duplicates', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Project One']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('  Project One  ');
    fixture.detectChanges();
    
    expect(component.isDuplicateName()).toBe(true);
  });

  it('should not emit duplicate project names', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Existing Project']);
    fixture.detectChanges();
    
    let emitCount = 0;
    component.addProject.subscribe(() => {
      emitCount++;
    });
    
    component.newProjectName.setValue('existing project');
    fixture.detectChanges();
    component.onClick();
    
    expect(emitCount).toBe(0);
  });

  it('should disable button for invalid input', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Existing']);
    fixture.detectChanges();
    
    // Empty input
    component.newProjectName.setValue('');
    fixture.detectChanges();
    
    expect(buttonElement.disabled).toBe(true);
    
    // Duplicate name
    component.newProjectName.setValue('existing');
    fixture.detectChanges();
    
    expect(buttonElement.disabled).toBe(true);
  });

  it('should enable button for valid input', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Existing']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('New Project');
    fixture.detectChanges();
    
    expect(buttonElement.disabled).toBe(false);
  });

  it('should show error message for duplicate names', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Test Project']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('test project');
    fixture.detectChanges();
    
    const errorMessage = fixture.debugElement.query(By.css('p.text-red-600'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain('A project with this name already exists');
  });

  it('should not show error message for unique names', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Test Project']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('Unique Project');
    fixture.detectChanges();
    
    const errorMessage = fixture.debugElement.query(By.css('p.text-red-600'));
    expect(errorMessage).toBeFalsy();
  });

  it('should trim project name before emitting', () => {
    let emittedValue: string | undefined;
    
    component.addProject.subscribe((value: string) => {
      emittedValue = value;
    });
    
    component.newProjectName.setValue('  Trimmed Name  ');
    fixture.detectChanges();
    component.onClick();
    
    expect(emittedValue).toBe('Trimmed Name');
  });

  it('should handle case sensitivity properly', () => {
    fixture.componentRef.setInput('existingProjectNames', ['UPPERCASE', 'lowercase', 'MixedCase']);
    fixture.detectChanges();
    
    // Test all variations
    const testCases = [
      { input: 'uppercase', shouldBeDuplicate: true },
      { input: 'LOWERCASE', shouldBeDuplicate: true },
      { input: 'mixedcase', shouldBeDuplicate: true },
      { input: 'MIXEDCASE', shouldBeDuplicate: true },
      { input: 'NewProject', shouldBeDuplicate: false }
    ];
    
    testCases.forEach(testCase => {
      component.newProjectName.setValue(testCase.input);
      fixture.detectChanges();
      expect(component.isDuplicateName()).toBe(testCase.shouldBeDuplicate);
    });
  });

  it('should not consider empty string as duplicate', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Project']);
    fixture.detectChanges();
    
    component.newProjectName.setValue('');
    fixture.detectChanges();
    
    expect(component.isDuplicateName()).toBe(false);
  });

  it('should handle Enter key with validation', () => {
    fixture.componentRef.setInput('existingProjectNames', ['Existing']);
    fixture.detectChanges();
    
    let emitCount = 0;
    component.addProject.subscribe(() => {
      emitCount++;
    });
    
    // Try with duplicate name
    component.newProjectName.setValue('existing');
    fixture.detectChanges();
    const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
    component.onKey(enterEvent);
    
    expect(emitCount).toBe(0);
    
    // Try with valid name
    component.newProjectName.setValue('Valid Name');
    fixture.detectChanges();
    component.onKey(enterEvent);
    
    expect(emitCount).toBe(1);
  });
});
