"use client";

import { useState } from "react";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  time: string;
  publishTime?: string;
  languageCode?: string;
}

export default function TestReviewsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_PLACE_ID || "ChIJN1t_tDeuEmsRUsoyG83frY4"
  );
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    if (!placeId.trim()) {
      setError("请输入有效的Place ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReviews([]);

    try {
      console.log("Fetching reviews for place ID:", placeId);

      const response = await fetch(
        `/api/google-reviews?placeId=${encodeURIComponent(placeId)}`
      );
      const data = await response.json();

      console.log("API response:", data);

      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
      } else {
        setError(data.error || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📝 Google Reviews 获取测试
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              测试Google Places API (New) 的评论获取功能。输入Place
              ID来获取真实的评论数据。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label
                  htmlFor="placeId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Place ID
                </label>
                <input
                  id="placeId"
                  type="text"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  placeholder="输入Google Places的Place ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchReviews}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
                >
                  {isLoading ? "🔄 获取中..." : "📥 获取评论"}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>示例Place ID:</p>
              <ul className="mt-1 space-y-1">
                <li>
                  • <code>ChIJN1t_tDeuEmsRUsoyG83frY4</code> (Google Sydney
                  Office)
                </li>
                <li>
                  • <code>ChIJOwg_06VPwokRYv534QaPC8g</code> (Empire State
                  Building)
                </li>
                <li>• 你也可以使用自己的Place ID</li>
              </ul>
            </div>
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold mb-2">❌ 错误</h3>
              <p className="text-red-700 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {/* 成功结果显示 */}
          {reviews.length > 0 && (
            <div className="space-y-6">
              {/* 统计信息 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-green-800 font-semibold mb-2">
                  ✅ 获取成功
                </h3>
                <p className="text-green-700">
                  共获取到 <strong>{totalReviews}</strong> 条评论
                </p>
              </div>

              {/* 评论列表 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  评论详情
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.author}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-500 text-lg">
                              {renderStars(review.rating)}
                            </span>
                            <span className="text-gray-600 text-sm">
                              ({review.rating}/5)
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{review.time}</p>
                          {review.publishTime && (
                            <p className="text-xs">
                              {new Date(review.publishTime).toLocaleDateString(
                                "zh-CN"
                              )}
                            </p>
                          )}
                          {review.languageCode && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {review.languageCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-700">
                        <p className="whitespace-pre-wrap">{review.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 原始数据 */}
              <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  🔍 查看原始API响应数据
                </summary>
                <pre className="mt-3 p-3 bg-white border rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(reviews, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* 如果没有评论但也没有错误 */}
          {!isLoading &&
            !error &&
            reviews.length === 0 &&
            totalReviews === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-yellow-800 font-semibold mb-2">
                  ⚠️ 无评论数据
                </h3>
                <p className="text-yellow-700">
                  该Place ID没有找到评论数据，或者该地点没有公开的评论。
                </p>
              </div>
            )}

          {/* 使用说明 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-800 font-semibold mb-2">💡 使用说明</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>1. 在上方输入框中输入Google Places的Place ID</li>
              <li>2. 点击"获取评论"按钮测试API调用</li>
              <li>3. 系统会显示获取到的评论数量和详细内容</li>
              <li>4. 可以查看原始API响应数据进行调试</li>
              <li>5. 确保在.env.local中配置了GOOGLE_PLACES_API_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
