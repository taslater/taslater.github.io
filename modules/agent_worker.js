this.window = this

importScripts(
  "./ziggurat.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
  "./nn_models.js"
)

tf.enableProdMode()
tf.setBackend("cpu")

let theta = 2 * Math.PI * (Math.random() - 0.5),
  omega = 0,
  noise = 1 - 2 * Math.random(),
  action = 0,
  torque = action + noise,
  global,
  state_len,
  targetActor,
  noise_sigma,
  ep_step = 0,
  episode = 0
let zig = new Ziggurat()
let initialized = false
let looper

onmessage = e => {
  const msg = e.data
  if (!initialized && msg.hasOwnProperty("global")) {
    initialize(msg.global)
    run()
  } else if (initialized && msg == "next frame") {
    run()
  } else if (msg.hasOwnProperty("newActorWts")) {
    setTimeout(() => {
      tf.tidy(() => {
        const wts = targetActor.getWeights()
        const new_wts = msg.newActorWts
        for (let i = 0; i < wts.length; i++) {
          wts[i] = tf.tensor(new_wts[i], wts[i].shape)
        }
        targetActor.setWeights(wts)
      })
      noise_sigma *= global.noise_decay
      if (noise_sigma < global.noise_sigma_min) {
        noise_sigma = global.noise_sigma_min
      }
    }, 0)
  }
}

function initialize(_global) {
  global = _global

  noise_sigma = global.noise_sigma_initial
  // reset()
  state_len = state().length

  stateBuffer = new ArrayBuffer(4 * state_len)
  stateView = new Float32Array(stateBuffer)

  targetActor = Actor(false, state_len)

  initialized = true

  postMessage({
    state_len,
    actorWeights: targetActor.getWeights().map(t => t.dataSync())
  })

  reset()
}

function run() {
  if (ep_step >= global.ep_steps) {
    ep_step = 0
    episode++
    reset()
  } else {
    ep_step++
  }
  const experience = update()
  postMessage({
    animationState: Object.assign({}, animationState()),
    experience: Object.assign({}, experience)
  })
}

function animationState() {
  return { theta, torque, action, noise }
}

function reset() {
  theta = 2 * Math.PI * (Math.random() - 0.5)
  omega = 0
  noise = 1 - 2 * Math.random()
  updateAction()
  updateNoise()
  updateTorque()
}

function reward() {
  // return 0.5 - Math.abs(theta / Math.PI)
  let _theta = Math.abs(theta / Math.PI)
  return -_theta * _theta - 0.001 * Math.abs(torque)
  // return -Math.abs(theta / Math.PI) - 0.01 * Math.abs(action)
}

function state() {
  const csn = Math.cos(theta),
    sn = Math.sin(theta)
  return [csn, sn, 10 * omega]
}

function update() {
  const s0 = state().slice()
  const r0 = reward()
  updateAction()
  updateNoise()
  updateTorque()
  updatePhysics()
  const s1 = state().slice()
  const r1 = reward()
  return { s0, a: action, r: r1, s1 }
}

function updateAction() {
  const s = state().slice()
  for (let i = 0; i < state_len; i++) {
    stateView[i] = s[i]
  }
  action = tf.tidy(() => {
    return targetActor
      .predict(tf.tensor(stateView, [1, state_len], "float32"), {
        batchSize: 1
      })
      .dataSync()[0]
  })
}

function updateNoise() {
  noise *= global.noise_theta
  noise += noise_sigma * zig.nextGaussian()

  if (action + noise > 1) {
    noise = 1 - global.noise_bumper - action
  } else if (action + noise < -1) {
    noise = -1 + global.noise_bumper - action
  }
}

function updateTorque() {
  torque = action + noise
}

function updatePhysics() {
  omega *= global.drag
  omega += global.torque_mag * torque + global.g * Math.sin(theta)
  if (Math.abs(omega) > global.omega_lim) {
    omega *= global.omega_lim / Math.abs(omega)
  }
  theta += omega
  if (theta > Math.PI) {
    theta -= 2 * Math.PI
  } else if (theta < -Math.PI) {
    theta += 2 * Math.PI
  }
}
