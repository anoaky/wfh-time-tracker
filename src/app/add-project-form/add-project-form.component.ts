import { Component, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-add-project-form',
    imports: [ReactiveFormsModule],
    templateUrl: './add-project-form.component.html',
    styleUrl: './add-project-form.component.css'
})
export class AddProjectFormComponent {
    newProjectName = new FormControl('');
    addProject = output<string>();

    onKey(event: KeyboardEvent) {
        if (event.key == "Enter" && this.newProjectName.value != '') {
            this.onClick();
        }
    }

    onClick() {
        this.addProject.emit(this.newProjectName.value!);
        this.newProjectName.setValue('');
    }
}
