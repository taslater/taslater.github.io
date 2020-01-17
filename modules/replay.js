// import global from "./parameters.mjs"
// import { shuffle } from "./shuffle.mjs"

class ReplayBuffer {
  constructor(state_len, global) {
    this.global = global
    this.state_len = state_len
    this.data = []

    this.mb_s0_buffer = new ArrayBuffer(4 * state_len * global.mb_len)
    this.mb_s0_view = new Float32Array(this.mb_s0_buffer)

    this.mb_action_buffer = new ArrayBuffer(4 * global.mb_len)
    this.mb_action_view = new Float32Array(this.mb_action_buffer)

    this.mb_reward_buffer = new ArrayBuffer(4 * global.mb_len)
    this.mb_reward_view = new Float32Array(this.mb_reward_buffer)

    this.mb_s1_buffer = new ArrayBuffer(4 * state_len * global.mb_len)
    this.mb_s1_view = new Float32Array(this.mb_s1_buffer)
  }
  add(obj) {
    this.data.push(obj)
    if (this.data.length > this.global.buffer_len) {
      this.data.splice(0, this.data.length - this.global.buffer_len)
    }
  }
  sample() {
    // const mb_arr = this.sample_without_replacement()
    let mb = this.sample_from_recent_memory()
    mb = shuffle(mb)

    for (let i = 0; i < this.global.mb_len; i++) {
      this.mb_action_view[i] = mb[i].a
      this.mb_reward_view[i] = mb[i].r
      for (let j = 0; j < this.state_len; j++) {
        this.mb_s0_view[i * this.state_len + j] = mb[i].s0[j]
        this.mb_s1_view[i * this.state_len + j] = mb[i].s1[j]
      }
    }

    // const mb_s0 = tf.tensor(
    //   mb
    //     .map(experience => experience.s0)
    //     .concat(
    //       mb.map(experience => [
    //         experience.s0[0],
    //         experience.s0[1] * -1,
    //         experience.s0[2] * -1
    //       ])
    //     ),
    //   [2 * global.mb_len, this.state_len]
    // )
    // const mb_actions = tf.tensor(
    //   mb
    //     .map(experience => experience.a)
    //     .concat(mb.map(experience => experience.a * -1)),
    //   [2 * global.mb_len, 1]
    // )
    // const mb_rewards = tf.tensor(
    //   mb
    //     .map(experience => experience.r)
    //     .concat(mb.map(experience => experience.r)),
    //   [2 * global.mb_len, 1]
    // )
    // const mb_s1 = tf.tensor(
    //   mb
    //     .map(experience => experience.s1)
    //     .concat(
    //       mb.map(experience => [
    //         experience.s1[0],
    //         experience.s1[1] * -1,
    //         experience.s1[2] * -1
    //       ])
    //     ),
    //   [2 * global.mb_len, this.state_len]
    // )

    // return mb
  }
  sample_from_recent_memory() {
    const mb_arr = []
    for (let i = 0; i < this.global.mb_len; i++) {
      const rand_idx = Math.floor(this.data.length * Math.sqrt(Math.random()))
      mb_arr.push(this.data[rand_idx])
    }
    return mb_arr
  }
  sample_without_replacement() {
    let idx_arr = [...Array(this.global.mb_len).keys()]
    idx_arr = shuffle(idx_arr)
    const mb_arr = []
    for (let i = 0; i < this.global.mb_len; i++) {
      mb_arr.push(this.data[idx_arr[i]])
    }
    return mb_arr
  }
}

// https://gomakethings.com/how-to-shuffle-an-array-with-vanilla-js/
function shuffle(array) {
  let currentIndex = array.length
  let temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}