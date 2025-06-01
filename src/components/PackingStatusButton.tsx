import styled from "@emotion/styled";
import { DomainPackingStatus } from "../postfly-api-types";

interface PackingStatusButtonProps {
  currentStatus: DomainPackingStatus;
  onStatusChange: (newStatus: DomainPackingStatus) => void;
  disabled?: boolean;
}

const StatusButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid ${({ isActive }) => (isActive ? "#007AFF" : "#E5E5EA")};
  background-color: ${({ isActive }) => (isActive ? "#007AFF" : "#FFFFFF")};
  color: ${({ isActive }) => (isActive ? "#FFFFFF" : "#000000")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ isActive }) => (isActive ? "#0066CC" : "#F2F2F7")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const PackingStatusButton = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}: PackingStatusButtonProps) => {
  const handleStatusChange = (newStatus: DomainPackingStatus) => {
    onStatusChange(newStatus);
  };

  return (
    <ButtonGroup>
      <StatusButton
        isActive={currentStatus === DomainPackingStatus.PackingStatusCreated}
        onClick={() =>
          handleStatusChange(DomainPackingStatus.PackingStatusCreated)
        }
        disabled={disabled}
        aria-label="생성됨 상태로 변경"
      >
        생성됨
      </StatusButton>
      <StatusButton
        isActive={currentStatus === DomainPackingStatus.PackingStatusPending}
        onClick={() =>
          handleStatusChange(DomainPackingStatus.PackingStatusPending)
        }
        disabled={disabled}
        aria-label="요청됨 상태로 변경"
      >
        요청됨
      </StatusButton>
      <StatusButton
        isActive={currentStatus === DomainPackingStatus.PackingStatusInTransit}
        onClick={() =>
          handleStatusChange(DomainPackingStatus.PackingStatusInTransit)
        }
        disabled={disabled}
        aria-label="운송중 상태로 변경"
      >
        운송중
      </StatusButton>
      <StatusButton
        isActive={currentStatus === DomainPackingStatus.PackingStatusDelivered}
        onClick={() =>
          handleStatusChange(DomainPackingStatus.PackingStatusDelivered)
        }
        disabled={disabled}
        aria-label="배송완료 상태로 변경"
      >
        배송완료
      </StatusButton>
    </ButtonGroup>
  );
};

export default PackingStatusButton;
