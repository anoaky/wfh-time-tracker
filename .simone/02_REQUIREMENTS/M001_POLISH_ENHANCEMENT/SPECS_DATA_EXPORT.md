# Technical Specification - Data Export Feature

## Overview
This document specifies the technical implementation of data export functionality for the WFH Time Tracker.

## Architecture Design

### Component Structure
```
AppComponent
└── ExportButtonComponent (new)
    └── ExportModalComponent (new)
```

### Service Architecture
```
ExportService (new)
├── CSV Export Logic
├── JSON Export Logic
└── File Download Handler
```

## Implementation Details

### 1. ExportService

```typescript
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  exportToCSV(projects: ProjectData[]): void {
    const csv = this.generateCSV(projects);
    this.downloadFile(csv, 'wfh-time-tracker-export.csv', 'text/csv');
  }
  
  exportToJSON(projects: ProjectData[]): void {
    const json = this.generateJSON(projects);
    this.downloadFile(json, 'wfh-time-tracker-export.json', 'application/json');
  }
  
  private generateCSV(projects: ProjectData[]): string {
    const headers = ['Project Name', 'Total Time (seconds)', 'Total Time (formatted)', 'Export Date'];
    const rows = projects.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.elapsedTime(),
      this.formatTime(p.elapsedTime()),
      new Date().toISOString().split('T')[0]
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  private generateJSON(projects: ProjectData[]): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      projects: projects.map(p => ({
        name: p.name,
        elapsedTime: p.elapsedTime(),
        formattedTime: this.formatTime(p.elapsedTime())
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
```

### 2. ExportButtonComponent

```typescript
@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="toggleExportMenu()"
      class="relative px-4 py-2 bg-green-500 text-white rounded-lg 
             hover:bg-green-600 active:bg-green-700 transition-all
             transform hover:scale-105 active:scale-95"
      aria-label="Export time tracking data"
      [attr.aria-expanded]="showMenu()"
    >
      <span class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </span>
    </button>
    
    @if (showMenu()) {
      <div class="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 
                  rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                  animate-fadeIn z-10"
           role="menu"
           aria-label="Export format options">
        <button (click)="exportCSV()" 
                class="block w-full px-4 py-2 text-left hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors rounded-t-lg"
                role="menuitem">
          Export as CSV
        </button>
        <button (click)="exportJSON()" 
                class="block w-full px-4 py-2 text-left hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors rounded-b-lg"
                role="menuitem">
          Export as JSON
        </button>
      </div>
    }
  `
})
export class ExportButtonComponent {
  @Input({ required: true }) projects!: ProjectData[];
  
  showMenu = signal(false);
  
  constructor(private exportService: ExportService) {}
  
  toggleExportMenu(): void {
    this.showMenu.update(show => !show);
  }
  
  exportCSV(): void {
    this.exportService.exportToCSV(this.projects);
    this.showMenu.set(false);
    this.showSuccessFeedback();
  }
  
  exportJSON(): void {
    this.exportService.exportToJSON(this.projects);
    this.showMenu.set(false);
    this.showSuccessFeedback();
  }
  
  private showSuccessFeedback(): void {
    // Implement success animation/toast
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showMenu.set(false);
    }
  }
}
```

### 3. Integration with AppComponent

```typescript
// In app.component.ts
import { ExportButtonComponent } from './export-button/export-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProjectItemComponent, AddProjectFormComponent, ExportButtonComponent],
  template: `
    <!-- Existing template -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">WFH Time Tracker</h1>
      @if (projectList().length > 0) {
        <app-export-button [projects]="projectList()" />
      }
    </div>
    <!-- Rest of template -->
  `
})
```

## Testing Strategy

### Unit Tests

```typescript
describe('ExportService', () => {
  let service: ExportService;
  
  beforeEach(() => {
    service = TestBed.inject(ExportService);
    spyOn(document, 'createElement').and.returnValue({
      click: jasmine.createSpy('click'),
      href: '',
      download: ''
    } as any);
  });
  
  it('should generate valid CSV with escaped quotes', () => {
    const projects = [
      new ProjectData('Project "A"', 3600),
      new ProjectData('Project B', 7200)
    ];
    
    service.exportToCSV(projects);
    
    // Verify CSV format and escaping
  });
  
  it('should generate valid JSON structure', () => {
    const projects = [new ProjectData('Test', 1800)];
    
    service.exportToJSON(projects);
    
    // Verify JSON structure
  });
});
```

### Integration Tests

```typescript
describe('Export Feature Integration', () => {
  it('should show export button only when projects exist', () => {
    // Test visibility logic
  });
  
  it('should close menu when clicking outside', () => {
    // Test click outside behavior
  });
  
  it('should trigger download on export selection', () => {
    // Test full export flow
  });
});
```

## Animation Specifications

### Export Menu Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 200ms ease-out;
}
```

### Button Feedback
- Scale transform on hover: 1.05
- Scale transform on click: 0.95
- Transition duration: 150ms

## Performance Considerations

- **Large Dataset Handling**: For >1000 projects, implement chunked processing
- **Memory Management**: Use streaming for very large exports
- **UI Responsiveness**: Export operations should not block UI thread

## Accessibility Requirements

- Full keyboard navigation support
- ARIA labels and roles for menu
- Focus management when menu opens/closes
- Screen reader announcements for export success

## Browser Compatibility

- File download API supported in all modern browsers
- Blob API for file generation
- No polyfills required for target browsers

## Future Enhancements

- Date range filtering before export
- Custom field selection
- Additional export formats (PDF, Excel)
- Export templates/presets
- Batch operations for multiple exports