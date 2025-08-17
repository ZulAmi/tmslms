// API utility functions for TMS frontend

export interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  instructor: string;
  category: string;
  description?: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  status: 'registered' | 'confirmed' | 'attended' | 'no-show';
  registrationDate: string;
  lastActivity: string;
  completedSessions: number;
  address?: string;
  emergencyContact?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Sessions API
export class SessionsAPI {
  static async getAllSessions(params?: {
    limit?: number;
    status?: string;
    category?: string;
    instructor?: string;
  }): Promise<ApiResponse<{ sessions: Session[]; total: number }>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.instructor)
        searchParams.append('instructor', params.instructor);

      const response = await fetch(`/api/sessions?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch sessions',
        };
      }

      return {
        success: true,
        data: { sessions: data.sessions, total: data.total },
      };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async getSession(id: string): Promise<ApiResponse<Session>> {
    try {
      const response = await fetch(`/api/sessions/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch session',
        };
      }

      return { success: true, data: data.session };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async createSession(
    sessionData: Omit<Session, 'id' | 'participants' | 'status'>
  ): Promise<ApiResponse<Session>> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create session',
        };
      }

      return { success: true, data: data.session, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async updateSession(
    id: string,
    updateData: Partial<Session>
  ): Promise<ApiResponse<Session>> {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update session',
        };
      }

      return { success: true, data: data.session, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async deleteSession(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to delete session',
        };
      }

      return { success: true, data: null, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }
}

// Participants API
export class ParticipantsAPI {
  static async getAllParticipants(params?: {
    limit?: number;
    status?: string;
    department?: string;
  }): Promise<ApiResponse<{ participants: Participant[]; total: number }>> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.department)
        searchParams.append('department', params.department);

      const response = await fetch(`/api/participants?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch participants',
        };
      }

      return {
        success: true,
        data: { participants: data.participants, total: data.total },
      };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async getParticipant(id: string): Promise<ApiResponse<Participant>> {
    try {
      const response = await fetch(`/api/participants/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch participant',
        };
      }

      return { success: true, data: data.participant };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async createParticipant(
    participantData: Omit<
      Participant,
      'id' | 'registrationDate' | 'lastActivity' | 'completedSessions'
    >
  ): Promise<ApiResponse<Participant>> {
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participantData),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create participant',
        };
      }

      return { success: true, data: data.participant, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async updateParticipant(
    id: string,
    updateData: Partial<Participant>
  ): Promise<ApiResponse<Participant>> {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update participant',
        };
      }

      return { success: true, data: data.participant, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  static async deleteParticipant(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to delete participant',
        };
      }

      return { success: true, data: null, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }
}

// Settings API
export class SettingsAPI {
  static async getSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch settings',
        };
      }

      return { success: true, data: data.settings };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  static async updateSettings(settings: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to update settings',
        };
      }

      return { success: true, data: data.settings, message: data.message };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
}

// Reports API
export class ReportsAPI {
  static async generateReport(
    type: string,
    format: string = 'json'
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `/api/reports?type=${type}&format=${format}`
      );

      if (format === 'csv') {
        if (!response.ok) {
          return { success: false, error: 'Failed to generate CSV report' };
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'CSV report downloaded successfully' };
      } else {
        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || 'Failed to generate report',
          };
        }

        return { success: true, data: data.report };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
}

// Show notification function (enhanced)
export function showNotification(
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  duration: number = 3000
) {
  // Simple notification - in a real app you'd use a toast library
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(`${type.toUpperCase()}: ${message}`);
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
