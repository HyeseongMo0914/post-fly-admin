import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { v4 as uuidv4 } from "uuid";

const durationMap = new Map<string, number>();
export const api = axios.create({
  // baseURL: 'http://localhost:3000',
  baseURL: "https://api.postfly.kr",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.POSTFLY_API_KEY}`,
    // Referer: Platform.select({ios: 'id1615006587', android: 'com.chicreactnativewrapper'}), // CSRF Referer 검증
  },
});

axiosRetry(api, {
  retries: 3,
  shouldResetTimeout: true,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: () => true, // Retry all errors
});

api.interceptors.request.use(async (axiosConfig) => {
  const key = uuidv4();
  axiosConfig.headers.X_REQUEST_ID = key;

  if (process.env.NODE_ENV === "development") {
    durationMap.set(key, Date.now());
  }

  //   const accessToken = (await cookies()).get("accessToken")?.value;
  //   if (!accessToken) {
  //     return axiosConfig;
  //   }
  //   axiosConfig.headers.authorization = `Bearer ${accessToken}`;
  return axiosConfig;
});

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      const key = response.config.headers?.X_REQUEST_ID;
      if (key != null) {
        const duration = Date.now() - (durationMap.get(key) ?? 0);
        durationMap.delete(key);
        if (response.config != null) {
          console.log(
            `${response.config.method?.toUpperCase()} ${JSON.stringify(
              response.config.data
            )} ${response.status} ${duration}ms`
          );
        }
      } else {
        if (response.config != null) {
          console.log(
            `${response.config.method?.toUpperCase()} ${JSON.stringify(
              response.config.data
            )} ${response.status}`
          );
        }
      }
    }

    try {
      response.request.requestStringifyData = JSON.stringify(
        JSON.parse(response.config.data ?? "{}")?.requests?.[0]
      );
    } catch (err) {
      console.log(err);
    }

    return response;
  },
  async function (error: AxiosError) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `POSTFLY API Error Occured\nURL:${JSON.stringify(
          error.config?.data
        )}\nStatus: ${error.response?.status}\nCode: ${
          error.code
        }\nRequest ID: ${error.config?.headers?.X_REQUEST_ID}`
      );
      durationMap.delete(error.config?.headers?.X_REQUEST_ID);
    }

    return Promise.reject(error);
  }
);
