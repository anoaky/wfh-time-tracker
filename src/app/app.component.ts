import { Component, signal, effect, WritableSignal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { AddProjectFormComponent } from './add-project-form/add-project-form.component';
import { ProjectData } from './project-data';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CdkDropList, AddProjectFormComponent, ProjectItemComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    projectList: WritableSignal<ProjectData[]>;
    projectNames = computed(() => this.projectList().map(p => p.name));

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
