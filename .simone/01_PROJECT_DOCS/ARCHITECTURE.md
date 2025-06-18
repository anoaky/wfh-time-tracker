# Architecture Document: WFH Time Tracker

## Overview

The WFH Time Tracker is a modern Angular 19 application designed for tracking time spent on different projects while working from home. It leverages Angular's latest signals-based architecture for reactive state management and uses browser localStorage for data persistence, creating a lightweight, client-side solution with no backend dependencies.

## Core Architecture Principles

### 1. Standalone Components
- All components use Angular 19's standalone API
- No NgModules required
- Direct dependency declaration in component metadata
- Simplified application bootstrap

### 2. Signals-Based State Management
- Central state managed through Angular signals (`WritableSignal`)
- Reactive updates propagate automatically through the component tree
- Two-way data binding via `model()` signals
- Computed signals for derived state

### 3. Component-Based Architecture
- Clear separation of concerns between components
- Unidirectional data flow (parent → child via inputs, child → parent via outputs)
- Smart/container pattern with AppComponent as the smart component
- Feature components handle specific UI concerns

## System Components

### AppComponent (Container Component)
**Location**: `src/app/app.component.ts`

**Responsibilities**:
- Manages central application state (project list)
- Handles all state mutations (add/delete projects)
- Implements localStorage persistence via Angular effects
- Provides computed state for child components

**Key Design Decisions**:
- Uses `WritableSignal<ProjectData[]>` for reactive state
- Auto-save effect monitors state changes and persists to localStorage
- Exposes projectNames as computed signal for validation

### ProjectItemComponent (Feature Component)
**Location**: `src/app/project-item/`

**Responsibilities**:
- Displays individual project with timer
- Manages timer start/stop functionality
- Handles elapsed time tracking
- Emits delete events to parent

**Key Design Decisions**:
- Uses `model()` signal for two-way elapsed time binding
- RxJS interval for timer implementation
- Dynamic styling based on timer state
- Component cleanup on destroy

### AddProjectFormComponent (Feature Component)
**Location**: `src/app/add-project-form/`

**Responsibilities**:
- Provides form interface for creating projects
- Validates project names (required, unique)
- Handles form submission
- Real-time validation feedback

**Key Design Decisions**:
- Reactive forms with validators
- Signal-based duplicate checking
- Enter key submission support
- Form reset after successful submission

### ProjectData (Domain Model)
**Location**: `src/app/project-data.ts`

**Purpose**: Core data model representing a project

**Structure**:
```typescript
class ProjectData {
  name: string
  elapsedTime: WritableSignal<number>
  
  sanitize(): { name: string, elapsedTime: number }
}
```

**Key Design Decisions**:
- Encapsulates project state with signals
- Provides sanitization for persistence
- Separates runtime format from storage format

## Data Flow Architecture

### State Management Flow
1. **User Action**: User interacts with UI component
2. **Event Emission**: Component emits event via `output()`
3. **State Update**: AppComponent handles event and updates central state
4. **Signal Propagation**: Changes propagate through signal graph
5. **UI Update**: Components re-render based on signal changes
6. **Persistence**: Effect automatically saves to localStorage

### Component Communication
```
AppComponent (Smart)
    ├── ProjectItemComponent (Presentation)
    │   ├── [Input] projectName: string
    │   ├── [Model] elapsedTime: number
    │   └── [Output] delete: EventEmitter
    │
    └── AddProjectFormComponent (Presentation)
        ├── [Input] existingProjectNames: string[]
        └── [Output] projectAdded: EventEmitter<string>
```

## Persistence Layer

### localStorage Strategy
- **Key**: `wfhProjects`
- **Format**: JSON array of sanitized project objects
- **Trigger**: Angular effect reacts to any projectList change
- **Error Handling**: Try-catch blocks handle corrupted data

### Data Serialization
```typescript
// Runtime format (with signals)
{ name: string, elapsedTime: WritableSignal<number> }

// Persisted format (plain data)
{ name: string, elapsedTime: number }
```

## Technical Stack

### Core Framework
- **Angular 19.2.0**: Latest version with signals support
- **TypeScript 5.7.2**: Strict mode for type safety
- **RxJS 7.8.0**: Observable patterns for async operations
- **Zone.js 0.15.0**: Change detection mechanism

### Styling
- **Tailwind CSS 4.1.10**: Utility-first CSS framework
- **PostCSS**: CSS processing for Tailwind
- **Custom Properties**: Dark mode support via CSS variables

### Build & Development
- **Angular CLI 19.2.15**: Project scaffolding and build
- **Angular DevKit**: Build optimization
- **Karma/Jasmine**: Unit testing framework

## Design Patterns

### Signal Pattern
```typescript
// State declaration
projectList = signal<ProjectData[]>([])

// Computed state
projectNames = computed(() => 
  this.projectList().map(p => p.name)
)

// Effect for side effects
effect(() => {
  const projects = this.projectList()
  localStorage.setItem('wfhProjects', JSON.stringify(projects))
})
```

### Component Model Pattern
```typescript
// Two-way binding with signals
elapsedTime = model(0)

// Usage in template
<app-project-item [(elapsedTime)]="project.elapsedTime()" />
```

## Security Considerations

### Data Security
- No external API calls (all data local)
- Angular's built-in XSS protection
- No sensitive data storage
- Client-side only architecture

### Constraints
- localStorage size limits (~10MB)
- Single-user, single-device usage
- No data synchronization
- Manual backup required

## Performance Optimization

### Current Optimizations
- Signal-based fine-grained reactivity
- Minimal re-renders through signal updates
- Lightweight component architecture
- Efficient localStorage writes via effects

### Future Optimization Opportunities
- Implement OnPush change detection
- Add virtual scrolling for large project lists
- Implement service workers for offline support
- Consider IndexedDB for larger datasets

## Testing Strategy

### Unit Testing
- Component isolation with TestBed
- Signal testing patterns
- Mock localStorage interactions
- Form validation testing

### Test Structure
```
├── app.component.spec.ts
├── project-item.component.spec.ts
├── add-project-form.component.spec.ts
└── project-data.spec.ts
```

## Deployment Architecture

### Build Configuration
- Production builds with optimization
- Tree shaking for unused code
- Bundle size budgets (1MB initial)
- Source map generation

### Hosting
- Static file hosting compatible
- Firebase hosting configured
- No server-side requirements
- CDN-friendly architecture

## Future Architecture Considerations

### Scalability Enhancements
1. **Service Layer**: Extract business logic to services
2. **State Management**: Consider NgRx for complex state
3. **Data Layer**: Implement IndexedDB for larger datasets
4. **Authentication**: Add user management and cloud sync

### Feature Expansions
1. **Routing**: Add multiple views with Angular Router
2. **PWA**: Implement service workers and app manifest
3. **Analytics**: Add time tracking insights and reports
4. **Export**: Implement data export functionality

### Technical Improvements
1. **Error Boundaries**: Implement error handling components
2. **Loading States**: Add skeleton screens
3. **Undo/Redo**: Implement command pattern
4. **Keyboard Navigation**: Full keyboard support

## Architecture Decision Records (ADRs)

### ADR-001: Signals Over Observables
**Decision**: Use Angular signals instead of RxJS observables for state management
**Rationale**: Simpler API, better performance, future-proof with Angular direction

### ADR-002: No Backend Architecture
**Decision**: Client-side only with localStorage
**Rationale**: Simplicity, no hosting costs, privacy-focused, quick deployment

### ADR-003: Standalone Components
**Decision**: Use standalone API instead of NgModules
**Rationale**: Reduced boilerplate, better tree shaking, Angular best practice

### ADR-004: Tailwind CSS
**Decision**: Use Tailwind instead of custom CSS or component libraries
**Rationale**: Rapid development, consistent design, small bundle size

## Conclusion

The WFH Time Tracker architecture represents a modern, lightweight approach to building Angular applications. By leveraging signals for state management and maintaining a simple component hierarchy, the application achieves excellent performance and maintainability while keeping complexity minimal. The architecture is well-suited for its purpose as a personal time tracking tool while providing clear paths for future enhancement.