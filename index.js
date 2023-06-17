import styles from "../../src/styles/Drummachine.module.css";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import DrumGrid from "./DrumGrid";
import Slider from './Slider';
import ChannelsArea from "./ChannelsArea";
import TopArea from "./TopArea";

const INTERVAL = 0.15;
const CHANNEL_COUNT = 8;
const BEAT_COUNT = 16;
const drumHitFiles = [
  {name: "Kick 1", path: "/drum_hits/kick1.mp3"},
  {name: "Kick 2", path: "/drum_hits/kick2.mp3"},
  {name: "Snare 1", path: "/drum_hits/snare1.mp3"},
  {name: "Snare 2", path: "/drum_hits/snare2.mp3"},
  {name: "Tom 1", path: "/drum_hits/tom1.mp3"},
  {name: "Tom 2", path: "/drum_hits/tom2.mp3"},
  {name: "Hat 1", path: "/drum_hits/hh1.mp3"},
  {name: "Hat 2", path: "/drum_hits/hh2.mp3"},
];

export default function DrumMachine () {
  const audioContext = useRef(null);
  // const channels = useRef(null);
  const [channels, setChannels] = useState(
      Array.from({ length: CHANNEL_COUNT }, () => ({
        name: "no name",
        buffer: null,
      })
    ));
  const audioTimer = useRef(null);
  const mainContainerRef = useRef(null);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [soloTrack, setSoloTrack] = useState(-1);
  const [selectedAutomationChannel, setSelectedAutomationChannel] = useState("volume");
  const [loopPlaying, setLoopPlaying] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseCoord, setMouseCoord] = useState({x: 0, y: 0});
  const [pattern, setPattern] = useState(
    Array.from({ length: CHANNEL_COUNT }, () => (
      Array.from({ length: BEAT_COUNT }, () => ({
        on: false,
        volume: 50,
        pan: 50,
        filter: 100,  //  low pass from 0 to 100
        pitch: 0  //  -12 to 12
      })))));
  const [currentBeat, setCurrentBeat] = useState(0);

  async function assignFileToChannel(drumHitName){
    const hit = drumHitFiles.find(h => h.name === drumHitName);
    if (!hit){
      throw new Error("No such file");
    }
    const response = await fetch(hit.path);
    const arrayBuffer = await response.arrayBuffer();
    const decodedAudio = await audioContext.current.decodeAudioData(arrayBuffer);
    return {
      name: hit.name,
      buffer: decodedAudio,
      muted: false
    }
  }

  //  setup audioContext and audioBuffer
  useEffect(() => {
    const runAsync = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext.current = new AudioContext();

        const tempChannels = [...channels];

        tempChannels[0] = await assignFileToChannel("Tom 2");
        tempChannels[1] = await assignFileToChannel("Tom 1");
        tempChannels[2] = await assignFileToChannel("Hat 2");
        tempChannels[3] = await assignFileToChannel("Hat 1");
        tempChannels[4] = await assignFileToChannel("Snare 2");
        tempChannels[5] = await assignFileToChannel("Snare 1");
        tempChannels[6] = await assignFileToChannel("Kick 2");
        tempChannels[7] = await assignFileToChannel("Kick 1");

        setChannels(tempChannels);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    runAsync();

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
        setChannels(null);
      }
    }
  }, []);

  //  play next beat
  useEffect(() => {
    let source = Array.from({ length: CHANNEL_COUNT }, () => null);

    function playSingleHit(i){
      // create the buffer
      source[i] = audioContext.current.createBufferSource();
      source[i].buffer = channels[i].buffer;
      let pbRate = pattern[i][currentBeat].pitch;  //  semitones from -50 to 50
      pbRate = Math.pow(2, pbRate / 12);
      source[i].playbackRate.value = pbRate;

      // create low pass filter node
      const filterNode = audioContext.current.createBiquadFilter();
      filterNode.type = 'lowpass';
      // filterNode.gain.setValueAtTime(1000, audioContext.current.currentTime);
      // you can use filterNode.frequency.exponentialRampToValueAtTime
      // filterNode.frequency.setValueAtTime(20000, audioContext.current.currentTime);
      filterNode.frequency.value = Math.pow(pattern[i][currentBeat].filter / 100, 2) * 10000 + 50;   // hz

      // create pan node
      const panNode = audioContext.current.createStereoPanner();
      panNode.pan.value = pattern[i][currentBeat].pan / 50 - 1;

      // create gain node
      const gainNode = audioContext.current.createGain();
      gainNode.gain.value = pattern[i][currentBeat].volume / 100;

      // connect all the nodes
      //  source -> filter -> pan -> gain -> destination

      source[i].connect(filterNode);
      filterNode.connect(panNode);
      panNode.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      source[i].start(audioTimer.current, 0, INTERVAL);
    }

    if (loopPlaying) {
      for (let i = 0; i < source.length; i++) {
        if (
          (soloTrack === -1 || 7 - i === soloTrack) && 
          (!channels[7 - i].muted)){
          if (pattern[i][currentBeat].on) {
            playSingleHit(i);
          }  

        }
      }
    }

  }, [currentBeat, loopPlaying]);


  //  start stop loop playback
  useEffect(() => {
    audioTimer.current = audioContext.current.currentTime;

    if (loopPlaying) {
      audioContext.current.resume();   
    }

    const incrementBeat = () => {
      setCurrentBeat(prev => prev < BEAT_COUNT - 1 ? prev + 1 : 0);
    }

    if (loopPlaying) {
      audioContext.current.resume();

      if (currentBeat !== 0){
        setCurrentBeat(0);
      }
      const intervalId = setInterval(incrementBeat, INTERVAL * 1000);

      return () => clearInterval(intervalId);
    }
  }, [loopPlaying]);


  return (
    <div 
      className={styles["main-container"]}
      ref={mainContainerRef}
      onMouseDown={(e) => {
        setIsMouseDown(true);
        const rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        setMouseCoord({x, y});
      }}
      onMouseUp={()=> setIsMouseDown(false)}
      onMouseMove={(e) => {
        if (isMouseDown){
          const rect = e.currentTarget.getBoundingClientRect();
          let x = e.clientX - rect.left;
          let y = e.clientY - rect.top;
          setMouseCoord({x, y});
        }
      }}
      >

      <TopArea 
        setCurrentBeat={setCurrentBeat}
        drumHitFiles={drumHitFiles}
        channels={channels}
        setChannels={setChannels}
        assignFileToChannel={assignFileToChannel}
        selectedTrack={selectedTrack} 
        loopPlaying={loopPlaying}
        setLoopPlaying={setLoopPlaying}
      />

      <ChannelsArea
        channels={channels}
        setChannels={setChannels}
        soloTrack={soloTrack}
        setSoloTrack={setSoloTrack}
        selectedTrack={selectedTrack}
        setSelectedTrack={setSelectedTrack}/>

      <DrumGrid 
        loopPlaying={loopPlaying}
        currentBeat={currentBeat}
        pattern={pattern}
        setPattern={setPattern}
        setSelectedTrack={setSelectedTrack}/>

      <div className={styles["automation-channels-area"]}>
        {["volume", "pan", "filter", "pitch"].map(key => (
          <div 
            key={key}
            className={styles["track-name"]}
            style={{
              marginBottom: "2px",
              backgroundColor: selectedAutomationChannel === key ? "#00FFFF40" : "#FFFFFF20", }}  
            onClick={() => setSelectedAutomationChannel(key)}
            ><p style={{marginLeft: "10px", marginTop: "7px", pointerEvents: "none"}}>{key}</p>
          </div>
        ))}
      </div>

      <div className={styles["automation-sliders-area"]}>
        {pattern[selectedTrack].map((cell, sliderIndex) => (
          <Slider
            key={sliderIndex}
            isMouseDown={isMouseDown}
            mouseCoord={mouseCoord}
            cell={cell}
            pattern={pattern}
            setPattern={setPattern}
            sliderIndex={sliderIndex}
            selectedTrack={selectedTrack}
            selectedAutomationChannel={selectedAutomationChannel}
            mainContainerRef={mainContainerRef}/>
        ))}
      </div>

      {/* <h1>selected track {selectedTrack}</h1> */}
      
    </div>)
}


