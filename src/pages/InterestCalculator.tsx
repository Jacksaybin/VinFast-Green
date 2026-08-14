/**
 * Interest Calculator page component - Interest rate calculation and comparison
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Clock, Star, Calculator, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LiveChat from '../components/LiveChat';
import { usePackageStore } from '../stores/packageStore';

const InterestCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000000);

  const packages = usePackageStore((s) => s.packages);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Interest rate calculation helper
  const calculateInterestRates = (dailyRate: number, period: number) => {
    const monthlyRate = dailyRate * 30;
    const yearlyRate = dailyRate * 365;
    const totalReturn = dailyRate * period;
    
    return {
      monthly: monthlyRate,
      yearly: yearlyRate,
      totalReturn: totalReturn
    };
  };

  /**
   * Calculate profit based on selected package and amount
   */
  const calculateProfit = (packageId: string, amount: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return null;
    
    const dailyProfit = (amount * pkg.dailyProfit) / 100;
    const totalProfit = dailyProfit * pkg.investmentPeriod;
    
    return {
      dailyProfit,
      totalProfit,
      totalReturn: amount + totalProfit,
      percentage: (totalProfit / amount) * 100
    };
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);
  const profitCalculation = selectedPackage ? calculateProfit(selectedPackage, investmentAmount) : null;

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
        
        <div className="relative h-40 bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
          <img 
            src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/104cd46e-7cfd-4108-8f96-016f879f4f1c.jpg"
            alt="Calculator"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">Bảng Tính Lãi Xuất</h1>
            <p className="text-purple-100 text-sm">Tính toán lợi nhuận đầu tư V-GREEN</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Interactive Calculator */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Máy Tính Lợi Nhuận</h2>
              <p className="text-sm text-muted-foreground">Tính toán lợi nhuận theo gói đầu tư</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chọn gói đầu tư
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Chọn gói đầu tư --</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.dailyProfit}%/ngày - {pkg.investmentPeriod} ngày
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số tiền đầu tư (VND)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nhập số tiền đầu tư"
                min={selectedPkg?.investmentAmount || 50000000}
              />
              {selectedPkg && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tối thiểu: {selectedPkg.investmentAmount.toLocaleString()} VND
                </p>
              )}
            </div>

            {profitCalculation && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-success/20">
                <h3 className="font-semibold text-success-strong mb-3">Kết quả tính toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Lợi nhuận hàng ngày</div>
                    <div className="text-lg font-bold text-primary">
                      {profitCalculation.dailyProfit.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tổng lợi nhuận</div>
                    <div className="text-lg font-bold text-info">
                      {profitCalculation.totalProfit.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tổng tiền nhận</div>
                    <div className="text-lg font-bold text-purple-600">
                      {profitCalculation.totalReturn.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Tỷ lệ lợi nhuận</div>
                    <div className="text-lg font-bold text-danger">
                      {profitCalculation.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interest Rate Table */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Bảng Lãi Xuất Chi Tiết</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs text-muted-foreground">Live rates</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Bảng tính lãi suất chi tiết cho các gói đầu tư V-GREEN Fund
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">Gói đầu tư</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">Ngày</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">Tháng</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">Năm</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">Tổng lãi</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, index) => {
                  const rates = calculateInterestRates(pkg.dailyProfit, pkg.investmentPeriod);
                  return (
                    <tr key={index} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-2">
                        <div className="font-medium text-foreground text-xs">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pkg.investmentAmount >= 1000000000 
                            ? `${(pkg.investmentAmount / 1000000000).toFixed(0)}B` 
                            : `${(pkg.investmentAmount / 1000000).toFixed(0)}M`
                          }
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-primary">{pkg.dailyProfit}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-info">{rates.monthly.toFixed(1)}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-purple-600">{rates.yearly.toFixed(0)}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-bold text-danger">{rates.totalReturn.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{pkg.investmentPeriod}d</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-success-subtle p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-primary">0.2% - 2.2%</div>
              <div className="text-xs text-primary">Lãi suất hàng ngày</div>
            </div>
            <div className="bg-info-subtle p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-info">6% - 66%</div>
              <div className="text-xs text-info-strong">Lãi suất hàng tháng</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600">73% - 803%</div>
              <div className="text-xs text-purple-700">Lãi suất hàng năm</div>
            </div>
          </div>
        </div>

        {/* Investment Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-success/20 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-success-strong text-sm mb-2">Quyền lợi đầu tư V-GREEN</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-primary"><strong>Lãi suất hàng ngày:</strong> 0.2% - 2.2%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-info-subtle0 rounded-full"></div>
                    <span className="text-info-strong"><strong>Lãi suất hàng tháng:</strong> 6% - 66%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-700"><strong>Lãi suất hàng năm:</strong> 73% - 803%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-primary"><strong>Bảo đảm:</strong> 100% an toàn</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-info" />
                    <span className="text-info-strong"><strong>Linh hoạt:</strong> 30-365 ngày</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-700"><strong>Uy tín:</strong> VinGroup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Method */}
        <div className="bg-warning-subtle p-4 rounded-lg border border-yellow-200 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-warning-strong" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 text-sm mb-2">Cách tính lãi suất</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• <strong>Lãi hàng ngày:</strong> Theo tỷ lệ % cố định</li>
                <li>• <strong>Lãi hàng tháng:</strong> Lãi ngày × 30</li>
                <li>• <strong>Lãi hàng năm:</strong> Lãi ngày × 365</li>
                <li>• <strong>Tổng lãi:</strong> Lãi ngày × Số ngày đầu tư</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-elevated p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-2">Sẵn sàng đầu tư?</h2>
          <p className="text-purple-100 text-sm mb-4">
            Chọn gói đầu tư phù hợp và bắt đầu kiếm lợi nhuận
          </p>
          <button 
            onClick={() => navigate('/investment')}
            className="bg-card text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Xem gói đầu tư
          </button>
        </div>
      </div>
      
      <BottomNavigation />
      <LiveChat />
    </div>
  );
};

export default InterestCalculator;