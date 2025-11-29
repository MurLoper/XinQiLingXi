import { MOCK_PROJECTS } from '../constants';
import { Project, ApiResponse } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  /**
   * Fetch all projects
   */
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    await delay(800); // Simulate 800ms loading time
    return {
      success: true,
      data: MOCK_PROJECTS,
      message: 'Projects fetched successfully'
    };
  },

  /**
   * Fetch a single project by ID
   */
  getProjectById: async (id: string): Promise<ApiResponse<Project | null>> => {
    await delay(500);
    const project = MOCK_PROJECTS.find(p => p.id === id) || null;
    return {
      success: true,
      data: project,
      message: project ? 'Project found' : 'Project not found'
    };
  }
};