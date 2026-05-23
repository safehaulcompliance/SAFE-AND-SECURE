// Safe Haul Compliance — app (v2)
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
      src: "https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=1600&q=90&auto=format&fit=crop",
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
          <img src="logo.svg" alt="Safe Haul Compliance" className="nav-logo"/>
        </a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#values">Expertise</a>
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
          <span>MC AUTHORITY · IFTA · IRP · PERMITS</span>
          <span className="sep"></span>
          <span>EST. 2009 · ONTARIO, CANADA</span>
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
        <span>LIVE · ONTARIO, CANADA</span>
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
            <span className="num">Mississauga, Ontario</span>
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
            <ScoreBar name="MC Authority active" val={100} kind="good"/>
            <ScoreBar name="HOS / ELD logs" val={97} kind="good"/>
            <ScoreBar name="IFTA filings" val={100} kind="good"/>
            <ScoreBar name="DQ files current" val={96} kind="good"/>
            <ScoreBar name="Permits valid" val={100} kind="good"/>
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
            <div className="sub">From owner-operators to 100+ truck fleets.</div>
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
    ["MC Authority", "Get your operating authority"],
    ["DQ Files",     "Driver qualification files"],
    ["Driver Hiring","Onboarding new drivers"],
    ["HOS",          "Hours of service logs"],
    ["IFTA",         "Fuel tax filings"],
    ["IRP",          "Apportioned plates"],
    ["Permits",      "All permit types"],
    ["UCR",          "Unified carrier registration"],
    ["Audits",       "Audit-ready files"],
    ["24/7 Desk",    "Real people, anytime"],
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
    ["09:47", "done", "Filed quarterly IFTA — 8 provinces & states", "Maple Ridge Transport"],
    ["09:42", "win",  "New MC Authority approved in 11 days",        "BlueRidge Carriers"],
    ["09:38", "work", "Drafting permit renewal package",             "Cascade Freight"],
    ["09:31", "done", "Onboarded 4 new drivers — all road-ready",    "Sunbelt Express"],
    ["09:24", "work", "Hiring screening for 2 new drivers",          "Plainview Transport"],
    ["09:19", "done", "Updated DQ files for 12 drivers",             "Mesa Diesel Co."],
    ["09:11", "done", "Filed IRP renewal · 14 power units",          "Coastline Hauling"],
    ["09:04", "work", "Preparing audit file for review",             "Northwoods Wood"],
    ["08:58", "done", "Roadside inspection — clean log filed",       "Maple Ridge Transport"],
    ["08:51", "win",  "Oversize permit issued in 4 hours",           "AltaPeak LLC"],
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
          <h3 className="ld-lede line-up">
            <Line>What we&rsquo;re <em>working on</em></Line>
            <Line>for our customers</Line>
            <Line>right now.</Line>
          </h3>
          <p className="ld-sub">
            Real work, real customers — a quick look at what came across our desk this morning.
            Filings done, permits approved, drivers onboarded.
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
  { n: "01", title: <>MC <em>Authority</em></>,
    blurb: "Get your operating authority and keep it legal. We handle all the paperwork so you can start or grow your trucking business.",
    meta: "New + Renewals" },
  { n: "02", title: <>DQ <em>Files</em></>,
    blurb: "Driver records kept current. Medical exams, tests, background checks — everything filed and ready for inspections.",
    meta: "Always audit-ready" },
  { n: "03", title: <>Driver <em>Hiring</em></>,
    blurb: "New drivers checked and ready. We do the background checks and paperwork so you know your team is safe and legal.",
    meta: "Onboarding + checks" },
  { n: "04", title: <>HOS <em>Monitoring</em></>,
    blurb: "Track driver hours in real time. We watch for safety issues and keep your logs clean with any ELD system.",
    meta: "Works with every ELD" },
  { n: "05", title: <>IFTA &amp; <em>IRP</em></>,
    blurb: "Fuel tax and registration filed on time, every time. All provinces and states covered.",
    meta: "Filed every quarter" },
  { n: "06", title: <>Permits, <em>handled</em></>,
    blurb: "All permits applied and renewed — UCR, oversize, hazmat, fuel. Nothing missed, nothing late.",
    meta: "All Canadian + US" },
];

function Services() {
  return (
    <section className="sec shell" id="services">
      <div className="sec-head">
        <div className="reveal">
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
            src="https://images.unsplash.com/photo-1578575494546-b5fc5eac614f?w=2000&q=95&auto=format&fit=crop"
          ></image-slot>
        </div>

        <div className="road-overlay">
          <div className="road-tag reveal">
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
    { id: "team-1", role: "Lead · MC Authority & Audits", name: <>Marisol <em>Vega</em></>,
      bio: "12 years helping trucking companies get their MC Authority and stay audit-ready. She knows every form and every deadline.",
      stats: [["Years","12"],["Authorities filed","800+"],["Audits passed","99%"]],
      badge: "Lead",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop" },
    { id: "team-2", role: "HOS & ELD · 24/7 Desk", name: <>Bryan <em>Park</em></>,
      bio: "Reads HOS logs the way other people read newspapers. The reason your driver gets a text before they get a violation.",
      stats: [["Years","8"],["Logs / wk","18k"],["ELD platforms","6"]],
      badge: "HOS",
      src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&auto=format&fit=crop" },
    { id: "team-3", role: "Driver Hiring & DQ Files", name: <>Dee <em>Coleman</em></>,
      bio: "Handles new driver onboarding from start to finish — background checks, paperwork, abstracts. So your drivers are ready to drive.",
      stats: [["Years","15"],["Drivers hired","2,400+"],["Provinces","13"]],
      badge: "Hiring",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80&auto=format&fit=crop" },
  ];
  return (
    <section className="desk" id="desk">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <h2 className="line-up"><Line>You'll know who&rsquo;s</Line><Line>doing your <em>work</em>.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            We&rsquo;re compliance experts, not call-center reps. You get one person handling your
            account, a backup, and a direct phone line. No tickets, no chatbots, no transfers.
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
    { mm: "STEP 01", kind: "Look", title: <>We <em>look</em> at your fleet</>,
      p: "A free 60-minute call. We review your MC Authority, IFTA filings, driver files, and permits to spot what's missing or about to expire.",
      list: [["You get","Audit report"],["Time","48 hours"],["Cost","Free"]] },
    { mm: "STEP 02", kind: "Plan", title: <>We <em>make</em> a plan</>,
      p: "A simple step-by-step plan with deadlines, who owns what, and exactly what gets fixed in 30, 60, and 90 days. No surprises.",
      list: [["You get","Action plan"],["Time","1 week"],["Owners","2 named"]] },
    { mm: "STEP 03", kind: "Do", title: <>We <em>do</em> the work</>,
      p: "We file the forms, monitor your logs, hire your drivers, and pick up the phone when something happens at 2 a.m. You don't lift a finger.",
      list: [["Coverage","24 / 7 desk"],["Reply","Within 2 hrs"],["Reports","Monthly"]] },
    { mm: "STEP 04", kind: "Review", title: <>We <em>review</em> it with you</>,
      p: "Every three months we sit down with you (in person or on a call) to show what's been done and what's coming next. Plain English. Real paper.",
      list: [["When","Every 3 months"],["How","In-person or call"],["Format","Plain English"]] },
  ];
  return (
    <section className="run" id="run">
      <div className="shell">
        <div className="sec-head">
          <div className="reveal">
            <h2 className="line-up"><Line>From <em>first call</em></Line><Line>to <em>fully sorted</em>.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            Every trucking company we work with goes through the same four simple steps.
            No surprise costs, no handing you off to someone else, no &ldquo;let me check with my boss.&rdquo;
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
            <h2 className="line-up"><Line>From a <em>warning letter</em></Line><Line>to a <em>clean record</em>.</Line><Line>In 11 months.</Line></h2>
          </div>
          <p className="lede reveal" data-d="2">
            Maple Ridge Transport came to us after a safety audit went badly — with permits expiring
            and driver files in disarray. We rebuilt their DQ folder, sorted out HOS logs, and
            got every permit current within three months.
          </p>
        </div>

        <div className="case-grid">
          <div className="case-img clip-l">
            <span className="corner-tag">A real customer yard</span>
            <image-slot id="case-photo" shape="rect"
              placeholder="Drop a yard / shop photo — natural daylight, a tractor or a manager at work."
              src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1400&q=85&auto=format&fit=crop"></image-slot>
            <div className="corner-foot">
              <span>Mississauga, ON</span>
              <span>104 trucks</span>
            </div>
          </div>

          <div className="case-body reveal-x" data-d="2">
            <div>
              <div className="label">The customer said</div>
              <blockquote className="quote">
                We had a warning letter, drivers running on expired medical cards, and audit
                paperwork all over the place. Safe Haul Compliance picked up the phone,
                came to meet us, and four days later we had a plan I could actually run.
              </blockquote>
              <div className="case-byline">
                <span className="who">Lúcio Hernandez</span>
                <span className="role">Owner / Maple Ridge Transport</span>
              </div>
            </div>

            <div className="case-numbers">
              <div>
                <div className="lbl">Audit result</div>
                <div className="v">Warning <em>→</em> Clean</div>
              </div>
              <div>
                <div className="lbl">DQ files fixed</div>
                <div className="v tnum"><Counter to={104}/></div>
              </div>
              <div>
                <div className="lbl">Permits renewed</div>
                <div className="v tnum"><Counter to={38}/></div>
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
    { g:"&", h:"Plain English",   p:"No fancy regulator language in our emails. If a driver can't understand it, we re-write it." },
    { g:"§", h:"Real paper trail", p:"Every recommendation is backed by the rule it's based on. Every job done comes with proof." },
    { g:"✱", h:"Same person",     p:"You get one named person handling your account, plus a backup. Not a help desk, not a chatbot." },
    { g:"→", h:"We own it",       p:"If you fail an audit on something we manage, we fix it for free. That's how confident we are in our work." },
  ];
  return (
    <section className="sec shell" id="values">
      <div className="sec-head">
        <div className="reveal">
          <h2 className="line-up"><Line>What we <em>promise</em></Line><Line>every customer.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          In trucking compliance, you usually don&rsquo;t know if the work was done right until something
          goes wrong. We don&rsquo;t work that way — here&rsquo;s what you can expect from us.
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
          Our work, by the <em>numbers</em> — across 540 trucking<br/>
          companies we serve every day.
        </p>
        <div className="num-card reveal" data-d="1">
          <div className="lbl">MC Authority approval</div>
          <div className="v tnum"><Counter to={14} duration={1.5}/><span style={{fontSize:32}}>days</span></div>
          <div className="s">Average time from start to active authority.</div>
        </div>
        <div className="num-card reveal" data-d="2">
          <div className="lbl">On-time filings</div>
          <div className="v tnum"><Counter to={99} duration={1.8}/>%</div>
          <div className="s">IFTA, IRP, and permit renewals filed on time.</div>
        </div>
        <div className="num-card reveal" data-d="3">
          <div className="lbl">Audit-ready files</div>
          <div className="v tnum"><Counter to={11} duration={1.5}/><span style={{fontSize:32}}>min</span></div>
          <div className="s">Average time to pull a complete driver file.</div>
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
          <h2 className="line-up"><Line>Tell us about</Line><Line>your <em>fleet</em>.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Tell us about your trucking company. We&rsquo;ll come back within 48 hours with the
          three things we&rsquo;d fix first — for free, in plain English, signed by a real person.
        </p>
      </div>

      <div className="contact-grid">
        <div className="reveal">
          <div className="contact-meta">
            <div className="cm-row">
              <span className="k">Phone</span>
              <span className="v">350-200-0085</span>
              <span className="x">M – F · 7a – 7p ET</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">After hours</span>
              <span className="v">350-200-0085</span>
              <span className="x">24 / 7 desk · roadside</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">Email</span>
              <span className="v">info@safehaulcompliance.com</span>
              <span className="x">Avg. reply · 38 min</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row">
              <span className="k">Office</span>
              <span className="v">Mississauga, Ontario, Canada</span>
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
            <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:10, fontSize:14.5}}>
              <li style={{display:"flex", gap:12}}>
                <span className="mono" style={{color:"var(--mute)"}}>01</span>
                A one-page audit memo, signed.
              </li>
              <li style={{display:"flex", gap:12}}>
                <span className="mono" style={{color:"var(--mute)"}}>02</span>
                The three things we&rsquo;d fix first — in plain English.
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
              <input required placeholder=""/>
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
              <input type="email" required placeholder="you@yourcompany.com"/>
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" placeholder="350-200-0085"/>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>DOT # or MC # <span className="req">*</span></label>
              <input required placeholder="3492118 (or MC #)"/>
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
            <textarea placeholder="e.g. Our IFTA filing is due next week and we just hired 3 new drivers."></textarea>
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
            <p>Compliance and safety for Canadian trucking. Based in Ontario, since 2009. Real people, not a portal.</p>
          </div>
          <div className="foot-col">
            <h5>Services</h5>
            <a href="#services">MC Authority</a>
            <a href="#services">DQ Files</a>
            <a href="#services">Driver Hiring</a>
            <a href="#services">HOS Monitoring</a>
            <a href="#services">IFTA &amp; IRP</a>
            <a href="#services">Permits</a>
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
            <a>350-200-0085</a>
            <a href="mailto:info@safehaulcompliance.com">info@safehaulcompliance.com</a>
            <a>Mississauga, Ontario</a>
            <a>USDOT 3492118</a>
            <a>MC 1,209,447</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Safe Haul Compliance — All rights reserved.</span>
          <span>Made in Ontario · Serving all of Canada</span>
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
