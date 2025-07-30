declare module 'zego-express-engine-webrtc' {
  export default class ZegoExpressEngine {
    static createEngine(config: {
      appID: number;
      server: string;
      scenario?: number;
    }): ZegoExpressEngine;
    
    static createEngineWithProfile(config: {
      appID: number;
      server: string;
      scenario?: {
        mode: number;
      };
    }): ZegoExpressEngine;
    
    loginRoom(roomID: string, token: string, user: {
      userID: string;
      userName: string;
    }): Promise<{ code: number; message?: string }>;
    
    startPublishingStream(streamID: string, config?: {
      audio?: boolean;
      video?: boolean;
      audioConfig?: {
        bitrate?: number;
        channel?: number;
        codecID?: number;
        sampleRate?: number;
      };
      videoConfig?: {
        bitrate?: number;
        codecID?: number;
        encodeLatency?: number;
        frameRate?: number;
        height?: number;
        width?: number;
      };
    }): Promise<{ code: number; message?: string }>;
    
    startPlayingStream(streamID: string, config?: {
      audio?: boolean;
      video?: boolean;
    }): Promise<{ code: number; message?: string; stream?: MediaStream }>;
    
    stopPublishingStream(streamID: string): void;
    stopPlayingStream(streamID: string): void;
    logoutRoom(): void;
    destroyEngine(): void;
    
    getLocalStream(): Promise<MediaStream>;
    getRemoteStream(streamID: string): Promise<MediaStream>;
    
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
  }
  
  export namespace ZegoExpressEngine {
    export namespace ScenarioMode {
      export const Communication: number;
      export const LiveBroadcasting: number;
      export const Game: number;
    }
  }
} 