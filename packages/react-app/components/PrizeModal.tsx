import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFreeTrivia: () => void;
  onConfirm: (prizes: number[]) => void;
  status: string;
  closeModal: () => void;
}

const PrizeModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onFreeTrivia,
  status,
  closeModal,
}) => {
  const [step, setStep] = useState<number>(1);
  const [prizes, setPrizes] = useState<number[]>([0]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setStep(2);
  };

  const handleAddPrize = () => {
    setPrizes([...prizes, 0]);
  };

  const handlePrizeChange = (index: number, value: number) => {
    const newPrizes = [...prizes];
    newPrizes[index] = value;
    setPrizes(newPrizes);
  };

  const handleConfirm = () => {
    onConfirm(prizes);
    // onClose();
  };

  const handleClose = () => {
    setStep(1);
    setPrizes([0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg md:w-3/5 text-black">
        <div className="flex justify-end">
          <button
            className="text-white bg-red-500 rounded-lg text-4xl"
            onClick={() => closeModal()}
          >
            <IoIosClose />
          </button>
        </div>
        {step === 1 ? (
          <>
            <h2 className="text-xl mb-4">
              Do you want to add a Prize to the game?
            </h2>
            <div className="flex justify-center">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={onFreeTrivia}
              >
                Free Trivia
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleNextStep}
              >
                Yes, I want to add Prize
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl mb-4">Add Prizes</h2>
            {prizes.map((prize, index) => (
              <div key={index} className="mb-4 flex">
                <label className="block text-gray-700 mb-2 w-2/5 pt-2">
                  {index + 1}st Prize
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={prize}
                  onChange={(e) =>
                    handlePrizeChange(index, Number(e.target.value))
                  }
                />
              </div>
            ))}
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4"
              onClick={handleAddPrize}
            >
              Add Another Prize
            </button>
            <div className="flex justify-end">
              {status == "pending" ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Pending...
                </div>
              ) : (
                <div>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PrizeModal;
