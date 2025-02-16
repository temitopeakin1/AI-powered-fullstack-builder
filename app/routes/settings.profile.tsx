import { useEffect, useState } from 'react';
import ProfileDataLeft from '~/backOffice/components/profile/ProfileDataLeft';
import ProfileDataRight from '~/backOffice/components/profile/ProfileDataRight';

export default function SettingsProfile() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    <div className="relative w-full min-h-screen text-biela-elements-textPrimary">
      {showModal && <div className="fixed inset-0 backdrop-blur-[10px] z-50" />}

      <div className="md:flex md:flex-row justify-between md:gap-[100px] xl:gap-[165px] items-start">
        <div className="w-full xl:w-[422px]">
          <ProfileDataLeft />
        </div>
        <div className="w-full  xl:w-[497px]">
          <ProfileDataRight onOpenModal={handleOpenModal} />
        </div>
      </div>
    </div>
  );
}
