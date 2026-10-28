const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const read = file => fs.readFileSync(`public/${file}`, 'utf8');
const html = read('index.html');
const videos = [...html.matchAll(/href="player.html\?v=([^"]+)"/g)].map(match => match[1]);

function page(video, { stored = null, blocked = false } = {}) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, { hidden: true, textContent: '', href: '' });
    return elements.get(id);
  }
  const handlers = {};
  let saved = stored;
  const context = vm.createContext({
    URL, URLSearchParams,
    location: { search: video === undefined ? '' : `?v=${encodeURIComponent(video)}` },
    document: {
      title: '', getElementById: element,
      querySelector: element,
      querySelectorAll: () => videos.map(id => ({ href: `http://localhost/player.html?v=${id}` })),
    },
    window: { addEventListener: (event, handler) => { handlers[event] = handler; } },
    localStorage: {
      getItem: () => { if (blocked) throw new Error('Storage unavailable'); return saved; },
      setItem: (key, value) => { if (blocked) throw new Error('Storage unavailable'); saved = value; },
    },
  });
  vm.runInContext(read('js/history.js'), context);
  return { context, element, handlers, saved: () => saved };
}

test('catalogue has eleven ordered chapters and no repeated cover descriptions', () => {
  assert.equal(videos.length, 11);
  assert.equal(new Set(videos).size, 11);
  assert.match(html, /<ol class="livros-grid"/);
  assert.equal((html.match(/<li class="livro">/g) || []).length, 11);
  for (let number = 1; number <= 11; number++) assert.match(html, new RegExp(`Ouvir capítulo ${number}\\s*<`));
  assert.doesNotMatch(html, /alt="Capa/);
});

test('every chapter links only to valid neighbours and saves the accessed chapter', () => {
  videos.forEach((video, index) => {
    const state = page(video);
    vm.runInContext(read('js/player.js'), state.context);
    assert.equal(state.saved(), video);
    assert.match(state.element('titulo').textContent, new RegExp(`Capítulo ${index + 1}$`));
    assert.equal(state.element('anterior').hidden, index === 0);
    assert.equal(state.element('proximo').hidden, index === 10);
    if (index > 0) assert.equal(new URL(state.element('anterior').href, 'http://localhost').searchParams.get('v'), videos[index - 1]);
    if (index < 10) assert.equal(new URL(state.element('proximo').href, 'http://localhost').searchParams.get('v'), videos[index + 1]);
    assert.match(state.element('player').src, /autoplay=0/);
    assert.equal(state.element('.video-box').hidden, false);
  });
});

test('missing or invalid chapter hides the player and preserves history', () => {
  for (const video of [undefined, '', 'invalid', '<script>']) {
    const state = page(video, { stored: videos[4] });
    vm.runInContext(read('js/player.js'), state.context);
    assert.equal(state.element('.video-box').hidden, true);
    assert.equal(state.element('titulo').textContent, 'Capítulo não encontrado');
    assert.equal(state.saved(), videos[4]);
  }
});

test('continue listening handles empty, corrupt and blocked storage and refreshes on return', () => {
  for (const options of [{}, { stored: 'invalid' }, { stored: '1' }, { blocked: true }, { stored: videos[7] }]) {
    const state = page(videos[0], options);
    vm.runInContext(read('js/home.js'), state.context);
    assert.equal(state.element('continuar').hidden, options.stored !== videos[7]);
    if (options.stored === videos[7]) {
      assert.equal(state.element('continuar-link').textContent, 'Continuar ouvindo: capítulo 8');
      vm.runInContext(`listeningHistory.save('${videos[10]}')`, state.context);
      state.handlers.pageshow();
      assert.equal(state.element('continuar-link').textContent, 'Continuar ouvindo: capítulo 11');
    }
  }
  const state = page(videos[0], { blocked: true });
  assert.doesNotThrow(() => vm.runInContext(read('js/player.js'), state.context));
  assert.equal(state.element('.video-box').hidden, false);
});
