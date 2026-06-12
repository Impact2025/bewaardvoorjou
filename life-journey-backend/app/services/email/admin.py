"""Interne e-mails voor de eigenaar: verkoopmeldingen en het dagelijkse systeemrapport.

Deze e-mails gaan naar `settings.owner_notification_email` (standaard
info@bewaardvoorjou.nl) en zijn bewust losgekoppeld van het reguliere,
template-gestuurde e-mailsysteem voor gebruikers: ze hebben geen unsubscribe,
geen EmailEvent-tracking en geen Jinja-templates nodig.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from loguru import logger
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order as OrderModel
from app.services.email.client import send_email


_PACKAGE_NAMES = {
    "VERHAAL": "Verhaal (Digitaal)",
    "ERFGOED": "Erfgoed Box",
    "NALATENSCHAP": "Nalatenschap (Lifetime)",
    "BEGIN": "Het Begin",
    "VOOR_ALTIJD": "Voor Altijd",
    "DIGITAAL": "Digitaal cadeau",
}


def _euro(cents: int | None) -> str:
    """Formatteer eurocenten als '€ 1.234,56' (Nederlandse notatie)."""
    value = (cents or 0) / 100
    s = f"{value:,.2f}"  # 1,234.56
    s = s.replace(",", "_").replace(".", ",").replace("_", ".")  # -> 1.234,56
    return f"€ {s}"


def _wrap(title: str, body_html: str) -> str:
    """Minimale, zelfstandige HTML-wrapper (inline styles, geen premailer nodig)."""
    return f"""\
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;background:#f4f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2b2b2b;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;margin:0 0 16px;color:#1a1a1a;">{title}</h1>
    {body_html}
    <p style="margin-top:32px;font-size:12px;color:#999;">
      Automatisch bericht van Bewaardvoorjou &middot; {datetime.now(timezone.utc):%d-%m-%Y %H:%M} UTC
    </p>
  </div>
</body>
</html>"""


# ---------------------------------------------------------------------------
# 1. Verkoopmelding — bij elke betaalde of gratis bestelling
# ---------------------------------------------------------------------------

def send_owner_sale_notification(order: OrderModel, contact_email: str | None) -> None:
    """Stuur de eigenaar een melding dat er een bestelling is geplaatst.

    Faalt nooit hard: een mislukte interne melding mag de betaalverwerking
    nooit blokkeren.
    """
    try:
        owner = settings.owner_notification_email
        if not owner:
            return

        pkg = _PACKAGE_NAMES.get(order.package_type, order.package_type)
        is_free = (order.price_paid or 0) == 0
        bedrag = "Gratis (promo)" if is_free else _euro(order.price_paid)
        addons = ", ".join(order.addons) if order.addons else "—"
        method = order.stripe_payment_method or ("promo" if is_free else "—")

        rows = [
            ("Pakket", pkg),
            ("Bedrag", bedrag),
            ("Betaalmethode", method),
            ("Klant", contact_email or order.guest_email or "—"),
            ("Add-ons", addons),
        ]
        if order.promo_code_used:
            rows.append(("Promocode", order.promo_code_used))
        if order.recipient_name:
            rows.append(("Voor (cadeau)", f"{order.recipient_name} &lt;{order.recipient_email or '—'}&gt;"))
        if order.shipping_address and isinstance(order.shipping_address, dict):
            city = order.shipping_address.get("city")
            if city:
                rows.append(("Verzendstad", city))
        rows.append(("Order-ID", order.id))

        table = "".join(
            f'<tr><td style="padding:6px 12px 6px 0;color:#777;font-size:14px;white-space:nowrap;">{k}</td>'
            f'<td style="padding:6px 0;font-size:14px;font-weight:600;">{v}</td></tr>'
            for k, v in rows
        )
        body = (
            f'<p style="font-size:15px;">Er is zojuist een bestelling geplaatst 🎉</p>'
            f'<table style="border-collapse:collapse;margin-top:8px;">{table}</table>'
        )
        subject = f"💰 Nieuwe verkoop: {pkg} — {bedrag}"

        html = _wrap("Nieuwe bestelling", body)
        text = (
            "Nieuwe bestelling\n\n"
            + "\n".join(f"{k}: {v}" for k, v in rows).replace("&lt;", "<").replace("&gt;", ">")
        )

        send_email(to=owner, subject=subject, html=html, text=text)
        logger.info(f"Verkoopmelding verstuurd naar eigenaar voor order {order.id}")
    except Exception as exc:
        logger.error(f"Kon verkoopmelding niet sturen voor order {getattr(order, 'id', '?')}: {exc}")


# ---------------------------------------------------------------------------
# 1b. Nieuw supportticket — melding naar de eigenaar
# ---------------------------------------------------------------------------

def send_owner_ticket_notification(
    ticket_number: int,
    category: str,
    subject: str,
    message: str,
    submitter_name: str,
    submitter_email: str | None,
) -> None:
    """Stuur de eigenaar een melding dat er een nieuwe support-vraag binnen is.

    Faalt nooit hard: een mislukte interne melding mag het aanmaken van het
    ticket nooit blokkeren.
    """
    try:
        import html as _html

        owner = settings.owner_notification_email
        if not owner:
            return

        rows = [
            ("Ticket", f"BVJ-{ticket_number:04d}"),
            ("Categorie", _html.escape(category or "—")),
            ("Onderwerp", _html.escape(subject or "—")),
            ("Van", _html.escape(submitter_name or "—")),
            ("E-mail", _html.escape(submitter_email or "—")),
        ]
        table = "".join(
            f'<tr><td style="padding:6px 12px 6px 0;color:#777;font-size:14px;white-space:nowrap;">{k}</td>'
            f'<td style="padding:6px 0;font-size:14px;font-weight:600;">{v}</td></tr>'
            for k, v in rows
        )
        msg_html = _html.escape(message or "").replace("\n", "<br>")
        reply_btn = (
            f'<p style="margin-top:20px;"><a href="mailto:{submitter_email}'
            f'?subject=Re: {_html.escape(subject or "")} (BVJ-{ticket_number:04d})" '
            f'style="background:#e05c00;color:#fff;text-decoration:none;padding:10px 18px;'
            f'border-radius:8px;font-size:14px;font-weight:600;">Direct antwoorden</a></p>'
            if submitter_email else ""
        )
        body = (
            f'<p style="font-size:15px;">Er is een nieuwe vraag binnengekomen via het contactformulier 📨</p>'
            f'<table style="border-collapse:collapse;margin-top:8px;">{table}</table>'
            f'<div style="background:#f9f6f0;border-radius:12px;padding:16px;margin:20px 0;'
            f'font-size:14px;color:#333;white-space:normal;">{msg_html}</div>'
            f'{reply_btn}'
        )
        owner_subject = f"📨 Nieuwe vraag: {subject} — BVJ-{ticket_number:04d}"

        html = _wrap("Nieuw supportticket", body)
        text = (
            "Nieuwe vraag via contactformulier\n\n"
            + "\n".join(f"{k}: {v}" for k, v in rows).replace("&lt;", "<").replace("&gt;", ">")
            + f"\n\nBericht:\n{message or ''}"
        )

        send_email(to=owner, subject=owner_subject, html=html, text=text)
        logger.info(f"Ticketmelding verstuurd naar eigenaar voor BVJ-{ticket_number:04d}")
    except Exception as exc:
        logger.error(f"Kon ticketmelding niet sturen voor BVJ-{ticket_number:04d}: {exc}")


# ---------------------------------------------------------------------------
# 2. Dagelijks systeemrapport
# ---------------------------------------------------------------------------

def gather_daily_stats(db: Session) -> dict:
    """Verzamel de statistieken voor het dagelijkse systeemrapport (laatste 24 uur)."""
    from app.models.user import User as UserModel
    from app.models.email import EmailEvent as EmailEventModel

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)

    # --- Omzet & bestellingen (laatste 24u) ---
    paid_today = (
        db.query(OrderModel)
        .filter(OrderModel.status.in_(["PAID", "FULFILLED"]), OrderModel.paid_at >= cutoff)
        .all()
    )
    revenue_today_cents = sum(o.price_paid or 0 for o in paid_today)

    # Verdeling per pakket (24u)
    per_package: dict[str, int] = {}
    for o in paid_today:
        per_package[o.package_type] = per_package.get(o.package_type, 0) + 1

    # --- Vastgelopen / mislukte betalingen ---
    # Alleen recente, gestrande betalingen: gestart in de laatste 24u maar al
    # >1u niet afgerond. Oude verlaten checkouts blijven zo buiten beeld.
    stuck_pending = (
        db.query(func.count(OrderModel.id))
        .filter(
            OrderModel.status == "PENDING",
            OrderModel.created_at >= cutoff,
            OrderModel.created_at < now - timedelta(hours=1),
        )
        .scalar()
        or 0
    )
    cancelled_today = (
        db.query(func.count(OrderModel.id))
        .filter(OrderModel.status == "CANCELLED", OrderModel.created_at >= cutoff)
        .scalar()
        or 0
    )

    # --- Nieuwe gebruikers ---
    new_users = (
        db.query(func.count(UserModel.id)).filter(UserModel.created_at >= cutoff).scalar() or 0
    )

    # --- E-mail gezondheid (laatste 24u) ---
    emails_sent = (
        db.query(func.count(EmailEventModel.id))
        .filter(EmailEventModel.status == "sent", EmailEventModel.created_at >= cutoff)
        .scalar()
        or 0
    )
    emails_failed = (
        db.query(func.count(EmailEventModel.id))
        .filter(EmailEventModel.status == "failed", EmailEventModel.created_at >= cutoff)
        .scalar()
        or 0
    )
    bounces = (
        db.query(func.count(EmailEventModel.id))
        .filter(EmailEventModel.bounced_at >= cutoff)
        .scalar()
        or 0
    )
    complaints = (
        db.query(func.count(EmailEventModel.id))
        .filter(EmailEventModel.complained_at >= cutoff)
        .scalar()
        or 0
    )

    # --- All-time totalen ---
    total_paid_orders = (
        db.query(func.count(OrderModel.id))
        .filter(OrderModel.status.in_(["PAID", "FULFILLED"]))
        .scalar()
        or 0
    )
    total_revenue_cents = (
        db.query(func.coalesce(func.sum(OrderModel.price_paid), 0))
        .filter(OrderModel.status.in_(["PAID", "FULFILLED"]))
        .scalar()
        or 0
    )
    founding_members_used = (
        db.query(func.count(OrderModel.id))
        .filter(
            OrderModel.status.in_(["PAID", "FULFILLED"]),
            OrderModel.package_type.in_(["VERHAAL", "ERFGOED", "NALATENSCHAP"]),
        )
        .scalar()
        or 0
    )

    # --- Waarschuwingen ---
    warnings: list[str] = []
    if stuck_pending > 0:
        warnings.append(f"{stuck_pending} bestelling(en) staan >1u op PENDING — mogelijk vastgelopen betaling.")
    if emails_failed > 0:
        warnings.append(f"{emails_failed} e-mail(s) mislukt in de laatste 24u.")
    if bounces > 0:
        warnings.append(f"{bounces} e-mail(s) gebounced in de laatste 24u.")
    if complaints > 0:
        warnings.append(f"{complaints} spamklacht(en) in de laatste 24u.")

    return {
        "now": now,
        "paid_count": len(paid_today),
        "revenue_today_cents": revenue_today_cents,
        "per_package": per_package,
        "stuck_pending": stuck_pending,
        "cancelled_today": cancelled_today,
        "new_users": new_users,
        "emails_sent": emails_sent,
        "emails_failed": emails_failed,
        "bounces": bounces,
        "complaints": complaints,
        "total_paid_orders": total_paid_orders,
        "total_revenue_cents": total_revenue_cents,
        "founding_members_used": founding_members_used,
        "founding_members_max": settings.founding_member_max_count,
        "warnings": warnings,
    }


def build_daily_health_report(stats: dict) -> tuple[str, str, str]:
    """Bouw (subject, html, text) voor het dagelijkse systeemrapport."""
    ok = not stats["warnings"]
    status_label = "✅ Alles in orde" if ok else "⚠️ Aandacht nodig"
    banner_color = "#1f9d55" if ok else "#d97706"

    def _metric(label: str, value: str) -> str:
        return (
            f'<td style="padding:12px;border:1px solid #eee;text-align:center;width:33%;">'
            f'<div style="font-size:22px;font-weight:700;color:#1a1a1a;">{value}</div>'
            f'<div style="font-size:12px;color:#888;margin-top:4px;">{label}</div></td>'
        )

    pkg_lines = (
        "".join(
            f'<li>{_PACKAGE_NAMES.get(k, k)}: <strong>{v}</strong></li>'
            for k, v in sorted(stats["per_package"].items())
        )
        or "<li>Geen verkopen in de laatste 24 uur.</li>"
    )

    warnings_html = (
        '<div style="margin-top:20px;padding:12px 16px;background:#fff7ed;border-left:4px solid #d97706;border-radius:4px;">'
        '<strong style="color:#b45309;">Waarschuwingen</strong>'
        '<ul style="margin:8px 0 0;padding-left:20px;color:#92400e;font-size:14px;">'
        + "".join(f"<li>{w}</li>" for w in stats["warnings"])
        + "</ul></div>"
        if stats["warnings"]
        else '<p style="margin-top:20px;color:#1f9d55;font-size:14px;">Geen problemen gedetecteerd. 👍</p>'
    )

    body = f"""\
    <div style="padding:10px 16px;background:{banner_color};color:#fff;border-radius:6px;font-size:15px;font-weight:600;">
      {status_label}
    </div>

    <h2 style="font-size:16px;margin:24px 0 8px;color:#1a1a1a;">Laatste 24 uur</h2>
    <table style="border-collapse:collapse;width:100%;margin-bottom:8px;">
      <tr>
        {_metric("Betaalde orders", str(stats['paid_count']))}
        {_metric("Omzet", _euro(stats['revenue_today_cents']))}
        {_metric("Nieuwe accounts", str(stats['new_users']))}
      </tr>
    </table>

    <h3 style="font-size:14px;margin:20px 0 4px;color:#555;">Verkopen per pakket</h3>
    <ul style="margin:4px 0;padding-left:20px;font-size:14px;">{pkg_lines}</ul>

    <h3 style="font-size:14px;margin:20px 0 4px;color:#555;">E-mail (24u)</h3>
    <p style="font-size:14px;margin:4px 0;">
      Verzonden: <strong>{stats['emails_sent']}</strong> &middot;
      Mislukt: <strong>{stats['emails_failed']}</strong> &middot;
      Bounces: <strong>{stats['bounces']}</strong> &middot;
      Klachten: <strong>{stats['complaints']}</strong>
    </p>

    <h3 style="font-size:14px;margin:20px 0 4px;color:#555;">Betalingen om in de gaten te houden</h3>
    <p style="font-size:14px;margin:4px 0;">
      Vastgelopen (PENDING &gt;1u): <strong>{stats['stuck_pending']}</strong> &middot;
      Geannuleerd (24u): <strong>{stats['cancelled_today']}</strong>
    </p>

    {warnings_html}

    <h2 style="font-size:16px;margin:28px 0 8px;color:#1a1a1a;">Totalen</h2>
    <p style="font-size:14px;margin:4px 0;">
      Betaalde orders totaal: <strong>{stats['total_paid_orders']}</strong><br>
      Omzet totaal: <strong>{_euro(stats['total_revenue_cents'])}</strong><br>
      Founding members: <strong>{stats['founding_members_used']} / {stats['founding_members_max']}</strong>
    </p>
    """

    subject = (
        f"{'✅' if ok else '⚠️'} Dagrapport Bewaardvoorjou — "
        f"{stats['paid_count']} verkopen, {_euro(stats['revenue_today_cents'])} ({stats['now']:%d-%m-%Y})"
    )

    text = (
        f"Dagrapport Bewaardvoorjou — {stats['now']:%d-%m-%Y %H:%M} UTC\n"
        f"Status: {'OK' if ok else 'AANDACHT NODIG'}\n\n"
        f"LAATSTE 24 UUR\n"
        f"- Betaalde orders: {stats['paid_count']}\n"
        f"- Omzet: {_euro(stats['revenue_today_cents'])}\n"
        f"- Nieuwe accounts: {stats['new_users']}\n"
        f"- E-mail verzonden/mislukt/bounce/klacht: "
        f"{stats['emails_sent']}/{stats['emails_failed']}/{stats['bounces']}/{stats['complaints']}\n"
        f"- Vastgelopen PENDING (>1u): {stats['stuck_pending']}\n"
        f"- Geannuleerd (24u): {stats['cancelled_today']}\n\n"
        f"WAARSCHUWINGEN\n"
        + ("".join(f"- {w}\n" for w in stats["warnings"]) or "- Geen\n")
        + f"\nTOTALEN\n"
        f"- Betaalde orders: {stats['total_paid_orders']}\n"
        f"- Omzet totaal: {_euro(stats['total_revenue_cents'])}\n"
        f"- Founding members: {stats['founding_members_used']}/{stats['founding_members_max']}\n"
    )

    html = _wrap("Dagelijks systeemrapport", body)
    return subject, html, text


def send_daily_health_report(db: Session) -> None:
    """Verzamel statistieken en mail het dagrapport naar de eigenaar."""
    owner = settings.owner_notification_email
    if not owner:
        logger.warning("Geen owner_notification_email ingesteld — dagrapport overgeslagen")
        return
    try:
        stats = gather_daily_stats(db)
    except Exception as exc:
        # DB-fout is zelf een signaal dat er iets mis is — meld dat dan ook.
        logger.error(f"Kon dagrapport-statistieken niet verzamelen: {exc}")
        subject = "⚠️ Dagrapport Bewaardvoorjou — kon statistieken NIET ophalen"
        body = (
            f'<div style="padding:10px 16px;background:#dc2626;color:#fff;border-radius:6px;font-weight:600;">'
            f"⚠️ Systeemfout</div>"
            f'<p style="font-size:14px;margin-top:16px;">Het dagrapport kon niet worden opgebouwd. '
            f"Mogelijk is de database onbereikbaar.</p>"
            f'<pre style="font-size:12px;background:#f4f4f4;padding:12px;border-radius:4px;'
            f'white-space:pre-wrap;">{exc}</pre>'
        )
        send_email(to=owner, subject=subject, html=_wrap("Dagrapport mislukt", body),
                   text=f"Dagrapport kon niet worden opgebouwd: {exc}")
        return

    subject, html, text = build_daily_health_report(stats)
    send_email(to=owner, subject=subject, html=html, text=text)
    logger.info(f"Dagrapport verstuurd naar {owner} ({stats['paid_count']} verkopen, 24u)")
