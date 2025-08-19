import { Profile, LinkButton } from "@/components";

export default function Home() {
  // 配置商家信息
  const businessInfo = {
    name: "Haidilao Hot Pot Brentwood",
    displayName: "Haidilao Hot Pot Brentwood - 海底捞火锅",
    description: "Just click~",
    avatarImage: "/image.png",
  };

  const links = [
    {
      href: "https://maps.app.goo.gl/Ak419Nz2b2HegtDg7?g_st=ipc", // 你的实际Google Maps链接
      title: "Google Maps",
      icon: "📍",
      iconBg: "bg-red-500",
      platform: "google-maps",
      logoSrc: "/google-maps-logo.png",
    },
    {
      href: "https://www.yelp.com/biz/haidilao-hotpot-brentwood-burnaby?osq=haidilao+brentwood",
      title: "Yelp Reviews",
      icon: "⭐",
      iconBg: "bg-red-600",
      platform: "yelp",
      logoSrc: "/yelp-logo.png",
    },
    {
      href: "https://www.tripadvisor.com/Restaurant_Review-g32072-d17679193-Reviews-Haidilao_Hot_Pot-Brentwood_California.html", // 示例链接，请替换为实际
      title: "TripAdvisor",
      icon: "🦉",
      iconBg: "bg-green-600",
      platform: "tripadvisor",
      logoSrc: "/trip-advisor-logo.png",
    },
    {
      href: "https://www.opentable.com/r/haidilao-hot-pot-brentwood", // 示例链接，请替换为实际
      title: "OpenTable",
      icon: "🍽️",
      iconBg: "bg-blue-600",
      platform: "opentable",
      logoSrc: "/opentable-logo.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Profile
          name={businessInfo.displayName}
          description={businessInfo.description}
          avatarImage={businessInfo.avatarImage}
        />

        {/* Links Section */}
        <div className="space-y-4">
          {links.map((link, index) => (
            <LinkButton
              key={index}
              href={link.href}
              title={link.title}
              icon={link.icon}
              iconBg={link.iconBg}
              platform={link.platform}
              businessName={businessInfo.name}
              placeId={process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID}
              logoSrc={link.logoSrc}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            © 2025 · 用 ❤️ 制作
          </div>
          {/* <div className="flex justify-center gap-4 text-xs">
            <a
              href="/test-ai"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              🤖 测试AI生成
            </a>
            <a
              href="/test-gemini"
              className="text-purple-500 hover:text-purple-600 underline"
            >
              🧪 测试Gemini API
            </a>
            <a
              href="/test-reviews"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              📊 测试评论获取
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
