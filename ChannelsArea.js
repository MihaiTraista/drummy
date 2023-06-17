import styles from "../../src/styles/Drummachine.module.css";

export default function ChannelsArea({ channels, setChannels, selectedTrack, setSelectedTrack, soloTrack, setSoloTrack }){
  return (
    <div className={styles["channels-area"]}>
      {channels && channels.map((channel, channelIndex) => (
        <div
          key={channelIndex}
          className={styles["track-name"]}>
          <button 
            onClick={() => setSelectedTrack(channelIndex)}
            style={{
            backgroundColor: "#00000000",
            height: "50px",
            minWidth: "100px",
            textAlign: "left",
            borderRadius: "0",
            margin: "0",
            backgroundColor: channelIndex === selectedTrack ? "#00FFFF40" : "#FFFFFF00", }}>
              {channel.name}
          </button>

          <div style={{marginRight: "6px"}}>
            <button 
              className={styles["one-letter-buttons"]}
              style={{backgroundColor: channels[7 - channelIndex]?.muted ? "red" : "#444"}}
              onClick={() => {
                const tempChannels = [...channels];
                tempChannels[7 - channelIndex].muted = !tempChannels[7 - channelIndex].muted;
                setChannels(tempChannels);
              }}
              >M</button>
            <button
              className={styles["one-letter-buttons"]}
              style={{backgroundColor: 7 - channelIndex === soloTrack ? "green" : "#444"}}
              onClick={() => {
                setSoloTrack(prev => prev === -1 ? 7 - channelIndex : prev === 7 - channelIndex ? -1 : 7 - channelIndex);
              }}
              >S</button>
          </div>

        </div>))}
    </div>
  )
}