/**
 * EmptyWallet - Ví trống dùng ảnh thực tế
 */

import React from 'react'
import realEmptyWallet from '../images/real-empty-wallet.jpg'

interface Props { className?: string }

export const EmptyWallet: React.FC<Props> = ({ className }) => (
  <img
    src={realEmptyWallet}
    alt="Chưa có giao dịch"
    className={`w-full h-auto rounded-2xl object-cover ${className || ''}`}
    loading="lazy"
  />
)

export default EmptyWallet
