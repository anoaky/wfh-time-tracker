import { Component, signal, effect, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddProjectFormComponent } from './add-project-form/add-project-form.component';
import { ProjectData } from './project-data';
import { ProjectItemComponent } from './project-item/project-item.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, AddProjectFormComponent, ProjectItemComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    projectList: WritableSignal<ProjectData[]>;

    constructor() {
        const projectJson = localStorage.getItem('wfhProjects');
        console.log(projectJson);
        const savedObjects = JSON.parse(projectJson ?? '[]') as { name: string, elapsedTime: number, rate: number; }[];
        const reconstructedProjects: ProjectData[] = [];
        for (var obj of savedObjects) {
            reconstructedProjects.push(new ProjectData(obj.name, signal(obj.elapsedTime), obj.rate));
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
}
