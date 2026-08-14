/**
 * Investment page component - Investment packages and investment management
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Filter, Search, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import InvestmentCard from '../components/InvestmentCard';
import InvestmentForm from '../components/InvestmentForm';
import LiveChat from '../components/LiveChat';
import { InvestmentPackage as PkgType } from '../types';
import { usePackageStore } from '../stores/packageStore';

/**
 * Investment - allows users to browse and filter investment packages
 */
const Investment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'premium' | 'standard' | 'basic'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<PkgType | null>(null);

  const packages = usePackageStore((s) => s.packages);
  const getCategoryStats = usePackageStore((s) => s.getCategoryStats);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Category stats for overview cards
  const categoryStats = getCategoryStats();

  // Category definition for quick filter cards
  // Removed "premium" category card as requested.
  const categories = [
    {
      id: 'standard',
      name: 'Gói Standard',
      icon: <Award className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-info-subtle',
      textColor: 'text-info',
      description: 'Phù hợp đa số nhà đầu tư',
      count: categoryStats.standard.count,
      minProfit: '0.2%',
    },
    {
      id: 'basic',
      name: 'Gói Basic',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-brand-primary-500 to-green-600',
      bgColor: 'bg-success-subtle',
      textColor: 'text-primary',
      description: 'Khởi đầu với mức đầu tư thấp',
      count: categoryStats.basic.count,
      minProfit: '0.25%',
    },
  ];

  /**
   * Filter packages by search text and selected category
   */
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && pkg.category === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="bg-card/90 backdrop-blur-sm p-2 rounded-full shadow-elevated"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="relative h-40 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 flex items-center justify-center">
          <img
            src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/2f24026c-2395-44fe-b3d5-baa07dfade0b.jpg"
            alt="Investment"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">Đầu tư V-GREEN</h1>
            <p className="text-primary-foreground text-sm">Cùng phát triển giao thông xanh</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Category Overview */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Phân loại gói đầu tư</h2>
          <div className="grid grid-cols-1 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${category.bgColor} rounded-full flex items-center justify-center`}>
                    <div className={category.textColor}>{category.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{category.count} gói</div>
                    <div className="text-xs text-muted-foreground">Từ {category.minProfit}/ngày</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFilter(category.id as any)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedFilter === category.id
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'bg-muted text-foreground hover:bg-gray-200'
                  }`}
                >
                  Xem {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-xl shadow-card p-4 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm gói đầu tư..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedFilter('premium')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === 'premium'
                      ? 'bg-brand-accent-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-gray-200'
                  }`}
                >
                  Premium
                </button>
                <button
                  onClick={() => setSelectedFilter('standard')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === 'standard'
                      ? 'bg-info text-white'
                      : 'bg-muted text-muted-foreground hover:bg-gray-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setSelectedFilter('basic')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedFilter === 'basic'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-gray-200'
                  }`}
                >
                  Basic
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Packages */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Gói đầu tư ({filteredPackages.length})</h2>
              <p className="text-sm text-muted-foreground">
                {selectedFilter === 'all'
                  ? 'Tất cả gói đầu tư có sẵn'
                  : `Gói ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className="cursor-pointer"
              >
                <InvestmentCard pkg={pkg} />
              </div>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Không tìm thấy gói đầu tư phù hợp</p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl shadow-elevated p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-2">Bắt đầu đầu tư ngay!</h2>
          <p className="text-primary-foreground text-sm mb-4">Tham gia cùng hàng nghìn nhà đầu tư thông minh</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-card text-primary px-6 py-3 rounded-lg font-semibold hover:bg-success-subtle transition-colors"
          >
            Đăng ký đầu tư
          </button>
        </div>
      </div>

      <BottomNavigation />
      <LiveChat />

      {selectedPkg && (
        <InvestmentForm
          pkg={selectedPkg}
          isOpen={!!selectedPkg}
          onClose={() => setSelectedPkg(null)}
          onSuccess={() => setSelectedPkg(null)}
        />
      )}
    </div>
  );
};

export default Investment;
