import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";

interface PrescriptionBodyProps {
  data?: any;
  setData?: (data: any) => void;
}

const PrescriptionBody = ({ data, setData }: PrescriptionBodyProps) => {
  const [leftWidth, setLeftWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const container = e.currentTarget.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const offsetX = e.clientX - containerRect.left;
    const newLeftWidth = (offsetX / containerRect.width) * 100;

    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexGrow: 1,
        overflow: "visible",
        position: "relative",
        cursor: isDragging ? "col-resize" : "default",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <LeftColumn width={leftWidth} data={data} setData={setData} />

      <div
        onMouseDown={handleMouseDown}
        className="no-print"
        style={{
          width: "5px",
          cursor: "col-resize",
          backgroundColor: "#ccc",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      />

      <RightColumn width={100 - leftWidth} data={data} setData={setData} />
    </div>
  );
};

export default PrescriptionBody;
