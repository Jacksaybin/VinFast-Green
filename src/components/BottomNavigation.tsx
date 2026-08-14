/**
 * File: BottomNavigation.tsx
 * Purpose: Footer component với nhận diện V-GREEN, design token, gradient.
 * Đã tinh chỉnh: gradient mesh, link active glow, social pill, divider gradient.
 */

import React from "react";
import { Link, useLocation } from "react-router";
import { LogoVGreen } from "./ui/illustrations";
import { Leaf, Mail, Phone, MapPin, Facebook, Youtube, Globe, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/investment", label: "Đầu tư" },
  { to: "/news", label: "Tin tức" },
  { to: "/benefits", label: "Phúc lợi" },
  { to: "/introduction", label: "Giới thiệu" },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation()
  return (
    <footer className="relative mt-12 bg-gradient-to-br from-brand-primary-900 via-brand-primary-800 to-brand-accent-900 text-white overflow-hidden">
      {/* Decorative gradient mesh */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 20%, rgba(74, 222, 128, 0.4) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(34, 211, 238, 0.3) 0px, transparent 50%)",
        }}
      />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary-400 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <LogoVGreen variant="full" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-brand-primary-300 flex-shrink-0" />
              <span>Nền tảng đầu tư trạm sạc VinFast — đầu tư xanh, sinh lời bền vững, góp phần xây dựng tương lai năng lượng sạch Việt Nam.</span>
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((l) => {
                const active = location.pathname === l.to
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={cn(
                        'text-sm transition-colors flex items-center gap-2 group',
                        active ? 'text-white font-medium' : 'text-white/80 hover:text-white'
                      )}
                    >
                      <Leaf className={cn(
                        'w-3 h-3 transition-transform',
                        active ? 'text-brand-primary-300' : 'text-brand-primary-400 group-hover:scale-110'
                      )} />
                      {l.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-primary-300 flex-shrink-0" />
                <span>Tòa nhà V-GREEN, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-primary-300 flex-shrink-0" />
                <span>1900 6868</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-primary-300 flex-shrink-0" />
                <span>support@vgreen.vn</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">Theo dõi chúng tôi</h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Website"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
            <div className="text-xs text-white/60">
              Giấy phép ĐKKD: 0123456789
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/70">
            © {new Date().getFullYear()} V-GREEN Platform. Đã đăng ký bản quyền.
          </div>
          <div className="flex items-center gap-4 text-xs text-white/70">
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
            <span className="text-white/30">•</span>
            <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
            <span className="text-white/30">•</span>
            <a href="#" className="hover:text-white transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomNavigation;