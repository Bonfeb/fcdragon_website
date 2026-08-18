import Hero from '../components/Hero'
import Fixtures from '../components/Fixtures'
import Results from '../components/Results'
import Competitions from '../components/Competitions'
import Players from '../components/Players'
import News from '../components/News'
import Gallery from '../components/Gallery'

export default function HomePage({ data }) {
  const { competitions, fixtures, players, news, gallery } = data

  const nextFixture = [...fixtures]
    .filter((f) => !f.result && new Date(f.kickoff) >= new Date())
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))[0]

  return (
    <>
      <Hero nextFixture={nextFixture} />
      <Fixtures fixtures={fixtures} />
      <Results fixtures={fixtures} />
      <Competitions competitions={competitions} />
      <Players players={players} />
      <News news={news} />
      <Gallery images={gallery} />
    </>
  )
}
