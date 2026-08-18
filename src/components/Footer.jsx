export default function Footer() {
  return (
    <footer className="bg-pitch-950 text-white/60 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl text-white tracking-wide">DRAGON FC</p>
          <p className="text-xs font-mono mt-1">Gandini-Chonyi · Gandini Pry School Pitch · Kilifi South Sub-County</p>
        </div>
        <p className="text-xs font-mono">© {new Date().getFullYear()} Dragon FC. All rights reserved.</p>
      </div>
    </footer>
  )
}
