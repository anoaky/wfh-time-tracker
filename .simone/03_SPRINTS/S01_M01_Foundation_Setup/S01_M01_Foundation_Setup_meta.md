---
sprint_folder_name: S01_M01_Foundation_Setup
sprint_sequence_id: S01
milestone_id: M01
title: Foundation Setup - Core Drag-Drop Infrastructure
status: planned
goal: Establish the core drag-and-drop infrastructure using Angular CDK and implement basic reordering functionality.
last_updated: 2025-06-19T15:35:00Z
---

# Sprint: Foundation Setup - Core Drag-Drop Infrastructure (S01)

## Sprint Goal
Establish the core drag-and-drop infrastructure using Angular CDK and implement basic reordering functionality.

## Scope & Key Deliverables
- Setup separate git branch for drag-drop feature
- Install and configure Angular CDK drag-drop module
- Add CDK drag-drop directives to app template (cdkDropList, cdkDrag)
- Implement core reorder logic in AppComponent with signals
- Create basic drag-drop functionality for project list
- Add foundational unit tests for reorder methods
- Ensure basic desktop drag-drop works without visual polish

## Definition of Done (for the Sprint)
- Angular CDK is installed and properly configured
- Projects can be physically reordered via drag-drop on desktop browsers
- AppComponent.reorderProjects() method correctly updates projectList signal
- Basic drag-drop templates are implemented with CDK directives
- Unit tests cover core reorder logic with >80% coverage
- No visual polish required, but functionality must work
- No regressions in existing timer functionality

## Tasks
The sprint is broken down into 4 sequential tasks organized by dependency order:

### Infrastructure & Setup
1. **T01_S01_Project_Setup_CDK_Integration** (Medium Complexity)
   - Setup git branch and integrate Angular CDK drag-drop module
   - Configure dependencies and ensure compatibility with existing architecture

### Template Integration  
2. **T02_S01_Template_Integration_Drag_Setup** (Medium Complexity)
   - Add CDK drag-drop directives to templates and create draggable structure
   - Integrate cdkDropList and cdkDrag while preserving existing UI patterns

### Core Implementation
3. **T03_S01_Reorder_Logic_Implementation** (Medium Complexity) 
   - Implement core reorder logic and drag-drop event handling with Angular signals
   - Create reorderProjects method with proper state management

### Quality Assurance
4. **T04_S01_Testing_Quality_Assurance** (Medium Complexity)
   - Implement comprehensive testing for drag-drop functionality 
   - Ensure >80% test coverage and validate sprint acceptance criteria

## Notes / Retrospective Points
- This sprint focuses purely on getting the technical foundation working
- Visual enhancements and mobile support will come in subsequent sprints
- Priority is on stable, working drag-drop infrastructure that others can build upon