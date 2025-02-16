import { useState } from "react";

export function DropdownInput() {
  const [selectedOption, setSelectedOption] = useState(""); // Stocăm opțiunea selectată
  const [isOpen, setIsOpen] = useState(false); // Controlăm afișarea dropdown-ului

  const options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]; // Lista de opțiuni

  return (
    <div className="relative w-64">
      {/* Input-ul dropdown */}
      <div
        className="w-full bg-black text-white border border-gray-600 p-3 rounded-md cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption || "Status"}
        <span className="ml-2">&#9662;</span> {/* Săgeată dropdown */}
      </div>

      {/* Lista de opțiuni */}
      {isOpen && (
        <div className="absolute w-full  bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-3 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                setSelectedOption(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
