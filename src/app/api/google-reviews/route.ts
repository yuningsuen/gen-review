import { NextRequest, NextResponse } from "next/server";

// Google Places API (New) 的接口定义
interface PlaceReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: {
    text: string;
    languageCode: string;
  };
  originalText: {
    text: string;
    languageCode: string;
  };
  authorAttribution: {
    displayName: string;
    uri: string;
    photoUri: string;
  };
  publishTime: string;
}

interface PlaceDetailsResponse {
  reviews: PlaceReview[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: "Place ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    console.log("Fetching reviews for place ID:", placeId);

    // 使用正确的 Places API (New) 端点和方法
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    console.log("Sending request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews",
      },
    });

    console.log("Google Places API response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // 先获取响应文本，然后尝试解析
    const responseText = await response.text();
    console.log("Raw response text:", responseText);

    if (!response.ok) {
      console.error("Google Places API error:", responseText);
      return NextResponse.json(
        {
          success: false,
          error: `Google Places API error: ${response.status}`,
          details: responseText,
        },
        { status: response.status }
      );
    }

    // 尝试解析JSON
    let data: PlaceDetailsResponse;
    try {
      if (!responseText.trim()) {
        console.error("Empty response from Google Places API");
        return NextResponse.json({
          success: true,
          reviews: [],
          message: "Empty response from Google Places API",
        });
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Response text was:", responseText);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON response from Google Places API",
          details: `Parse error: ${
            parseError instanceof Error ? parseError.message : "Unknown"
          }`,
        },
        { status: 500 }
      );
    }
    console.log(
      "Google Places API response data:",
      JSON.stringify(data, null, 2)
    );

    if (!data.reviews || data.reviews.length === 0) {
      return NextResponse.json({
        success: true,
        reviews: [],
        message: "No reviews found for this place",
      });
    }

    // 转换为标准格式
    const standardizedReviews = data.reviews.map((review, index) => ({
      id: `review_${index}`,
      author: review.authorAttribution?.displayName || "Anonymous",
      rating: review.rating,
      text: review.text?.text || review.originalText?.text || "",
      time: review.relativePublishTimeDescription || "",
      publishTime: review.publishTime || "",
      languageCode:
        review.text?.languageCode ||
        review.originalText?.languageCode ||
        "zh-CN",
    }));

    console.log(`Successfully fetched ${standardizedReviews.length} reviews`);

    return NextResponse.json({
      success: true,
      reviews: standardizedReviews,
      totalReviews: standardizedReviews.length,
      placeId: placeId,
    });
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
