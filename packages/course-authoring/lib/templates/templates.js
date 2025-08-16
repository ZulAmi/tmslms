'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.contentComponents = exports.courseTemplates = void 0;
exports.courseTemplates = [
  {
    id: 'basic-course-template',
    name: 'Basic Course Template',
    description:
      'A simple course template with introduction, content, and summary',
    blocks: [
      {
        id: '1',
        type: 'text',
        content: {
          text: "Welcome to this course! We'll cover important concepts step by step.",
        },
      },
      {
        id: '2',
        type: 'text',
        content: {
          text: "By the end of this course, you'll have a solid understanding of the material.",
        },
      },
    ],
    metadata: {
      category: 'General',
      tags: ['basic', 'beginner'],
      difficulty: 'beginner',
      estimatedDuration: 60,
      author: 'System',
      isPublic: true,
    },
  },
  {
    id: 'interactive-course-template',
    name: 'Interactive Course Template',
    description: 'A course template with multimedia content',
    blocks: [
      {
        id: '3',
        type: 'video',
        content: {
          url: 'https://example.com/intro-video.mp4',
          title: 'Welcome to the Course',
          description: 'Course introduction video',
        },
      },
      {
        id: '4',
        type: 'text',
        content: {
          text: 'Watch the video above to get started with the course.',
        },
      },
    ],
    metadata: {
      category: 'Interactive',
      tags: ['interactive', 'multimedia'],
      difficulty: 'intermediate',
      estimatedDuration: 90,
      author: 'System',
      isPublic: true,
    },
  },
];
exports.contentComponents = [
  {
    id: 'text-block',
    name: 'Text Block',
    type: 'text',
    description: 'Rich text content with formatting',
    icon: 'text',
  },
  {
    id: 'video-block',
    name: 'Video',
    type: 'video',
    description: 'Embedded video content',
    icon: 'video',
  },
  {
    id: 'image-block',
    name: 'Image',
    type: 'image',
    description: 'Image with caption',
    icon: 'image',
  },
];
