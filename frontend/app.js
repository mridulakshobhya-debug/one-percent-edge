(() => {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const siteHeader = qs("#siteHeader");
  const navToggle = qs("#navToggle");
  const navLinks = qs("#navLinks");
  const navAnchors = qsa(".nav-links > a");
  const scrollProgress = qs("#scrollProgress");
  const cursorGlow = qs("#cursorGlow");

  const revealItems = qsa(".reveal");
  const counterItems = qsa("[data-counter]");
  const tiltCards = qsa(".tilt-card");

  const leadModal = qs("#leadModal");
  const openModalButtons = [qs("#heroGetStarted"), qs("#navGetStarted"), ...qsa(".open-modal")].filter(Boolean);
  const closeModalButtons = qsa("[data-close-modal]");
  const leadForm = qs("#leadForm");
  const navLoginBtn = qs("#navLoginBtn");

  const newsletterForm = qs("#newsletterForm");
  const toastStack = qs("#toastStack");

  const chipButtons = qsa(".chip");
  const courseCards = qsa(".course-card");
  const enrollButtons = qsa(".enroll-course");

  const faqItems = qsa(".faq-item");
  const testimonials = qsa(".testimonial");
  const prevTestimonialBtn = qs("#prevTestimonial");
  const nextTestimonialBtn = qs("#nextTestimonial");

  const billingToggle = qs("#billingToggle");
  const priceValues = qsa(".price-card h3[data-monthly]");

  const agentForm = qs("#agentForm");
  const agentInput = qs("#agentInput");
  const agentMessages = qs("#agentMessages");
  const agentStatus = qs("#agentStatus");
  const promptPills = qsa(".pill");

  const tickerTrack = qs("#tickerTrack");
  const liveFreshnessText = qs("#liveFreshnessText");
  const opportunityList = qs("#opportunityList");
  const apiHealthText = qs("#apiHealthText");
  const meanLatencyText = qs("#meanLatencyText");
  const p99LatencyText = qs("#p99LatencyText");
  const ticksPerSecText = qs("#ticksPerSecText");
  const dropPacketsText = qs("#dropPacketsText");
  const falseSignalText = qs("#falseSignalText");
  const adaptiveRoundText = qs("#adaptiveRoundText");
  const clientsText = qs("#clientsText");
  const dealsTabs = qsa("[data-deal-tab]");
  const dealsCount = qs("#dealsCount");
  const dealsTableBody = qs("#dealsTableBody");
  const dealsCsvBtn = qs("#dealsCsvBtn");
  const learningCourseTitle = qs("#learningCourseTitle");
  const learningCourseMeta = qs("#learningCourseMeta");
  const learningProgressText = qs("#learningProgressText");
  const learningProgressBar = qs("#learningProgressBar");
  const lessonList = qs("#lessonList");
  const lessonImage = qs("#lessonImage");
  const lessonTitle = qs("#lessonTitle");
  const lessonBody = qs("#lessonBody");
  const lessonKeyPoints = qs("#lessonKeyPoints");
  const lessonTask = qs("#lessonTask");
  const lessonPrevBtn = qs("#lessonPrevBtn");
  const lessonNextBtn = qs("#lessonNextBtn");
  const lessonMarkBtn = qs("#lessonMarkBtn");
  const screenerEdgeRange = qs("#screenerEdgeRange");
  const screenerEdgeValue = qs("#screenerEdgeValue");
  const screenerVolumeSelect = qs("#screenerVolumeSelect");
  const screenerSignalSelect = qs("#screenerSignalSelect");
  const screenerCountText = qs("#screenerCountText");
  const screenerTableBody = qs("#screenerTableBody");
  const watchlistSymbolInput = qs("#watchlistSymbolInput");
  const watchlistAddBtn = qs("#watchlistAddBtn");
  const watchlistList = qs("#watchlistList");
  const alertsClearBtn = qs("#alertsClearBtn");
  const alertsList = qs("#alertsList");
  const adminAccessStatus = qs("#adminAccessStatus");
  const adminKeyInput = qs("#adminKeyInput");
  const adminUnlockBtn = qs("#adminUnlockBtn");
  const adminModeText = qs("#adminModeText");
  const adminChaosText = qs("#adminChaosText");
  const adminHaltCountText = qs("#adminHaltCountText");
  const adminModeButtons = qsa(".admin-mode-btn");
  const adminChaosRange = qs("#adminChaosRange");
  const adminChaosValue = qs("#adminChaosValue");
  const adminChaosApplyBtn = qs("#adminChaosApplyBtn");
  const adminSymbolSelect = qs("#adminSymbolSelect");
  const adminHaltToggleBtn = qs("#adminHaltToggleBtn");
  const adminResetBtn = qs("#adminResetBtn");
  const adminEventLog = qs("#adminEventLog");
  const adminUsersBody = qs("#adminUsersBody");
  const adminContactsBody = qs("#adminContactsBody");
  const adminUpdateSymbol = qs("#adminUpdateSymbol");
  const adminUpdateHeadline = qs("#adminUpdateHeadline");
  const adminUpdateVisibility = qs("#adminUpdateVisibility");
  const adminUpdateBody = qs("#adminUpdateBody");
  const adminPublishUpdateBtn = qs("#adminPublishUpdateBtn");
  const adminStockUpdatesBody = qs("#adminStockUpdatesBody");

  const marketPremiumStatus = qs("#marketPremiumStatus");
  const marketUpdatesList = qs("#marketUpdatesList");
  const marketUpgradeBtn = qs("#marketUpgradeBtn");
  const marketRefreshUpdatesBtn = qs("#marketRefreshUpdatesBtn");

  const planActionButtons = qsa("[data-plan-action]");
  const paymentModal = qs("#paymentModal");
  const paymentBackdrop = qs("#paymentBackdrop");
  const paymentCloseBtn = qs("#paymentCloseBtn");
  const paymentPlanLabel = qs("#paymentPlanLabel");
  const paymentAmount = qs("#paymentAmount");
  const paymentForm = qs("#paymentForm");
  const paymentMethod = qs("#paymentMethod");
  const paymentPayerName = qs("#paymentPayerName");
  const paymentSubmitBtn = qs("#paymentSubmitBtn");

  const authModal = qs("#authModal");
  const authBackdrop = qs("#authBackdrop");
  const authCloseBtn = qs("#authCloseBtn");
  const authModalTitle = qs("#authModalTitle");
  const authNote = qs(".auth-note");
  const authTabs = qsa(".auth-tab");
  const loginForm = qs("#loginForm");
  const signupForm = qs("#signupForm");

  const promoModal = qs("#promoModal");
  const promoBackdrop = qs("#promoBackdrop");
  const promoCloseBtn = qs("#promoCloseBtn");
  const promoActionBtn = qs("#promoActionBtn");

  const sectionNodes = qsa("main section[id]");
  // Use relative paths for API calls: works in both local dev and Vercel deployment
  // - Local dev: Frontend and backend on same origin (localhost:PORT)
  // - Vercel: Frontend and API on same domain (your-project.vercel.app)
  const API_BASE = "";

  const state = {
    testimonialIndex: 0,
    testimonialTimer: null,
    livePollTimer: null,
    liveErrorLogged: false,
    countersDone: new WeakSet(),
    activeDealTab: "bulk",
    dealsData: { bulk: [], block: [], short: [] },
    latestStocks: [],
    authUser: null,
    pendingCourseId: null,
    activeCourseId: null,
    activeLessonIndex: 0,
    learningProgress: {},
    enrolledCourses: [],
    watchlist: [],
    alerts: [],
    alertDedup: {},
    lastSymbolSnapshot: {},
    lastFeedAt: 0,
    previousApiHealth: "unknown",
    freshnessTimer: null,
    oauthProviders: {},
    screener: {
      minEdge: 55,
      minVolume: 500000,
      signal: "ALL",
    },
    adminKey: "",
    adminReady: false,
    adminState: null,
    adminPollTimer: null,
    stockUpdates: [],
    lockedUpdateCount: 0,
    activeCheckout: null,
    billingYearly: false,
  };

  const COURSE_CATALOG = {
    "market-basics": {
      title: "Market Basics and Capital Protection",
      track: "Foundation",
      duration: "6 Weeks",
      lessons: [
        {
          title: "How Markets Actually Move",
          image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80",
          body:
            "Understand the forces behind price movement: liquidity, sentiment, earnings expectations, and macro events. This lesson builds your market map so you stop reacting and start interpreting.",
          points: [
            "Primary vs secondary market behavior",
            "Why volatility expands near event windows",
            "How institutions create directional pressure",
          ],
          task: "Open one stock chart and write 3 reasons why price moved in the last week.",
        },
        {
          title: "Capital Protection Framework",
          image: "https://images.unsplash.com/photo-1554224154-26032fced8bd?auto=format&fit=crop&w=1600&q=80",
          body:
            "Before chasing returns, you need an anti-blowup system. Learn hard risk limits, stop placement logic, and drawdown controls used by disciplined operators.",
          points: [
            "1R based position sizing model",
            "Max daily and weekly loss rules",
            "Compounding through consistency, not overtrading",
          ],
          task: "Define your max loss per trade and max loss per week in writing.",
        },
        {
          title: "Watchlists and Decision Checklists",
          image: "https://images.unsplash.com/photo-1642790551116-18e150f248e1?auto=format&fit=crop&w=1600&q=80",
          body:
            "Create a repeatable decision process. You will build watchlists, setup conditions, and a pre-entry checklist that prevents emotional trades.",
          points: [
            "Daily scan routine",
            "Setup-quality scoring",
            "Post-trade review habit",
          ],
          task: "Build a 5-stock watchlist and a 6-point pre-entry checklist.",
        },
      ],
    },
    "earnings-mastery": {
      title: "Earnings, Concall and Balance Sheet Mastery",
      track: "Analysis",
      duration: "8 Weeks",
      lessons: [
        {
          title: "Reading Financial Statements Fast",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
          body:
            "Master a practical reading flow for P&L, cash flow, and balance sheet so you can identify business quality and hidden fragility in minutes.",
          points: [
            "Revenue quality vs accounting noise",
            "Cash conversion vs reported profit",
            "Debt and working capital pressure signals",
          ],
          task: "Pick one company and summarize financial quality in 5 bullet points.",
        },
        {
          title: "Concall Signal Extraction",
          image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80",
          body:
            "Learn to decode management language during concalls and convert qualitative statements into measurable thesis updates.",
          points: [
            "Guidance credibility checklist",
            "Management tone shifts over quarters",
            "Capex, margin, and demand commentary decoding",
          ],
          task: "Review one concall summary and flag 3 statements that could alter valuation.",
        },
        {
          title: "Valuation and Decision Matrix",
          image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80",
          body:
            "Build a lightweight valuation and conviction matrix combining numbers, management quality, and sector context.",
          points: [
            "Base, bull, and bear scenarios",
            "Margin of safety thinking",
            "Decision matrix for hold/add/exit",
          ],
          task: "Prepare a 1-page thesis matrix for one stock in your watchlist.",
        },
      ],
    },
    "agentic-research": {
      title: "Agentic Research and Strategy Automation",
      track: "AI + Quant",
      duration: "10 Weeks",
      lessons: [
        {
          title: "Prompt Systems for Research",
          image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
          body:
            "Design reusable prompts that produce structured, high-quality research outputs instead of generic AI responses.",
          points: [
            "Role-task-context prompt structure",
            "Guardrails for hallucination control",
            "Template stacks for repeatable analysis",
          ],
          task: "Create a 3-part research prompt template and test it on one stock.",
        },
        {
          title: "Automated Signal Pipelines",
          image: "https://images.unsplash.com/photo-1551281044-8b2a1f0f2d20?auto=format&fit=crop&w=1600&q=80",
          body:
            "Turn data into systematic signals with checks for latency, anomalies, and confidence thresholds.",
          points: [
            "Streaming data validation",
            "Signal scoring and threshold design",
            "False-positive reduction loops",
          ],
          task: "Define one signal pipeline from raw input to alert output.",
        },
        {
          title: "Building Your Trading Copilot",
          image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1600&q=80",
          body:
            "Integrate research prompts, watchlist logic, and risk reminders into a daily co-pilot workflow.",
          points: [
            "Morning briefing automation",
            "Position monitoring prompts",
            "Decision journaling automation",
          ],
          task: "Build and run your morning AI briefing workflow for 3 consecutive days.",
        },
      ],
    },
    "sector-rotation": {
      title: "Sector Rotation and Event-driven Investing",
      track: "Analysis",
      duration: "5 Weeks",
      lessons: [
        {
          title: "Sector Leadership Mapping",
          image: "https://images.unsplash.com/photo-1639389015530-730e6d9f2fd2?auto=format&fit=crop&w=1600&q=80",
          body:
            "Learn to identify early leadership shifts by tracking flows, relative strength, and macro catalysts across sectors.",
          points: [
            "Relative strength framework",
            "Breadth and participation indicators",
            "Flow-based sector ranking",
          ],
          task: "Rank 5 sectors today and justify your top 2 picks.",
        },
        {
          title: "Event Playbook Construction",
          image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80",
          body:
            "Convert earnings, policy events, and macro prints into clear playbooks with pre-defined triggers.",
          points: [
            "Pre-event scenario trees",
            "Trigger and invalidation levels",
            "Position scaling around volatility",
          ],
          task: "Draft an event playbook for an upcoming macro/earnings date.",
        },
        {
          title: "Portfolio Rotation Execution",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
          body:
            "Implement reallocation rules so your portfolio adapts with regime changes without emotional overreaction.",
          points: [
            "Rotation position sizing",
            "Correlation control",
            "Review cadence for rebalancing",
          ],
          task: "Create a monthly rotation checklist for your portfolio.",
        },
      ],
    },
    "risk-psychology": {
      title: "Risk, Position Sizing and Trading Psychology",
      track: "Foundation",
      duration: "4 Weeks",
      lessons: [
        {
          title: "Position Sizing That Survives Volatility",
          image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1600&q=80",
          body:
            "Size positions using volatility and conviction so one trade never damages your long-term compounding.",
          points: [
            "Fixed fractional and ATR sizing",
            "Setup-quality based sizing tiers",
            "Portfolio heat limits",
          ],
          task: "Calculate position size for 3 trades using your risk model.",
        },
        {
          title: "Psychology Under Pressure",
          image: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1600&q=80",
          body:
            "Recognize patterns like revenge trading, FOMO entries, and overconfidence before they impact execution.",
          points: [
            "Emotional trigger identification",
            "Pre-commitment decision rituals",
            "Recovery protocol after losses",
          ],
          task: "Write your personal anti-tilt protocol for losing streaks.",
        },
        {
          title: "Performance Review System",
          image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          body:
            "Build a review dashboard that tracks expectancy, drawdowns, and behavior quality to improve over time.",
          points: [
            "Expectancy and win/loss quality",
            "Mistake taxonomy",
            "Weekly improvement loop",
          ],
          task: "Review your last 10 trades and categorize each mistake type.",
        },
      ],
    },
    "api-pipelines": {
      title: "API Data Pipelines and Execution Dashboards",
      track: "AI + Quant",
      duration: "7 Weeks",
      lessons: [
        {
          title: "Streaming Architecture Foundations",
          image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1600&q=80",
          body:
            "Design event-driven pipelines that ingest, validate, and route market data reliably under latency constraints.",
          points: [
            "Event bus and pub-sub patterns",
            "Data quality and anomaly handling",
            "Latency budget planning",
          ],
          task: "Draw your own end-to-end data pipeline architecture.",
        },
        {
          title: "API Reliability and Monitoring",
          image: "https://images.unsplash.com/photo-1581091215367-59ab6dcef3d5?auto=format&fit=crop&w=1600&q=80",
          body:
            "Implement health checks, retries, circuit breakers, and dashboard metrics for production-grade reliability.",
          points: [
            "Error budgets and alerting tiers",
            "Fallback and retry strategies",
            "Operational dashboard design",
          ],
          task: "Define 5 critical alerts your execution stack must have.",
        },
        {
          title: "Execution Dashboard Capstone",
          image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1600&q=80",
          body:
            "Ship a complete dashboard that surfaces signal quality, orderbook context, and risk status in one view.",
          points: [
            "UX for high-pressure decisions",
            "Metric prioritization",
            "Deployment readiness checklist",
          ],
          task: "Publish a capstone dashboard and document your ops runbook.",
        },
      ],
    },
  };

  const DEAL_TAB_LABELS = {
    bulk: "BULK DEALS",
    block: "BLOCK DEALS",
    short: "SHORT SELLING",
  };

  const CLIENT_POOL = [
    "MOTILAL OSWAL MUTUAL FUND",
    "AISHWARYA ARVIND",
    "REVERA DEVELOPERS LLP",
    "NURTURE WELL INDUSTRIES",
    "PROGNOSIS SECURITIES PVT. LTD.",
    "DEEPAL PRAVINBHAI SHAH HUF",
    "MANISHA ART JEWELLERS LLP",
    "BULLPULSE MARKETEDGE",
    "XL ENERGY LIMITED",
    "ZENITH ALPHA CAPITAL",
  ];

  const SHORT_CLIENT_POOL = [
    "EDGE RISK DESK LLP",
    "BETA HEDGE TRADING",
    "NOVA STRATEGIC CAPITAL",
    "DELTA QUANT PARTNERS",
    "SYSTEMATIC SHORT OPPS DESK",
  ];

  function showToast(message, level = "info") {
    const toast = document.createElement("div");
    toast.className = "toast";
    if (level === "error") {
      toast.style.borderColor = "rgba(255, 120, 138, 0.6)";
    }
    toast.textContent = message;
    toastStack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 220);
    }, 3000);
  }

  function formatNumber(value, digits = 2) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";
    return num.toFixed(digits);
  }

  function formatInt(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";
    return Math.round(num).toLocaleString();
  }

  function formatIndianInt(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return "--";
    return Math.round(num).toLocaleString("en-IN");
  }

  function formatDealDate(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    const parts = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return parts.replace(/ /g, "-");
  }

  function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickFromPool(pool, key) {
    if (!pool.length) return "INSTITUTIONAL CLIENT";
    return pool[hashString(key) % pool.length];
  }

  function securityNameForSymbol(symbol) {
    const aliases = {
      "M&M": "Mahindra and Mahindra Limited",
      LT: "Larsen and Toubro Limited",
      ITC: "ITC Limited",
      TCS: "Tata Consultancy Services Limited",
      INFY: "Infosys Limited",
      SBIN: "State Bank of India",
      DLF: "DLF Limited",
      UPL: "UPL Limited",
      BPCL: "Bharat Petroleum Corporation Limited",
      NTPC: "NTPC Limited",
      ONGC: "Oil and Natural Gas Corporation Limited",
    };
    if (aliases[symbol]) return aliases[symbol];
    return `${String(symbol).replace(/-/g, " ")} Limited`;
  }

  function classifyDealBucket(item) {
    const edge = Number(item.edge_score || 0);
    const volume = Number(item.volume || 0);
    const imbalance = Number(item.order_imbalance || 0);
    const signalType = String(item.signal_type || "").toUpperCase();

    if (imbalance <= -0.35 || signalType === "FAKE_BREAKOUT") return "short";
    if (volume >= 900000 || edge >= 72) return "block";
    return "bulk";
  }

  function buildDealsData(items) {
    const buckets = { bulk: [], block: [], short: [] };
    const nowTs = Date.now();

    (items || []).forEach((item, index) => {
      if (!item || !item.symbol) return;
      const bucket = classifyDealBucket(item);
      const symbol = String(item.symbol);
      const edge = Number(item.edge_score || 0);
      const price = Number(item.price || 0);
      const volume = Math.max(1000, Number(item.volume || 1000));
      const imbalance = Number(item.order_imbalance || 0);
      const side = bucket === "short" ? "SELL" : imbalance >= 0 ? "BUY" : "SELL";
      const key = `${symbol}-${bucket}-${index}-${Math.floor(nowTs / 60000)}`;
      const clientName = pickFromPool(bucket === "short" ? SHORT_CLIENT_POOL : CLIENT_POOL, key);
      const quantityFactor = bucket === "block" ? 2.8 : bucket === "short" ? 1.7 : 1.15;
      const quantity = Math.max(1000, Math.round(volume * quantityFactor));
      const tweak = ((hashString(key) % 9) - 4) / 1000;
      const avgPrice = Math.max(0.01, price * (1 + tweak));

      buckets[bucket].push({
        date: formatDealDate(item.timestamp || nowTs),
        symbol,
        securityName: securityNameForSymbol(symbol),
        clientName,
        side,
        quantity,
        tradePrice: price,
        avgPrice,
        remarks:
          bucket === "short"
            ? "Aggressive sell-side pressure"
            : edge >= 65
              ? "Strong institutional participation"
              : "-",
      });
    });

    Object.keys(buckets).forEach((bucket) => {
      buckets[bucket].sort((a, b) => b.quantity - a.quantity);
      buckets[bucket] = buckets[bucket].slice(0, 120);
    });

    state.dealsData = buckets;
  }

  function renderDealsTable() {
    if (!dealsTableBody || !dealsCount) return;
    const tab = state.activeDealTab;
    const rows = state.dealsData[tab] || [];
    dealsCount.textContent = `${DEAL_TAB_LABELS[tab] || "DEALS"}: ${rows.length}`;

    if (!rows.length) {
      dealsTableBody.innerHTML = '<tr><td colspan="8">No deals available in this category yet.</td></tr>';
      return;
    }

    dealsTableBody.innerHTML = rows
      .map((row) => {
        const sideClass = row.side === "BUY" ? "deal-side-buy" : "deal-side-sell";
        return `
          <tr>
            <td>${row.date}</td>
            <td class="deal-symbol">${row.symbol}</td>
            <td>${row.securityName}</td>
            <td>${row.clientName}</td>
            <td class="${sideClass}">${row.side}</td>
            <td>${formatIndianInt(row.quantity)}</td>
            <td>${formatNumber(row.tradePrice, 2)} / ${formatNumber(row.avgPrice, 2)}</td>
            <td>${row.remarks}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderDealsUnavailable(reason) {
    if (!dealsTableBody || !dealsCount) return;
    dealsCount.textContent = `${DEAL_TAB_LABELS[state.activeDealTab] || "DEALS"}: 0`;
    dealsTableBody.innerHTML = `<tr><td colspan="8">${reason}</td></tr>`;
  }

  function exportDealsCsv() {
    const rows = state.dealsData[state.activeDealTab] || [];
    if (!rows.length) {
      showToast("No rows to export in this tab.", "error");
      return;
    }

    const headers = [
      "DATE",
      "SYMBOL",
      "SECURITY NAME",
      "CLIENT NAME",
      "BUY/SELL",
      "QUANTITY TRADED",
      "TRADE PRICE",
      "AVG PRICE",
      "REMARKS",
    ];

    const csvRows = rows.map((row) =>
      [
        row.date,
        row.symbol,
        row.securityName,
        row.clientName,
        row.side,
        row.quantity,
        formatNumber(row.tradePrice, 2),
        formatNumber(row.avgPrice, 2),
        row.remarks,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.activeDealTab}-deals-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function setDealsTabs() {
    dealsTabs.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.getAttribute("data-deal-tab") || "bulk";
        state.activeDealTab = tab;
        dealsTabs.forEach((node) => node.classList.remove("active"));
        button.classList.add("active");
        renderDealsTable();
      });
    });

    dealsCsvBtn?.addEventListener("click", exportDealsCsv);
  }

  function loadUserState() {
    try {
      state.authUser = JSON.parse(localStorage.getItem("ope_auth_user") || "null");
      state.learningProgress = JSON.parse(localStorage.getItem("ope_learning_progress") || "{}");
      state.enrolledCourses = JSON.parse(localStorage.getItem("ope_enrolled_courses") || "[]");
      state.watchlist = JSON.parse(localStorage.getItem("ope_watchlist") || "[]");
      state.adminKey = String(localStorage.getItem("ope_admin_key") || "");
      if (adminKeyInput && state.adminKey) adminKeyInput.value = state.adminKey;
      if (!Array.isArray(state.watchlist)) state.watchlist = [];
      state.watchlist = state.watchlist.map((symbol) => String(symbol).toUpperCase()).slice(0, 40);
    } catch {
      state.authUser = null;
      state.learningProgress = {};
      state.enrolledCourses = [];
      state.watchlist = [];
      state.adminKey = "";
    }
  }

  function persistUserState() {
    localStorage.setItem("ope_auth_user", JSON.stringify(state.authUser));
    localStorage.setItem("ope_learning_progress", JSON.stringify(state.learningProgress));
    localStorage.setItem("ope_enrolled_courses", JSON.stringify(state.enrolledCourses));
    localStorage.setItem("ope_watchlist", JSON.stringify(state.watchlist));
    localStorage.setItem("ope_admin_key", state.adminKey || "");
  }

  function isLoggedIn() {
    return Boolean(state.authUser && state.authUser.email);
  }

  function isPremiumUser() {
    return Boolean(state.authUser && state.authUser.premium);
  }

  function isAdminUser() {
    return String(state.authUser?.role || "").toLowerCase() === "admin";
  }

  function isCourseEnrolled(courseId) {
    return state.enrolledCourses.includes(courseId);
  }

  function getCourseIdFromNode(node) {
    if (!node || !(node instanceof Element)) return null;
    const direct = node.getAttribute("data-course-id");
    if (direct && COURSE_CATALOG[direct]) return direct;

    const courseCard = node.closest(".course-card");
    if (courseCard) {
      const fromCard = courseCard.getAttribute("data-course-id");
      if (fromCard && COURSE_CATALOG[fromCard]) return fromCard;

      const heading = qs("h3", courseCard)?.textContent?.trim() || "";
      const match = Object.entries(COURSE_CATALOG).find(([, course]) => course.title === heading);
      if (match) return match[0];
    }
    return null;
  }

  function updateAuthUi() {
    if (!navLoginBtn) return;
    if (isLoggedIn()) {
      const firstName = String(state.authUser.name || "Learner").split(" ")[0];
      if (isAdminUser()) {
        navLoginBtn.textContent = `Logout (${firstName} | Admin)`;
      } else {
        navLoginBtn.textContent = isPremiumUser() ? `Logout (${firstName} | Pro)` : `Logout (${firstName})`;
      }
    } else {
      navLoginBtn.textContent = "Login / Sign Up";
    }
    if (marketPremiumStatus) {
      if (!isLoggedIn()) {
        marketPremiumStatus.textContent = "Login required";
      } else if (isAdminUser()) {
        marketPremiumStatus.textContent = "Admin account";
      } else {
        marketPremiumStatus.textContent = isPremiumUser() ? "Premium active" : "Free plan";
      }
    }
  }

  function openAuthModal(courseId = null) {
    if (!authModal) return;
    state.pendingCourseId = courseId;
    const loginSubmit = qs('button[type="submit"]', loginForm || document);
    const signupSubmit = qs('button[type="submit"]', signupForm || document);
    if (authModalTitle) authModalTitle.textContent = "Create Account or Login";
    if (authNote) {
      authNote.textContent = courseId
        ? "Continue with Google, GitHub, Facebook, or email to enroll in this course."
        : "Use Google, GitHub, Facebook, or continue with email.";
    }
    if (loginSubmit) loginSubmit.textContent = courseId ? "Login and Enroll" : "Continue with Email";
    if (signupSubmit) signupSubmit.textContent = courseId ? "Create Account and Enroll" : "Create Account with Email";
    setAuthTab("login");
    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.pendingCourseId = null;
  }

  function setAuthTab(tab) {
    authTabs.forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-auth-tab") === tab);
    });
    loginForm?.classList.toggle("hidden-auth", tab !== "login");
    signupForm?.classList.toggle("hidden-auth", tab !== "signup");
  }

  function authApiUrl(path) {
    return `${API_BASE}${path}`;
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(authApiUrl(path), {
      method: options.method || "GET",
      cache: "no-store",
      credentials: options.credentials ? "include" : "same-origin",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = String(payload.detail || payload.error || `HTTP ${response.status}`);
      throw new Error(detail);
    }
    return payload;
  }

  function currentSafePath() {
    const path = `${location.pathname || "/"}${location.search || ""}${location.hash || ""}`.trim();
    if (!path.startsWith("/")) return "/";
    if (path.startsWith("/auth/")) return "/";
    return path || "/";
  }

  function buildAuthButtons() {
    if (!authModal) return;
    const authPanel = qs(".auth-panel", authModal);
    if (!authPanel || qs(".oauth-buttons", authPanel)) return;

    if (authModalTitle) authModalTitle.textContent = "Create Account or Login";
    if (authNote) authNote.textContent = "Use Google, GitHub, Facebook or continue with email.";

    const buttonsWrap = document.createElement("div");
    buttonsWrap.className = "oauth-buttons";
    buttonsWrap.innerHTML = `
      <button class="oauth-btn" type="button" data-oauth-provider="google">
        <span class="oauth-icon google">
          <img class="oauth-icon-image" src="/frontend/images/google.png" alt="Google" />
        </span>
        <span>Continue with Google</span>
        <small class="oauth-hint"></small>
      </button>
      <button class="oauth-btn" type="button" data-oauth-provider="github">
        <span class="oauth-icon github">
          <img class="oauth-icon-image" src="/frontend/images/github.png" alt="GitHub" />
        </span>
        <span>Continue with GitHub</span>
        <small class="oauth-hint"></small>
      </button>
      <button class="oauth-btn" type="button" data-oauth-provider="facebook">
        <span class="oauth-icon facebook">
          <img class="oauth-icon-image" src="/frontend/images/facebook.png" alt="Facebook" />
        </span>
        <span>Continue with Facebook</span>
        <small class="oauth-hint"></small>
      </button>
    `;

    const divider = document.createElement("div");
    divider.className = "auth-divider";
    divider.innerHTML = "<span>or</span>";

    const tabs = qs(".auth-tabs", authPanel);
    if (tabs) {
      authPanel.insertBefore(buttonsWrap, tabs);
      authPanel.insertBefore(divider, tabs);
    } else {
      authPanel.appendChild(buttonsWrap);
      authPanel.appendChild(divider);
    }
  }

  function setOauthButtonsAvailability() {
    const buttons = qsa("[data-oauth-provider]", authModal || document);
    const lastUsed = String(localStorage.getItem("ope_last_oauth_provider") || "").toLowerCase();
    buttons.forEach((button) => {
      const provider = String(button.getAttribute("data-oauth-provider") || "").toLowerCase();
      const enabled = state.oauthProviders[provider] === true;
      const hint = qs(".oauth-hint", button);
      button.disabled = !enabled;
      button.classList.toggle("oauth-disabled", !enabled);
      const isLastUsed = enabled && provider === lastUsed;
      button.classList.toggle("oauth-last-used", isLastUsed);
      if (hint) hint.textContent = enabled ? (isLastUsed ? "Last used" : "") : "Setup required";
    });
  }

  async function refreshOauthProviders() {
    try {
      const response = await fetch(authApiUrl("/auth/providers"), { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      const map = {};
      (payload.providers || []).forEach((provider) => {
        map[String(provider.id || "").toLowerCase()] = Boolean(provider.enabled);
      });
      state.oauthProviders = map;
      setOauthButtonsAvailability();
    } catch {
      setOauthButtonsAvailability();
    }
  }

  async function syncAuthSession() {
    try {
      const response = await fetch(authApiUrl("/auth/session"), {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload?.authenticated && payload?.user) {
        const user = payload.user;
        state.authUser = {
          name: String(user.name || "Learner"),
          email: String(user.email || ""),
          provider: String(user.provider || ""),
          avatar: String(user.avatar || ""),
          role: String(user.role || "user"),
          premium: Boolean(user.premium),
          plan: String(user.plan || ""),
        };
        persistUserState();
      } else if (state.authUser) {
        state.authUser = null;
        state.adminReady = false;
        persistUserState();
      }
    } catch {
      // keep local-only auth fallback untouched
    }
  }

  function redirectToOauth(provider) {
    const cleanProvider = String(provider || "").toLowerCase();
    if (!cleanProvider) return;
    if (state.pendingCourseId) {
      localStorage.setItem("ope_pending_course", state.pendingCourseId);
    }
    localStorage.setItem("ope_last_oauth_provider", cleanProvider);
    const next = currentSafePath();
    const url = `${authApiUrl(`/auth/login/${encodeURIComponent(cleanProvider)}`)}?next=${encodeURIComponent(next)}`;
    window.location.href = url;
  }

  function consumePendingOAuthEnrollment() {
    const pending = String(localStorage.getItem("ope_pending_course") || "").trim();
    if (!pending || !isLoggedIn()) return;
    localStorage.removeItem("ope_pending_course");
    if (COURSE_CATALOG[pending]) {
      enrollCourse(pending, Boolean(lessonList));
      showToast("Logged in and enrolled successfully.");
    }
  }

  function consumeAuthErrorFlag() {
    const params = new URLSearchParams(location.search || "");
    const code = String(params.get("auth_error") || "").trim().toLowerCase();
    if (!code) return;

    const messageByCode = {
      oauth_denied: "Login was canceled or denied. Please try again.",
      oauth_missing_config: "This social login is not configured yet. Use email or ask admin to add OAuth keys.",
      oauth_forbidden: "Provider denied the request. Check OAuth app setup and allowed callback URL.",
      oauth_failed: "Social login failed due to a temporary provider error. Please retry.",
    };
    showToast(messageByCode[code] || "Social login failed. Please retry.", "error");

    params.delete("auth_error");
    const cleanQuery = params.toString();
    const cleanUrl = `${location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${location.hash || ""}`;
    window.history.replaceState({}, "", cleanUrl);
  }

  function setAuthHandlers() {
    buildAuthButtons();
    setOauthButtonsAvailability();
    refreshOauthProviders();

    const oauthButtons = qsa("[data-oauth-provider]", authModal || document);
    oauthButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) {
          showToast("This provider is not configured yet.", "error");
          return;
        }
        const provider = button.getAttribute("data-oauth-provider") || "";
        redirectToOauth(provider);
      });
    });

    authTabs.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.getAttribute("data-auth-tab") || "login";
        setAuthTab(tab);
      });
    });

    authBackdrop?.addEventListener("click", closeAuthModal);
    authCloseBtn?.addEventListener("click", closeAuthModal);

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = qs("#loginEmail")?.value.trim().toLowerCase() || "";
      const password = qs("#loginPassword")?.value || "";
      if (!email || password.length < 6) {
        showToast("Enter valid credentials to continue.", "error");
        return;
      }
      try {
        const payload = await apiRequest("/auth/email-login", {
          method: "POST",
          body: { email, password },
          credentials: true,
        });
        const user = payload.user || {};
        state.authUser = {
          name: String(user.name || "Learner"),
          email: String(user.email || email),
          provider: String(user.provider || "email"),
          avatar: String(user.avatar || ""),
          role: String(user.role || "user"),
          premium: Boolean(user.premium),
          plan: String(user.plan || ""),
        };
        persistUserState();
        updateAuthUi();
        showToast("Logged in successfully.");

        const pending = state.pendingCourseId;
        closeAuthModal();
        loginForm.reset();
        if (pending) enrollCourse(pending, true);
        refreshStockUpdatesPanel();
      } catch (error) {
        showToast(String(error?.message || "Login failed."), "error");
      }
    });

    signupForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = qs("#signupName")?.value.trim() || "";
      const email = qs("#signupEmail")?.value.trim().toLowerCase() || "";
      const password = qs("#signupPassword")?.value || "";
      if (!name || !email || password.length < 6) {
        showToast("Please provide name, email and a 6+ char password.", "error");
        return;
      }
      try {
        const payload = await apiRequest("/auth/email-signup", {
          method: "POST",
          body: { name, email, password },
          credentials: true,
        });
        const user = payload.user || {};
        state.authUser = {
          name: String(user.name || name),
          email: String(user.email || email),
          provider: String(user.provider || "email"),
          avatar: String(user.avatar || ""),
          role: String(user.role || "user"),
          premium: Boolean(user.premium),
          plan: String(user.plan || ""),
        };
        persistUserState();
        updateAuthUi();
        showToast("Account created. Welcome aboard.");

        const pending = state.pendingCourseId;
        closeAuthModal();
        signupForm.reset();
        if (pending) enrollCourse(pending, true);
        refreshStockUpdatesPanel();
      } catch (error) {
        showToast(String(error?.message || "Sign up failed."), "error");
      }
    });
  }

  function updateEnrollButtons() {
    enrollButtons.forEach((button) => {
      const courseId = getCourseIdFromNode(button) || "";
      if (!courseId) return;
      if (isCourseEnrolled(courseId)) {
        button.textContent = "Continue Learning";
        button.classList.remove("btn-outline");
        button.classList.add("btn-primary");
      } else {
        button.textContent = "Enroll Free";
        button.classList.add("btn-outline");
        button.classList.remove("btn-primary");
      }
    });
  }

  function getCourseProgress(courseId) {
    if (!state.learningProgress[courseId]) {
      state.learningProgress[courseId] = { lessonIndex: 0, completed: [] };
    }
    return state.learningProgress[courseId];
  }

  function renderLearningLesson(courseId, lessonIndex) {
    if (
      !learningCourseTitle ||
      !learningCourseMeta ||
      !learningProgressText ||
      !learningProgressBar ||
      !lessonList ||
      !lessonImage ||
      !lessonTitle ||
      !lessonBody ||
      !lessonKeyPoints ||
      !lessonTask ||
      !lessonPrevBtn ||
      !lessonNextBtn ||
      !lessonMarkBtn
    ) {
      return;
    }

    const course = COURSE_CATALOG[courseId];
    if (!course) return;
    const lessons = course.lessons || [];
    const clampedIndex = Math.max(0, Math.min(lessonIndex, lessons.length - 1));
    state.activeCourseId = courseId;
    state.activeLessonIndex = clampedIndex;

    const progress = getCourseProgress(courseId);
    progress.lessonIndex = clampedIndex;
    persistUserState();

    const lesson = lessons[clampedIndex];
    const completedSet = new Set(progress.completed || []);
    const completionPercent = lessons.length ? (completedSet.size / lessons.length) * 100 : 0;

    learningCourseTitle.textContent = course.title;
    learningCourseMeta.textContent = `${course.track} | ${course.duration} | Free access active`;
    learningProgressText.textContent = `Progress: ${Math.round(completionPercent)}% (${completedSet.size}/${lessons.length} lessons complete)`;
    learningProgressBar.style.width = `${completionPercent}%`;

    lessonImage.src = lesson.image;
    lessonImage.alt = `${lesson.title} visual`;
    lessonTitle.textContent = `${clampedIndex + 1}. ${lesson.title}`;
    lessonBody.textContent = lesson.body;
    lessonTask.textContent = `Practice task: ${lesson.task}`;
    lessonKeyPoints.innerHTML = (lesson.points || []).map((point) => `<li>${point}</li>`).join("");

    lessonList.innerHTML = lessons
      .map((item, idx) => {
        const classes = [idx === clampedIndex ? "active" : "", completedSet.has(idx) ? "done" : ""].filter(Boolean).join(" ");
        return `<li class="${classes}" data-lesson-index="${idx}">${idx + 1}. ${item.title}</li>`;
      })
      .join("");

    qsa("li[data-lesson-index]", lessonList).forEach((node) => {
      node.addEventListener("click", () => {
        const idx = Number(node.getAttribute("data-lesson-index"));
        renderLearningLesson(courseId, idx);
      });
    });

    lessonPrevBtn.disabled = clampedIndex <= 0;
    lessonNextBtn.disabled = clampedIndex >= lessons.length - 1;
    lessonMarkBtn.textContent = completedSet.has(clampedIndex) ? "Completed" : "Mark Complete";
    lessonMarkBtn.disabled = completedSet.has(clampedIndex);
  }

  function openLearningStudio(courseId, scrollToSection = true) {
    if (!COURSE_CATALOG[courseId]) return;
    const progress = getCourseProgress(courseId);
    renderLearningLesson(courseId, progress.lessonIndex || 0);
    if (scrollToSection) {
      const section = qs("#learning-studio");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function enrollCourse(courseId, openStudioAfterEnroll = true) {
    if (!COURSE_CATALOG[courseId]) return;
    if (!isCourseEnrolled(courseId)) {
      state.enrolledCourses.push(courseId);
      showToast("Enrolled successfully. Cost: Free for now.");
    }
    getCourseProgress(courseId);
    persistUserState();
    updateEnrollButtons();
    if (openStudioAfterEnroll) openLearningStudio(courseId, true);
  }

  function setEnrollHandlers() {
    enrollButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const courseId = getCourseIdFromNode(button) || "";
        if (!courseId) return;
        if (!isLoggedIn()) {
          openAuthModal(courseId);
          return;
        }
        enrollCourse(courseId, true);
      });
    });
  }

  function setLearningControls() {
    lessonPrevBtn?.addEventListener("click", () => {
      if (!state.activeCourseId) return;
      renderLearningLesson(state.activeCourseId, state.activeLessonIndex - 1);
    });

    lessonNextBtn?.addEventListener("click", () => {
      if (!state.activeCourseId) return;
      renderLearningLesson(state.activeCourseId, state.activeLessonIndex + 1);
    });

    lessonMarkBtn?.addEventListener("click", () => {
      if (!state.activeCourseId) return;
      const progress = getCourseProgress(state.activeCourseId);
      const done = new Set(progress.completed || []);
      done.add(state.activeLessonIndex);
      progress.completed = Array.from(done).sort((a, b) => a - b);
      persistUserState();
      renderLearningLesson(state.activeCourseId, state.activeLessonIndex);
      showToast("Lesson marked complete.");
    });
  }

  function setHeaderEffects() {
    if (!siteHeader || !scrollProgress) return;
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      siteHeader.classList.toggle("scrolled", scrollTop > 16);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = (scrollTop / maxScroll) * 100;
      scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setCursorGlow() {
    if (!cursorGlow) return;
    window.addEventListener(
      "pointermove",
      (event) => {
        cursorGlow.style.transform = `translate(${event.clientX - 130}px, ${event.clientY - 130}px)`;
      },
      { passive: true }
    );
  }

  function setNavbar() {
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      const spans = qsa("span", navToggle);
      if (spans.length === 3) {
        spans[0].style.transform = isOpen ? "translateY(7px) rotate(45deg)" : "";
        spans[1].style.opacity = isOpen ? "0" : "1";
        spans[2].style.transform = isOpen ? "translateY(-7px) rotate(-45deg)" : "";
      }
    });

    navAnchors.forEach((anchor) => {
      anchor.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (!navLinks.classList.contains("open")) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!navLinks.contains(target) && !navToggle.contains(target)) {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    if (navLoginBtn) {
      navLoginBtn.addEventListener("click", async () => {
        if (isLoggedIn()) {
          try {
            await fetch(authApiUrl("/auth/logout"), {
              method: "POST",
              credentials: "include",
            });
          } catch {
            // local signout fallback still applies
          }
          state.authUser = null;
          state.adminReady = false;
          localStorage.removeItem("ope_pending_course");
          persistUserState();
          updateAuthUi();
          refreshStockUpdatesPanel();
          showToast("Logged out successfully.");
          return;
        }
        openAuthModal(null);
      });
    }
  }

  function setActiveSectionLinks() {
    if (!sectionNodes.length) return;
    const hashNavLinks = navAnchors.filter((link) => String(link.getAttribute("href") || "").startsWith("#"));
    if (!hashNavLinks.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          if (!id) return;
          hashNavLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" }
    );

    sectionNodes.forEach((section) => observer.observe(section));
  }

  function setRevealObserver() {
    if (!revealItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function animateCounter(node) {
    if (state.countersDone.has(node)) return;
    state.countersDone.add(node);

    const target = Number(node.getAttribute("data-counter"));
    if (!Number.isFinite(target)) return;

    const duration = 1500;
    const start = performance.now();
    const decimals = String(node.getAttribute("data-counter")).includes(".") ? 2 : 0;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease;
      node.textContent = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  function setCounterObserver() {
    if (!counterItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counterItems.forEach((counter) => observer.observe(counter));
  }

  function setTiltCards() {
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 7;
        const rotateX = (0.5 - y) * 7;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  function openModal() {
    if (!leadModal) return;
    leadModal.classList.add("is-open");
    leadModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!leadModal) return;
    leadModal.classList.remove("is-open");
    leadModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setModalHandlers() {
    openModalButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const courseId = getCourseIdFromNode(button);
        if (courseId) {
          event.preventDefault();
          if (!isLoggedIn()) {
            openAuthModal(courseId);
          } else {
            enrollCourse(courseId, true);
          }
          return;
        }
        openModal();
      });
    });

    closeModalButtons.forEach((button) => {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
        closeAuthModal();
        closePaymentModal();
      }
    });

    if (leadForm) {
      leadForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const payload = {
          name: qs("#leadName")?.value.trim() || "",
          email: qs("#leadEmail")?.value.trim() || "",
          role: qs("#leadRole")?.value || "",
          note: qs("#leadNote")?.value.trim() || "",
        };

        if (!payload.name || !payload.email || !payload.role) {
          showToast("Please fill name, email and goal.", "error");
          return;
        }

        try {
          await apiRequest("/crm/lead", {
            method: "POST",
            body: payload,
          });
        } catch {
          const leads = JSON.parse(localStorage.getItem("ope_leads") || "[]");
          leads.push({ ...payload, timestamp: new Date().toISOString() });
          localStorage.setItem("ope_leads", JSON.stringify(leads));
        }

        leadForm.reset();
        closeModal();
        showToast("Onboarding request received. Check your inbox soon.");
      });
    }
  }

  function setNewsletter() {
    if (!newsletterForm) return;
    newsletterForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = qs("#newsletterEmail")?.value.trim() || "";
      if (!email) {
        showToast("Please enter a valid email.", "error");
        return;
      }

      try {
        await apiRequest("/crm/newsletter", {
          method: "POST",
          body: { email },
        });
      } catch {
        const list = JSON.parse(localStorage.getItem("ope_newsletter") || "[]");
        list.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem("ope_newsletter", JSON.stringify(list));
      }
      newsletterForm.reset();
      showToast("Subscribed successfully. Weekly market drops unlocked.");
    });
  }

  function setCourseFilters() {
    chipButtons.forEach((button) => {
      button.addEventListener("click", () => {
        chipButtons.forEach((chip) => chip.classList.remove("active"));
        button.classList.add("active");
        const filter = button.getAttribute("data-filter") || "all";

        courseCards.forEach((card) => {
          const category = card.getAttribute("data-category") || "";
          const visible = filter === "all" || filter === category;
          card.classList.toggle("hidden", !visible);
        });
      });
    });
  }

  function setFaq() {
    faqItems.forEach((item) => {
      const trigger = qs(".faq-q", item);
      if (!trigger) return;
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        faqItems.forEach((node) => node.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  function showTestimonial(index) {
    if (!testimonials.length) return;
    state.testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => {
      item.classList.toggle("active", i === state.testimonialIndex);
    });
  }

  function setTestimonials() {
    if (!testimonials.length) return;

    prevTestimonialBtn?.addEventListener("click", () => showTestimonial(state.testimonialIndex - 1));
    nextTestimonialBtn?.addEventListener("click", () => showTestimonial(state.testimonialIndex + 1));

    showTestimonial(0);
    state.testimonialTimer = setInterval(() => showTestimonial(state.testimonialIndex + 1), 6000);
  }

  function setPricingToggle() {
    if (!billingToggle) return;

    const updatePrices = () => {
      const yearly = billingToggle.checked;
      state.billingYearly = yearly;
      priceValues.forEach((priceNode) => {
        const monthly = Number(priceNode.getAttribute("data-monthly"));
        const annual = Number(priceNode.getAttribute("data-yearly"));
        const value = yearly ? annual : monthly;
        priceNode.textContent = `$${value}`;
      });
    };

    billingToggle.addEventListener("change", updatePrices);
    updatePrices();
  }

  function planLabel(planKey) {
    const map = {
      starter_monthly: "Starter Monthly",
      pro_monthly: "Pro Monthly",
      pro_yearly: "Pro Yearly",
      institutional_monthly: "Institutional Monthly",
    };
    return map[String(planKey || "").toLowerCase()] || "Pro Monthly";
  }

  function resolvePlanForActionNode(node) {
    if (!(node instanceof Element)) return "pro_monthly";
    const monthly = String(node.getAttribute("data-plan-monthly") || "pro_monthly");
    const yearly = String(node.getAttribute("data-plan-yearly") || monthly);
    return state.billingYearly ? yearly : monthly;
  }

  function closePaymentModal() {
    if (!paymentModal) return;
    paymentModal.classList.remove("is-open");
    paymentModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.activeCheckout = null;
    if (paymentForm) paymentForm.reset();
  }

  async function openPaymentModal(planKey = "pro_monthly") {
    if (!isLoggedIn()) {
      openAuthModal(null);
      return;
    }
    if (!paymentModal || !paymentForm) {
      window.location.href = "/pricing";
      return;
    }

    paymentModal.classList.add("is-open");
    paymentModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (paymentSubmitBtn) paymentSubmitBtn.disabled = true;

    try {
      const payload = await apiRequest("/payments/create-checkout", {
        method: "POST",
        body: { plan: planKey },
        credentials: true,
      });
      state.activeCheckout = payload.checkout || null;
      if (paymentPlanLabel) paymentPlanLabel.textContent = planLabel(state.activeCheckout?.plan || planKey);
      if (paymentAmount) paymentAmount.textContent = `INR ${formatInt(state.activeCheckout?.amount_inr || 0)}`;
      if (paymentSubmitBtn) paymentSubmitBtn.disabled = false;
    } catch (error) {
      showToast(String(error?.message || "Unable to initialize payment gateway."), "error");
      closePaymentModal();
    }
  }

  function renderMarketUpdatesList(items, lockedCount = 0) {
    if (!marketUpdatesList) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      marketUpdatesList.innerHTML = `<li>No visible stock updates yet.${lockedCount > 0 ? " Upgrade to unlock premium updates." : ""}</li>`;
      return;
    }
    marketUpdatesList.innerHTML = "";
    list.slice(0, 60).forEach((item) => {
      const row = document.createElement("li");
      row.className = "market-update-item";
      row.innerHTML = `
        <header>
          <strong>${String(item.symbol || "--")}</strong>
          <span>${String(item.visibility || "premium").toUpperCase()}</span>
        </header>
        <h4>${String(item.headline || "Admin market update")}</h4>
        <p>${String(item.body || "")}</p>
        <time>${new Date(Number(item.updated_at) || Date.now()).toLocaleString("en-IN")}</time>
      `;
      marketUpdatesList.appendChild(row);
    });
  }

  async function refreshStockUpdatesPanel() {
    if (!marketUpdatesList && !marketPremiumStatus) return;

    if (!isLoggedIn()) {
      renderMarketUpdatesList([], 0);
      if (marketPremiumStatus) marketPremiumStatus.textContent = "Login required";
      return;
    }

    try {
      const payload = await apiRequest("/stock-updates", { credentials: true });
      state.stockUpdates = Array.isArray(payload.items) ? payload.items : [];
      state.lockedUpdateCount = Number(payload.locked_count || 0);
      const premiumActive = Boolean(payload.premium_active);
      const adminOnly = Boolean(payload.admin_only);
      if (adminOnly) {
        state.stockUpdates = [];
        state.lockedUpdateCount = Number(payload.locked_count || 0);
        renderMarketUpdatesList([], 0);
        if (marketPremiumStatus) marketPremiumStatus.textContent = "Admin updates are hidden for user accounts";
        if (marketUpgradeBtn) marketUpgradeBtn.style.display = "none";
        return;
      }
      state.authUser = {
        ...(state.authUser || {}),
        premium: premiumActive,
        plan: String(payload.plan || state.authUser?.plan || ""),
      };
      persistUserState();
      updateAuthUi();
      renderMarketUpdatesList(state.stockUpdates, state.lockedUpdateCount);
      if (marketUpgradeBtn) {
        marketUpgradeBtn.style.display = premiumActive ? "none" : "inline-flex";
      }
    } catch (error) {
      const message = String(error?.message || "Unable to load stock updates.");
      renderMarketUpdatesList([], 0);
      if (message.toLowerCase().includes("authentication required")) {
        if (marketPremiumStatus) marketPremiumStatus.textContent = "Login required";
      } else {
        showToast(message, "error");
      }
    }
  }

  function setPremiumFlows() {
    planActionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const planKey = resolvePlanForActionNode(button);
        if (planKey === "starter_monthly") {
          showToast("Starter keeps basic access. Upgrade to Pro for admin stock updates.");
          return;
        }
        await openPaymentModal(planKey);
      });
    });

    marketUpgradeBtn?.addEventListener("click", async () => {
      await openPaymentModal("pro_monthly");
    });

    marketRefreshUpdatesBtn?.addEventListener("click", () => {
      refreshStockUpdatesPanel();
    });

    paymentBackdrop?.addEventListener("click", closePaymentModal);
    paymentCloseBtn?.addEventListener("click", closePaymentModal);

    paymentForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!state.activeCheckout?.checkout_id) {
        showToast("Checkout session expired. Re-open payment.", "error");
        closePaymentModal();
        return;
      }
      if (paymentSubmitBtn) paymentSubmitBtn.disabled = true;
      try {
        const payload = await apiRequest("/payments/complete", {
          method: "POST",
          body: {
            checkout_id: String(state.activeCheckout.checkout_id),
            method: String(paymentMethod?.value || "card"),
            payer_name: String(paymentPayerName?.value || "").trim(),
          },
          credentials: true,
        });
        const user = payload.user || {};
        state.authUser = {
          ...(state.authUser || {}),
          name: String(user.name || state.authUser?.name || "Learner"),
          email: String(user.email || state.authUser?.email || ""),
          provider: String(user.provider || state.authUser?.provider || "email"),
          avatar: String(user.avatar || state.authUser?.avatar || ""),
          role: String(user.role || state.authUser?.role || "user"),
          premium: Boolean(user.premium),
          plan: String(user.plan || ""),
        };
        persistUserState();
        updateAuthUi();
        closePaymentModal();
        showToast("Payment successful. Premium access activated.");
        refreshStockUpdatesPanel();
      } catch (error) {
        if (paymentSubmitBtn) paymentSubmitBtn.disabled = false;
        showToast(String(error?.message || "Payment failed. Please retry."), "error");
      }
    });
  }

  function splitMarkdownTableRow(line) {
    let clean = String(line || "").trim();
    if (clean.startsWith("|")) clean = clean.slice(1);
    if (clean.endsWith("|")) clean = clean.slice(0, -1);
    return clean.split("|").map((cell) => cell.trim());
  }

  function isMarkdownTableDivider(line) {
    const cells = splitMarkdownTableRow(line);
    if (!cells.length) return false;
    return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
  }

  function isTableLikeLine(line) {
    const text = String(line || "");
    return text.includes("|") && splitMarkdownTableRow(text).length >= 2;
  }

  function renderBotMessageRich(container, text) {
    const lines = String(text || "").split(/\r?\n/);
    let i = 0;
    let paragraphBuffer = [];

    const flushParagraph = () => {
      if (!paragraphBuffer.length) return;
      const content = paragraphBuffer.join("\n").trim();
      paragraphBuffer = [];
      if (!content) return;
      const p = document.createElement("p");
      p.textContent = content;
      container.appendChild(p);
    };

    while (i < lines.length) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
      const tableStart = isTableLikeLine(line) && isMarkdownTableDivider(nextLine);

      if (!tableStart) {
        paragraphBuffer.push(line);
        i += 1;
        continue;
      }

      flushParagraph();
      const headers = splitMarkdownTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length) {
        const rowLine = lines[i];
        if (!isTableLikeLine(rowLine) || !rowLine.trim()) break;
        rows.push(splitMarkdownTableRow(rowLine));
        i += 1;
      }

      const tableWrap = document.createElement("div");
      tableWrap.className = "msg-table-wrap";
      const table = document.createElement("table");
      table.className = "msg-table";

      const thead = document.createElement("thead");
      const headTr = document.createElement("tr");
      headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headTr.appendChild(th);
      });
      thead.appendChild(headTr);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        headers.forEach((_, idx) => {
          const td = document.createElement("td");
          td.textContent = row[idx] ?? "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      container.appendChild(tableWrap);

      while (i < lines.length && !lines[i].trim()) i += 1;
    }

    flushParagraph();
    if (!container.childNodes.length) container.textContent = text;
  }

  function addAgentMessage(text, from = "bot") {
    if (!agentMessages) return;
    const message = document.createElement("div");
    message.className = `msg ${from}`;
    if (from === "bot" && String(text || "").includes("|")) {
      renderBotMessageRich(message, text);
    } else {
      message.textContent = text;
    }
    agentMessages.appendChild(message);
    agentMessages.scrollTop = agentMessages.scrollHeight;
  }

  async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} -> ${response.status}`);
    return response.json();
  }

  async function fetchAdmin(path, options = {}) {
    const key = String(state.adminKey || "").trim();

    const headers = {
      ...(key ? { "x-admin-key": key } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      body: options.body,
      headers,
      cache: "no-store",
      credentials: "include",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const reason = String(payload.detail || payload.error || `HTTP ${response.status}`);
      throw new Error(reason);
    }
    return payload;
  }

  function renderAdminEventLog(items) {
    if (!adminEventLog) return;
    const list = Array.isArray(items) ? items.slice().reverse() : [];
    if (!list.length) {
      adminEventLog.innerHTML = "<li>No admin events yet.</li>";
      return;
    }

    adminEventLog.innerHTML = "";
    list.slice(0, 80).forEach((item) => {
      const row = document.createElement("li");
      const ts = new Date(Number(item.timestamp) || Date.now()).toLocaleTimeString("en-IN", { hour12: false });
      const category = String(item.category || "SYSTEM");
      const message = String(item.message || "Event");
      row.innerHTML = `<b>${category}</b> ${message}<br /><time>${ts}</time>`;
      adminEventLog.appendChild(row);
    });
  }

  function renderAdminUsers(items) {
    if (!adminUsersBody) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      adminUsersBody.innerHTML = '<tr><td colspan="11">No users available yet.</td></tr>';
      return;
    }

    adminUsersBody.innerHTML = "";
    list.slice(0, 300).forEach((user) => {
      const tr = document.createElement("tr");
      const premium = Boolean(user.premium);
      const contactRole = String(user.contact_role || "--");
      const contactNote = String(user.contact_note || "--");
      const lastContactAt = Number(user.last_contact_at || 0);
      tr.innerHTML = `
        <td>${String(user.name || "Learner")}</td>
        <td>${String(user.email || "--")}</td>
        <td>${String(user.role || "user")}</td>
        <td>${String(user.provider || "email")}</td>
        <td>${premium ? "Yes" : "No"}</td>
        <td>${String(user.plan || "--")}</td>
        <td>${new Date(Number(user.last_login) || Date.now()).toLocaleString("en-IN")}</td>
        <td>${contactRole}</td>
        <td>${contactNote}</td>
        <td>${lastContactAt ? new Date(lastContactAt).toLocaleString("en-IN") : "--"}</td>
        <td><button class="btn btn-outline" type="button" data-admin-premium-email="${String(user.email || "")}" data-admin-premium-next="${premium ? "false" : "true"}">${premium ? "Revoke" : "Grant Pro"}</button></td>
      `;
      adminUsersBody.appendChild(tr);
    });
  }

  function renderAdminContacts(items) {
    if (!adminContactsBody) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      adminContactsBody.innerHTML = '<tr><td colspan="6">No contacts captured yet.</td></tr>';
      return;
    }

    adminContactsBody.innerHTML = "";
    list.slice(0, 400).forEach((contact) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(Number(contact.timestamp) || Date.now()).toLocaleString("en-IN")}</td>
        <td>${String(contact.type || "--")}</td>
        <td>${String(contact.name || "--")}</td>
        <td>${String(contact.email || "--")}</td>
        <td>${String(contact.role || "--")}</td>
        <td>${String(contact.note || "--")}</td>
      `;
      adminContactsBody.appendChild(tr);
    });
  }

  function renderAdminStockUpdates(items) {
    if (!adminStockUpdatesBody) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      adminStockUpdatesBody.innerHTML = '<tr><td colspan="6">No stock updates published yet.</td></tr>';
      return;
    }

    adminStockUpdatesBody.innerHTML = "";
    list.slice(0, 200).forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${String(item.symbol || "--")}</td>
        <td>${String(item.headline || "--")}</td>
        <td>${String(item.visibility || "--")}</td>
        <td>v${formatInt(item.version)}</td>
        <td>${new Date(Number(item.updated_at) || Date.now()).toLocaleString("en-IN")}</td>
        <td>${String(item.updated_by || "admin")}</td>
      `;
      adminStockUpdatesBody.appendChild(tr);
    });
  }

  function syncAdminSymbolOptions(symbols = []) {
    if (!adminSymbolSelect) return;
    const current = adminSymbolSelect.value;
    const validSymbols = Array.from(new Set((symbols || []).filter(Boolean).map((symbol) => String(symbol).toUpperCase())));
    if (!validSymbols.length) return;

    adminSymbolSelect.innerHTML = "";
    validSymbols.forEach((symbol) => {
      const option = document.createElement("option");
      option.value = symbol;
      option.textContent = symbol;
      adminSymbolSelect.appendChild(option);
    });

    if (current && validSymbols.includes(current)) {
      adminSymbolSelect.value = current;
    }
  }

  function renderAdminState(snapshot) {
    if (!snapshot) return;
    state.adminState = snapshot;
    const mode = String(snapshot.market_mode || "UNKNOWN").toUpperCase();
    const chaos = Number(snapshot.chaos_factor || 1);
    const haltedSymbols = Array.isArray(snapshot.halted_symbols) ? snapshot.halted_symbols : [];

    if (adminModeText) adminModeText.textContent = mode;
    if (adminChaosText) adminChaosText.textContent = `${formatNumber(chaos, 2)}x`;
    if (adminHaltCountText) adminHaltCountText.textContent = String(haltedSymbols.length);
    if (adminChaosRange) adminChaosRange.value = String(Math.max(0.1, Math.min(3, chaos)));
    if (adminChaosValue) adminChaosValue.textContent = `${formatNumber(chaos, 1)}x`;
    if (adminAccessStatus) adminAccessStatus.textContent = "Admin unlocked. Controls are live.";

    adminModeButtons.forEach((button) => {
      const buttonMode = String(button.getAttribute("data-admin-mode") || "").toUpperCase();
      button.classList.toggle("active-mode", buttonMode === mode);
    });

    syncAdminSymbolOptions(snapshot.symbols || state.latestStocks.map((item) => item.symbol));
    if (adminHaltToggleBtn && adminSymbolSelect) {
      const selected = adminSymbolSelect.value;
      const halted = haltedSymbols.includes(selected);
      adminHaltToggleBtn.textContent = halted ? "Resume Symbol" : "Halt Symbol";
    }
  }

  function setAdminControlsEnabled(enabled) {
    const disabled = !enabled;
    [
      ...adminModeButtons,
      adminChaosRange,
      adminChaosApplyBtn,
      adminSymbolSelect,
      adminHaltToggleBtn,
      adminResetBtn,
      adminUpdateSymbol,
      adminUpdateHeadline,
      adminUpdateVisibility,
      adminUpdateBody,
      adminPublishUpdateBtn,
    ]
      .filter(Boolean)
      .forEach((node) => {
        node.disabled = disabled;
      });
  }

  async function refreshAdminConsole(silent = false) {
    if (!state.adminReady) return;
    try {
      const [snapshot, events, users, contacts, updates] = await Promise.all([
        fetchAdmin("/admin/state"),
        fetchAdmin("/admin/events?limit=180"),
        fetchAdmin("/admin/users"),
        fetchAdmin("/admin/contacts?limit=500"),
        fetchAdmin("/admin/stock-updates"),
      ]);
      renderAdminState(snapshot);
      renderAdminEventLog(events.items || []);
      renderAdminUsers(users.items || []);
      renderAdminContacts(contacts.items || []);
      renderAdminStockUpdates(updates.items || []);
      setAdminControlsEnabled(true);
    } catch (error) {
      const detail = String(error?.message || "");
      const unauthorized = detail.toLowerCase().includes("unauthorized") || detail.toLowerCase().includes("authentication required");
      if (unauthorized) {
        state.adminReady = false;
        setAdminControlsEnabled(false);
        if (adminAccessStatus) {
          adminAccessStatus.textContent = isAdminUser()
            ? "Admin session is not active. Login again from /admin-login."
            : "Admin key rejected. Enter a valid key or use /admin-login.";
        }
      }
      if (!silent) showToast("Admin console sync failed. Check key/backend.", "error");
    }
  }

  function setAdminConsole() {
    if (!adminUnlockBtn) return;

    setAdminControlsEnabled(false);
    if (isAdminUser()) {
      state.adminReady = true;
      if (adminAccessStatus) adminAccessStatus.textContent = "Admin session detected. Syncing dashboard...";
      refreshAdminConsole(true);
    } else if (adminAccessStatus) {
      adminAccessStatus.textContent = "Locked. Login from /admin-login or enter admin key.";
    }

    const unlock = async () => {
      const key = String(adminKeyInput?.value || "").trim();
      if (!key) {
        showToast("Enter admin key to unlock controls.", "error");
        return;
      }
      state.adminKey = key;
      persistUserState();
      state.adminReady = true;
      if (adminAccessStatus) adminAccessStatus.textContent = "Authenticating admin key...";
      await refreshAdminConsole(false);
      if (state.adminReady) showToast("Admin console unlocked.");
    };

    adminUnlockBtn.addEventListener("click", unlock);
    adminKeyInput?.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        await unlock();
      }
    });

    adminModeButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        if (!state.adminReady) return;
        const mode = String(button.getAttribute("data-admin-mode") || "");
        try {
          const snapshot = await fetchAdmin("/admin/market-mode", {
            method: "POST",
            body: JSON.stringify({ mode }),
          });
          renderAdminState(snapshot);
          await refreshAdminConsole(true);
          showToast(`Market mode set to ${mode}.`);
        } catch {
          showToast("Unable to change market mode.", "error");
        }
      });
    });

    adminChaosRange?.addEventListener("input", () => {
      if (!adminChaosValue) return;
      adminChaosValue.textContent = `${formatNumber(Number(adminChaosRange.value || 1), 1)}x`;
    });

    adminChaosApplyBtn?.addEventListener("click", async () => {
      if (!state.adminReady || !adminChaosRange) return;
      try {
        const snapshot = await fetchAdmin("/admin/chaos", {
          method: "POST",
          body: JSON.stringify({ chaos_factor: Number(adminChaosRange.value || 1) }),
        });
        renderAdminState(snapshot);
        await refreshAdminConsole(true);
        showToast("Chaos factor updated.");
      } catch {
        showToast("Failed to update chaos factor.", "error");
      }
    });

    adminHaltToggleBtn?.addEventListener("click", async () => {
      if (!state.adminReady || !adminSymbolSelect) return;
      const symbol = String(adminSymbolSelect.value || "").trim();
      if (!symbol) return;
      const halted = (state.adminState?.halted_symbols || []).includes(symbol);
      try {
        const snapshot = await fetchAdmin(`/admin/halt/${encodeURIComponent(symbol)}`, {
          method: "POST",
          body: JSON.stringify({ halted: !halted }),
        });
        renderAdminState(snapshot);
        await refreshAdminConsole(true);
        showToast(!halted ? `${symbol} halted.` : `${symbol} resumed.`);
      } catch {
        showToast("Failed to toggle symbol halt.", "error");
      }
    });

    adminResetBtn?.addEventListener("click", async () => {
      if (!state.adminReady) return;
      try {
        const snapshot = await fetchAdmin("/admin/reset", { method: "POST" });
        renderAdminState(snapshot);
        await refreshAdminConsole(true);
        showToast("Runtime metrics reset.");
      } catch {
        showToast("Failed to reset runtime metrics.", "error");
      }
    });

    adminUsersBody?.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("[data-admin-premium-email]");
      if (!button || !state.adminReady) return;
      const email = String(button.getAttribute("data-admin-premium-email") || "").trim();
      const premiumNext = String(button.getAttribute("data-admin-premium-next") || "").toLowerCase() === "true";
      if (!email) return;
      try {
        await fetchAdmin(`/admin/users/${encodeURIComponent(email)}/premium`, {
          method: "POST",
          body: JSON.stringify({ premium: premiumNext, plan: "pro_monthly" }),
        });
        await refreshAdminConsole(true);
        showToast(premiumNext ? `Premium granted for ${email}.` : `Premium revoked for ${email}.`);
      } catch {
        showToast("Failed to update user premium status.", "error");
      }
    });

    adminPublishUpdateBtn?.addEventListener("click", async () => {
      if (!state.adminReady) return;
      const symbol = String(adminUpdateSymbol?.value || "").trim();
      const headline = String(adminUpdateHeadline?.value || "").trim();
      const visibility = String(adminUpdateVisibility?.value || "premium").trim().toLowerCase();
      const body = String(adminUpdateBody?.value || "").trim();
      if (!symbol || !headline || body.length < 8) {
        showToast("Enter symbol, headline, and detailed update body.", "error");
        return;
      }
      try {
        await fetchAdmin("/admin/stock-updates", {
          method: "POST",
          body: JSON.stringify({ symbol, headline, body, visibility }),
        });
        if (adminUpdateBody) adminUpdateBody.value = "";
        await refreshAdminConsole(true);
        showToast("Stock update published successfully.");
        refreshStockUpdatesPanel();
      } catch {
        showToast("Failed to publish stock update.", "error");
      }
    });

    if (!state.adminReady && state.adminKey) {
      state.adminReady = true;
      refreshAdminConsole(true);
    }
  }

  async function generateLocalAgentFallback(prompt) {
    const text = prompt.toLowerCase();

    if (text.includes("beginner") || text.includes("learn first") || text.includes("start")) {
      return "Start with Market Basics and Capital Protection, then move to Risk and Psychology. Build process first, speed later.";
    }

    if (text.includes("course") || text.includes("track")) {
      return "Recommended path: Foundation -> Earnings and Balance Sheet Mastery -> AI Research Automation. This sequence compounds skill depth.";
    }

    if (text.includes("api") || text.includes("latency") || text.includes("health")) {
      try {
        const status = await fetchJson("/status");
        const metrics = status.metrics || {};
        return `API ${String(metrics.api_health || "unknown").toUpperCase()}, mean latency ${formatNumber(metrics.mean_latency_ms, 1)} ms, p99 ${formatNumber(metrics.p99_latency_ms, 1)} ms.`;
      } catch {
        return "API health fetch failed right now. Please retry in a few seconds.";
      }
    }

    if (text.includes("top") || text.includes("stock") || text.includes("edge")) {
      try {
        const stocks = await fetchJson("/stocks");
        const items = (stocks.items || []).slice(0, 3);
        if (!items.length) return "Live feed is warming up. Top opportunities will appear shortly.";
        const summary = items.map((item) => `${item.symbol} (${formatNumber(item.edge_score, 1)})`).join(", ");
        return `Current top edge symbols: ${summary}. Use this as a shortlist, not a blind entry signal.`;
      } catch {
        return "I could not fetch top edge symbols right now. Backend may be in a transient chaos phase.";
      }
    }

    return "I can help with course pathing, live API health, top edge stocks, and structured research workflows. Ask me a focused question.";
  }

  async function fetchAgentResponse(prompt) {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const reason = String(payload.detail || payload.error || `HTTP ${response.status}`);
          throw new Error(reason);
        }

        const text = String(payload.response || "").trim();
        if (!text) throw new Error("empty_chat_response");
        return text;
      } catch (error) {
        lastError = error;
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 320));
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError || new Error("chat_request_failed");
  }

  function setAgent() {
    if (!agentForm || !agentInput) return;

    fetchJson("/chat/status")
      .then((status) => {
        if (!status?.key_present) {
          showToast("Groq key missing on backend. AI chat will not be live.", "error");
        }
      })
      .catch(() => {});

    const submitPrompt = async (prompt) => {
      const clean = prompt.trim();
      if (!clean) return;
      addAgentMessage(clean, "user");
      agentInput.value = "";
      agentStatus.textContent = "THINKING";
      try {
        const response = await fetchAgentResponse(clean);
        addAgentMessage(response, "bot");
      } catch (error) {
        const detail = String(error?.message || "");
        if (detail.includes("GROQ_API_KEY")) {
          showToast("AI key missing on backend. Set GROQ_API_KEY and restart server.", "error");
          addAgentMessage("Groq key is missing on backend. Please set GROQ_API_KEY and restart the backend.", "bot");
        } else if (detail.includes("Groq API error") || detail.includes("Chat engine failed")) {
          showToast("Groq request failed. Check key quota/network and backend logs.", "error");
          addAgentMessage(`Live Groq error: ${detail}`, "bot");
        } else {
          const fallback = await generateLocalAgentFallback(clean);
          addAgentMessage(fallback, "bot");
          showToast("AI backend unavailable. Local fallback used.", "error");
        }
      } finally {
        agentStatus.textContent = "LIVE";
      }
    };

    agentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await submitPrompt(agentInput.value);
    });

    promptPills.forEach((pill) => {
      pill.addEventListener("click", async () => {
        const prompt = pill.getAttribute("data-prompt") || "";
        await submitPrompt(prompt);
      });
    });
  }

  function setLiveHealthClass(health) {
    if (!apiHealthText) return;
    const value = String(health || "unknown").toLowerCase();
    let color = "#ffc66b";
    if (value === "green") color = "#7dffb0";
    if (value === "red") color = "#ff7e8e";
    apiHealthText.style.color = color;
  }

  function renderTicker(items) {
    if (!tickerTrack) return;
    if (!Array.isArray(items) || !items.length) {
      tickerTrack.innerHTML = "<span>Live stream unavailable. Retrying...</span>";
      return;
    }

    const top = items.slice(0, 16);
    const row = top
      .map((item) => {
        const edge = Number(item.edge_score || 0);
        const cls = edge >= 55 ? "up" : edge < 35 ? "down" : "";
        return `<span>${item.symbol} <strong class="${cls}">E ${formatNumber(edge, 1)}</strong> V ${formatInt(item.volume)}</span>`;
      })
      .join("");

    tickerTrack.innerHTML = `${row}${row}`;
  }

  function renderOpportunities(items) {
    if (!opportunityList) return;
    if (!Array.isArray(items) || !items.length) {
      opportunityList.innerHTML = "<p>No opportunities yet. Feed warming up.</p>";
      return;
    }

    opportunityList.innerHTML = "";
    items.slice(0, 6).forEach((item) => {
      const row = document.createElement("div");
      row.className = "opp-row";
      row.innerHTML = `<span><b>${item.symbol}</b> ${item.signal_type || "NEUTRAL"}</span><span>E ${formatNumber(item.edge_score, 1)}</span>`;
      opportunityList.appendChild(row);
    });
  }

  function renderStatus(metrics) {
    if (!metrics) return;
    if (apiHealthText) {
      apiHealthText.textContent = String(metrics.api_health || "unknown").toUpperCase();
    }
    setLiveHealthClass(metrics.api_health);

    if (meanLatencyText) meanLatencyText.textContent = `${formatNumber(metrics.mean_latency_ms, 1)} ms`;
    if (p99LatencyText) p99LatencyText.textContent = `${formatNumber(metrics.p99_latency_ms, 1)} ms`;
    if (ticksPerSecText) ticksPerSecText.textContent = formatNumber(metrics.ticks_per_sec, 1);
    if (dropPacketsText) dropPacketsText.textContent = formatInt(metrics.dropped_packets);
    if (falseSignalText) falseSignalText.textContent = `${formatNumber((Number(metrics.false_signal_rate) || 0) * 100, 1)}%`;
    if (adaptiveRoundText) adaptiveRoundText.textContent = formatInt(metrics.adaptive_round);
    if (clientsText) clientsText.textContent = formatInt(metrics.stream_clients);
  }

  function setCurrentPageNav() {
    if (!navAnchors.length) return;
    const currentPath = location.pathname.toLowerCase();
    navAnchors.forEach((link) => {
      const href = String(link.getAttribute("href") || "").trim().toLowerCase();
      if (!href || href.startsWith("#")) return;
      const normalizedHref = href.replace(/\/+$/, "");
      const normalizedCurrent = currentPath.replace(/\/+$/, "");
      const isRootHome = (normalizedCurrent === "" || normalizedCurrent === "/") && (normalizedHref === "" || normalizedHref === "/");
      const active =
        isRootHome ||
        normalizedCurrent === normalizedHref ||
        normalizedCurrent.endsWith(normalizedHref);
      link.classList.toggle("active", active);
    });
  }

  function normalizeSymbol(input) {
    return String(input || "")
      .toUpperCase()
      .replace(/[^A-Z0-9&-]/g, "")
      .trim();
  }

  function formatAlertTime(timestamp) {
    return new Date(Number(timestamp) || Date.now()).toLocaleTimeString("en-IN", { hour12: false });
  }

  function pushAlert(key, message, level = "info") {
    const now = Date.now();
    const dedupWindowMs = 25000;
    const prev = Number(state.alertDedup[key] || 0);
    if (now - prev < dedupWindowMs) return;

    state.alertDedup[key] = now;
    state.alerts.unshift({
      key,
      message: String(message),
      level,
      timestamp: now,
    });
    state.alerts = state.alerts.slice(0, 120);
    renderAlerts();

    if (level === "high") showToast(message);
    if (level === "danger") showToast(message, "error");
  }

  function renderAlerts() {
    if (!alertsList) return;
    if (!state.alerts.length) {
      alertsList.innerHTML = "<li>No alerts yet.</li>";
      return;
    }

    alertsList.innerHTML = "";
    state.alerts.slice(0, 80).forEach((alert) => {
      const row = document.createElement("li");
      row.innerHTML = `<strong>${alert.message}</strong><br /><time>${formatAlertTime(alert.timestamp)}</time>`;
      alertsList.appendChild(row);
    });
  }

  function renderWatchlist() {
    if (!watchlistList) return;
    const symbols = state.watchlist || [];
    if (!symbols.length) {
      watchlistList.innerHTML = '<p class="watchlist-empty">No symbols in watchlist yet.</p>';
      return;
    }

    watchlistList.innerHTML = "";
    symbols.forEach((symbol) => {
      const latest = state.latestStocks.find((item) => String(item.symbol).toUpperCase() === symbol);
      const row = document.createElement("div");
      row.className = "watchlist-item";
      row.innerHTML = `
        <div class="watchlist-item-top">
          <strong>${symbol}</strong>
          <button class="btn btn-ghost" type="button" data-watch-remove="${symbol}">Remove</button>
        </div>
        <div class="watchlist-item-meta">
          <span>Price: ${latest ? formatNumber(latest.price, 2) : "--"}</span>
          <span>Edge: ${latest ? formatNumber(latest.edge_score, 1) : "--"}</span>
          <span>Signal: ${latest ? String(latest.signal_type || "NEUTRAL") : "--"}</span>
        </div>
      `;
      watchlistList.appendChild(row);
    });
  }

  function addWatchlistSymbol(symbolInput) {
    const symbol = normalizeSymbol(symbolInput);
    if (!symbol) return;
    if (state.watchlist.includes(symbol)) {
      showToast(`${symbol} is already in watchlist.`);
      return;
    }

    const available = new Set(state.latestStocks.map((item) => String(item.symbol).toUpperCase()));
    if (available.size && !available.has(symbol)) {
      showToast(`Symbol ${symbol} is not in current feed universe.`, "error");
      return;
    }

    state.watchlist.unshift(symbol);
    state.watchlist = Array.from(new Set(state.watchlist)).slice(0, 40);
    persistUserState();
    renderWatchlist();
    pushAlert(`watchlist-add-${symbol}`, `${symbol} added to watchlist.`, "info");
  }

  function removeWatchlistSymbol(symbolInput) {
    const symbol = normalizeSymbol(symbolInput);
    const before = state.watchlist.length;
    state.watchlist = state.watchlist.filter((item) => item !== symbol);
    if (state.watchlist.length === before) return;
    persistUserState();
    renderWatchlist();
    pushAlert(`watchlist-remove-${symbol}`, `${symbol} removed from watchlist.`, "info");
  }

  function filteredScreenerItems() {
    const minEdge = Number(state.screener.minEdge || 0);
    const minVolume = Number(state.screener.minVolume || 0);
    const signal = String(state.screener.signal || "ALL").toUpperCase();

    return state.latestStocks
      .filter((item) => Number(item.edge_score || 0) >= minEdge)
      .filter((item) => Number(item.volume || 0) >= minVolume)
      .filter((item) => signal === "ALL" || String(item.signal_type || "").toUpperCase() === signal)
      .sort((a, b) => Number(b.edge_score || 0) - Number(a.edge_score || 0));
  }

  function renderScreener() {
    if (!screenerTableBody) return;
    const rows = filteredScreenerItems().slice(0, 50);
    if (screenerCountText) screenerCountText.textContent = `${rows.length} symbols match current filters.`;

    if (!rows.length) {
      screenerTableBody.innerHTML = '<tr><td colspan="6">No symbols match current filters.</td></tr>';
      return;
    }

    screenerTableBody.innerHTML = "";
    rows.forEach((item) => {
      const tr = document.createElement("tr");
      const edge = Number(item.edge_score || 0);
      const edgeClass = edge >= 60 ? "edge-up" : edge <= 35 ? "edge-down" : "";
      const symbol = String(item.symbol || "");
      const inWatchlist = state.watchlist.includes(symbol.toUpperCase());
      tr.innerHTML = `
        <td>${symbol}</td>
        <td>${formatNumber(item.price, 2)}</td>
        <td class="${edgeClass}">${formatNumber(edge, 1)}</td>
        <td>${formatIndianInt(item.volume)}</td>
        <td>${String(item.signal_type || "NEUTRAL")}</td>
        <td><button class="btn btn-outline" type="button" data-watch-add="${symbol}" ${inWatchlist ? "disabled" : ""}>${inWatchlist ? "Added" : "Watch"}</button></td>
      `;
      screenerTableBody.appendChild(tr);
    });
  }

  function setLiveFreshnessText() {
    if (!liveFreshnessText) return;
    if (!state.lastFeedAt) {
      liveFreshnessText.textContent = "Waiting for feed...";
      return;
    }
    const ageSec = Math.max(0, Math.floor((Date.now() - state.lastFeedAt) / 1000));
    if (ageSec < 8) {
      liveFreshnessText.textContent = `Fresh (${ageSec}s)`;
      liveFreshnessText.style.color = "#8effc5";
      return;
    }
    if (ageSec < 18) {
      liveFreshnessText.textContent = `Delayed (${ageSec}s)`;
      liveFreshnessText.style.color = "#ffc66b";
      return;
    }
    liveFreshnessText.textContent = `Stale (${ageSec}s)`;
    liveFreshnessText.style.color = "#ff9dae";
  }

  function evaluateMarketAlerts(items, metrics) {
    const prevBySymbol = state.lastSymbolSnapshot || {};
    const currentBySymbol = {};
    const watchlistSet = new Set(state.watchlist);

    items.forEach((item) => {
      const symbol = String(item.symbol || "").toUpperCase();
      if (!symbol) return;
      const edge = Number(item.edge_score || 0);
      const signal = String(item.signal_type || "NEUTRAL").toUpperCase();
      currentBySymbol[symbol] = { edge, signal, volume: Number(item.volume || 0) };

      const prev = prevBySymbol[symbol];
      if (prev && prev.edge <= 70 && edge > 70) {
        pushAlert(`edge-cross-${symbol}`, `${symbol} crossed high-edge zone (${formatNumber(edge, 1)}).`, "high");
      }
      if (prev && prev.signal !== "FAKE_BREAKOUT" && signal === "FAKE_BREAKOUT") {
        pushAlert(`fake-breakout-${symbol}`, `${symbol} shows fake-breakout risk.`, "danger");
      }
      if (watchlistSet.has(symbol) && prev && Math.abs(edge - prev.edge) >= 12) {
        pushAlert(`watch-drift-${symbol}`, `${symbol} edge shifted sharply (${formatNumber(prev.edge, 1)} -> ${formatNumber(edge, 1)}).`, "high");
      }
    });

    const apiHealth = String(metrics?.api_health || "unknown").toLowerCase();
    if (state.previousApiHealth !== "red" && apiHealth === "red") {
      pushAlert("api-red", "API health turned RED. Expect feed instability.", "danger");
    }
    state.previousApiHealth = apiHealth;
    state.lastSymbolSnapshot = currentBySymbol;
  }

  function setProTools() {
    if (screenerEdgeRange) {
      screenerEdgeRange.value = String(state.screener.minEdge);
      screenerEdgeValue.textContent = String(state.screener.minEdge);
      screenerEdgeRange.addEventListener("input", () => {
        state.screener.minEdge = Number(screenerEdgeRange.value || 0);
        screenerEdgeValue.textContent = String(state.screener.minEdge);
        renderScreener();
      });
    }

    screenerVolumeSelect?.addEventListener("change", () => {
      state.screener.minVolume = Number(screenerVolumeSelect.value || 0);
      renderScreener();
    });

    screenerSignalSelect?.addEventListener("change", () => {
      state.screener.signal = String(screenerSignalSelect.value || "ALL").toUpperCase();
      renderScreener();
    });

    watchlistAddBtn?.addEventListener("click", () => {
      addWatchlistSymbol(watchlistSymbolInput?.value || "");
      if (watchlistSymbolInput) watchlistSymbolInput.value = "";
    });

    watchlistSymbolInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addWatchlistSymbol(watchlistSymbolInput.value);
        watchlistSymbolInput.value = "";
      }
    });

    screenerTableBody?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("[data-watch-add]");
      if (!button) return;
      const symbol = button.getAttribute("data-watch-add") || "";
      addWatchlistSymbol(symbol);
      renderScreener();
    });

    watchlistList?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("[data-watch-remove]");
      if (!button) return;
      const symbol = button.getAttribute("data-watch-remove") || "";
      removeWatchlistSymbol(symbol);
      renderScreener();
    });

    alertsClearBtn?.addEventListener("click", () => {
      state.alerts = [];
      state.alertDedup = {};
      renderAlerts();
      showToast("Alerts cleared.");
    });

    renderScreener();
    renderWatchlist();
    renderAlerts();
    setLiveFreshnessText();
  }

  async function refreshLiveData() {
    try {
      const [stocks, status] = await Promise.all([fetchJson("/stocks"), fetchJson("/status")]);
      const items = stocks.items || [];
      state.latestStocks = items;
      state.lastFeedAt = Date.now();
      syncAdminSymbolOptions(items.map((item) => item.symbol));
      renderTicker(items);
      renderOpportunities(items);
      buildDealsData(items);
      renderDealsTable();
      renderStatus(status.metrics || {});
      evaluateMarketAlerts(items, status.metrics || {});
      renderScreener();
      renderWatchlist();
      setLiveFreshnessText();
      refreshStockUpdatesPanel();
      if (state.adminReady) refreshAdminConsole(true);
      state.liveErrorLogged = false;
    } catch {
      setLiveFreshnessText();
      if (state.latestStocks.length) {
        renderTicker(state.latestStocks);
        renderOpportunities(state.latestStocks);
        buildDealsData(state.latestStocks);
        renderDealsTable();
        renderScreener();
        renderWatchlist();
      } else {
        renderTicker([]);
        renderDealsUnavailable("Live API unavailable. Run backend on http://127.0.0.1:8000 and refresh.");
      }
      if (!state.liveErrorLogged) {
        showToast("Live data endpoint is temporarily unstable. Auto-retrying...", "error");
        state.liveErrorLogged = true;
      }
    }
  }

  function startLivePolling() {
    refreshLiveData();
    state.livePollTimer = setInterval(refreshLiveData, 5000);
    if (state.freshnessTimer) clearInterval(state.freshnessTimer);
    state.freshnessTimer = setInterval(setLiveFreshnessText, 1000);
    if (state.adminPollTimer) clearInterval(state.adminPollTimer);
    state.adminPollTimer = setInterval(() => refreshAdminConsole(true), 7000);
  }

  function openPromoModal() {
    if (!promoModal) return;
    promoModal.classList.add("is-open");
    promoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePromoModal() {
    if (!promoModal) return;
    promoModal.classList.remove("is-open");
    promoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    localStorage.setItem("promo_modal_closed", new Date().toISOString());
  }

  function setPromoHandlers() {
    if (!promoModal) return;

    promoCloseBtn?.addEventListener("click", closePromoModal);
    promoBackdrop?.addEventListener("click", closePromoModal);

    promoActionBtn?.addEventListener("click", () => {
      openAuthModal(null);
      closePromoModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && promoModal.classList.contains("is-open")) {
        closePromoModal();
      }
    });

    // Show promo after 2 seconds (reduced from 3 for testing), but only if not closed recently
    const lastClosed = localStorage.getItem("promo_modal_closed");
    const now = new Date();
    const shouldShow =
      !lastClosed ||
      new Date(lastClosed).getTime() < now.getTime() - 24 * 60 * 60 * 1000;

    if (shouldShow) {
      setTimeout(openPromoModal, 1500);
    }

    // Manual trigger for testing: type 'showpromo' to display modal
    window.showpromo = openPromoModal;
  }

  async function init() {
    loadUserState();
    await syncAuthSession();
    consumeAuthErrorFlag();
    updateAuthUi();
    setHeaderEffects();
    setCursorGlow();
    setNavbar();
    setCurrentPageNav();
    setActiveSectionLinks();
    setRevealObserver();
    setCounterObserver();
    setTiltCards();
    setModalHandlers();
    setPromoHandlers();
    setNewsletter();
    setCourseFilters();
    setFaq();
    setTestimonials();
    setPricingToggle();
    setPremiumFlows();
    setAgent();
    setProTools();
    setAdminConsole();
    setDealsTabs();
    setAuthHandlers();
    setEnrollHandlers();
    setLearningControls();
    updateEnrollButtons();
    renderDealsTable();
    consumePendingOAuthEnrollment();
    refreshStockUpdatesPanel();
    const needsLiveData = Boolean(
      tickerTrack ||
        opportunityList ||
        apiHealthText ||
        dealsTableBody ||
        screenerTableBody ||
        watchlistList ||
        adminUnlockBtn
    );
    if (needsLiveData) startLivePolling();

    if (state.enrolledCourses.length && lessonList) {
      openLearningStudio(state.enrolledCourses[0], false);
    }
  }

  window.addEventListener("load", () => {
    init().catch(() => {
      showToast("Initialization warning: some modules did not load correctly.", "error");
    });
  });
})();
