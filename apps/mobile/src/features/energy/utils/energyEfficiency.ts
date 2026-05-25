// features/energy/utils/energyEfficiency.ts

export type EfficiencyLevel = 'efficient' | 'moderate' | 'inefficient'

export type EfficiencyResult = {
  label: string
  level: EfficiencyLevel
}

const REFERENCE_MAX_KWH = 8

export function getEfficiencyResult(
  todayKwh: number,
  comparedToYesterday: number | null,
): EfficiencyResult {
  // Belum ada data
  if (todayKwh === 0) {
    return { label: 'No Data Yet', level: 'moderate' }
  }

  // Usage absolut terlalu tinggi
  if (todayKwh > REFERENCE_MAX_KWH * 1.5) {
    return { label: 'Inefficient Energy Use', level: 'inefficient' }
  }

  // Naik signifikan dibanding kemarin
  if (comparedToYesterday !== null && comparedToYesterday > 20) {
    return { label: 'Usage Spiking Today', level: 'inefficient' }
  }

  // Naik sedikit
  if (comparedToYesterday !== null && comparedToYesterday > 0) {
    return { label: 'Moderate Energy Pattern', level: 'moderate' }
  }

  // Turun atau dalam batas wajar
  return { label: 'Efficient Energy Pattern', level: 'efficient' }
}
