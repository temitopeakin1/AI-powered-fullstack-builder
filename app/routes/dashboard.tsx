import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { useNavigate } from '@remix-run/react';
import { dummy } from '~/utils/dummy';
import { Header } from '~/components/common/Header/Header';
import ActionCard from '~/components/card/ActionCard';
import ProjectsSection from '~/backOffice/components/project/ProjectSection';
import CreateProject from '~/backOffice/components/project/CreateProjectModal';
import ProjectUpload from '~/backOffice/components/project/ProjectUploadModal';
import AddDatabase from '~/backOffice/components/project/AddDatabaseModal';
import { useUser } from '~/ai/lib/context/userContext';

type Project = {
  id: number;
  category: string;
  title: string;
  tools: string[];
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(dummy);
  const [visibleProjectsCount, setVisibleProjectsCount] = useState(4);
  const [sortBy, setSortBy] = useState('Recently Created');
  const [modalType, setModalType] = useState<'create' | 'upload' | 'addDatabase' | null>(null);
  const { isLoggedIn } = useUser();

  const sortProjects = (condition: string) => {
    let sortedProjects: Project[] = [];

    if (condition === 'Recently Created') {
      sortedProjects = [...filteredProjects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (condition === 'Recently Updated') {
      sortedProjects = [...filteredProjects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    setFilteredProjects(sortedProjects);
    setSortBy(condition);
  };

  const loadMoreProjects = () => {
    setVisibleProjectsCount((prevCount) => Math.min(filteredProjects.length, prevCount + 4));
  };

  const openCreateProjectModal = () => {
    setModalType('create');
  };

  const openProjectUploadModal = () => {
    setModalType('upload');
  };

  const closeModal = () => {
    setModalType(null);
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      return;
    }

    navigate('/Access-Deined-Page');
  }, [navigate, isLoggedIn]);

  return (
    <div className="w-full min-h-screen bg-black text-biela-elements-textPrimary">
      <ClientOnly>
        {() => (
          <Header
            handleSendMessage={(e, messageInput) => console.log('Message sent:', messageInput)}
            isStreaming={false}
            handleStop={() => console.log('Stream stopped')}
            isDashboardPage={true}
          />
        )}
      </ClientOnly>
      <div className="xl:flex items-center justify-center">
        <div className={`p-5 md:p-10  xl:w-[1169px] 2xl:w-[1489px] ${modalType ? 'blur-[50px]' : ''}`}>
          <div className="custom text-3xl font-medium text-white uppercase mb-4 md:mb-12  gap-[24px]">
            <p>dashboard</p>
          </div>
          <ActionCard
            projectsCount={filteredProjects.length}
            onCreateProjectClick={openCreateProjectModal}
            onProjectUpload={openProjectUploadModal}
          />
          <ProjectsSection
            projects={filteredProjects.slice(0, visibleProjectsCount)}
            sortBy={sortBy}
            onSortChange={sortProjects}
            onLoadMore={loadMoreProjects}
            hasMore={filteredProjects.length > visibleProjectsCount}
          />
        </div>
      </div>

      {/* Modal */}
      {modalType === 'create' && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0" onClick={closeModal} />
          <CreateProject
            closeModal={closeModal}
            handleCreateProjectClick={() => console.log('Create Project Clicked')}
          />
        </div>
      )}

      {modalType === 'upload' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0" onClick={closeModal} />
          <ProjectUpload closeModal={closeModal} />
        </div>
      )}
      {modalType === 'addDatabase' && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0" onClick={closeModal} />
          <AddDatabase closeModal={closeModal} handleAddDatabaseClick={() => console.log('Upload Project Clicked')} />
        </div>
      )}
    </div>
  );
}
