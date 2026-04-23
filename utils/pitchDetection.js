export function centsOff(current, target) {
    return 1200 * Math.log2(current / target)
}

function yinDetect(buffer, sampleRate, minHz = 50, maxHz = 1200) {
    const size = buffer.length
    const maxTau = Math.min(Math.floor(sampleRate / minHz), Math.floor(size / 2))
    const minTau = Math.max(2, Math.floor(sampleRate / maxHz))
    const yinBuffer = new Float32Array(maxTau + 1)

    // Difference function
    for (let tau = minTau; tau <= maxTau; tau += 1) {
        let sum = 0
        for (let i = 0; i < size - tau; i += 1) {
            const delta = buffer[i] - buffer[i + tau]
            sum += delta * delta
        }
        yinBuffer[tau] = sum
    }

    // Cumulative mean normalized difference function (CMNDF)
    yinBuffer[0] = 1
    let runningSum = 0
    for (let tau = 1; tau <= maxTau; tau += 1) {
        runningSum += yinBuffer[tau]
        yinBuffer[tau] = runningSum > 0 ? (yinBuffer[tau] * tau) / runningSum : 1
    }

    const threshold = 0.1
    let tauEstimate = -1
    for (let tau = minTau; tau <= maxTau; tau += 1) {
        if (yinBuffer[tau] < threshold) {
            while (tau + 1 <= maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
                tau += 1
            }
            tauEstimate = tau
            break
        }
    }

    if (tauEstimate < 0) {
        return null
    }

    // Parabolic interpolation around tau estimate for better precision.
    const x0 = tauEstimate > 1 ? tauEstimate - 1 : tauEstimate
    const x2 = tauEstimate + 1 <= maxTau ? tauEstimate + 1 : tauEstimate
    const s0 = yinBuffer[x0]
    const s1 = yinBuffer[tauEstimate]
    const s2 = yinBuffer[x2]

    let betterTau = tauEstimate
    const denom = 2 * (2 * s1 - s2 - s0)
    if (denom !== 0) {
        betterTau = tauEstimate + (s2 - s0) / denom
    }

    const hz = sampleRate / betterTau
    if (!Number.isFinite(hz) || hz < minHz || hz > maxHz) {
        return null
    }

    return hz
}

export function autoCorrelate(buffer, sampleRate) {
    let rms = 0
    for (let i = 0; i < buffer.length; i += 1) {
        rms += buffer[i] * buffer[i]
    }
    rms = Math.sqrt(rms / buffer.length)
    if (rms < 0.006) {
        return null
    }

    const size = buffer.length
    let best = -1
    let bestCorr = 0
    for (let offset = 8; offset < size / 2; offset += 1) {
        let diff = 0
        for (let i = 0; i < size - offset; i += 1) {
            diff += Math.abs(buffer[i] - buffer[i + offset])
        }
        const corr = 1 - diff / (size - offset)
        if (corr > bestCorr) {
            bestCorr = corr
            best = offset
        }
    }

    if (best < 0 || bestCorr < 0.82) {
        return null
    }

    const hz = sampleRate / best
    if (!Number.isFinite(hz) || hz < 50 || hz > 1200) {
        return null
    }

    return hz
}

export function detectPitch(buffer, sampleRate) {
    // Prefer YIN for high-string robustness; fallback keeps previous behavior.
    return yinDetect(buffer, sampleRate, 50, 1200) ?? autoCorrelate(buffer, sampleRate)
}

export function foldIntoGuitarRange(hz) {
    if (!hz) {
        return hz
    }

    let next = hz
    while (next > 370) {
        next /= 2
    }
    while (next < 70) {
        next *= 2
    }
    return next
}

export function getRms(buffer) {
    let rms = 0
    for (let i = 0; i < buffer.length; i += 1) {
        rms += buffer[i] * buffer[i]
    }
    return Math.sqrt(rms / buffer.length)
}
