import React, { useState } from 'react';
import '../styles/learnsignpage.css';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const SignLanguageGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'letters' | 'numbers'>('letters');
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const items = activeTab === 'letters' ? letters : numbers;

  const handleItemClick = (sign: string) => {
    setPopupImage(`/assets/${sign.toLowerCase()}.jpg`);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  return (
    <div className="min-h-screen text-white font-sans" style={{ background: 'linear-gradient(to right, #08BCD0, #B0DCC6)' }}>
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-4xl font-bold mb-6">Learn Indian Sign Language</h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`tab px-6 py-2 rounded-md text-white transition ${activeTab === 'letters' ? 'bg-red-500' : 'bg-gray-800'}`}
            onClick={() => setActiveTab('letters')}
          >
            Letters
          </button>
          <button
            className={`tab px-6 py-2 rounded-md text-white transition ${activeTab === 'numbers' ? 'bg-red-500' : 'bg-gray-800'}`}
            onClick={() => setActiveTab('numbers')}
          >
            Numbers
          </button>
        </div>

        <div
          className={`grid justify-center gap-3 ${activeTab === 'letters' ? 'grid-cols-6' : 'grid-cols-5'} max-w-2xl mx-auto`}
        >
          {items.map((sign) => (
            <div
              key={sign}
              className="sign-item bg-white text-black rounded-xl h-[60px] w-[60px] flex items-center justify-center text-xl font-bold cursor-pointer hover:scale-110 transition-transform"
              onClick={() => handleItemClick(sign)}
            >
              {sign}
            </div>
          ))}
        </div>
      </div>

      {popupImage && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 z-50"
          onClick={closePopup}
        >
          <div className="bg-[#1e1e2f] p-6 rounded-xl relative max-w-[90%] w-[400px]">
            <span
              className="absolute left-5 top-3 text-white text-3xl cursor-pointer"
              onClick={closePopup}
            >
              &times;
            </span>
            <img
              src={popupImage}
              alt="Sign"
              className="w-full max-h-[400px] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignLanguageGrid; 