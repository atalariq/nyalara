import { existsSync, readFileSync } from 'node:fs'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getApps, initializeApp } from 'firebase-admin/app'

loadLocalEnv(new URL('../.env', import.meta.url))

const app = getApps()[0] ?? initializeApp()
const firestore = getFirestore(app)

const factors = [
  {
    id: 'id_pln_national_reference_2024',
    category: 'electricity',
    country: 'ID',
    region: 'national',
    providerName: 'PLN',
    unit: 'kwh',
    kgCo2ePerKwh: 0.85,
    source: 'esdm_gatrik_reference_default',
    version: 'reference_default_v1',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/frontend/download_index/?kode_category=emisi_pl&query=2024',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Default national reference for backend fallback; Indonesia also includes active regional factors below.'
  },
  {
    id: 'id_jamali_cm_ex_post_2019',
    category: 'electricity',
    country: 'ID',
    region: 'jamali',
    providerName: 'PLN Interkoneksi Jamali',
    unit: 'kwh',
    kgCo2ePerKwh: 0.87,
    source: 'esdm_gatrik_2019_fe_grk',
    version: '2019_cm_ex_post_om50_bm50',
    active: true,
    validFrom: '2019-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Grid Jamali, faktor emisi CM Ex-Post (OM=0.5, BM=0.5) = 0.87 ton CO2/MWh => 0.87 kg CO2/kWh'
  },
  {
    id: 'id_khatulistiwa_cm_ex_post_2019',
    category: 'electricity',
    country: 'ID',
    region: 'khatulistiwa',
    providerName: 'PLN Interkoneksi Khatulistiwa',
    unit: 'kwh',
    kgCo2ePerKwh: 1.63,
    source: 'esdm_gatrik_2019_fe_grk',
    version: '2019_cm_ex_post_om50_bm50',
    active: true,
    validFrom: '2019-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Grid Khatulistiwa, faktor emisi CM Ex-Post (OM=0.5, BM=0.5) = 1.63 ton CO2/MWh => 1.63 kg CO2/kWh'
  },
  {
    id: 'id_batam_tanjung_pinang_cm_ex_post_2019',
    category: 'electricity',
    country: 'ID',
    region: 'batam_tanjung_pinang',
    providerName: 'PLN Batam-Tanjung Pinang',
    unit: 'kwh',
    kgCo2ePerKwh: 0.82,
    source: 'esdm_gatrik_2019_fe_grk',
    version: '2019_cm_ex_post_om50_bm50',
    active: true,
    validFrom: '2019-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Grid Batam-Tanjung Pinang, faktor emisi CM Ex-Post (OM=0.5, BM=0.5) = 0.82 ton CO2/MWh => 0.82 kg CO2/kWh'
  },
  {
    id: 'id_bangka_cm_ex_post_2019',
    category: 'electricity',
    country: 'ID',
    region: 'bangka',
    providerName: 'PLN Bangka',
    unit: 'kwh',
    kgCo2ePerKwh: 0.89,
    source: 'esdm_gatrik_2019_fe_grk',
    version: '2019_cm_ex_post_om50_bm50',
    active: true,
    validFrom: '2019-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Grid Bangka, faktor emisi CM Ex-Post (OM=0.5, BM=0.5) = 0.89 ton CO2/MWh => 0.89 kg CO2/kWh'
  },
  {
    id: 'id_lombok_cm_ex_post_2019',
    category: 'electricity',
    country: 'ID',
    region: 'lombok',
    providerName: 'PLN Lombok',
    unit: 'kwh',
    kgCo2ePerKwh: 1.61,
    source: 'esdm_gatrik_2019_fe_grk',
    version: '2019_cm_ex_post_om50_bm50',
    active: true,
    validFrom: '2019-01-01',
    validTo: null,
    sourceUrl:
      'https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf',
    sourcePublisher: 'Direktorat Jenderal Ketenagalistrikan (ESDM)',
    sourceNotes:
      'Grid Lombok, faktor emisi CM Ex-Post (OM=0.5, BM=0.5) = 1.61 ton CO2/MWh => 1.61 kg CO2/kWh'
  },
  {
    id: 'my_peninsular_gef_2024',
    category: 'electricity',
    country: 'MY',
    region: 'peninsular',
    providerName: 'Suruhanjaya Tenaga',
    unit: 'kwh',
    kgCo2ePerKwh: 0.74,
    source: 'myenergystats_gef_2022_2024_provisional',
    version: '2024_provisional',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://myenergystats.st.gov.my/documents/d/guest/grid-emission-factor-gef-in-malaysia-2022-2024-provisional-',
    sourcePublisher: 'Suruhanjaya Tenaga (Energy Commission Malaysia)',
    sourceNotes: '2024 provisional GEF Peninsular Malaysia: 0.740 Gg CO2e/GWh.'
  },
  {
    id: 'my_sabah_gef_2024',
    category: 'electricity',
    country: 'MY',
    region: 'sabah',
    providerName: 'Suruhanjaya Tenaga',
    unit: 'kwh',
    kgCo2ePerKwh: 0.539,
    source: 'myenergystats_gef_2022_2024_provisional',
    version: '2024_provisional',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://myenergystats.st.gov.my/documents/d/guest/grid-emission-factor-gef-in-malaysia-2022-2024-provisional-',
    sourcePublisher: 'Suruhanjaya Tenaga (Energy Commission Malaysia)',
    sourceNotes: '2024 provisional GEF Sabah: 0.539 Gg CO2e/GWh.'
  },
  {
    id: 'my_sarawak_gef_2024',
    category: 'electricity',
    country: 'MY',
    region: 'sarawak',
    providerName: 'Suruhanjaya Tenaga',
    unit: 'kwh',
    kgCo2ePerKwh: 0.199,
    source: 'myenergystats_gef_2022_2024_provisional',
    version: '2024_provisional',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://myenergystats.st.gov.my/documents/d/guest/grid-emission-factor-gef-in-malaysia-2022-2024-provisional-',
    sourcePublisher: 'Suruhanjaya Tenaga (Energy Commission Malaysia)',
    sourceNotes: '2024 provisional GEF Sarawak: 0.199 Gg CO2e/GWh.'
  },
  {
    id: 'sg_national_gef_2024',
    category: 'electricity',
    country: 'SG',
    region: 'national',
    providerName: 'Energy Market Authority',
    unit: 'kwh',
    kgCo2ePerKwh: 0.402,
    source: 'ema_ses_grid_emission_factor',
    version: '2024',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl: 'https://www.ema.gov.sg/resources/singapore-energy-statistics/chapter2',
    sourcePublisher: 'Energy Market Authority (Singapore)',
    sourceNotes:
      'Singapore average grid emission factor decreased from 0.412 (2023) to 0.402 kg CO2/kWh (2024).'
  },
  {
    id: 'fr_national_rte_2024',
    category: 'electricity',
    country: 'FR',
    region: 'national',
    providerName: 'RTE France',
    unit: 'kwh',
    kgCo2ePerKwh: 0.0217,
    source: 'rte_annual_review_2024',
    version: '2024',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl: 'https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings',
    sourcePublisher: 'RTE France',
    sourceNotes: 'Average carbon intensity of French electricity generation in 2024: 21.7 gCO2eq/kWh.'
  },
  {
    id: 'de_national_uba_2024',
    category: 'electricity',
    country: 'DE',
    region: 'national',
    providerName: 'Umweltbundesamt',
    unit: 'kwh',
    kgCo2ePerKwh: 0.363,
    source: 'uba_strommix_2024',
    version: '2024',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://www.umweltbundesamt.de/themen/co2-emissionen-pro-kilowattstunde-strom-2024',
    sourcePublisher: 'Umweltbundesamt (Germany)',
    sourceNotes: 'Reported Strommix 2024 figure: 363 g CO2e/kWh.'
  },
  {
    id: 'uk_national_desnz_2023_used_in_2025_factors',
    category: 'electricity',
    country: 'GB',
    region: 'national',
    providerName: 'DESNZ',
    unit: 'kwh',
    kgCo2ePerKwh: 0.19553,
    source: 'uk_ghg_conversion_factors_2025',
    version: '2025_publication_data_year_2023',
    active: true,
    validFrom: '2025-01-01',
    validTo: null,
    sourceUrl:
      'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025',
    sourcePublisher: 'UK Department for Energy Security and Net Zero (DESNZ)',
    sourceNotes:
      'Electricity consumed total factor listed in 2025 methodology tables for data year 2023: 0.19553 kgCO2e/kWh.'
  },
  {
    id: 'au_nsw_act_scope2_2024',
    category: 'electricity',
    country: 'AU',
    region: 'nsw_act',
    providerName: 'DCCEEW',
    unit: 'kwh',
    kgCo2ePerKwh: 0.66,
    source: 'nga_factors_2024',
    version: '2024_scope2',
    active: true,
    validFrom: '2024-01-01',
    validTo: null,
    sourceUrl:
      'https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-account-factors-2024.pdf',
    sourcePublisher:
      'Department of Climate Change, Energy, the Environment and Water (Australia)',
    sourceNotes:
      'NGA Factors 2024 scope 2 table includes NSW & ACT electricity factor of 0.66 kg CO2-e/kWh.'
  },
  {
    id: 'us_egrid_total_output_2023',
    category: 'electricity',
    country: 'US',
    region: 'national',
    providerName: 'US EPA',
    unit: 'kwh',
    kgCo2ePerKwh: 0.40807,
    source: 'epa_egrid_2023_rev2',
    version: '2023_rev2',
    active: true,
    validFrom: '2023-01-01',
    validTo: null,
    sourceUrl: 'https://www.epa.gov/system/files/documents/2025-06/summary_tables_rev2.pdf',
    sourcePublisher: 'United States Environmental Protection Agency',
    sourceNotes:
      'Total output emission rate listed as 899.633 lb/MWh; converted to 0.40807 kg/kWh using 0.000453592 conversion.'
  }
]

for (const factor of factors) {
  await firestore.collection('emission_factors').doc(factor.id).set({
    category: factor.category,
    country: factor.country,
    region: factor.region,
    providerName: factor.providerName,
    unit: factor.unit,
    kgCo2ePerKwh: factor.kgCo2ePerKwh,
    source: factor.source,
    version: factor.version,
    active: factor.active,
    validFrom: factor.validFrom,
    validTo: factor.validTo,
    sourceUrl: factor.sourceUrl,
    sourcePublisher: factor.sourcePublisher,
    sourceNotes: factor.sourceNotes,
    updatedAt: FieldValue.serverTimestamp()
  })
}

console.log(
  JSON.stringify({
    seeded: factors.map(({ id }) => id),
    count: factors.length
  })
)

function loadLocalEnv(envFilePath) {
  if (!existsSync(envFilePath)) {
    return
  }

  const envFile = readFileSync(envFilePath, 'utf8')

  for (const line of envFile.split(/\r?\n/u)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()

    if (!key || process.env[key] !== undefined) {
      continue
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    process.env[key] = stripWrappingQuotes(rawValue)
  }
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}
