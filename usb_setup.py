"""
Bewaardvoorjou — USB Automation Tool
Bereidt een USB-stick voor als Digitale Familiebibliotheek.

Modi
  1  SETUP    — formatteer en maak de lege mapstructuur
  2  BRANDEN  — haal het inhoudspakket op van de backend en zet het op de stick

Vereisten
  Windows : pip install pywin32 requests
  macOS   : pip install requests
"""

import io
import os
import platform
import shutil
import sys
import zipfile

# ─── ANSI kleurhulp ───────────────────────────────────────────────────────────

# Windows 10+ ondersteunt ANSI natively na een lege os.system()-aanroep
if platform.system() == "Windows":
    os.system("")

_R = "\033[0m"
_GREEN  = "\033[92m"
_YELLOW = "\033[93m"
_RED    = "\033[91m"
_CYAN   = "\033[96m"
_BOLD   = "\033[1m"
_DIM    = "\033[90m"


def ok(msg: str)   -> None: print(f"{_GREEN}  ✓{_R}  {msg}")
def warn(msg: str) -> None: print(f"{_YELLOW}  !{_R}  {msg}")
def err(msg: str)  -> None: print(f"{_RED}  ✗{_R}  {msg}")
def info(msg: str) -> None: print(f"{_CYAN}  …{_R}  {msg}")
def dim(msg: str)  -> None: print(f"{_DIM}     {msg}{_R}")
def h1(msg: str)   -> None: print(f"\n{_BOLD}{msg}{_R}")
def h2(msg: str)   -> None: print(f"\n{_CYAN}── {msg} ──{_R}")

def progress_bar(current: int, total: int, width: int = 38) -> None:
    if total <= 0:
        return
    pct    = current / total
    filled = int(width * pct)
    bar    = "█" * filled + "░" * (width - filled)
    mb_cur = current / 1024 / 1024
    mb_tot = total   / 1024 / 1024
    print(f"\r  {_CYAN}[{bar}]{_R} {pct*100:5.1f}%  {mb_cur:.1f}/{mb_tot:.1f} MB",
          end="", flush=True)


# ─── CONFIGURATIE ─────────────────────────────────────────────────────────────

VOLUME_NAME = "MijnErfgoed"

REQUIRED_FOLDERS = [
    "01_Mijn_Levensboek_PDF",
    "02_Gesproken_Herinneringen",
    "03_Mijn_Fotogalerij",
    "04_Start_Hier_Offline",
    "05_Software",
]

PHASE_SUBFOLDERS = [
    "Fase_1_Vroege_Jeugd",
    "Fase_2_Volwassen_Leven",
    "Fase_3_Later_Leven",
]

MIN_FREE_BYTES = 4 * 1024 ** 3  # 4 GB minimum


# ─── SCHIJF-DETECTIE ──────────────────────────────────────────────────────────

def _bytes_to_gb(n: int) -> str:
    return f"{n / 1024**3:.1f} GB"


def _free_space(path: str) -> int:
    return shutil.disk_usage(path).free


def _detect_drives_windows() -> list[str]:
    try:
        import win32file
    except ImportError:
        err("pywin32 niet gevonden. Installeer met: pip install pywin32")
        sys.exit(1)
    return [
        f"{chr(c)}:\\"
        for c in range(ord("A"), ord("Z") + 1)
        if win32file.GetDriveType(f"{chr(c)}:\\") == win32file.DRIVE_REMOVABLE
    ]


def _detect_drives_macos() -> list[str]:
    skip = {"Macintosh HD", "Preboot", "Recovery", "VM", "Data"}
    try:
        volumes = os.listdir("/Volumes")
    except PermissionError:
        return []
    return [
        os.path.join("/Volumes", name)
        for name in volumes
        if name not in skip and os.path.ismount(os.path.join("/Volumes", name))
    ]


def _drive_label_windows(drive: str) -> str:
    try:
        import win32api
        return win32api.GetVolumeInformation(drive)[0] or "(geen label)"
    except Exception:
        return ""


def get_usb_drive() -> str | None:
    os_type = platform.system()
    info(f"Systeem: {os_type}")

    if os_type == "Windows":
        drives = _detect_drives_windows()
    elif os_type == "Darwin":
        drives = _detect_drives_macos()
    else:
        err("Alleen Windows en macOS worden ondersteund.")
        return None

    if not drives:
        return None

    if len(drives) == 1:
        return drives[0]

    warn("Meerdere verwisselbare schijven gevonden:")
    for i, d in enumerate(drives):
        free  = _bytes_to_gb(_free_space(d))
        label = _drive_label_windows(d) if os_type == "Windows" else ""
        tag   = f"  {_DIM}{label}{_R}" if label else ""
        print(f"     {_BOLD}[{i + 1}]{_R} {d}{tag}  —  {free} vrij")

    while True:
        choice = input("\n  Welk nummer? ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(drives):
            return drives[int(choice) - 1]
        warn("Voer een geldig nummer in.")


# ─── FORMATTEREN ──────────────────────────────────────────────────────────────

def format_usb(drive_path: str) -> bool:
    import subprocess
    os_type = platform.system()
    info(f"Formatteren naar exFAT met label '{VOLUME_NAME}'...")

    try:
        if os_type == "Windows":
            letter = drive_path.rstrip("\\")
            result = subprocess.run(
                f"format {letter} /FS:exFAT /V:{VOLUME_NAME} /Q /X /Y",
                shell=True, capture_output=True, text=True,
            )
            if result.returncode != 0:
                err(f"Formatteren mislukt:\n{result.stderr}")
                return False

        elif os_type == "Darwin":
            meta = subprocess.run(
                ["diskutil", "info", drive_path],
                capture_output=True, text=True, check=True,
            )
            disk_id = next(
                (line.split(":")[-1].strip()
                 for line in meta.stdout.splitlines() if "Device Node" in line),
                None,
            )
            if not disk_id:
                err("Kon schijf-identifier niet bepalen via diskutil.")
                return False
            subprocess.run(
                ["diskutil", "eraseDisk", "exFAT", VOLUME_NAME, "GPT", disk_id],
                check=True,
            )

        ok("Formatteren voltooid.")
        return True

    except Exception as e:
        err(f"Onverwachte fout: {e}")
        return False


# ─── MAPPENSTRUCTUUR ──────────────────────────────────────────────────────────

def create_structure(drive_path: str) -> None:
    info(f"Mappenstructuur aanmaken op {drive_path}")
    try:
        for folder in REQUIRED_FOLDERS:
            os.makedirs(os.path.join(drive_path, folder), exist_ok=True)
            dim(f"📂 {folder}")

        for parent in ("02_Gesproken_Herinneringen", "03_Mijn_Fotogalerij"):
            for sub in PHASE_SUBFOLDERS:
                os.makedirs(os.path.join(drive_path, parent, sub), exist_ok=True)
                dim(f"📂 {parent}/{sub}")

        _write_autorun(drive_path)
        _write_readme(drive_path)
        _write_welcome_placeholder(drive_path)
        _write_dashboard_placeholder(drive_path)
        ok("Structuur klaar.")
    except OSError as e:
        err(f"Aanmaken van mappen mislukt: {e}")


def _write_autorun(drive_path: str) -> None:
    with open(os.path.join(drive_path, "autorun.inf"), "w", encoding="utf-8") as f:
        f.write(
            "[AutoRun]\n"
            "Action=Mijn Levensboek openen\n"
            "Label=MijnErfgoed\n"
            "ShellExecute=index.html\n"
        )
    dim("📄 autorun.inf")


def _write_readme(drive_path: str) -> None:
    with open(os.path.join(drive_path, "KLIK_HIER_EERST.txt"), "w", encoding="utf-8") as f:
        f.write(
            "WELKOM\n"
            "======\n\n"
            "Dubbelklik op het bestand  index.html  op deze stick.\n"
            "Uw persoonlijke welkomstpagina opent dan vanzelf.\n\n"
            "WERKT HET NIET?\n"
            "  Open de map 05_Software en start VLC.\n"
            "  VLC speelt alle audiofragmenten af.\n\n"
            "Met warme groet,\nHet team van Bewaardvoorjou\nwww.bewaardvoorjou.nl\n"
        )
    dim("📄 KLIK_HIER_EERST.txt")


def _write_welcome_placeholder(drive_path: str) -> None:
    html = (
        "<!DOCTYPE html><html lang='nl'><head><meta charset='UTF-8'>"
        "<title>Bewaardvoorjou</title>"
        "<style>"
        "body{font-family:Georgia,serif;background:#f9f5f0;color:#2d1a0e;"
        "display:flex;justify-content:center;align-items:center;"
        "min-height:100vh;margin:0;padding:24px}"
        ".card{background:#fff;border-radius:24px;padding:56px 64px;"
        "max-width:600px;width:100%;text-align:center;"
        "box-shadow:0 8px 48px rgba(45,26,14,.12);border:1px solid #e5d4bf}"
        ".logo{font-size:1rem;letter-spacing:.18em;text-transform:uppercase;"
        "color:#c9963a;font-weight:600;margin-bottom:36px}"
        "h1{font-size:3rem;color:#6b3a1f;font-weight:normal;margin-bottom:24px}"
        "p{font-size:1.25rem;color:#5c3d2b;line-height:1.65}"
        "</style></head><body>"
        "<div class='card'>"
        "<div class='logo'>Bewaardvoorjou</div>"
        "<h1>Uw levensboek wordt hier geladen</h1>"
        "<p>Dit bestand wordt ingevuld zodra uw verhalen zijn overgedragen.<br><br>"
        "Hulp nodig? <strong>www.bewaardvoorjou.nl</strong></p>"
        "</div></body></html>\n"
    )
    path = os.path.join(drive_path, "index.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    dim("🌐 index.html")


def _write_dashboard_placeholder(drive_path: str) -> None:
    html = (
        "<!DOCTYPE html><html lang='nl'><head><meta charset='UTF-8'>"
        "<title>Bewaardvoorjou</title>"
        "<style>body{font-family:Georgia,serif;background:#f9f5f0;color:#2d1a0e;"
        "display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}"
        ".card{background:#fff;border-radius:16px;padding:48px;max-width:520px;"
        "text-align:center;box-shadow:0 4px 32px rgba(0,0,0,.08)}"
        "h1{font-size:1.8rem;margin-bottom:.5rem;font-weight:normal}"
        "p{line-height:1.7;color:#6b4226}</style></head><body>"
        "<div class='card'><h1>Uw levensboek wordt hier geladen</h1>"
        "<p>Dit bestand wordt gevuld zodra uw verhalen zijn overgedragen.<br>"
        "Neem contact op via <strong>www.bewaardvoorjou.nl</strong> bij vragen.</p>"
        "</div></body></html>\n"
    )
    path = os.path.join(drive_path, "04_Start_Hier_Offline", "index.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    dim("🌐 04_Start_Hier_Offline/index.html")


# ─── RUIMTE-CHECK ─────────────────────────────────────────────────────────────

def check_free_space(drive_path: str) -> bool:
    free = _free_space(drive_path)
    info(f"Vrije ruimte: {_bytes_to_gb(free)}")
    if free < MIN_FREE_BYTES:
        err(
            f"Te weinig ruimte. Minimaal {_bytes_to_gb(MIN_FREE_BYTES)} "
            f"benodigd, slechts {_bytes_to_gb(free)} beschikbaar."
        )
        return False
    return True


# ─── VERIFICATIE ──────────────────────────────────────────────────────────────

def verify_burn(drive_path: str) -> tuple[int, int]:
    """Tel bestanden en totale bytes op de stick. Geeft (count, bytes)."""
    total_files = 0
    total_bytes = 0
    for root, _, files in os.walk(drive_path):
        for fname in files:
            total_files += 1
            try:
                total_bytes += os.path.getsize(os.path.join(root, fname))
            except OSError:
                pass
    return total_files, total_bytes


def print_verify_report(drive_path: str, naam: str) -> None:
    h2("Verificatie")
    files, size = verify_burn(drive_path)
    ok(f"{files} bestanden  |  {size / 1024 / 1024:.1f} MB  |  {_bytes_to_gb(_free_space(drive_path))} vrij")

    # Check of kernmappen aanwezig zijn
    missing = [
        f for f in REQUIRED_FOLDERS
        if not os.path.isdir(os.path.join(drive_path, f))
    ]
    if missing:
        for m in missing:
            warn(f"Map ontbreekt: {m}")
    else:
        ok("Alle vereiste mappen aanwezig.")

    # Check of het welkomstscherm (root) en dashboard aanwezig zijn
    root_html   = os.path.join(drive_path, "index.html")
    dashboard   = os.path.join(drive_path, "04_Start_Hier_Offline", "index.html")

    if os.path.isfile(root_html):
        ok(f"Welkomstscherm (index.html) aanwezig  ({os.path.getsize(root_html) / 1024:.0f} KB)")
    else:
        warn("Welkomstscherm (index.html) ontbreekt — controleer de backend-export.")

    if os.path.isfile(dashboard):
        ok(f"Dashboard aanwezig  ({os.path.getsize(dashboard) / 1024:.0f} KB)")
    else:
        warn("Dashboard (04_Start_Hier_Offline/index.html) ontbreekt.")


# ─── API CLIENT ───────────────────────────────────────────────────────────────

class UsbApiClient:
    """Communiceert met de Bewaardvoorjou-backend."""

    def __init__(self, base_url: str, token: str) -> None:
        try:
            import requests as _req
            self._req = _req
        except ImportError:
            err("'requests' niet gevonden. Installeer met: pip install requests")
            sys.exit(1)
        self.base    = base_url.rstrip("/")
        self.headers = {"Authorization": f"Bearer {token}"}

    def _get_json(self, path: str):
        r = self._req.get(f"{self.base}{path}", headers=self.headers, timeout=30)
        r.raise_for_status()
        return r.json()

    def _post_json(self, path: str, body: dict):
        r = self._req.post(f"{self.base}{path}", headers=self.headers, json=body, timeout=15)
        r.raise_for_status()
        return r.json()

    def fetch_queue(self) -> list[dict]:
        return self._get_json("/api/v1/admin/usb/queue")

    def download_package(self, order_id: str) -> bytes:
        r = self._req.get(
            f"{self.base}/api/v1/admin/usb/export/{order_id}",
            headers=self.headers,
            stream=True,
            timeout=600,
        )
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        buf   = io.BytesIO()
        recv  = 0
        for chunk in r.iter_content(chunk_size=256 * 1024):
            buf.write(chunk)
            recv += len(chunk)
            progress_bar(recv, total)
        print()  # newline na voortgangsbalk
        return buf.getvalue()

    def mark_burned(self, order_id: str, note: str = "") -> None:
        self._post_json(f"/api/v1/admin/usb/export/{order_id}/burned", {"note": note})


def extract_to_usb(zip_data: bytes, drive_path: str) -> None:
    info(f"Inhoud uitpakken naar {drive_path}...")
    buf = io.BytesIO(zip_data)
    with zipfile.ZipFile(buf, "r") as zf:
        members = [m for m in zf.namelist() if not m.endswith("/")]
        total   = len(members)
        for i, member in enumerate(members, 1):
            dest = os.path.join(drive_path, member)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with zf.open(member) as src, open(dest, "wb") as dst:
                shutil.copyfileobj(src, dst)
            # Voortgangsbalk per bestand
            filled = int(38 * i / total)
            bar    = "█" * filled + "░" * (38 - filled)
            pct    = 100 * i // total
            print(f"\r  {_CYAN}[{bar}]{_R} {pct:3d}%  {member[-48:]:48}", end="", flush=True)
    print()
    ok(f"{total} bestanden uitgepakt.")


# ─── MODI ─────────────────────────────────────────────────────────────────────

def run_setup_modus() -> None:
    h2("Setup-modus — nieuwe stick inrichten")

    usb = get_usb_drive()
    if not usb:
        err("Geen USB-stick gedetecteerd. Sluit een stick aan en probeer opnieuw.")
        sys.exit(1)

    ok(f"Stick gevonden: {usb}  ({_bytes_to_gb(_free_space(usb))} vrij)")

    if not check_free_space(usb):
        sys.exit(1)

    warn(f"Alles op {usb} wordt gewist en opnieuw ingericht.")
    if input("  Typ 'ja' om door te gaan: ").strip().lower() != "ja":
        print("  Afgebroken.")
        sys.exit(0)

    if format_usb(usb):
        create_structure(usb)
        print_verify_report(usb, "")
        print(
            f"\n  {_GREEN}{_BOLD}Klaar!{_R} Lege structuur aangemaakt.\n"
            "  Gebruik de BRANDEN-modus om de inhoud te plaatsen."
        )


def run_branden_modus() -> None:
    h2("Branden-modus — verhalen van backend ophalen")

    base  = input("  Backend URL (bijv. https://api.bewaardvoorjou.nl): ").strip()
    token = input("  Admin-token (JWT): ").strip()
    client = UsbApiClient(base, token)

    info("Bestellingen ophalen...")
    try:
        queue = client.fetch_queue()
    except Exception as e:
        err(f"Verbinding mislukt: {e}")
        return

    if not queue:
        ok("Geen bestellingen in de wachtrij.")
        return

    # Tabel met bestellingen
    print()
    header = f"  {_BOLD}{'#':<4} {'Naam':<26} {'Pakket':<12} {'Tracks':<7} {'Betaald op'}{_R}"
    print(header)
    print(f"  {'─' * 64}")
    for i, o in enumerate(queue, 1):
        naam    = (o.get("customer_name") or "—")[:25]
        pakket  = o.get("package_type", "?")
        tracks  = o.get("audio_tracks", 0)
        betaald = (o.get("paid_at") or "")[:10]
        print(f"  {_BOLD}{i:<4}{_R} {naam:<26} {pakket:<12} {tracks:<7} {betaald}")

    print()
    while True:
        choice = input("  Welk nummer wil je branden? ('q' = stoppen): ").strip()
        if choice.lower() == "q":
            return
        if choice.isdigit() and 1 <= int(choice) <= len(queue):
            order = queue[int(choice) - 1]
            break
        warn("Voer een geldig nummer in.")

    order_id = order["order_id"]
    naam     = order.get("customer_name") or "klant"
    ok(f"Geselecteerd: {_BOLD}{naam}{_R}  (order {_DIM}{order_id}{_R})")

    usb = get_usb_drive()
    if not usb:
        err("Geen USB-stick gedetecteerd. Sluit een stick aan en probeer opnieuw.")
        return

    ok(f"Stick: {usb}  ({_bytes_to_gb(_free_space(usb))} vrij)")
    warn(f"Alles op {usb} wordt overschreven met de inhoud van {naam}.")
    if input("  Typ 'ja' om door te gaan: ").strip().lower() != "ja":
        print("  Afgebroken.")
        return

    if not format_usb(usb):
        return

    h2("Download")
    info(f"ZIP-pakket ophalen voor {naam}...")
    try:
        zip_data = client.download_package(order_id)
    except Exception as e:
        err(f"Download mislukt: {e}")
        return

    mb = len(zip_data) / 1024 / 1024
    ok(f"{mb:.1f} MB ontvangen.")

    h2("Uitpakken")
    extract_to_usb(zip_data, usb)

    h2("Verificatie")
    print_verify_report(usb, naam)

    note = input("\n  Optionele notitie (bijv. serienummer stick): ").strip()
    try:
        client.mark_burned(order_id, note)
        ok(f"Bestelling {_DIM}{order_id}{_R} gemarkeerd als gebrand.")
    except Exception as e:
        warn(f"Markering mislukt (stick is wél gebrand): {e}")

    print(
        f"\n  {_GREEN}{_BOLD}🎉 Klaar!{_R}  De stick voor {_BOLD}{naam}{_R} is klaar.\n"
        "  Koppel los, plak het etiket en doe in de doos.\n"
    )


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"\n{_BOLD}{'=' * 55}")
    print("  BEWAARDVOORJOU  —  USB AUTOMATION TOOL")
    print(f"{'=' * 55}{_R}")
    print(f"\n  {_DIM}Versie 2.0  |  www.bewaardvoorjou.nl{_R}")
    print()
    print(f"  {_BOLD}[1]{_R}  SETUP     — nieuwe stick formatteren en inrichten")
    print(f"  {_BOLD}[2]{_R}  BRANDEN   — verhalen ophalen en op stick zetten")

    while True:
        keuze = input("\n  Kies 1 of 2: ").strip()
        if keuze == "1":
            run_setup_modus()
            break
        if keuze == "2":
            run_branden_modus()
            break
        warn("Voer 1 of 2 in.")
