import { Injectable } from '@angular/core';
import { ProjectData } from '../common/project-data';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportAsJSON(projects: ProjectData[]): void {
    const sanitizedProjects = projects.map(project => project.sanitize());
    const jsonContent = JSON.stringify(sanitizedProjects, null, 2);
    const filename = `wfh-projects-${this.getCurrentDateString()}.json`;
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  exportAsCSV(projects: ProjectData[]): void {
    const headers = ['Project Name', 'Elapsed Time (HH:MM:SS)', 'Elapsed Time (Seconds)'];
    const csvRows = [headers.join(',')];
    
    for (const project of projects) {
      const sanitized = project.sanitize();
      const formattedTime = this.formatTime(sanitized.elapsedTime);
      const row = [
        this.escapeCsvField(sanitized.name),
        formattedTime,
        sanitized.elapsedTime.toString()
      ];
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const filename = `wfh-projects-${this.getCurrentDateString()}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private formatTime(seconds: number): string {
    const hours = Math.trunc(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.trunc(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}