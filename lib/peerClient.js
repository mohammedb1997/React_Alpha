// src/lib/peerClient.js
const PEER_SERVERS = [
  { host: '0.peerjs.com', port: 443, secure: true, path: '/' }
];

let currentServerIndex = 0;

export function getPeerOptions() {
  const srv = PEER_SERVERS[currentServerIndex];
  return {
    host: srv.host,
    port: srv.port,
    secure: srv.secure,
    path: srv.path,
    debug: 0,
    config: {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }
  };
}

export function nextServer() {
  currentServerIndex = (currentServerIndex + 1) % PEER_SERVERS.length;
  return getPeerOptions();
}

export function resetServerIndex() {
  currentServerIndex = 0;
}