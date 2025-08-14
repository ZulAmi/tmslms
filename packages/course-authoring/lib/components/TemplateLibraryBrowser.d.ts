import { CourseTemplate } from '../types';
interface TemplateLibraryBrowserProps {
    onSelectTemplate: (template: CourseTemplate) => void;
    onClose: () => void;
}
export declare const TemplateLibraryBrowser: ({ onSelectTemplate, onClose }: TemplateLibraryBrowserProps) => import("react/jsx-runtime").JSX.Element;
export {};
