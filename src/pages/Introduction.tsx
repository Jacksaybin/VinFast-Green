/**
 * Introduction page component - Detailed information about V-GREEN and VinFast
 */

import React from 'react';
import { ArrowLeft, Globe, Factory, Zap, Users, TrendingUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LiveChat from '../components/LiveChat';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  const globalMarkets = [
    { region: 'Châu Á', countries: ['Ấn Độ', 'Indonesia', 'Thái Lan', 'Philippines'] },
    { region: 'Châu Âu', countries: ['Đức', 'Pháp', 'Hà Lan', 'Na Uy'] },
    { region: 'Bắc Mỹ', countries: ['Mỹ', 'Canada'] },
    { region: 'Trung Đông', countries: ['UAE', 'Qatar', 'Saudi Arabia'] },
    { region: 'Châu Phi', countries: ['Nigeria', 'Ghana', 'Nam Phi'] }
  ];

  const achievements = [
    { icon: <Globe className="w-6 h-6" />, title: '50+ Quốc gia', desc: 'Mở rộng hoạt động' },
    { icon: <Factory className="w-6 h-6" />, title: '4 Nhà máy', desc: 'Việt Nam, Mỹ, Ấn Độ, Indonesia' },
    { icon: <Zap className="w-6 h-6" />, title: '1000+ Trạm sạc', desc: 'Hệ thống trạm sạc toàn cầu' },
    { icon: <Users className="w-6 h-6" />, title: '10M+ Khách hàng', desc: 'Tin tướng và sử dụng' }
  ];

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
        
        <div className="relative h-48 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 flex items-center justify-center">
          <img 
            src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/71892c63-ed97-452d-a8c5-bbdb8572827f.jpg"
            alt="VinFast Global Factory"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">Về V-GREEN</h1>
            <p className="text-primary-foreground text-sm">Thúc đẩy giao thông xanh toàn cầu</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* CEO Quote Section */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <img 
                src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/69aeb199-0ff9-42b8-83d0-da6476f0ef31.jpg"
                alt="CEO"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Ông Nguyễn Đức Thanh</h3>
              <p className="text-sm text-primary mb-3">Tổng giám đốc V-GREEN</p>
              <div className="bg-success-subtle p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "Quyết định thành lập V-GREEN là bước đi mang tính chiến lược của nhà sáng lập VinFast trong việc hỗ trợ, thúc đẩy mạnh mẽ cho VinFast phát triển bền vững, ổn định trên quy mô toàn cầu."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Sứ mệnh V-GREEN</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Việc Chủ tịch Phạm Nhật Vượng sẵn sàng dùng tài sản cá nhân thành lập V-GREEN để giảm tải áp lực đầu tư hạ tầng cho VinFast, hỗ trợ tối đa cho hãng xe phát triển đã khẳng định quyết tâm mãnh liệt trong việc thúc đẩy giao thông xanh tại Việt Nam và thế giới.
          </p>
          <div className="bg-gradient-to-r from-brand-primary-500 to-green-600 p-4 rounded-lg">
            <p className="text-white text-sm font-medium text-center">
              Hỗ trợ VinFast phát triển bền vững trên quy mô toàn cầu
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Thành tựu nổi bật</h2>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-background rounded-lg">
                <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="text-primary">
                    {achievement.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Expansion */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-info" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Mở rộng toàn cầu 2024</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Theo kế hoạch, trong năm 2024, VinFast sẽ mở rộng hoạt động sản xuất, kinh doanh ra tối thiểu 50 quốc gia trên thế giới.
          </p>
          
          <div className="space-y-4">
            {globalMarkets.map((market, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 bg-success-subtle p-3 rounded-r-lg">
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {market.region}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {market.countries.map((country, countryIndex) => (
                    <span 
                      key={countryIndex}
                      className="px-2 py-1 bg-success-subtle text-primary text-xs rounded-full"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing Plants */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
              <Factory className="w-5 h-5 text-warning-strong" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Nhà máy sản xuất</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Ngoài Việt Nam, hiện VinFast cũng đang xúc tiến xây dựng nhà máy sản xuất xe điện tại các quốc gia chiến lược.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-info-subtle rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 text-sm mb-1">Việt Nam</h4>
              <p className="text-info-strong text-xs">Nhà máy chính - Hoạt động</p>
            </div>
            <div className="p-3 bg-success-subtle rounded-lg border border-success/20">
              <h4 className="font-medium text-success-strong text-sm mb-1">Mỹ</h4>
              <p className="text-primary text-xs">Đang xây dựng</p>
            </div>
            <div className="p-3 bg-warning-subtle rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 text-sm mb-1">Ấn Độ</h4>
              <p className="text-orange-700 text-xs">Đang xúc tiến</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1">Indonesia</h4>
              <p className="text-purple-700 text-xs">Đang xúc tiến</p>
            </div>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl shadow-elevated p-6 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-card/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3">Tầm nhìn 2030</h2>
            <p className="text-primary-foreground text-sm leading-relaxed">
              Trở thành nhà cung cấp hạ tầng sạc xe điện hàng đầu thế giới, góp phần xây dựng một tương lai giao thông xanh và bền vững cho nhân loại.
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <LiveChat />
    </div>
  );
};

export default Introduction;