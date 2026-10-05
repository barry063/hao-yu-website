/** Behaviour regressions against the real enhancement script; not a browser QA substitute. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

function element(attributes = {}) {
  const listeners = new Map();
  const classes = new Set();
  return { hidden: true, inert: false, listeners, focusCalls: [], scrollCalls: [],
    classList: { add: name => classes.add(name), contains: name => classes.has(name),
      toggle: (name, on) => { if(on) classes.add(name); else classes.delete(name); } },
    setAttribute: (key, value) => { attributes[key] = value; },
    getAttribute: key => attributes[key] ?? null,
    hasAttribute: key => key in attributes,
    addEventListener: (name, fn) => { listeners.set(name, [...(listeners.get(name) || []), fn]); },
    dispatch(name, event = {}) { for (const fn of listeners.get(name) || []) fn(event); },
    focus(options) { this.focusCalls.push(options); },
    scrollIntoView(options) { this.scrollCalls.push(options); },
  };
}
function setup(isMobile = true, isReduced = false) {
  const toggle = element({ 'aria-expanded': 'false' });
  const header = element(), nav = element(), main = element({ tabindex: '-1' }), projects = element();
  const skip = element({ href: '#main' }), link = element({ href: '#projects' });
  const mobile = { matches: isMobile, addEventListener(name, fn) { this.change = fn; } };
  const motion = { matches: isReduced };
  const doc = element();
  const body = element(), html = element(), year = {};
  nav.querySelectorAll = () => [link];
  Object.assign(doc, { body, documentElement: html,
    querySelector: name => ({ '.site-header': header, '.nav-toggle': toggle }[name]),
    getElementById: id => ({ 'site-nav': nav, main, projects, year }[id]),
    querySelectorAll: () => [skip, link],
  });
  const history = [];
  const window = { matchMedia: query => query.includes('880') ? mobile : motion,
    history: { pushState: (...args) => history.push(args) }, scrollY: 0,
    addEventListener() {}, requestAnimationFrame: fn => fn() };
  vm.runInNewContext(script, { document: doc, window, Date });
  return { toggle, nav, main, projects, skip, link, mobile, motion, doc, body, history };
}
function click(link, modifiers = {}) {
  const event = { button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...modifiers };
  link.dispatch('click', event);
  return event;
}

test('collapsed mobile navigation is inert and menu click opens it', () => {
  const s = setup();
  assert.equal(s.nav.inert, true); assert.equal(s.toggle.hidden, false);
  s.toggle.dispatch('click');
  assert.equal(s.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(s.nav.inert, false); assert.equal(s.body.classList.contains('nav-open'), true);
});
test('Escape closes mobile navigation, unlocks scrolling and restores toggle focus', () => {
  const s = setup(); s.toggle.dispatch('click'); s.doc.dispatch('keydown', { key: 'Escape' });
  assert.equal(s.nav.inert, true); assert.equal(s.body.classList.contains('nav-open'), false);
  assert.equal(s.toggle.getAttribute('aria-expanded'), 'false'); assert.equal(s.toggle.focusCalls.length, 1);
});
test('switching to desktop releases scroll lock and restores navigation', () => {
  const s = setup(); s.toggle.dispatch('click'); s.mobile.matches = false; s.mobile.change();
  assert.equal(s.toggle.hidden, true); assert.equal(s.nav.inert, false);
  assert.equal(s.body.classList.contains('nav-open'), false);
});
test('section selection closes menu and moves focus to a scroll target', () => {
  const s = setup(); s.toggle.dispatch('click'); const e = click(s.link);
  assert.equal(e.defaultPrevented, true); assert.equal(s.nav.inert, true);
  assert.equal(s.projects.focusCalls.length, 1); assert.equal(s.projects.getAttribute('tabindex'), '-1');
  assert.equal(s.projects.scrollCalls[0].behavior, 'smooth'); assert.equal(s.history[0][2], '#projects');
});
test('skip link focuses main and reduced motion uses instant scrolling', () => {
  const s = setup(false, true); click(s.skip);
  assert.equal(s.main.focusCalls.length, 1); assert.equal(s.main.scrollCalls[0].behavior, 'instant');
});
test('modified click retains native browser link behaviour', () => {
  const s = setup(false); const e = click(s.skip, { ctrlKey: true });
  assert.equal(e.defaultPrevented, false); assert.equal(s.main.scrollCalls.length, 0);
});
test('click outside header closes an open menu', () => {
  const s = setup(); s.toggle.dispatch('click'); s.doc.dispatch('click', { target: { closest: () => null } });
  assert.equal(s.nav.inert, true); assert.equal(s.toggle.getAttribute('aria-expanded'), 'false');
});
