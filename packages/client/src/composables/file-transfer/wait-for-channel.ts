const BUFFER_HIGH_WATER_MARK = 256 * 1024;
const BUFFER_LOW_WATER_MARK = 64 * 1024;

export function waitForChannelOpen(channel: RTCDataChannel): Promise<void> {
  if (channel.readyState === 'open') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    function cleanup() {
      channel.removeEventListener('open', onOpen);
      channel.removeEventListener('error', onError);
    }
    function onOpen() {
      cleanup();
      resolve();
    }
    function onError() {
      cleanup();
      reject(new Error('Data channel failed to open'));
    }
    channel.addEventListener('open', onOpen);
    channel.addEventListener('error', onError);
  });
}

export function waitForBuffer(channel: RTCDataChannel): Promise<void> {
  if (channel.bufferedAmount <= BUFFER_HIGH_WATER_MARK) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    channel.bufferedAmountLowThreshold = BUFFER_LOW_WATER_MARK;
    const onLow = () => {
      channel.removeEventListener('bufferedamountlow', onLow);
      resolve();
    };
    channel.addEventListener('bufferedamountlow', onLow);
  });
}
