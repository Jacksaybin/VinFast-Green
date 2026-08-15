import React from 'react';
import realNoNotifications from '../images/real-no-notifications.jpg';

interface Props {
  className?: string;
}

const NoNotifications: React.FC<Props> = ({ className }) => (
  <img
    src={realNoNotifications}
    alt="Chưa có thông báo"
    className={`w-full h-auto rounded-2xl object-cover ${className || ''}`}
    loading="lazy"
  />
);

export default NoNotifications;
export { NoNotifications };
