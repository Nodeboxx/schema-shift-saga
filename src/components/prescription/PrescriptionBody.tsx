import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";

const PrescriptionBody = () => {
  const [leftWidth, setLeftWidth] = useState(40);

  return (
    <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
      <LeftColumn width={leftWidth} />
      <div
        style={{
          width: "5px",
          background: "#ddd",
          cursor: "col-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = leftWidth;

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(20, Math.min(60, startWidth + (delta / 800) * 100));
            setLeftWidth(newWidth);
          };

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />
      <RightColumn width={100 - leftWidth} />
    </div>
  );
};

export default PrescriptionBody;
