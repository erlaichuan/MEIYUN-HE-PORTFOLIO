/** A soft breath of clouds, textured paper unfurling, then a muted wooden scroll tap. */
export function playCloudScrollSound(ctx: BaseAudioContext, destination: AudioNode, onEnd: () => void) {
  const duration = 2.4
  const now = ctx.currentTime
  const bus = ctx.createGain()
  bus.gain.value = .75
  bus.connect(destination)
  const nodes: AudioNode[] = [bus]
  const sources: AudioScheduledSourceNode[] = []
  let stopped = false

  function sweep(offset: number, length: number, volume: number, paper: boolean) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let softNoise = 0
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate
      softNoise = softNoise * .91 + (Math.random() * 2 - 1) * .09
      data[i] = paper
        ? (Math.random() * 2 - 1) * (.5 + .3 * Math.sin(t * 83) ** 2 + .2 * Math.sin(t * 137) ** 2)
        : softNoise * 4
    }
    const source = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    const pan = ctx.createStereoPanner()
    const start = now + offset
    source.buffer = buffer
    filter.type = 'bandpass'
    filter.Q.value = paper ? .55 : .4
    filter.frequency.setValueAtTime(paper ? 950 : 280, start)
    filter.frequency.exponentialRampToValueAtTime(paper ? 2200 : 1050, start + length * .45)
    filter.frequency.exponentialRampToValueAtTime(paper ? 750 : 350, start + length)
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + (paper ? .22 : .45))
    gain.gain.exponentialRampToValueAtTime(.0001, start + length)
    pan.pan.setValueAtTime(paper ? .25 : -.4, start)
    pan.pan.linearRampToValueAtTime(paper ? -.2 : .4, start + length)
    source.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(bus)
    nodes.push(source, filter, gain, pan)
    sources.push(source)
    source.start(start); source.stop(start + length)
  }

  sweep(0, duration, .28, false)
  sweep(.35, 1.6, .22, true)
  sweep(.9, 1.1, .12, true)

  const wood = ctx.createOscillator()
  const woodGain = ctx.createGain()
  wood.frequency.setValueAtTime(230, now + 1.82)
  wood.frequency.exponentialRampToValueAtTime(135, now + 2.04)
  woodGain.gain.setValueAtTime(0, now + 1.82)
  woodGain.gain.linearRampToValueAtTime(.055, now + 1.84)
  woodGain.gain.exponentialRampToValueAtTime(.0001, now + 2.12)
  wood.connect(woodGain); woodGain.connect(bus)
  nodes.push(wood, woodGain); sources.push(wood)
  wood.start(now + 1.82); wood.stop(now + 2.13)

  function stop() {
    if (stopped) return
    stopped = true
    sources.forEach(source => { source.onended = null; try { source.stop() } catch { /* Already ended. */ } })
    nodes.forEach(node => node.disconnect())
  }
  sources[0].onended = () => { stop(); onEnd() }
  return stop
}
