import { LearningPath } from '../types';
interface LearningPathDesignerProps {
    learningPath?: LearningPath;
    onSave: (path: LearningPath) => void;
    onClose: () => void;
}
export declare const LearningPathDesigner: ({ learningPath, onSave, onClose }: LearningPathDesignerProps) => import("react/jsx-runtime").JSX.Element;
export {};
