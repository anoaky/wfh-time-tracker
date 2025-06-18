import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  exportToCSV(projects: { name: string, elapsedTime: number }[]): void {
    try {
      const csvData = this.generateCSV(projects);
      this.downloadFile(csvData, 'wfh-time-tracker-export.csv', 'text/csv');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export data to CSV format');
    }
  }

  exportToJSON(projects: { name: string, elapsedTime: number }[]): void {
    try {
      const jsonData = this.generateJSON(projects);
      this.downloadFile(jsonData, 'wfh-time-tracker-export.json', 'application/json');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export data to JSON format');
    }
  }

  private getProjectsFromStorage(): { name: string, elapsedTime: number }[] {
    try {
      const projectJson = localStorage.getItem('wfhProjects');
      if (!projectJson) {
        return [];
      }
      const projects = JSON.parse(projectJson) as { name: string, elapsedTime: number }[];
      return projects;
    } catch (error) {
      console.error('Error reading projects from localStorage:', error);
      return [];
    }
  }

  private formatElapsedTime(elapsedTimeInSeconds: number): string {
    let t = elapsedTimeInSeconds;
    const hours = Math.trunc(t / 3600);
    t = t % 3600;
    const minutes = Math.trunc(t / 60);
    t = t % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${t.toString().padStart(2, '0')}`;
  }

  private generateCSV(projects: { name: string, elapsedTime: number }[]): string {
    const headers = 'Project Name,Total Time (seconds),Total Time (formatted),Export Date';
    const exportDate = new Date().toISOString();
    
    const rows = projects.map(project => {
      const escapedName = this.escapeCSVField(project.name);
      const formattedTime = this.formatElapsedTime(project.elapsedTime);
      return `${escapedName},${project.elapsedTime},${formattedTime},${exportDate}`;
    });

    return [headers, ...rows].join('\n');
  }

  private generateJSON(projects: { name: string, elapsedTime: number }[]): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalProjects: projects.length,
      projects: projects.map(project => ({
        name: project.name,
        elapsedTime: project.elapsedTime,
        formattedTime: this.formatElapsedTime(project.elapsedTime)
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  private escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}