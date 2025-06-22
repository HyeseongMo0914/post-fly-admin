"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "react-data-grid/lib/styles.css";
import { DataGrid, type Column, type ColSpanArgs } from "react-data-grid";
import {
  DomainPackingStatus,
  DtoListPackingResponse,
  DtoPackingDTO,
  DtoPackingDetailDTO,
  DtoItemDetailDTO,
  DtoGetReadPresignedURLResponse,
} from "@/postfly-api-types";
import styled from "@emotion/styled";
import { useAtom } from "jotai";
import Layout from "@/components/Layout";
import { authAtom, checkAuthAtom } from "@/atoms/authAtom";

const baseColumns = [
  { key: "packingID", name: "팩킹 ID", width: 200 },
  { key: "status", name: "상태", width: 120 },
  { key: "shippingCountryCode", name: "배송 국가", width: 100 },
  { key: "receiverName", name: "수신자 이름", width: 150 },
  { key: "receiverPhone", name: "수신자 전화번호", width: 150 },
  { key: "receiverEmail", name: "수신자 이메일", width: 200 },
  { key: "receiverAddress", name: "수신자 주소", width: 300 },
  { key: "senderName", name: "발신자 이름", width: 150 },
  { key: "senderPhone", name: "발신자 전화번호", width: 150 },
  { key: "senderEmail", name: "발신자 이메일", width: 200 },
  { key: "itemCount", name: "아이템 수", width: 100 },
  { key: "measuredWeight", name: "무게 (kg)", width: 100 },
  {
    key: "outboundTrackingInfo",
    name: "운송장 정보",
    width: 250,
    renderCell({ row }: { row: PackingRow }) {
      if (row.type === "DETAIL" || !row.outboundTrackingInfo) return "-";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>운송사: {row.outboundTrackingInfo.carrier || "-"}</div>
          <div>
            운송장번호: {row.outboundTrackingInfo.trackingNumber || "-"}
          </div>
        </div>
      );
    },
  },
  {
    key: "shippingFee",
    name: "배송비 (원)",
    width: 150,
    renderCell({ row }: { row: PackingRow }) {
      if (row.type === "DETAIL" || row.shippingFee === null) return "-";
      return row.shippingFee.toLocaleString("ko-KR");
    },
  },
];

type PackingRow =
  | {
      type: "MASTER";
      packingID: string;
      status: string;
      shippingCountryCode: string;
      receiverName: string;
      receiverPhone: string;
      receiverEmail: string;
      receiverAddress: string;
      senderName: string;
      senderPhone: string;
      senderEmail: string;
      itemCount: number;
      measuredWeight: number | null;
      outboundTrackingInfo: {
        carrier: string | null;
        trackingNumber: string | null;
      } | null;
      shippingFee: number | null;
      expanded: boolean;
    }
  | {
      type: "DETAIL";
      packingID: string;
      parentId: string;
    };

type DetailRow = Omit<DtoPackingDetailDTO, "itemDetail"> & {
  showPackingDetailID?: boolean;
  itemDetail: DtoItemDetailDTO | null;
};

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: calc(100vw - 250px);
`;

const StatusFilter = styled.div`
  display: flex;
  gap: 10px;
`;

const StatusButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${({ isActive }) => (isActive ? "#007bff" : "white")};
  color: ${({ isActive }) => (isActive ? "white" : "black")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ isActive }) => (isActive ? "#0056b3" : "#f5f5f5")};
  }
`;

const StatusChangeButton = styled.button<{ isDisabled: boolean }>`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${({ isDisabled }) => (isDisabled ? "#f5f5f5" : "#007bff")};
  color: ${({ isDisabled }) => (isDisabled ? "#999" : "white")};
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;

  &:hover {
    background: ${({ isDisabled }) => (isDisabled ? "#f5f5f5" : "#0056b3")};
  }
`;

const StatusOptionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const StatusOptionText = styled.span`
  color: #0056b3;
`;

const ShippingInfoContainer = styled(StatusOptionsContainer)`
  min-width: 300px;
  padding: 16px;
`;

const StatusOptionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ConfirmModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #000;

  h3 {
    color: #000;
    margin: 0;
  }

  p {
    color: #000;
    margin: 0;
  }
`;

const ConfirmModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const DetailContainer = styled.div`
  padding: 24px;
  border-radius: 4px;
`;

const ImageContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  max-height: 120px;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
`;

const ItemContainer = memo(styled.div`
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`);

ItemContainer.displayName = "ItemContainer";

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ItemLabel = styled.span`
  color: #666;
  min-width: 60px;
  font-weight: 500;
`;

const ItemValue = styled.span`
  color: #333;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const RedText = styled.span`
  color: red;
`;

const convertStatus = (status: DomainPackingStatus) => {
  switch (status) {
    case DomainPackingStatus.PackingStatusAddingItems:
      return "물품 담는중";
    case DomainPackingStatus.PackingStatusPackingRequested:
      return "포장요청";
    case DomainPackingStatus.PackingStatusPackingDone:
      return "포장완료";
    case DomainPackingStatus.PackingStatusPaymentCompleted:
      return "결제완료";
    case DomainPackingStatus.PackingStatusTransit:
      return "배송중";
    case DomainPackingStatus.PackingStatusDelivered:
      return "배송완료";
    case DomainPackingStatus.PackingStatusChangeRequested:
      return "변경요청";
    case DomainPackingStatus.PackingStatusCanceled:
      return "취소완료";
    default:
      return status;
  }
};

const PackingDetailGrid = memo(
  ({ packingDetails }: { packingDetails?: DtoPackingDetailDTO[] }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imagesMap, setImagesMap] = useState<
      Record<string, DtoGetReadPresignedURLResponse[]>
    >({});
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

    const { mutateAsync: getImages } = useMutation({
      mutationFn: (imagePaths: string[]) =>
        fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({ paths: imagePaths }),
        }).then((res) => res.json()),
    });

    useEffect(() => {
      const loadImages = async () => {
        const newImagesMap: Record<string, DtoGetReadPresignedURLResponse[]> =
          {};

        for (const detail of packingDetails || []) {
          if (detail.itemDetail?.length) {
            for (const item of detail.itemDetail) {
              if (item.images?.length) {
                const imageKey = `${detail.packingDetailID}-${item.itemName}`;

                // 이미 로드된 이미지나 로딩 중인 이미지는 건너뛰기
                if (imagesMap[imageKey] || loadingImages.has(imageKey)) {
                  newImagesMap[imageKey] = imagesMap[imageKey] || [];
                  continue;
                }

                setLoadingImages((prev) => new Set(prev).add(imageKey));

                try {
                  const response = await getImages(item.images);
                  const images = Array.isArray(response.data)
                    ? response.data
                    : [];
                  newImagesMap[imageKey] = images;
                } catch (error) {
                  console.error("이미지 로딩 실패:", error);
                  newImagesMap[imageKey] = [];
                } finally {
                  setLoadingImages((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(imageKey);
                    return newSet;
                  });
                }
              }
            }
          }
          if (detail.trackingInfo?.images?.length) {
            const trackingKey = `${detail.packingDetailID}-tracking`;

            // 이미 로드된 이미지나 로딩 중인 이미지는 건너뛰기
            if (imagesMap[trackingKey] || loadingImages.has(trackingKey)) {
              newImagesMap[trackingKey] = imagesMap[trackingKey] || [];
              continue;
            }

            setLoadingImages((prev) => new Set(prev).add(trackingKey));

            try {
              const response = await getImages(detail.trackingInfo.images);
              const images = Array.isArray(response.data) ? response.data : [];
              newImagesMap[trackingKey] = images;
            } catch (error) {
              console.error("트래킹 이미지 로딩 실패:", error);
              newImagesMap[trackingKey] = [];
            } finally {
              setLoadingImages((prev) => {
                const newSet = new Set(prev);
                newSet.delete(trackingKey);
                return newSet;
              });
            }
          }
        }

        setImagesMap((prev) => ({ ...prev, ...newImagesMap }));
      };

      loadImages();
    }, [packingDetails, getImages, imagesMap, loadingImages]);

    const detailRows: DetailRow[] =
      packingDetails?.flatMap((detail) => {
        if (!detail.itemDetail?.length) return [];
        return detail.itemDetail.map((item, index) => ({
          ...detail,
          itemDetail: item,
          showPackingDetailID: index === 0,
        }));
      }) || [];

    const detailColumns: Column<DetailRow>[] = [
      {
        key: "packingDetailID",
        name: "패킹 상세 ID",
        width: 200,
        renderCell({ row }) {
          return row.showPackingDetailID ? row.packingDetailID : "";
        },
      },
      {
        key: "itemDetail",
        name: "아이템 정보",
        width: 400,
        renderCell({ row }) {
          if (!row.itemDetail) return "-";
          return (
            <ItemContainer>
              <ItemRow>
                <ItemLabel>이름:</ItemLabel>
                <ItemValue>{row.itemDetail.itemName || "-"}</ItemValue>
              </ItemRow>
              <ItemRow>
                <ItemLabel>수량:</ItemLabel>
                <ItemValue>{row.itemDetail.quantity || "-"}</ItemValue>
              </ItemRow>
              <ItemRow>
                <ItemLabel>가격:</ItemLabel>
                <ItemValue>{row.itemDetail.price || "-"}</ItemValue>
              </ItemRow>
              <ItemRow>
                <ItemLabel>설명:</ItemLabel>
                <ItemValue>{row.itemDetail.description || "-"}</ItemValue>
              </ItemRow>
            </ItemContainer>
          );
        },
      },
      {
        key: "images",
        name: "이미지",
        width: 300,
        renderCell({ row }) {
          if (!row.itemDetail?.images?.length) return "-";

          const images =
            imagesMap[`${row.packingDetailID}-${row.itemDetail.itemName}`] ||
            [];
          if (!Array.isArray(images) || images.length === 0) return "-";

          return (
            <ImageContainer>
              {images.map(
                (image: DtoGetReadPresignedURLResponse, index: number) => (
                  <ItemImage
                    key={index}
                    src={image.readURL || ""}
                    alt={`${row.itemDetail?.itemName} 이미지 ${index + 1}`}
                    onClick={() => setSelectedImage(image.readURL || "")}
                  />
                )
              )}
            </ImageContainer>
          );
        },
      },
      {
        key: "trackingInfo",
        name: "운송 정보",
        width: 300,
        renderCell({ row }) {
          if (!row.trackingInfo) return "-";

          const images = imagesMap[`${row.packingDetailID}-tracking`] || [];
          if (!Array.isArray(images)) return "-";

          return (
            <div>
              <div>운송장 번호: {row.trackingInfo.trackingNumber || "-"}</div>
              <div>운송사: {row.trackingInfo.carrier || "-"}</div>
              <div>상태: {row.trackingInfo.trackingNumber || "-"}</div>
              <ImageContainer>
                {images.length > 0
                  ? images.map(
                      (
                        image: DtoGetReadPresignedURLResponse,
                        index: number
                      ) => (
                        <ItemImage
                          key={index}
                          src={image.readURL || ""}
                          alt="운송 이미지"
                          onClick={() => setSelectedImage(image.readURL || "")}
                        />
                      )
                    )
                  : "-"}
              </ImageContainer>
            </div>
          );
        },
      },
    ];

    return (
      <DetailContainer>
        <h3>팩킹 상세 정보</h3>
        <DataGrid
          columns={detailColumns}
          rows={detailRows}
          style={{ height: 350 }}
          rowKeyGetter={(row) =>
            `${row.packingDetailID}-${row.itemDetail?.itemName || ""}`
          }
          rowHeight={(row) => (row.itemDetail ? 160 : 45)}
        />
        {selectedImage && (
          <ImageModal onClick={() => setSelectedImage(null)}>
            <ModalImage src={selectedImage} alt="확대된 이미지" />
          </ImageModal>
        )}
      </DetailContainer>
    );
  }
);

PackingDetailGrid.displayName = "PackingDetailGrid";

const ListPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [packingStatus, setPackingStatus] = useState<DomainPackingStatus>(
    () => {
      const status = searchParams.get("status") as DomainPackingStatus;
      return status || DomainPackingStatus.PackingStatusAddingItems;
    }
  );
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] =
    useState<DomainPackingStatus | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    measuredWeight: "",
    shippingFee: "",
  });
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: "",
    trackingNumber: "",
  });

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const removeCommas = (value: string) => {
    return value.replace(/,/g, "");
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentStatus = params.get("status");

    // 현재 URL의 상태와 packingStatus가 다를 때만 URL 업데이트
    if (currentStatus !== packingStatus) {
      params.set("status", packingStatus);
      router.push(`?${params.toString()}`, { scroll: false }); // scroll: false로 스크롤 위치 유지
    }
  }, [packingStatus, router, searchParams]);

  const handleStatusChange = useCallback((status: DomainPackingStatus) => {
    setPackingStatus(status);
    setSelectedRows(new Set());
    setSelectAll(false);
  }, []);

  const handleStatusUpdate = useCallback(
    (newStatus: DomainPackingStatus) => {
      if (selectedRows.size === 0) {
        alert("업데이트할 팩킹을 선택해주세요.");
        return;
      }
      setSelectedNewStatus(newStatus);
      setShowConfirmModal(true);
    },
    [selectedRows.size]
  );

  const { data, isLoading } = useQuery<{
    ok: boolean;
    data: DtoListPackingResponse;
  }>({
    queryKey: ["packList", packingStatus],
    queryFn: () =>
      fetch(`/api/pack/list?packingStatus=${packingStatus}`).then((res) =>
        res.json()
      ),
    staleTime: 2 * 60 * 1000, // 2분으로 설정 (상태별로 다른 데이터이므로 적절한 시간)
    gcTime: 5 * 60 * 1000, // 5분으로 설정
    refetchOnWindowFocus: false, // 윈도우 포커스 시 리페치 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 리페치 비활성화
    retry: 2, // 재시도 횟수 감소
  });

  const { mutate: updatePackingStatus } = useMutation({
    mutationFn: async (newStatus: DomainPackingStatus) => {
      const response = await fetch("/api/pack/list", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          Array.from(selectedRows).map((id) => ({
            packingID: id,
            status: newStatus,
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("상태 업데이트에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packList"] });
      setSelectedRows(new Set());
      setSelectAll(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { mutate: updateShippingInfo } = useMutation({
    mutationFn: async () => {
      const selectedPacking = data?.data?.packings?.find(
        (packing) => packing.packingID === Array.from(selectedRows)[0]
      );

      const response = await fetch("/api/pack/shipping-inform", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            packingID: Array.from(selectedRows)[0],
            measuredWeight: shippingInfo.measuredWeight
              ? Number(shippingInfo.measuredWeight)
              : selectedPacking?.measuredWeight || undefined,
            shippingFee: shippingInfo.shippingFee
              ? Number(removeCommas(shippingInfo.shippingFee))
              : selectedPacking?.shippingFee || undefined,
            outboundTrackingInfo:
              selectedPacking?.outboundTrackingInfo || undefined,
          },
        ]),
      });
      if (!response.ok) {
        throw new Error("배송 정보 업데이트에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packList"] });
      setSelectedRows(new Set());
      setSelectAll(false);
      setShowShippingInfo(false);
      setShippingInfo({ measuredWeight: "", shippingFee: "" });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const { mutate: updateTrackingInfo } = useMutation({
    mutationFn: async () => {
      const selectedPacking = data?.data?.packings?.find(
        (packing) => packing.packingID === Array.from(selectedRows)[0]
      );

      const response = await fetch("/api/pack/shipping-inform", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            packingID: Array.from(selectedRows)[0],
            measuredWeight: selectedPacking?.measuredWeight || undefined,
            shippingFee: selectedPacking?.shippingFee || undefined,
            outboundTrackingInfo: {
              carrier: trackingInfo.carrier,
              trackingNumber: trackingInfo.trackingNumber,
            },
          },
        ]),
      });
      if (!response.ok) {
        throw new Error("운송장 정보 업데이트에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packList"] });
      setSelectedRows(new Set());
      setSelectAll(false);
      setShowTrackingInfo(false);
      setTrackingInfo({ carrier: "", trackingNumber: "" });
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const [rows, setRows] = useState<PackingRow[]>([]);

  useEffect(() => {
    if (data?.data?.packings) {
      const masterRows = data.data.packings.map((packing: DtoPackingDTO) => ({
        type: "MASTER" as const,
        packingID: packing.packingID,
        status: packing.status,
        shippingCountryCode: packing.shippingCountryCode,
        receiverName: packing.receiverInfo?.name || "-",
        receiverPhone: packing.receiverInfo?.phone || "-",
        receiverEmail: packing.receiverInfo?.email || "-",
        receiverAddress: packing.receiverInfo?.address
          ? `${packing.receiverInfo.address.address1} ${
              packing.receiverInfo.address.address2 || ""
            } ${packing.receiverInfo.address.city || ""} ${
              packing.receiverInfo.address.state || ""
            } ${packing.receiverInfo.address.postcode || ""} ${
              packing.receiverInfo.address.country || ""
            }`
          : "-",
        senderName: packing.senderInfo?.name || "-",
        senderPhone: packing.senderInfo?.phone || "-",
        senderEmail: packing.senderInfo?.email || "-",
        itemCount: packing.packingDetails?.length || 0,
        measuredWeight: packing.measuredWeight || null,
        outboundTrackingInfo: packing.outboundTrackingInfo
          ? {
              carrier: packing.outboundTrackingInfo.carrier || null,
              trackingNumber:
                packing.outboundTrackingInfo.trackingNumber || null,
            }
          : null,
        shippingFee: packing.shippingFee || null,
        expanded: false,
      }));
      setRows(masterRows);
    }
  }, [data]);

  const columns = useMemo<Column<PackingRow>[]>(
    () => [
      {
        key: "checkbox",
        name: "",
        width: 40,
        renderCell({ row }) {
          if (row.type === "DETAIL") return null;
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <input
                type="checkbox"
                checked={selectedRows.has(row.packingID)}
                onChange={(e) => {
                  const newSelectedRows = new Set(selectedRows);
                  if (e.target.checked) {
                    newSelectedRows.add(row.packingID);
                  } else {
                    newSelectedRows.delete(row.packingID);
                  }
                  setSelectedRows(newSelectedRows);
                }}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  margin: 0,
                }}
              />
            </div>
          );
        },
        renderHeaderCell() {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => {
                  const newSelectAll = e.target.checked;
                  setSelectAll(newSelectAll);
                  if (newSelectAll) {
                    const allPackingIds = rows
                      .filter((row) => row.type === "MASTER")
                      .map((row) => row.packingID);
                    setSelectedRows(new Set(allPackingIds));
                  } else {
                    setSelectedRows(new Set());
                  }
                }}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  margin: 0,
                }}
              />
            </div>
          );
        },
      },
      {
        key: "expanded",
        name: "",
        minWidth: 30,
        width: 30,
        colSpan(args: ColSpanArgs<PackingRow, unknown>) {
          return args.type === "ROW" && args.row.type === "DETAIL"
            ? 13
            : undefined;
        },
        cellClass(row: PackingRow) {
          return row.type === "DETAIL" ? "detail-cell" : undefined;
        },
        renderCell({
          row,
          onRowChange,
        }: {
          row: PackingRow;
          onRowChange: (row: PackingRow) => void;
        }) {
          if (row.type === "DETAIL") {
            const packing = data?.data?.packings?.find(
              (p) => p.packingID === row.packingID
            );
            return (
              <PackingDetailGrid packingDetails={packing?.packingDetails} />
            );
          }

          return (
            <button
              onClick={() => {
                onRowChange({ ...row, expanded: !row.expanded });
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              {row.expanded ? "▼" : "▶"}
            </button>
          );
        },
      },
      ...baseColumns,
    ],
    [data?.data?.packings, selectedRows, selectAll, rows]
  );

  const onRowsChange = (
    newRows: PackingRow[],
    { indexes }: { indexes: number[] }
  ) => {
    const row = newRows[indexes[0]];
    if (row.type === "MASTER") {
      if (row.expanded) {
        newRows.splice(indexes[0] + 1, 0, {
          type: "DETAIL",
          packingID: row.packingID,
          parentId: row.packingID,
        });
      } else {
        newRows.splice(indexes[0] + 1, 1);
      }
      setRows(newRows);
    }
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedNewStatus) {
      updatePackingStatus(selectedNewStatus);
      setShowConfirmModal(false);
      setShowStatusOptions(false);
      setSelectedNewStatus(null);
    }
  };

  const handleShippingInfoSubmit = () => {
    if (!shippingInfo.measuredWeight || !shippingInfo.shippingFee) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    updateShippingInfo();
  };

  const handleTrackingInfoSubmit = () => {
    if (!trackingInfo.carrier || !trackingInfo.trackingNumber) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    updateTrackingInfo();
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container>
      <StatusFilter>
        {Object.values(DomainPackingStatus).map((status) => (
          <StatusButton
            key={status}
            isActive={packingStatus === status}
            onClick={() => handleStatusChange(status)}
          >
            {convertStatus(status)}
          </StatusButton>
        ))}
        <div style={{ position: "relative" }}>
          <StatusChangeButton
            isDisabled={selectedRows.size === 0}
            onClick={() => {
              setShowStatusOptions(!showStatusOptions);
              setShowShippingInfo(false);
              setShowTrackingInfo(false);
            }}
          >
            상태 변경
          </StatusChangeButton>
          <StatusChangeButton
            isDisabled={selectedRows.size === 0}
            onClick={() => {
              setShowShippingInfo(!showShippingInfo);
              setShowStatusOptions(false);
              setShowTrackingInfo(false);
            }}
            style={{ marginLeft: "8px" }}
          >
            패킹정보 입력
          </StatusChangeButton>
          <StatusChangeButton
            isDisabled={selectedRows.size === 0}
            onClick={() => {
              setShowTrackingInfo(!showTrackingInfo);
              setShowStatusOptions(false);
              setShowShippingInfo(false);
            }}
            style={{ marginLeft: "8px" }}
          >
            운송장 정보 입력
          </StatusChangeButton>
          {showStatusOptions && selectedRows.size > 0 && (
            <StatusOptionsContainer>
              {Object.values(DomainPackingStatus)
                .filter((status) => status !== packingStatus)
                .map((status) => (
                  <StatusOptionButton
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                  >
                    <StatusOptionText>{convertStatus(status)}</StatusOptionText>
                    로 변경
                  </StatusOptionButton>
                ))}
            </StatusOptionsContainer>
          )}
          {showShippingInfo && selectedRows.size > 0 && (
            <ShippingInfoContainer>
              <InputGroup>
                <Label>무게 (kg)</Label>
                <Input
                  type="number"
                  value={shippingInfo.measuredWeight}
                  onChange={(e) =>
                    setShippingInfo((prev) => ({
                      ...prev,
                      measuredWeight: e.target.value,
                    }))
                  }
                  placeholder="무게를 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>배송비용 (원)</Label>
                <Input
                  type="text"
                  value={formatNumber(shippingInfo.shippingFee)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setShippingInfo((prev) => ({
                      ...prev,
                      shippingFee: value,
                    }));
                  }}
                  placeholder="배송비용을 입력하세요"
                />
              </InputGroup>
              <ButtonGroup>
                <CancelButton onClick={() => setShowShippingInfo(false)}>
                  취소
                </CancelButton>
                <ConfirmButton onClick={handleShippingInfoSubmit}>
                  저장
                </ConfirmButton>
              </ButtonGroup>
            </ShippingInfoContainer>
          )}
          {showTrackingInfo && selectedRows.size > 0 && (
            <ShippingInfoContainer>
              <InputGroup>
                <Label>택배사</Label>
                <Input
                  type="text"
                  value={trackingInfo.carrier}
                  onChange={(e) =>
                    setTrackingInfo((prev) => ({
                      ...prev,
                      carrier: e.target.value,
                    }))
                  }
                  placeholder="택배사를 입력하세요"
                />
              </InputGroup>
              <InputGroup>
                <Label>운송장 번호</Label>
                <Input
                  type="text"
                  value={trackingInfo.trackingNumber}
                  onChange={(e) =>
                    setTrackingInfo((prev) => ({
                      ...prev,
                      trackingNumber: e.target.value,
                    }))
                  }
                  placeholder="운송장 번호를 입력하세요"
                />
              </InputGroup>
              <ButtonGroup>
                <CancelButton onClick={() => setShowTrackingInfo(false)}>
                  취소
                </CancelButton>
                <ConfirmButton onClick={handleTrackingInfoSubmit}>
                  저장
                </ConfirmButton>
              </ButtonGroup>
            </ShippingInfoContainer>
          )}
        </div>
      </StatusFilter>
      {showConfirmModal && selectedNewStatus && (
        <ConfirmModal>
          <ConfirmModalContent>
            <h3>상태 변경 확인</h3>
            <p>
              선택한 {selectedRows.size}개의 팩킹을{" "}
              <RedText>{convertStatus(selectedNewStatus)}</RedText> 상태로
              변경하시겠습니까?
            </p>
            <ConfirmModalButtons>
              <CancelButton onClick={() => setShowConfirmModal(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={handleConfirmStatusUpdate}>
                확인
              </ConfirmButton>
            </ConfirmModalButtons>
          </ConfirmModalContent>
        </ConfirmModal>
      )}
      <DataGrid
        columns={columns}
        rows={rows}
        style={{ height: "calc(100vh - 100px)" }}
        onRowsChange={onRowsChange}
        rowKeyGetter={(row) => `${row.type}-${row.packingID}`}
        headerRowHeight={45}
        rowHeight={(row) => (row.type === "DETAIL" ? 400 : 45)}
        enableVirtualization={true}
      />
    </Container>
  );
};

const ListPage = () => {
  const [auth] = useAtom(authAtom);
  const [, checkAuth] = useAtom(checkAuthAtom);
  const router = useRouter();

  useEffect(() => {
    // 인증 체크가 완료되지 않은 경우에만 체크 실행
    if (!auth.isChecked) {
      checkAuth();
    }
  }, [checkAuth, auth.isChecked]);

  useEffect(() => {
    if (!auth.isLoading && !auth.isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push("/login");
    }
  }, [auth.isLoading, auth.isLoggedIn, router]);

  if (auth.isLoading) {
    return (
      <Layout>
        <Container>
          <LoadingContent>
            <LoadingSpinner />
            <LoadingText>인증 확인 중...</LoadingText>
          </LoadingContent>
        </Container>
      </Layout>
    );
  }

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <Layout>
      <Suspense fallback={<div>로딩 중...</div>}>
        <ListPageContent />
      </Suspense>
    </Layout>
  );
};

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

ListPage.displayName = "ListPage";

export default memo(ListPage);
