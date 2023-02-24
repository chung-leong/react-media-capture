class VolumeMonitor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.volume = undefined;
  }

  process(inputs, outputs, parameters) {   
    const rootMeanSquares = [];
    for (const channel of inputs) {
      let sum = 0, count = 0;
      for (const buffer of channel) {
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
          count++;
        }
      }
      const average = sum / count;   
      let sumMeanSquare = 0;
      for (const buffer of channel) {
        for (let i = 0; i < buffer.length; i++) {
          sumMeanSquare += Math.pow(buffer[i] - average, 2);
        }
      }
      const averageMeanSquare = sumMeanSquare / count;
      rootMeanSquares.push(Math.sqrt(averageMeanSquare));
    }
    if (rootMeanSquares.length > 0) {
      const maxRMS = Math.max(...rootMeanSquares);
      const volume = Math.round(maxRMS * 100);
      if (volume !== this.volume) {
        this.port.postMessage({ volume });
        this.volume = volume;
      }  
    }
    return true;
  }
};

registerProcessor('volume-monitor', VolumeMonitor);