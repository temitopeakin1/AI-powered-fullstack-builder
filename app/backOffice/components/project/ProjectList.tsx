import ProjectItem from './ProjectItem';
import { ProjectsListProps } from '~/backOffice/types/project';

export default function ProjectsList({ projects }: ProjectsListProps) {
  return (
    <div className="mt-4 md:mt-8">
      {projects.map((project) => (
        <ProjectItem
          key={project.id}
          category={project.category}
          tools={project.tools}
          title={project.title}
          createdAt={project.createdAt}
        />
      ))}
    </div>
  );
}
