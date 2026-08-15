import React from 'react';
import realSuccessInvestment from '../images/real-success-investment.jpg';

interface Props {
  className?: string;
}

const SuccessInvestment: React.FC<Props> = ({ className }) => (
  <div className={`relative w-full ${className || ''}`}>
    <img
      src={realSuccessInvestment}
      alt="Đầu tư thành công"
      className="w-full h-auto rounded-2xl object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-16 h-16 rounded-full bg-brand-primary-500 shadow-lg flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-10 h-10 text-white"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
);

export default SuccessInvestment;
export { SuccessInvestment };