import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should export CSV with project data', () => {
        const mockProjects = [
            { name: 'Project 1', elapsedTime: 3661 },
            { name: 'Project 2', elapsedTime: 7322 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(mockProjects);

        service.exportToCSV(mockProjects);

        expect(URL.createObjectURL).toHaveBeenCalled();
        const blobCall = (URL.createObjectURL as jasmine.Spy).calls.argsFor(0)[0];
        expect(blobCall.type).toBe('text/csv');
    });

    it('should handle CSV field escaping for names with commas', () => {
        const mockProjects = [
            { name: 'Project, With Comma', elapsedTime: 3600 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(mockProjects);

        service.exportToCSV(mockProjects);

        expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle CSV field escaping for names with quotes', () => {
        const mockProjects = [
            { name: 'Project "With Quotes"', elapsedTime: 3600 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(mockProjects);

        service.exportToCSV(mockProjects);

        expect(URL.createObjectURL).toHaveBeenCalled();
    });
});

describe('exportToJSON', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should export empty JSON when no projects exist', () => {
        mockLocalStorage['wfhProjects'] = '[]';

        service.exportToJSON([]);

        expect(URL.createObjectURL).toHaveBeenCalledWith(
            jasmine.any(Blob)
        );
        expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should export JSON with project data and metadata', () => {
        const mockProjects = [
            { name: 'Project 1', elapsedTime: 3661 },
            { name: 'Project 2', elapsedTime: 7322 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(mockProjects);

        service.exportToJSON(mockProjects);

        expect(URL.createObjectURL).toHaveBeenCalled();
        const blobCall = (URL.createObjectURL as jasmine.Spy).calls.argsFor(0)[0];
        expect(blobCall.type).toBe('application/json');
    });

    it('should handle localStorage errors gracefully', () => {
        (localStorage.getItem as jasmine.Spy).and.throwError('localStorage error');

        expect(() => service.exportToJSON([])).not.toThrow();
        expect(URL.createObjectURL).toHaveBeenCalled();
    });
});

describe('formatElapsedTime', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should format time correctly', () => {
        // Access private method for testing using array notation
        const formatMethod = (service as any).formatElapsedTime;

        expect(formatMethod(0)).toBe('00:00:00');
        expect(formatMethod(60)).toBe('00:01:00');
        expect(formatMethod(3600)).toBe('01:00:00');
        expect(formatMethod(3661)).toBe('01:01:01');
        expect(formatMethod(7322)).toBe('02:02:02');
    });
});

describe('escapeCSVField', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should escape CSV fields correctly', () => {
        const escapeMethod = (service as any).escapeCSVField;

        expect(escapeMethod('Simple Name')).toBe('Simple Name');
        expect(escapeMethod('Name, With Comma')).toBe('"Name, With Comma"');
        expect(escapeMethod('Name "With Quotes"')).toBe('"Name ""With Quotes"""');
        expect(escapeMethod('Name\nWith\nNewlines')).toBe('"Name\nWith\nNewlines"');
    });
});

describe('getProjectsFromStorage', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should return empty array when localStorage is empty', () => {
        const getProjectsMethod = (service as any).getProjectsFromStorage;

        const result = getProjectsMethod();

        expect(result).toEqual([]);
    });

    it('should return projects from localStorage', () => {
        const getProjectsMethod = (service as any).getProjectsFromStorage;
        const mockProjects = [
            { name: 'Project 1', elapsedTime: 3600 },
            { name: 'Project 2', elapsedTime: 7200 }
        ];
        mockLocalStorage['wfhProjects'] = JSON.stringify(mockProjects);

        const result = getProjectsMethod();

        expect(result).toEqual(mockProjects);
    });

    it('should handle JSON parsing errors', () => {
        const getProjectsMethod = (service as any).getProjectsFromStorage;
        mockLocalStorage['wfhProjects'] = 'invalid json';

        const result = getProjectsMethod();

        expect(result).toEqual([]);
    });
});

describe('file download functionality', () => {
    let service: ExportService;
    let mockLocalStorage: { [key: string]: string; };

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {};
        spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage[key] = value);

        // Mock document methods for file download
        spyOn(document, 'createElement').and.callFake((tagName: string) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jasmine.createSpy('click'),
                    remove: jasmine.createSpy('remove')
                } as any;
            }
            return null;
        });

        spyOn(document.body, 'appendChild').and.stub();
        spyOn(document.body, 'removeChild').and.stub();

        // Mock URL methods
        spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
        spyOn(URL, 'revokeObjectURL').and.stub();

        TestBed.configureTestingModule({});
        service = TestBed.inject(ExportService);
    });

    it('should create and click download link for CSV', () => {
        const mockLink = {
            href: '',
            download: '',
            click: jasmine.createSpy('click'),
            remove: jasmine.createSpy('remove')
        };
        (document.createElement as jasmine.Spy).and.returnValue(mockLink);
        mockLocalStorage['wfhProjects'] = '[]';

        service.exportToCSV([]);

        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.download).toBe('wfh-time-tracker-export.csv');
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should create and click download link for JSON', () => {
        const mockLink = {
            href: '',
            download: '',
            click: jasmine.createSpy('click'),
            remove: jasmine.createSpy('remove')
        };
        (document.createElement as jasmine.Spy).and.returnValue(mockLink);
        mockLocalStorage['wfhProjects'] = '[]';

        service.exportToJSON([]);

        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.download).toBe('wfh-time-tracker-export.json');
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
});