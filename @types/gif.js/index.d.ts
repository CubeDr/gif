declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | null;
    debug?: boolean;
    dither?: string | boolean;
    repeat?: number; // 0 = loop indefinitely, -1 = loop once, >0 = number of loops
  }

  interface FrameOptions {
    copy?: boolean;
    delay?: number;
    dispose?: number;
    transparent?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);

    addFrame(
      image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D,
      options?: FrameOptions
    ): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'abort', callback: () => void): void;
    on(event: 'error', callback: (err: string) => void): void; // Add this line
    render(): void;
    abort(): void;
  }

  export = GIF;
}
