import { useState } from 'react';
import { BillingCardProps } from '~/backOffice/types/billings';

export function BillingCard({ title, description, children, editable }: BillingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(description);

  const toggleEdit = () => setIsEditing(!isEditing);

  return (
    <div
      className={`
        w-full h-[111px] bg-[linear-gradient(0deg,_rgba(0,_0,_0,_0.048)_0%,_rgba(31,_31,_31,_0.8)_100%)]
        border border-[#2E2E2E] border-image-slice-1 backdrop-[blur(50px)]
        rounded-[8px] text-white p-2 md:p-6 relative
      `}
    >
      {editable && (
        <button onClick={toggleEdit} className="absolute top-6 right-4 text-[#777777] bg-transparent" aria-label="Edit">
          <img src="/pencil.svg" alt="pencil" />
        </button>
      )}

      <div>
        <h3 className="text-[#777777] text-sm mb-2 md:mb-4">{title}</h3>
        {editable && isEditing ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-1 text-sm bg-[#2C2C2C] text-white rounded border border-[#777777] focus:outline-none"
          />
        ) : (
          <h3 className="text-white text-lg font-medium mb-2">{email}</h3>
        )}
      </div>
      {children}
    </div>
  );
}
