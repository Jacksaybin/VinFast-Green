/**
 * NewsDetail page component - Xem chi tiết một bài viết
 * Nguồn: newsApi.getNewsBySlug (có fallback nội dung tối thiểu khi offline)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, Eye, Share2, Calendar } from 'lucide-react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { newsApi } from '../lib/api';

interface NewsDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string | null;
  author: string;
  tags: string[];
  isFeatured: boolean;
  views: number;
  readTime: number;
  publishedAt: string;
}

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const fetchWithFallback = async () => {
      try {
        const data = await newsApi.getNewsBySlug(slug);
        if (cancelled) return;
        if (data) {
          setArticle(data);
          return;
        }
      } catch {
        // Network error - try list fallback
      }
      // Fallback: search list for matching slug
      try {
        const listResult = await newsApi.getNews(undefined, 1, 50);
        if (!cancelled && listResult?.news) {
          const match = listResult.news.find((n: any) => n.slug === slug);
          if (match) {
            setArticle({
              ...match,
              content: match.summary || '<p>Nội dung bài viết đang được cập nhật.</p>',
              author: '',
            });
            return;
          }
        }
      } catch {}
      if (!cancelled) setNotFound(true);
    };

    fetchWithFallback().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatViews = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString();

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Đã sao chép liên kết bài viết!');
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm py-3 mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center text-muted-foreground hover:text-info p-2 rounded-lg"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Đang tải bài viết...</div>
        ) : notFound || !article ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm mb-4">Không tìm thấy bài viết.</p>
            <button
              onClick={() => navigate('/news')}
              className="px-4 py-2 bg-info text-white rounded-lg text-sm"
            >
              Về trang tin tức
            </button>
          </div>
        ) : (
          <article className="bg-card rounded-xl shadow-card overflow-hidden">
            <img
              src={article.imageUrl || 'https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/30b60eaf-2cd0-4610-82ee-48710165f9d5.jpg'}
              alt={article.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-5">
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  article.category === 'vgreen' ? 'bg-success-subtle text-primary' :
                  article.category === 'market' ? 'bg-info-subtle text-info' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {article.category === 'vgreen' ? 'V-GREEN' : article.category === 'market' ? 'Thị trường' : 'Chính sách'}
                </span>
                {article.isFeatured && (
                  <span className="bg-warning-subtle text-warning-strong px-2 py-1 rounded text-xs font-medium">Nổi bật</span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-4 leading-snug">{article.title}</h1>

              <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 border-b border-border mb-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {article.readTime} phút
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {formatViews(article.views)}
                  </span>
                </div>
                {article.author && (
                  <span className="text-muted-foreground">Bởi {article.author}</span>
                )}
              </div>

              {article.summary && (
                <p className="text-muted-foreground font-medium mb-4 leading-relaxed">{article.summary}</p>
              )}

              <div
                className="prose prose-sm max-w-none text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>Bài viết chưa có nội dung chi tiết.</p>' }}
              />

              {(article.tags && article.tags.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border">
                  {article.tags.map((tag) => (
                    <span key={tag} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </article>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default NewsDetail;