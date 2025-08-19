import Image from "next/image";

interface ProfileProps {
  name: string;
  description: string;
  avatarText?: string;
  avatarImage?: string; // 新增：图片头像路径
}

export function Profile({
  name,
  description,
  avatarText,
  avatarImage,
}: ProfileProps) {
  return (
    <div className="text-center mb-8">
      <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
        {avatarImage ? (
          <Image
            src={avatarImage}
            alt={name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-2xl font-bold">{avatarText}</span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {name}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}
