import { createFileRoute, Link } from "@tanstack/react-router";

const leagueData: Record<string, { name: string; country: string; icon: string; description: string; facts: string[] }> = {
  "premier-league": { name: "Premier League", country: "England", icon: "🏴", description: "The Premier League is England’s top level of club football. It is known for its fast pace, famous clubs and matches watched around the world.", facts: ["Founded in 1992", "20 clubs compete in a season", "English top-flight football"] },
  "la-liga": { name: "La Liga", country: "Spain", icon: "🇪🇸", description: "La Liga is Spain’s highest division. It has a long history of major clubs, technical football and some of the world’s most recognisable players.", facts: ["Spain’s top division", "20 clubs compete in a season", "Known for technical football"] },
  "bundesliga": { name: "Bundesliga", country: "Germany", icon: "🇩🇪", description: "The Bundesliga is Germany’s highest division. It combines strong club traditions, large crowds and a reputation for attacking football.", facts: ["Germany’s top division", "18 clubs compete in a season", "Known for passionate supporters"] },
  "serie-a": { name: "Serie A", country: "Italy", icon: "🇮🇹", description: "Serie A is Italy’s top division. Italian clubs have a rich European history and the league is well known for tactical variety.", facts: ["Italy’s top division", "20 clubs compete in a season", "Rich tactical tradition"] },
  "ligue-1": { name: "Ligue 1", country: "France", icon: "🇫🇷", description: "Ligue 1 is France’s highest division. The league features established clubs and has developed many talented young players.", facts: ["France’s top division", "18 clubs compete in a season", "Strong youth development"] },
  "champions-league": { name: "Champions League", country: "Europe", icon: "🌍", description: "The UEFA Champions League is Europe’s premier club competition, bringing leading teams from different national leagues together.", facts: ["European club competition", "Teams qualify from domestic leagues", "Played across Europe"] },
};

export const Route = createFileRoute("/leagues/$slug")({ component: LeaguePage });

function LeaguePage() {
  const { slug } = Route.useParams();
  const league = leagueData[slug];

  if (!league) {
    return <div className="ff-detail-page"><div className="ff-detail-inner"><p className="ff-kicker">404</p><h1>League not found.</h1><Link className="ff-primary" to="/">Back to FootFlux</Link></div></div>;
  }

  return (
    <div className="ff-detail-page">
      <header className="ff-detail-nav"><Link to="/" className="ff-logo">⚽ <span>FOOT</span>FLUX</Link><a href="https://www.youtube.com/channel/UCuJY7t7G3uwwv8OutS3dPLw" target="_blank" rel="noreferrer" className="ff-youtube">YouTube ↗</a></header>
      <main className="ff-detail-inner">
        <Link to="/" className="ff-back">← Back to FootFlux</Link>
        <div className="ff-detail-icon">{league.icon}</div>
        <div className="ff-kicker">BIG LEAGUE • {league.country.toUpperCase()}</div>
        <h1>{league.name}</h1>
        <p className="ff-detail-lead">{league.description}</p>
        <div className="ff-detail-facts">{league.facts.map((fact, i) => <div key={fact}><b>0{i + 1}</b><span>{fact}</span></div>)}</div>
        <div className="ff-detail-note"><strong>Want more football?</strong><p>Explore players, clubs and football facts on the FootFlux homepage.</p><Link to="/" className="ff-primary">Explore FootFlux →</Link></div>
      </main>
      <footer className="ff-footer"><div className="ff-logo">⚽ <span>FOOT</span>FLUX</div><p>© 2026 FootFlux • Built by FootFlux</p><a href="https://www.youtube.com/channel/UCuJY7t7G3uwwv8OutS3dPLw" target="_blank" rel="noreferrer">YouTube ↗</a></footer>
    </div>
  );
}
