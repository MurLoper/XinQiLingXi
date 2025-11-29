
import { MOCK_PROJECTS } from '../config/constants';
import { Project, ApiResponse } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    await delay(800); 
    return {
      success: true,
      data: MOCK_PROJECTS,
      message: 'Projects fetched successfully'
    };
  },

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
