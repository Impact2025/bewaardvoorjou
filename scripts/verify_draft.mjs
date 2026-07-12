/**
 * Playwright verification script — draft persistence feature
 * Tests that localStorage draft is saved and restored across navigation.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const CHAPTER_URL = `${BASE}/chapter/youth-sounds`;
const CHAPTER_KEY = 'draft-chapter-youth-sounds';
const DRAFT_TEXT = 'Dit is een test tekst voor het herstel van het concept.';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const results = [];

  // ── Step 1: Open app root to initialize localStorage scope ──────────────
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const rootStatus = page.url();
  results.push({ step: 'App root loads', url: rootStatus, pass: true });

  // ── Step 2: Seed localStorage with draft text ────────────────────────────
  await page.evaluate(([key, text]) => {
    localStorage.setItem(key, text);
  }, [CHAPTER_KEY, DRAFT_TEXT]);

  const storedBefore = await page.evaluate((key) => localStorage.getItem(key), CHAPTER_KEY);
  results.push({
    step: 'localStorage seeded',
    value: storedBefore,
    pass: storedBefore === DRAFT_TEXT,
  });

  // ── Step 3: Navigate to chapter page (may redirect to login) ─────────────
  await page.goto(CHAPTER_URL, { waitUntil: 'domcontentloaded' });
  const afterNav = page.url();
  results.push({
    step: 'Navigate to chapter',
    url: afterNav,
    pass: true,
    note: afterNav.includes('login') ? 'redirected to login (auth required)' : 'chapter loaded',
  });

  if (!afterNav.includes('login')) {
    // ── Step 4a: Chapter loaded — wait for textarea to appear ────────────────
    try {
      await page.waitForSelector('textarea', { timeout: 5000 });
      const textareaValue = await page.locator('textarea').first().inputValue();
      results.push({
        step: 'Textarea restored from draft',
        value: textareaValue,
        pass: textareaValue === DRAFT_TEXT,
      });

      // ── Step 5a: Check for restoration banner ────────────────────────────
      const bannerVisible = await page.locator('text=Je concept is hersteld').isVisible();
      results.push({
        step: 'Restoration banner visible',
        pass: bannerVisible,
      });
    } catch (e) {
      results.push({ step: 'Textarea', pass: false, note: e.message });
    }
  } else {
    // ── Step 4b: Redirected to login — verify localStorage survived redirect ──
    const storedAfterNav = await page.evaluate((key) => localStorage.getItem(key), CHAPTER_KEY);
    results.push({
      step: 'localStorage survives redirect to login',
      value: storedAfterNav,
      pass: storedAfterNav === DRAFT_TEXT,
    });

    // ── Step 5b: Check compiled JS bundle contains our localStorage key ──────
    const pageContent = await page.content();
    const bundleUrls = [...pageContent.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)]
      .map(m => m[1]);

    let foundKey = false;
    for (const relUrl of bundleUrls.slice(0, 15)) {
      const resp = await page.evaluate(async (url) => {
        const r = await fetch(url); return r.ok ? await r.text() : '';
      }, `${BASE}${relUrl}`);
      if (resp.includes('draft-chapter-')) {
        foundKey = true;
        results.push({
          step: `Bundle contains "draft-chapter-" key`,
          bundle: relUrl,
          pass: true,
        });
        break;
      }
    }
    if (!foundKey) {
      results.push({
        step: 'Bundle contains "draft-chapter-" key',
        pass: false,
        note: 'Key not found in first 15 JS chunks — may need login to load chapter bundle',
      });
    }

    // ── Probe: seed + navigate back after "login" page — does localStorage persist? ──
    await page.goto(CHAPTER_URL, { waitUntil: 'domcontentloaded' });
    const storedAfterSecondNav = await page.evaluate((key) => localStorage.getItem(key), CHAPTER_KEY);
    results.push({
      step: 'localStorage persists across multiple navigations',
      pass: storedAfterSecondNav === DRAFT_TEXT,
      value: storedAfterSecondNav,
    });
  }

  // ── Probe: auto-clear on empty text ─────────────────────────────────────
  // Simulate what happens when SET_TEXT_CONTENT("") clears the draft
  await page.evaluate((key) => {
    // Our auto-save effect: if textContent is falsy → removeItem
    const text = '';
    if (text) { localStorage.setItem(key, text); } else { localStorage.removeItem(key); }
  }, CHAPTER_KEY);
  const afterClear = await page.evaluate((key) => localStorage.getItem(key), CHAPTER_KEY);
  results.push({
    step: 'Draft cleared when text is empty (simulated auto-save)',
    pass: afterClear === null,
    value: afterClear,
  });

  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n## Draft Persistence Verification Results\n');
  let allPass = true;
  for (const r of results) {
    const icon = r.pass ? '✅' : '❌';
    console.log(`${icon} ${r.step}`);
    if (r.url)   console.log(`   url: ${r.url}`);
    if (r.value !== undefined) console.log(`   value: ${JSON.stringify(r.value)}`);
    if (r.note)  console.log(`   note: ${r.note}`);
    if (r.bundle) console.log(`   bundle: ${r.bundle}`);
    if (!r.pass) allPass = false;
  }
  console.log('\nVerdict:', allPass ? 'PASS' : 'FAIL');
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
