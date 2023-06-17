import styles from "../../src/styles/Drummachine.module.css";

export default function TopArea({ selectedTrack, loopPlaying, setLoopPlaying, drumHitFiles, assignFileToChannel, channels, setChannels, setCurrentBeat }){
  return (channels &&
    <div className={styles["top-area"]}>

      <p className={styles["text-track-no"]}>Track {8 - selectedTrack}</p>

      <select
        value={channels[selectedTrack]?.name}
        style={{width: "140px", height: "50px", backgroundColor: "#253030"}}
        onChange={ async (e) => {
          const name = e.target.value;
          // console.log("changed", name);
          const tempChannels = [...channels];
          tempChannels[selectedTrack] = await assignFileToChannel(name);
          setChannels(tempChannels);
        }}>

        {drumHitFiles.map((file, fileIndex) => <option 
            key={fileIndex}
            value={file.name}>{file.name}
          </option>)}                
      </select>

      <button 
        onClick={() => {
          setLoopPlaying(prev => !prev);
          setCurrentBeat(0);
        }}
        style={{
          fontFamily: "cubano",
          minWidth: "80px",
          backgroundColor: loopPlaying ? "green" : "orange",
          }}>{loopPlaying ? "Stop" : "Play"}
      </button>

      <p className={styles["drummy-text"]}>Drummy</p>

    </div>
  );
}