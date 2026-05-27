# Emission Factor Sources

This document lists the public references used by `apps/api/scripts/seed-emission-factors.mjs`.

## Notes

- Values are stored in `kgCo2ePerKwh`.
- Some sources publish in `gCO2/kWh` or `GgCO2e/GWh`; seed values are normalized to `kgCo2ePerKwh`.
- API endpoint `GET /v1/emission-factors` is intentionally public.

## Indonesia (special case: multi-region)

- Publisher: Direktorat Jenderal Ketenagalistrikan (ESDM)
- Reference index:  
  https://gatrik.esdm.go.id/frontend/download_index/?kode_category=emisi_pl&query=2024
- Historical regional factors reference file used in seed metadata:  
  https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf

## Malaysia (regional)

- Publisher: Suruhanjaya Tenaga (Energy Commission Malaysia)
- Reference:  
  https://myenergystats.st.gov.my/documents/d/guest/grid-emission-factor-gef-in-malaysia-2022-2024-provisional-

## Singapore (national)

- Publisher: Energy Market Authority (Singapore)
- Reference:  
  https://www.ema.gov.sg/resources/singapore-energy-statistics/chapter2

## France (national)

- Publisher: RTE France
- Reference:  
  https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings

## Germany (national)

- Publisher: Umweltbundesamt (Germany)
- Reference:  
  https://www.umweltbundesamt.de/themen/co2-emissionen-pro-kilowattstunde-strom-2024

## United Kingdom (national)

- Publisher: UK Department for Energy Security and Net Zero (DESNZ)
- Reference:  
  https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025

## Australia (state/grid)

- Publisher: Department of Climate Change, Energy, the Environment and Water (Australia)
- Reference:  
  https://www.dcceew.gov.au/sites/default/files/documents/national-greenhouse-account-factors-2024.pdf

## United States (grid-level published as eGRID tables)

- Publisher: United States Environmental Protection Agency (EPA)
- Reference index:  
  https://www.epa.gov/egrid/summary-data
- Summary tables (rev2):  
  https://www.epa.gov/system/files/documents/2025-06/summary_tables_rev2.pdf
