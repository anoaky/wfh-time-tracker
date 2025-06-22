import { Injectable, signal } from '@angular/core';
import { ProjectData } from '../common/project-data';

@Injectable({ providedIn: 'root' })
export class ImportService {

  async importFromFile(file: File): Promise<ProjectData[]> {
    const content = await this.readFile(file);
    const fileType = file.type || this.guessFileType(file.name);
    
    if (fileType === 'application/json' || file.name.endsWith('.json')) {
      return this.parseJSON(content);
    } else if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
      return this.parseCSV(content);
    } else {
      throw new Error('Unsupported file format. Please upload a JSON or CSV file.');
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }

  private parseJSON(content: string): ProjectData[] {
    try {
      // Strip BOM if present
      const cleanContent = content.replace(/^\uFEFF/, '');
      const parsed = JSON.parse(cleanContent);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid JSON format. Expected an array of projects.');
      }
      
      const projects: ProjectData[] = [];
      
      for (const item of parsed) {
        if (!this.isValidProjectData(item)) {
          throw new Error(`Invalid project data: ${JSON.stringify(item)}`);
        }
        
        const project = new ProjectData(item.name, signal(item.elapsedTime));
        projects.push(project);
      }
      
      return projects;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your file.');
      }
      throw error;
    }
  }

  private parseCSV(content: string): ProjectData[] {
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row.');
    }
    
    const projects: ProjectData[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const fields = this.parseCSVLine(lines[i]);
      
      if (fields.length < 2) {
        throw new Error(`Invalid CSV row at line ${i + 1}: insufficient fields`);
      }
      
      const projectName = fields[0];
      let elapsedTime: number;
      
      // Try to parse elapsed time from HH:MM:SS format or seconds
      if (fields[1].includes(':')) {
        elapsedTime = this.parseTimeString(fields[1]);
      } else if (fields.length >= 3 && fields[2]) {
        // Use seconds column if available
        elapsedTime = parseInt(fields[2], 10);
        if (isNaN(elapsedTime)) {
          throw new Error(`Invalid elapsed time at line ${i + 1}`);
        }
      } else {
        throw new Error(`Invalid time format at line ${i + 1}`);
      }
      
      const project = new ProjectData(projectName, signal(elapsedTime));
      projects.push(project);
    }
    
    return projects;
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add last field
    fields.push(currentField);
    
    return fields;
  }

  private parseTimeString(timeStr: string): number {
    const parts = timeStr.split(':');
    if (parts.length !== 3) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  private isValidProjectData(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.name === 'string' &&
      data.name.length > 0 &&
      typeof data.elapsedTime === 'number' &&
      data.elapsedTime >= 0 &&
      Number.isInteger(data.elapsedTime)
    );
  }

  private guessFileType(filename: string): string {
    if (filename.endsWith('.json')) {
      return 'application/json';
    } else if (filename.endsWith('.csv')) {
      return 'text/csv';
    }
    return '';
  }
}