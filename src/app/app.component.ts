import { Component, signal, effect, WritableSignal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddProjectFormComponent } from './add-project-form/add-project-form.component';
import { ProjectData } from './project-data';
import { ProjectItemComponent } from './project-item/project-item.component';
import { ExportButtonComponent } from './export-button/export-button.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AddProjectFormComponent, ProjectItemComponent, ExportButtonComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    projectList: WritableSignal<ProjectData[]>;
    projectNames = computed(() => this.projectList().map(p => p.name));
    projectsForExport = computed(() => this.projectList().map(p => ({ 
        name: p.name, 
        elapsedTime: p.elapsedTime() 
    })));

    constructor() {
        const projectJson = localStorage.getItem('wfhProjects');
        console.log(projectJson);
        let savedObjects: { name: string, elapsedTime: number; }[] = [];
        try {
            savedObjects = JSON.parse(projectJson ?? '[]') as { name: string, elapsedTime: number; }[];
        } catch (error) {
            console.error('Error parsing localStorage data:', error);
            savedObjects = [];
        }
        const reconstructedProjects: ProjectData[] = [];
        for (var obj of savedObjects) {
            reconstructedProjects.push(new ProjectData(obj.name, signal(obj.elapsedTime)));
        }
        this.projectList = signal(reconstructedProjects);

        // autosave
        effect(() => {
            const projsSanitized = [];
            for (var proj of this.projectList()) {
                projsSanitized.push(proj.sanitize());
            }
            const saveJson = JSON.stringify(projsSanitized);
            localStorage.setItem('wfhProjects', saveJson);
        });
    }
    title = 'wfh-time-tracker';

    addProject(name: string) {
        const newProject = new ProjectData(name);
        this.projectList.update((projs) =>
            [...projs, newProject]
        );
    }

    deleteProject(projectName: string) {
        this.projectList.update((projs) =>
            projs.filter(project => project.name !== projectName)
        );
    }
}
