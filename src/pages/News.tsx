/**
 * News page component - Investment news and market updates
 * Nguồn dữ liệu: backend API (newsApi), fallback tĩnh khi offline
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, TrendingUp, Eye, Share2, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { newsApi } from '../lib/api';
import { Illustration } from '../assets/illustrations';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  views: number;
  readTime: number;
  publishedAt: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'V-GREEN Fund đạt mốc 50.000 nhà đầu tư',
    slug: 'v-green-dat-moc-50000-nha-dau-tu',
    summary: 'Quỹ đầu tư V-GREEN chính thức vượt mốc 50.000 nhà đầu tư sau 6 tháng hoạt động.',
    category: 'vgreen',
    imageUrl: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/57da99af-a0b2-4ad5-ab56-770aa2686763.jpg',
    tags: ['V-GREEN', 'Đầu tư'],
    isFeatured: true,
    views: 12500,
    readTime: 3,
    publishedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Thị trường xe điện Việt Nam tăng trưởng 250%',
    slug: 'thi-truong-xe-dien-viet-nam-tang-truong-250',
    summary: 'Báo cáo mới nhất cho thấy thị trường xe điện Việt Nam tăng trưởng mạnh mẽ trong năm 2024.',
    category: 'market',
    imageUrl: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/95f41457-1e95-47ef-970b-618b430edae5.jpg',
    tags: ['Xe điện', 'Thị trường'],
    isFeatured: true,
    views: 8900,
    readTime: 4,
    publishedAt: '2024-01-14T14:15:00Z',
  },
  {
    id: '3',
    title: 'Chính phủ ưu đãi thuế cho đầu tư xanh',
    slug: 'chinh-phu-uu-dai-thue-cho-dau-tu-xanh',
    summary: 'Nghị định mới về ưu đãi thuế dành cho các dự án đầu tư xanh.',
    category: 'policy',
    imageUrl: 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/a03cea05-b3f9-465a-81fd-b2c60f3836cf.jpg',
    tags: ['Chính sách', 'Thuế'],
    isFeatured: false,
    views: 6700,
    readTime: 5,
    publishedAt: '2024-01-13T09:45:00Z',
  },
];

const News: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'market' | 'vgreen' | 'policy'>('all');
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    newsApi
      .getNews(selectedCategory === 'all' ? undefined : selectedCategory, 1, 50)
      .then((result) => {
        if (cancelled) return;
        if (result.news && result.news.length > 0) {
          setNews(result.news);
        }
      })
      .catch(() => {
        // Backend offline - keep fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const categories = [
    { id: 'all', name: 'Tất cả', color: 'bg-muted text-muted-foreground' },
    { id: 'vgreen', name: 'V-GREEN', color: 'bg-success-subtle text-primary' },
    { id: 'market', name: 'Thị trường', color: 'bg-info-subtle text-info' },
    { id: 'policy', name: 'Chính sách', color: 'bg-purple-100 text-purple-600' }
  ];

  const filteredNews = news.filter(
    (n) => selectedCategory === 'all' || n.category === selectedCategory
  );
  const featuredNews = news.filter((n) => n.isFeatured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const imageOf = (n: NewsItem) =>
    n.imageUrl || 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/30b60eaf-2cd0-4610-82ee-48710165f9d5.jpg';

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

        <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">Tin Tức V-GREEN</h1>
            <p className="text-blue-100 text-sm">Cập nhật thông tin đầu tư mới nhất</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Quick Stats */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Nhà đầu tư</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-info">1000+</div>
              <div className="text-xs text-muted-foreground">Trạm sạc</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">2.5B</div>
              <div className="text-xs text-muted-foreground">USD vốn</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Đang tải tin tức...</div>
        ) : (
          <>
            {/* Featured News */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Tin nổi bật
              </h2>
              <div className="space-y-4">
                {featuredNews.slice(0, 2).map((newsItem) => (
                  <button
                    key={newsItem.id}
                    onClick={() => navigate(`/news/${newsItem.slug}`)}
                    className="w-full text-left bg-card rounded-xl shadow-card overflow-hidden hover:shadow transition-shadow"
                  >
                    <div className="relative h-48">
                      <img src={imageOf(newsItem)} alt={newsItem.title} className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-danger-subtle0 text-white px-2 py-1 rounded-full text-xs font-medium">Nổi bật</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3 text-xs text-muted-foreground">
                        <span>{formatDate(newsItem.publishedAt)}</span>
                        <span>•</span>
                        <span>{newsItem.readTime} phút</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatViews(newsItem.views)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{newsItem.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{newsItem.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {(newsItem.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">{tag}</span>
                          ))}
                        </div>
                        <span className="text-info text-sm font-medium flex items-center">
                          Đọc thêm <ChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-card rounded-xl shadow-card p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3">Danh mục tin tức</h3>
              <div className="flex space-x-2 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-info text-white'
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
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Tin tức mới nhất ({filteredNews.length})
              </h2>

              {filteredNews.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <div className="w-32 mx-auto mb-4 opacity-80">
                    <Illustration name="NoNotifications" />
                  </div>
                  <p className="text-foreground font-medium">Không có bài viết nào</p>
                  <p className="text-sm text-muted-foreground mt-1">Hãy thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((newsItem) => (
                    <button
                      key={newsItem.id}
                      onClick={() => navigate(`/news/${newsItem.slug}`)}
                      className="w-full text-left bg-card rounded-xl shadow-card p-4 hover:shadow transition-shadow"
                    >
                      <div className="flex space-x-4">
                        <img src={imageOf(newsItem)} alt={newsItem.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              newsItem.category === 'vgreen' ? 'bg-success-subtle text-primary' :
                              newsItem.category === 'market' ? 'bg-info-subtle text-info' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {newsItem.category === 'vgreen' ? 'V-GREEN' : newsItem.category === 'market' ? 'Thị trường' : 'Chính sách'}
                            </span>
                            {newsItem.isFeatured && (
                              <span className="bg-warning-subtle text-warning-strong px-2 py-1 rounded text-xs font-medium">Nổi bật</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{newsItem.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{newsItem.summary}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-3">
                              <span>{formatDate(newsItem.publishedAt)}</span>
                              <span>•</span>
                              <span>{newsItem.readTime} phút</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {formatViews(newsItem.views)}
                              </span>
                            </div>
                            <span className="text-info flex items-center">
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Market Insights */}
        <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl shadow-elevated p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-card/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Thông tin thị trường</h3>
              <p className="text-primary-foreground text-sm">Cập nhật theo thời gian thực</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card/10 rounded-lg p-3">
              <div className="text-lg font-bold">2.2%</div>
              <div className="text-primary-foreground text-sm">Lãi suất cao nhất</div>
            </div>
            <div className="bg-card/10 rounded-lg p-3">
              <div className="text-lg font-bold">250%</div>
              <div className="text-primary-foreground text-sm">Tăng trưởng thị trường</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/investment')}
            className="w-full bg-card text-primary py-3 rounded-lg font-semibold hover:bg-success-subtle transition-colors"
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