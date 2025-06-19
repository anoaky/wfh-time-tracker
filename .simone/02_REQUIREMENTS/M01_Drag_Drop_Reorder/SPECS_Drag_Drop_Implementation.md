# Technical Specifications: Drag & Drop Implementation

**Milestone:** M01_Drag_Drop_Reorder  
**Related PRD:** PRD_Drag_Drop_Reorder.md  
**Created:** 2025-06-19  
**Status:** Draft

## Overview

This document provides technical specifications for implementing drag-and-drop reordering in the WFH Time Tracker application. The implementation will leverage Angular's capabilities while maintaining the existing signal-based architecture.

## Architecture Decisions

### Implementation Approach
**Decision**: Use Angular CDK Drag & Drop module
- Provides robust cross-platform support out of the box
- Handles touch and mouse events consistently
- Includes accessibility features
- Well-tested and maintained by Angular team

**Alternative Considered**: Custom implementation
- Would provide more control but require significant effort
- Risk of edge case bugs and browser incompatibilities

### State Management
**Decision**: Reorder by mutating array indices in projectList signal
```typescript
// In AppComponent
reorderProjects(previousIndex: number, currentIndex: number) {
  const projects = [...this.projectList()];
  const [removed] = projects.splice(previousIndex, 1);
  projects.splice(currentIndex, 0, removed);
  this.projectList.set(projects);
}
```

### Persistence Strategy
**Decision**: Debounced save using RxJS debounceTime
```typescript
private saveDebounced = toSignal(
  toObservable(this.projectList).pipe(
    debounceTime(300),
    tap(projects => this.saveToLocalStorage(projects))
  )
);
```

## Component Architecture

### AppComponent Modifications
```typescript
export class AppComponent {
  // Existing
  projectList = signal<ProjectData[]>([]);
  
  // New drag-drop specific
  isDragging = signal<boolean>(false);
  draggedIndex = signal<number | null>(null);
  
  // Methods
  onDragStarted(event: CdkDragStart, index: number): void
  onDragEnded(event: CdkDragEnd): void
  onDragDropped(event: CdkDragDrop<ProjectData[]>): void
  reorderProjects(previousIndex: number, currentIndex: number): void
}
```

### ProjectItemComponent Modifications
```typescript
export class ProjectItemComponent {
  // New inputs for drag state
  @Input() isDragging = false;
  @Input() dragIndex: number;
  
  // Computed styles for drag states
  dragStyles = computed(() => ({
    'opacity': this.isDragging ? '0.6' : '1',
    'transform': this.isDragging ? 'scale(1.05)' : 'scale(1)',
    'cursor': this.isDragging ? 'grabbing' : 'grab'
  }));
}
```

## Implementation Details

### Module Setup
```typescript
// In AppComponent imports
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    // ... other imports
  ]
})
```

### Template Structure
```html
<!-- app.component.html -->
<div 
  cdkDropList 
  [cdkDropListData]="projectList()"
  (cdkDropListDropped)="onDragDropped($event)"
  class="project-list">
  
  @for (project of projectList(); track project.name; let i = $index) {
    <div 
      cdkDrag
      [cdkDragData]="project"
      (cdkDragStarted)="onDragStarted($event, i)"
      (cdkDragEnded)="onDragEnded($event)"
      class="drag-wrapper">
      
      <!-- Drag preview (ghost) -->
      <div *cdkDragPreview class="drag-preview">
        <app-project-item 
          [project]="project"
          [isDragging]="true">
        </app-project-item>
      </div>
      
      <!-- Placeholder -->
      <div *cdkDragPlaceholder class="drag-placeholder"></div>
      
      <!-- Actual item -->
      <app-project-item 
        [project]="project"
        [index]="i"
        [isDragging]="isDragging() && draggedIndex() === i"
        (remove)="removeProject(i)"
        (update)="updateProject(i, $event)">
      </app-project-item>
    </div>
  }
</div>
```

### Styling Implementation
```scss
// Drag-specific styles
.cdk-drag-preview {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  opacity: 0.8;
  transform: scale(1.05);
}

.cdk-drag-placeholder {
  opacity: 0.4;
  border: 2px dashed theme('colors.gray.400');
  background: theme('colors.gray.100');
  transition: all 200ms ease;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.project-list.cdk-drop-list-dragging .drag-wrapper:not(.cdk-drag-placeholder) {
  transition: transform 250ms ease;
}

// Drop zone indicator
.cdk-drop-list-receiving {
  background-color: theme('colors.blue.50');
}
```

### Mobile Optimization
```typescript
// Configure CDK for better mobile experience
@Component({
  providers: [{
    provide: CDK_DRAG_CONFIG,
    useValue: {
      dragStartThreshold: 5,
      pointerDirectionChangeThreshold: 5,
      constrainPosition: true
    }
  }]
})
```

### Accessibility Implementation
```typescript
// Keyboard reordering (if implemented)
@HostListener('keydown', ['$event'])
handleKeyboard(event: KeyboardEvent) {
  if (event.ctrlKey && event.shiftKey) {
    const index = this.focusedProjectIndex();
    if (event.key === 'ArrowUp' && index > 0) {
      this.reorderProjects(index, index - 1);
      this.announcementService.announce(`Moved project up to position ${index}`);
    } else if (event.key === 'ArrowDown' && index < this.projectList().length - 1) {
      this.reorderProjects(index, index + 1);
      this.announcementService.announce(`Moved project down to position ${index + 2}`);
    }
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('AppComponent Drag & Drop', () => {
  it('should reorder projects on drag drop', () => {
    // Setup
    const projects = [project1, project2, project3];
    component.projectList.set(projects);
    
    // Action
    component.reorderProjects(0, 2);
    
    // Assert
    expect(component.projectList()).toEqual([project2, project3, project1]);
  });
  
  it('should save to localStorage after debounce period', fakeAsync(() => {
    spyOn(component, 'saveToLocalStorage');
    component.reorderProjects(0, 1);
    
    tick(299);
    expect(component.saveToLocalStorage).not.toHaveBeenCalled();
    
    tick(1);
    expect(component.saveToLocalStorage).toHaveBeenCalledWith(component.projectList());
  }));
});
```

### Integration Tests
```typescript
describe('Drag Drop Integration', () => {
  it('should handle complete drag drop flow', async () => {
    // Setup component with projects
    const fixture = TestBed.createComponent(AppComponent);
    
    // Simulate drag start
    const dragElement = fixture.debugElement.query(By.css('[cdkDrag]'));
    dragElement.triggerEventHandler('cdkDragStarted', { source: { index: 0 }});
    
    // Verify drag state
    expect(fixture.componentInstance.isDragging()).toBe(true);
    
    // Simulate drop
    dragElement.triggerEventHandler('cdkDropListDropped', {
      previousIndex: 0,
      currentIndex: 2
    });
    
    // Verify final state
    fixture.detectChanges();
    expect(fixture.componentInstance.isDragging()).toBe(false);
  });
});
```

## Performance Optimizations

### Animation Performance
- Use CSS transforms instead of position changes
- Apply `will-change: transform` during drag
- Remove `will-change` after drag completes
- Use `transform: translateZ(0)` for GPU acceleration

### Memory Management
- Clean up drag subscriptions in ngOnDestroy
- Limit drag preview rendering complexity
- Use trackBy function in @for loops

### Large List Optimization
```typescript
// Virtual scrolling for 50+ items
@if (projectList().length > 50) {
  <cdk-virtual-scroll-viewport itemSize="80" class="project-viewport">
    <!-- Drag items here -->
  </cdk-virtual-scroll-viewport>
}
```

## Error Handling

### Drag Operation Failures
```typescript
onDragDropped(event: CdkDragDrop<ProjectData[]>) {
  try {
    if (event.previousIndex !== event.currentIndex) {
      this.reorderProjects(event.previousIndex, event.currentIndex);
    }
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    // Restore original order
    this.loadFromLocalStorage();
    this.showError('Failed to reorder. Please try again.');
  }
}
```

### localStorage Failures
```typescript
private saveToLocalStorage(projects: ProjectData[]) {
  try {
    const serialized = projects.map(p => p.sanitize());
    localStorage.setItem('wfhProjects', JSON.stringify(serialized));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      this.showError('Storage full. Please remove old projects.');
    } else {
      this.showError('Failed to save changes.');
    }
  }
}
```

## Migration Path

1. Install Angular CDK: `npm install @angular/cdk`
2. Update AppComponent with drag-drop imports
3. Implement reorder logic and state management
4. Add CDK directives to template
5. Style drag states and animations
6. Add tests for new functionality
7. Update documentation

## Security Considerations

- No external data transmission during drag operations
- Validate array indices before reordering
- Sanitize data before localStorage persistence
- No eval() or dynamic code execution

## Browser Compatibility Notes

### iOS Safari
- Requires touch-action CSS for smooth dragging
- May need -webkit prefixes for some transforms

### Android Chrome
- Test with both gesture navigation enabled/disabled
- Ensure drag doesn't trigger pull-to-refresh

### Desktop Browsers
- All modern versions fully supported
- IE11 not supported (Angular 20 requirement)