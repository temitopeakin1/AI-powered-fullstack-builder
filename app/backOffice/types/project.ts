import type { Template } from '~/types/template';
import type { Message } from 'ai';

export interface AddDatabaseButtonProps {
  openModal: () => void;
}

export interface AddDatabaseProps {
  closeModal: () => void;
  handleAddDatabaseClick: () => void;
}

export interface AddFilesButtonProps {
  onFileSelect: (files: FileList | null) => void;
}

export interface CreateProjectButtonProps {
  onClick?: () => void;
}

export interface CreateProjectProps {
  closeModal: () => void;
  handleCreateProjectClick: () => void;
}

export interface ProjectItemProps {
  category: string;
  title: string;
  createdAt: string;
  tools: string[];
}

export interface Project {
  id: number;
  category: string;
  tools: string[];
  title: string;
  createdAt: string;
}

export interface ProjectsListProps {
  projects: Project[];
}

export interface ProjectsSectionProps {
  projects: Array<{ id: number; category: string; tools: string[]; title: string; createdAt: string }>;
  sortBy: string;
  onSortChange: (criteria: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export interface ProjectImportProps {
  closeModal: () => void;
}

export interface FrameworkLinkProps {
  template: Template;
}

export interface TechIconProps {
  name: string;
  icon: string;
  repository: string;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export interface UploadProjectButtonProps {
  handleUploadProjectClick: (messages: Message[]) => void;
}
