/**
 * Illustration - Wrapper component cho phép chọn illustration theo tên
 * Dùng: <Illustration name="EmptyWallet" className="..." />
 */

import React from 'react';
import { EmptyWallet } from './EmptyWallet';
import { EmptyInvestments } from './EmptyInvestments';
import { NoNotifications } from './NoNotifications';
import { SuccessInvestment } from './SuccessInvestment';
import { SecurityShield } from './SecurityShield';
import { WelcomeOnboarding } from './WelcomeOnboarding';
import { EnergyDashboard } from './EnergyDashboard';
import { EVNetworkMap } from './EVNetworkMap';

export type IllustrationName =
  | 'EmptyWallet'
  | 'EmptyInvestments'
  | 'NoNotifications'
  | 'SuccessInvestment'
  | 'SecurityShield'
  | 'WelcomeOnboarding'
  | 'EnergyDashboard'
  | 'EVNetworkMap';

const REGISTRY: Record<IllustrationName, React.FC<{ className?: string; size?: number }>> = {
  EmptyWallet,
  EmptyInvestments,
  NoNotifications,
  SuccessInvestment,
  SecurityShield,
  WelcomeOnboarding,
  EnergyDashboard,
  EVNetworkMap,
};

export interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  size?: number;
}

const Illustration: React.FC<IllustrationProps> = ({ name, className, size }) => {
  const Comp = REGISTRY[name];
  if (!Comp) return null;
  return <Comp className={className} size={size} />;
};

export default Illustration;