import { useState } from 'react';
import { Form } from '@remix-run/react';
import StackSelector from '~/backOffice/components/project/stackSelector';
import AddDatabaseButton from '~/backOffice/components/project/AddDatabaseButton';
import AddDatabase from './AddDatabaseModal';

export default function FormProject() {
  const [isAddDatabaseOpen, setIsAddDatabaseOpen] = useState(false);

  const openAddDatabaseModal = () => {
    setIsAddDatabaseOpen(true);
  };

  const closeAddDatabaseModal = () => {
    setIsAddDatabaseOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Form method="post" action="/git" className="flex flex-col gap-3 items-center rounded-[8px] p-3">
        <input
          type="text"
          name="title"
          placeholder="Give a title"
          className="w-[456px] h-[70px] bg-transparent text-white placeholder-[#777777] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)] border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)] rounded-md focus:outline-none px-4 text-base mb-4"
        />
        <StackSelector />
        <AddDatabaseButton openModal={openAddDatabaseModal} />
        {isAddDatabaseOpen && <AddDatabase closeModal={closeAddDatabaseModal} handleAddDatabaseClick={() => {}} />}
        <button
          type="submit"
          className="w-[456px] h-[41px] rounded-[500px] border border-[#2E2E2E] px-6 py-2 bg-[#86F49C] text-[#010101] text-sm flex items-center justify-center mb-2"
        >
          Create a New Project
        </button>
      </Form>
    </div>
  );
}
