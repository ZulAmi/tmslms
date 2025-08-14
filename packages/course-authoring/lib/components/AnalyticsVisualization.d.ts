import { UUID } from '../types';
interface AnalyticsVisualizationProps {
    courseId?: UUID;
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
    onClose?: () => void;
}
export declare const AnalyticsVisualization: (props: AnalyticsVisualizationProps) => import("react/jsx-runtime").JSX.Element;
export {};
