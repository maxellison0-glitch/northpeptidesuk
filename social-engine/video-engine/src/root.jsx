import React from 'react';
import {Composition} from 'remotion';
import {BpcGroupChat} from './BpcGroupChat';
import {BasketStory} from './BasketStory';
import {PeptideSignalsCarousel} from './PeptideSignalsCarousel';
import {TirzepatideCarousel} from './TirzepatideCarousel';

export const Root = () => (
  <>
    <Composition
      id="BpcGroupChat"
      component={BpcGroupChat}
      durationInFrames={270}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="BasketStory"
      component={BasketStory}
      durationInFrames={474}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="PeptideSignalsCarousel"
      component={PeptideSignalsCarousel}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1350}
    />
    <Composition
      id="TirzepatideCarousel"
      component={TirzepatideCarousel}
      durationInFrames={225}
      fps={30}
      width={1080}
      height={1350}
    />
  </>
);
