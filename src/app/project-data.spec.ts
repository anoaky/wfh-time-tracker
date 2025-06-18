import { ProjectData } from './project-data';
import { signal } from '@angular/core';

describe('ProjectData', () => {
    it('should create an instance with default elapsed time', () => {
        const project = new ProjectData('Test Project');
        expect(project).toBeTruthy();
        expect(project.name).toBe('Test Project');
        expect(project.elapsedTime()).toBe(0);
    });

    it('should create an instance with custom elapsed time', () => {
        const customTime = signal(3600); // 1 hour in seconds
        const project = new ProjectData('Test Project', customTime);
        expect(project).toBeTruthy();
        expect(project.name).toBe('Test Project');
        expect(project.elapsedTime()).toBe(3600);
    });

    it('should allow updating elapsed time', () => {
        const project = new ProjectData('Test Project');
        expect(project.elapsedTime()).toBe(0);
        
        project.elapsedTime.set(120);
        expect(project.elapsedTime()).toBe(120);
        
        project.elapsedTime.update(t => t + 60);
        expect(project.elapsedTime()).toBe(180);
    });

    it('should sanitize correctly for localStorage', () => {
        const project = new ProjectData('Test Project');
        project.elapsedTime.set(7200); // 2 hours
        
        const sanitized = project.sanitize();
        expect(sanitized).toEqual({
            name: 'Test Project',
            elapsedTime: 7200
        });
        expect(typeof sanitized.elapsedTime).toBe('number');
    });

    it('should handle empty project name', () => {
        const project = new ProjectData('');
        expect(project.name).toBe('');
        expect(project.elapsedTime()).toBe(0);
        
        const sanitized = project.sanitize();
        expect(sanitized.name).toBe('');
    });
});
