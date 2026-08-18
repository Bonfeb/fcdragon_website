/** Dragon FC design tokens
 *  pitch  – near-black forest green, primary dark surface
 *  green  – club colour (jersey / crest), win state
 *  flame  – dragon-fire accent, CTAs & highlights
 *  gold   – trophy/sun accent, used sparingly for prestige (competitions, badges)
 *  sand   – warm coastal off-white, light section backgrounds
 *  sky    – draw state (required blue)
 *  loss   – defeat state (required red)
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: { 950: '#0A1B12', 900: '#0E2618', 800: '#153826', 700: '#1D4C33' },
        green: { DEFAULT: '#1F7A46', 600: '#1B6B3D', 500: '#209154', 100: '#DCEFE1' },
        flame: { DEFAULT: '#E2542B', 600: '#C7431F', 100: '#FBE3D8' },
        gold: { DEFAULT: '#D4A24E', 100: '#F6E9D0' },
        sand: { DEFAULT: '#F3ECDA', 100: '#FAF6EC' },
        sky: { DEFAULT: '#2563EB', 100: '#DBEAFE' },
        loss: { DEFAULT: '#DC2626', 100: '#FEE2E2' },
        ink: '#12170F',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'pitch-lines': "repeating-linear-gradient(115deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 2px, transparent 2px, transparent 46px)",
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(10, 27, 18, 0.35)',
      },
    },
  },
  plugins: [],
}
