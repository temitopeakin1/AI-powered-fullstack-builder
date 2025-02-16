import ProjectsList from './ProjectList';
import { ProjectsSectionProps } from '~/backOffice/types/project';

export default function ProjectsSection({ projects, sortBy, onSortChange, onLoadMore, hasMore }: ProjectsSectionProps) {
  return (
    <div className="w-full mt-80 md:mt-32 lg:mt-16">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-lg font-medium pb-1">Projects</span>
          <h3 className="text-xs text-[#777777]">Here are your projects</h3>
        </div>
        <button
          onClick={() => onSortChange(sortBy === 'Recently Created' ? 'Recently Updated' : 'Recently Created')}
          className="text-sm  px-4 font-inter font-normal relative flex items-center justify-between w-[244px] h-[41px] bg-[linear-gradient(180deg,_#010101_57.32%,_#161616_100%)] border border-[#2E2E2E] rounded-full"
        >
          <span className=" text-[#777777] text-sm">Sort By:</span>
          <span className="text-[#D5D5D5] ">{sortBy}</span>
          <img src="/down-arrow.svg" alt="icon" />
        </button>
      </div>

      <ProjectsList projects={projects} />
      {hasMore && (
        <div className="text-left -mt-2">
          <button
            onClick={onLoadMore}
            className="text-white bg-transparent underline underline-offset-2 text-sm font-light"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
