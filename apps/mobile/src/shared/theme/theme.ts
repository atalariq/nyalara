// =============================================================================
// theme.ts
//
// Hanya berisi palet warna raw.
// lightTheme dan darkTheme sudah tidak diperlukan —
// dark mode sekarang dihandle via CSS variables di global.css
//
// Kapan pakai file ini:
//   → Kalau butuh nilai hex spesifik yang tidak ada sebagai token NativeWind
//   → Contoh: opacity trick → colors.green.base + '33'
// =============================================================================

export const colors = {

  green: {
    10:   '#D3F5E5',
    20:   '#B6EFD4',
    30:   '#92E7BF',
    40:   '#6EDEAA',
    50:   '#49D694',
    base: '#25CE7F',
    60:   '#1FAC6A',
    70:   '#198955',
    80:   '#136740',
    90:   '#0C452A',
    100:  '#072919',
  },

  neutral: {
    10:   '#D2D2D2',
    20:   '#B3B3B3',
    30:   '#8E8E8E',
    40:   '#686868',
    50:   '#424242',
    base: '#1C1C1C',
    60:   '#171717',
    70:   '#131313',
    80:   '#0E0E0E',
    90:   '#090909',
    100:  '#060606',
  },

  white: '#FFFFFF',
  black: '#000000',

};