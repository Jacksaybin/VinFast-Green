import React from 'react'
import { ChargingStationHero } from './ChargingStationHero'
import { EmptyWallet } from './EmptyWallet'
import { EmptyInvestments } from './EmptyInvestments'
import { SuccessInvestment } from './SuccessInvestment'
import { NoNotifications } from './NoNotifications'
import { SecurityShield } from './SecurityShield'
import { WelcomeOnboarding } from './WelcomeOnboarding'
import { EnergyDashboard } from './EnergyDashboard'
import { EVNetworkMap } from './EVNetworkMap'

export {
  ChargingStationHero,
  EmptyWallet,
  EmptyInvestments,
  SuccessInvestment,
  NoNotifications,
  SecurityShield,
  WelcomeOnboarding,
  EnergyDashboard,
  EVNetworkMap,
}

export type IllustrationName =
  | 'ChargingStationHero'
  | 'EmptyWallet'
  | 'EmptyInvestments'
  | 'SuccessInvestment'
  | 'NoNotifications'
  | 'SecurityShield'
  | 'WelcomeOnboarding'
  | 'EnergyDashboard'
  | 'EVNetworkMap'

interface IllustrationProps {
  name: IllustrationName
  className?: string
  size?: number
  showAnimations?: boolean
}

/**
 * Illustration wrapper - dùng theo tên
 *
 * @example
 * <Illustration name="EmptyWallet" className="w-48" />
 */
export const Illustration: React.FC<IllustrationProps> = ({ name, ...props }) => {
  const Cmp = illustrationMap[name]
  return <Cmp {...props} />
}

const illustrationMap: Record<IllustrationName, React.FC<any>> = {
  ChargingStationHero,
  EmptyWallet,
  EmptyInvestments,
  SuccessInvestment,
  NoNotifications,
  SecurityShield,
  WelcomeOnboarding,
  EnergyDashboard,
  EVNetworkMap,
}