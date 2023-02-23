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
          const { liveVideo, status, lastError } = state;
          expect(liveVideo).to.not.be.undefined;
          const { stream } = liveVideo;
          const [ track ] = stream.getTracks();
          expect(track.device).to.have.property('deviceId', '00002-1');
          expect(status).to.equal('previewing');
          expect(lastError).to.be.undefined;
        });
      });
    });      
  })
})