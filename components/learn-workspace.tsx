import type { ReactNode } from "react";
import {
  ILLUSTRATIVE_WITHOUT_DIVERSITY,
  ILLUSTRATIVE_WITH_DIVERSITY,
  LEARN_DISCLAIMER,
  LEARN_DOES_NOT_IMPLEMENT,
  LEARN_IMPLEMENTS,
  LEARN_NAV,
  learnSectionHref,
  LEARN_SIGNALS,
  ORGANIC_VS_SPONSORED,
  PERSONALIZATION_COMBOS,
  PIPELINE_STAGES,
  RANKING_FACTORS_COPY,
  type LearnSessionView,
} from "@/lib/learn-view";

interface LearnWorkspaceProps {
  session: LearnSessionView;
  guidedActive: boolean;
  guidedLabel: string | null;
  onOpenFeed: () => void;
  onOpenEngineer: () => void;
  onReturnToWalkthrough: () => void;
}

export function LearnWorkspace({
  session,
  guidedActive,
  guidedLabel,
  onOpenFeed,
  onOpenEngineer,
  onReturnToWalkthrough,
}: LearnWorkspaceProps) {
  return (
    <article
      id="panel-learn"
      role="tabpanel"
      aria-labelledby="mode-learn"
      className="mx-auto flex w-full min-w-0 max-w-[920px] flex-col gap-5"
    >
      {guidedActive ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] px-4 py-3">
          <p className="text-sm text-cyan-50">
            Guided demo in progress
            {guidedLabel ? <span className="text-cyan-100/80"> · {guidedLabel}</span> : null}
          </p>
          <button
            type="button"
            onClick={onReturnToWalkthrough}
            className="rounded-full border border-cyan-300/25 bg-cyan-400/16 px-3.5 py-1.5 text-[12px] font-medium text-cyan-50"
          >
            Return to Walkthrough
          </button>
        </div>
      ) : null}

      <header className="rounded-[1.45rem] border border-violet-300/18 bg-violet-400/[0.06] px-5 py-6 sm:px-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-200/80">
          Learn
        </p>
        <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-slate-50 sm:text-[1.85rem]">
          How Social Feeds Learn About You
        </h2>
        <p className="mt-2 max-w-[42rem] text-sm leading-6 text-slate-400">
          Explore how your interactions can influence what appears in a personalized feed.
        </p>
        <p className="mt-4 text-[11px] leading-5 text-slate-500">{LEARN_DISCLAIMER}</p>
      </header>

      <nav
        aria-label="Learn sections"
        className="sticky top-[4.25rem] z-20 -mx-1 overflow-x-auto rounded-2xl border border-white/8 bg-[#05070d]/92 px-2 py-2 backdrop-blur-md"
      >
        <ul className="flex min-w-max gap-1.5">
          {LEARN_NAV.map((item) => (
            <li key={item.id}>
              <a
                href={learnSectionHref(item.id)}
                className="inline-flex rounded-full border border-white/8 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-violet-300/25 hover:text-violet-50"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <SessionCard session={session} onOpenFeed={onOpenFeed} />
      <PipelineCard session={session} onOpenFeed={onOpenFeed} />
      <SignalsCard />
      <RankingCard onOpenEngineer={onOpenEngineer} />
      <ExplorationCard session={session} />
      <FeedbackCard session={session} />
      <OrganicAdsCard session={session} />
      <LimitsCard />
    </article>
  );
}

function SessionCard({
  session,
  onOpenFeed,
}: {
  session: LearnSessionView;
  onOpenFeed: () => void;
}) {
  return (
    <LearnSection eyebrow="Your session" title="Your Session, Explained">
      {session.hasSession ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Fact label="Actions recorded" value={String(session.actionsRecorded)} />
          <Fact
            label="Top inferred interest"
            value={session.interestLeader ?? "None yet"}
          />
          <Fact
            label="Feed Personalization"
            value={session.personalizationOn ? "On" : "Off"}
          />
          <Fact
            label="Ad Personalization"
            value={session.adPersonalizationOn ? "On" : "Off"}
          />
          <Fact
            label="Organic feed leader"
            value={
              session.personalizationOn && session.organicTopCategory
                ? session.organicTopCategory
                : "Neutral catalog"
            }
          />
          <Fact label="Selected sponsored category" value={session.sponsoredCategory} />
        </dl>
      ) : (
        <EmptyCallout
          message="Your simulation has not collected behavioral signals yet."
          action="Start Exploring"
          onClick={onOpenFeed}
        />
      )}
    </LearnSection>
  );
}

function PipelineCard({
  session,
  onOpenFeed,
}: {
  session: LearnSessionView;
  onOpenFeed: () => void;
}) {
  return (
    <LearnSection
      id="learn-pipeline"
      eyebrow="1 · Pipeline"
      title="The Recommendation Pipeline"
      body="A feed is not one magic score. It is a sequence of guesses, each one imperfect."
    >
      <ol className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-stretch">
        {PIPELINE_STAGES.map((stage, index) => {
          const live =
            stage.id === "signals"
              ? session.signalNote
              : stage.id === "profile"
                ? session.profileNote
                : stage.id === "ranking"
                  ? session.rankingNote
                  : null;
          return (
            <li
              key={stage.id}
              className="flex min-w-0 flex-1 flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-3 lg:min-w-[9.5rem] lg:basis-[calc(25%-0.4rem)]"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-violet-200/70">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h4 className="mt-1 text-sm font-semibold text-slate-50">{stage.label}</h4>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">{stage.beginner}</p>
              {live ? (
                <p className="mt-2 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-2.5 py-1.5 text-[11px] leading-5 text-cyan-50">
                  {live}
                </p>
              ) : stage.id === "signals" || stage.id === "profile" || stage.id === "ranking" ? (
                <div className="mt-2">
                  <EmptyCallout
                    compact
                    message={session.emptyPrompt}
                    action="Try in Feed"
                    onClick={onOpenFeed}
                  />
                </div>
              ) : null}
              {stage.realWorld && stage.feedXray ? (
                <dl className="mt-2 space-y-1.5 text-[11px] leading-5">
                  <div>
                    <dt className="font-medium text-slate-300">Real-world concept</dt>
                    <dd className="text-slate-500">{stage.realWorld}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-300">Feed X-Ray implementation</dt>
                    <dd className="text-slate-500">{stage.feedXray}</dd>
                  </div>
                </dl>
              ) : null}
            </li>
          );
        })}
      </ol>
    </LearnSection>
  );
}

function SignalsCard() {
  return (
    <LearnSection
      id="learn-signals"
      eyebrow="2 · Signals"
      title="What Do Your Actions Tell the System?"
      body="Behavioral signals are imperfect. Inferred interests are educated guesses — not verified personal preferences."
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {LEARN_SIGNALS.map((signal) => (
          <li
            key={signal.id}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <h4 className="text-sm font-semibold text-slate-50">{signal.title}</h4>
            <p className="mt-1 text-sm leading-6 text-slate-300">{signal.beginner}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{signal.caveat}</p>
          </li>
        ))}
      </ul>
    </LearnSection>
  );
}

function RankingCard({ onOpenEngineer }: { onOpenEngineer: () => void }) {
  return (
    <LearnSection
      id="learn-ranking"
      eyebrow="3 · Ranking"
      title="Why Some Posts Move Higher"
      body="Feed X-Ray uses a fictional educational ranking model. These factors are teaching weights, not a production algorithm."
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RANKING_FACTORS_COPY.map((factor) => (
          <li
            key={factor.id}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <h4 className="text-sm font-semibold text-slate-50">{factor.title}</h4>
            <p className="mt-1 text-sm leading-6 text-slate-300">{factor.beginner}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-violet-100/90 underline-offset-2 hover:underline">
                Technical detail
              </summary>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">{factor.technical}</p>
            </details>
          </li>
        ))}
      </ul>
      <details className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
        <summary className="cursor-pointer text-sm text-slate-200">
          Beginner vs technical
        </summary>
        <div className="mt-2 space-y-2 text-sm leading-6 text-slate-400">
          <p>
            <span className="font-medium text-slate-200">Beginner: </span>
            Your interests influence which posts move higher.
          </p>
          <p>
            <span className="font-medium text-slate-200">Technical: </span>
            Feed X-Ray uses a deterministic weighted scoring function and greedy
            placement with diversity penalties.
          </p>
        </div>
      </details>
      <button
        type="button"
        onClick={onOpenEngineer}
        className="rounded-full border border-emerald-300/25 bg-emerald-400/12 px-3.5 py-1.5 text-[12px] font-medium text-emerald-50"
      >
        View Technical Breakdown
      </button>
    </LearnSection>
  );
}

function ExplorationCard({ session }: { session: LearnSessionView }) {
  return (
    <LearnSection
      id="learn-exploration"
      eyebrow="4 · Unexpected posts"
      title="Why Does My Feed Show Things I Didn't Ask For?"
      body="Exploration and diversity are related but not the same. Both can make a feed feel less predictable."
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <h4 className="text-sm font-semibold text-slate-50">Exploration</h4>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            A system may show unfamiliar topics to learn whether the user is interested.
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <h4 className="text-sm font-semibold text-slate-50">Diversity</h4>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            A system may avoid showing too many similar posts consecutively.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ExampleStrip
          label="Illustrative · without diversity"
          items={ILLUSTRATIVE_WITHOUT_DIVERSITY}
        />
        <ExampleStrip
          label="Illustrative · with diversity"
          items={ILLUSTRATIVE_WITH_DIVERSITY}
        />
      </div>
      {session.rankingApplied && session.topOrganicCategories.length > 0 ? (
        <ExampleStrip
          label="Current top of your organic feed"
          items={session.topOrganicCategories}
        />
      ) : (
        <p className="text-xs leading-5 text-slate-500">
          The sequences above are labeled illustrative examples — not your actual feed.
        </p>
      )}
    </LearnSection>
  );
}

function FeedbackCard({ session }: { session: LearnSessionView }) {
  const steps = [
    "You engage with Technology",
    "Technology interest increases",
    "More Technology posts rank higher",
    "You encounter more Technology content",
    "Further engagement may strengthen that interest",
  ];
  return (
    <LearnSection
      id="learn-feedback"
      eyebrow="5 · Feedback loop"
      title="The Feedback Loop"
      body="Recommendation systems can create feedback loops because what you see influences what you interact with next."
    >
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-300/20 bg-violet-400/10 text-[10px] text-violet-100">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-slate-300">{step}</p>
          </li>
        ))}
      </ol>
      {session.interestLeader ? (
        <p className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-400">
          In this session, {session.interestLeader} is your strongest inferred interest.
          Further engagement with it may strengthen that loop — it is not proof of identity
          or a permanent preference.
        </p>
      ) : null}
      <ul className="space-y-1.5 text-sm leading-6 text-slate-400">
        <li>Recommendations can reinforce existing interests.</li>
        <li>Exploration may introduce new topics.</li>
        <li>Negative feedback can change future rankings.</li>
        <li>A recommendation is not proof of someone&apos;s identity or permanent preferences.</li>
        <li>Filter bubbles are a risk to watch, not an inevitable outcome.</li>
      </ul>
    </LearnSection>
  );
}

function OrganicAdsCard({ session }: { session: LearnSessionView }) {
  return (
    <LearnSection
      id="learn-ads"
      eyebrow="6 · Two systems"
      title="Organic Recommendations vs Advertising"
      body={ORGANIC_VS_SPONSORED.separation}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CompareColumn
          title={ORGANIC_VS_SPONSORED.organic.title}
          inputs={ORGANIC_VS_SPONSORED.organic.inputs}
          output={ORGANIC_VS_SPONSORED.organic.output}
        />
        <CompareColumn
          title={ORGANIC_VS_SPONSORED.sponsored.title}
          inputs={ORGANIC_VS_SPONSORED.sponsored.inputs}
          output={ORGANIC_VS_SPONSORED.sponsored.output}
        />
      </div>
      <p className="text-sm leading-6 text-slate-400">{ORGANIC_VS_SPONSORED.adsRemain}</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PERSONALIZATION_COMBOS.map((combo) => {
          const current = combo.id === session.comboId;
          return (
            <li
              key={combo.id}
              className={`rounded-2xl border px-4 py-3 ${
                current
                  ? "border-violet-300/35 bg-violet-400/[0.08]"
                  : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-50">{combo.title}</h4>
                {current ? (
                  <span className="rounded-full border border-violet-300/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-violet-100">
                    Current session
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">{combo.body}</p>
            </li>
          );
        })}
      </ul>
    </LearnSection>
  );
}

function LimitsCard() {
  return (
    <LearnSection
      id="learn-limits"
      eyebrow="7 · Limits"
      title="What Feed X-Ray Simulates — and What It Doesn't"
      body={LEARN_DISCLAIMER}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/16 bg-emerald-400/[0.05] px-4 py-4">
          <h4 className="text-sm font-semibold text-emerald-50">Feed X-Ray implements</h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-300">
            {LEARN_IMPLEMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-300/16 bg-rose-400/[0.05] px-4 py-4">
          <h4 className="text-sm font-semibold text-rose-50">Feed X-Ray does not implement</h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-slate-300">
            {LEARN_DOES_NOT_IMPLEMENT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </LearnSection>
  );
}

function LearnSection({
  id,
  eyebrow,
  title,
  body,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-5 sm:px-5"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-200/70">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">{title}</h3>
      {body ? <p className="mt-1.5 text-sm leading-6 text-slate-400">{body}</p> : null}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}

function EmptyCallout({
  message,
  action,
  onClick,
  compact = false,
}: {
  message: string;
  action: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "rounded-2xl border border-white/8 bg-black/20 px-3.5 py-3"}`}>
      <p className={`text-slate-400 ${compact ? "text-[11px] leading-5" : "text-sm leading-6"}`}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="rounded-full border border-cyan-300/25 bg-cyan-400/14 px-3 py-1.5 text-[12px] font-medium text-cyan-50"
      >
        {action}
      </button>
    </div>
  );
}

function ExampleStrip({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <ol className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-200"
          >
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CompareColumn({
  title,
  inputs,
  output,
}: {
  title: string;
  inputs: readonly string[];
  output: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
      <h4 className="text-sm font-semibold text-slate-50">{title}</h4>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-500">Inputs</p>
      <ul className="mt-1 space-y-1 text-sm leading-6 text-slate-300">
        {inputs.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-500">Output</p>
      <p className="mt-1 text-sm leading-6 text-slate-300">{output}</p>
    </div>
  );
}
