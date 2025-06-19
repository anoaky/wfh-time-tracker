# Product Requirements Document: Drag & Drop Reorder

**Milestone:** M01_Drag_Drop_Reorder  
**Created:** 2025-06-19  
**Status:** Draft

## Executive Summary

This PRD defines the requirements for implementing drag-and-drop reordering functionality in the WFH Time Tracker application. Users will be able to reorganize their project list by dragging projects to new positions, with the order persisting across sessions.

## Problem Statement

Currently, projects appear in the order they were created, with no ability for users to prioritize or organize them according to their workflow. As users accumulate more projects, finding and focusing on active projects becomes cumbersome.

## Goals & Success Metrics

### Primary Goals
- Enable intuitive project list organization through drag-and-drop
- Support both desktop and mobile users equally well
- Maintain application performance and simplicity

### Success Metrics
- 100% of drag operations complete without errors
- Reorder animations run at 60fps on modern devices
- Touch/mouse interactions feel native and responsive
- Zero data loss during reordering operations

## User Stories

### Core Functionality
1. **As a desktop user**, I want to click and drag a project to reorder my list, so I can prioritize my active projects.
2. **As a mobile user**, I want to touch and drag projects to reorder them, so I can organize on the go.
3. **As a user**, I want to see clear visual feedback while dragging, so I know exactly where the project will be placed.
4. **As a user**, I want my reordered list to persist, so my organization is maintained between sessions.

### Visual Feedback
5. **As a user**, I want to see a shadow/ghost of the item I'm dragging, so I can track what I'm moving.
6. **As a user**, I want to see an indicator showing where the item will drop, so I can position it precisely.
7. **As a user**, I want smooth animations during reordering, so the experience feels polished.

### Edge Cases
8. **As a user**, I want to continue reordering projects even while timers are running, so I'm not blocked by active work.
9. **As a keyboard user**, I want keyboard shortcuts to reorder items, so the app remains accessible.

## Functional Requirements

### Drag Initiation
- **Desktop**: Click and hold on project item for 150ms to initiate drag
- **Mobile**: Touch and hold for 200ms, with slight movement tolerance
- Entire project card should be draggable, not just a handle
- Visual feedback on drag start (scale, shadow, opacity change)

### During Drag
- Dragged item shows as semi-transparent ghost (60% opacity)
- Original position shows placeholder with dashed border
- Drop indicator line appears between projects as user drags
- Smooth scrolling when dragging near viewport edges
- Other items animate to make space (transform transitions)

### Drop Behavior
- Drop on valid position: Items animate to final positions
- Drop outside list: Item animates back to original position
- ESC key cancels drag operation
- Touch release or mouse up completes the operation

### Data Persistence
- Debounced save to localStorage (300ms after last change)
- Order preserved by array index in projectList
- No additional order field needed in ProjectData model

### Accessibility
- Keyboard reordering via Ctrl+Shift+↑/↓ (nice-to-have)
- Screen reader announcements for position changes
- Focus management during keyboard operations

## Non-Functional Requirements

### Performance
- Animations must run at 60fps on devices from last 3 years
- No jank or stuttering during drag operations
- Minimal CPU usage during idle state
- Memory-efficient for lists up to 100 projects

### Browser Support
- Chrome 90+ (Desktop & Android)
- Firefox 88+ (Desktop & Android)
- Safari 14+ (Desktop & iOS)
- Edge 90+ (Desktop)

### Mobile Considerations
- Touch targets minimum 44x44px
- Prevent accidental drags during scrolling
- Handle both portrait and landscape orientations
- Support gesture navigation without conflicts

## Design Specifications

### Visual States
1. **Default**: Standard project card appearance
2. **Hover** (desktop): Subtle cursor change to indicate draggability
3. **Dragging**: 60% opacity, elevated shadow, slight scale (1.05)
4. **Drop Zone**: 2px blue line between projects
5. **Invalid Drop**: Red tint on ghost element

### Animation Timing
- Drag start: 150ms ease-out
- Position shifts: 200ms ease-in-out
- Drop animation: 250ms ease-out
- Cancel animation: 300ms ease-in-out

## Technical Constraints
- Must work within Angular's signal-based architecture
- Cannot break existing timer functionality
- Must maintain current localStorage data structure
- Should not require additional dependencies if possible

## Out of Scope
- Drag between different browser windows
- Multi-select and bulk reordering
- Nested project groups or categories
- Undo/redo for reorder operations

## Dependencies
- Angular 19's component architecture
- Existing localStorage persistence mechanism
- Current ProjectData model structure

## Risks & Mitigations
- **Risk**: Performance on low-end mobile devices
  - **Mitigation**: Implement reduced motion mode
- **Risk**: Conflicts with scroll behavior on mobile
  - **Mitigation**: Clear touch delay and movement threshold
- **Risk**: Data corruption during save
  - **Mitigation**: Validate data before persistence

## Future Considerations
- Sorting options (alphabetical, by time spent)
- Grouping projects into categories
- Sync ordering across devices
- Drag-and-drop to archive/delete