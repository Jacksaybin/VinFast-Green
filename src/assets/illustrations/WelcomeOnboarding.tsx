import React from 'react';
import realWelcomeVinfast from '../images/real-welcome-vinfast.jpg';

interface Props {
  className?: string;
}

const WelcomeOnboarding: React.FC<Props> = ({ className }) => (
  <img
    src={realWelcomeVinfast}
    alt="Chào mừng bạn đến với V-GREEN"
    className={`w-full h-auto rounded-3xl object-cover ${className || ''}`}
    loading="eager"
  />
);

export default WelcomeOnboarding;
export { WelcomeOnboarding };