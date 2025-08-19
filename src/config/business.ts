// 商家信息配置
export const BUSINESS_INFO = {
  name: "Haidilao Hot Pot Brentwood",
  address: "Brentwood, CA", // 请替换为具体地址

  // Google Maps相关
  googlePlaceId: "ChIJXXXXXXXXXXXXXXXXXX", // 需要替换为实际的Google Place ID
  googleMapsUrl: "https://maps.google.com/maps?q=Haidilao+Hot+Pot+Brentwood",

  // Yelp相关
  yelpBusinessId: "haidilao-hot-pot-brentwood", // 需要替换为实际的Yelp Business ID
  yelpUrl: "https://www.yelp.com/biz/haidilao-hot-pot-brentwood",

  // TripAdvisor相关
  tripAdvisorId: "XXXXXXX", // 需要替换为实际的TripAdvisor ID
  tripAdvisorUrl:
    "https://www.tripadvisor.com/Restaurant_Review-gXXXXXX-Reviews-Haidilao_Hot_Pot-Brentwood_California.html",

  // OpenTable相关
  openTableId: "XXXXXXX", // 需要替换为实际的OpenTable ID
  openTableUrl: "https://www.opentable.com/r/haidilao-hot-pot-brentwood",
};

// 深度链接生成函数
export const generateDeepLinks = () => {
  return {
    googleMaps: {
      ios: `comgooglemaps://?q=${encodeURIComponent(
        BUSINESS_INFO.name
      )}&center=${encodeURIComponent(BUSINESS_INFO.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(
        BUSINESS_INFO.name + " " + BUSINESS_INFO.address
      )}`,
      web: BUSINESS_INFO.googleMapsUrl,
    },
    yelp: {
      ios: `yelp:///biz/${BUSINESS_INFO.yelpBusinessId}`,
      android: `yelp:///biz/${BUSINESS_INFO.yelpBusinessId}`,
      web: BUSINESS_INFO.yelpUrl,
    },
    tripadvisor: {
      ios: `tripadvisor://restaurant/${BUSINESS_INFO.tripAdvisorId}`,
      android: `tripadvisor://restaurant/${BUSINESS_INFO.tripAdvisorId}`,
      web: BUSINESS_INFO.tripAdvisorUrl,
    },
    opentable: {
      ios: `opentable://restaurant/${BUSINESS_INFO.openTableId}`,
      android: `opentable://restaurant/${BUSINESS_INFO.openTableId}`,
      web: BUSINESS_INFO.openTableUrl,
    },
  };
};
