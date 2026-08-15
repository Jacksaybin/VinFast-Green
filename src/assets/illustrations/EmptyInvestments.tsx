import React from 'react';
import realEmptyWallet from '../images/real-empty-wallet.jpg';

interface Props {
  className?: string;
}

const EmptyInvestments: React.FC<Props> = ({ className }) => (
  <img
    src={realEmptyWallet}
    alt="Chưa có gói đầu tư"
    className={`w-full h-auto rounded-2xl object-cover ${className || ''}`}
    loading="lazy"
  />
);

export default EmptyInvestments;
export { EmptyInvestments };
