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
        <a className="nav-brand" href="#top" aria-label="Safe Haul Compliance">
          <span className="nav-mark">
            <img src="logo.png" alt="Safe Haul Compliance" className="nav-logo"/>
          </span>
        </a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#expertise">Expertise</a>
          <a href="#audit">Audit score</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta">
          <a className="btn btn--signal" href="#audit">Free fleet audit <Arrow/></a>
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
          <span>SERVING USA &amp; CANADA</span>
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
          <a className="btn btn--signal" href="#audit">Get a free check-up <Arrow/></a>
          <a className="btn btn--ghost-light" href="#services">See how we help</a>
        </div>

        <div className="hero-cine-foot reveal" data-d="6">
          <div className="hcf-item">
            <span className="hcf-num">Built for</span>
            <span className="hcf-lbl">US &amp; Canadian fleets</span>
          </div>
          <div className="hcf-divider"></div>
          <div className="hcf-item">
            <span className="hcf-num">Plain</span>
            <span className="hcf-lbl">English service</span>
          </div>
          <div className="hcf-divider"></div>
          <div className="hcf-item">
            <span className="hcf-num">Real</span>
            <span className="hcf-lbl">people, no portals</span>
          </div>
        </div>
      </div>

      <div className="hero-cine-tag">
        <span className="hct-dot"></span>
        <span>LIVE · USA &amp; CANADA</span>
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
/* Expertise — who leads the work                              */
/* ────────────────────────────────────────────────────────── */
function Expertise() {
  const creds = [
    { h: "MC Authority",  p: "New authority setups, reinstatements, and BOC-3 filings — done right the first time." },
    { h: "Audit defense", p: "DOT and facility audits prepared, attended, and answered with clean files to show." },
    { h: "IFTA, IRP & permits", p: "Fuel tax and registrations filed on schedule, in every jurisdiction you run." },
    { h: "Driver files",  p: "DQ files, medical cards, and clearinghouse queries kept current for every seat." },
  ];
  return (
    <section className="sec shell expertise" id="expertise">
      <div className="sec-head">
        <div className="reveal">
          <span className="label">Expertise</span>
          <h2 className="line-up"><Line>Experience you can</Line><Line>put a <em>name</em> to.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Safe Haul Compliance is led by Rishi — twelve years in trucking compliance
          and safety. When you call, you talk to the person who signs the work,
          not a call center.
        </p>
      </div>

      <div className="exp-grid">
        <div className="exp-panel reveal">
          <span className="label">Who you work with</span>
          <div className="exp-num"><Counter to={12} duration={1.6}/><span className="unit">years</span></div>
          <div className="exp-num-cap">in trucking compliance &amp; safety</div>
          <div className="exp-rows">
            <div className="exp-row"><span className="k">Fleets served</span><span className="v">540+</span></div>
            <div className="exp-row"><span className="k">Coverage</span><span className="v">USA &amp; Canada</span></div>
            <div className="exp-row"><span className="k">Your contact</span><span className="v">Always the same</span></div>
          </div>
        </div>

        <div className="exp-body reveal-x" data-d="2">
          <div className="exp-byline">
            <span className="exp-name">Rishi</span>
            <span className="exp-role">Founder · Lead Compliance Advisor</span>
          </div>
          <p className="exp-bio">
            Twelve years of new authorities, DOT audits, fuel-tax filings, and driver
            files — for owner-operators up to fleets of a hundred-plus trucks. Rishi
            has sat across the table from auditors and knows what they look for,
            because he&rsquo;s spent his career preparing the files they read.
            Every account here is handled under his review.
          </p>
          <blockquote className="exp-quote">
            Compliance isn&rsquo;t paperwork. It&rsquo;s whether your trucks keep earning
            when an auditor, an officer, or an insurer starts asking questions.
          </blockquote>
          <div className="exp-creds">
            {creds.map((c, i) => (
              <div className="exp-cred" key={i}>
                <h5>{c.h}</h5>
                <p>{c.p}</p>
              </div>
            ))}
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
  const ico = {
    chat: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.8A1.8 1.8 0 0 1 5.8 4h12.4A1.8 1.8 0 0 1 20 5.8v8.4a1.8 1.8 0 0 1-1.8 1.8H9.2L5 19.6c-.5.4-1 .2-1-.5V5.8z"/>
        <path d="M8.5 9h7"/><path d="M8.5 12h4.5"/>
      </svg>
    ),
    doc: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
        <path d="M14 3v4a1 1 0 0 0 1 1h3"/><path d="M9.3 14.8l2 2 3.6-4.3"/>
      </svg>
    ),
    person: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8.2" r="3.6"/>
        <path d="M5 20c.9-3.4 3.7-5.2 7-5.2s6.1 1.8 7 5.2"/>
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 2.6v5c0 4.7-2.9 8.1-7 10-4.1-1.9-7-5.3-7-10v-5L12 3z"/>
        <path d="M9 11.6l2.2 2.2 3.8-4.4"/>
      </svg>
    ),
  };
  const items = [
    { n:"01", icon: ico.chat,   h:"Plain English",    p:"No fancy regulator language in our emails. If a driver can't understand it, we re-write it." },
    { n:"02", icon: ico.doc,    h:"Real paper trail",  p:"Every recommendation is backed by the rule it's based on. Every job done comes with proof." },
    { n:"03", icon: ico.person, h:"Same person",       p:"You get one named person handling your account, plus a backup. Not a help desk, not a chatbot." },
    { n:"04", icon: ico.shield, h:"We own it",         p:"If you fail an audit on something we manage, we fix it for free. That's how confident we are in our work." },
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
            <div className="value-top">
              <div className="v-icon">{it.icon}</div>
              <span className="v-idx">{it.n}</span>
            </div>
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
/* Clients — sliding marquee of carriers we serve              */
/* ────────────────────────────────────────────────────────── */
function Clients() {
  const clients = [
    { name: "Webley Express Inc.",   region: "Canada-Wide" },
    { name: "Hawks Transportation",  region: "Canada-Wide" },
    { name: "Redwood Freight Lines", region: "USA" },
    { name: "Summit Carriers",       region: "USA" },
    { name: "Ironhorse Logistics",   region: "USA" },
    { name: "Blue Ridge Trucking",   region: "USA" },
    { name: "Lone Star Haulers",     region: "USA" },
  ];
  const Row = ({ ariaHidden }) => (
    <div className="clients-row" aria-hidden={ariaHidden ? "true" : undefined}>
      {clients.map((c, i) => (
        <span className="client-pill" key={i}>
          <span className="cp-dot"></span>
          <span className="cp-name">{c.name}</span>
          <span className="cp-region">{c.region}</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="clients" id="clients">
      <div className="shell">
        <div className="clients-head reveal">
          <span className="clients-eyebrow"><span className="blip"></span>Trusted on the road</span>
          <h2 className="line-up"><Line>The carriers we <em>serve</em>.</Line></h2>
          <p className="lede">
            From owner-operators to Canada-wide fleets, these are some of the carriers
            we keep compliant and audit-ready — across the USA and Canada.
          </p>
        </div>
      </div>

      <div className="clients-marquee" aria-label="Customers we serve">
        <div className="clients-track">
          <Row/>
          <Row ariaHidden/>
        </div>
        <div className="clients-fade clients-fade--l" aria-hidden></div>
        <div className="clients-fade clients-fade--r" aria-hidden></div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Fleet Audit — FMCSA audit readiness score                   */
/* Interactive self-assessment: 5 weighted categories,         */
/* 20 questions, CFR citations, penalty exposure, fix plan.    */
/* ────────────────────────────────────────────────────────── */
const AUDIT_CATEGORIES = [
  {
    id: "authority", name: "Operating Authority", icon: "📜", weight: 0.10,
    description: "Registration, insurance, and authority documents are the baseline for any motor carrier. Lapses trigger automatic deactivation.",
    questions: [
      { id: "auth_1",
        text: "FMCSA registration is active: USDOT number is not deactivated, MC authority is not revoked",
        cfr: "49 CFR 390.19", penalty: "Prohibited from operating; vehicle OOS",
        recommendation: "Check your USDOT/MC status at safer.fmcsa.dot.gov. FMCSA deactivates USDOT numbers without warning if the biennial MCS-150 update is missed. If deactivated, you cannot legally operate until reactivated, which can take days to weeks." },
      { id: "auth_2",
        text: "MCS-150 biennial update has been completed within the required 2-year window",
        cfr: "49 CFR 390.19(b)", penalty: "USDOT deactivated without notice",
        recommendation: "File your MCS-150 update at the FMCSA portal. Your due date is based on your USDOT number — the last two digits determine your month. Missing the window results in automatic deactivation with no notice. Set a calendar reminder 60 days before your due date." },
      { id: "auth_3",
        text: "Proof of minimum required liability insurance (and/or cargo insurance) is current and on file",
        cfr: "49 CFR 387", penalty: "Authority revoked; vehicle OOS",
        recommendation: "Minimum liability: $750K for general freight, $1M for household goods/oil, $5M for hazmat. Insurance must be filed by your insurer directly with FMCSA via Form MCS-90 endorsement. A lapse in filed insurance triggers automatic authority revocation. Keep a copy of your current certificate on file." },
    ],
  },
  {
    id: "maintenance", name: "Vehicle Maintenance", icon: "🔧", weight: 0.15,
    description: "Vehicle maintenance records demonstrate that trucks are inspected, defects are repaired, and the carrier has a systematic maintenance program.",
    questions: [
      { id: "maint_1",
        text: "Driver Vehicle Inspection Reports (DVIRs) are collected after each trip and retained for 90 days",
        cfr: "49 CFR 396.11", penalty: "Up to $16,550/violation; driver OOS if defect not certified repaired",
        recommendation: "Drivers must prepare a DVIR at the end of every day they operate a CMV, even if no defects are found — the “no defects” DVIR is still required. DVIRs with defects must be reviewed and signed by a mechanic after repair, and again by the next driver. Retain all DVIRs for 90 days." },
      { id: "maint_2",
        text: "A systematic maintenance file exists for each vehicle (repairs, inspections, maintenance history)",
        cfr: "49 CFR 396.3", penalty: "Up to $16,550/violation",
        recommendation: "Each vehicle must have a file containing: identification (VIN, make, year, license), maintenance schedule, all inspection/repair records, and copies of periodic inspection reports. This file must be retained for the period of operation plus 1 year after the vehicle leaves the fleet." },
      { id: "maint_3",
        text: "Annual vehicle inspections are performed and inspection reports are retained for 14 months",
        cfr: "49 CFR 396.17", penalty: "Vehicle OOS + up to $16,550",
        recommendation: "Each CMV must pass an annual inspection performed by a qualified inspector. The inspection report must be retained for 14 months, and the current report (or a copy) must be kept in the vehicle. An out-of-date annual inspection means the vehicle is placed out-of-service immediately." },
    ],
  },
  {
    id: "hos", name: "Hours of Service / ELD", icon: "⏱️", weight: 0.20,
    description: "ELD mandate compliance and HOS recordkeeping are checked in every audit. Missing records trigger CSA violations across multiple categories.",
    questions: [
      { id: "hos_1",
        text: "All drivers subject to the ELD mandate use FMCSA-registered ELDs (or have documented exemptions)",
        cfr: "49 CFR 395.8(a)(1)", penalty: "OOS + up to $16,550/violation",
        recommendation: "Verify your ELD is on the FMCSA's registered device list at fmcsa.dot.gov. If any drivers qualify for an exemption (short-haul, pre-2000 engine, etc.), document the exemption basis in each driver's file. Paper RODS are only acceptable if the ELD malfunctions and you follow the malfunction protocol." },
      { id: "hos_2",
        text: "HOS records/ELD data are retained for at least 6 months",
        cfr: "49 CFR 395.8(k)", penalty: "Up to $16,550/violation",
        recommendation: "ELD data must be retained for 6 months. Paper logs (where applicable) must be retained for 6 months. Supporting documents (fuel receipts, toll records, bills of lading) that verify HOS must also be retained for 6 months." },
      { id: "hos_3",
        text: "Drivers have received HOS training and understand their personal obligations",
        cfr: "49 CFR 395", penalty: "HOS violations increase CSA score; fines up to $16,550",
        recommendation: "Drivers are personally responsible for HOS compliance, but carriers are also liable when they knowingly allow violations. Document HOS training, have a written policy, and conduct regular reviews of ELD records to catch patterns before an audit does." },
      { id: "hos_4",
        text: "Your ELD malfunction procedure is documented and drivers know what to do when an ELD fails",
        cfr: "49 CFR 395.34", penalty: "OOS if no compliant records during malfunction period",
        recommendation: "When an ELD malfunctions, drivers must: note the malfunction on the record, notify the carrier within 24 hours, reconstruct paper logs for the current and prior 7 days, and use paper logs until the ELD is repaired (max 8 days). Keep a written malfunction protocol and blank paper log forms in every truck." },
    ],
  },
  {
    id: "drug", name: "Drug & Alcohol Testing", icon: "🧪", weight: 0.25,
    description: "FMCSA Part 382 requires a comprehensive drug and alcohol program: written policy, pre-employment testing, random pool, and complete records.",
    questions: [
      { id: "drug_1",
        text: "A written drug and alcohol testing policy exists and has been provided to all drivers",
        cfr: "49 CFR 382.601", penalty: "Up to $16,550/violation",
        recommendation: "The written policy must explain testing types, substances tested for, consequences of violations, and driver rights. It must be provided to each driver before their first assignment and to new drivers at hire." },
      { id: "drug_2",
        text: "Pre-employment drug test results are on file for every currently employed driver",
        cfr: "49 CFR 382.301", penalty: "Up to $16,550 + driver OOS",
        recommendation: "A negative pre-employment drug test result must be received before a driver performs any safety-sensitive function. Keep the MRO-verified result in the driver's confidential drug/alcohol file (separate from the DQF)." },
      { id: "drug_3",
        text: "Your random testing pool is maintained at required minimum rates (50% for drugs, 10% for alcohol)",
        cfr: "49 CFR 382.305", penalty: "Up to $16,550/violation",
        recommendation: "Random selection must be truly random (scientifically valid method) and spread throughout the year. A consortium/TPA can help ensure proper pool management. Document all random selections, notifications, and test completions." },
      { id: "drug_4",
        text: "All drug and alcohol test records are retained in a secure, confidential file separate from the DQF",
        cfr: "49 CFR 382.401", penalty: "Up to $16,550/violation",
        recommendation: "Drug/alcohol records must be in a separate, locked file accessible only to authorized personnel. Retention: positive results 5 years, negative/cancelled results 1 year, annual summaries 5 years." },
      { id: "drug_5",
        text: "Return-to-duty and follow-up testing documentation is on file for any driver with a prior violation",
        cfr: "49 CFR 382.309/605", penalty: "Up to $16,550 + driver prohibited from operating",
        recommendation: "Any driver who tested positive or refused a test must complete a SAP evaluation, a negative return-to-duty test, and a follow-up testing program before operating again. Document each step: the SAP referral, RTD test result, and all follow-up test dates and results." },
    ],
  },
  {
    id: "dqf", name: "Driver Qualification Files", icon: "📋", weight: 0.30,
    description: "DQF completeness is the #1 finding in FMCSA audits. Every driver must have a complete file before operating.",
    questions: [
      { id: "dqf_1",
        text: "Every driver has a completed employment application (10-year history) on file before operating",
        cfr: "49 CFR 391.21", penalty: "Up to $16,550/violation",
        recommendation: "Collect completed FMCSA-compliant applications before allowing any driver to operate. The application must cover 10 years of employment history, all states licensed in, and all accidents/violations." },
      { id: "dqf_2",
        text: "Current DOT medical certificates are on file for all drivers (no expired certs)",
        cfr: "49 CFR 391.43", penalty: "Immediate OOS + up to $16,550",
        recommendation: "Medical certificates expire every 24 months (or sooner if the examiner specifies). Set calendar reminders 60 days before each expiration. An expired medical cert means the driver is out-of-service immediately." },
      { id: "dqf_3",
        text: "Annual MVR reviews are conducted and documented within 12 months for every driver",
        cfr: "49 CFR 391.25", penalty: "Up to $16,550/violation",
        recommendation: "Pull the MVR from every state each driver holds a license in, review it against FMCSA disqualification standards, and sign a certification. This must happen every 12 calendar months — not annually from hire date." },
      { id: "dqf_4",
        text: "Annual Certificates of Violations are collected from every driver and reviewed",
        cfr: "49 CFR 391.27", penalty: "Up to $16,550/violation",
        recommendation: "Each driver must certify all violations (or none) received in the prior 12 months. You must review and sign an acknowledgment. These must be retained for the duration of employment plus 3 years." },
      { id: "dqf_5",
        text: "Drug & Alcohol Clearinghouse queries (pre-employment full + annual limited) are documented for all drivers",
        cfr: "49 CFR 382.701", penalty: "Up to $16,550 + driver prohibited from operating",
        recommendation: "Run a full Clearinghouse query before a driver's first day (requires driver consent). Run limited annual queries for all currently employed CDL drivers each calendar year. Document query dates and results." },
    ],
  },
];

/* per-answer max penalty exposure (2026 FMCSA schedule, 49 CFR 386) */
const AUDIT_PENALTY = { no: 16550, unsure: 12413, partial: 8275 };
const AUDIT_EXPOSURE_CAP = 500000;

function auditQuestionsFor(cat, mode) {
  return mode === "quick" ? cat.questions.slice(0, 1) : cat.questions;
}

function auditScore(answers, mode) {
  const byCategory = {};
  let total = 0;
  for (const cat of AUDIT_CATEGORIES) {
    const qs = auditQuestionsFor(cat, mode);
    let pts = 0;
    for (const q of qs) {
      const a = answers[q.id];
      if (a === "yes") pts += 1;
      else if (a === "partial") pts += 0.5;
    }
    const pct = qs.length ? (pts / qs.length) * 100 : 0;
    byCategory[cat.id] = Math.round(pct);
    total += pct * cat.weight;
  }
  return { total: Math.round(total), byCategory };
}

function auditBand(score) {
  if (score >= 90) return { label: "Audit Ready", tone: "ok",
    description: "Your compliance documentation is in strong shape. Keep maintaining expiration tracking and annual reviews." };
  if (score >= 75) return { label: "Minor Gaps", tone: "info",
    description: "A few areas need attention. Address the gaps below before your next compliance review." };
  if (score >= 60) return { label: "Significant Gaps", tone: "warn",
    description: "Multiple compliance gaps exist. An FMCSA audit right now would likely find violations. Prioritize the items below." };
  if (score >= 40) return { label: "High Risk", tone: "hot",
    description: "Serious compliance deficiencies exist. You are at elevated risk of an unsatisfactory FMCSA safety rating. Act now." };
  return { label: "Immediate Action Required", tone: "crit",
    description: "Critical compliance gaps could result in OOS orders, large fines, or an unsatisfactory safety rating. This requires immediate attention." };
}

const AUDIT_ANSWERS = [
  { v: "yes",     glyph: "✓", label: "Yes" },
  { v: "partial", glyph: "~",      label: "Partial" },
  { v: "no",      glyph: "✗", label: "No" },
  { v: "unsure",  glyph: "?",      label: "Not Sure" },
];

function AuditTool() {
  // step: 0 = intro · 1..N = category index · N+1 = results
  const [mode, setMode] = useState("full");
  const [step, setStep] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flash, setFlash] = useState(null);           // question id briefly highlighted on answer
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | loading | done | error
  const rootRef = useRef(null);
  const timerRef = useRef(null);

  const nCats = AUDIT_CATEGORIES.length;
  const totalQs = AUDIT_CATEGORIES.reduce((a, c) => a + auditQuestionsFor(c, mode).length, 0);
  const answeredQs = AUDIT_CATEGORIES.reduce((a, c) =>
    a + auditQuestionsFor(c, mode).filter(q => answers[q.id] !== undefined).length, 0);

  const gapExposure = Math.min(
    Object.values(answers).reduce((a, v) => a + (AUDIT_PENALTY[v] || 0), 0),
    AUDIT_EXPOSURE_CAP
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function scrollTop() {
    if (rootRef.current) {
      const y = rootRef.current.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function start(m) {
    setMode(m);
    setAnswers({});
    setEmailStatus("idle");
    setStep(1);
    setQIdx(0);
    scrollTop();
  }

  function answer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    setFlash(qid);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFlash(null);
      const cat = AUDIT_CATEGORIES[step - 1];
      const qs = auditQuestionsFor(cat, mode);
      if (qIdx < qs.length - 1) {
        setQIdx(qIdx + 1);
      } else if (step < nCats) {
        setStep(step + 1);
        setQIdx(0);
        scrollTop();
      } else {
        setStep(nCats + 1);
        scrollTop();
      }
    }, 350);
  }

  function back() {
    clearTimeout(timerRef.current);
    setFlash(null);
    if (qIdx > 0) { setQIdx(qIdx - 1); return; }
    if (step > 1) {
      const prevCat = AUDIT_CATEGORIES[step - 2];
      setStep(step - 1);
      setQIdx(auditQuestionsFor(prevCat, mode).length - 1);
    } else {
      setStep(0);
      setQIdx(0);
    }
  }

  function upgradeToFull() {
    setMode("full");
    // jump to the first unanswered question of the full audit
    for (let c = 0; c < nCats; c++) {
      const qs = AUDIT_CATEGORIES[c].questions;
      const i = qs.findIndex(q => answers[q.id] === undefined);
      if (i !== -1) { setStep(c + 1); setQIdx(i); scrollTop(); return; }
    }
    setStep(nCats + 1);
  }

  async function sendFixPlan(e) {
    e.preventDefault();
    if (emailStatus === "loading" || emailStatus === "done" || !email.includes("@")) return;
    setEmailStatus("loading");
    const r = auditScore(answers, mode);
    const band = auditBand(r.total);
    const gaps = AUDIT_CATEGORIES.flatMap(c =>
      auditQuestionsFor(c, mode)
        .filter(q => answers[q.id] !== "yes")
        .map(q => `[${c.name}] ${q.text} (${q.cfr}) — answered: ${answers[q.id] || "unanswered"}`)
    );
    const data = new FormData();
    data.append("_subject", "FMCSA audit score — fix plan request — safehaulcompliance.com");
    data.append("_template", "table");
    data.append("_captcha", "false");
    data.append("email", email);
    data.append("score", `${r.total}/100 — ${band.label}`);
    data.append("mode", mode === "quick" ? "Quick check (5 questions)" : "Full audit (20 questions)");
    data.append("max_exposure", `$${gapExposure.toLocaleString()}`);
    data.append("category_scores", AUDIT_CATEGORIES.map(c => `${c.name}: ${r.byCategory[c.id]}/100`).join(" · "));
    data.append("gaps", gaps.length ? gaps.join("\n") : "None — all clear");
    data.append("_autoresponse",
      `Thanks for running the Safe Haul FMCSA audit readiness check. Your score: ${r.total}/100 (${band.label}). ` +
      "A compliance specialist will email your full CFR-cited fix plan within 24 hours. " +
      "Need it faster? Call +1 350-200-0085.");
    try {
      const res = await fetch("https://formsubmit.co/ajax/info@safehaulcompliance.com", {
        method: "POST", headers: { "Accept": "application/json" }, body: data,
      });
      if (!res.ok) throw new Error("network");
      setEmailStatus("done");
    } catch {
      setEmailStatus("error");
    }
  }

  /* ── intro ─────────────────────────────────────────────── */
  const intro = (
    <div className="au-intro">
      <div className="au-eyebrow"><span className="au-live-dot"></span> FMCSA Audit Readiness</div>
      <h2 className="au-h1">Would your fleet pass an <em>FMCSA audit</em> today?</h2>
      <p className="au-sub">
        Get a personalized readiness score with CFR citations, dollar penalties, and a
        prioritized fix plan. Free. No signup to see the score.
      </p>
      <div className="au-modes">
        <button className="au-mode au-mode--primary" onClick={() => start("quick")}>
          <span className="au-mode-tag">Quick Check</span>
          <span className="au-mode-title">Start in 60 seconds</span>
          <span className="au-mode-desc">5 questions, one per category. Get a fast directional score.</span>
          <span className="au-mode-go">Start Quick <Arrow/></span>
        </button>
        <button className="au-mode" onClick={() => start("full")}>
          <span className="au-mode-tag">Full Audit</span>
          <span className="au-mode-title">3-minute audit</span>
          <span className="au-mode-desc">20 questions across all 5 categories. The complete gap report.</span>
          <span className="au-mode-go">Start Full <Arrow/></span>
        </button>
      </div>
      <div className="au-trust">
        <span>Free</span><i>·</i><span>No signup to see the score</span><i>·</i><span>No credit card</span>
      </div>
      <div className="au-cat-strip">
        {AUDIT_CATEGORIES.map(c => (
          <span key={c.id} className="au-cat-chip">
            <span className="au-cat-ico">{c.icon}</span> {c.name}
            <b>{Math.round(c.weight * 100)}%</b>
          </span>
        ))}
      </div>
    </div>
  );

  /* ── question flow ─────────────────────────────────────── */
  let flow = null;
  if (step >= 1 && step <= nCats) {
    const cat = AUDIT_CATEGORIES[step - 1];
    const qs = auditQuestionsFor(cat, mode);
    const q = qs[qIdx];
    flow = (
      <div className="au-flow">
        <div className="au-topbar">
          <span className="au-pill"><span className="au-live-dot"></span> Free Audit Readiness</span>
          <div className="au-progress">
            <span className="mono">{answeredQs} of {totalQs}</span>
            <span className="au-bar"><span style={{ width: `${(answeredQs / totalQs) * 100}%` }}></span></span>
          </div>
        </div>

        <div className="au-exposure">
          <span className="au-exp-lbl"><span className="au-exp-dot"></span> Max FMCSA Exposure</span>
          <span className="au-exp-num mono">${gapExposure.toLocaleString()}</span>
          <span className="au-exp-note">{gapExposure > 0 ? "from gaps so far" : "climbs with each “no”"}</span>
        </div>

        <div className="au-card" key={`${cat.id}-${q.id}`}>
          <div className="au-card-head">
            <span className="au-card-ico">{cat.icon}</span>
            <h3>{cat.name}</h3>
            <span className="au-weight">{Math.round(cat.weight * 100)}%</span>
            <span className="au-dots">
              {AUDIT_CATEGORIES.map((c, i) => (
                <span key={c.id} className={`au-dot${i === step - 1 ? " on" : ""}${i < step - 1 ? " done" : ""}`}></span>
              ))}
            </span>
          </div>
          <p className="au-card-desc">{cat.description}</p>
          <div className="au-q">
            <div className="au-q-count mono">QUESTION {qIdx + 1} <span>OF {qs.length}</span></div>
            <div className="au-q-row">
              <span className="au-q-num mono">{qIdx + 1}</span>
              <p className="au-q-text">{q.text}</p>
            </div>
            <div className="au-q-meta">
              <span className="au-cfr mono">&sect; {q.cfr.replace(/^49 CFR /, "49 CFR ")}</span>
              <span className="au-penalty mono">&#9888; {q.penalty}</span>
            </div>
            <div className="au-answers">
              {AUDIT_ANSWERS.map(a => (
                <button key={a.v}
                  className={`au-ans au-ans--${a.v}${answers[q.id] === a.v ? " picked" : ""}${flash === q.id && answers[q.id] === a.v ? " flash" : ""}`}
                  onClick={() => answer(q.id, a.v)}>
                  <i>{a.glyph}</i> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="au-back" onClick={back}>&larr; Back</button>
      </div>
    );
  }

  /* ── results ───────────────────────────────────────────── */
  let results = null;
  if (step === nCats + 1) {
    const r = auditScore(answers, mode);
    const band = auditBand(r.total);
    const cats = [...AUDIT_CATEGORIES].sort((a, b) => r.byCategory[a.id] - r.byCategory[b.id]);
    const gaps = cats.flatMap(c =>
      auditQuestionsFor(c, mode)
        .filter(q => answers[q.id] !== "yes")
        .map(q => ({ ...q, cat: c, given: answers[q.id] || "unanswered" }))
    );
    results = (
      <div className="au-report">
        <div className="au-rep-head">
          <h3 className="au-h1" style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>FMCSA Audit Readiness Report</h3>
          <p className="au-sub">Based on your answers across {totalQs} compliance checkpoints</p>
        </div>

        <div className="au-scorecard">
          <div className="au-score mono">{r.total}<span>/100</span></div>
          <div className={`au-band au-band--${band.tone}`}>{band.label}</div>
          <p className="au-band-desc">{band.description}</p>
        </div>

        <div className="au-breakdown">
          <div className="au-sec-lbl mono">Category breakdown &middot; weakest first</div>
          {cats.map(c => {
            const v = r.byCategory[c.id];
            const nGaps = auditQuestionsFor(c, mode).filter(q => answers[q.id] !== "yes").length;
            return (
              <div className="au-bd-row" key={c.id}>
                <span className="au-bd-name">{c.icon} {c.name}</span>
                <span className="au-bd-gaps">{nGaps === 0 ? "all clear" : `${nGaps} gap${nGaps === 1 ? "" : "s"} to close`}</span>
                <span className="au-bd-bar"><span className={`t-${v < 40 ? "crit" : v < 60 ? "hot" : v < 80 ? "warn" : "ok"}`} style={{ width: `${Math.max(v, 3)}%` }}></span></span>
                <span className={`au-bd-val mono t-${v < 40 ? "crit" : v < 60 ? "hot" : v < 80 ? "warn" : "ok"}`}>{v}<i>/100</i></span>
              </div>
            );
          })}
        </div>

        {gaps.length > 0 && (
          <div className="au-exp-banner">
            <span className="au-exp-lbl"><span className="au-exp-dot"></span> Max FMCSA Exposure</span>
            <span className="au-exp-num mono">${gapExposure.toLocaleString()}</span>
            <span className="au-exp-note">{gaps.length} gap{gaps.length === 1 ? "" : "s"} &middot; at up to $16,550 per violation (49 CFR 386)</span>
          </div>
        )}

        {gaps.length > 0 && (
          <div className="au-fixplan">
            <div className="au-sec-lbl mono">Your fix plan &middot; start at the top</div>
            {gaps.map((g, i) => (
              <details className="au-gap" key={g.id} open={i < 2}>
                <summary>
                  <span className="au-gap-num mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="au-gap-text">{g.text}</span>
                  <span className={`au-gap-ans au-gap-ans--${g.given}`}>{g.given === "unsure" ? "not sure" : g.given}</span>
                </summary>
                <div className="au-gap-body">
                  <div className="au-q-meta">
                    <span className="au-cfr mono">&sect; {g.cfr}</span>
                    <span className="au-penalty mono">&#9888; {g.penalty}</span>
                  </div>
                  <p>{g.recommendation}</p>
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="au-cta-grid">
          <div className="au-cta-card au-cta-card--main">
            <div className="au-sec-lbl mono">Want it fixed for you?</div>
            <h4>Let Safe Haul close {gaps.length > 0 ? `all ${gaps.length} gap${gaps.length === 1 ? "" : "s"}` : "the loop"} — free fleet audit, 48-hour turnaround.</h4>
            <p>A real compliance specialist reviews your files, confirms every gap above, and hands you a signed one-page memo with a flat-rate plan. No retainers.</p>
            <a className="btn btn--signal" href="#contact">Get my free fleet audit <Arrow/></a>
          </div>
          <div className="au-cta-card">
            <div className="au-sec-lbl mono">Email me this report</div>
            {emailStatus === "done" ? (
              <p className="au-email-done">&#10003; Sent — check your inbox. Your full CFR-cited fix plan follows within 24 hours.</p>
            ) : (
              <>
                <p>Get your score, every gap with its CFR citation, and the full fix plan in your inbox.</p>
                <form className="au-email-row" onSubmit={sendFixPlan}>
                  <input type="email" required placeholder="you@yourcompany.com"
                    value={email} onChange={e => setEmail(e.target.value)}/>
                  <button type="submit" disabled={emailStatus === "loading"}>
                    {emailStatus === "loading" ? "Sending…" : "Email my fix plan"}
                  </button>
                </form>
                {emailStatus === "error" && (
                  <p className="au-email-err">Couldn&rsquo;t send — email us at info@safehaulcompliance.com</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="au-rep-foot">
          {mode === "quick" && (
            <button className="au-link" onClick={upgradeToFull}>
              &#9889; Quick Check estimate &middot; run the full 20-question audit for the complete gap list &rarr;
            </button>
          )}
          <button className="au-link" onClick={() => { setStep(0); setQIdx(0); setAnswers({}); setEmailStatus("idle"); scrollTop(); }}>
            Retake the audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="audit shell" id="audit" ref={rootRef}>
      <div className="au-panel reveal">
        {step === 0 && intro}
        {flow}
        {results}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Contact                                                     */
/* ────────────────────────────────────────────────────────── */
function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function handleAuditSubmit(e) {
    e.preventDefault();
    if (sending || sent) return;
    setSending(true);
    setSendError("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("https://formsubmit.co/ajax/info@safehaulcompliance.com", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error("network");
      setSent(true);
    } catch {
      setSendError("Couldn't send. Email us at info@safehaulcompliance.com or call 350-200-0085.");
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="contact shell" id="contact">
      <div className="sec-head">
        <div className="reveal">
          <h2 className="line-up"><Line>Tell us about</Line><Line>your <em>fleet</em>.</Line></h2>
        </div>
        <p className="lede reveal" data-d="2">
          Tell us about your trucking company. We&rsquo;ll get back to you quickly with a plan
          to keep your fleet compliant and your drivers safe.
        </p>
      </div>

      <div className="contact-grid">
        <div className="reveal">
          <div className="contact-meta">
            <div className="cm-row">
              <span className="k">Email</span>
              <span className="v">info@safehaulcompliance.com</span>
              <span className="x">We reply quickly</span>
            </div>
            <hr className="rule-soft"/>
            <div className="cm-row cm-row--locs">
              <span className="k">Offices</span>
              <div className="cm-locs">
                <div className="cm-loc">
                  <span className="cm-loc-tag">Canada · HQ</span>
                  <span className="cm-loc-addr">22 Wintercress Circle<br/>Brampton, ON L6R 2K2, Canada</span>
                  <a className="cm-loc-tel" href="tel:+19052267726">+1 905-226-7726</a>
                </div>
                <div className="cm-loc">
                  <span className="cm-loc-tag">USA · HQ</span>
                  <span className="cm-loc-addr">2200 W Meeker St, Apt X320<br/>Kent, WA, USA</span>
                  <a className="cm-loc-tel" href="tel:+13502000085">+1 350-200-0085</a>
                </div>
                <div className="cm-loc">
                  <span className="cm-loc-tag">India · Support</span>
                  <span className="cm-loc-addr">Near Post Office, Sujanpur<br/>Pathankot, Punjab 145023, India</span>
                  <a className="cm-loc-tel" href="tel:+918198075620">+91 81980 75620</a>
                </div>
              </div>
              <span className="x">By appointment</span>
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

        <form className="form reveal-x" onSubmit={handleAuditSubmit}>
          <h3>Free fleet audit <span className="italic-serif" style={{color:"var(--mute)"}}>—  48-hour turnaround</span></h3>

          {/* FormSubmit config */}
          <input type="hidden" name="_subject" value="New fleet audit request — safehaulcompliance.com"/>
          <input type="hidden" name="_template" value="table"/>
          <input type="hidden" name="_captcha" value="false"/>
          <input type="text" name="_honey" style={{display:"none"}} tabIndex={-1} autoComplete="off"/>

          <div className="form-row">
            <div className="field">
              <label>Your name <span className="req">*</span></label>
              <input name="name" required placeholder=""/>
            </div>
            <div className="field">
              <label>Role</label>
              <select name="role" defaultValue="">
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
              <input type="email" name="email" required placeholder="you@yourcompany.com"/>
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" name="phone" placeholder="350-200-0085"/>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Company name</label>
              <input name="company" placeholder="Your trucking company"/>
            </div>
            <div className="field">
              <label>Fleet size</label>
              <select name="fleet_size" defaultValue="">
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
            <textarea name="message" placeholder="e.g. Our IFTA filing is due next week and we just hired 3 new drivers."></textarea>
          </div>

          <button className="btn btn--signal" type="submit" disabled={sending || sent} style={{width:"100%", justifyContent:"center", height:54}}>
            {sent ? "Got it — we'll be in touch within 48 hours" : sending ? "Sending…" : (<>Send for audit <Arrow/></>)}
          </button>
          {sendError && (
            <div style={{marginTop:12, fontFamily:"var(--f-mono)", fontSize:11.5, letterSpacing:".06em", color:"#b42318"}}>
              {sendError}
            </div>
          )}
          <div style={{marginTop:14, fontFamily:"var(--f-mono)", fontSize:10.5, letterSpacing:".12em", textTransform:"uppercase", color:"var(--mute)"}}>
            Encrypted in transit · No third-party trackers
          </div>
        </form>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────── */
/* WhatsApp floating button                                    */
/* ────────────────────────────────────────────────────────── */
function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href="https://wa.me/918198075620?text=Hello%20Safe%20Haul%20Compliance%2C%20I%20need%20assistance%20with%20my%20trucking%20compliance."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
      <span className="wa-fab-label">Chat on WhatsApp</span>
    </a>
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
            <p>Compliance and safety for trucking companies across USA and Canada. Real people, not a portal.</p>
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
            <h5>Reach us</h5>
            <a href="mailto:info@safehaulcompliance.com">info@safehaulcompliance.com</a>
          </div>
          <div className="foot-col">
            <h5>Offices</h5>
            <div className="foot-loc"><b>Canada · HQ</b>22 Wintercress Circle, Brampton, ON L6R 2K2<a href="tel:+19052267726">+1 905-226-7726</a></div>
            <div className="foot-loc"><b>USA · HQ</b>2200 W Meeker St, Apt X320, Kent, WA<a href="tel:+13502000085">+1 350-200-0085</a></div>
            <div className="foot-loc"><b>India · Support</b>Sujanpur, Pathankot, Punjab 145023<a href="tel:+918198075620">+91 81980 75620</a></div>
          </div>
          <div className="foot-col">
            <h5>Legal</h5>
            <a href="/privacy.html">Privacy Policy</a>
            <a href="/terms.html">Terms of Service</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Safe Haul Compliance — All rights reserved.</span>
          <span>Offices in Canada · USA · India — Serving USA &amp; Canada</span>
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
      <Services/>
      <TheRun/>
      <Expertise/>
      <Values/>
      <Clients/>
      <AuditTool/>
      <Contact/>
      <Footer/>
      <WhatsAppFab/>

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
