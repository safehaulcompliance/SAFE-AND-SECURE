// Safe & Secure — app (v2)
// + Scroll reveals (IntersectionObserver), word-stagger hero, animated scorecard bars
// + New sections: Live Desk, Meet the Desk, On the Road, Case Study
// + New palette options (midnight + brass + cream default)

const { useState, useEffect, useRef, Fragment } = React;

/* ────────────────────────────────────────────────────────── */
/* Scroll reveal hook                                          */
/* ────────────────────────────────────────────────────────── */
function useReveal() {
  useEffect(()=>{
    window.__revealFired = (window.__revealFired || 0) + 1;
    const SEL = ".reveal, .reveal-x, .reveal-scale, .line-up, .has-bars, .wipe, .clip-r, .clip-l, .clip-b, .run-grid";

    // Kickstart: mark anything already in the viewport on mount.
    const kick = () => {
      window.__kickFired = (window.__kickFired || 0) + 1;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let added = 0;
      document.querySelectorAll(SEL).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) { el.classList.add("in"); added++; }
      });
      window.__kickAdded = added;
    };
    requestAnimationFrame(() => requestAnimationFrame(kick));

    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    document.querySelectorAll(SEL).forEach(el => {
      if (!el.classList.contains("in")) obs.observe(el);
    });
    return ()=>obs.disconnect();
  }, []);
}

/* Line — one row inside a .line-up headline. Wraps content in
   <span class="ln"><i>...</i></span> so the inner <i> can translateY. */
function Line({ children }) {
  return <span className="ln"><i>{children}</i></span>;
}

/* Counter — animates a number from 0 to `to` when scrolled into view. */
function Counter({ to, from=0, duration=1.6, decimals=0, suffix="", prefix="", className="" }) {
  const ref = useRef(null);
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    let raf;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 3);
          setV(from + (to - from) * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(node);
    const r = node.getBoundingClientRect();
    if (r.top < (window.innerHeight || 800) * 0.95 && r.bottom > 0) {
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const eased = 1 - Math.pow(1 - t, 3);
        setV(from + (to - from) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(raf); obs.disconnect(); };
  }, [to, from, duration]);
  const formatted = decimals > 0
    ? v.toFixed(decimals)
    : Math.round(v).toLocaleString("en-US");
  return <span ref={ref} className={`tnum ${className}`}>{prefix}{formatted}{suffix}</span>;
}

/* ────────────────────────────────────────────────────────── */
/* Icons                                                       */
/* ────────────────────────────────────────────────────────── */
const Arrow = ({size=16}) => (
  <svg className="arrow" viewBox="0 0 16 9" width={size} height={size*9/16} fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M0 4.5h14M10 1l4 3.5L10 8"/>
  </svg>
);

/* squiggly annotation arrow */
const AnnotArrow = () => (
  <svg viewBox="0 0 60 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M2 4 C 12 4, 14 22, 24 22 S 44 6, 56 6"/>
    <path d="M50 2 L 56 6 L 52 12"/>
  </svg>
);

/* ────────────────────────────────────────────────────────── */
/* Field — imagery grid of trucking + compliance scenes        */
/* ────────────────────────────────────────────────────────── */
function FieldGrid() {
  const cells = [
    { id: "fc-truck",   tall: true,
      tag: "On the road",      cap: ["LONG-HAUL","FREEDOM"],
      title: <>Your trucks. <em>Our</em> backup.</>,
      src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=90&auto=format&fit=crop",
      placeholder: "Drop a tractor / dry-van photo." },
    { id: "fc-manager", tall: false,
      tag: "Our desk",       cap: ["COMPLIANCE","DONE FOR YOU"],
      title: <>Paperwork? <em>Handled.</em></>,
      src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=90&auto=format&fit=crop",
      placeholder: "Drop a compliance manager at her desk." },
    { id: "fc-paperwork", tall: false,
      tag: "Filings",      cap: ["EVERY FORM","ON TIME"],
      title: <>No more late filings.</>,
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=90&auto=format&fit=crop",
      placeholder: "Drop paperwork / documents." },
    { id: "fc-driver",   tall: false,
      tag: "Drivers",     cap: ["SAFETY FIRST","ALWAYS"],
      title: <>Drivers, protected.</>,
      src: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=90&auto=format&fit=crop",
      placeholder: "Drop a driver doing a pre-trip." },
    { id: "fc-night",    tall: false,
      tag: "24/7 help",     cap: ["DAY OR NIGHT","WE PICK UP"],
      title: <>Call us. Anytime.</>,
      src: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=1200&q=90&auto=format&fit=crop",
      placeholder: "Drop a night-yard / loading-dock photo." },
  ];

  return (
    <section className="field-sec" id="field">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <div className="label">§ Real work, real results</div>
            <h2 className="line-up">
              <Line>From the <em>truck</em> at dawn</Line>
              <Line>to the <em>office</em> at midnight.</Line>
            </h2>
          </div>
          <p className="lede reveal" data-d="2">
            Keeping your trucks safe and your business legal isn&rsquo;t just paperwork. It&rsquo;s a driver
            inspection at sunrise, a clean file by Friday, and a real person answering when you call.
          </p>
        </div>

        <div className="field-grid">
          {cells.map((c, i) => (
            <div key={c.id} className={`field-cell reveal ${c.tall ? "tall" : ""}`} data-d={String(i+1)}>
              <span className={`fc-tag ${i===2 ? "dark" : ""}`}>{c.tag}</span>
              <image-slot id={c.id} shape="rect" placeholder={c.placeholder} src={c.src}></image-slot>
              <div className="fc-cap-bg"></div>
              <div className="fc-title">{c.title}</div>
              <div className="fc-cap">
                <span>{c.cap[0]}</span>
                <span>{c.cap[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Status bar — always-on live ticker above the nav            */
/* ────────────────────────────────────────────────────────── */
function StatusBar() {
  const [time, setTime] = useState("");
  const [rigs, setRigs] = useState(2118);
  const [hos, setHos] = useState(8742);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    const fmt = (d) => {
      const h = d.getHours() % 12 || 12;
      const m = String(d.getMinutes()).padStart(2,"0");
      const s = String(d.getSeconds()).padStart(2,"0");
      return `${h}:${m}:${s}`;
    };
    setTime(fmt(new Date()));
    const t = setInterval(() => setTime(fmt(new Date())), 1000);
    const r = setInterval(() => {
      if (Math.random() > 0.55) {
        setRigs(v => v + 1);
        setBumped(true);
        setTimeout(() => setBumped(false), 600);
      }
      setHos(v => v + Math.floor(Math.random() * 4));
    }, 3200);
    return () => { clearInterval(t); clearInterval(r); };
  }, []);

  return (
    <div className="status-bar">
      <div className="shell status-row">
        <span className="sb-item live"><span className="blip"></span>LIVE · DESK ONLINE</span>
        <span className="sb-item">{time} CT · DALLAS</span>
        <span className="sb-item">N 32.7767° · W 96.7970°</span>
        <span className="sb-spacer"></span>
        <span className="sb-item sb-tick">RIGS TRACKING <b style={{color:"var(--signal)"}}>{rigs.toLocaleString()}</b>{bumped && <span className="badge">+1</span>}</span>
        <span className="sb-item">HOS LOGS <b style={{color:"var(--paper)"}}>{hos.toLocaleString()}</b> / DAY</span>
        <span className="sb-item">ELD HEALTHY</span>
        <span className="sb-item">9 FILINGS QUEUED</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* TickRail — drifting dashed line between sections            */
/* ────────────────────────────────────────────────────────── */
function TickRail() {
  return (
    <div className="tick-rail" aria-hidden>
      <span className="blip"></span>
      <span className="blip"></span>
      <span className="blip"></span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Nav                                                         */
/* ────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="nav">
      <div className="shell nav-row">
        <a className="nav-brand" href="#top">
          <span className="brand-mark">S</span>
          <span>Safe<span className="italic-serif" style={{margin:"0 4px"}}>&amp;</span>Secure</span>
        </a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#run">The Run</a>
          <a href="#field">Field</a>
          <a href="#case">Case file</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta">
          <span className="usdot-chip"><span className="dot"></span>USDOT 3492118 · ACTIVE</span>
          <a className="btn btn--signal" href="#contact">Free fleet audit <Arrow/></a>
        </div>
      </div>
    </nav>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Hero                                                        */
/* ────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero-cine" id="top">
      <div className="hero-cine-bg">
        <image-slot id="hero-main"
          shape="rect"
          placeholder="Drop a hero truck photo — fleet tractor pulling a dry van."
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=2400&q=92&auto=format&fit=crop"
        ></image-slot>
      </div>
      <div className="hero-cine-scrim"></div>
      <div className="hero-cine-vignette"></div>

      <div className="hero-cine-inner">
        <div className="hero-cine-eyebrow reveal">
          <span className="dot-live"></span>
          <span>USDOT · FMCSA · IFTA · IRP partners</span>
          <span className="sep"></span>
          <span>EST. 2009 · DALLAS, TX</span>
        </div>

        <h1 className="hero-cine-title line-up">
          <Line>You drive the <em>trucks</em>.</Line>
          <Line>We handle the <em>rest</em>.</Line>
        </h1>

        <p className="hero-cine-sub reveal" data-d="4">
          Running a trucking company shouldn&rsquo;t mean drowning in DOT forms, audits,
          and late-night phone calls. We take all of it off your plate — compliance,
          logs, fuel tax, driver files, and inspections.
          <span className="hero-cine-accent"> So you can focus on the road.</span>
        </p>

        <div className="hero-cine-cta reveal" data-d="5">
          <a className="btn btn--signal" href="#contact">Get a free check-up <Arrow/></a>
          <a className="btn btn--ghost-light" href="#services">See how we help</a>
        </div>

        <div className="hero-cine-foot reveal" data-d="6">
          <div className="hcf-item">
            <span className="hcf-num">540+</span>
            <span className="hcf-lbl">fleets served</span>
          </div>
          <div className="hcf-divider"></div>
          <div className="hcf-item">
            <span className="hcf-num">99.4%</span>
            <span className="hcf-lbl">audit pass rate</span>
          </div>
          <div className="hcf-divider"></div>
          <div className="hcf-item">
            <span className="hcf-num">15 yrs</span>
            <span className="hcf-lbl">on the road</span>
          </div>
        </div>
      </div>

      <div className="hero-cine-tag">
        <span className="hct-dot"></span>
        <span>LIVE · DALLAS, TX</span>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Below-hero strip                                            */
/* ────────────────────────────────────────────────────────── */
function ScoreBar({ name, val, max=100, kind }) {
  const pct = Math.round((val/max)*100);
  return (
    <div className={`sc-bar ${kind||""}`} style={{"--w": `${pct}%`}}>
      <span className="name">{name}</span>
      <span className="val">{val}<span style={{opacity:.5}}> / {max}</span></span>
      <div className="track"><div className="fill"></div></div>
    </div>
  );
}

function BelowHero() {
  return (
    <div className="shell reveal" data-d="2">
      <div className="belowhero">
        <div className="bh-img clip-r">
          <span className="corner-tag">YOUR FLEET, PROTECTED</span>
          <image-slot id="hero-truck"
            shape="rect"
            placeholder="Drop a hero photo — fleet tractor pulling a dry van at dawn works best."
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1600&q=90&auto=format&fit=crop"
          ></image-slot>
          <div className="img-overlay">
            <span className="cap">A safe rig is a profitable rig</span>
            <span className="num">Dallas, Texas</span>
          </div>
        </div>

        <div className="scorecard has-bars">
          <div className="sc-head">
            <span>Fleet · TXR-1184 · Q2 audit</span>
            <span className="live"><span className="blip"></span>Live</span>
          </div>
          <div className="sc-score tnum">
            <Counter to={98} duration={1.8} className="big" />
            <span className="small">/ 100</span>
          </div>
          <div className="sc-label" style={{fontSize:14, fontFamily:"var(--f-mono)", letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-2)", marginTop:6}}>
            Compliance health — Excellent
          </div>
          <div className="sc-bars">
            <ScoreBar name="DOT inspections" val={100} kind="good"/>
            <ScoreBar name="ELD / HOS hours" val={97} kind="good"/>
            <ScoreBar name="IFTA Q2 filing"   val={100} kind="good"/>
            <ScoreBar name="CSA · Unsafe Drv." val={42} max={100} kind="warn"/>
            <ScoreBar name="DQ files current" val={96} kind="good"/>
          </div>
        </div>

        <div className="stats">
          <div className="group">
            <div className="lbl">Fleets served</div>
            <div className="num tnum"><Counter to={540} duration={2}/><em>+</em></div>
            <div className="sub">From 2-truck owner-ops to 400-rig carriers.</div>
          </div>
          <div className="group">
            <div className="lbl">Audit pass rate</div>
            <div className="num tnum"><Counter to={99.4} decimals={1} duration={2}/><em>%</em></div>
            <div className="sub">17 of 1,902 audits had findings since 2019.</div>
          </div>
          <div className="group">
            <div className="lbl">In business</div>
            <div className="num tnum"><Counter to={15} duration={1.4}/><em>yrs</em></div>
            <div className="sub">Through ELD, AOBRD, and Clearinghouse.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Trust marquee                                               */
/* ────────────────────────────────────────────────────────── */
function Marquee() {
  const items = [
    ["USDOT", "Federal motor carrier"],
    ["FMCSA", "Safety regulation"],
    ["IFTA",  "Fuel tax"],
    ["IRP",   "Apportioned plates"],
    ["ELD",   "Electronic logging"],
    ["CSA",   "BASICs management"],
    ["MCS-150","Biennial update"],
    ["UCR",   "Unified carrier reg."],
    ["HM-181","Hazmat"],
    ["Clearinghouse","Drug & alcohol"],
  ];
  const Row = () => (
    <div className="marquee-row">
      <span style={{fontFamily:"var(--f-mono)", fontSize:11, letterSpacing:".18em", textTransform:"uppercase", color:"var(--ink)"}}>
        Fluent in →
      </span>
      {items.map((it,i)=>(
        <React.Fragment key={i}>
          <span className="item">{it[0]}<small>{it[1]}</small></span>
          {i<items.length-1 && <span className="star">✦</span>}
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        <Row/><Row/>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Live Desk feed                                              */
/* ────────────────────────────────────────────────────────── */
function LiveDesk() {
  const items = [
    ["09:47", "done", "Filed Q2 IFTA — 8 jurisdictions",          "Hernandez Logistics"],
    ["09:42", "win",  "DataQ win · inspection #91-2304 vacated",  "BlueRidge Carriers"],
    ["09:38", "work", "Drafting MCS-150 biennial update",         "Cascade Freight"],
    ["09:31", "done", "Cleared 4 driver MVRs through Clearinghouse","Sunbelt Express"],
    ["09:24", "work", "Coaching call · CSA Unsafe Driving",       "Plainview Transport"],
    ["09:19", "win",  "Renewal -12% · primary liability bound",    "Mesa Diesel Co."],
    ["09:11", "done", "Filed IRP renewal · 14 power units",        "Coastline Hauling"],
    ["09:04", "work", "Preparing DQ file for FMCSA audit",         "Northwoods Wood"],
    ["08:58", "done", "DOT roadside · clean inspection logged",    "Hernandez Logistics"],
    ["08:51", "win",  "MCS-90 endorsement re-issued in 6 hours",   "AltaPeak LLC"],
  ];
  const Row = ({it, i}) => (
    <li key={i}>
      <span className="t">{it[0]}</span>
      <span className="what">{it[2]}</span>
      <span className={`kind ${it[1]}`}>{it[1] === "done" ? "Closed" : it[1] === "win" ? "Win" : "Working"}</span>
      <span className="who">{it[3]}</span>
    </li>
  );
  return (
    <section className="live-desk">
      <div className="shell ld-grid">
        <div className="reveal">
          <div className="eyebrow">§ The desk, right now</div>
          <h3 className="ld-lede line-up">
            <Line>The work isn&rsquo;t in <em>slides</em>.</Line>
            <Line>It&rsquo;s in the inbox, the audit folder,</Line>
            <Line>and the 2 a.m. call from Laredo.</Line>
          </h3>
          <p className="ld-sub">
            A rolling sample of what came across the desk this morning. Every line is a real
            recurring item — filings closed, DataQ wins booked, calls coached.
          </p>
          <div style={{marginTop:18, display:"flex", gap:24, fontFamily:"var(--f-mono)", fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:"var(--mute-2)"}}>
            <span><b style={{color:"var(--signal)", fontFamily:"var(--f-sans)", fontSize:14}}>184</b> items / day</span>
            <span><b style={{color:"var(--signal)", fontFamily:"var(--f-sans)", fontSize:14}}>38 min</b> avg reply</span>
            <span><b style={{color:"var(--signal)", fontFamily:"var(--f-sans)", fontSize:14}}>24 / 7</b> coverage</span>
          </div>
        </div>

        <div className="ld-feed reveal-scale">
          <div className="ld-feed-head">
            <span>Today · Wed · 09:48 CT</span>
            <span className="live"><span className="blip"></span>Streaming</span>
          </div>
          <div className="ld-items">
            <ul>
              {items.map((it,i)=> <Row it={it} i={i} key={i}/>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Services                                                    */
/* ────────────────────────────────────────────────────────── */
const SERVICES = [
  { n: "01", title: <>DOT <em>compliance</em>, sorted</>,
    blurb: "Every form, filing, and renewal the DOT throws at you — we handle it. Your authority stays active, your file stays clean, and inspectors have nothing to flag.",
    meta: "Forms · Filings · Renewals" },
  { n: "02", title: <>Driver logs &amp; <em>hours</em></>,
    blurb: "We watch your drivers' hours in real time on whatever ELD you use — Samsara, Motive, Geotab, you name it. We catch problems before they become tickets.",
    meta: "Works with every ELD" },
  { n: "03", title: <>Fuel tax (<em>IFTA</em>) &amp; plates</>,
    blurb: "Quarterly fuel tax filings and plate renewals across all 48 states and Canada. You send us the miles and fuel — we do the math and file on time.",
    meta: "All 48 states + Canada" },
  { n: "04", title: <>Driver files, <em>audit-ready</em></>,
    blurb: "MVRs, medical cards, drug tests, road tests — every driver file kept current and organized. When the auditor asks, we have it pulled up in minutes.",
    meta: "Always inspection-ready" },
  { n: "05", title: <>Fight unfair <em>tickets</em></>,
    blurb: "Got a roadside inspection that wasn't your fault? We challenge it. Last year we cleared 71% of the violations we fought — keeping your safety score clean.",
    meta: "71% win rate" },
  { n: "06", title: <>Lower <em>insurance</em> rates</>,
    blurb: "We shop your insurance every renewal — liability, cargo, and physical damage. Our customers save 9% on average compared to what they were paying before.",
    meta: "Save 9% on average" },
];

function Services() {
  return (
    <section className="sec shell" id="services">
      <div className="sec-head">
        <div className="reveal">
          <div className="label">§ What we do — 01 / 06</div>
          <h2 className="line-up"><Line>Everything you need.</Line><Line><em>One team to call.</em></Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Most trucking companies juggle a dozen vendors — one for insurance, one for IFTA, one for
          ELDs, one for audits. We do it all under one roof, with one phone number, signed by real people.
        </p>
      </div>

      <div className="services">
        {SERVICES.map((s,i)=>(
          <article key={i} className="service reveal" data-d={String(i+1)}>
            <div>
              <div className="svc-num">{s.n} / 06</div>
              <h3 className="svc-title">{s.title}</h3>
              <p className="svc-blurb">{s.blurb}</p>
            </div>
            <div className="svc-meta">
              <span>{s.meta}</span>
              <span className="svc-arrow"><Arrow/></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* On the road — full-bleed image                              */
/* ────────────────────────────────────────────────────────── */
function OnTheRoad() {
  return (
    <section className="road">
      <div className="road-img">
        <div className="clip-r" style={{position:"absolute", inset:0}}>
          <image-slot id="road-fleet"
            shape="rect"
            placeholder="Drop a wide highway/fleet photo here."
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=2000&q=95&auto=format&fit=crop"
          ></image-slot>
        </div>

        <div className="road-overlay">
          <div className="road-tag reveal">
            <span>§ ON THE ROAD — INTERSTATE 35 · 04:42 CT</span>
            <span className="live"><span className="blip"></span>Tracking 2,118 rigs</span>
          </div>

          <h2 className="road-title line-up">
            <Line>Compliance never <em>sleeps</em>.</Line>
            <Line>Neither do we.</Line>
          </h2>

          <div className="road-bottom">
            <div className="road-stat reveal" data-d="1">
              <div className="lbl">Rigs monitored</div>
              <div className="v tnum"><Counter to={2118} duration={2.2}/></div>
            </div>
            <div className="road-stat reveal" data-d="2">
              <div className="lbl">States covered</div>
              <div className="v tnum"><Counter to={48} duration={1.4}/></div>
            </div>
            <div className="road-stat reveal" data-d="3">
              <div className="lbl">After-hours pickups</div>
              <div className="v tnum"><Counter to={100} duration={1.6}/>%</div>
            </div>
            <div className="road-stat reveal" data-d="4">
              <div className="lbl">Driver portal</div>
              <div className="v tnum">EN · ES · PA</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Meet the desk — team                                        */
/* ────────────────────────────────────────────────────────── */
function MeetDesk() {
  const team = [
    { id: "team-1", role: "Lead · Audit & DataQ", name: <>Marisol <em>Vega</em></>,
      bio: "12 years on the FMCSA side before joining. Has personally argued — and won — 1,551 DataQ challenges across 41 states.",
      stats: [["Years","12"],["DataQ wins","1,551"],["State","TX·IL·CA"]],
      badge: "Lead",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop" },
    { id: "team-2", role: "ELD & HOS · 24/7 Desk", name: <>Bryan <em>Park</em></>,
      bio: "Reads HOS logs the way other people read newspapers. The reason your driver gets a text before they get a violation.",
      stats: [["Years","8"],["Logs / wk","18k"],["Platforms","6"]],
      badge: "ELD",
      src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&auto=format&fit=crop" },
    { id: "team-3", role: "Insurance · Risk", name: <>Dee <em>Coleman</em></>,
      bio: "Builds the loss-runs story underwriters actually read. Last cycle she negotiated 9% under market on 41 of 44 renewals.",
      stats: [["Years","15"],["Renewals","–9%"],["Markets","27"]],
      badge: "Risk",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80&auto=format&fit=crop" },
  ];
  return (
    <section className="desk" id="desk">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <div className="label">§ The desk — three names, not a ticket queue</div>
            <h2 className="line-up"><Line>You'll know who's</Line><Line>doing your <em>work</em>.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            We hire compliance managers, not account managers. Every fleet gets a named lead, a
            named backup, and a direct line. No queues, no chatbots, no &ldquo;let me transfer you.&rdquo;
          </p>
        </div>

        <div className="desk-grid">
          {team.map((m,i)=>(
            <article key={m.id} className="desk-card reveal" data-d={String(i+1)}>
              <div className="portrait">
                <span className="badge">{m.badge}</span>
                <image-slot id={m.id} shape="rect" placeholder={`Drop portrait — ${m.badge} lead.`} src={m.src}></image-slot>
              </div>
              <div className="meta">
                <span className="role">{m.role}</span>
                <h4>{m.name}</h4>
                <p className="bio">{m.bio}</p>
                <div className="stats-row">
                  {m.stats.map(([k,v],j)=>(
                    <span key={j}>{k}<b>{v}</b></span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* The Run — process                                           */
/* ────────────────────────────────────────────────────────── */
function TheRun() {
  const steps = [
    { mm: "MILE 000", kind: "Diagnose", title: <>We <em>read</em> your fleet</>,
      p: "A 90-minute discovery: DOT file, CSA snapshot, last 4 quarters of IFTA, current ELD config, DQ folders, and active insurance loss-runs.",
      list: [["Deliverable","Audit memo"],["Time","48 hours"],["Cost","$0"]] },
    { mm: "MILE 250", kind: "Plan", title: <>We <em>draw</em> the route</>,
      p: "A 12-week roadmap with named owners on our side, deadlines, and exactly which violations stop showing up in 30, 60, and 90 days.",
      list: [["Deliverable","Compliance plan"],["Time","1 week"],["Owners","2 named"]] },
    { mm: "MILE 500", kind: "Drive", title: <>We <em>run</em> the desks</>,
      p: "We file, monitor, train, and pick up the phone when an officer in Laredo calls about a duty-status edit at 2 a.m. The work just gets done.",
      list: [["Coverage","24 / 7 desk"],["SLA","2 hr replies"],["Reports","Monthly"]] },
    { mm: "MILE 1K", kind: "Defend", title: <>We <em>show</em> the work</>,
      p: "Quarterly reviews with your ops lead. Every BASIC trend, every DataQ win, every dollar saved on renewal — on paper, on time, every time.",
      list: [["Cadence","Quarterly"],["Format","On-site or Zoom"],["Renewal","-9% avg"]] },
  ];
  return (
    <section className="run" id="run">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <div className="label eyebrow">§ The Run — how we work</div>
            <h2 className="line-up"><Line>From <em>kickoff</em></Line><Line>to <em>quarterly review</em>.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            Every account follows the same four mile-markers. No surprise upsells, no
            month-three handoffs to a junior, no “let me check with my manager.”
          </p>
        </div>

        <div className="run-grid">
          <div className="run-line" aria-hidden></div>
          {steps.map((s,i)=>(
            <div key={i} className="run-step reveal" data-d={String(i+1)}>
              <div className="run-marker">
                <span className="mm"><span className="mm-dot"></span>{s.mm}</span>
                <span>{s.kind}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.p}</p>
              <ul>
                {s.list.map(([k,v],j)=>(
                  <li key={j}><span>{k}</span>{v}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="highway-band" aria-hidden></div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Case study                                                  */
/* ────────────────────────────────────────────────────────── */
function CaseStudy() {
  return (
    <section className="case" id="case">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <div className="label">§ Case file — 2024-Q3 · Hernandez Logistics</div>
            <h2 className="line-up"><Line>From a <em>conditional</em></Line><Line>rating to <em>satisfactory</em>.</Line><Line>In 11 months.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            Hernandez came to us after a compliance review dropped them to Conditional — and their
            insurance broker quoted a 38% renewal hike. We re-built their DQ folder, restructured
            HOS coaching, and filed 84 DataQs over three quarters.
          </p>
        </div>

        <div className="case-grid">
          <div className="case-img clip-l">
            <span className="corner-tag">FIG. 02 · The Hernandez yard</span>
            <image-slot id="case-photo" shape="rect"
              placeholder="Drop a yard / shop photo — natural daylight, a tractor or a manager at work."
              src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1400&q=85&auto=format&fit=crop"></image-slot>
            <div className="corner-foot">
              <span>San Antonio, TX</span>
              <span>104 power units</span>
            </div>
          </div>

          <div className="case-body reveal-x" data-d="2">
            <div>
              <div className="label">The client said</div>
              <blockquote className="quote">
                We had three weeks before our renewal quote and a Conditional rating
                on the door. The Safe &amp; Secure desk picked up the phone, drove down to
                San Antonio, and four days later we had a plan I could actually run.
              </blockquote>
              <div className="case-byline">
                <span className="who">Lúcio Hernandez</span>
                <span className="role">Owner / Hernandez Logistics · USDOT 2884003</span>
              </div>
            </div>

            <div className="case-numbers">
              <div>
                <div className="lbl">Rating</div>
                <div className="v">Cond. <em>→</em> Sat.</div>
              </div>
              <div>
                <div className="lbl">Renewal Δ</div>
                <div className="v tnum">–<Counter to={14} duration={1.6} className="" />%</div>
              </div>
              <div>
                <div className="lbl">DataQs won</div>
                <div className="v tnum"><Counter to={71}/><em>/</em><Counter to={84}/></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Values                                                      */
/* ────────────────────────────────────────────────────────── */
function Values() {
  const items = [
    { g:"&", h:"Plain English",    p:"No regulator-speak in our emails. If a driver in Tulsa can't understand it, we re-write it." },
    { g:"§", h:"Paper trail",      p:"Every recommendation links back to a CFR cite. Every win has a screenshot. Audits become boring." },
    { g:"✱", h:"Same desk",        p:"You get a named lead and a named backup. Not a ticket queue, not a chatbot, not a rotating CSM." },
    { g:"→", h:"Skin in the game", p:"If you fail an audit on something we manage, we eat the consulting fee — and pay the re-mediation hours." },
  ];
  return (
    <section className="sec shell" id="values">
      <div className="sec-head">
        <div className="reveal">
          <div className="label">§ The principles — 04</div>
          <h2 className="line-up"><Line>What we'll <em>never</em></Line><Line>charge you for.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Trucking compliance is one of the few industries where the customer doesn&rsquo;t know if the work
          got done until something goes wrong. We don&rsquo;t hide behind that.
        </p>
      </div>
      <div className="values">
        {items.map((it,i)=>(
          <div key={i} className="value reveal" data-d={String(i+1)}>
            <div className="glyph">{it.g}</div>
            <div>
              <h4>{it.h}</h4>
              <p>{it.p}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Numbers band                                                */
/* ────────────────────────────────────────────────────────── */
function Numbers() {
  return (
    <section className="numbers" id="numbers">
      <div className="shell numbers-grid">
        <p className="lede reveal">
          The work, in <em>numbers</em> — pulled from 540 active fleets,<br/>
          fiscal year 2025.
        </p>
        <div className="num-card reveal" data-d="1">
          <div className="lbl">Avg. renewal</div>
          <div className="v tnum">-<Counter to={9} duration={1.6}/>%</div>
          <div className="s">Year-over-year primary liability premium.</div>
        </div>
        <div className="num-card reveal" data-d="2">
          <div className="lbl">DataQ win rate</div>
          <div className="v tnum"><Counter to={71} duration={1.8}/>%</div>
          <div className="s">2,184 challenges filed · 1,551 successful.</div>
        </div>
        <div className="num-card reveal" data-d="3">
          <div className="lbl">Time to audit</div>
          <div className="v tnum"><Counter to={11} duration={1.5}/><span style={{fontSize:32}}>min</span></div>
          <div className="s">Median time to produce a full DQ file from request.</div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Contact                                                     */
/* ────────────────────────────────────────────────────────── */
function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section className="contact shell" id="contact">
      <div className="sec-head">
        <div className="reveal">
          <div className="label">§ The first conversation</div>
          <h2 className="line-up"><Line>Tell us about</Line><Line>your <em>fleet</em>.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Send us your USDOT number and the last three months of CSA. We&rsquo;ll come back inside 48 hours
          with the three things we&rsquo;d fix first — for free, in plain English, signed by a real person.
        </p>
      </div>

      <div className="contact-grid">
        <div className="reveal">
          <div className="contact-meta">
            <div className="cm-row">
              <span className="k">Phone</span>
              <span className="v">+1 (214) 555-COMPLY</span>
              <span className="x">M – F · 7a – 7p CT</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">After hours</span>
              <span className="v">+1 (214) 555-0911</span>
              <span className="x">24 / 7 desk · roadside</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">Email</span>
              <span className="v">example@gmail.com</span>
              <span className="x">Avg. reply · 38 min</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">Office</span>
              <span className="v">1402 Commerce St · Dallas, TX 75201</span>
              <span className="x">Walk-ins welcome</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">USDOT</span>
              <span className="v mono tnum">3492118</span>
              <span className="x">Active · Authority for hire</span>
            </div>
          </div>

          <div style={{marginTop:48, paddingTop:24, borderTop:"1px solid var(--rule-soft)"}}>
            <div className="eyebrow" style={{marginBottom:14}}>§ What you&rsquo;ll get back</div>
            <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:10, fontSize:14.5}}>
              <li style={{display:"flex", gap:12}}>
                <span className="mono" style={{color:"var(--mute)"}}>01</span>
                A one-page audit memo, signed.
              </li>
              <li style={{display:"flex", gap:12}}>
                <span className="mono" style={{color:"var(--mute)"}}>02</span>
                The three things we&rsquo;d fix first — with CFR cites.
              </li>
              <li style={{display:"flex", gap:12}}>
                <span className="mono" style={{color:"var(--mute)"}}>03</span>
                A flat-rate proposal. No retainers, no surprises.
              </li>
            </ul>
          </div>
        </div>

        <form className="form reveal-x" onSubmit={(e)=>{e.preventDefault(); setSent(true);}}>
          <h3>Free fleet audit <span className="italic-serif" style={{color:"var(--mute)"}}>—  48-hour turnaround</span></h3>

          <div className="form-row">
            <div className="field">
              <label>Your name <span className="req">*</span></label>
              <input required placeholder="Rajeshwar Singh"/>
            </div>
            <div className="field">
              <label>Role</label>
              <select defaultValue="">
                <option value="" disabled>Select a role…</option>
                <option>Owner-operator</option>
                <option>Safety / compliance</option>
                <option>Ops / dispatch</option>
                <option>Finance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Email <span className="req">*</span></label>
              <input type="email" required placeholder="example@gmail.com"/>
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" placeholder="(214) 555-0144"/>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>USDOT # <span className="req">*</span></label>
              <input required placeholder="3492118"/>
            </div>
            <div className="field">
              <label>Fleet size</label>
              <select defaultValue="">
                <option value="" disabled>How many power units?</option>
                <option>1 – 5</option>
                <option>6 – 25</option>
                <option>26 – 100</option>
                <option>100+</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>What&rsquo;s the headache today? <span style={{color:"var(--mute)"}}>(optional)</span></label>
            <textarea placeholder="e.g. We're 5 days from an MCS-150 update and our CSA in Unsafe Driving is climbing."></textarea>
          </div>

          <button className="btn btn--signal" type="submit" style={{width:"100%", justifyContent:"center", height:54}}>
            {sent ? "Got it — we'll be in touch within 48 hours" : (<>Send for audit <Arrow/></>)}
          </button>
          <div style={{marginTop:14, fontFamily:"var(--f-mono)", fontSize:10.5, letterSpacing:".12em", textTransform:"uppercase", color:"var(--mute)"}}>
            Encrypted in transit · No third-party trackers
          </div>
        </form>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Footer                                                      */
/* ────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot-top">
          <div className="foot-brand">
            <h3 className="line-up">
              <Line>Safe<em>&amp;</em></Line>
              <Line>Secure.</Line>
            </h3>
            <p>Compliance and safety for American trucking. Dallas, since 2009. A real desk, not a portal.</p>
          </div>
          <div className="foot-col">
            <h5>Services</h5>
            <a href="#services">DOT &amp; FMCSA</a>
            <a href="#services">ELD &amp; HOS</a>
            <a href="#services">IFTA &amp; IRP</a>
            <a href="#services">Driver qualification</a>
            <a href="#services">CSA defense</a>
            <a href="#services">Insurance</a>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a>About</a>
            <a>Our desk</a>
            <a>Case files</a>
            <a>Press</a>
            <a>Careers — 3 open</a>
          </div>
          <div className="foot-col">
            <h5>Reach us</h5>
            <a>+1 (214) 555-COMPLY</a>
            <a>example@gmail.com</a>
            <a>1402 Commerce St, Dallas TX</a>
            <a>USDOT 3492118</a>
            <a>MC 1,209,447</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Safe &amp; Secure Compliance Co. — All rights reserved.</span>
          <span>Made in Texas · Audited in 48 states</span>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Tweaks                                                      */
/* ────────────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#C9A04A","#0A1525","#EDE6D2"],
  "italicAccents": true,
  "marquee": false,
  "grain": true
}/*EDITMODE-END*/;

function applyPalette(p) {
  const r = document.documentElement;
  r.style.setProperty("--signal", p[0]);
  r.style.setProperty("--ink",    p[1]);
  r.style.setProperty("--paper",  p[2]);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useReveal();

  useEffect(()=>{ applyPalette(t.palette); }, [t.palette]);
  useEffect(()=>{
    document.body.classList.toggle("no-italics", !t.italicAccents);
    document.body.classList.toggle("grain", !!t.grain);
  }, [t.italicAccents, t.grain]);

  return (
    <>
      <Nav/>
      <Hero/>
      <BelowHero/>
      {t.marquee && <Marquee/>}
      <LiveDesk/>
      <Services/>
      <FieldGrid/>
      <OnTheRoad/>
      <TheRun/>
      <CaseStudy/>
      <Values/>
      <Numbers/>
      <Contact/>
      <Footer/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette"/>
        <TweakColor
          label="Theme"
          value={t.palette}
          options={[
            ["#C9A04A","#0A1525","#EDE6D2"],  // brass · midnight · cream  (default)
            ["#2F6A48","#0E1F1A","#ECE6D4"],  // forest · espresso · bone
            ["#D6533F","#11141A","#EDE7DA"],  // ember · charcoal · linen
            ["#1F8F8F","#0B1F26","#E8E5DA"],  // teal · deep · paper
            ["#E5B83C","#0F1B0F","#E9E6D4"],  // saffron · forest · cream
            ["#D9531E","#14171C","#F2ECE0"],  // industrial orange (original)
          ]}
          onChange={(v)=>setTweak("palette", v)}
        />
        <TweakSection label="Display"/>
        <TweakToggle label="Italic serif accents" value={t.italicAccents} onChange={(v)=>setTweak("italicAccents", v)}/>
        <TweakToggle label="Trust marquee" value={t.marquee} onChange={(v)=>setTweak("marquee", v)}/>
        <TweakToggle label="Paper grain" value={t.grain} onChange={(v)=>setTweak("grain", v)}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
