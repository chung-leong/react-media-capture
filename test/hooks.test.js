import { expect } from 'chai';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';
import { withFakeDOM } from './fake-dom.js';

import {
  useMediaCapture,
} from '../index.js';

describe('Hooks', function() {
  describe('#useMediaCapture', function() {
    it('should not throw error when there is not DOM', async function() {
      await withTestRenderer(async ({ render }) => {
        let state;
        function Test() {
          state = useMediaCapture({
            video: true,
          });
          return null;
        }
        const el = createElement(Test);
        await render(el);
      });
    })
    it('should fail to get a stream when there are not devices', async function() {
      await withFakeDOM(async () => {
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError } = state;
          expect(status).to.equal('denied');
          expect(lastError).to.be.an('error');
        });
      });      
    })
    it('should acquire device when it gets added', async function() {
      await withFakeDOM(async () => {
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError } = state;
          expect(status).to.equal('denied');
          expect(lastError).to.be.an('error');
          navigator.mediaDevices.addDevice({
            deviceId: '007',
            groupId: '007',
            kind: 'videoinput',
            label: 'Spy camera',
          });
          await delay(10);
          const { status: status2, devices } = state;
          expect(status2).to.equal('previewing');
          expect(devices).to.have.lengthOf(1);  
        });
      });      
    })
    it('should reach the state of previewing when there is a device', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
          expect(liveVideo).to.be.an('object');
          expect(liveVideo.width).to.be.at.least(100);
          expect(liveVideo.height).to.be.at.least(100);
        });
      });
    })
    it('should fail when device is defective', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
          defective: true,
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveVideo } = state;
          expect(status).to.equal('denied');
          expect(lastError).to.be.an('error').with.property('message', 'Device is defective');
        });
      });
    })
    it('should be able to get a stream even if browser does not give list of devices', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        navigator.mediaDevices.hideDevices = true;
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
          expect(liveVideo).to.be.an('object');
          expect(liveVideo.width).to.be.at.least(100);
          expect(liveVideo.height).to.be.at.least(100);
        });
      });
    })

    it('should choose newly added device during previewing', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              selectNewDevice: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
          expect(liveVideo).to.be.an('object');
          navigator.mediaDevices.addDevice({
            deviceId: '008',
            groupId: '008',
            kind: 'videoinput',
            label: 'Spectre vision',
          });
          await delay(10);
          const { selectedDeviceId } = state;
          expect(selectedDeviceId).to.equal('008');
        });
      });
    })
    it('should stick with current device when selectNewDevice is false', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              selectNewDevice: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
          expect(liveVideo).to.be.an('object');
          navigator.mediaDevices.addDevice({
            deviceId: '008',
            groupId: '008',
            kind: 'videoinput',
            label: 'Spectre vision',
          });
          await delay(10);
          const { selectedDeviceId } = state;
          expect(selectedDeviceId).to.equal('007');
        });
      });
    })
    it('should obtain audio stream', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'audioinput',
          label: 'Spy microphone',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              audio: true,
              video: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, liveAudio } = state;
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
          expect(liveAudio).to.be.an('object');
        });
      });
    })
    it('should produce empty device list if enumerateDevices throws', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.devices = null;
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError, devices } = state;
          expect(devices).to.eql([]);
          expect(status).to.equal('denied');
          expect(lastError).to.be.an('error');
        });
      });
    })
    it('should request device matching preferredDevice', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00001-1',
          groupId: '00001',
          kind: 'videoinput',
          label: 'Back facing camera',
        });
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
              preferredDevice: 'front',
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, lastError, devices, selectedDeviceId } = state;
          expect(liveVideo).to.not.be.undefined;
          const { stream } = liveVideo;
          const [ track ] = stream.getTracks();
          expect(devices).to.have.lengthOf(2);
          expect(track.device).to.have.property('deviceId', '00002-1');
          expect(selectedDeviceId).to.equal('00002-1');
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
        });
      });
    })
    it('should request device matching preferredDevice', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00001-1',
          groupId: '00001',
          kind: 'videoinput',
          label: 'Back facing camera',
        });
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
              preferredDevice: 'front',
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, devices, selectDevice, selectedDeviceId } = state;
          expect(liveVideo).to.not.be.undefined;
          const { stream } = liveVideo;
          const [ track ] = stream.getTracks();
          expect(devices).to.have.lengthOf(2);
          expect(track.device).to.have.property('deviceId', '00002-1');
          expect(selectedDeviceId).to.equal('00002-1');
          expect(status).to.equal('previewing');
          selectDevice('00001-1');
          await delay(10);
          const { liveVideo: videoAfter, selectedDeviceId: idAfter } = state;
          expect(videoAfter).to.not.equal(liveVideo);
          expect(idAfter).to.equal('00001-1');
        });
      });
    })
    it('should start recording when record is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { status: status2 } = state;
          expect(status2).to.equal('recording');
          await delay(10);
          stop();
        });
      });
    })
    it('should return to previewing when nothing is recorded', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          await delay(10);
          stop();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('previewing');
        });
      });
    })
    it('should proceed to recorded when something is recorded', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          stop();
          await delay(10);
          const { status: status3, capturedVideo } = state;
          expect(status3).to.equal('recorded');
          expect(capturedVideo).to.be.an('object');
          expect(capturedVideo.blob).to.be.instanceOf(Blob);
        });
      });
    })
    it('should record audio', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-2',
          groupId: '00002',
          kind: 'audioinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: false,
              audio: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveAudio, status, record, stop } = state;
          expect(liveAudio).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveAudio.stream.onData(new Blob([], {}));
          liveAudio.stream.onData(new Blob([], {}));
          await delay(10);
          stop();
          await delay(10);
          const { status: status3, capturedAudio } = state;
          expect(status3).to.equal('recorded');
          expect(capturedAudio).to.be.an('object');
          expect(capturedAudio.blob).to.be.instanceOf(Blob);
        });
      });
    })
    it('should invoke stream-data callback when one is provided', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          let calls = 0;
          record({}, 1000, () => calls++);
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          stop();
          await delay(10);
          const { status: status3, capturedVideo } = state;
          expect(status3).to.equal('recorded');
          expect(capturedVideo).to.be.an('object');
          expect(calls).to.equal(2);
        });
      });
    })
    it('should pause recording when pause is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          await delay(10);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          stop();          
        });
      });
    }) 
    it('should resume recording when resume is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause, resume, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          await delay(10);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          resume();
          await delay(10);
          const { status: status4 } = state;
          expect(status4).to.equal('recording');
          stop();
        });
      });
    }) 
    it('should stop recording during pause when stop is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          stop();
          await delay(10);
          const { status: status4 } = state;
          expect(status4).to.equal('recorded');
        });
      });
    }) 
    it('should return to previewing pause when stop is called if nothing is recorded', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause, stop } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          await delay(10);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          stop();
          await delay(10);
          const { status: status4 } = state;
          expect(status4).to.equal('previewing');
        });
      });
    }) 
    it('should snap a picture when snap is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, snap } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          snap();
          await delay(10);
          const { capturedImage, lastError, status: status2 } = state;
          expect(status2).to.equal('recorded');
          expect(lastError).to.not.be.an('error');
          expect(capturedImage).to.be.an('object');
        });
      });
    })      
    it('should use toDataURL when toBlob is not available', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, snap } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          const f = HTMLCanvasElement.prototype.toBlob;
          HTMLCanvasElement.prototype.toBlob = undefined;
          try {
            snap();
            await delay(10);
            const { capturedImage, lastError, status: status2 } = state;
            expect(status2).to.equal('recorded');
            expect(lastError).to.not.be.an('error');
            expect(capturedImage).to.be.an('object');  
          } finally {
            HTMLCanvasElement.prototype.toBlob = f;
          }
        });
      });
    })      
    it('should clear caputred image when clear is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, snap, clear } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          snap();
          await delay(10);
          const { capturedImage, lastError, status: status2 } = state;
          expect(status2).to.equal('recorded');
          expect(lastError).to.not.be.an('error');
          expect(capturedImage).to.be.an('object');
          clear();
          await delay(10);
          const { capturedImage: capturedImage2, status: status3 } = state;
          expect(status3).to.equal('previewing');
          expect(capturedImage2).to.be.undefined;
        });
      });
    })        
    it('should reacquire stream when clear is called', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, snap, clear } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          snap();
          await delay(10);
          const { capturedImage, lastError, status: status2 } = state;
          expect(status2).to.equal('recorded');
          expect(lastError).to.not.be.an('error');
          expect(capturedImage).to.be.an('object');
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          clear();
          await delay(10);
          const { capturedImage: capturedImage2, status: status3 } = state;
          expect(status3).to.equal('previewing');
          expect(capturedImage2).to.be.undefined;
        });
      });
    })
    it('should update dimensions when device is rotated', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(liveVideo).to.be.an('object');
          const { width, height } = liveVideo;
          window.screen.orientation.rotate();
          await delay(10);
          const { liveVideo: after } = state;
          expect(after).to.not.equal(liveVideo);
          expect(after.width).to.equal(height);
          expect(after.height).to.equal(width);          
        });
      });
    })
    it('should not update dimensions when rotation does not change video size', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, liveVideo } = state;
          expect(status).to.equal('previewing');
          expect(liveVideo).to.be.an('object');
          const { width, height } = liveVideo;
          window.screen.orientation.rotate(180);
          await delay(10);
          const { liveVideo: after } = state;
          expect(after).to.equal(liveVideo);
        });
      });
    })
    it('should acquire new stream during previewing when current one is terminated', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        navigator.mediaDevices.addDevice({
          deviceId: '00001-1',
          groupId: '00001',
          kind: 'videoinput',
          label: 'Back facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { liveVideo: video, status: status2 } = state;
          expect(status2).to.equal('previewing');
          expect(video).to.not.equal(liveVideo);
        });
      });
    })
    it('should return to previewing when nothing is recorded at stream termination', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('previewing');
        });
      });
    })
    it('should return to previewing when nothing is recorded at stream termination during pause', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { status: status4 } = state;
          expect(status4).to.equal('previewing');
        });
      });
    })
    it('should proceed to recorded when something is recorded at stream termination', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { status: status3, capturedVideo } = state;
          expect(status3).to.equal('recorded');
          expect(capturedVideo).to.be.an('object');
        });
      });
    })
    it('should proceed to recorded when something is recorded at stream termination during pause', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, pause } = state;
          expect(liveVideo).to.not.be.undefined;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          pause();
          await delay(10);
          const { status: status3 } = state;
          expect(status3).to.equal('paused');
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { status: status4, capturedVideo } = state;
          expect(status4).to.equal('recorded');
          expect(capturedVideo).to.be.an('object');
        });
      });
    })
    it('should handle stream termination when recorded video is being viewed', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-1',
          groupId: '00002',
          kind: 'videoinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
              audio: false,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveVideo, status, record, stop } = state;
          expect(status).to.equal('previewing');
          record();
          await delay(10);
          const { duration, status: status2 } = state;
          expect(status2).to.equal('recording');
          expect(duration).to.equal(0);
          liveVideo.stream.onData(new Blob([], {}));
          await delay(10);
          stop();
          await delay(10);
          const { status: status3, capturedVideo, liveVideo: before } = state;
          expect(status3).to.equal('recorded');
          expect(capturedVideo).to.be.an('object');
          expect(before).to.be.an('object');
          const [ track ] = liveVideo.stream.getTracks();
          track.onended({ type: 'ended' });
          await delay(10);
          const { liveVideo: after } = state;
          expect(after).to.be.undefined;
        });
      });
    })
    it('should acquire device after permission is changed', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Spy camera',
        });
        navigator.mediaDevices.allow = false;
        await withTestRenderer(async ({ render }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: true,
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { status, lastError } = state;
          expect(status).to.equal('denied');
          expect(lastError).to.be.an('error');
          navigator.mediaDevices.allow = true;
          navigator.permissions.camera.dispatchEvent(new Event('change'));
          await delay(10);
          const { status: status2 } = state;
          expect(status2).to.equal('previewing');
        });
      });      
    })
    it('should monitor volume', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '00002-2',
          groupId: '00002',
          kind: 'audioinput',
          label: 'Front facing camera',
        });
        await withTestRenderer(async ({ render, unmount }) => {
          let state;
          function Test() {
            state = useMediaCapture({
              video: false,
              audio: true,
              watchVolume: true
            });
            return null;                
          }
          const el = createElement(Test);
          await render(el);
          await delay(10);
          const { liveAudio, status } = state;
          expect(liveAudio).to.not.be.undefined;
          expect(status).to.equal('previewing');
          liveAudio.stream.onData({ volume: 51 });
          await delay(10);
          const { volume } = state;
          expect(volume).to.equal(51);
          await unmount();
        });
      });
    })
  })
})