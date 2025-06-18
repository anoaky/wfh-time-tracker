# WFH Time Tracker - Architecture Document

## Project Overview

**Purpose**: A free, open-source work-from-home time tracking application designed for individual use. Users can create projects, track time spent on them, and maintain a persistent record of their work sessions.

**Technology Stack**:
- Angular 20 (latest signals-based architecture)
- TypeScript 5.8
- Tailwind CSS v4
- RxJS for reactive programming
- Jasmine/Karma for testing

**Key Technical Decisions**:
- **Angular Framework**: Chosen as a learning platform to explore modern Angular development practices
- **Signals-based State Management**: Leverages Angular's latest reactive primitives for fine-grained reactivity
- **Local Storage Persistence**: Simple, privacy-focused approach requiring no backend
- **Standalone Components**: Modern Angular architecture without NgModules
- **Tailwind CSS**: Utility-first styling for rapid development and consistency

## Architecture Overview

### Component Hierarchy
```
AppComponent (Root Container & State Manager)
├── AddProjectFormComponent (Project Creation UI)
└── ProjectItemComponent[] (Individual Project Timers)
```

### Data Flow Architecture
```
User Actions → Component Events → Signal Updates → Auto-save Effect
                                        ↓
                                  UI Re-renders
                                        ↓
                                  localStorage
```

## Core Components

### AppComponent
**Location**: `src/app/app.component.ts`  
**Responsibilities**:
- Central state management via `projectList` signal
- localStorage persistence through Angular effects
- Project lifecycle management (create, delete)
- Error handling for data corruption

**Key Implementation**:
```typescript
projectList = signal<ProjectData[]>([]);
projectNames = computed(() => this.projectList().map(p => p.name));

effect(() => {
  const projects = this.projectList();
  if (projects.length > 0) {
    this.saveProjects();
  }
});
```

### ProjectItemComponent  
**Location**: `src/app/project-item/`  
**Responsibilities**:
- Individual timer management
- Time display formatting (HH:MM:SS)
- Visual feedback for active timers
- Project deletion requests

**Key Features**:
- Two-way data binding with `model()` for elapsed time
- RxJS interval-based timer implementation
- Pulse animation for running timers

### AddProjectFormComponent
**Location**: `src/app/add-project-form/`  
**Responsibilities**:
- Project name input and validation
- Duplicate name detection (case-insensitive)
- Reactive form management
- Keyboard shortcuts (Enter to submit)

## Data Model

### ProjectData Class
```typescript
export class ProjectData {
  name: string;
  elapsedTime: WritableSignal<number>;
  
  sanitize() {
    return { name: this.name, elapsedTime: this.elapsedTime() };
  }
}
```

**Design Rationale**:
- Encapsulates project state with reactive properties
- `sanitize()` method enables clean serialization
- WritableSignal for `elapsedTime` enables granular updates

## State Management Strategy

### Signal-based Architecture
- **Root State**: `projectList` signal in AppComponent
- **Derived State**: Computed signals for filtered/transformed data
- **Component State**: Local signals for UI state (isRunning, form validity)

### Persistence Layer
- **Storage Key**: `wfhProjects`
- **Format**: JSON array of sanitized ProjectData objects
- **Trigger**: Angular effect on projectList changes
- **Error Handling**: Graceful fallback for corrupted data

## Styling & UI/UX

### Design Principles
- **Responsive First**: Functions well across all device sizes
- **Minimal & Clean**: Focus on functionality over decoration
- **Visual Feedback**: Clear states for running/stopped timers
- **Accessibility**: Keyboard navigation, ARIA labels

### Tailwind Configuration
- Blue-based color palette
- Dark mode support ready
- Mobile-first breakpoints
- Smooth transitions and animations

## Testing Strategy

### Unit Testing Approach
- **Framework**: Jasmine + Karma
- **Coverage Goals**: Component behavior, data flow, validation logic
- **Test Categories**:
  1. Component initialization
  2. User interaction flows
  3. State management
  4. Data persistence
  5. Error handling

### Example Test Pattern
```typescript
it('should add a new project to the list', () => {
  const projectName = 'Test Project';
  component.addProject(projectName);
  expect(component.projectList().length).toBe(1);
  expect(component.projectList()[0].name).toBe(projectName);
});
```

## Performance Considerations

- **Signal Efficiency**: Fine-grained updates prevent unnecessary re-renders
- **Computed Memoization**: Derived values cached until dependencies change
- **Minimal DOM Updates**: Component structure supports OnPush strategy
- **Efficient Storage**: Debounced writes through effect scheduling

## Security & Privacy

- **No External Dependencies**: All data stored locally
- **No Analytics**: Complete user privacy
- **No Network Requests**: Fully offline capable
- **Data Ownership**: Users control their data entirely

## Constraints & Requirements

### Browser Support
- Modern browsers with ES2022 support
- Chrome/Edge 90+, Firefox 88+, Safari 14+

### Device Support
- **Desktop**: Full functionality
- **Tablet**: Responsive layout adapts
- **Mobile**: Touch-optimized interactions

### Performance Targets
- Initial load: < 3 seconds
- Timer updates: 60fps smooth
- Zero perceptible lag on interactions

## Future Considerations

While no specific features are planned, the architecture supports:
- Export functionality (CSV, JSON)
- Project categorization/tags
- Time reports and analytics
- Theming system
- Keyboard shortcuts
- PWA capabilities

## Development Workflow

### Commands
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run unit tests
npm run watch      # Build with file watching
```

### Code Style
- TypeScript strict mode
- Angular style guide compliance
- Consistent component structure
- Self-documenting code preferred over comments

## Deployment

### Current Setup
- GitHub Actions CI/CD pipeline
- Firebase Hosting for production
- Automated testing on PR/merge

### Build Configuration
- Production optimizations enabled
- Tree shaking for minimal bundle
- Ahead-of-Time compilation

## Architecture Strengths

1. **Modern Angular Patterns**: Showcases latest Angular 19 features
2. **Simple Yet Scalable**: Easy to understand, room to grow
3. **Privacy-Focused**: No backend, complete user control
4. **Learning-Friendly**: Clear structure for Angular education
5. **Responsive Design**: Works everywhere, no compromises
6. **Well-Tested**: Comprehensive test coverage ensures reliability

## Architecture Trade-offs

1. **Local Storage Limitations**: No cross-device sync
2. **Browser Dependency**: Data tied to specific browser
3. **No Collaboration**: Single-user only by design
4. **Manual Backup**: Users must export data themselves

These trade-offs align with the project's goals of simplicity, privacy, and individual use.