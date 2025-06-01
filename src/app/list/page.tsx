"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
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

const StatusOptionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: #f5f5f5;
  }
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

const PackingDetailGrid = memo(
  ({ packingDetails }: { packingDetails?: DtoPackingDetailDTO[] }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imagesMap, setImagesMap] = useState<
      Record<string, DtoGetReadPresignedURLResponse[]>
    >({});

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
                try {
                  const response = await getImages(item.images);
                  const images = Array.isArray(response.data)
                    ? response.data
                    : [];
                  newImagesMap[`${detail.packingDetailID}-${item.itemName}`] =
                    images;
                } catch (error) {
                  console.error("이미지 로딩 실패:", error);
                  newImagesMap[`${detail.packingDetailID}-${item.itemName}`] =
                    [];
                }
              }
            }
          }
          if (detail.trackingInfo?.images?.length) {
            try {
              const response = await getImages(detail.trackingInfo.images);
              const images = Array.isArray(response.data) ? response.data : [];
              newImagesMap[`${detail.packingDetailID}-tracking`] = images;
            } catch (error) {
              console.error("트래킹 이미지 로딩 실패:", error);
              newImagesMap[`${detail.packingDetailID}-tracking`] = [];
            }
          }
        }

        setImagesMap(newImagesMap);
      };

      loadImages();
    }, [packingDetails, getImages]);

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
          rowHeight={(row) => (row.itemDetail ? 120 : 45)}
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

const ListPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [packingStatus, setPackingStatus] = useState<DomainPackingStatus>(
    () => {
      const status = searchParams.get("status") as DomainPackingStatus;
      return status || DomainPackingStatus.PackingStatusPending;
    }
  );
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] =
    useState<DomainPackingStatus | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", packingStatus);
    router.push(`?${params.toString()}`);
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
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
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
            {status}
          </StatusButton>
        ))}
        <div style={{ position: "relative" }}>
          <StatusChangeButton
            isDisabled={selectedRows.size === 0}
            onClick={() => setShowStatusOptions(!showStatusOptions)}
          >
            상태 변경
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
                    {status}로 변경
                  </StatusOptionButton>
                ))}
            </StatusOptionsContainer>
          )}
        </div>
      </StatusFilter>
      {showConfirmModal && selectedNewStatus && (
        <ConfirmModal>
          <ConfirmModalContent>
            <h3>상태 변경 확인</h3>
            <p>
              선택한 {selectedRows.size}개의 팩킹을 {selectedNewStatus} 상태로
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

ListPage.displayName = "ListPage";

export default memo(ListPage);
