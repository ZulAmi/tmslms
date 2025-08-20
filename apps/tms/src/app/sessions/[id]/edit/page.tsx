'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionForm {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  duration: string;
  maxParticipants: number;
  location: string;
  instructor: string;
  instructorEmail: string;
  category: string;
  level: string;
  price: number;
  materials: string[];
  prerequisites: string[];
  objectives: string[];
}

const categories = [
  'Leadership',
  'Technical Skills',
  'Soft Skills',
  'Compliance',
  'Safety',
  'Customer Service',
  'Sales',
  'Management',
  'IT',
  'Other',
];

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function EditSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [formData, setFormData] = useState<SessionForm>({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    duration: '',
    maxParticipants: 20,
    location: '',
    instructor: '',
    instructorEmail: '',
    category: '',
    level: '',
    price: 0,
    materials: [],
    prerequisites: [],
    objectives: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newMaterial, setNewMaterial] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);

      // Simulate API call with demo data
      await new Promise((resolve) => setTimeout(resolve, 800));

      const demoSession = {
        title: 'Advanced Leadership Training',
        description:
          'Comprehensive leadership development program focusing on strategic thinking, team management, and organizational change. This intensive session covers modern leadership methodologies and practical applications.',
        date: '2024-01-20',
        time: '09:00',
        endTime: '17:00',
        duration: '8 hours',
        maxParticipants: 20,
        location: 'Conference Room A, Main Building',
        instructor: 'Sarah Johnson',
        instructorEmail: 'sarah.johnson@company.com',
        category: 'Leadership',
        level: 'Advanced',
        price: 499,
        materials: [
          'Leadership Handbook (PDF)',
          'Case Study Materials',
          'Assessment Tools',
          'Reference Guide',
        ],
        prerequisites: [
          'Basic management experience',
          'Completion of Foundation Leadership course',
          'Supervisory responsibilities',
        ],
        objectives: [
          'Develop strategic thinking skills',
          'Master effective communication techniques',
          'Learn change management principles',
          'Build high-performing teams',
          'Implement leadership best practices',
        ],
      };

      setFormData(demoSession);
      setLoading(false);
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  // Track changes for unsaved changes warning
  useEffect(() => {
    setHasChanges(true);
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.time && formData.endTime <= formData.time) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor is required';
    }

    if (!formData.instructorEmail.trim()) {
      newErrors.instructorEmail = 'Instructor email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.instructorEmail)) {
      newErrors.instructorEmail = 'Please enter a valid email address';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Maximum participants must be at least 1';
    } else if (formData.maxParticipants > 100) {
      newErrors.maxParticipants = 'Maximum participants cannot exceed 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(
        '.tms-input.error, .tms-select.error, .tms-textarea.error'
      );
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real implementation, make API call to update session
      console.log('Updating session:', { id: sessionId, ...formData });

      setHasChanges(false);

      // Show success message and navigate back
      router.push(`/sessions/${sessionId}?updated=true`);
    } catch (error) {
      console.error('Error updating session:', error);
      // Show error notification
    } finally {
      setSaving(false);
    }
  };

  const addMaterial = () => {
    if (
      newMaterial.trim() &&
      !formData.materials.includes(newMaterial.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()],
      }));
      setNewMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const addPrerequisite = () => {
    if (
      newPrerequisite.trim() &&
      !formData.prerequisites.includes(newPrerequisite.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  const addObjective = () => {
    if (
      newObjective.trim() &&
      !formData.objectives.includes(newObjective.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="tms-dashboard">
        <header className="tms-header">
          <div className="tms-header-container">
            <div className="tms-brand">
              <Link href="/">
                <div className="tms-logo">T</div>
              </Link>
              <h1>Edit Session</h1>
            </div>
            <div
              className="tms-breadcrumb"
              style={{
                marginLeft: 'auto',
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
              }}
            >
              <Link
                href="/"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <Link
                href="/sessions"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Sessions
              </Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <Link
                href={`/sessions/${sessionId}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Session Details
              </Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span>Edit</span>
            </div>
          </div>
        </header>

        <main className="tms-main">
          <div
            className="tms-fade-in"
            style={{ textAlign: 'center', padding: '4rem 2rem' }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '3px solid var(--gray-200)',
                borderTop: '3px solid var(--primary-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem',
              }}
            ></div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-700)' }}>
              Loading Session Details
            </h2>
            <p style={{ color: 'var(--gray-600)' }}>
              Please wait while we retrieve the session information...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="tms-dashboard">
      <header className="tms-header">
        <div className="tms-header-container">
          <div className="tms-brand">
            <Link href="/">
              <div className="tms-logo">T</div>
            </Link>
            <div>
              <h1>Edit Session</h1>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)',
                  margin: 0,
                }}
              >
                Modify session details and settings
              </p>
            </div>
          </div>
          <div
            className="tms-breadcrumb"
            style={{
              marginLeft: 'auto',
              color: 'var(--gray-600)',
              fontSize: '0.875rem',
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link
              href="/sessions"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Sessions
            </Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <Link
              href={`/sessions/${sessionId}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Session Details
            </Link>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span>Edit</span>
          </div>
        </div>
      </header>

      <main className="tms-main">
        <div className="tms-fade-in">
          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                Session Editor
              </h2>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.875rem',
                  color: 'var(--gray-600)',
                }}
              >
                {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href={`/sessions/${sessionId}`}
                className="tms-btn tms-btn-secondary"
                onClick={(e) => {
                  if (
                    hasChanges &&
                    !confirm(
                      'You have unsaved changes. Are you sure you want to leave?'
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>←</span>
                Cancel
              </Link>
              <button
                type="submit"
                form="edit-session-form"
                className="tms-btn tms-btn-primary"
                disabled={saving}
                style={{ minWidth: '120px' }}
              >
                {saving ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem',
                      }}
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '0.5rem' }}>💾</span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <form id="edit-session-form" onSubmit={handleSubmit}>
            <div className="tms-content-grid">
              {/* Basic Information */}
              <div className="tms-card">
                <div className="tms-card-header">
                  <h3 className="tms-card-title">
                    <span style={{ marginRight: '0.5rem' }}>📋</span>
                    Basic Information
                  </h3>
                  <p className="tms-card-description">
                    Core session details and categorization
                  </p>
                </div>
                <div className="tms-card-content">
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="tms-form-group">
                      <label htmlFor="title" className="tms-label">
                        Session Title *
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className={`tms-input ${errors.title ? 'error' : ''}`}
                        placeholder="Enter a descriptive session title"
                        maxLength={100}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '0.25rem',
                        }}
                      >
                        {errors.title && (
                          <span className="tms-error-text">{errors.title}</span>
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--gray-500)',
                            marginLeft: 'auto',
                          }}
                        >
                          {formData.title.length}/100
                        </span>
                      </div>
                    </div>

                    <div className="tms-form-group">
                      <label htmlFor="description" className="tms-label">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className={`tms-textarea ${errors.description ? 'error' : ''}`}
                        rows={4}
                        placeholder="Provide a comprehensive description of the session content, goals, and what participants will learn"
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: '0.25rem',
                        }}
                      >
                        {errors.description && (
                          <span className="tms-error-text">
                            {errors.description}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--gray-500)',
                            marginLeft: 'auto',
                          }}
                        >
                          {formData.description.length} characters
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div className="tms-form-group">
                        <label htmlFor="category" className="tms-label">
                          Category *
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className={`tms-select ${errors.category ? 'error' : ''}`}
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <span className="tms-error-text">
                            {errors.category}
                          </span>
                        )}
                      </div>

                      <div className="tms-form-group">
                        <label htmlFor="level" className="tms-label">
                          Difficulty Level *
                        </label>
                        <select
                          id="level"
                          value={formData.level}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              level: e.target.value,
                            }))
                          }
                          className={`tms-select ${errors.level ? 'error' : ''}`}
                        >
                          <option value="">Select Level</option>
                          {levels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.level && (
                          <span className="tms-error-text">{errors.level}</span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div className="tms-form-group">
                        <label htmlFor="price" className="tms-label">
                          Session Price *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'var(--gray-500)',
                              fontSize: '0.875rem',
                            }}
                          >
                            $
                          </span>
                          <input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: Number(e.target.value),
                              }))
                            }
                            className={`tms-input ${errors.price ? 'error' : ''}`}
                            style={{ paddingLeft: '1.75rem' }}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        {errors.price && (
                          <span className="tms-error-text">{errors.price}</span>
                        )}
                      </div>

                      <div className="tms-form-group">
                        <label htmlFor="maxParticipants" className="tms-label">
                          Maximum Participants *
                        </label>
                        <input
                          id="maxParticipants"
                          type="number"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxParticipants: Number(e.target.value),
                            }))
                          }
                          className={`tms-input ${errors.maxParticipants ? 'error' : ''}`}
                          min="1"
                          max="100"
                          placeholder="20"
                        />
                        {errors.maxParticipants && (
                          <span className="tms-error-text">
                            {errors.maxParticipants}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="tms-card">
                <div className="tms-card-header">
                  <h3 className="tms-card-title">
                    <span style={{ marginRight: '0.5rem' }}>📅</span>
                    Schedule & Location
                  </h3>
                  <p className="tms-card-description">
                    When and where the session will take place
                  </p>
                </div>
                <div className="tms-card-content">
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="tms-form-group">
                      <label htmlFor="date" className="tms-label">
                        Session Date *
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className={`tms-input ${errors.date ? 'error' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.date && (
                        <span className="tms-error-text">{errors.date}</span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div className="tms-form-group">
                        <label htmlFor="time" className="tms-label">
                          Start Time *
                        </label>
                        <input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className={`tms-input ${errors.time ? 'error' : ''}`}
                        />
                        {errors.time && (
                          <span className="tms-error-text">{errors.time}</span>
                        )}
                      </div>

                      <div className="tms-form-group">
                        <label htmlFor="endTime" className="tms-label">
                          End Time *
                        </label>
                        <input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className={`tms-input ${errors.endTime ? 'error' : ''}`}
                        />
                        {errors.endTime && (
                          <span className="tms-error-text">
                            {errors.endTime}
                          </span>
                        )}
                      </div>

                      <div className="tms-form-group">
                        <label htmlFor="duration" className="tms-label">
                          Duration
                        </label>
                        <input
                          id="duration"
                          type="text"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              duration: e.target.value,
                            }))
                          }
                          className="tms-input"
                          placeholder="e.g., 8 hours, 2 days"
                          readOnly
                          style={{ backgroundColor: 'var(--gray-50)' }}
                        />
                      </div>
                    </div>

                    <div className="tms-form-group">
                      <label htmlFor="location" className="tms-label">
                        Session Location *
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className={`tms-input ${errors.location ? 'error' : ''}`}
                        placeholder="e.g., Conference Room A, Main Building, Online via Zoom"
                      />
                      {errors.location && (
                        <span className="tms-error-text">
                          {errors.location}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div className="tms-form-group">
                        <label htmlFor="instructor" className="tms-label">
                          Instructor Name *
                        </label>
                        <input
                          id="instructor"
                          type="text"
                          value={formData.instructor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              instructor: e.target.value,
                            }))
                          }
                          className={`tms-input ${errors.instructor ? 'error' : ''}`}
                          placeholder="Full name of the session instructor"
                        />
                        {errors.instructor && (
                          <span className="tms-error-text">
                            {errors.instructor}
                          </span>
                        )}
                      </div>

                      <div className="tms-form-group">
                        <label htmlFor="instructorEmail" className="tms-label">
                          Instructor Email *
                        </label>
                        <input
                          id="instructorEmail"
                          type="email"
                          value={formData.instructorEmail}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              instructorEmail: e.target.value,
                            }))
                          }
                          className={`tms-input ${errors.instructorEmail ? 'error' : ''}`}
                          placeholder="instructor@company.com"
                        />
                        {errors.instructorEmail && (
                          <span className="tms-error-text">
                            {errors.instructorEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="tms-card" style={{ marginTop: '2rem' }}>
              <div className="tms-card-header">
                <h3 className="tms-card-title">
                  <span style={{ marginRight: '0.5rem' }}>📚</span>
                  Training Materials
                </h3>
                <p className="tms-card-description">
                  Resources and materials provided to participants
                </p>
              </div>
              <div className="tms-card-content">
                <div
                  style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}
                >
                  {formData.materials.map((material, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>{material}</span>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--red-50)',
                          borderColor: 'var(--red-200)',
                          color: 'var(--red-600)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    className="tms-input"
                    placeholder="Add training material (e.g., Handbook PDF, Video Tutorial)"
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addMaterial())
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addMaterial}
                    className="tms-btn tms-btn-primary"
                    disabled={
                      !newMaterial.trim() ||
                      formData.materials.includes(newMaterial.trim())
                    }
                  >
                    Add Material
                  </button>
                </div>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="tms-card" style={{ marginTop: '2rem' }}>
              <div className="tms-card-header">
                <h3 className="tms-card-title">
                  <span style={{ marginRight: '0.5rem' }}>📝</span>
                  Prerequisites
                </h3>
                <p className="tms-card-description">
                  Requirements participants must meet before attending
                </p>
              </div>
              <div className="tms-card-content">
                <div
                  style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}
                >
                  {formData.prerequisites.map((prerequisite, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>
                        {prerequisite}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--red-50)',
                          borderColor: 'var(--red-200)',
                          color: 'var(--red-600)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    className="tms-input"
                    placeholder="Add prerequisite (e.g., Basic management experience)"
                    onKeyPress={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addPrerequisite())
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addPrerequisite}
                    className="tms-btn tms-btn-primary"
                    disabled={
                      !newPrerequisite.trim() ||
                      formData.prerequisites.includes(newPrerequisite.trim())
                    }
                  >
                    Add Prerequisite
                  </button>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="tms-card" style={{ marginTop: '2rem' }}>
              <div className="tms-card-header">
                <h3 className="tms-card-title">
                  <span style={{ marginRight: '0.5rem' }}>🎯</span>
                  Learning Objectives
                </h3>
                <p className="tms-card-description">
                  What participants will achieve by the end of this session
                </p>
              </div>
              <div className="tms-card-content">
                <div
                  style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}
                >
                  {formData.objectives.map((objective, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>{objective}</span>
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="tms-btn tms-btn-secondary tms-btn-small"
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--red-50)',
                          borderColor: 'var(--red-200)',
                          color: 'var(--red-600)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    className="tms-input"
                    placeholder="Add learning objective (e.g., Develop strategic thinking skills)"
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addObjective())
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={addObjective}
                    className="tms-btn tms-btn-primary"
                    disabled={
                      !newObjective.trim() ||
                      formData.objectives.includes(newObjective.trim())
                    }
                  >
                    Add Objective
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '3rem',
              padding: '1.5rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)',
            }}
          >
            <Link href="/sessions" className="tms-btn tms-btn-secondary">
              <span style={{ marginRight: '0.5rem' }}>←</span>
              Back to Sessions
            </Link>
            <div
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                {hasChanges ? '● Unsaved changes' : '✓ All changes saved'}
              </span>
              <Link
                href={`/sessions/${sessionId}`}
                className="tms-btn tms-btn-secondary"
                onClick={(e) => {
                  if (
                    hasChanges &&
                    !confirm(
                      'You have unsaved changes. Are you sure you want to leave?'
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Preview Session
              </Link>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .tms-input.error,
        .tms-select.error,
        .tms-textarea.error {
          border-color: var(--red-500);
          box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
        }

        .tms-error-text {
          color: var(--red-600);
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
