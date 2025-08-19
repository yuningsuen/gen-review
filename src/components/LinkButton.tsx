"use client";

import { useState } from "react";
import Image from "next/image";
import { ReviewGenerator } from "@/utils/reviewGenerator";
import { GeminiReviewGenerator } from "@/services/geminiReviewGenerator";
import { SimpleReviewFetcher } from "@/services/simpleReviewFetcher";

interface LinkButtonProps {
  href: string;
  title: string;
  icon: string;
  iconBg: string;
  isEmail?: boolean;
  platform?: string; // 新增：用于标识平台类型，生成对应评论
  businessName?: string; // 新增：商家名称，用于显示
  placeId?: string; // 新增：Google Place ID，用于获取评论
  logoSrc?: string; // 新增：logo图片路径，如果提供则使用图片而不是emoji
}

export function LinkButton({
  href,
  title,
  icon,
  iconBg,
  isEmail = false,
  platform,
  businessName,
  placeId,
  logoSrc,
}: LinkButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    console.log("Button clicked!", {
      platform,
      isEmail,
      businessName,
      placeId,
    });

    // 如果有platform参数，先异步生成并复制AI评论
    if (platform && !isEmail && (businessName || placeId)) {
      console.log("Entering AI generation flow...");
      e.preventDefault();

      if (isGenerating) {
        console.log("Already generating review, please wait...");
        return;
      }

      setIsGenerating(true);
      try {
        console.log(
          `Generating AI review for ${
            businessName || "business"
          } on ${platform}...`
        );

        // 1. 获取真实评论
        // 优先使用 placeId，如果没有则使用环境变量中的默认值
        const targetPlaceId =
          placeId || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

        if (!targetPlaceId) {
          throw new Error("No place ID available for fetching reviews");
        }

        const placeData = await SimpleReviewFetcher.getGoogleMapsReviews(
          targetPlaceId
        );

        if (!placeData || placeData.reviews.length === 0) {
          throw new Error(`No reviews found for the specified location`);
        }

        console.log(
          `Found ${placeData.reviews.length} reviews for ${
            businessName || placeData.name || "business"
          }`
        );

        // 2. 生成AI评论
        const aiReview = await GeminiReviewGenerator.generateReview({
          platform: platform as
            | "google-maps"
            | "yelp"
            | "tripadvisor"
            | "opentable",
          businessName: businessName || placeData.name || "这家餐厅",
          existingReviews: placeData.reviews,
        });

        console.log("Generated AI review:", aiReview);

        // 3. 复制到剪贴板
        console.log("Attempting to copy to clipboard...");
        try {
          await ReviewGenerator.copyToClipboard(aiReview);
          console.log("Successfully copied to clipboard");
          ReviewGenerator.showSuccessNotification(platform);

          // 自动复制成功，延迟后跳转
          setTimeout(() => {
            openPlatformLink();
          }, 1000);
        } catch (clipboardError) {
          console.error("Clipboard copy failed:", clipboardError);
          console.warn(
            "Auto copy failed, showing manual copy modal:",
            clipboardError
          );

          // 手动复制模式，传入跳转回调
          ReviewGenerator.showManualCopyModal(aiReview, platform, () => {
            openPlatformLink();
          });
        }
      } catch (error) {
        console.error("Failed to generate AI review:", error);
        ReviewGenerator.showErrorNotification(
          `生成${platform}评论失败: ${
            error instanceof Error ? error.message : "未知错误"
          }`
        );

        // 即使失败也打开链接
        setTimeout(() => {
          openPlatformLink();
        }, 500);
      } finally {
        setIsGenerating(false);
      }

      return; // 阻止默认的链接处理
    }

    // 原有的非AI链接处理逻辑
    if (!isEmail) {
      openPlatformLink();
    }
  };

  const openPlatformLink = () => {
    // 检测是否为移动设备
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // 移动设备：直接跳转，不打开新标签页（避免被阻止）
      window.location.href = href;
    } else {
      // 桌面端：在新标签页打开
      window.open(href, "_blank");
    }
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noopener noreferrer"}
      className={`w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group shadow-sm ${
        isGenerating ? "opacity-75 cursor-wait" : ""
      }`}
    >
      <div className="flex items-center">
        <div
          className={`w-10 h-10 ${
            logoSrc ? "bg-white" : iconBg
          } rounded-lg flex items-center justify-center mr-3 ${
            logoSrc ? "p-1" : ""
          }`}
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : logoSrc ? (
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <span className="text-white text-sm font-bold">{icon}</span>
          )}
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {isGenerating ? `生成${platform}评论中...` : title}
        </span>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
        {isGenerating ? "⏳" : "→"}
      </div>
    </a>
  );
}
