"""
Unit tests voor de idempotente KB-interne-link injector.

Draait zonder database of API — pure string-logica, dus altijd lokaal
uitvoerbaar (net als Bijeen's tsc-typecheck als bewijs).

    cd life-journey-backend && python -m pytest tests/test_kb_internal_links.py -q
"""
from app.lib.kb_internal_links import (
    KB_ANCHORS,
    KbAnchor,
    count_kb_links,
    inject_kb_internal_links,
)


def test_linkt_phrase_in_paragraaf():
    html = "<p>Ik maak een gratis account aan vandaag.</p>"
    out = inject_kb_internal_links(html, exclude_slug="x")
    assert 'href="/kennisbank/hoe-maak-ik-een-gratis-account-aan"' in out
    assert "gratis account" in out


def test_respecteert_woordgrenzen():
    # "servers" mag niet matchen binnen "webservers"
    html = "<p>Onze webservers draaien in de cloud, niet op Nederlandse servers.</p>"
    out = inject_kb_internal_links(html, exclude_slug="x")
    assert out.count('href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers"') == 1


def test_slaat_al_gelinkt_doel_over_idempotent():
    # Doel al gelinkt in dezelfde paragraaf → geen dubbele link
    html = (
        '<p>Zie <a href="/kennisbank/ai-x">de AI-interviewer</a> '
        "en nogmaals de AI-interviewer hier.</p>"
    )
    out = inject_kb_internal_links(html, exclude_slug="x")
    assert out.count('href="/kennisbank/wat-doet-de-ai-interviewer-precies"') == 1


def test_heroep_is_idempotent_tweede_run_verandert_niets():
    html = "<p>Maak een gratis account aan en gebruik de AI-interviewer.</p>"
    once = inject_kb_internal_links(html, exclude_slug="x")
    twice = inject_kb_internal_links(once, exclude_slug="x")
    assert once == twice, "tweede run mag niets veranderen"


def test_exclude_eigen_slug():
    html = "<p>Maak een gratis account aan.</p>"
    out = inject_kb_internal_links(html, exclude_slug="hoe-maak-ik-een-gratis-account-aan")
    assert "href" not in out


def test_linkt_alleen_in_p_en_li_niet_in_h2():
    html = (
        "<h2>gratis account aanmaken</h2>"
        "<p>Hier een gratis account voor jezelf.</p>"
    )
    out = inject_kb_internal_links(html, exclude_slug="x")
    assert 'href="/kennisbank/hoe-maak-ik-een-gratis-account-aan"' not in out.split("</h2>")[0]
    assert 'href="/kennisbank/hoe-maak-ik-een-gratis-account-aan"' in out


def test_require_gate_voorkomt_valse_positief():
    # "opzeggen" zonder "abonnement" mag niet linken naar opzeggen-artikel
    html = "<p>Ik wil mijn lidmaatschap opzeggen.</p>"
    out = inject_kb_internal_links(html, exclude_slug="x")
    assert 'href="/kennisbank/hoe-kan-ik-mijn-abonnement-opzeggen"' not in out


def test_count_kb_links():
    html = (
        '<p><a href="/kennisbank/a">x</a> en <a href="/kennisbank/b">y</a></p>'
    )
    assert count_kb_links(html) == 2
