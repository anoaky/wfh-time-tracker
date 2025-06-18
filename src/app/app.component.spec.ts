import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { signal } from '@angular/core';
import { ProjectData } from './project-data';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(async () => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            return mockLocalStorage[key] || null;
        });
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            mockLocalStorage[key] = value;
        });
        spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
            delete mockLocalStorage[key];
        });

        await TestBed.configureTestingModule({
            imports: [AppComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct title', () => {
        expect(component.title).toBe('wfh-time-tracker');
    });

    it('should render title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('h1')?.textContent).toContain('WFH Time Tracker');
    });

    it('should initialize with empty project list when no localStorage data', () => {
        expect(component.projectList()).toEqual([]);
        expect(localStorage.getItem).toHaveBeenCalledWith('wfhProjects');
    });

    it('should load projects from localStorage on initialization', () => {
        // Set up localStorage before creating component
        const savedProjects = [
            { name: 'Project 1', elapsedTime: 120 },
            { name: 'Project 2', elapsedTime: 3600 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(savedProjects);

        // Create new component instance
        const newFixture = TestBed.createComponent(AppComponent);
        const newComponent = newFixture.componentInstance;

        expect(newComponent.projectList().length).toBe(2);
        expect(newComponent.projectList()[0].name).toBe('Project 1');
        expect(newComponent.projectList()[0].elapsedTime()).toBe(120);
        expect(newComponent.projectList()[1].name).toBe('Project 2');
        expect(newComponent.projectList()[1].elapsedTime()).toBe(3600);
    });

    it('should handle invalid localStorage data gracefully', () => {
        mockLocalStorage['wfhProjects'] = 'invalid json';

        // Component should handle error and initialize with empty array
        expect(() => {
            const newFixture = TestBed.createComponent(AppComponent);
            const newComponent = newFixture.componentInstance;
            expect(newComponent.projectList()).toEqual([]);
        }).not.toThrow();
    });

    it('should add new project', () => {
        expect(component.projectList().length).toBe(0);

        component.addProject('New Project');

        expect(component.projectList().length).toBe(1);
        expect(component.projectList()[0].name).toBe('New Project');
        expect(component.projectList()[0].elapsedTime()).toBe(0);
    });

    it('should save to localStorage when adding project', () => {
        component.addProject('Test Project');

        // Angular effects run asynchronously, so we need to wait
        fixture.detectChanges();

        expect(localStorage.setItem).toHaveBeenCalled();
        const savedData = JSON.parse(mockLocalStorage['wfhProjects']);
        expect(savedData).toEqual([{ name: 'Test Project', elapsedTime: 0 }]);
    });

    it('should save to localStorage when project time changes', () => {
        component.addProject('Timer Project');
        fixture.detectChanges();

        // Update elapsed time
        component.projectList()[0].elapsedTime.set(60);
        fixture.detectChanges();

        const savedData = JSON.parse(mockLocalStorage['wfhProjects']);
        expect(savedData).toEqual([{ name: 'Timer Project', elapsedTime: 60 }]);
    });

    it('should display empty state when no projects', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const emptyStateHeading = compiled.querySelector('h3');
        const emptyStateContainer = emptyStateHeading?.parentElement;

        expect(emptyStateHeading).toBeTruthy();
        expect(emptyStateHeading?.textContent).toContain('Ready to level up your time tracking?');
        expect(emptyStateContainer?.textContent).toContain('Add your first project above and get started today!');
    });

    it('should display project list when projects exist', () => {
        component.addProject('Project A');
        component.addProject('Project B');
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const projectItems = compiled.querySelectorAll('project-item');

        expect(projectItems.length).toBe(2);
    });

    it('should pass correct inputs to project items', () => {
        component.addProject('Test Project');
        component.projectList()[0].elapsedTime.set(120);
        fixture.detectChanges();

        const projectItemDebugEl = fixture.debugElement.query(By.css('project-item'));
        expect(projectItemDebugEl).toBeTruthy();

        const projectItemComponent = projectItemDebugEl.componentInstance;
        expect(projectItemComponent.projectName()).toBe('Test Project');
        expect(projectItemComponent.elapsedTime()).toBe(120);
    });

    it('should handle multiple projects with different elapsed times', () => {
        component.addProject('Project 1');
        component.addProject('Project 2');
        component.addProject('Project 3');

        component.projectList()[0].elapsedTime.set(100);
        component.projectList()[1].elapsedTime.set(200);
        component.projectList()[2].elapsedTime.set(300);

        fixture.detectChanges();

        const savedData = JSON.parse(mockLocalStorage['wfhProjects']);
        expect(savedData).toEqual([
            { name: 'Project 1', elapsedTime: 100 },
            { name: 'Project 2', elapsedTime: 200 },
            { name: 'Project 3', elapsedTime: 300 }
        ]);
    });

    it('should maintain project order', () => {
        const projects = ['First', 'Second', 'Third', 'Fourth'];
        projects.forEach(name => component.addProject(name));

        expect(component.projectList().map(p => p.name)).toEqual(projects);
    });

    it('should delete project by name', () => {
        component.addProject('Project A');
        component.addProject('Project B');
        component.addProject('Project C');

        expect(component.projectList().length).toBe(3);

        component.deleteProject('Project B');

        expect(component.projectList().length).toBe(2);
        expect(component.projectList().map(p => p.name)).toEqual(['Project A', 'Project C']);
    });

    it('should update localStorage after deletion', () => {
        component.addProject('Project to Delete');
        component.addProject('Project to Keep');
        fixture.detectChanges();

        component.deleteProject('Project to Delete');
        fixture.detectChanges();

        const savedData = JSON.parse(mockLocalStorage['wfhProjects']);
        expect(savedData).toEqual([{ name: 'Project to Keep', elapsedTime: 0 }]);
    });

    it('should handle deletion of non-existent project', () => {
        component.addProject('Existing Project');

        expect(() => component.deleteProject('Non-existent Project')).not.toThrow();
        expect(component.projectList().length).toBe(1);
        expect(component.projectList()[0].name).toBe('Existing Project');
    });

    it('should delete first project correctly', () => {
        component.addProject('First');
        component.addProject('Second');
        component.addProject('Third');

        component.deleteProject('First');

        expect(component.projectList().map(p => p.name)).toEqual(['Second', 'Third']);
    });

    it('should delete last project correctly', () => {
        component.addProject('First');
        component.addProject('Second');
        component.addProject('Third');

        component.deleteProject('Third');

        expect(component.projectList().map(p => p.name)).toEqual(['First', 'Second']);
    });

    it('should delete middle project correctly', () => {
        component.addProject('First');
        component.addProject('Second');
        component.addProject('Third');

        component.deleteProject('Second');

        expect(component.projectList().map(p => p.name)).toEqual(['First', 'Third']);
    });

    it('should preserve elapsed times when deleting projects', () => {
        component.addProject('Project 1');
        component.addProject('Project 2');
        component.addProject('Project 3');

        component.projectList()[0].elapsedTime.set(100);
        component.projectList()[1].elapsedTime.set(200);
        component.projectList()[2].elapsedTime.set(300);

        component.deleteProject('Project 2');

        expect(component.projectList()[0].elapsedTime()).toBe(100);
        expect(component.projectList()[1].elapsedTime()).toBe(300);
    });

    it('should handle deletion of all projects', () => {
        component.addProject('Project 1');
        component.addProject('Project 2');

        component.deleteProject('Project 1');
        component.deleteProject('Project 2');

        expect(component.projectList().length).toBe(0);
        fixture.detectChanges();

        const savedData = JSON.parse(mockLocalStorage['wfhProjects']);
        expect(savedData).toEqual([]);
    });

    it('should provide project names to add-project-form', () => {
        component.addProject('Project A');
        component.addProject('Project B');
        fixture.detectChanges();

        expect(component.projectNames()).toEqual(['Project A', 'Project B']);

        const addFormComponent = fixture.debugElement.query(By.css('app-add-project-form'));
        expect(addFormComponent.componentInstance.existingProjectNames()).toEqual(['Project A', 'Project B']);
    });

    it('should update project names when projects are added or deleted', () => {
        expect(component.projectNames()).toEqual([]);

        component.addProject('First');
        expect(component.projectNames()).toEqual(['First']);

        component.addProject('Second');
        expect(component.projectNames()).toEqual(['First', 'Second']);

        component.deleteProject('First');
        expect(component.projectNames()).toEqual(['Second']);
    });

    it('should prevent adding duplicate project names through integration', () => {
        component.addProject('Existing Project');
        fixture.detectChanges();

        const addFormComponent = fixture.debugElement.query(By.css('app-add-project-form')).componentInstance;
        addFormComponent.newProjectName.setValue('existing project');

        let projectAdded = false;
        addFormComponent.addProject.subscribe(() => {
            projectAdded = true;
        });

        addFormComponent.onClick();

        expect(projectAdded).toBe(false);
        expect(component.projectList().length).toBe(1);
    });
});
