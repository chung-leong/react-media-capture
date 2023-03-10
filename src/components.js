import { useRef, useEffect, createElement } from 'react';

export function BlobAudio(props) {
  const { srcObject, ...remaining } = props;
  const ref = useBlobURL(srcObject);
  return createElement('audio', { ref, ...remaining });
}

export function BlobImage(props) {
  const { srcObject, ...remaining } = props;
  const ref = useBlobURL(srcObject);
  return createElement('img', { ref, ...remaining });
}

export function BlobVideo(props) {
  const { srcObject, ...remaining } = props;
  const ref = useBlobURL(srcObject);
  return createElement('video', { ref, ...remaining });
}

export function StreamVideo(props) {
  const { srcObject, ...remaining } = props;
  const ref = useRef();
  useEffect(() => {
    // don't assume that we'll get a node since Test Renderer does not 
    // give us one
    const video = ref.current;    
    if (video && video.srcObject !== srcObject) {
      video.srcObject = srcObject;
      if (srcObject) {
        video.play();
      } 
    }
  }, [ srcObject ]);
  return createElement('video', { ref, playsInline: true, ...remaining });
}

function useBlobURL(srcObject) {
  const ref = useRef();
  useEffect(() => {
    const node = ref.current;
    if (node) {
      const url = (srcObject) ? URL.createObjectURL(srcObject) : undefined;
      node.src = url;
      return (srcObject) ? () => URL.revokeObjectURL(url) : undefined;
    }
  }, [ srcObject ]);
  return ref;
}