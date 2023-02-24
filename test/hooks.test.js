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
    it('should reach the state of previewing when there is a device', async function() {
      await withFakeDOM(async () => {
        navigator.mediaDevices.addDevice({
          deviceId: '007',
          groupId: '007',
          kind: 'videoinput',
          label: 'Sky camera',
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
          const { status, lastError } = state;
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
    });
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
    });
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
    });      
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
    });      

  })
})