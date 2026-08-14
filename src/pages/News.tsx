/**
 * News page component - Investment news and market updates
 */

import React, { useState } from 'react';
import { ArrowLeft, Clock, TrendingUp, Eye, Share2, BookOpen, ChevronRight, Star, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'market' | 'vgreen' | 'policy'>('all');

  const newsData = [
    {
      id: 1,
      category: 'vgreen',
      title: 'V-GREEN Fund đạt mốc 50.000 nhà đầu tư',
      summary: 'Quỹ đầu tư V-GREEN chính thức vượt mốc 50.000 nhà đầu tư sau 6 tháng hoạt động, khẳng định sức hút của mô hình đầu tư xanh.',
      content: 'Chỉ sau 6 tháng ra mắt, V-GREEN Fund đã thu hút được hơn 50.000 nhà đầu tư tham gia. Tổng vốn huy động đạt 2.5 tỷ USD, góp phần phát triển hệ thống trạm sạc VinFast toàn cầu.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/57da99af-a0b2-4ad5-ab56-770aa2686763.jpg',
      author: 'Nguyễn Minh Tâm',
      publishedAt: '2024-01-15T10:30:00Z',
      readTime: '3 phút',
      views: 12500,
      featured: true,
      tags: ['V-GREEN', 'Milestone', 'Đầu tư']
    },
    {
      id: 2,
      category: 'market',
      title: 'Thị trường xe điện Việt Nam tăng trưởng 250%',
      summary: 'Báo cáo mới nhất cho thấy thị trường xe điện Việt Nam tăng trưởng mạnh mẽ trong năm 2024, tạo cơ hội lớn cho các nhà đầu tư.',
      content: 'Theo báo cáo của Hiệp hội Ô tô Việt Nam, doanh số xe điện tăng 250% so với cùng kỳ năm trước. VinFast dẫn đầu với 45% thị phần, mở ra cơ hội đầu tư lớn.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/95f41457-1e95-47ef-970b-618b430edae5.jpg',
      author: 'Trần Thị Hoa',
      publishedAt: '2024-01-14T14:15:00Z',
      readTime: '4 phút',
      views: 8900,
      featured: true,
      tags: ['Xe điện', 'Thị trường', 'Tăng trưởng']
    },
    {
      id: 3,
      category: 'policy',
      title: 'Chính phủ ưu đãi thuế cho đầu tư xanh',
      summary: 'Nghị định mới về ưu đãi thuế dành cho các dự án đầu tư xanh, giảm 50% thuế thu nhập doanh nghiệp trong 10 năm đầu.',
      content: 'Chính phủ vừa ban hành nghị định mới khuyến khích đầu tư vào các dự án xanh. Các quỹ đầu tư như V-GREEN được hưởng ưu đãi thuế đặc biệt.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/a03cea05-b3f9-465a-81fd-b2c60f3836cf.jpg',
      author: 'Lê Văn Đức',
      publishedAt: '2024-01-13T09:45:00Z',
      readTime: '5 phút',
      views: 6700,
      featured: false,
      tags: ['Chính sách', 'Thuế', 'Đầu tư xanh']
    },
    {
      id: 4,
      category: 'vgreen',
      title: 'Mở rộng 500 trạm sạc mới trong Q1/2024',
      summary: 'V-GREEN Fund công bố kế hoạch mở rộng 500 trạm sạc VinFast mới trên toàn quốc trong quý 1/2024.',
      content: 'Với nguồn vốn từ các nhà đầu tư, V-GREEN Fund sẽ triển khai 500 trạm sạc mới, tập trung vào các tỉnh thành phía Nam và miền Trung.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/b6535b68-c4c3-4bbe-9f48-cf41e4cc37c7.jpg',
      author: 'Phạm Thị Lan',
      publishedAt: '2024-01-12T16:20:00Z',
      readTime: '3 phút',
      views: 9200,
      featured: false,
      tags: ['Mở rộng', 'Trạm sạc', 'Q1 2024']
    },
    {
      id: 5,
      category: 'market',
      title: 'Lãi suất đầu tư xanh cao nhất thị trường',
      summary: 'Các gói đầu tư xanh hiện đang mang lại lãi suất từ 0.2% đến 2.2% mỗi ngày, cao hơn gửi tiết kiệm truyền thống.',
      content: 'Phân tích từ các chuyên gia cho thấy đầu tư vào quỹ xanh mang lại lợi nhuận hấp dẫn với mức lãi suất hàng ngày từ 0.2% đến 2.2%.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/30b60eaf-2cd0-4610-82ee-48710165f9d5.jpg',
      author: 'Đỗ Minh Quang',
      publishedAt: '2024-01-11T11:30:00Z',
      readTime: '4 phút',
      views: 11300,
      featured: true,
      tags: ['Lãi suất', 'Đầu tư', 'Lợi nhuận']
    },
    {
      id: 6,
      category: 'vgreen',
      title: 'Hợp tác chiến lược với VinGroup',
      summary: 'V-GREEN Fund ký kết hợp tác chiến lược với VinGroup để phát triển hệ sinh thái giao thông xanh toàn diện.',
      content: 'Thỏa thuận hợp tác sẽ mang lại nhiều lợi ích cho các nhà đầu tư V-GREEN, bao gồm ưu đãi mua xe VinFast và sử dụng dịch vụ.',
      image: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/dba83438-f513-4fe0-9491-94bee5a42d6d.jpg',
      author: 'Vũ Thị Mai',
      publishedAt: '2024-01-10T08:15:00Z',
      readTime: '3 phút',
      views: 7800,
      featured: false,
      tags: ['Hợp tác', 'VinGroup', 'Chiến lược']
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', color: 'bg-gray-100 text-gray-600' },
    { id: 'vgreen', name: 'V-GREEN', color: 'bg-green-100 text-green-600' },
    { id: 'market', name: 'Thị trường', color: 'bg-blue-100 text-blue-600' },
    { id: 'policy', name: 'Chính sách', color: 'bg-purple-100 text-purple-600' }
  ];

  const filteredNews = newsData.filter(news => 
    selectedCategory === 'all' || news.category === selectedCategory
  );

  const featuredNews = newsData.filter(news => news.featured);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Format view count
   */
  const formatViews = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        
        <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">

          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">Tin Tức V-GREEN</h1>
            <p className="text-blue-100 text-sm">Cập nhật thông tin đầu tư mới nhất</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 -mt-6 relative z-10 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">50K+</div>
              <div className="text-xs text-gray-600">Nhà đầu tư</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">1000+</div>
              <div className="text-xs text-gray-600">Trạm sạc</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">2.5B</div>
              <div className="text-xs text-gray-600">USD vốn</div>
            </div>
          </div>
        </div>

        {/* Featured News */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Tin nổi bật
          </h2>
          <div className="space-y-4">
            {featuredNews.slice(0, 2).map(news => (
              <div key={news.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Nổi bật
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-xs text-gray-500">
                      {formatDate(news.publishedAt)}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{news.readTime}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {formatViews(news.views)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{news.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {news.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      Đọc thêm
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Danh mục tin tức</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : category.color + ' hover:opacity-80'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tin tức mới nhất ({filteredNews.length})
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          
          <div className="space-y-4">
            {filteredNews.map(news => (
              <div key={news.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex space-x-4">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        news.category === 'vgreen' ? 'bg-green-100 text-green-600' :
                        news.category === 'market' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {news.category === 'vgreen' ? 'V-GREEN' : 
                         news.category === 'market' ? 'Thị trường' : 'Chính sách'}
                      </span>
                      {news.featured && (
                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-medium">
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{news.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{news.summary}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span>{formatDate(news.publishedAt)}</span>
                        <span>•</span>
                        <span>{news.readTime}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatViews(news.views)}
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 flex items-center">
                        <Share2 className="w-3 h-3 mr-1" />
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Thông tin thị trường</h3>
              <p className="text-green-100 text-sm">Cập nhật theo thời gian thực</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">2.2%</div>
              <div className="text-green-100 text-sm">Lãi suất cao nhất</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-lg font-bold">250%</div>
              <div className="text-green-100 text-sm">Tăng trưởng thị trường</div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/investment')}
            className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Khám phá cơ hội đầu tư
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default News;