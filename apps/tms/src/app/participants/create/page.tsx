'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../professional-tms.css';

interface ParticipantForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employeeId: string;
  manager: string;
  location: string;
  startDate: string;
  skills: string[];
  learningGoals: string;
  notes: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function CreateParticipantPage() {
  const [formData, setFormData] = useState<ParticipantForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    manager: '',
    location: '',
    startDate: '',
    skills: [],
    learningGoals: '',
    notes: '',
  });

  const [availableSkills] = useState([
    'Leadership',
    'Project Management',
    'Communication',
    'Technical Skills',
    'Data Analysis',
    'Problem Solving',
    'Teamwork',
    'Customer Service',
    'Digital Literacy',
    'Presentation Skills',
    'Time Management',
    'Creativity',
  ]);

  const [departments] = useState<Department[]>([
    { id: '1', name: 'Information Technology', code: 'IT' },
    { id: '2', name: 'Human Resources', code: 'HR' },
    { id: '3', name: 'Finance & Accounting', code: 'FIN' },
    { id: '4', name: 'Marketing & Sales', code: 'MKT' },
    { id: '5', name: 'Operations', code: 'OPS' },
    { id: '6', name: 'Customer Service', code: 'CS' },
    { id: '7', name: 'Research & Development', code: 'RND' },
  ]);

  const [managers] = useState([
    'Sarah Chen - IT Director',
    'Michael Rodriguez - HR Manager',
    'Emily Watson - Finance Lead',
    'David Kim - Marketing Director',
    'Jennifer Liu - Operations Manager',
  ]);

  const [locations] = useState([
    'Singapore Office',
    'Kuala Lumpur Office',
    'Jakarta Office',
    'Bangkok Office',
    'Manila Office',
    'Remote',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.employeeId.trim())
      newErrors.employeeId = 'Employee ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Creating participant:', formData);

      setSubmitSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          employeeId: '',
          manager: '',
          location: '',
          startDate: '',
          skills: [],
          learningGoals: '',
          notes: '',
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      setErrors({ general: 'Failed to create participant. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateEmployeeId = () => {
    const dept = departments.find((d) => d.id === formData.department);
    const deptCode = dept ? dept.code : 'EMP';
    const randomNum = Math.floor(Math.random() * 9000) + 1000;

    setFormData((prev) => ({
      ...prev,
      employeeId: `${deptCode}${randomNum}`,
    }));
  };

  return (
    <div className="tms-container">
      <div className="tms-header">
        <div className="tms-breadcrumb">
          <Link href="/">Dashboard</Link>
          <span>/</span>
          <Link href="/participants">Participants</Link>
          <span>/</span>
          <span>Create New</span>
        </div>
        <h1>Create New Participant</h1>
        <p>Add a new participant to the training management system</p>
      </div>

      {submitSuccess && (
        <div className="tms-success-banner">
          <div className="tms-success-content">
            <div className="tms-success-icon">✅</div>
            <div>
              <h3>Participant Created Successfully!</h3>
              <p>
                {formData.firstName} {formData.lastName} has been added to the
                system.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="tms-form">
        {/* Personal Information */}
        <div className="tms-card">
          <h2>Personal Information</h2>
          <div className="tms-form-grid">
            <div className="tms-form-group">
              <label className="tms-label required">First Name</label>
              <input
                type="text"
                className={`tms-input ${errors.firstName ? 'error' : ''}`}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <span className="tms-error-text">{errors.firstName}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label required">Last Name</label>
              <input
                type="text"
                className={`tms-input ${errors.lastName ? 'error' : ''}`}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <span className="tms-error-text">{errors.lastName}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label required">Email Address</label>
              <input
                type="email"
                className={`tms-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Enter email address"
              />
              {errors.email && (
                <span className="tms-error-text">{errors.email}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Phone Number</label>
              <input
                type="tel"
                className="tms-input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="tms-card">
          <h2>Employment Details</h2>
          <div className="tms-form-grid">
            <div className="tms-form-group">
              <label className="tms-label required">Department</label>
              <select
                className={`tms-select ${errors.department ? 'error' : ''}`}
                value={formData.department}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className="tms-error-text">{errors.department}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label required">Position</label>
              <input
                type="text"
                className={`tms-input ${errors.position ? 'error' : ''}`}
                value={formData.position}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, position: e.target.value }))
                }
                placeholder="Enter job position"
              />
              {errors.position && (
                <span className="tms-error-text">{errors.position}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label required">Employee ID</label>
              <div className="tms-input-group">
                <input
                  type="text"
                  className={`tms-input ${errors.employeeId ? 'error' : ''}`}
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      employeeId: e.target.value,
                    }))
                  }
                  placeholder="Enter employee ID"
                />
                <button
                  type="button"
                  className="tms-button secondary small"
                  onClick={generateEmployeeId}
                >
                  Generate
                </button>
              </div>
              {errors.employeeId && (
                <span className="tms-error-text">{errors.employeeId}</span>
              )}
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Manager</label>
              <select
                className="tms-select"
                value={formData.manager}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, manager: e.target.value }))
                }
              >
                <option value="">Select Manager</option>
                {managers.map((manager, index) => (
                  <option key={index} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Location</label>
              <select
                className="tms-select"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              >
                <option value="">Select Location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="tms-form-group">
              <label className="tms-label">Start Date</label>
              <input
                type="date"
                className="tms-input"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Skills & Learning */}
        <div className="tms-card">
          <h2>Skills & Learning Preferences</h2>

          <div className="tms-form-group">
            <label className="tms-label">Current Skills</label>
            <div className="tms-skills-grid">
              {availableSkills.map((skill) => (
                <label key={skill} className="tms-skill-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span className="tms-skill-label">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="tms-form-group">
            <label className="tms-label">Learning Goals</label>
            <textarea
              className="tms-textarea"
              value={formData.learningGoals}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  learningGoals: e.target.value,
                }))
              }
              rows={4}
              placeholder="Describe learning objectives and career development goals"
            />
          </div>

          <div className="tms-form-group">
            <label className="tms-label">Additional Notes</label>
            <textarea
              className="tms-textarea"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              placeholder="Any additional notes or special requirements"
            />
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="tms-error-banner">
            <div className="tms-error-icon">❌</div>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="tms-form-actions">
          <button
            type="submit"
            className="tms-button primary large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Participant...' : 'Create Participant'}
          </button>

          <button
            type="button"
            className="tms-button secondary large"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to reset the form? All data will be lost.'
                )
              ) {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  department: '',
                  position: '',
                  employeeId: '',
                  manager: '',
                  location: '',
                  startDate: '',
                  skills: [],
                  learningGoals: '',
                  notes: '',
                });
                setErrors({});
              }
            }}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>
      </form>

      {/* Navigation */}
      <div className="tms-navigation-buttons">
        <Link href="/participants" className="tms-button secondary">
          Back to Participants
        </Link>
        <Link href="/" className="tms-button">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
