'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../professional-tms.css';
import { SessionsAPI } from '../../../lib/api';

export default function CreateSessionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    maxParticipants: '',
    location: '',
    category: '',
    description: '',
    objectives: '',
    prerequisites: '',
    materials: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await SessionsAPI.createSession({
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
      });

      if (result.success) {
        router.push('/sessions?created=true');
      } else {
        alert('Failed to create session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <h1>Create New Session</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/sessions" className="tms-button">
            Back to Sessions
          </Link>
          <Link href="/" className="tms-button">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="tms-form-container">
        <h3>Session Details</h3>
        <form onSubmit={handleSubmit} className="tms-form">
          <div className="tms-form-group">
            <label>Session Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="tms-input"
              required
              placeholder="Enter session title"
            />
          </div>

          <div className="tms-form-group">
            <label>Instructor *</label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="tms-input"
              required
              placeholder="Enter instructor name"
            />
          </div>

          <div className="tms-form-group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="tms-input"
              required
            />
          </div>

          <div className="tms-form-group">
            <label>Time *</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="tms-input"
              required
            />
          </div>

          <div className="tms-form-group">
            <label>Duration *</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="tms-select"
              required
            >
              <option value="">Select duration</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="6 hours">6 hours</option>
              <option value="Full day">Full day</option>
              <option value="2 days">2 days</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>Max Participants *</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="tms-input"
              min="1"
              max="200"
              required
              placeholder="Maximum number of participants"
            />
          </div>

          <div className="tms-form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="tms-input"
              required
              placeholder="Enter location or 'Online'"
            />
          </div>

          <div className="tms-form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="tms-select"
              required
            >
              <option value="">Select category</option>
              <option value="Leadership">Leadership</option>
              <option value="Technology">Technology</option>
              <option value="Management">Management</option>
              <option value="Analytics">Analytics</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Security">Security</option>
              <option value="Compliance">Compliance</option>
              <option value="Sales">Sales</option>
              <option value="Customer Service">Customer Service</option>
            </select>
          </div>

          <div className="tms-form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="tms-textarea"
              rows={4}
              placeholder="Enter session description"
            />
          </div>

          <div className="tms-form-group">
            <label>Learning Objectives</label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              className="tms-textarea"
              rows={3}
              placeholder="Enter learning objectives (one per line)"
            />
          </div>

          <div className="tms-form-group">
            <label>Prerequisites</label>
            <textarea
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              className="tms-textarea"
              rows={2}
              placeholder="Enter any prerequisites or requirements"
            />
          </div>

          <div className="tms-form-group">
            <label>Materials Needed</label>
            <textarea
              name="materials"
              value={formData.materials}
              onChange={handleChange}
              className="tms-textarea"
              rows={2}
              placeholder="Enter required materials or equipment"
            />
          </div>

          <div className="tms-form-actions">
            <Link href="/sessions" className="tms-button secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="tms-button primary"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>

      <div className="tms-analytics-content">
        <h3>Session Preview</h3>
        <div
          className="tms-form-container"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          <h4>{formData.title || 'Session Title'}</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <strong>Instructor:</strong> {formData.instructor || 'TBD'}
            </div>
            <div>
              <strong>Category:</strong> {formData.category || 'TBD'}
            </div>
            <div>
              <strong>Date & Time:</strong> {formData.date || 'TBD'}{' '}
              {formData.time && `at ${formData.time}`}
            </div>
            <div>
              <strong>Duration:</strong> {formData.duration || 'TBD'}
            </div>
            <div>
              <strong>Location:</strong> {formData.location || 'TBD'}
            </div>
            <div>
              <strong>Max Participants:</strong>{' '}
              {formData.maxParticipants || 'TBD'}
            </div>
          </div>
          {formData.description && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <strong>Description:</strong>
              <p>{formData.description}</p>
            </div>
          )}
          {formData.objectives && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <strong>Learning Objectives:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {formData.objectives}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
