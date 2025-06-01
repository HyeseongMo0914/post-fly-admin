/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum DomainPackingStatus {
  PackingStatusCreated = "CREATED",
  PackingStatusPending = "REQUESTED",
  PackingStatusInTransit = "TRANSIT",
  PackingStatusDelivered = "DELIVERED",
}

export interface DtoAddressDTO {
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  postcode?: string;
  state?: string;
}

export interface DtoBulkCreatePresignedURLRequest {
  category?: string;
  count?: number;
}

export interface DtoBulkCreatePresignedURLResponse {
  objects?: DtoCreatePresignedURLResponse[];
}

export interface DtoBulkGetReadPresignedURLRequest {
  paths: string[];
}

export interface DtoBulkGetReadPresignedURLResponse {
  objects?: DtoGetReadPresignedURLResponse[];
}

export interface DtoCheckUserRequest {
  /** @example "KAKAO, APPLE, GOOGLE, NAVER, FACEBOOK" */
  provider: string;
  /** @example "socialAccessToken" */
  socialAccessToken: string;
}

export interface DtoCheckUserResponse {
  /** @example true */
  isExist: boolean;
  userInfo?: DtoGetUserInfoResponse;
}

export interface DtoCreatePackingDetailRequest {
  itemDetails?: DtoItemDetailDTO[];
  /** @example "packingID" */
  packingID: string;
  trackingInfo?: DtoTrackingInfoDTO;
}

export interface DtoCreatePackingDetailResponse {
  itemDetail?: DtoItemDetailDTO[];
  /** @example "packingDetailID" */
  packingDetailID: string;
  trackingInfo?: DtoTrackingInfoDTO;
}

export interface DtoCreatePackingRequest {
  /** @example "AU" */
  shippingCountryCode: string;
}

export interface DtoCreatePresignedURLRequest {
  category?: string;
}

export interface DtoCreatePresignedURLResponse {
  path?: string;
  readURL?: string;
  writeURL?: string;
}

export interface DtoDeletePackingDetailRequest {
  /** @example "packingDetailID" */
  packingDetailID: string;
  /** @example "packingID" */
  packingID: string;
}

export interface DtoForwardingServiceAddressResponse {
  /** @example "address" */
  address: string;
}

export interface DtoGetReadPresignedURLRequest {
  path?: string;
}

export interface DtoGetReadPresignedURLResponse {
  readURL?: string;
}

export interface DtoGetUserInfoResponse {
  /** @example "customerNumber" */
  customerNumber: string;
  defaultReceiverInfo?: DtoReceiverInfoDTO;
  defaultSenderInfo?: DtoSenderInfoDTO;
  /** @example "email" */
  email: string;
  /** @example "name" */
  name: string;
  /** @example "010-1234-5678" */
  phoneNumber?: string;
  /** @example "userID" */
  userID: string;
}

export interface DtoItemDetailDTO {
  description?: string;
  images?: string[];
  itemName?: string;
  price?: number;
  quantity?: number;
}

export interface DtoListPackingResponse {
  packings?: DtoPackingDTO[];
}

export interface DtoPackingDTO {
  packingDetails?: DtoPackingDetailDTO[];
  /** @example "packingID" */
  packingID: string;
  receiverInfo?: DtoReceiverInfoDTO;
  senderInfo?: DtoSenderInfoDTO;
  /** @example "AU" */
  shippingCountryCode: string;
  /** @example "packing" */
  status: DomainPackingStatus;
}

export interface DtoPackingDeliveryFeeResponse {
  /** @example 10000 */
  deliveryFee: number;
  /** @example 10000 */
  dhlDeliveryFee: number;
  /** @example "특송 (Express) - DHL Express Worldwide" */
  dhlServiceType: string;
  /** @example 10000 */
  fedexDeliveryFee: number;
  /** @example "특송 (Express) - FEDEX Internation Priority" */
  fedexServiceType: string;
}

export interface DtoPackingDetailDTO {
  itemDetail?: DtoItemDetailDTO[];
  /** @example "packingDetailID" */
  packingDetailID: string;
  trackingInfo?: DtoTrackingInfoDTO;
}

export interface DtoPatchUserRequest {
  /**
   * Name  string `json:"name" validate:"required" example:"name"`
   * Email string `json:"email" validate:"required" example:"email"`
   * @example "010-1234-5678"
   */
  phoneNumber?: string;
}

export interface DtoReceiverInfoDTO {
  address?: DtoAddressDTO;
  email?: string;
  name?: string;
  phone?: string;
}

export interface DtoSenderInfoDTO {
  email?: string;
  name?: string;
  phone?: string;
}

export interface DtoSignUpSNSRequest {
  /** @example "access_token" */
  accessToken: string;
  /** @example "KAKAO, APPLE, GOOGLE, NAVER, FACEBOOK" */
  provider: string;
}

export interface DtoSignUpSNSResponse {
  accessToken?: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  userID?: string;
}

export interface DtoTrackingInfoDTO {
  carrier?: string;
  images?: string[];
  trackingNumber?: string;
}

export interface DtoUpdatePackingDetailItemDetailRequest {
  itemDetails?: DtoItemDetailDTO[];
  /** @example "packingDetailID" */
  packingDetailID: string;
  /** @example "packingID" */
  packingID: string;
}

export interface DtoUpdatePackingDetailTrackingInfoRequest {
  /** @example "packingDetailID" */
  packingDetailID: string;
  /** @example "packingID" */
  packingID: string;
  trackingInfo?: DtoTrackingInfoDTO;
}

export interface DtoUpdatePackingReceiverInfoRequest {
  /** @example "packingID" */
  packingID: string;
  receiverInfo?: DtoReceiverInfoDTO;
  /** @example true */
  saveDefaultReceiver?: boolean;
}

export interface DtoUpdatePackingSenderInfoRequest {
  /** @example "packingID" */
  packingID: string;
  senderInfo?: DtoSenderInfoDTO;
}

export interface DtoUpdatePackingStatusRequest {
  /** @example "packingID" */
  packingID: string;
  /** @example "CREATED,REQUESTED,TRANSIT,DELIVERED" */
  status: DomainPackingStatus;
}

export interface PkgResponse {
  code?: number;
  data?: any;
  message?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Swagger Example API
 * @version 1.0
 * @license Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html)
 * @termsOfService http://swagger.io/terms/
 * @contact API Support <support@swagger.io> (http://www.swagger.io/support)
 *
 * This is a sample server Petstore server.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  admin = {
    /**
     * No description
     *
     * @tags Packing
     * @name V1PackingList
     * @summary Packing
     * @request GET:/admin/v1/packing
     * @secure
     */
    v1PackingList: (params: RequestParams = {}) =>
      this.request<DtoListPackingResponse, any>({
        path: `/admin/v1/packing`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name V1PackingBulkPartialUpdate
     * @summary Update the status of a Packing
     * @request PATCH:/admin/v1/packing/bulk
     * @secure
     */
    v1PackingBulkPartialUpdate: (
      request: DtoUpdatePackingStatusRequest[],
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/admin/v1/packing/bulk`,
        method: "PATCH",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Object
     * @name V1PresignedReadBulkCreate
     * @summary Bulk Get Read Presigned URLs
     * @request POST:/admin/v1/presigned/read/bulk
     * @secure
     */
    v1PresignedReadBulkCreate: (
      request: DtoBulkGetReadPresignedURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoBulkGetReadPresignedURLResponse, any>({
        path: `/admin/v1/presigned/read/bulk`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  countries = {
    /**
     * No description
     *
     * @tags Packing
     * @name CountriesList
     * @summary Deprecated: (v2 사용하세요)
     * @request GET:/countries
     * @deprecated
     * @secure
     */
    countriesList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/countries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  deliveryFee = {
    /**
     * No description
     *
     * @tags Packing
     * @name DeliveryFeeList
     * @summary Deprecated: (v2 사용하세요)
     * @request GET:/delivery-fee
     * @deprecated
     * @secure
     */
    deliveryFeeList: (
      query: {
        /** @example "Australia" */
        countryName: string;
        /** @example "1x1x1" */
        volume: string;
        /** @example 8.5 */
        weight: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoPackingDeliveryFeeResponse, any>({
        path: `/delivery-fee`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags User
     * @name UsersList
     * @summary GetUser
     * @request GET:/users
     * @secure
     */
    usersList: (params: RequestParams = {}) =>
      this.request<DtoGetUserInfoResponse, any>({
        path: `/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UsersDelete
     * @summary DeleteUser
     * @request DELETE:/users
     * @secure
     */
    usersDelete: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UsersPartialUpdate
     * @summary PatchUser
     * @request PATCH:/users
     * @secure
     */
    usersPartialUpdate: (
      request: DtoPatchUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/users`,
        method: "PATCH",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name CheckCreate
     * @summary CheckUser
     * @request POST:/users/check
     * @secure
     */
    checkCreate: (request: DtoCheckUserRequest, params: RequestParams = {}) =>
      this.request<DtoCheckUserResponse, any>({
        path: `/users/check`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name SignUpSnsCreate
     * @summary CreateUser
     * @request POST:/users/sign-up/sns
     * @secure
     */
    signUpSnsCreate: (
      request: DtoSignUpSNSRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoSignUpSNSResponse, any>({
        path: `/users/sign-up/sns`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  v1 = {
    /**
     * No description
     *
     * @tags Packing
     * @name PackingList
     * @summary Packing
     * @request GET:/v1/packing
     * @secure
     */
    packingList: (params: RequestParams = {}) =>
      this.request<DtoListPackingResponse, any>({
        path: `/v1/packing`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingCreate
     * @summary Packing
     * @request POST:/v1/packing
     * @secure
     */
    packingCreate: (
      request: DtoCreatePackingRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoPackingDTO, any>({
        path: `/v1/packing`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingPartialUpdate
     * @summary Update the status of a Packing
     * @request PATCH:/v1/packing
     * @secure
     */
    packingPartialUpdate: (
      request: DtoUpdatePackingStatusRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/v1/packing`,
        method: "PATCH",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingBulkPartialUpdate
     * @summary Update the status of a Packing
     * @request PATCH:/v1/packing/bulk
     * @secure
     */
    packingBulkPartialUpdate: (
      request: DtoUpdatePackingStatusRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/v1/packing/bulk`,
        method: "PATCH",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingDetailsCreate
     * @summary Create PackingDetail under a Packing
     * @request POST:/v1/packing/details
     * @secure
     */
    packingDetailsCreate: (
      request: DtoCreatePackingDetailRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoCreatePackingDetailResponse, any>({
        path: `/v1/packing/details`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingDetailsDelete
     * @summary Delete PackingDetail by PackingDetailID
     * @request DELETE:/v1/packing/details
     * @secure
     */
    packingDetailsDelete: (
      request: DtoDeletePackingDetailRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/v1/packing/details`,
        method: "DELETE",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingDetailsItemDetailUpdate
     * @summary Update ItemDetail by PackingDetailID
     * @request PUT:/v1/packing/details/item-detail
     * @secure
     */
    packingDetailsItemDetailUpdate: (
      request: DtoUpdatePackingDetailItemDetailRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/v1/packing/details/item-detail`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingDetailsTrackingInformUpdate
     * @summary Update TrackingInfo and ItemDetail by PackingDetailID
     * @request PUT:/v1/packing/details/tracking-inform
     * @secure
     */
    packingDetailsTrackingInformUpdate: (
      request: DtoUpdatePackingDetailTrackingInfoRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, PkgResponse>({
        path: `/v1/packing/details/tracking-inform`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingForwardingServiceAddressList
     * @summary Retrieve the forwarding service address
     * @request GET:/v1/packing/forwarding-service/address
     * @secure
     */
    packingForwardingServiceAddressList: (params: RequestParams = {}) =>
      this.request<DtoForwardingServiceAddressResponse, PkgResponse>({
        path: `/v1/packing/forwarding-service/address`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingReceiverInformUpdate
     * @summary Packing
     * @request PUT:/v1/packing/receiver-inform
     * @secure
     */
    packingReceiverInformUpdate: (
      request: DtoUpdatePackingReceiverInfoRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/v1/packing/receiver-inform`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name PackingSenderInformUpdate
     * @summary Packing
     * @request PUT:/v1/packing/sender-inform
     * @secure
     */
    packingSenderInformUpdate: (
      request: DtoUpdatePackingSenderInfoRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/v1/packing/sender-inform`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Object
     * @name PresignedReadCreate
     * @summary GetReadPresignedURL
     * @request POST:/v1/presigned/read
     * @secure
     */
    presignedReadCreate: (
      request: DtoGetReadPresignedURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoGetReadPresignedURLResponse, any>({
        path: `/v1/presigned/read`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Object
     * @name PresignedReadBulkCreate
     * @summary Bulk Get Read Presigned URLs
     * @request POST:/v1/presigned/read/bulk
     * @secure
     */
    presignedReadBulkCreate: (
      request: DtoBulkGetReadPresignedURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoBulkGetReadPresignedURLResponse, any>({
        path: `/v1/presigned/read/bulk`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Object
     * @name PresignedWriteCreate
     * @summary CreatePresignedURL
     * @request POST:/v1/presigned/write
     * @secure
     */
    presignedWriteCreate: (
      request: DtoCreatePresignedURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoCreatePresignedURLResponse, any>({
        path: `/v1/presigned/write`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Object
     * @name PresignedWriteBulkCreate
     * @summary Bulk Create Write/Read Presigned URLs
     * @request POST:/v1/presigned/write/bulk
     * @secure
     */
    presignedWriteBulkCreate: (
      request: DtoBulkCreatePresignedURLRequest,
      params: RequestParams = {},
    ) =>
      this.request<DtoBulkCreatePresignedURLResponse, any>({
        path: `/v1/presigned/write/bulk`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  v2 = {
    /**
     * No description
     *
     * @tags Packing
     * @name CountriesList
     * @summary Deprecated: (v3 사용하세요)
     * @request GET:/v2/countries
     * @deprecated
     * @secure
     */
    countriesList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/v2/countries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Packing
     * @name DeliveryFeeList
     * @summary Packing
     * @request GET:/v2/delivery-fee
     * @secure
     */
    deliveryFeeList: (
      query: {
        /** @example "A" */
        domainCode: string;
        /** @example "1x1x1" */
        volume: string;
        /** @example 8.5 */
        weight: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<DtoPackingDeliveryFeeResponse, any>({
        path: `/v2/delivery-fee`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  v3 = {
    /**
     * No description
     *
     * @tags Packing
     * @name CountriesList
     * @summary Packing
     * @request GET:/v3/countries
     * @secure
     */
    countriesList: (params: RequestParams = {}) =>
      this.request<string[], any>({
        path: `/v3/countries`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
