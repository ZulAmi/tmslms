import React from 'react';
import { VideoAnnotation, VideoQuiz } from '../types';

interface InteractiveVideoOverlayProps {
  annotations: VideoAnnotation[];
  activeQuiz: VideoQuiz | null;
  currentTime: number;
  onAnnotationClick: (annotation: VideoAnnotation) => void;
  onQuizComplete: (quizId: string, answers: Record<string, any>) => void;
  onQuizSkip: (quizId: string) => void;
  className?: string;
}

export function InteractiveVideoOverlay({
  annotations,
  activeQuiz,
  currentTime,
  onAnnotationClick,
  onQuizComplete,
  onQuizSkip,
  className = ''
}: InteractiveVideoOverlayProps) {
  // Simplified state management without hooks
  const quizAnswers: Record<string, any> = {};

  // Filter annotations that should be visible at current time
  const visibleAnnotations = annotations.filter(
    annotation => currentTime >= annotation.startTime && currentTime <= annotation.endTime
  );

  const handleQuizAnswerChange = (questionId: string, answer: any) => {
    quizAnswers[questionId] = answer;
  };

  const handleQuizSubmit = () => {
    if (activeQuiz) {
      onQuizComplete(activeQuiz.id, quizAnswers);
    }
  };

  const handleQuizSkip = () => {
    if (activeQuiz) {
      onQuizSkip(activeQuiz.id);
    }
  };

  return (
    <div className={`interactive-video-overlay absolute inset-0 pointer-events-none ${className}`}>
      {/* Video Annotations */}
      {visibleAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute pointer-events-auto cursor-pointer transition-all duration-300"
          style={{
            left: `${annotation.position.x}%`,
            top: `${annotation.position.y}%`,
            width: annotation.position.width ? `${annotation.position.width}%` : 'auto',
            height: annotation.position.height ? `${annotation.position.height}%` : 'auto',
          }}
          onClick={() => annotation.interactive && onAnnotationClick(annotation)}
        >
          {/* Annotation Content */}
          <div
            className="annotation-content p-3 rounded-lg shadow-lg max-w-xs"
            style={{
              backgroundColor: annotation.style?.backgroundColor || '#1f2937',
              color: annotation.style?.textColor || '#ffffff',
              borderColor: annotation.style?.borderColor || 'transparent',
              fontSize: annotation.style?.fontSize || '14px',
            }}
          >
            {/* Text Content */}
            {annotation.content.text && (
              <p className="mb-2 last:mb-0">{annotation.content.text}</p>
            )}

            {/* Image Content */}
            {annotation.content.imageUrl && (
              <img 
                src={annotation.content.imageUrl} 
                alt="Annotation" 
                className="max-w-full h-auto rounded mb-2 last:mb-0"
              />
            )}

            {/* HTML Content */}
            {annotation.content.html && (
              <div 
                className="annotation-html mb-2 last:mb-0"
                dangerouslySetInnerHTML={{ __html: annotation.content.html }} 
              />
            )}

            {/* Link */}
            {annotation.content.url && (
              <a
                href={annotation.content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-300 hover:text-blue-100 underline"
              >
                Learn More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {/* Interactive Indicator */}
            {annotation.interactive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </div>

          {/* Hotspot Indicator */}
          {annotation.type === 'hotspot' && (
            <div className="absolute inset-0 border-2 border-yellow-400 rounded-full animate-ping opacity-75" />
          )}
        </div>
      ))}

      {/* Quiz Overlay */}
      {activeQuiz && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Quiz Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeQuiz.title}</h3>
              {activeQuiz.passingScore && (
                <p className="text-sm text-gray-600">
                  Passing Score: {activeQuiz.passingScore}%
                </p>
              )}
            </div>

            {/* Quiz Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((question, questionIndex) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-500">
                      Question {questionIndex + 1} of {activeQuiz.questions.length}
                    </span>
                    <h4 className="text-lg font-medium text-gray-900 mt-1">
                      {question.question}
                    </h4>
                    <div className="text-sm text-gray-600 mt-1">
                      Points: {question.points}
                    </div>
                  </div>

                  {/* Multiple Choice */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={quizAnswers[question.id] === option}
                            onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === 'true-false' && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value="true"
                          checked={quizAnswers[question.id] === 'true'}
                          onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-700">True</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value="false"
                          checked={quizAnswers[question.id] === 'false'}
                          onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-700">False</span>
                      </label>
                    </div>
                  )}

                  {/* Fill in the Blank */}
                  {question.type === 'fill-blank' && (
                    <input
                      type="text"
                      placeholder="Enter your answer..."
                      value={quizAnswers[question.id] || ''}
                      onChange={(e) => handleQuizAnswerChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {/* Drag and Drop */}
                  {question.type === 'drag-drop' && question.options && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Drag items to reorder them:</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-md cursor-move hover:bg-gray-100"
                            draggable
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleQuizSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip Quiz
              </button>
              
              <div className="flex space-x-3">
                {activeQuiz.allowRetry && (
                  <button
                    onClick={() => {
                      // Reset quiz answers
                      Object.keys(quizAnswers).forEach(key => delete quizAnswers[key]);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Quiz
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {Object.keys(quizAnswers).length} / {activeQuiz.questions.length} answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.keys(quizAnswers).length / activeQuiz.questions.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
