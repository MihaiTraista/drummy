import { useEffect, useRef, useState } from "react"
import styles from "../../src/styles/Drummachine.module.css";
import { motion } from "framer-motion";

export default function Slider ({ isMouseDown, mouseCoord, mainContainerRef, pattern, setPattern, sliderIndex, selectedTrack, cell, selectedAutomationChannel }){
  const [level, setLevel] = useState(cell[selectedAutomationChannel]);  // range 0 to 99
  const [mouseClickedOnSlider, setMouseClickedOnSlider] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => setLevel(cell[selectedAutomationChannel]), [cell, selectedAutomationChannel]);

  //  setMouseClickedOnSlider()
  useEffect(() => {
    if (!isMouseDown){
      setMouseClickedOnSlider(false);
    } else {
      const parentRect = mainContainerRef.current.getBoundingClientRect();
      const childRect = sliderRef.current.getBoundingClientRect();
  
      const relativePosition = {
        x: childRect.left - parentRect.left,
        y: childRect.top - parentRect.top,
      };
  
      let x = mouseCoord.x - relativePosition.x;
      let y = mouseCoord.y - relativePosition.y;
      if (y >= 0 && y <= 200 && x >= 0 && x <= 50){
        setMouseClickedOnSlider(true);
      }
    }
  }, [isMouseDown, mouseCoord]);

  useEffect(() => {
    if (mouseClickedOnSlider){
      const parentRect = mainContainerRef.current.getBoundingClientRect();
      const childRect = sliderRef.current.getBoundingClientRect();
  
      const relativePosition = {
        x: childRect.left - parentRect.left,
        y: childRect.top - parentRect.top,
      };
  
      let x = mouseCoord.x - relativePosition.x;
      let y = mouseCoord.y - relativePosition.y;
      y = parseInt((200 - y) / 2);
      y = Math.max(0, Math.min(y, 100));
      if (selectedAutomationChannel === "pitch"){
        y /= 4.1666;
        y -= 12;
        y = parseInt(y);
      }
      const tempPattern = JSON.parse(JSON.stringify(pattern));

      tempPattern[selectedTrack][sliderIndex][selectedAutomationChannel] = y;
      setPattern(tempPattern);
      setLevel(y);
    }
  }, [mouseCoord])
  
  return (
    <div
      ref={sliderRef}>
      {selectedAutomationChannel === "pitch"
      ? 
      <div
        style={{
          width: "50px",
          height: "200px",
          backgroundColor: "#162222",
          borderRadius: "10px",
          position: "relative",
          overflow: "hidden",
        }}>
        <div style={{
          position: "absolute",
          backgroundColor: cell.on ? "orange" : "#253030",
          width: "50px",
          minHeight: "0",
          height: `${level >= 0 ? (level * 8.333) : (Math.abs(level) * 8.333)}px`,
          top: `${level >= 0 ? (100 - (level * 8.333)) : 100}px`,
          left: "0",
          pointerEvents: "none",
        }}></div>
        <div style={{
          position: "absolute",
          width: "50px",
          height: "1px",
          backgroundColor: "orange",
          top: "100px"
        }}></div>
        <p style={{
          position: "absolute",
          textAlign: "center",
          width: "50px",
          userSelect: "none",
          pointerEvents: "none",
          color: "#777"
        }}>{level}</p>
      </div>
      :
      <div
        style={{
          width: "50px",
          height: "200px",
          backgroundColor: "#162222",
          borderRadius: "10px",
          position: "relative",
          overflow: "hidden",
        }}>
        <div style={{
          position: "absolute",
          backgroundColor: cell.on ? "orange" : "#253030",
          width: "50px",
          height: `${level * 2}px`,
          top: `${200 - level * 2}px`,
          left: "0",
          pointerEvents: "none",
        }}>
        </div>
      </div>}
    </div>
  )
}