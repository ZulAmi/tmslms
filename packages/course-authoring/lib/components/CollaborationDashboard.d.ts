import { UUID } from '../types';
interface CollaborationDashboardProps {
    courseId?: UUID;
    userId: string;
    onClose?: () => void;
}
export declare const CollaborationDashboard: (props: CollaborationDashboardProps) => import("react/jsx-runtime").JSX.Element;
export {};
