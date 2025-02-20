import { ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from '@radix-ui/react-scroll-area';

type LeaderTableProps<T> = {
  title: string;
  data: T[];
  renderRow?: (item: { data: T; index: number }) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
};

const LeaderTable = <T,>({ title, data, renderRow, renderHeader }: LeaderTableProps<T>) => {
  return (
    <div className="flex flex-col gap-6 p-4 border border-[#86F49C] rounded-lg">
      {/* Header */}
      {renderHeader ? renderHeader() : null}

      {/* Table */}
      <ScrollArea className="border border-[#2E2E2E] rounded-lg h-[500px] overflow-hidden">
        <ScrollAreaViewport className="flex flex-col rounded-lg w-full h-full">
          <div className="flex flex-col">
            {data.map((row, index) => (renderRow ? renderRow({ data: row, index: index }) : null))}
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  );
};

export default LeaderTable;
