import { expect } from 'chai';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';

import {
  BlobAudio,
  BlobImage,
  BlobVideo,
  StreamVideo,
} from '../index.js';

describe('Components', function() {
  let fn1, fn2;
  let num = 0, map = {};
  before(function() {
    fn1 = URL.createObjectURL;
    fn2 = URL.revokeObjectURL;
    URL.createObjectURL = (object) => {
      const url = `blob://${num++}`;
      map[url] = object;
      return url;
    };
    URL.revokeObjectURL = (url) => {
      delete map[url];
    };
  })
  after(function() {
    URL.createObjectURL = fn1;
    URL.revokeObjectURL = fn2;
  })
  describe('#BlobAudio', function() {
    it('should render an audio element', async () => {
      await withTestRenderer(async ({ render, unmount, toJSON }) => {
        const srcObject = { blob: 'audio-1' };
        const el = createElement(BlobAudio, { srcObject });
        await render(el);
        const { type, props: { src } } = toJSON();
        expect(type).to.equal('audio');
        expect(src).to.match(/blob:/);
        expect(map[src]).to.not.be.undefined;
        await unmount();
        expect(map[src]).to.be.undefined;
      });  
    })
  })
  describe('#BlobImage', function() {
    it('should render an img element', async () => {
      await withTestRenderer(async ({ render, unmount, toJSON }) => {
        const srcObject = { blob: 'image-1' };
        const el = createElement(BlobImage, { srcObject });
        await render(el);
        const { type, props: { src } } = toJSON();
        expect(type).to.equal('img');
        expect(src).to.match(/blob:/);
        expect(map[src]).to.not.be.undefined;
        await unmount();
        expect(map[src]).to.be.undefined;
      });  
    })   
  })
  describe('#BlobVideo', function() {
    it('should render an video element', async () => {
      await withTestRenderer(async ({ render, unmount, toJSON }) => {
        const srcObject = { blob: 'video-1' };
        const el = createElement(BlobVideo, { srcObject });
        await render(el);
        const { type, props: { src } } = toJSON();
        expect(type).to.equal('video');
        expect(src).to.match(/blob:/);
        expect(map[src]).to.not.be.undefined;
        await unmount();
        expect(map[src]).to.be.undefined;
      });  
    })
  })
  describe('#StreamVideo', function() {
    it('should render an video element', async () => {
      await withTestRenderer(async ({ render, unmount, toJSON }) => {
        const srcObject = { stream: 'video-2' };
        const el = createElement(StreamVideo, { srcObject });
        let playing = false;
        const node = {
          play: () => playing = true,
        };
        await render(el, { createNodeMock: () => node });
        const { type, props } = toJSON();
        expect(type).to.equal('video');
        expect(node.srcObject).to.equal(srcObject);
        expect(playing).to.be.true;
        await unmount();
      });  
    })    
  })
})
