module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
  theme: {
    fontFamily: {
      sans: "Barlow, system-ui, -apple-system, sans-serif",
      serif: "Barlow Condensed, system-ui, -apple-system, serif",
      mono: "Barlow, system-ui, -apple-system, monospace"
    },
    extend: {
      colors: {
        'mirage': '#1D2838',
        'clay': '#202A39',
        'ebony': '#0D1623',
        'bluewood': '#32425A',

        'seagull': '#6EB0E6',
        'downy': '#71D2A4',
        'cerise': '#E63C62',

        'slate-gray': '#707C8E',
        
        'tint-1': '#6EB0E6',
        'background-2': 'rgba(29,40,56,0.85)',
        'background-2-plain': 'rgb(29,40,56)',
        'background-2-light': '#333d4b',
        'background-1': '#0d1623',
        'white': '#fff',
        'label-1': '#fefefe',
        'label-2': '#d9e0eb',
        'label-3': '#707c8e',

        'slate': 'rgb(24, 38, 58, 0.8)',
        'slate-dark': 'rgb(34, 52, 72)',

        'primary': 'var(--primary-color)',
        'primary-dark': 'var(--primary-color-dark)',

        'orange': '#FF7575',
        'redish': 'rgba(149, 66, 66, 0.8)',

        'light': '#D6D6E0',
        'light-80': 'rgba(214, 214, 224, 0.8)',

        'dark-blue': '#002A3F',
        
        'blue-slate': 'rgba(22, 30, 61, 0.8)',
        'blue-slate-dark': 'rgb(20, 38, 58)',

        'white-15': 'rgba(255, 255, 255, 0.15)',
        'white-30': 'rgba(255, 255, 255, 0.3)',
      },
      spacing: {
        '16/9': '56.25%',
        '9': '2.25rem',
        '11': '2.75rem',
        '22': '5.5rem;'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      borderWidth: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      outline: {
        red: '1px solid red'
      },
      zIndex: {
        '-1': '-1'
      }
    }
  }
}