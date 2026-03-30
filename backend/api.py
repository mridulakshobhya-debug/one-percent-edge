from __future__ import annotations

import asyncio
import copy
import hashlib
import json
import os
import random
import secrets
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.middleware.sessions import SessionMiddleware

from backend.engine import MarketEngine


app = FastAPI(title="ONE PERCENT EDGE - QUANT OPERATING SYSTEM")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("AUTH_SESSION_SECRET", "ope-auth-dev-secret-change-me"),
    same_site="lax",
    https_only=False,
    max_age=60 * 60 * 24 * 30,
)
engine = MarketEngine(tick_interval_ms=100)
chaos_random = random.Random()

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
DOTENV_FILE = ROOT_DIR / ".env"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
OAUTH_SUPPORTED = ("google", "github", "facebook")
PREMIUM_PLANS = {
    "pro_monthly": {"label": "Pro Monthly", "amount_inr": 79, "premium": True},
    "pro_yearly": {"label": "Pro Yearly", "amount_inr": 756, "premium": True},
    "institutional_monthly": {"label": "Institutional Monthly", "amount_inr": 199, "premium": True},
    "starter_monthly": {"label": "Starter Monthly", "amount_inr": 30, "premium": False},
}
USERS_DB: Dict[str, Dict[str, Any]] = {}
CONTACTS_DB: List[Dict[str, Any]] = []
STOCK_UPDATES_DB: Dict[str, Dict[str, Any]] = {}
PAYMENTS_DB: Dict[str, Dict[str, Any]] = {}
DB_LOCK = asyncio.Lock()


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1200)


class AdminModeRequest(BaseModel):
    mode: str = Field(min_length=3, max_length=24)


class AdminChaosRequest(BaseModel):
    chaos_factor: float = Field(ge=0.1, le=3.0)


class AdminHaltRequest(BaseModel):
    halted: bool = True


class EmailSignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=180)
    password: str = Field(min_length=6, max_length=128)


class EmailLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=180)
    password: str = Field(min_length=6, max_length=128)


class LeadCaptureRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=180)
    role: str = Field(min_length=2, max_length=120)
    note: str = Field(default="", max_length=1200)


class NewsletterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=180)


class AdminStockUpdateRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=32)
    headline: str = Field(min_length=4, max_length=180)
    body: str = Field(min_length=8, max_length=3000)
    visibility: str = Field(default="premium", min_length=6, max_length=12)


class AdminSetPremiumRequest(BaseModel):
    premium: bool = True
    plan: str = Field(default="pro_monthly", min_length=3, max_length=48)


class PaymentCreateRequest(BaseModel):
    plan: str = Field(default="pro_monthly", min_length=3, max_length=48)


class PaymentCompleteRequest(BaseModel):
    checkout_id: str = Field(min_length=12, max_length=120)
    method: str = Field(default="card", min_length=3, max_length=24)
    payer_name: str = Field(default="", max_length=120)


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        clean_key = key.strip()
        clean_value = value.strip().strip('"').strip("'")
        if clean_key and clean_value and not os.getenv(clean_key):
            os.environ[clean_key] = clean_value


_load_dotenv(DOTENV_FILE)


def _read_env(name: str, fallback: str = "") -> str:
    value = os.getenv(name, fallback)
    return value.strip() if isinstance(value, str) else fallback


def _env_flag(name: str, default: bool = False) -> bool:
    raw = _read_env(name)
    if not raw:
        return default
    return raw.lower() in {"1", "true", "yes", "on"}


def _now_ms() -> int:
    return int(time.time() * 1000)


def _normalize_email(raw: str) -> str:
    return str(raw or "").strip().lower()


def _normalize_symbol(raw: str) -> str:
    return "".join(ch for ch in str(raw or "").upper().strip() if ch.isalnum() or ch in {"&", "-"})


def _hash_password(password: str) -> str:
    salt = _read_env("AUTH_PASSWORD_SALT", "ope-local-salt")
    plain = f"{salt}::{password}".encode("utf-8")
    return hashlib.sha256(plain).hexdigest()


def _safe_plan(raw_plan: str) -> str:
    plan = str(raw_plan or "").strip().lower()
    return plan if plan in PREMIUM_PLANS else "pro_monthly"


def _session_user_from_record(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": str(record.get("name") or "Learner"),
        "email": str(record.get("email") or ""),
        "provider": str(record.get("provider") or "email"),
        "avatar": str(record.get("avatar") or ""),
        "premium": bool(record.get("premium")),
        "plan": str(record.get("plan") or ""),
        "updated_at": int(record.get("updated_at") or _now_ms()),
    }


def _public_user_record(record: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": str(record.get("name") or "Learner"),
        "email": str(record.get("email") or ""),
        "provider": str(record.get("provider") or "email"),
        "premium": bool(record.get("premium")),
        "plan": str(record.get("plan") or ""),
        "created_at": int(record.get("created_at") or _now_ms()),
        "last_login": int(record.get("last_login") or 0),
        "updated_at": int(record.get("updated_at") or _now_ms()),
        "contact_count": int(record.get("contact_count") or 0),
    }


async def _upsert_user(
    *,
    email: str,
    name: str,
    provider: str,
    avatar: str = "",
    password_hash: str = "",
) -> Dict[str, Any]:
    email_clean = _normalize_email(email)
    if not email_clean:
        raise HTTPException(status_code=400, detail="Invalid email")
    now = _now_ms()
    async with DB_LOCK:
        record = USERS_DB.get(email_clean)
        if not record:
            record = {
                "email": email_clean,
                "name": str(name or "Learner").strip() or "Learner",
                "provider": str(provider or "email"),
                "avatar": str(avatar or ""),
                "password_hash": str(password_hash or ""),
                "premium": False,
                "plan": "",
                "created_at": now,
                "last_login": now,
                "updated_at": now,
                "contact_count": 0,
            }
            USERS_DB[email_clean] = record
        else:
            if name:
                record["name"] = str(name).strip() or record.get("name") or "Learner"
            if avatar:
                record["avatar"] = str(avatar)
            if provider:
                record["provider"] = str(provider)
            if password_hash:
                record["password_hash"] = str(password_hash)
            record["last_login"] = now
            record["updated_at"] = now
        return dict(record)


async def _set_user_premium(email: str, premium: bool, plan: str) -> Dict[str, Any]:
    email_clean = _normalize_email(email)
    if not email_clean:
        raise HTTPException(status_code=400, detail="Invalid email")
    now = _now_ms()
    plan_safe = _safe_plan(plan)
    async with DB_LOCK:
        record = USERS_DB.get(email_clean)
        if not record:
            raise HTTPException(status_code=404, detail="User not found")
        record["premium"] = bool(premium)
        record["plan"] = plan_safe if premium else ""
        record["updated_at"] = now
        USERS_DB[email_clean] = record
        return dict(record)


async def _require_session_user(request: Request) -> Dict[str, Any]:
    session_user = request.session.get("auth_user") or {}
    email = _normalize_email(session_user.get("email") or "")
    if not email:
        raise HTTPException(status_code=401, detail="Authentication required")
    async with DB_LOCK:
        record = USERS_DB.get(email)
        if not record:
            record = {
                "email": email,
                "name": str(session_user.get("name") or "Learner"),
                "provider": str(session_user.get("provider") or "email"),
                "avatar": str(session_user.get("avatar") or ""),
                "password_hash": "",
                "premium": bool(session_user.get("premium")),
                "plan": str(session_user.get("plan") or ""),
                "created_at": _now_ms(),
                "last_login": _now_ms(),
                "updated_at": _now_ms(),
                "contact_count": 0,
            }
            USERS_DB[email] = record
        else:
            record["last_login"] = _now_ms()
            record["updated_at"] = _now_ms()
        synced = _session_user_from_record(record)
    request.session["auth_user"] = synced
    return synced


async def _capture_contact(entry: Dict[str, Any]) -> Dict[str, Any]:
    now = _now_ms()
    contact = {"id": secrets.token_urlsafe(8), "timestamp": now, **entry}
    email = _normalize_email(contact.get("email") or "")
    async with DB_LOCK:
        CONTACTS_DB.append(contact)
        if email and email in USERS_DB:
            USERS_DB[email]["contact_count"] = int(USERS_DB[email].get("contact_count") or 0) + 1
            USERS_DB[email]["updated_at"] = now
    return contact


def _require_admin(request: Request) -> None:
    expected = _read_env("ADMIN_PANEL_KEY", "ope-admin")
    provided = str(request.headers.get("x-admin-key", "")).strip()
    if not expected:
        raise HTTPException(status_code=503, detail="ADMIN_PANEL_KEY not configured")
    if provided != expected:
        raise HTTPException(status_code=401, detail="Unauthorized admin key")


def _safe_next_path(raw: Optional[str]) -> str:
    value = str(raw or "/").strip()
    if not value.startswith("/") or value.startswith("//"):
        return "/"
    if value.startswith("/auth/"):
        return "/"
    return value


def _provider_credentials(provider: str) -> tuple[str, str]:
    key = provider.upper().strip()
    client_id = _read_env(f"{key}_CLIENT_ID")
    client_secret = _read_env(f"{key}_CLIENT_SECRET")
    return client_id, client_secret


def _provider_enabled(provider: str) -> bool:
    client_id, client_secret = _provider_credentials(provider)
    return bool(client_id and client_secret)


def _oauth_dev_bypass_enabled() -> bool:
    return _env_flag("OAUTH_DEV_BYPASS", default=True)


def _oauth_dev_user(provider: str) -> Dict[str, Any]:
    provider_clean = str(provider).lower().strip()
    pretty = provider_clean.capitalize()
    millis = int(time.time() * 1000)
    return {
        "provider": provider_clean,
        "id": f"dev-{provider_clean}-{millis}",
        "name": f"{pretty} Demo User",
        "email": f"demo.{provider_clean}@onepercentedge.local",
        "avatar": "",
    }


def _oauth_http_json(
    *,
    method: str,
    url: str,
    headers: Optional[Dict[str, str]] = None,
    form: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    merged_headers = {
        "Accept": "application/json",
        "User-Agent": "one-percent-edge/1.0",
    }
    if headers:
        merged_headers.update(headers)

    body_bytes: Optional[bytes] = None
    if form is not None:
        merged_headers["Content-Type"] = "application/x-www-form-urlencoded"
        body_bytes = urlencode(form).encode("utf-8")

    request = urllib.request.Request(url, data=body_bytes, headers=merged_headers, method=method.upper())
    with urllib.request.urlopen(request, timeout=20) as response:
        raw = response.read().decode("utf-8")
        if not raw:
            return {}
        return json.loads(raw)


def _oauth_authorize_url(provider: str, client_id: str, redirect_uri: str, state: str) -> str:
    if provider == "google":
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    if provider == "github":
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email",
            "state": state,
        }
        return f"https://github.com/login/oauth/authorize?{urlencode(params)}"

    if provider == "facebook":
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "public_profile,email",
            "state": state,
        }
        return f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"

    raise ValueError(f"Unsupported provider: {provider}")


def _oauth_exchange_code(
    provider: str,
    code: str,
    redirect_uri: str,
    client_id: str,
    client_secret: str,
) -> Dict[str, Any]:
    if provider == "google":
        return _oauth_http_json(
            method="POST",
            url="https://oauth2.googleapis.com/token",
            form={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    if provider == "github":
        return _oauth_http_json(
            method="POST",
            url="https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            form={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )

    if provider == "facebook":
        params = urlencode(
            {
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            }
        )
        return _oauth_http_json(
            method="GET",
            url=f"https://graph.facebook.com/v19.0/oauth/access_token?{params}",
        )

    raise ValueError(f"Unsupported provider: {provider}")


def _oauth_fetch_profile(provider: str, access_token: str) -> Dict[str, Any]:
    if provider == "google":
        info = _oauth_http_json(
            method="GET",
            url="https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        email = str(info.get("email") or f"{info.get('sub', 'google-user')}@google.local")
        return {
            "provider": "google",
            "id": str(info.get("sub") or ""),
            "name": str(info.get("name") or "Google User"),
            "email": email,
            "avatar": str(info.get("picture") or ""),
        }

    if provider == "github":
        info = _oauth_http_json(
            method="GET",
            url="https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        email = str(info.get("email") or "")
        if not email:
            try:
                emails = _oauth_http_json(
                    method="GET",
                    url="https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if isinstance(emails, list):
                    primary = next((item for item in emails if item.get("primary")), None) or (emails[0] if emails else None)
                    email = str((primary or {}).get("email") or "")
            except Exception:
                email = ""
        if not email:
            login = str(info.get("login") or "github-user")
            email = f"{login}@users.noreply.github.com"
        return {
            "provider": "github",
            "id": str(info.get("id") or ""),
            "name": str(info.get("name") or info.get("login") or "GitHub User"),
            "email": email,
            "avatar": str(info.get("avatar_url") or ""),
        }

    if provider == "facebook":
        fields = urlencode({"fields": "id,name,email,picture.type(large)", "access_token": access_token})
        info = _oauth_http_json(
            method="GET",
            url=f"https://graph.facebook.com/me?{fields}",
        )
        fb_id = str(info.get("id") or "")
        email = str(info.get("email") or f"{fb_id or 'facebook-user'}@facebook.local")
        picture = ""
        pic_data = info.get("picture", {}).get("data", {})
        if isinstance(pic_data, dict):
            picture = str(pic_data.get("url") or "")
        return {
            "provider": "facebook",
            "id": fb_id,
            "name": str(info.get("name") or "Facebook User"),
            "email": email,
            "avatar": picture,
        }

    raise ValueError(f"Unsupported provider: {provider}")


def _call_groq_chat(
    *,
    api_key: str,
    model: str,
    prompt: str,
    market_snapshot: Dict[str, Any],
) -> str:
    top = list((market_snapshot.get("items") or [])[:8])
    top_rows = []
    for item in top:
        top_rows.append(
            {
                "symbol": item.get("symbol"),
                "edge_score": item.get("edge_score"),
                "signal_type": item.get("signal_type"),
                "price": item.get("price"),
                "volume": item.get("volume"),
            }
        )

    system_prompt = (
        "You are OPE Agent, an institutional-grade trading intelligence copilot. "
        "Be concise, practical, risk-aware, and educational. "
        "Never promise returns. Use the live market context when useful. "
        "Formatting rule: when giving comparisons, rankings, screeners, watchlists, "
        "multi-step plans, or any response with 3+ data points, return a markdown table. "
        "For short direct answers, use plain text."
    )

    user_prompt = (
        f"User question:\n{prompt}\n\n"
        f"Live market top symbols snapshot:\n{json.dumps(top_rows, ensure_ascii=True)}\n\n"
        "Answer with concrete guidance in plain English."
    )

    body = {
        "model": model,
        "temperature": 0.25,
        "max_tokens": 420,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    request = urllib.request.Request(
        GROQ_ENDPOINT,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "one-percent-edge/1.0",
        },
        method="POST",
    )

    timeout_s = float(_read_env("GROQ_TIMEOUT_S", "16"))
    with urllib.request.urlopen(request, timeout=timeout_s) as response:
        payload = json.loads(response.read().decode("utf-8"))
        choice = (payload.get("choices") or [{}])[0]
        message = choice.get("message") or {}
        text = str(message.get("content") or "").strip()
        if not text:
            raise RuntimeError("empty_llm_response")
        return text


@app.on_event("startup")
async def on_startup() -> None:
    await engine.start()
    if STOCK_UPDATES_DB:
        return
    snapshot = await engine.get_stocks_snapshot()
    picks = [str(item.get("symbol") or "").upper() for item in (snapshot.get("items") or [])[:4] if item.get("symbol")]
    seed_symbols = picks or ["RELIANCE", "TCS", "INFY", "HDFCBANK"]
    now = _now_ms()
    async with DB_LOCK:
        if STOCK_UPDATES_DB:
            return
        for idx, symbol in enumerate(seed_symbols):
            update_id = secrets.token_urlsafe(10)
            STOCK_UPDATES_DB[update_id] = {
                "id": update_id,
                "symbol": symbol,
                "headline": f"{symbol} flow update: institutional activity window",
                "body": (
                    f"Updated desk view for {symbol}. Monitor order-imbalance transitions, liquidity refill zones, "
                    "and volume acceptance around intraday pivots before adding size."
                ),
                "visibility": "public" if idx == 0 else "premium",
                "updated_by": "system",
                "created_at": now,
                "updated_at": now,
                "version": 1,
            }


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await engine.stop()


@app.middleware("http")
async def chaos_http_middleware(request: Request, call_next):
    passthrough_paths = {"/", "/favicon.ico", "/courses", "/ai-agent", "/market", "/pricing", "/admin"}
    is_static = request.url.path.startswith("/frontend")
    is_admin = request.url.path.startswith("/admin")
    is_chat = request.url.path == "/chat" or request.url.path.startswith("/chat/")
    is_auth = request.url.path.startswith("/auth")
    is_payment = request.url.path.startswith("/payments")
    is_crm = request.url.path.startswith("/crm")
    is_user_updates = request.url.path.startswith("/stock-updates")
    chaos_factor = max(0.15, float(getattr(engine, "chaos_factor", 1.0)))
    if (
        not is_static
        and not is_admin
        and not is_chat
        and not is_auth
        and not is_payment
        and not is_crm
        and not is_user_updates
        and request.url.path not in passthrough_paths
    ):
        await asyncio.sleep(chaos_random.uniform(0.004 * chaos_factor, 0.16 * chaos_factor))
        if chaos_random.random() < min(0.4, 0.035 * chaos_factor):
            await engine.record_api_failure()
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Injected API failure",
                    "path": request.url.path,
                    "code": "CHAOS_GATEWAY_DROP",
                },
            )

    try:
        response = await call_next(request)
        return response
    except Exception:
        await engine.record_api_failure()
        raise


@app.get("/")
async def index() -> FileResponse:
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend not found")
    return FileResponse(index_path)


def _serve_frontend_page(filename: str) -> FileResponse:
    page_path = FRONTEND_DIR / filename
    if not page_path.exists():
        raise HTTPException(status_code=404, detail=f"Page not found: {filename}")
    return FileResponse(page_path)


@app.get("/courses")
async def courses_page() -> FileResponse:
    return _serve_frontend_page("courses.html")


@app.get("/ai-agent")
async def ai_agent_page() -> FileResponse:
    return _serve_frontend_page("ai-agent.html")


@app.get("/market")
async def market_page() -> FileResponse:
    return _serve_frontend_page("market.html")


@app.get("/pricing")
async def pricing_page() -> FileResponse:
    return _serve_frontend_page("pricing.html")


@app.get("/admin")
async def admin_page() -> FileResponse:
    return _serve_frontend_page("admin.html")


app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


@app.get("/stocks")
async def stocks() -> Dict[str, Any]:
    payload = await engine.get_stocks_snapshot()
    if chaos_random.random() < 0.03 and payload["items"]:
        corrupted = copy.deepcopy(payload)
        idx = chaos_random.randrange(0, len(corrupted["items"]))
        corrupted["items"][idx].pop("bid", None)
        corrupted["items"][idx].pop("ask", None)
        corrupted["integrity_warning"] = "partial_payload_injected"
        return corrupted
    return payload


@app.get("/edge/{symbol}")
async def edge(symbol: str) -> Dict[str, Any]:
    try:
        payload = await engine.get_edge(symbol)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if chaos_random.random() < 0.025 and payload.get("edge"):
        payload["edge"]["explanation"] = f"{payload['edge'].get('explanation', '')} Feed quality degraded."
    return payload


@app.get("/orderbook/{symbol}")
async def orderbook(symbol: str) -> Dict[str, Any]:
    try:
        payload = await engine.get_orderbook(symbol)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if chaos_random.random() < 0.04:
        payload = copy.deepcopy(payload)
        payload["orderbook"]["bids"] = payload["orderbook"]["bids"][: chaos_random.randint(2, 7)]
        payload["integrity_warning"] = "truncated_depth_injected"
    return payload


@app.get("/heatmap")
async def heatmap() -> Dict[str, Any]:
    payload = await engine.get_heatmap()
    if chaos_random.random() < 0.03 and payload["items"]:
        payload = copy.deepcopy(payload)
        idx = chaos_random.randrange(0, len(payload["items"]))
        payload["items"][idx]["volume"] = int(payload["items"][idx]["volume"] * chaos_random.uniform(0.3, 2.8))
        payload["integrity_warning"] = "volume_perturbation_injected"
    return payload


@app.get("/status")
async def status() -> Dict[str, Any]:
    return await engine.get_system_status()


@app.get("/auth/providers")
async def auth_providers() -> Dict[str, Any]:
    dev_bypass = _oauth_dev_bypass_enabled()
    return {
        "providers": [
            {
                "id": provider,
                "enabled": _provider_enabled(provider) or dev_bypass,
                "mode": "dev-bypass" if (dev_bypass and not _provider_enabled(provider)) else "oauth",
            }
            for provider in OAUTH_SUPPORTED
        ]
    }


@app.get("/auth/session")
async def auth_session(request: Request) -> Dict[str, Any]:
    session_user = request.session.get("auth_user") or {}
    email = _normalize_email(session_user.get("email") or "")
    if not email:
        return {"authenticated": False, "user": None}
    user = await _require_session_user(request)
    return {"authenticated": True, "user": user}


@app.post("/auth/email-signup")
async def auth_email_signup(request: Request, payload: EmailSignupRequest) -> Dict[str, Any]:
    email = _normalize_email(payload.email)
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email")

    password_hash = _hash_password(payload.password)
    async with DB_LOCK:
        existing = USERS_DB.get(email)
        if existing and existing.get("password_hash") and existing.get("password_hash") != password_hash:
            raise HTTPException(status_code=409, detail="Account exists with different credentials")

    record = await _upsert_user(
        email=email,
        name=payload.name,
        provider="email",
        avatar="",
        password_hash=password_hash,
    )
    session_user = _session_user_from_record(record)
    request.session["auth_user"] = session_user
    await _capture_contact({"type": "signup", "email": email, "name": payload.name, "role": "Platform User", "note": ""})
    return {"ok": True, "user": session_user}


@app.post("/auth/email-login")
async def auth_email_login(request: Request, payload: EmailLoginRequest) -> Dict[str, Any]:
    email = _normalize_email(payload.email)
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email")

    candidate_hash = _hash_password(payload.password)
    async with DB_LOCK:
        record = USERS_DB.get(email)
    if not record:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up first.")
    if not record.get("password_hash") or record.get("password_hash") != candidate_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    synced = await _upsert_user(
        email=email,
        name=str(record.get("name") or "Learner"),
        provider="email",
        avatar=str(record.get("avatar") or ""),
    )
    session_user = _session_user_from_record(synced)
    request.session["auth_user"] = session_user
    return {"ok": True, "user": session_user}


@app.post("/auth/logout")
async def auth_logout(request: Request) -> Dict[str, Any]:
    request.session.pop("auth_user", None)
    request.session.pop("oauth_state", None)
    request.session.pop("oauth_provider", None)
    request.session.pop("oauth_next", None)
    return {"ok": True}


@app.get("/auth/login/{provider}")
async def auth_login(request: Request, provider: str, next: Optional[str] = "/") -> RedirectResponse:
    provider_clean = str(provider).lower().strip()
    if provider_clean not in OAUTH_SUPPORTED:
        raise HTTPException(status_code=404, detail=f"Unsupported provider: {provider_clean}")

    next_path = _safe_next_path(next)
    client_id, client_secret = _provider_credentials(provider_clean)
    if not client_id or not client_secret:
        if _oauth_dev_bypass_enabled():
            demo = _oauth_dev_user(provider_clean)
            record = await _upsert_user(
                email=str(demo.get("email") or ""),
                name=str(demo.get("name") or "Learner"),
                provider=str(demo.get("provider") or provider_clean),
                avatar=str(demo.get("avatar") or ""),
            )
            request.session["auth_user"] = _session_user_from_record(record)
            request.session.pop("oauth_state", None)
            request.session.pop("oauth_provider", None)
            request.session.pop("oauth_next", None)
            return RedirectResponse(next_path, status_code=302)
        raise HTTPException(
            status_code=503,
            detail=f"{provider_clean.upper()}_CLIENT_ID / {provider_clean.upper()}_CLIENT_SECRET not configured",
        )

    state = secrets.token_urlsafe(24)
    request.session["oauth_state"] = state
    request.session["oauth_provider"] = provider_clean
    request.session["oauth_next"] = next_path

    redirect_uri = str(request.url_for("auth_callback", provider=provider_clean))
    authorize_url = _oauth_authorize_url(provider_clean, client_id, redirect_uri, state)
    return RedirectResponse(authorize_url, status_code=302)


@app.get("/auth/callback/{provider}", name="auth_callback")
async def auth_callback(
    request: Request,
    provider: str,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
) -> RedirectResponse:
    provider_clean = str(provider).lower().strip()
    next_path = _safe_next_path(request.session.get("oauth_next", "/"))
    expected_provider = str(request.session.get("oauth_provider", "")).lower().strip()
    expected_state = str(request.session.get("oauth_state", "")).strip()

    if (
        error
        or not code
        or not state
        or not expected_state
        or not expected_provider
        or state != expected_state
        or provider_clean != expected_provider
    ):
        request.session.pop("oauth_state", None)
        request.session.pop("oauth_provider", None)
        request.session.pop("oauth_next", None)
        return RedirectResponse(f"{next_path}?auth_error=oauth_denied", status_code=302)

    client_id, client_secret = _provider_credentials(provider_clean)
    if not client_id or not client_secret:
        request.session.pop("oauth_state", None)
        request.session.pop("oauth_provider", None)
        request.session.pop("oauth_next", None)
        return RedirectResponse(f"{next_path}?auth_error=oauth_missing_config", status_code=302)

    redirect_uri = str(request.url_for("auth_callback", provider=provider_clean))
    try:
        token = await asyncio.to_thread(
            _oauth_exchange_code,
            provider_clean,
            code,
            redirect_uri,
            client_id,
            client_secret,
        )
        access_token = str(token.get("access_token") or "")
        if not access_token:
            raise RuntimeError("missing_access_token")
        user = await asyncio.to_thread(_oauth_fetch_profile, provider_clean, access_token)
        record = await _upsert_user(
            email=str(user.get("email") or ""),
            name=str(user.get("name") or "Learner"),
            provider=str(user.get("provider") or provider_clean),
            avatar=str(user.get("avatar") or ""),
        )
        request.session["auth_user"] = _session_user_from_record(record)
    except urllib.error.HTTPError:
        await engine.record_api_failure()
        request.session.pop("auth_user", None)
        return RedirectResponse(f"{next_path}?auth_error=oauth_forbidden", status_code=302)
    except Exception:
        await engine.record_api_failure()
        request.session.pop("auth_user", None)
        return RedirectResponse(f"{next_path}?auth_error=oauth_failed", status_code=302)
    finally:
        request.session.pop("oauth_state", None)
        request.session.pop("oauth_provider", None)
        request.session.pop("oauth_next", None)

    return RedirectResponse(next_path, status_code=302)


@app.post("/crm/lead")
async def crm_lead(payload: LeadCaptureRequest) -> Dict[str, Any]:
    contact = await _capture_contact(
        {
            "type": "lead",
            "name": payload.name.strip(),
            "email": _normalize_email(payload.email),
            "role": payload.role.strip(),
            "note": payload.note.strip(),
        }
    )
    return {"ok": True, "contact": contact}


@app.post("/crm/newsletter")
async def crm_newsletter(payload: NewsletterRequest) -> Dict[str, Any]:
    email = _normalize_email(payload.email)
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email")
    contact = await _capture_contact({"type": "newsletter", "name": "", "email": email, "role": "Newsletter", "note": ""})
    return {"ok": True, "contact": contact}


@app.get("/stock-updates")
async def stock_updates(request: Request) -> Dict[str, Any]:
    user = await _require_session_user(request)
    premium_active = bool(user.get("premium"))
    async with DB_LOCK:
        ordered = sorted(STOCK_UPDATES_DB.values(), key=lambda item: int(item.get("updated_at") or 0), reverse=True)
    visible: List[Dict[str, Any]] = []
    locked_count = 0
    for update in ordered:
        visibility = str(update.get("visibility") or "premium").lower()
        if visibility == "public" or premium_active:
            visible.append(dict(update))
        else:
            locked_count += 1
    return {
        "items": visible,
        "locked_count": locked_count,
        "premium_active": premium_active,
        "plan": str(user.get("plan") or ""),
    }


@app.get("/stock-updates/{symbol}")
async def stock_update_symbol(request: Request, symbol: str) -> Dict[str, Any]:
    user = await _require_session_user(request)
    premium_active = bool(user.get("premium"))
    symbol_clean = _normalize_symbol(symbol)
    async with DB_LOCK:
        update = next((dict(item) for item in STOCK_UPDATES_DB.values() if str(item.get("symbol") or "") == symbol_clean), None)
    if not update:
        raise HTTPException(status_code=404, detail=f"No admin update for {symbol_clean}")
    visibility = str(update.get("visibility") or "premium").lower()
    if visibility == "premium" and not premium_active:
        raise HTTPException(status_code=402, detail="Upgrade required to access this update")
    return {"item": update, "premium_active": premium_active}


@app.post("/payments/create-checkout")
async def payments_create_checkout(request: Request, payload: PaymentCreateRequest) -> Dict[str, Any]:
    user = await _require_session_user(request)
    plan_key = _safe_plan(payload.plan)
    plan = PREMIUM_PLANS[plan_key]
    checkout_id = secrets.token_urlsafe(18)
    now = _now_ms()
    payment = {
        "checkout_id": checkout_id,
        "email": _normalize_email(user.get("email") or ""),
        "plan": plan_key,
        "label": str(plan.get("label") or plan_key),
        "amount_inr": int(plan.get("amount_inr") or 0),
        "premium": bool(plan.get("premium")),
        "status": "created",
        "created_at": now,
        "updated_at": now,
        "method": "",
        "payer_name": "",
    }
    async with DB_LOCK:
        PAYMENTS_DB[checkout_id] = payment
    return {"ok": True, "checkout": payment}


@app.post("/payments/complete")
async def payments_complete(request: Request, payload: PaymentCompleteRequest) -> Dict[str, Any]:
    user = await _require_session_user(request)
    email = _normalize_email(user.get("email") or "")
    checkout_id = str(payload.checkout_id or "").strip()
    if not checkout_id:
        raise HTTPException(status_code=400, detail="checkout_id is required")

    async with DB_LOCK:
        payment = PAYMENTS_DB.get(checkout_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Checkout not found")
        if _normalize_email(payment.get("email") or "") != email:
            raise HTTPException(status_code=403, detail="Checkout owner mismatch")
        if str(payment.get("status") or "") == "paid":
            pass
        else:
            payment["status"] = "paid"
            payment["method"] = str(payload.method or "card").strip()[:24]
            payment["payer_name"] = str(payload.payer_name or "").strip()[:120]
            payment["updated_at"] = _now_ms()
            PAYMENTS_DB[checkout_id] = payment

    plan_key = _safe_plan(str(payment.get("plan") or "pro_monthly"))
    premium_target = bool(PREMIUM_PLANS.get(plan_key, {}).get("premium"))
    updated_user = await _set_user_premium(email, premium_target, plan_key if premium_target else "")
    session_user = _session_user_from_record(updated_user)
    request.session["auth_user"] = session_user
    return {
        "ok": True,
        "payment": payment,
        "user": session_user,
        "premium_active": bool(session_user.get("premium")),
    }


@app.get("/payments/me")
async def payments_me(request: Request) -> Dict[str, Any]:
    user = await _require_session_user(request)
    email = _normalize_email(user.get("email") or "")
    async with DB_LOCK:
        items = [dict(item) for item in PAYMENTS_DB.values() if _normalize_email(item.get("email") or "") == email]
    items.sort(key=lambda item: int(item.get("created_at") or 0), reverse=True)
    return {"items": items[:40], "premium_active": bool(user.get("premium")), "plan": str(user.get("plan") or "")}


@app.get("/admin/state")
async def admin_state(request: Request) -> Dict[str, Any]:
    _require_admin(request)
    return await engine.get_admin_state()


@app.get("/admin/events")
async def admin_events(request: Request, limit: int = 120) -> Dict[str, List[Dict[str, Any]]]:
    _require_admin(request)
    return {"items": await engine.get_admin_events(limit)}


@app.post("/admin/market-mode")
async def admin_market_mode(request: Request, payload: AdminModeRequest) -> Dict[str, Any]:
    _require_admin(request)
    try:
        return await engine.set_market_mode(payload.mode)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/admin/chaos")
async def admin_chaos(request: Request, payload: AdminChaosRequest) -> Dict[str, Any]:
    _require_admin(request)
    return await engine.set_chaos_factor(payload.chaos_factor)


@app.post("/admin/halt/{symbol}")
async def admin_halt_symbol(request: Request, symbol: str, payload: AdminHaltRequest) -> Dict[str, Any]:
    _require_admin(request)
    try:
        return await engine.set_symbol_halt(symbol, payload.halted)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/admin/reset")
async def admin_reset(request: Request) -> Dict[str, Any]:
    _require_admin(request)
    return await engine.reset_runtime_metrics()


@app.get("/admin/users")
async def admin_users(request: Request) -> Dict[str, Any]:
    _require_admin(request)
    async with DB_LOCK:
        users = [dict(record) for record in USERS_DB.values()]
    users.sort(key=lambda item: int(item.get("updated_at") or 0), reverse=True)
    return {"items": [_public_user_record(record) for record in users]}


@app.get("/admin/contacts")
async def admin_contacts(request: Request, limit: int = 300) -> Dict[str, Any]:
    _require_admin(request)
    safe_limit = max(10, min(1000, int(limit)))
    async with DB_LOCK:
        contacts = list(CONTACTS_DB)
    contacts.sort(key=lambda item: int(item.get("timestamp") or 0), reverse=True)
    return {"items": contacts[:safe_limit]}


@app.post("/admin/users/{email}/premium")
async def admin_user_premium(request: Request, email: str, payload: AdminSetPremiumRequest) -> Dict[str, Any]:
    _require_admin(request)
    email_clean = _normalize_email(email)
    plan_key = _safe_plan(payload.plan)
    record = await _set_user_premium(email_clean, payload.premium, plan_key)
    return {"ok": True, "user": _public_user_record(record)}


@app.get("/admin/stock-updates")
async def admin_stock_updates(request: Request) -> Dict[str, Any]:
    _require_admin(request)
    async with DB_LOCK:
        items = [dict(update) for update in STOCK_UPDATES_DB.values()]
    items.sort(key=lambda item: int(item.get("updated_at") or 0), reverse=True)
    return {"items": items}


@app.post("/admin/stock-updates")
async def admin_create_or_update_stock_update(request: Request, payload: AdminStockUpdateRequest) -> Dict[str, Any]:
    _require_admin(request)
    symbol = _normalize_symbol(payload.symbol)
    if not symbol:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    visibility = str(payload.visibility or "premium").lower().strip()
    if visibility not in {"public", "premium"}:
        raise HTTPException(status_code=400, detail="visibility must be public or premium")

    admin_key = str(request.headers.get("x-admin-key", "")).strip()
    now = _now_ms()
    async with DB_LOCK:
        existing = next((item for item in STOCK_UPDATES_DB.values() if str(item.get("symbol") or "") == symbol), None)
        if existing:
            existing["headline"] = payload.headline.strip()
            existing["body"] = payload.body.strip()
            existing["visibility"] = visibility
            existing["updated_by"] = admin_key[-6:] if admin_key else "admin"
            existing["updated_at"] = now
            existing["version"] = int(existing.get("version") or 1) + 1
            update = dict(existing)
        else:
            update_id = secrets.token_urlsafe(10)
            update = {
                "id": update_id,
                "symbol": symbol,
                "headline": payload.headline.strip(),
                "body": payload.body.strip(),
                "visibility": visibility,
                "updated_by": admin_key[-6:] if admin_key else "admin",
                "created_at": now,
                "updated_at": now,
                "version": 1,
            }
            STOCK_UPDATES_DB[update_id] = update
    return {"ok": True, "item": update}


@app.post("/chat")
async def chat(request: ChatRequest) -> Dict[str, Any]:
    await asyncio.sleep(chaos_random.uniform(0.01, 0.05))

    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    api_key = _read_env("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is missing on backend runtime",
        )

    model = _read_env("GROQ_MODEL", DEFAULT_GROQ_MODEL)
    market_snapshot = await engine.get_stocks_snapshot()
    try:
        text = await asyncio.to_thread(
            _call_groq_chat,
            api_key=api_key,
            model=model,
            prompt=prompt,
            market_snapshot=market_snapshot,
        )
    except urllib.error.HTTPError as exc:
        await engine.record_api_failure()
        try:
            raw = exc.read().decode("utf-8")
            parsed = json.loads(raw)
            detail = parsed.get("error", {}).get("message") or raw
        except Exception:
            detail = exc.reason if hasattr(exc, "reason") else "LLM provider error"
        raise HTTPException(status_code=502, detail=f"Groq API error: {detail}") from exc
    except Exception as exc:
        await engine.record_api_failure()
        raise HTTPException(status_code=502, detail=f"Chat engine failed: {exc}") from exc

    return {
        "timestamp": int(time.time() * 1000),
        "model": model,
        "provider": "groq",
        "response": text,
    }


@app.get("/chat/status")
async def chat_status() -> Dict[str, Any]:
    key = _read_env("GROQ_API_KEY")
    model = _read_env("GROQ_MODEL", DEFAULT_GROQ_MODEL)
    fingerprint = ""
    if key:
        fingerprint = f"{key[:4]}...{key[-4:]}" if len(key) > 10 else "***"
    return {
        "provider": "groq",
        "model": model,
        "key_present": bool(key),
        "key_fingerprint": fingerprint,
    }


@app.websocket("/stream")
async def stream(websocket: WebSocket) -> None:
    await websocket.accept()
    await engine.register_stream_client()
    queue = await engine.event_bus.subscribe("stream", maxsize=4000)

    try:
        bootstrap_stocks = await engine.get_stocks_snapshot()
        bootstrap_heatmap = await engine.get_heatmap()
        bootstrap_status = await engine.get_system_status()
        await websocket.send_json({"type": "bootstrap", "stocks": bootstrap_stocks, "heatmap": bootstrap_heatmap, "status": bootstrap_status})

        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=8.0)
            except asyncio.TimeoutError:
                heartbeat = await engine.get_system_status()
                await websocket.send_json(
                    {
                        "type": "heartbeat",
                        "timestamp": heartbeat["metrics"]["last_heartbeat"],
                        "metrics": heartbeat["metrics"],
                        "thresholds": heartbeat["thresholds"],
                        "market_mode": heartbeat.get("market_mode"),
                        "chaos_factor": heartbeat.get("chaos_factor"),
                        "halted_symbols": heartbeat.get("halted_symbols", []),
                    }
                )
                continue

            chaos_factor = max(0.15, float(getattr(engine, "chaos_factor", 1.0)))
            if chaos_random.random() < min(0.5, 0.06 * chaos_factor):
                await asyncio.sleep(chaos_random.uniform(0.001 * chaos_factor, 0.09 * chaos_factor))
            if chaos_random.random() < min(0.3, 0.012 * chaos_factor):
                await engine.record_api_failure()
                continue
            if chaos_random.random() < min(0.2, 0.01 * chaos_factor) and event.get("type") == "tick":
                event = dict(event)
                event["timestamp"] = int(event["timestamp"]) - chaos_random.randint(20, 500)
                event["anomaly"] = "delayed_packet_injected"

            await websocket.send_json(event)
    except WebSocketDisconnect:
        return
    except Exception:
        await engine.record_api_failure()
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
    finally:
        await engine.event_bus.unsubscribe("stream", queue)
        await engine.unregister_stream_client()
