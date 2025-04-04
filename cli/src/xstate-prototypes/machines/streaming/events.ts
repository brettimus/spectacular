export type ChunkEvent = {
  type: "textStream.chunk";
  content: string;
};

export const createChunkEvent = (content: string): ChunkEvent => ({
  type: "textStream.chunk",
  content,
});

export type CancelEvent = {
  type: "cancel";
};
