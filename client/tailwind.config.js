// tailwind.config.js (pentru vite + ESM)
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx,vue,svelte}'
      ]
,      
theme: {
  extend: {
    colors: {
      primary: '#1e3a8a', // albastru închis
      accent: '#38bdf8', // cyan deschis
    },
  },
   
  },
  plugins: [],
}
  