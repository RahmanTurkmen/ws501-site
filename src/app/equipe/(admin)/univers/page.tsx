/* eslint-disable @next/next/no-img-element */
import { requireUser } from "@/lib/auth";
import { getQuestions } from "@/lib/questions";
import { average, loadRows, numbers, percent, share, spread, top } from "@/lib/stats";
import { Bars, Empty, Head, period, PeriodFilter, Stats } from "../ui";

export default async function UniversePage({ searchParams }: PageProps<"/equipe/univers">) {
  await requireUser();
  const { key, since } = period((await searchParams).periode);
  const [rows, questions] = await Promise.all([loadRows(since), getQuestions()]);
  const options = (k: string) => questions.find((q) => q.key === k)?.options ?? [];
  const labels = (k: string) => options(k).map((o) => o.label);

  const toys = spread(rows, "toy", labels("toy"));
  const story = spread(rows, "story", labels("story"));
  const ambiance = spread(rows, "ambiance", labels("ambiance")).sort((a, b) => b.count - a.count);
  const colors = ["var(--yellow)", "var(--pink)", "var(--teal)", "var(--orange)", "var(--lilac)", "var(--red)"];
  const donutColors = ["var(--teal)", "var(--yellow)", "var(--red)"];
  const stops = story.map((s, i) => {
    const start = story.slice(0, i).reduce((a, x) => a + x.share, 0);
    return `${donutColors[i % 3]} ${start * 100}% ${(start + s.share) * 100}%`;
  });
  const storyFull = story[0] ?? share(rows, "story", "Oui, tout");

  return (
    <>
      <Head title="Univers & DA" sub={`${rows.length} réponse(s)`}><PeriodFilter path="/equipe/univers" current={key} /></Head>
      {!rows.length ? <Empty /> : (
        <>
          <Stats items={[
            [average(numbers(rows, "universe")), "Univers / 5", { decimals: 1 }],
            [percent(storyFull.share), "Ont compris toute l’histoire"],
            [top(rows, "toy", labels("toy"))?.label ?? null, "Jouet préféré"],
            [top(rows, "level", labels("level"))?.label ?? null, "Niveau préféré"],
          ]} />
          <div className="cols">
            <div className="card">
              <h3>Jouet préféré</h3>
              <div className="toys">
                {toys.map((t, i) => (
                  <div key={t.label} className={["c-red", "c-blue", "c-green", "c-orange"][i % 4]}>
                    {options("toy")[i]?.image && <img src={options("toy")[i].image} alt="" />}
                    <p>{percent(t.share)}<br /><small>{t.label}</small></p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Histoire comprise</h3>
              <div className="donut" style={{ background: story.some((s) => s.count) ? `conic-gradient(${stops.join(", ")})` : "var(--night)" }}>
                <span>{percent(storyFull.share)}</span>
              </div>
              {story.map((s, i) => (
                <div className="line" key={s.label}><span style={{ color: donutColors[i % 3] }}>■ {s.label}</span><strong>{percent(s.share)}</strong></div>
              ))}
            </div>
            <div className="card">
              <h3>Niveau préféré</h3>
              <Bars items={spread(rows, "level", labels("level")).sort((a, b) => b.count - a.count)} />
            </div>
            <div className="card">
              <h3>Mots d’ambiance</h3>
              <div className="cloud">
                {ambiance.map((a, i) => (
                  <span key={a.label} style={{ fontSize: 15 + a.share * 34, color: colors[i % colors.length], animationDelay: `${-i * 0.5}s`, opacity: a.count ? 1 : 0.4 }} title={`${a.count} réponse(s)`}>{a.label}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
