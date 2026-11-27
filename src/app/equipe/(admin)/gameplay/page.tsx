import { CountUp } from "@/components/motion";
import { requireUser } from "@/lib/auth";
import { getQuestions } from "@/lib/questions";
import { average, loadRows, numbers, percent, share, spread, top } from "@/lib/stats";
import { Bars, Empty, Head, period, PeriodFilter, Stats } from "../ui";

export default async function GameplayPage({ searchParams }: PageProps<"/equipe/gameplay">) {
  await requireUser();
  const { key, since } = period((await searchParams).periode);
  const [rows, questions] = await Promise.all([loadRows(since), getQuestions()]);
  const labels = (k: string) => questions.find((q) => q.key === k)?.options.map((o) => o.label) ?? [];
  const tones = questions.find((q) => q.key === "panic")?.options ?? [];

  const controls = average(numbers(rows, "controls"));
  const perfect = share(rows, "difficulty", "Parfait").share;
  const crank = share(rows, "crank", "Oui, tout de suite").share;
  const moment = top(rows, "panic", labels("panic"));
  const hard = share(rows, "difficulty", "Dur").share + share(rows, "difficulty", "Trop dur").share;

  // Constats déduits des chiffres, avec des seuils volontairement simples.
  const takeaways = [
    crank < 0.5 && `Moins d’une personne sur deux comprend la manivelle tout de suite (${percent(crank)}).`,
    controls !== null && controls < 3.5 && `Les commandes sont jugées moyennes (${controls.toFixed(1)} / 5).`,
    hard > 0.4 && `${percent(hard)} trouvent le jeu dur ou trop dur.`,
    moment && `Le pic de panique : « ${moment.label} » (${percent(moment.share)}).`,
  ].filter(Boolean) as string[];

  return (
    <>
      <Head title="Gameplay" sub={`${rows.length} réponse(s)`}><PeriodFilter path="/equipe/gameplay" current={key} /></Head>
      {!rows.length ? <Empty /> : (
        <>
          <Stats items={[
            [controls, "Commandes / 5", { decimals: 1 }],
            [percent(perfect), "Difficulté « parfaite »"],
            [moment ? percent(moment.share) : null, moment ? `Paniquent : ${moment.label.toLowerCase()}` : "Moment de panique"],
            [percent(crank), "Manivelle claire tout de suite"],
          ]} />
          <div className="cols">
            <div className="card">
              <h3>Commandes : répartition des notes</h3>
              <Bars items={spread(rows, "controls", [5, 4, 3, 2, 1])} />
            </div>
            <div className="card">
              <h3>Difficulté</h3>
              <Bars items={spread(rows, "difficulty", labels("difficulty"))} />
            </div>
          </div>
          <div className="card">
            <h3>Moment de panique le plus fort</h3>
            <div className="cols" style={{ "--cols": 4 } as React.CSSProperties}>
              {spread(rows, "panic", labels("panic")).map((p, i) => (
                <div key={p.label} className={`card panic-stat c-${tones[i]?.tone ?? "danger"}`}>
                  <strong><CountUp value={p.share * 100} suffix=" %" /></strong>{p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="cols">
            <div className="card">
              <h3>La manivelle était-elle claire ?</h3>
              <Bars items={spread(rows, "crank", labels("crank"))} />
            </div>
            <div className="card">
              <h3>À retenir</h3>
              {takeaways.map((t) => <p key={t}>→ {t}</p>)}
              <p className="label" style={{ color: "var(--lilac)" }}>Calculé automatiquement à partir des réponses</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
