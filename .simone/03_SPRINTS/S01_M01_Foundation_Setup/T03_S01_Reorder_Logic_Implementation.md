---
task_id: T03_S01
sprint_sequence_id: S01
status: open
complexity: Medium
last_updated: 2025-06-19T15:45:00Z
---

# Task: Reorder Logic Implementation

## Description
Implement the core reorder logic and drag-drop event handling functionality using Angular signals architecture. This task builds upon the template structure established in Task 2 by adding the backend logic to handle CdkDragDrop events and properly update the projectList signal to reflect the new order. The implementation must integrate seamlessly with the existing signal-based state management and localStorage persistence pattern already established in the codebase.

## Goal / Objectives
Establish robust reorder functionality that integrates with Angular signals and maintains data persistence:
- Implement AppComponent.reorderProjects() method using Angular signals patterns
- Add proper CdkDragDrop event handling that integrates with existing state management
- Ensure reorder changes persist automatically through existing localStorage effect
- Maintain consistency with current signal-based architecture patterns

## Acceptance Criteria
Technical implementation requirements that must be met:
- [ ] AppComponent contains reorderProjects(event: CdkDragDrop<ProjectData[]>) method
- [ ] Method properly updates projectList WritableSignal using .update() pattern
- [ ] CdkDragDrop event handling correctly calculates new array positions
- [ ] Reorder changes trigger existing localStorage autosave effect automatically
- [ ] Implementation follows existing signal patterns from addProject/deleteProject methods
- [ ] No breaking changes to existing ProjectData class interface
- [ ] Method integrates properly with moveItemInArray from @angular/cdk/drag-drop

## Subtasks
Implementation steps to complete the core reorder logic:
- [ ] Import CdkDragDrop and moveItemInArray from @angular/cdk/drag-drop in app.component.ts
- [ ] Add reorderProjects method to AppComponent class following existing signal update patterns
- [ ] Implement proper array manipulation using moveItemInArray utility function
- [ ] Update projectList signal using .update() method consistent with existing addProject/deleteProject
- [ ] Verify integration with existing localStorage autosave effect (should trigger automatically)
- [ ] Test method handles edge cases (same position, invalid indices) gracefully
- [ ] Ensure method signature matches template event binding from Task 2
- [ ] Validate no side effects on existing ProjectData.sanitize() persistence pattern

## Technical Implementation Notes

### AppComponent Integration Points
- Follow existing signal update pattern: `this.projectList.update((projs) => /* array manipulation */)`
- Leverage existing localStorage effect - no changes needed to autosave functionality
- Import required CDK utilities: `import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'`
- Method signature must match template binding: `reorderProjects(event: CdkDragDrop<ProjectData[]>)`

### Signal Architecture Consistency
- Use projectList.update() method following addProject/deleteProject patterns
- Maintain immutable array updates with spread operator or moveItemInArray
- Preserve existing ProjectData object references - only change array order
- No modifications needed to ProjectData class or sanitize() method

### LocalStorage Persistence Integration
- Existing autosave effect will automatically trigger on projectList changes
- Current effect watches projectList() signal and calls sanitize() on each project
- No additional persistence logic required in reorderProjects method
- Maintain existing error handling and JSON serialization patterns

### Dependencies and Prerequisites
- Requires Task 2 (T02_S01) template structure completion for event binding
- Angular CDK drag-drop module must be installed and imported
- Template must have proper cdkDropList and (cdkDropListDropped) event binding
- CdkDragDrop type must be available for method parameter typing

### References to Existing Codebase Patterns
- Follow addProject method pattern for signal updates (lines 45-50 in app.component.ts)
- Reference deleteProject filter pattern for array manipulation (lines 52-56 in app.component.ts)
- Maintain consistency with existing WritableSignal<ProjectData[]> typing (line 14 in app.component.ts)
- Preserve existing constructor localStorage loading and effect autosave patterns (lines 17-42 in app.component.ts)

## Technical Guidance

### Architecture References
This task implementation must align with established state management patterns and signal architecture decisions:

**Primary Reference**: `.simone/02_REQUIREMENTS/M01_Drag_Drop_Reorder/SPECS_Drag_Drop_Implementation.md`
- **State Management Pattern**: Specification defines exact implementation using `reorderProjects(previousIndex: number, currentIndex: number)` method that mutates array indices in projectList signal, providing the precise pattern we must follow.
- **Signal Integration**: Document shows specific signal update pattern: `const projects = [...this.projectList()]; /* manipulation */; this.projectList.set(projects);` which aligns with our existing signal architecture.
- **Persistence Strategy**: Specification confirms debounced save using RxJS `debounceTime(300)` which integrates with our existing localStorage effect pattern, requiring no additional persistence logic.

**Secondary Reference**: `.simone/01_PROJECT_DOCS/ARCHITECTURE.md`
- **Signal-Based State Management**: Architecture specifies "Leverages Angular's latest reactive primitives for fine-grained reactivity" with `projectList = signal<ProjectData[]>([])` as the root state. Our reorder logic must use this established signal pattern.
- **Data Flow Architecture**: Document shows "User Actions → Component Events → Signal Updates → Auto-save Effect" flow, meaning our drag-drop events must integrate seamlessly with existing component event handling.
- **Existing Update Patterns**: Architecture shows `addProject` and `deleteProject` methods using signal `.update()` patterns that our reorder logic must match for consistency.

### How Architectural Decisions Apply to This Task
1. **Signal Update Consistency**: Following architecture's signal-based patterns, our `reorderProjects` method must use the established `projectList.update()` approach rather than direct `.set()` calls, maintaining consistency with existing `addProject`/`deleteProject` methods.

2. **Immutable State Updates**: Per the architecture's reactive primitives approach, we'll use array spread operations and `moveItemInArray` utility to maintain immutability while updating the signal state.

3. **Automatic Persistence**: Architecture's existing "Auto-save Effect" pattern means our signal updates will automatically trigger localStorage persistence without requiring additional save logic in the reorder method.

4. **Component Event Integration**: Following the established "Component Events → Signal Updates" flow, our `CdkDragDrop` event handling integrates with the existing component architecture without requiring new event patterns.

5. **Data Model Preservation**: Architecture emphasizes the `ProjectData` class with its `sanitize()` method for persistence. Our reorder logic only changes array position, preserving object references and ensuring compatibility with existing serialization patterns.

6. **Performance Alignment**: Architecture targets specify "Fine-grained updates prevent unnecessary re-renders" and "60fps smooth" performance. Our signal-based reorder implementation maintains these performance characteristics by leveraging Angular's optimized signal change detection.

## Output Log
*(This section is populated as work progresses on the task)*
