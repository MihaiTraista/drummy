import styles from "../../src/styles/Drummachine.module.css";
import { motion } from "framer-motion";

export default function DrumGrid({ pattern, setPattern, setSelectedTrack, currentBeat, loopPlaying }){
  return (
    <div style={{position: "relative"}}>
      <div
        className={styles["playbar"]}
        style={{
          left: currentBeat * 52 + 2,
          backgroundColor: loopPlaying ? "#FFCC0040" : "#FFFFFF00",
        }}>
      </div>

      <table className={styles["drum-grid"]}>
        <tbody>
          {pattern.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <motion.td
                  animate={{
                    scale: loopPlaying && cellIndex === currentBeat && cell.on ? [1.2, 1, 1] : 1.0,
                  }}
                  transition={{
                    duration: 0.5,
                    times: [0, 0.5, 1]
                  }}
                  key={cellIndex}
                  style={{
                    width: "50px",
                    height: "50px",
                    // margin: "10px",
                    backgroundColor: cell.on ? "orange" : cellIndex % 4 === 0 ? "#384444" : "#162222",
                    borderRadius: "10px",
                    gridRow: `${rowIndex + 1} / span 1`,
                    gridColumn: `${cellIndex + 1} / span 1`,
                  }}
                  onClick={() => {
                    setSelectedTrack(rowIndex);
                    setPattern(prev => {
                      const tempPattern = JSON.parse(JSON.stringify(pattern));
                      tempPattern[rowIndex][cellIndex].on = !tempPattern[rowIndex][cellIndex].on;
                      return tempPattern;
                    })}}>
                </motion.td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}