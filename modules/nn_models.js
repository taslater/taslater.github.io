function Actor(trainable, state_len) {
  const in_state = tf.input({ shape: [state_len] })
  const dense1 = tf.layers
    .dense({
      units: 64,
      activation: "elu",
      // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
      useBias: true,
      // kernelConstraint: tf.constraints.maxNorm(5),
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(in_state)
  const dense2 = tf.layers
    .dense({
      units: 64,
      activation: "elu",
      // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
      useBias: true,
      // kernelConstraint: tf.constraints.maxNorm(5),
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(dense1)
  // const dense3 = tf.layers
  //   .dense({
  //     units: 128,
  //     activation: "elu",
  //     // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
  //     useBias: true,
  //     // kernelConstraint: tf.constraints.maxNorm(5),
  //     // biasInitializer: "zeros",
  //     trainable: trainable
  //   })
  //   .apply(dense2)
  const out_layer = tf.layers
    .dense({
      units: 1,
      activation: "tanh",
      useBias: true,
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(dense2)
  return tf.model({
    inputs: in_state,
    outputs: out_layer
  })
}

function Critic(trainable, state_len) {
  const in_state = tf.input({ shape: [state_len] })
  const in_action = tf.input({ shape: [1] })

  // const concat1 = tf.layers.concatenate().apply([in_state, in_action])
  // "LeakyReLU"
  const dense1 = tf.layers
    .dense({
      units: 128,
      activation: "elu",
      // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
      // kernelConstraint: tf.constraints.maxNorm(5),
      useBias: true,
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(in_state)
  const concat2 = tf.layers.concatenate().apply([in_action, dense1])

  const dense2 = tf.layers
    .dense({
      units: 128,
      activation: "elu",
      // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
      // kernelConstraint: tf.constraints.maxNorm(5),
      useBias: true,
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(concat2)

  // const concat3 = tf.layers.concatenate().apply([in_action, dense2])
  const dense3 = tf.layers
    .dense({
      units: 128,
      activation: "elu",
      // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
      // kernelConstraint: tf.constraints.maxNorm(5),
      useBias: true,
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(dense2)
  // const dense4 = tf.layers
  //   .dense({
  //     units: 256,
  //     activation: "elu",
  //     // kernelRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
  //     // kernelConstraint: tf.constraints.maxNorm(5),
  //     useBias: true,
  //     // biasInitializer: "zeros",
  //     trainable: trainable
  //   })
  //   .apply(dense3)
  const out_layer = tf.layers
    .dense({
      units: 1,
      activation: "linear",
      useBias: true,
      // biasInitializer: "zeros",
      trainable: trainable
    })
    .apply(dense3)
  return tf.model({
    inputs: [in_state, in_action],
    outputs: out_layer
  })
}

// function ValueCritic(trainable, state_len) {
//   const in_state = tf.input({ shape: [state_len] })
//   const dense1 = tf.layers
//     .dense({
//       units: 128,
//       activation: "elu",
//       useBias: true,
//       trainable: trainable
//     })
//     .apply(in_state)
//   const dense2 = tf.layers
//     .dense({
//       units: 128,
//       activation: "elu",
//       useBias: true,
//       trainable: trainable
//     })
//     .apply(dense1)
//   const dense3 = tf.layers
//     .dense({
//       units: 128,
//       activation: "elu",
//       useBias: true,
//       trainable: trainable
//     })
//     .apply(dense2)
//   const out_layer = tf.layers
//     .dense({
//       units: 1,
//       activation: "linear",
//       useBias: true,
//       trainable: trainable
//     })
//     .apply(dense3)
//   return tf.model({
//     inputs: in_state,
//     outputs: out_layer
//   })
// }
