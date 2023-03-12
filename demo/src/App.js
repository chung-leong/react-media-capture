import './css/App.css';
import { useState, useCallback } from 'react';
import VideoDialogBox from './VideoDialogBox.js';
import PhotoDialogBox from './PhotoDialogBox.js';
import AudioDialogBox from './AudioDialogBox.js';
import ErrorBoundary from './ErrorBoundary.js';

export default function App() {
  const [ selection, setSelection ] = useState(null);
  const onClose = useCallback(() => setSelection(), []);
  const onCapture = useCallback(async (result) => {
    console.log(result);
    setSelection();
    const ext = { video: '.webm', audio: '.webm', photo: '.jpg' }[selection];
    const suggestedName = new Date().toISOString().slice(0, -5) + ext;
    const { blob } = result;
    const accept = {};
    const mimeType = blob.type.split(';')[0];
    accept[mimeType] = ext;
    const file = await window.showSaveFilePicker({ suggestedName, types: [ { accept } ] });
    const stream = await file.createWritable();
    await stream.write(blob);
    await stream.close();
  }, [ selection ]);
  return (
    <div>
      <div>
        <ul className="list">
          <li><button onClick={() => setSelection('video')}>VideoDialogBox</button></li>
          <li><button onClick={() => setSelection('photo')}>PhotoDialogBox</button></li>
          <li><button onClick={() => setSelection('audio')}>AudioDialogBox</button></li>
        </ul>
      </div>
      <ErrorBoundary>
      {(() => {
        switch(selection) {
          case 'video':
            return <VideoDialogBox onClose={onClose} onCapture={onCapture} />;
          case 'photo':
            return <PhotoDialogBox onClose={onClose} onCapture={onCapture} />;
          case 'audio':
            return <AudioDialogBox onClose={onClose} onCapture={onCapture} />;
          default:
        }
      })()}
      </ErrorBoundary>
    </div>
  );
}
