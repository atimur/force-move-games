import { toHex32, padBytes32 } from './utils';
import { soliditySha3 } from 'web3-utils';

class Channel {
  constructor(channelType, channelNonce, participants) {
    this.channelType = channelType;
    this.channelNonce = channelNonce;
    this.participants = participants;
  }

  numberOfParticipants() {
    return this.participants.length;
  }

  id() {
    return soliditySha3(
      { type: 'address', value: this.channelType },
      { type: 'uint256', value: this.channelNonce },
      { type: 'address[]', value: this.participants },
    );
  }

  toHex() {
    return (
      padBytes32(this.channelType) +
      toHex32(this.channelNonce).substr(2) +
      toHex32(this.numberOfParticipants()).substr(2) +
      this.participants.map(x => padBytes32(x).substr(2)).join("")
    )
  }
}

class State {
  constructor(channel, stateType, turnNum, position) {
    this.channel = channel;
    this.stateType = stateType;
    this.turnNum = turnNum;
    this.position = position;
  }

  toHex() {
    return (
      this.channel.toHex() +
      toHex32(this.stateType).substr(2) +
      toHex32(this.turnNum).substr(2) +
      this.position.substr(2)
    )
  }
}

export function pack(
  channelType,
  channelNonce,
  stateNonce,
  participantA,
  participantB,
  gameState
) {
  let channel = new Channel(channelType, channelNonce, [participantA, participantB]);
  let stateType = 0; // for time being
  let state = new State(channel, stateType, stateNonce, gameState);
  return state.toHex();
}

export function channelId(channelType, channelNonce, participants) {
  let channel = new Channel(channelType, channelNonce, participants);
  return channel.id();
}

export function ecSignState(state, account) {
  let digest = hash(state);
  const sig = web3.eth.sign(account, digest).slice(2);
  const r = `0x${sig.slice(0, 64)}`;
  const s = `0x${sig.slice(64, 128)}`;
  const v = web3.toDecimal(sig.slice(128, 130)) + 27;

  return [ r, s, v ];
}

export function hash(bytes) {
  return web3.sha3(bytes, {encoding: 'hex'}).slice(2);
}
