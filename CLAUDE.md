# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Angular 19 work-from-home time tracker application that allows users to create projects and track time spent on them. The app uses Angular's new signals-based architecture with local storage for data persistence.

## Core Architecture
- **AppComponent**: Main component managing the project list with localStorage autosave using Angular effects
- **ProjectData**: Core data model class with sanitization for persistence
- **ProjectItemComponent**: Individual project timer display and controls
- **AddProjectFormComponent**: Form for creating new projects
- Uses Angular signals throughout for reactive state management
- Tailwind CSS for styling

## Development Commands
- Start development server: `ng serve` or `npm start`
- Build project: `ng build` or `npm run build`
- Run tests: `ng test` or `npm test`
- Watch build: `npm run watch`

## Data Management
- Projects are stored in localStorage with key 'wfhProjects'
- ProjectData class provides sanitize() method for serialization
- Automatic saving implemented via Angular effect in AppComponent
- State managed through Angular signals and WritableSignal

## Testing
- Uses Jasmine and Karma for unit testing
- Test files follow `.spec.ts` naming convention