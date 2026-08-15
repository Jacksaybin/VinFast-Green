/**
 * Video hero section component - hiển thị hero với ảnh nền, không overlay tối
 */

import React from 'react';

/**
 * VideoHero - Hero đầu trang với ảnh trạm sạc VinFast (không overlay)
 */
const VideoHero: React.FC = () => {
  return (
    <div className="relative bg-gradient-hero mx-4 my-4 rounded-lg overflow-hidden">
      {/* Ảnh hero */}
      <img
        src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/65763967-2c9d-403e-93dc-b6d34c862be1.jpg"
        alt="VinFast Charging Station"
        className="w-full h-48 object-cover"
      />

      {/* Overlay đã bỏ theo yêu cầu */}

      {/* Thời lượng giả lập - thêm nền mờ để đảm bảo đọc tốt khi không có overlay */}
      <div className="absolute bottom-2 left-4 text-white text-xs bg-black/50 px-2 py-0.5 rounded">
        2:42 / 2:42
      </div>
    </div>
  );
};

export default VideoHero;
