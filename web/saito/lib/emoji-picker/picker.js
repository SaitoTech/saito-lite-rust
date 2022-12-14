import Database from './database.js';

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}
function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map((parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        mount_component(component, options.target, undefined, undefined);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

// via https://unpkg.com/browse/emojibase-data@6.0.0/meta/groups.json
const allGroups = [
  [-1, '✨', 'custom'],
  [0, '😀', 'smileys-emotion'],
  [1, '👋', 'people-body'],
  [3, '🐱', 'animals-nature'],
  [4, '🍎', 'food-drink'],
  [5, '🏠️', 'travel-places'],
  [6, '⚽', 'activities'],
  [7, '📝', 'objects'],
  [8, '⛔️', 'symbols'],
  [9, '🏁', 'flags']
].map(([id, emoji, name]) => ({ id, emoji, name }));

const groups = allGroups.slice(1);
const customGroup = allGroups[0];

const MIN_SEARCH_TEXT_LENGTH = 2;
const NUM_SKIN_TONES = 6;

/* istanbul ignore next */
const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout;

// check for ZWJ (zero width joiner) character
function hasZwj (emoji) {
  return emoji.unicode.includes('\u200d')
}

// Find one good representative emoji from each version to test by checking its color.
// Ideally it should have color in the center. For some inspiration, see:
// https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
//
// Note that for certain versions (12.1, 13.1), there is no point in testing them explicitly, because
// all the emoji from this version are compound-emoji from previous versions. So they would pass a color
// test, even in browsers that display them as double emoji. (E.g. "face in clouds" might render as
// "face without mouth" plus "fog".) These emoji can only be filtered using the width test,
// which happens in checkZwjSupport.js.
const versionsAndTestEmoji = {
  '🫠': 14,
  '🥲': 13.1, // smiling face with tear, technically from v13 but see note above
  '🥻': 12.1, // sari, technically from v12 but see note above
  '🥰': 11,
  '🤩': 5,
  '👱‍♀️': 4,
  '🤣': 3,
  '👁️‍🗨️': 2,
  '😀': 1,
  '😐️': 0.7,
  '😃': 0.6
};

const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000; // 1 second
const DEFAULT_SKIN_TONE_EMOJI = '🖐️';
const DEFAULT_NUM_COLUMNS = 8;

// Based on https://fivethirtyeight.com/features/the-100-most-used-emojis/ and
// https://blog.emojipedia.org/facebook-reveals-most-and-least-used-emojis/ with
// a bit of my own curation. (E.g. avoid the "OK" gesture because of connotations:
// https://emojipedia.org/ok-hand/)
const MOST_COMMONLY_USED_EMOJI = [
  '😊',
  '😒',
  '♥️',
  '👍️',
  '😍',
  '😂',
  '😭',
  '☺️',
  '😔',
  '😩',
  '😏',
  '💕',
  '🙌',
  '😘'
];

// It's important to list Twemoji Mozilla before everything else, because Mozilla bundles their
// own font on some platforms (notably Windows and Linux as of this writing). Typically Mozilla
// updates faster than the underlying OS, and we don't want to render older emoji in one font and
// newer emoji in another font:
// https://github.com/nolanlawson/emoji-picker-element/pull/268#issuecomment-1073347283
const FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",' +
  '"Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif';

/* istanbul ignore next */
const DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// Test if an emoji is supported by rendering it to canvas and checking that the color is not black

const getTextFeature = (text, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = `100px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.scale(0.01, 0.01);
  ctx.fillText(text, 0, 0);

  return ctx.getImageData(0, 0, 1, 1).data
};

const compareFeatures = (feature1, feature2) => {
  const feature1Str = [...feature1].join(',');
  const feature2Str = [...feature2].join(',');
  // This is RGBA, so for 0,0,0, we are checking that the first RGB is not all zeroes.
  // Most of the time when unsupported this is 0,0,0,0, but on Chrome on Mac it is
  // 0,0,0,61 - there is a transparency here.
  return feature1Str === feature2Str && !feature1Str.startsWith('0,0,0,')
};

function testColorEmojiSupported (text) {
  // Render white and black and then compare them to each other and ensure they're the same
  // color, and neither one is black. This shows that the emoji was rendered in color.
  const feature1 = getTextFeature(text, '#000');
  const feature2 = getTextFeature(text, '#fff');
  return feature1 && feature2 && compareFeatures(feature1, feature2)
}

// rather than check every emoji ever, which would be expensive, just check some representatives from the

function determineEmojiSupportLevel () {
  const entries = Object.entries(versionsAndTestEmoji);
  try {
    // start with latest emoji and work backwards
    for (const [emoji, version] of entries) {
      if (testColorEmojiSupported(emoji)) {
        return version
      }
    }
  } catch (e) { // canvas error
  } finally {
  }
  // In case of an error, be generous and just assume all emoji are supported (e.g. for canvas errors
  // due to anti-fingerprinting add-ons). Better to show some gray boxes than nothing at all.
  return entries[0][1] // first one in the list is the most recent version
}

// Check which emojis we know for sure aren't supported, based on Unicode version level
const emojiSupportLevelPromise = new Promise(resolve => (
  rIC(() => (
    resolve(determineEmojiSupportLevel()) // delay so ideally this can run while IDB is first populating
  ))
));
// determine which emojis containing ZWJ (zero width joiner) characters
// are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
const supportedZwjEmojis = new Map();

const VARIATION_SELECTOR = '\ufe0f';
const SKINTONE_MODIFIER = '\ud83c';
const ZWJ = '\u200d';
const LIGHT_SKIN_TONE = 0x1F3FB;
const LIGHT_SKIN_TONE_MODIFIER = 0xdffb;

// TODO: this is a naive implementation, we can improve it later
// It's only used for the skintone picker, so as long as people don't customize with
// really exotic emoji then it should work fine
function applySkinTone (str, skinTone) {
  if (skinTone === 0) {
    return str
  }
  const zwjIndex = str.indexOf(ZWJ);
  if (zwjIndex !== -1) {
    return str.substring(0, zwjIndex) +
      String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) +
      str.substring(zwjIndex)
  }
  if (str.endsWith(VARIATION_SELECTOR)) {
    str = str.substring(0, str.length - 1);
  }
  return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1)
}

function halt (event) {
  event.preventDefault();
  event.stopPropagation();
}

// Implementation left/right or up/down navigation, circling back when you
// reach the start/end of the list
function incrementOrDecrement (decrement, val, arr) {
  val += (decrement ? -1 : 1);
  if (val < 0) {
    val = arr.length - 1;
  } else if (val >= arr.length) {
    val = 0;
  }
  return val
}

// like lodash's uniqBy but much smaller
function uniqBy (arr, func) {
  const set = new Set();
  const res = [];
  for (const item of arr) {
    const key = func(item);
    if (!set.has(key)) {
      set.add(key);
      res.push(item);
    }
  }
  return res
}

// We don't need all the data on every emoji, and there are specific things we need
// for the UI, so build a "view model" from the emoji object we got from the database

function summarizeEmojisForUI (emojis, emojiSupportLevel) {
  const toSimpleSkinsMap = skins => {
    const res = {};
    for (const skin of skins) {
      // ignore arrays like [1, 2] with multiple skin tones
      // also ignore variants that are in an unsupported emoji version
      // (these do exist - variants from a different version than their base emoji)
      if (typeof skin.tone === 'number' && skin.version <= emojiSupportLevel) {
        res[skin.tone] = skin.unicode;
      }
    }
    return res
  };

  return emojis.map(({ unicode, skins, shortcodes, url, name, category }) => ({
    unicode,
    name,
    shortcodes,
    url,
    category,
    id: unicode || name,
    skins: skins && toSimpleSkinsMap(skins),
    title: (shortcodes || []).join(', ')
  }))
}

// import rAF from one place so that the bundle size is a bit smaller
const rAF = requestAnimationFrame;

// Svelte action to calculate the width of an element and auto-update

let resizeObserverSupported = typeof ResizeObserver === 'function';

function calculateWidth (node, onUpdate) {
  let resizeObserver;
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver(entries => (
      onUpdate(entries[0].contentRect.width)
    ));
    resizeObserver.observe(node);
  } else { // just set the width once, don't bother trying to track it
    rAF(() => (
      onUpdate(node.getBoundingClientRect().width)
    ));
  }

  // cleanup function (called on destroy)
  return {
    destroy () {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    }
  }
}

// get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
function calculateTextWidth (node) {
  /* istanbul ignore else */
  {
    const range = document.createRange();
    range.selectNode(node.firstChild);
    return range.getBoundingClientRect().width
  }
}

let baselineEmojiWidth;

function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji);
    const emojiWidth = calculateTextWidth(domNode);
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji);
    }
    // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
    // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
    // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
    // So here we set the threshold at 1.8 times the size of the baseline emoji.
    const supported = emojiWidth / 1.8 < baselineEmojiWidth;
    supportedZwjEmojis.set(emoji.unicode, supported);
  }
}

// Measure after style/layout are complete

const requestPostAnimationFrame = callback => {
  rAF(() => {
    setTimeout(callback);
  });
};

// like lodash's uniq

function uniq (arr) {
  return uniqBy(arr, _ => _)
}

/* src/picker/components/Picker/Picker.svelte generated by Svelte v3.49.0 */

const { Map: Map_1 } = globals;

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[63] = list[i];
	child_ctx[65] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[66] = list[i];
	child_ctx[65] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[63] = list[i];
	child_ctx[65] = i;
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[69] = list[i];
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[72] = list[i];
	child_ctx[65] = i;
	return child_ctx;
}

// (43:38) {#each skinTones as skinTone, i (skinTone)}
function create_each_block_4(key_1, ctx) {
	let div;
	let t_value = /*skinTone*/ ctx[72] + "";
	let t;
	let div_id_value;
	let div_class_value;
	let div_aria_selected_value;
	let div_title_value;
	let div_aria_label_value;

	return {
		key: key_1,
		first: null,
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "id", div_id_value = "skintone-" + /*i*/ ctx[65]);

			attr(div, "class", div_class_value = "emoji hide-focus " + (/*i*/ ctx[65] === /*activeSkinTone*/ ctx[20]
			? 'active'
			: ''));

			attr(div, "aria-selected", div_aria_selected_value = /*i*/ ctx[65] === /*activeSkinTone*/ ctx[20]);
			attr(div, "role", "option");
			attr(div, "title", div_title_value = /*i18n*/ ctx[0].skinTones[/*i*/ ctx[65]]);
			attr(div, "tabindex", "-1");
			attr(div, "aria-label", div_aria_label_value = /*i18n*/ ctx[0].skinTones[/*i*/ ctx[65]]);
			this.first = div;
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*skinTones*/ 512 && t_value !== (t_value = /*skinTone*/ ctx[72] + "")) set_data(t, t_value);

			if (dirty[0] & /*skinTones*/ 512 && div_id_value !== (div_id_value = "skintone-" + /*i*/ ctx[65])) {
				attr(div, "id", div_id_value);
			}

			if (dirty[0] & /*skinTones, activeSkinTone*/ 1049088 && div_class_value !== (div_class_value = "emoji hide-focus " + (/*i*/ ctx[65] === /*activeSkinTone*/ ctx[20]
			? 'active'
			: ''))) {
				attr(div, "class", div_class_value);
			}

			if (dirty[0] & /*skinTones, activeSkinTone*/ 1049088 && div_aria_selected_value !== (div_aria_selected_value = /*i*/ ctx[65] === /*activeSkinTone*/ ctx[20])) {
				attr(div, "aria-selected", div_aria_selected_value);
			}

			if (dirty[0] & /*i18n, skinTones*/ 513 && div_title_value !== (div_title_value = /*i18n*/ ctx[0].skinTones[/*i*/ ctx[65]])) {
				attr(div, "title", div_title_value);
			}

			if (dirty[0] & /*i18n, skinTones*/ 513 && div_aria_label_value !== (div_aria_label_value = /*i18n*/ ctx[0].skinTones[/*i*/ ctx[65]])) {
				attr(div, "aria-label", div_aria_label_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (53:33) {#each groups as group (group.id)}
function create_each_block_3(key_1, ctx) {
	let button;
	let div;
	let t_value = /*group*/ ctx[69].emoji + "";
	let t;
	let button_aria_controls_value;
	let button_aria_label_value;
	let button_aria_selected_value;
	let button_title_value;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[49](/*group*/ ctx[69]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			button = element("button");
			div = element("div");
			t = text(t_value);
			attr(div, "class", "nav-emoji emoji");
			attr(button, "role", "tab");
			attr(button, "class", "nav-button");
			attr(button, "aria-controls", button_aria_controls_value = "tab-" + /*group*/ ctx[69].id);
			attr(button, "aria-label", button_aria_label_value = /*i18n*/ ctx[0].categories[/*group*/ ctx[69].name]);
			attr(button, "aria-selected", button_aria_selected_value = !/*searchMode*/ ctx[4] && /*currentGroup*/ ctx[13].id === /*group*/ ctx[69].id);
			attr(button, "title", button_title_value = /*i18n*/ ctx[0].categories[/*group*/ ctx[69].name]);
			this.first = button;
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, div);
			append(div, t);

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*groups*/ 4096 && t_value !== (t_value = /*group*/ ctx[69].emoji + "")) set_data(t, t_value);

			if (dirty[0] & /*groups*/ 4096 && button_aria_controls_value !== (button_aria_controls_value = "tab-" + /*group*/ ctx[69].id)) {
				attr(button, "aria-controls", button_aria_controls_value);
			}

			if (dirty[0] & /*i18n, groups*/ 4097 && button_aria_label_value !== (button_aria_label_value = /*i18n*/ ctx[0].categories[/*group*/ ctx[69].name])) {
				attr(button, "aria-label", button_aria_label_value);
			}

			if (dirty[0] & /*searchMode, currentGroup, groups*/ 12304 && button_aria_selected_value !== (button_aria_selected_value = !/*searchMode*/ ctx[4] && /*currentGroup*/ ctx[13].id === /*group*/ ctx[69].id)) {
				attr(button, "aria-selected", button_aria_selected_value);
			}

			if (dirty[0] & /*i18n, groups*/ 4097 && button_title_value !== (button_title_value = /*i18n*/ ctx[0].categories[/*group*/ ctx[69].name])) {
				attr(button, "title", button_title_value);
			}
		},
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

// (93:100) {:else}
function create_else_block_1(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			attr(img, "class", "custom-emoji");
			if (!src_url_equal(img.src, img_src_value = /*emoji*/ ctx[63].url)) attr(img, "src", img_src_value);
			attr(img, "alt", "");
			attr(img, "loading", "lazy");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && !src_url_equal(img.src, img_src_value = /*emoji*/ ctx[63].url)) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (93:40) {#if emoji.unicode}
function create_if_block_1(ctx) {
	let t_value = /*unicodeWithSkin*/ ctx[27](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]) + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*currentEmojisWithCategories, currentSkinTone*/ 33024 && t_value !== (t_value = /*unicodeWithSkin*/ ctx[27](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (88:53) {#each emojiWithCategory.emojis as emoji, i (emoji.id)}
function create_each_block_2(key_1, ctx) {
	let button;
	let button_role_value;
	let button_aria_selected_value;
	let button_aria_label_value;
	let button_title_value;
	let button_class_value;
	let button_id_value;

	function select_block_type(ctx, dirty) {
		if (/*emoji*/ ctx[63].unicode) return create_if_block_1;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		key: key_1,
		first: null,
		c() {
			button = element("button");
			if_block.c();
			attr(button, "role", button_role_value = /*searchMode*/ ctx[4] ? 'option' : 'menuitem');

			attr(button, "aria-selected", button_aria_selected_value = /*searchMode*/ ctx[4]
			? /*i*/ ctx[65] == /*activeSearchItem*/ ctx[5]
			: '');

			attr(button, "aria-label", button_aria_label_value = /*labelWithSkin*/ ctx[28](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]));
			attr(button, "title", button_title_value = /*emoji*/ ctx[63].title);

			attr(button, "class", button_class_value = "emoji " + (/*searchMode*/ ctx[4] && /*i*/ ctx[65] === /*activeSearchItem*/ ctx[5]
			? 'active'
			: ''));

			attr(button, "id", button_id_value = "emo-" + /*emoji*/ ctx[63].id);
			this.first = button;
		},
		m(target, anchor) {
			insert(target, button, anchor);
			if_block.m(button, null);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(button, null);
				}
			}

			if (dirty[0] & /*searchMode*/ 16 && button_role_value !== (button_role_value = /*searchMode*/ ctx[4] ? 'option' : 'menuitem')) {
				attr(button, "role", button_role_value);
			}

			if (dirty[0] & /*searchMode, currentEmojisWithCategories, activeSearchItem*/ 32816 && button_aria_selected_value !== (button_aria_selected_value = /*searchMode*/ ctx[4]
			? /*i*/ ctx[65] == /*activeSearchItem*/ ctx[5]
			: '')) {
				attr(button, "aria-selected", button_aria_selected_value);
			}

			if (dirty[0] & /*currentEmojisWithCategories, currentSkinTone*/ 33024 && button_aria_label_value !== (button_aria_label_value = /*labelWithSkin*/ ctx[28](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]))) {
				attr(button, "aria-label", button_aria_label_value);
			}

			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && button_title_value !== (button_title_value = /*emoji*/ ctx[63].title)) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*searchMode, currentEmojisWithCategories, activeSearchItem*/ 32816 && button_class_value !== (button_class_value = "emoji " + (/*searchMode*/ ctx[4] && /*i*/ ctx[65] === /*activeSearchItem*/ ctx[5]
			? 'active'
			: ''))) {
				attr(button, "class", button_class_value);
			}

			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && button_id_value !== (button_id_value = "emo-" + /*emoji*/ ctx[63].id)) {
				attr(button, "id", button_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(button);
			if_block.d();
		}
	};
}

// (69:36) {#each currentEmojisWithCategories as emojiWithCategory, i (emojiWithCategory.category)}
function create_each_block_1(key_1, ctx) {
	let div0;

	let t_value = (/*searchMode*/ ctx[4]
	? /*i18n*/ ctx[0].searchResultsLabel
	: /*emojiWithCategory*/ ctx[66].category
		? /*emojiWithCategory*/ ctx[66].category
		: /*currentEmojisWithCategories*/ ctx[15].length > 1
			? /*i18n*/ ctx[0].categories.custom
			: /*i18n*/ ctx[0].categories[/*currentGroup*/ ctx[13].name]) + "";

	let t;
	let div0_id_value;
	let div0_class_value;
	let div1;
	let each_blocks = [];
	let each_1_lookup = new Map_1();
	let div1_role_value;
	let div1_aria_labelledby_value;
	let div1_id_value;
	let each_value_2 = /*emojiWithCategory*/ ctx[66].emojis;
	const get_key = ctx => /*emoji*/ ctx[63].id;

	for (let i = 0; i < each_value_2.length; i += 1) {
		let child_ctx = get_each_context_2(ctx, each_value_2, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
	}

	return {
		key: key_1,
		first: null,
		c() {
			div0 = element("div");
			t = text(t_value);
			div1 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "id", div0_id_value = "menu-label-" + /*i*/ ctx[65]);

			attr(div0, "class", div0_class_value = "category " + (/*currentEmojisWithCategories*/ ctx[15].length === 1 && /*currentEmojisWithCategories*/ ctx[15][0].category === ''
			? 'gone'
			: ''));

			attr(div0, "aria-hidden", "true");
			attr(div1, "class", "emoji-menu");
			attr(div1, "role", div1_role_value = /*searchMode*/ ctx[4] ? 'listbox' : 'menu');
			attr(div1, "aria-labelledby", div1_aria_labelledby_value = "menu-label-" + /*i*/ ctx[65]);
			attr(div1, "id", div1_id_value = /*searchMode*/ ctx[4] ? 'search-results' : '');
			this.first = div0;
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, t);
			insert(target, div1, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div1, null);
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*searchMode, i18n, currentEmojisWithCategories, currentGroup*/ 40977 && t_value !== (t_value = (/*searchMode*/ ctx[4]
			? /*i18n*/ ctx[0].searchResultsLabel
			: /*emojiWithCategory*/ ctx[66].category
				? /*emojiWithCategory*/ ctx[66].category
				: /*currentEmojisWithCategories*/ ctx[15].length > 1
					? /*i18n*/ ctx[0].categories.custom
					: /*i18n*/ ctx[0].categories[/*currentGroup*/ ctx[13].name]) + "")) set_data(t, t_value);

			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && div0_id_value !== (div0_id_value = "menu-label-" + /*i*/ ctx[65])) {
				attr(div0, "id", div0_id_value);
			}

			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && div0_class_value !== (div0_class_value = "category " + (/*currentEmojisWithCategories*/ ctx[15].length === 1 && /*currentEmojisWithCategories*/ ctx[15][0].category === ''
			? 'gone'
			: ''))) {
				attr(div0, "class", div0_class_value);
			}

			if (dirty[0] & /*searchMode, currentEmojisWithCategories, activeSearchItem, labelWithSkin, currentSkinTone, unicodeWithSkin*/ 402686256) {
				each_value_2 = /*emojiWithCategory*/ ctx[66].emojis;
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div1, destroy_block, create_each_block_2, null, get_each_context_2);
			}

			if (dirty[0] & /*searchMode*/ 16 && div1_role_value !== (div1_role_value = /*searchMode*/ ctx[4] ? 'listbox' : 'menu')) {
				attr(div1, "role", div1_role_value);
			}

			if (dirty[0] & /*currentEmojisWithCategories*/ 32768 && div1_aria_labelledby_value !== (div1_aria_labelledby_value = "menu-label-" + /*i*/ ctx[65])) {
				attr(div1, "aria-labelledby", div1_aria_labelledby_value);
			}

			if (dirty[0] & /*searchMode*/ 16 && div1_id_value !== (div1_id_value = /*searchMode*/ ctx[4] ? 'search-results' : '')) {
				attr(div1, "id", div1_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

// (102:94) {:else}
function create_else_block(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			attr(img, "class", "custom-emoji");
			if (!src_url_equal(img.src, img_src_value = /*emoji*/ ctx[63].url)) attr(img, "src", img_src_value);
			attr(img, "alt", "");
			attr(img, "loading", "lazy");
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*currentFavorites*/ 1024 && !src_url_equal(img.src, img_src_value = /*emoji*/ ctx[63].url)) {
				attr(img, "src", img_src_value);
			}
		},
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (102:34) {#if emoji.unicode}
function create_if_block(ctx) {
	let t_value = /*unicodeWithSkin*/ ctx[27](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]) + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*currentFavorites, currentSkinTone*/ 1280 && t_value !== (t_value = /*unicodeWithSkin*/ ctx[27](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (98:102) {#each currentFavorites as emoji, i (emoji.id)}
function create_each_block(key_1, ctx) {
	let button;
	let button_aria_label_value;
	let button_title_value;
	let button_id_value;

	function select_block_type_1(ctx, dirty) {
		if (/*emoji*/ ctx[63].unicode) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		key: key_1,
		first: null,
		c() {
			button = element("button");
			if_block.c();
			attr(button, "role", "menuitem");
			attr(button, "aria-label", button_aria_label_value = /*labelWithSkin*/ ctx[28](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]));
			attr(button, "title", button_title_value = /*emoji*/ ctx[63].title);
			attr(button, "class", "emoji");
			attr(button, "id", button_id_value = "fav-" + /*emoji*/ ctx[63].id);
			this.first = button;
		},
		m(target, anchor) {
			insert(target, button, anchor);
			if_block.m(button, null);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(button, null);
				}
			}

			if (dirty[0] & /*currentFavorites, currentSkinTone*/ 1280 && button_aria_label_value !== (button_aria_label_value = /*labelWithSkin*/ ctx[28](/*emoji*/ ctx[63], /*currentSkinTone*/ ctx[8]))) {
				attr(button, "aria-label", button_aria_label_value);
			}

			if (dirty[0] & /*currentFavorites*/ 1024 && button_title_value !== (button_title_value = /*emoji*/ ctx[63].title)) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*currentFavorites*/ 1024 && button_id_value !== (button_id_value = "fav-" + /*emoji*/ ctx[63].id)) {
				attr(button, "id", button_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(button);
			if_block.d();
		}
	};
}

function create_fragment(ctx) {
	let section;
	let div0;
	let div4;
	let div1;
	let input;
	let input_placeholder_value;
	let input_aria_expanded_value;
	let input_aria_activedescendant_value;
	let label;
	let t0_value = /*i18n*/ ctx[0].searchLabel + "";
	let t0;
	let span0;
	let t1_value = /*i18n*/ ctx[0].searchDescription + "";
	let t1;
	let div2;
	let button0;
	let t2;
	let button0_class_value;
	let div2_class_value;
	let span1;
	let t3_value = /*i18n*/ ctx[0].skinToneDescription + "";
	let t3;
	let div3;
	let each_blocks_3 = [];
	let each0_lookup = new Map_1();
	let div3_class_value;
	let div3_aria_label_value;
	let div3_aria_activedescendant_value;
	let div3_aria_hidden_value;
	let div5;
	let each_blocks_2 = [];
	let each1_lookup = new Map_1();
	let div5_aria_label_value;
	let div7;
	let div6;
	let div8;
	let t4;
	let div8_class_value;
	let div10;
	let div9;
	let each_blocks_1 = [];
	let each2_lookup = new Map_1();
	let div10_class_value;
	let div10_role_value;
	let div10_aria_label_value;
	let div10_id_value;
	let div11;
	let each_blocks = [];
	let each3_lookup = new Map_1();
	let div11_class_value;
	let div11_aria_label_value;
	let button1;
	let section_aria_label_value;
	let mounted;
	let dispose;
	let each_value_4 = /*skinTones*/ ctx[9];
	const get_key = ctx => /*skinTone*/ ctx[72];

	for (let i = 0; i < each_value_4.length; i += 1) {
		let child_ctx = get_each_context_4(ctx, each_value_4, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_3[i] = create_each_block_4(key, child_ctx));
	}

	let each_value_3 = /*groups*/ ctx[12];
	const get_key_1 = ctx => /*group*/ ctx[69].id;

	for (let i = 0; i < each_value_3.length; i += 1) {
		let child_ctx = get_each_context_3(ctx, each_value_3, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks_2[i] = create_each_block_3(key, child_ctx));
	}

	let each_value_1 = /*currentEmojisWithCategories*/ ctx[15];
	const get_key_2 = ctx => /*emojiWithCategory*/ ctx[66].category;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key_2(child_ctx);
		each2_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
	}

	let each_value = /*currentFavorites*/ ctx[10];
	const get_key_3 = ctx => /*emoji*/ ctx[63].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key_3(child_ctx);
		each3_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			section = element("section");
			div0 = element("div");
			div4 = element("div");
			div1 = element("div");
			input = element("input");
			label = element("label");
			t0 = text(t0_value);
			span0 = element("span");
			t1 = text(t1_value);
			div2 = element("div");
			button0 = element("button");
			t2 = text(/*skinToneButtonText*/ ctx[21]);
			span1 = element("span");
			t3 = text(t3_value);
			div3 = element("div");

			for (let i = 0; i < each_blocks_3.length; i += 1) {
				each_blocks_3[i].c();
			}

			div5 = element("div");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			div7 = element("div");
			div6 = element("div");
			div8 = element("div");
			t4 = text(/*message*/ ctx[18]);
			div10 = element("div");
			div9 = element("div");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			div11 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			button1 = element("button");
			button1.textContent = "😀";
			attr(div0, "class", "pad-top");
			attr(input, "id", "search");
			attr(input, "class", "search");
			attr(input, "type", "search");
			attr(input, "role", "combobox");
			attr(input, "enterkeyhint", "search");
			attr(input, "placeholder", input_placeholder_value = /*i18n*/ ctx[0].searchLabel);
			attr(input, "autocapitalize", "none");
			attr(input, "autocomplete", "off");
			attr(input, "spellcheck", "true");
			attr(input, "aria-expanded", input_aria_expanded_value = !!(/*searchMode*/ ctx[4] && /*currentEmojis*/ ctx[1].length));
			attr(input, "aria-controls", "search-results");
			attr(input, "aria-describedby", "search-description");
			attr(input, "aria-autocomplete", "list");

			attr(input, "aria-activedescendant", input_aria_activedescendant_value = /*activeSearchItemId*/ ctx[26]
			? `emo-${/*activeSearchItemId*/ ctx[26]}`
			: '');

			attr(label, "class", "sr-only");
			attr(label, "for", "search");
			attr(span0, "id", "search-description");
			attr(span0, "class", "sr-only");
			attr(div1, "class", "search-wrapper");
			attr(button0, "id", "skintone-button");
			attr(button0, "class", button0_class_value = "emoji " + (/*skinTonePickerExpanded*/ ctx[6] ? 'hide-focus' : ''));
			attr(button0, "aria-label", /*skinToneButtonLabel*/ ctx[23]);
			attr(button0, "title", /*skinToneButtonLabel*/ ctx[23]);
			attr(button0, "aria-describedby", "skintone-description");
			attr(button0, "aria-haspopup", "listbox");
			attr(button0, "aria-expanded", /*skinTonePickerExpanded*/ ctx[6]);
			attr(button0, "aria-controls", "skintone-list");

			attr(div2, "class", div2_class_value = "skintone-button-wrapper " + (/*skinTonePickerExpandedAfterAnimation*/ ctx[19]
			? 'expanded'
			: ''));

			attr(span1, "id", "skintone-description");
			attr(span1, "class", "sr-only");
			attr(div3, "id", "skintone-list");

			attr(div3, "class", div3_class_value = "skintone-list " + (/*skinTonePickerExpanded*/ ctx[6]
			? ''
			: 'hidden no-animate'));

			set_style(div3, "transform", "translateY(" + (/*skinTonePickerExpanded*/ ctx[6]
			? 0
			: 'calc(-1 * var(--num-skintones) * var(--total-emoji-size))') + ")");

			attr(div3, "role", "listbox");
			attr(div3, "aria-label", div3_aria_label_value = /*i18n*/ ctx[0].skinTonesLabel);
			attr(div3, "aria-activedescendant", div3_aria_activedescendant_value = "skintone-" + /*activeSkinTone*/ ctx[20]);
			attr(div3, "aria-hidden", div3_aria_hidden_value = !/*skinTonePickerExpanded*/ ctx[6]);
			attr(div4, "class", "search-row");
			attr(div5, "class", "nav");
			attr(div5, "role", "tablist");
			set_style(div5, "grid-template-columns", "repeat(" + /*groups*/ ctx[12].length + ", 1fr)");
			attr(div5, "aria-label", div5_aria_label_value = /*i18n*/ ctx[0].categoriesLabel);
			attr(div6, "class", "indicator");
			set_style(div6, "transform", "translateX(" + (/*isRtl*/ ctx[24] ? -1 : 1) * /*currentGroupIndex*/ ctx[11] * 100 + "%)");
			attr(div7, "class", "indicator-wrapper");
			attr(div8, "class", div8_class_value = "message " + (/*message*/ ctx[18] ? '' : 'gone'));
			attr(div8, "role", "alert");
			attr(div8, "aria-live", "polite");

			attr(div10, "class", div10_class_value = "tabpanel " + (!/*databaseLoaded*/ ctx[14] || /*message*/ ctx[18]
			? 'gone'
			: ''));

			attr(div10, "role", div10_role_value = /*searchMode*/ ctx[4] ? 'region' : 'tabpanel');

			attr(div10, "aria-label", div10_aria_label_value = /*searchMode*/ ctx[4]
			? /*i18n*/ ctx[0].searchResultsLabel
			: /*i18n*/ ctx[0].categories[/*currentGroup*/ ctx[13].name]);

			attr(div10, "id", div10_id_value = /*searchMode*/ ctx[4]
			? ''
			: `tab-${/*currentGroup*/ ctx[13].id}`);

			attr(div10, "tabindex", "0");
			attr(div11, "class", div11_class_value = "favorites emoji-menu " + (/*message*/ ctx[18] ? 'gone' : ''));
			attr(div11, "role", "menu");
			attr(div11, "aria-label", div11_aria_label_value = /*i18n*/ ctx[0].favoritesLabel);
			set_style(div11, "padding-inline-end", /*scrollbarWidth*/ ctx[25] + "px");
			attr(button1, "aria-hidden", "true");
			attr(button1, "tabindex", "-1");
			attr(button1, "class", "abs-pos hidden emoji");
			attr(section, "class", "picker");
			attr(section, "aria-label", section_aria_label_value = /*i18n*/ ctx[0].regionLabel);
			attr(section, "style", /*pickerStyle*/ ctx[22]);
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, div0);
			append(section, div4);
			append(div4, div1);
			append(div1, input);
			set_input_value(input, /*rawSearchText*/ ctx[2]);
			append(div1, label);
			append(label, t0);
			append(div1, span0);
			append(span0, t1);
			append(div4, div2);
			append(div2, button0);
			append(button0, t2);
			append(div4, span1);
			append(span1, t3);
			append(div4, div3);

			for (let i = 0; i < each_blocks_3.length; i += 1) {
				each_blocks_3[i].m(div3, null);
			}

			/*div3_binding*/ ctx[48](div3);
			append(section, div5);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].m(div5, null);
			}

			append(section, div7);
			append(div7, div6);
			append(section, div8);
			append(div8, t4);
			append(section, div10);
			append(div10, div9);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div9, null);
			}

			/*div10_binding*/ ctx[50](div10);
			append(section, div11);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div11, null);
			}

			append(section, button1);
			/*button1_binding*/ ctx[51](button1);
			/*section_binding*/ ctx[52](section);

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[47]),
					listen(input, "keydown", /*onSearchKeydown*/ ctx[30]),
					listen(button0, "click", /*onClickSkinToneButton*/ ctx[35]),
					listen(div3, "focusout", /*onSkinToneOptionsFocusOut*/ ctx[38]),
					listen(div3, "click", /*onSkinToneOptionsClick*/ ctx[34]),
					listen(div3, "keydown", /*onSkinToneOptionsKeydown*/ ctx[36]),
					listen(div3, "keyup", /*onSkinToneOptionsKeyup*/ ctx[37]),
					listen(div5, "keydown", /*onNavKeydown*/ ctx[32]),
					action_destroyer(/*calculateEmojiGridStyle*/ ctx[29].call(null, div9)),
					listen(div10, "click", /*onEmojiClick*/ ctx[33]),
					listen(div11, "click", /*onEmojiClick*/ ctx[33])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*i18n*/ 1 && input_placeholder_value !== (input_placeholder_value = /*i18n*/ ctx[0].searchLabel)) {
				attr(input, "placeholder", input_placeholder_value);
			}

			if (dirty[0] & /*searchMode, currentEmojis*/ 18 && input_aria_expanded_value !== (input_aria_expanded_value = !!(/*searchMode*/ ctx[4] && /*currentEmojis*/ ctx[1].length))) {
				attr(input, "aria-expanded", input_aria_expanded_value);
			}

			if (dirty[0] & /*activeSearchItemId*/ 67108864 && input_aria_activedescendant_value !== (input_aria_activedescendant_value = /*activeSearchItemId*/ ctx[26]
			? `emo-${/*activeSearchItemId*/ ctx[26]}`
			: '')) {
				attr(input, "aria-activedescendant", input_aria_activedescendant_value);
			}

			if (dirty[0] & /*rawSearchText*/ 4) {
				set_input_value(input, /*rawSearchText*/ ctx[2]);
			}

			if (dirty[0] & /*i18n*/ 1 && t0_value !== (t0_value = /*i18n*/ ctx[0].searchLabel + "")) set_data(t0, t0_value);
			if (dirty[0] & /*i18n*/ 1 && t1_value !== (t1_value = /*i18n*/ ctx[0].searchDescription + "")) set_data(t1, t1_value);
			if (dirty[0] & /*skinToneButtonText*/ 2097152) set_data(t2, /*skinToneButtonText*/ ctx[21]);

			if (dirty[0] & /*skinTonePickerExpanded*/ 64 && button0_class_value !== (button0_class_value = "emoji " + (/*skinTonePickerExpanded*/ ctx[6] ? 'hide-focus' : ''))) {
				attr(button0, "class", button0_class_value);
			}

			if (dirty[0] & /*skinToneButtonLabel*/ 8388608) {
				attr(button0, "aria-label", /*skinToneButtonLabel*/ ctx[23]);
			}

			if (dirty[0] & /*skinToneButtonLabel*/ 8388608) {
				attr(button0, "title", /*skinToneButtonLabel*/ ctx[23]);
			}

			if (dirty[0] & /*skinTonePickerExpanded*/ 64) {
				attr(button0, "aria-expanded", /*skinTonePickerExpanded*/ ctx[6]);
			}

			if (dirty[0] & /*skinTonePickerExpandedAfterAnimation*/ 524288 && div2_class_value !== (div2_class_value = "skintone-button-wrapper " + (/*skinTonePickerExpandedAfterAnimation*/ ctx[19]
			? 'expanded'
			: ''))) {
				attr(div2, "class", div2_class_value);
			}

			if (dirty[0] & /*i18n*/ 1 && t3_value !== (t3_value = /*i18n*/ ctx[0].skinToneDescription + "")) set_data(t3, t3_value);

			if (dirty[0] & /*skinTones, activeSkinTone, i18n*/ 1049089) {
				each_value_4 = /*skinTones*/ ctx[9];
				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key, 1, ctx, each_value_4, each0_lookup, div3, destroy_block, create_each_block_4, null, get_each_context_4);
			}

			if (dirty[0] & /*skinTonePickerExpanded*/ 64 && div3_class_value !== (div3_class_value = "skintone-list " + (/*skinTonePickerExpanded*/ ctx[6]
			? ''
			: 'hidden no-animate'))) {
				attr(div3, "class", div3_class_value);
			}

			if (dirty[0] & /*skinTonePickerExpanded*/ 64) {
				set_style(div3, "transform", "translateY(" + (/*skinTonePickerExpanded*/ ctx[6]
				? 0
				: 'calc(-1 * var(--num-skintones) * var(--total-emoji-size))') + ")");
			}

			if (dirty[0] & /*i18n*/ 1 && div3_aria_label_value !== (div3_aria_label_value = /*i18n*/ ctx[0].skinTonesLabel)) {
				attr(div3, "aria-label", div3_aria_label_value);
			}

			if (dirty[0] & /*activeSkinTone*/ 1048576 && div3_aria_activedescendant_value !== (div3_aria_activedescendant_value = "skintone-" + /*activeSkinTone*/ ctx[20])) {
				attr(div3, "aria-activedescendant", div3_aria_activedescendant_value);
			}

			if (dirty[0] & /*skinTonePickerExpanded*/ 64 && div3_aria_hidden_value !== (div3_aria_hidden_value = !/*skinTonePickerExpanded*/ ctx[6])) {
				attr(div3, "aria-hidden", div3_aria_hidden_value);
			}

			if (dirty[0] & /*groups, i18n, searchMode, currentGroup*/ 12305 | dirty[1] & /*onNavClick*/ 1) {
				each_value_3 = /*groups*/ ctx[12];
				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_1, 1, ctx, each_value_3, each1_lookup, div5, destroy_block, create_each_block_3, null, get_each_context_3);
			}

			if (dirty[0] & /*groups*/ 4096) {
				set_style(div5, "grid-template-columns", "repeat(" + /*groups*/ ctx[12].length + ", 1fr)");
			}

			if (dirty[0] & /*i18n*/ 1 && div5_aria_label_value !== (div5_aria_label_value = /*i18n*/ ctx[0].categoriesLabel)) {
				attr(div5, "aria-label", div5_aria_label_value);
			}

			if (dirty[0] & /*isRtl, currentGroupIndex*/ 16779264) {
				set_style(div6, "transform", "translateX(" + (/*isRtl*/ ctx[24] ? -1 : 1) * /*currentGroupIndex*/ ctx[11] * 100 + "%)");
			}

			if (dirty[0] & /*message*/ 262144) set_data(t4, /*message*/ ctx[18]);

			if (dirty[0] & /*message*/ 262144 && div8_class_value !== (div8_class_value = "message " + (/*message*/ ctx[18] ? '' : 'gone'))) {
				attr(div8, "class", div8_class_value);
			}

			if (dirty[0] & /*searchMode, currentEmojisWithCategories, activeSearchItem, labelWithSkin, currentSkinTone, unicodeWithSkin, i18n, currentGroup*/ 402694449) {
				each_value_1 = /*currentEmojisWithCategories*/ ctx[15];
				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_2, 1, ctx, each_value_1, each2_lookup, div9, destroy_block, create_each_block_1, null, get_each_context_1);
			}

			if (dirty[0] & /*databaseLoaded, message*/ 278528 && div10_class_value !== (div10_class_value = "tabpanel " + (!/*databaseLoaded*/ ctx[14] || /*message*/ ctx[18]
			? 'gone'
			: ''))) {
				attr(div10, "class", div10_class_value);
			}

			if (dirty[0] & /*searchMode*/ 16 && div10_role_value !== (div10_role_value = /*searchMode*/ ctx[4] ? 'region' : 'tabpanel')) {
				attr(div10, "role", div10_role_value);
			}

			if (dirty[0] & /*searchMode, i18n, currentGroup*/ 8209 && div10_aria_label_value !== (div10_aria_label_value = /*searchMode*/ ctx[4]
			? /*i18n*/ ctx[0].searchResultsLabel
			: /*i18n*/ ctx[0].categories[/*currentGroup*/ ctx[13].name])) {
				attr(div10, "aria-label", div10_aria_label_value);
			}

			if (dirty[0] & /*searchMode, currentGroup*/ 8208 && div10_id_value !== (div10_id_value = /*searchMode*/ ctx[4]
			? ''
			: `tab-${/*currentGroup*/ ctx[13].id}`)) {
				attr(div10, "id", div10_id_value);
			}

			if (dirty[0] & /*labelWithSkin, currentFavorites, currentSkinTone, unicodeWithSkin*/ 402654464) {
				each_value = /*currentFavorites*/ ctx[10];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key_3, 1, ctx, each_value, each3_lookup, div11, destroy_block, create_each_block, null, get_each_context);
			}

			if (dirty[0] & /*message*/ 262144 && div11_class_value !== (div11_class_value = "favorites emoji-menu " + (/*message*/ ctx[18] ? 'gone' : ''))) {
				attr(div11, "class", div11_class_value);
			}

			if (dirty[0] & /*i18n*/ 1 && div11_aria_label_value !== (div11_aria_label_value = /*i18n*/ ctx[0].favoritesLabel)) {
				attr(div11, "aria-label", div11_aria_label_value);
			}

			if (dirty[0] & /*scrollbarWidth*/ 33554432) {
				set_style(div11, "padding-inline-end", /*scrollbarWidth*/ ctx[25] + "px");
			}

			if (dirty[0] & /*i18n*/ 1 && section_aria_label_value !== (section_aria_label_value = /*i18n*/ ctx[0].regionLabel)) {
				attr(section, "aria-label", section_aria_label_value);
			}

			if (dirty[0] & /*pickerStyle*/ 4194304) {
				attr(section, "style", /*pickerStyle*/ ctx[22]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(section);

			for (let i = 0; i < each_blocks_3.length; i += 1) {
				each_blocks_3[i].d();
			}

			/*div3_binding*/ ctx[48](null);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].d();
			}

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			/*div10_binding*/ ctx[50](null);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*button1_binding*/ ctx[51](null);
			/*section_binding*/ ctx[52](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { skinToneEmoji } = $$props;
	let { i18n } = $$props;
	let { database } = $$props;
	let { customEmoji } = $$props;
	let { customCategorySorting } = $$props;

	// private
	let initialLoad = true;

	let currentEmojis = [];
	let currentEmojisWithCategories = []; // eslint-disable-line no-unused-vars
	let rawSearchText = '';
	let searchText = '';
	let rootElement;
	let baselineEmoji;
	let tabpanelElement;
	let searchMode = false; // eslint-disable-line no-unused-vars
	let activeSearchItem = -1;
	let message; // eslint-disable-line no-unused-vars
	let skinTonePickerExpanded = false;
	let skinTonePickerExpandedAfterAnimation = false; // eslint-disable-line no-unused-vars
	let skinToneDropdown;
	let currentSkinTone = 0;
	let activeSkinTone = 0;
	let skinToneButtonText; // eslint-disable-line no-unused-vars
	let pickerStyle; // eslint-disable-line no-unused-vars
	let skinToneButtonLabel = ''; // eslint-disable-line no-unused-vars
	let skinTones = [];
	let currentFavorites = []; // eslint-disable-line no-unused-vars
	let defaultFavoriteEmojis;
	let numColumns = DEFAULT_NUM_COLUMNS;
	let isRtl = false;
	let scrollbarWidth = 0; // eslint-disable-line no-unused-vars
	let currentGroupIndex = 0;
	let groups$1 = groups;
	let currentGroup;
	let databaseLoaded = false; // eslint-disable-line no-unused-vars
	let activeSearchItemId; // eslint-disable-line no-unused-vars

	//
	// Utils/helpers
	//
	const focus = id => {
		rootElement.getRootNode().getElementById(id).focus();
	};

	// fire a custom event that crosses the shadow boundary
	const fireEvent = (name, detail) => {
		rootElement.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
	};

	// eslint-disable-next-line no-unused-vars
	const unicodeWithSkin = (emoji, currentSkinTone) => currentSkinTone && emoji.skins && emoji.skins[currentSkinTone] || emoji.unicode;

	// eslint-disable-next-line no-unused-vars
	const labelWithSkin = (emoji, currentSkinTone) => uniq([
		emoji.name || unicodeWithSkin(emoji, currentSkinTone),
		...emoji.shortcodes || []
	]).join(', ');

	// Detect a skintone option button
	const isSkinToneOption = element => (/^skintone-/).test(element.id);

	//
	// Determine the emoji support level (in requestIdleCallback)
	//
	emojiSupportLevelPromise.then(level => {
		// Can't actually test emoji support in Jest/JSDom, emoji never render in color in Cairo
		/* istanbul ignore next */
		if (!level) {
			$$invalidate(18, message = i18n.emojiUnsupportedMessage);
		}
	});

	//
	// Calculate the width of the emoji grid. This serves two purposes:
	// 1) Re-calculate the --num-columns var because it may have changed
	// 2) Re-calculate the scrollbar width because it may have changed
	//   (i.e. because the number of items changed)
	// 3) Re-calculate whether we're in RTL mode or not.
	//
	// The benefit of doing this in one place is to align with rAF/ResizeObserver
	// and do all the calculations in one go. RTL vs LTR is not strictly width-related,
	// but since we're already reading the style here, and since it's already aligned with
	// the rAF loop, this is the most appropriate place to do it perf-wise.
	//
	// eslint-disable-next-line no-unused-vars
	function calculateEmojiGridStyle(node) {
		return calculateWidth(node, width => {
			/* istanbul ignore next */
			if ("production" !== 'test') {
				// jsdom throws errors for this kind of fancy stuff
				// read all the style/layout calculations we need to make
				const style = getComputedStyle(rootElement);

				const newNumColumns = parseInt(style.getPropertyValue('--num-columns'), 10);
				const newIsRtl = style.getPropertyValue('direction') === 'rtl';
				const parentWidth = node.parentElement.getBoundingClientRect().width;
				const newScrollbarWidth = parentWidth - width;

				// write to Svelte variables
				$$invalidate(46, numColumns = newNumColumns);

				$$invalidate(25, scrollbarWidth = newScrollbarWidth); // eslint-disable-line no-unused-vars
				$$invalidate(24, isRtl = newIsRtl); // eslint-disable-line no-unused-vars
			}
		});
	}

	function checkZwjSupportAndUpdate(zwjEmojisToCheck) {
		const rootNode = rootElement.getRootNode();
		const emojiToDomNode = emoji => rootNode.getElementById(`emo-${emoji.id}`);
		checkZwjSupport(zwjEmojisToCheck, baselineEmoji, emojiToDomNode);

		// force update
		$$invalidate(1, currentEmojis = currentEmojis); // eslint-disable-line no-self-assign
	}

	function isZwjSupported(emoji) {
		return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode);
	}

	async function filterEmojisByVersion(emojis) {
		const emojiSupportLevel = await emojiSupportLevelPromise;

		// !version corresponds to custom emoji
		return emojis.filter(({ version }) => !version || version <= emojiSupportLevel);
	}

	async function summarizeEmojis(emojis) {
		return summarizeEmojisForUI(emojis, await emojiSupportLevelPromise);
	}

	async function getEmojisByGroup(group) {

		if (typeof group === 'undefined') {
			return [];
		}

		// -1 is custom emoji
		const emoji = group === -1
		? customEmoji
		: await database.getEmojiByGroup(group);

		return summarizeEmojis(await filterEmojisByVersion(emoji));
	}

	async function getEmojisBySearchQuery(query) {
		return summarizeEmojis(await filterEmojisByVersion(await database.getEmojiBySearchQuery(query)));
	}

	// eslint-disable-next-line no-unused-vars
	function onSearchKeydown(event) {
		if (!searchMode || !currentEmojis.length) {
			return;
		}

		const goToNextOrPrevious = previous => {
			halt(event);
			$$invalidate(5, activeSearchItem = incrementOrDecrement(previous, activeSearchItem, currentEmojis));
		};

		switch (event.key) {
			case 'ArrowDown':
				return goToNextOrPrevious(false);
			case 'ArrowUp':
				return goToNextOrPrevious(true);
			case 'Enter':
				if (activeSearchItem !== -1) {
					halt(event);
					return clickEmoji(currentEmojis[activeSearchItem].id);
				} else if (currentEmojis.length) {
					$$invalidate(5, activeSearchItem = 0);
				}
		}
	}

	//
	// Handle user input on nav
	//
	// eslint-disable-next-line no-unused-vars
	function onNavClick(group) {
		$$invalidate(2, rawSearchText = '');
		$$invalidate(44, searchText = '');
		$$invalidate(5, activeSearchItem = -1);
		$$invalidate(11, currentGroupIndex = groups$1.findIndex(_ => _.id === group.id));
	}

	// eslint-disable-next-line no-unused-vars
	function onNavKeydown(event) {
		const { target, key } = event;

		const doFocus = el => {
			if (el) {
				halt(event);
				el.focus();
			}
		};

		switch (key) {
			case 'ArrowLeft':
				return doFocus(target.previousSibling);
			case 'ArrowRight':
				return doFocus(target.nextSibling);
			case 'Home':
				return doFocus(target.parentElement.firstChild);
			case 'End':
				return doFocus(target.parentElement.lastChild);
		}
	}

	//
	// Handle user input on an emoji
	//
	async function clickEmoji(unicodeOrName) {
		const emoji = await database.getEmojiByUnicodeOrName(unicodeOrName);
		const emojiSummary = [...currentEmojis, ...currentFavorites].find(_ => _.id === unicodeOrName);
		const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, currentSkinTone);
		await database.incrementFavoriteEmojiCount(unicodeOrName);

		fireEvent('emoji-click', {
			emoji,
			skinTone: currentSkinTone,
			...skinTonedUnicode && { unicode: skinTonedUnicode },
			...emojiSummary.name && { name: emojiSummary.name }
		});
	}

	// eslint-disable-next-line no-unused-vars
	async function onEmojiClick(event) {
		const { target } = event;

		if (!target.classList.contains('emoji')) {
			return;
		}

		halt(event);
		const id = target.id.substring(4); // replace 'emo-' or 'fav-' prefix

		/* no await */
		clickEmoji(id);
	}

	//
	// Handle user input on the skintone picker
	//
	// eslint-disable-next-line no-unused-vars
	async function onSkinToneOptionsClick(event) {
		const { target } = event;

		if (!isSkinToneOption(target)) {
			return;
		}

		halt(event);
		const skinTone = parseInt(target.id.slice(9), 10); // remove 'skintone-' prefix
		$$invalidate(8, currentSkinTone = skinTone);
		$$invalidate(6, skinTonePickerExpanded = false);
		focus('skintone-button');
		fireEvent('skin-tone-change', { skinTone });

		/* no await */
		database.setPreferredSkinTone(skinTone);
	}

	// eslint-disable-next-line no-unused-vars
	async function onClickSkinToneButton(event) {
		$$invalidate(6, skinTonePickerExpanded = !skinTonePickerExpanded);
		$$invalidate(20, activeSkinTone = currentSkinTone);

		if (skinTonePickerExpanded) {
			halt(event);
			rAF(() => focus(`skintone-${activeSkinTone}`));
		}
	}

	// eslint-disable-next-line no-unused-vars
	function onSkinToneOptionsKeydown(event) {
		if (!skinTonePickerExpanded) {
			return;
		}

		const changeActiveSkinTone = async nextSkinTone => {
			halt(event);
			$$invalidate(20, activeSkinTone = nextSkinTone);
			await tick();
			focus(`skintone-${activeSkinTone}`);
		};

		switch (event.key) {
			case 'ArrowUp':
				return changeActiveSkinTone(incrementOrDecrement(true, activeSkinTone, skinTones));
			case 'ArrowDown':
				return changeActiveSkinTone(incrementOrDecrement(false, activeSkinTone, skinTones));
			case 'Home':
				return changeActiveSkinTone(0);
			case 'End':
				return changeActiveSkinTone(skinTones.length - 1);
			case 'Enter':
				// enter on keydown, space on keyup. this is just how browsers work for buttons
				// https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
				return onSkinToneOptionsClick(event);
			case 'Escape':
				halt(event);
				$$invalidate(6, skinTonePickerExpanded = false);
				return focus('skintone-button');
		}
	}

	// eslint-disable-next-line no-unused-vars
	function onSkinToneOptionsKeyup(event) {
		if (!skinTonePickerExpanded) {
			return;
		}

		switch (event.key) {
			case ' ':
				// enter on keydown, space on keyup. this is just how browsers work for buttons
				// https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
				return onSkinToneOptionsClick(event);
		}
	}

	// eslint-disable-next-line no-unused-vars
	async function onSkinToneOptionsFocusOut(event) {
		// On blur outside of the skintone options, collapse the skintone picker.
		// Except if focus is just moving to another skintone option, e.g. pressing up/down to change focus
		const { relatedTarget } = event;

		if (!relatedTarget || !isSkinToneOption(relatedTarget)) {
			$$invalidate(6, skinTonePickerExpanded = false);
		}
	}

	function input_input_handler() {
		rawSearchText = this.value;
		$$invalidate(2, rawSearchText);
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			skinToneDropdown = $$value;
			$$invalidate(7, skinToneDropdown);
		});
	}

	const click_handler = group => onNavClick(group);

	function div10_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			tabpanelElement = $$value;
			$$invalidate(3, tabpanelElement);
		});
	}

	function button1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			baselineEmoji = $$value;
			$$invalidate(17, baselineEmoji);
		});
	}

	function section_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			rootElement = $$value;
			$$invalidate(16, rootElement);
		});
	}

	$$self.$$set = $$props => {
		if ('skinToneEmoji' in $$props) $$invalidate(40, skinToneEmoji = $$props.skinToneEmoji);
		if ('i18n' in $$props) $$invalidate(0, i18n = $$props.i18n);
		if ('database' in $$props) $$invalidate(39, database = $$props.database);
		if ('customEmoji' in $$props) $$invalidate(41, customEmoji = $$props.customEmoji);
		if ('customCategorySorting' in $$props) $$invalidate(42, customCategorySorting = $$props.customCategorySorting);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[1] & /*customEmoji, database*/ 1280) {
			/* eslint-enable no-unused-vars */
			//
			// Set or update the customEmoji
			//
			{
				if (customEmoji && database) {
					$$invalidate(39, database.customEmoji = customEmoji, database);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*i18n*/ 1 | $$self.$$.dirty[1] & /*database*/ 256) {
			//
			// Set or update the database object
			//
			{
				// show a Loading message if it takes a long time, or show an error if there's a network/IDB error
				async function handleDatabaseLoading() {
					let showingLoadingMessage = false;

					const timeoutHandle = setTimeout(
						() => {
							showingLoadingMessage = true;
							$$invalidate(18, message = i18n.loadingMessage);
						},
						TIMEOUT_BEFORE_LOADING_MESSAGE
					);

					try {
						await database.ready();
						$$invalidate(14, databaseLoaded = true); // eslint-disable-line no-unused-vars
					} catch(err) {
						console.error(err);
						$$invalidate(18, message = i18n.networkErrorMessage);
					} finally {
						clearTimeout(timeoutHandle);

						if (showingLoadingMessage) {
							// Seems safer than checking the i18n string, which may change
							showingLoadingMessage = false;

							$$invalidate(18, message = ''); // eslint-disable-line no-unused-vars
						}
					}
				}

				if (database) {
					/* no await */
					handleDatabaseLoading();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*groups, currentGroupIndex*/ 6144 | $$self.$$.dirty[1] & /*customEmoji*/ 1024) {
			{
				if (customEmoji && customEmoji.length) {
					$$invalidate(12, groups$1 = [customGroup, ...groups]);
				} else if (groups$1 !== groups) {
					if (currentGroupIndex) {
						// If the current group is anything other than "custom" (which is first), decrement.
						// This fixes the odd case where you set customEmoji, then pick a category, then unset customEmoji
						$$invalidate(11, currentGroupIndex--, currentGroupIndex);
					}

					$$invalidate(12, groups$1 = groups);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*rawSearchText*/ 4) {
			/* eslint-enable no-unused-vars */
			//
			// Handle user input on the search input
			//
			{
				rIC(() => {
					$$invalidate(44, searchText = (rawSearchText || '').trim()); // defer to avoid input delays, plus we can trim here
					$$invalidate(5, activeSearchItem = -1);
				});
			}
		}

		if ($$self.$$.dirty[0] & /*groups, currentGroupIndex*/ 6144) {
			//
			// Update the current group based on the currentGroupIndex
			//
			$$invalidate(13, currentGroup = groups$1[currentGroupIndex]);
		}

		if ($$self.$$.dirty[0] & /*databaseLoaded, currentGroup*/ 24576 | $$self.$$.dirty[1] & /*searchText*/ 8192) {
			//
			// Set or update the currentEmojis. Check for invalid ZWJ renderings
			// (i.e. double emoji).
			//
			{
				async function updateEmojis() {

					if (!databaseLoaded) {
						$$invalidate(1, currentEmojis = []);
						$$invalidate(4, searchMode = false);
					} else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
						const currentSearchText = searchText;
						const newEmojis = await getEmojisBySearchQuery(currentSearchText);

						if (currentSearchText === searchText) {
							// if the situation changes asynchronously, do not update
							$$invalidate(1, currentEmojis = newEmojis);

							$$invalidate(4, searchMode = true);
						}
					} else if (currentGroup) {
						const currentGroupId = currentGroup.id;
						const newEmojis = await getEmojisByGroup(currentGroupId);

						if (currentGroupId === currentGroup.id) {
							// if the situation changes asynchronously, do not update
							$$invalidate(1, currentEmojis = newEmojis);

							$$invalidate(4, searchMode = false);
						}
					}
				}

				/* no await */
				updateEmojis();
			}
		}

		if ($$self.$$.dirty[0] & /*groups, searchMode*/ 4112) {
			//
			// Global styles for the entire picker
			//
			/* eslint-disable no-unused-vars */
			$$invalidate(22, pickerStyle = `
  --font-family: ${FONT_FAMILY};
  --num-groups: ${groups$1.length}; 
  --indicator-opacity: ${searchMode ? 0 : 1}; 
  --num-skintones: ${NUM_SKIN_TONES};`);
		}

		if ($$self.$$.dirty[0] & /*databaseLoaded*/ 16384 | $$self.$$.dirty[1] & /*database*/ 256) {
			//
			// Set or update the preferred skin tone
			//
			{
				async function updatePreferredSkinTone() {
					if (databaseLoaded) {
						$$invalidate(8, currentSkinTone = await database.getPreferredSkinTone());
					}
				}

				/* no await */
				updatePreferredSkinTone();
			}
		}

		if ($$self.$$.dirty[1] & /*skinToneEmoji*/ 512) {
			$$invalidate(9, skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(skinToneEmoji, i)));
		}

		if ($$self.$$.dirty[0] & /*skinTones, currentSkinTone*/ 768) {
			/* eslint-disable no-unused-vars */
			$$invalidate(21, skinToneButtonText = skinTones[currentSkinTone]);
		}

		if ($$self.$$.dirty[0] & /*i18n, currentSkinTone*/ 257) {
			$$invalidate(23, skinToneButtonLabel = i18n.skinToneLabel.replace('{skinTone}', i18n.skinTones[currentSkinTone]));
		}

		if ($$self.$$.dirty[0] & /*databaseLoaded*/ 16384 | $$self.$$.dirty[1] & /*database*/ 256) {
			/* eslint-enable no-unused-vars */
			//
			// Set or update the favorites emojis
			//
			{
				async function updateDefaultFavoriteEmojis() {
					$$invalidate(45, defaultFavoriteEmojis = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => database.getEmojiByUnicodeOrName(unicode)))).filter(Boolean)); // filter because in Jest tests we don't have all the emoji in the DB
				}

				if (databaseLoaded) {
					/* no await */
					updateDefaultFavoriteEmojis();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*databaseLoaded*/ 16384 | $$self.$$.dirty[1] & /*database, numColumns, defaultFavoriteEmojis*/ 49408) {
			{
				async function updateFavorites() {
					const dbFavorites = await database.getTopFavoriteEmoji(numColumns);
					const favorites = await summarizeEmojis(uniqBy([...dbFavorites, ...defaultFavoriteEmojis], _ => _.unicode || _.name).slice(0, numColumns));
					$$invalidate(10, currentFavorites = favorites);
				}

				if (databaseLoaded && defaultFavoriteEmojis) {
					/* no await */
					updateFavorites();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*currentEmojis, tabpanelElement*/ 10) {
			// Some emojis have their ligatures rendered as two or more consecutive emojis
			// We want to treat these the same as unsupported emojis, so we compare their
			// widths against the baseline widths and remove them as necessary
			{
				const zwjEmojisToCheck = currentEmojis.filter(emoji => emoji.unicode).filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode)); // filter custom emoji

				if (zwjEmojisToCheck.length) {
					// render now, check their length later
					rAF(() => checkZwjSupportAndUpdate(zwjEmojisToCheck));
				} else {
					$$invalidate(1, currentEmojis = currentEmojis.filter(isZwjSupported));

					rAF(() => {
						// Avoid Svelte doing an invalidation on the "setter" here.
						// At best the invalidation is useless, at worst it can cause infinite loops:
						// https://github.com/nolanlawson/emoji-picker-element/pull/180
						// https://github.com/sveltejs/svelte/issues/6521
						// Also note tabpanelElement can be null if the element is disconnected
						// immediately after connected, hence `|| {}`
						(tabpanelElement || {}).scrollTop = 0; // reset scroll top to 0 when emojis change
					});
				}
			}
		}

		if ($$self.$$.dirty[0] & /*currentEmojis, currentFavorites*/ 1026 | $$self.$$.dirty[1] & /*initialLoad*/ 4096) {
			{
				// consider initialLoad to be complete when the first tabpanel and favorites are rendered
				/* istanbul ignore next */
				if ("production" !== 'production' || false) {
					if (currentEmojis.length && currentFavorites.length && initialLoad) {
						$$invalidate(43, initialLoad = false);
						requestPostAnimationFrame(() => (void 0));
					}
				}
			}
		}

		if ($$self.$$.dirty[0] & /*searchMode, currentEmojis*/ 18 | $$self.$$.dirty[1] & /*customCategorySorting*/ 2048) {
			//
			// Derive currentEmojisWithCategories from currentEmojis. This is always done even if there
			// are no categories, because it's just easier to code the HTML this way.
			//
			{
				function calculateCurrentEmojisWithCategories() {
					if (searchMode) {
						return [{ category: '', emojis: currentEmojis }];
					}

					const categoriesToEmoji = new Map();

					for (const emoji of currentEmojis) {
						const category = emoji.category || '';
						let emojis = categoriesToEmoji.get(category);

						if (!emojis) {
							emojis = [];
							categoriesToEmoji.set(category, emojis);
						}

						emojis.push(emoji);
					}

					return [...categoriesToEmoji.entries()].map(([category, emojis]) => ({ category, emojis })).sort((a, b) => customCategorySorting(a.category, b.category));
				}

				// eslint-disable-next-line no-unused-vars
				$$invalidate(15, currentEmojisWithCategories = calculateCurrentEmojisWithCategories());
			}
		}

		if ($$self.$$.dirty[0] & /*activeSearchItem, currentEmojis*/ 34) {
			//
			// Handle active search item (i.e. pressing up or down while searching)
			//
			/* eslint-disable no-unused-vars */
			$$invalidate(26, activeSearchItemId = activeSearchItem !== -1 && currentEmojis[activeSearchItem].id);
		}

		if ($$self.$$.dirty[0] & /*skinTonePickerExpanded, skinToneDropdown*/ 192) {
			// To make the animation nicer, change the z-index of the skintone picker button
			// *after* the animation has played. This makes it appear that the picker box
			// is expanding "below" the button
			{
				if (skinTonePickerExpanded) {
					skinToneDropdown.addEventListener(
						'transitionend',
						() => {
							$$invalidate(19, skinTonePickerExpandedAfterAnimation = true); // eslint-disable-line no-unused-vars
						},
						{ once: true }
					);
				} else {
					$$invalidate(19, skinTonePickerExpandedAfterAnimation = false); // eslint-disable-line no-unused-vars
				}
			}
		}
	};

	return [
		i18n,
		currentEmojis,
		rawSearchText,
		tabpanelElement,
		searchMode,
		activeSearchItem,
		skinTonePickerExpanded,
		skinToneDropdown,
		currentSkinTone,
		skinTones,
		currentFavorites,
		currentGroupIndex,
		groups$1,
		currentGroup,
		databaseLoaded,
		currentEmojisWithCategories,
		rootElement,
		baselineEmoji,
		message,
		skinTonePickerExpandedAfterAnimation,
		activeSkinTone,
		skinToneButtonText,
		pickerStyle,
		skinToneButtonLabel,
		isRtl,
		scrollbarWidth,
		activeSearchItemId,
		unicodeWithSkin,
		labelWithSkin,
		calculateEmojiGridStyle,
		onSearchKeydown,
		onNavClick,
		onNavKeydown,
		onEmojiClick,
		onSkinToneOptionsClick,
		onClickSkinToneButton,
		onSkinToneOptionsKeydown,
		onSkinToneOptionsKeyup,
		onSkinToneOptionsFocusOut,
		database,
		skinToneEmoji,
		customEmoji,
		customCategorySorting,
		initialLoad,
		searchText,
		defaultFavoriteEmojis,
		numColumns,
		input_input_handler,
		div3_binding,
		click_handler,
		div10_binding,
		button1_binding,
		section_binding
	];
}

class Picker extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				skinToneEmoji: 40,
				i18n: 0,
				database: 39,
				customEmoji: 41,
				customCategorySorting: 42
			},
			null,
			[-1, -1, -1]
		);
	}
}

const DEFAULT_DATA_SOURCE = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json';
const DEFAULT_LOCALE = 'en';

var enI18n = {
  categoriesLabel: 'Categories',
  emojiUnsupportedMessage: 'Your browser does not support color emoji.',
  favoritesLabel: 'Favorites',
  loadingMessage: 'Loading…',
  networkErrorMessage: 'Could not load emoji.',
  regionLabel: 'Emoji picker',
  searchDescription: 'When search results are available, press up or down to select and enter to choose.',
  searchLabel: 'Search',
  searchResultsLabel: 'Search results',
  skinToneDescription: 'When expanded, press up or down to select and enter to choose.',
  skinToneLabel: 'Choose a skin tone (currently {skinTone})',
  skinTonesLabel: 'Skin tones',
  skinTones: [
    'Default',
    'Light',
    'Medium-Light',
    'Medium',
    'Medium-Dark',
    'Dark'
  ],
  categories: {
    custom: 'Custom',
    'smileys-emotion': 'Smileys and emoticons',
    'people-body': 'People and body',
    'animals-nature': 'Animals and nature',
    'food-drink': 'Food and drink',
    'travel-places': 'Travel and places',
    activities: 'Activities',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags'
  }
};

const PROPS = [
  'customEmoji',
  'customCategorySorting',
  'database',
  'dataSource',
  'i18n',
  'locale',
  'skinToneEmoji'
];

class PickerElement extends HTMLElement {
  constructor (props) {
    super();
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = ":host{--emoji-size:1.375rem;--emoji-padding:0.5rem;--category-emoji-size:var(--emoji-size);--category-emoji-padding:var(--emoji-padding);--indicator-height:3px;--input-border-radius:0.5rem;--input-border-size:1px;--input-font-size:1rem;--input-line-height:1.5;--input-padding:0.25rem;--num-columns:8;--outline-size:2px;--border-size:1px;--skintone-border-radius:1rem;--category-font-size:1rem;display:flex;width:min-content;height:400px}:host,:host(.light){color-scheme:light;--background:#fff;--border-color:#e0e0e0;--indicator-color:#385ac1;--input-border-color:#999;--input-font-color:#111;--input-placeholder-color:#999;--outline-color:#999;--category-font-color:#111;--button-active-background:#e6e6e6;--button-hover-background:#d9d9d9}:host(.dark){color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}@media (prefers-color-scheme:dark){:host{color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}}:host([hidden]){display:none}button{margin:0;padding:0;border:0;background:0 0;box-shadow:none;-webkit-tap-highlight-color:transparent}button::-moz-focus-inner{border:0}input{padding:0;margin:0;line-height:1.15;font-family:inherit}input[type=search]{-webkit-appearance:none}:focus{outline:var(--outline-color) solid var(--outline-size);outline-offset:calc(-1*var(--outline-size))}:host([data-js-focus-visible]) :focus:not([data-focus-visible-added]){outline:0}:focus:not(:focus-visible){outline:0}.hide-focus{outline:0}*{box-sizing:border-box}.picker{contain:content;display:flex;flex-direction:column;background:var(--background);border:var(--border-size) solid var(--border-color);width:100%;height:100%;overflow:hidden;--total-emoji-size:calc(var(--emoji-size) + (2 * var(--emoji-padding)));--total-category-emoji-size:calc(var(--category-emoji-size) + (2 * var(--category-emoji-padding)))}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.hidden{opacity:0;pointer-events:none}.abs-pos{position:absolute;left:0;top:0}.gone{display:none!important}.skintone-button-wrapper,.skintone-list{background:var(--background);z-index:3}.skintone-button-wrapper.expanded{z-index:1}.skintone-list{position:absolute;inset-inline-end:0;top:0;z-index:2;overflow:visible;border-bottom:var(--border-size) solid var(--border-color);border-radius:0 0 var(--skintone-border-radius) var(--skintone-border-radius);will-change:transform;transition:transform .2s ease-in-out;transform-origin:center 0}@media (prefers-reduced-motion:reduce){.skintone-list{transition-duration:.001s}}@supports not (inset-inline-end:0){.skintone-list{right:0}}.skintone-list.no-animate{transition:none}.tabpanel{overflow-y:auto;-webkit-overflow-scrolling:touch;will-change:transform;min-height:0;flex:1;contain:content}.emoji-menu{display:grid;grid-template-columns:repeat(var(--num-columns),var(--total-emoji-size));justify-content:space-around;align-items:flex-start;width:100%}.category{padding:var(--emoji-padding);font-size:var(--category-font-size);color:var(--category-font-color)}.custom-emoji,.emoji,button.emoji{height:var(--total-emoji-size);width:var(--total-emoji-size)}.emoji,button.emoji{font-size:var(--emoji-size);display:flex;align-items:center;justify-content:center;border-radius:100%;line-height:1;overflow:hidden;font-family:var(--font-family);cursor:pointer}@media (hover:hover) and (pointer:fine){.emoji:hover,button.emoji:hover{background:var(--button-hover-background)}}.emoji.active,.emoji:active,button.emoji.active,button.emoji:active{background:var(--button-active-background)}.custom-emoji{padding:var(--emoji-padding);object-fit:contain;pointer-events:none;background-repeat:no-repeat;background-position:center center;background-size:var(--emoji-size) var(--emoji-size)}.nav,.nav-button{align-items:center}.nav{display:grid;justify-content:space-between;contain:content}.nav-button{display:flex;justify-content:center}.nav-emoji{font-size:var(--category-emoji-size);width:var(--total-category-emoji-size);height:var(--total-category-emoji-size)}.indicator-wrapper{display:flex;border-bottom:1px solid var(--border-color)}.indicator{width:calc(100%/var(--num-groups));height:var(--indicator-height);opacity:var(--indicator-opacity);background-color:var(--indicator-color);will-change:transform,opacity;transition:opacity .1s linear,transform .25s ease-in-out}@media (prefers-reduced-motion:reduce){.indicator{will-change:opacity;transition:opacity .1s linear}}.pad-top,input.search{background:var(--background);width:100%}.pad-top{height:var(--emoji-padding);z-index:3}.search-row{display:flex;align-items:center;position:relative;padding-inline-start:var(--emoji-padding);padding-bottom:var(--emoji-padding)}.search-wrapper{flex:1;min-width:0}input.search{padding:var(--input-padding);border-radius:var(--input-border-radius);border:var(--input-border-size) solid var(--input-border-color);color:var(--input-font-color);font-size:var(--input-font-size);line-height:var(--input-line-height)}input.search::placeholder{color:var(--input-placeholder-color)}.favorites{display:flex;flex-direction:row;border-top:var(--border-size) solid var(--border-color);contain:content}.message{padding:var(--emoji-padding)}";
    this.shadowRoot.appendChild(style);
    this._ctx = {
      // Set defaults
      locale: DEFAULT_LOCALE,
      dataSource: DEFAULT_DATA_SOURCE,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_CATEGORY_SORTING,
      customEmoji: null,
      i18n: enI18n,
      ...props
    };
    // Handle properties set before the element was upgraded
    for (const prop of PROPS) {
      if (prop !== 'database' && Object.prototype.hasOwnProperty.call(this, prop)) {
        this._ctx[prop] = this[prop];
        delete this[prop];
      }
    }
    this._dbFlush(); // wait for a flush before creating the db, in case the user calls e.g. a setter or setAttribute
  }

  connectedCallback () {
    this._cmp = new Picker({
      target: this.shadowRoot,
      props: this._ctx
    });
  }

  disconnectedCallback () {
    this._cmp.$destroy();
    this._cmp = undefined;

    const { database } = this._ctx;
    if (database) {
      database.close()
        // only happens if the database failed to load in the first place, so we don't care)
        .catch(err => console.error(err));
    }
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji'] // complex objects aren't supported, also use kebab-case
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    // convert from kebab-case to camelcase
    // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
    this._set(
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      newValue
    );
  }

  _set (prop, newValue) {
    this._ctx[prop] = newValue;
    if (this._cmp) {
      this._cmp.$set({ [prop]: newValue });
    }
    if (['locale', 'dataSource'].includes(prop)) {
      this._dbFlush();
    }
  }

  _dbCreate () {
    const { locale, dataSource, database } = this._ctx;
    // only create a new database if we really need to
    if (!database || database.locale !== locale || database.dataSource !== dataSource) {
      this._set('database', new Database({ locale, dataSource }));
    }
  }

  // Update the Database in one microtask if the locale/dataSource change. We do one microtask
  // so we don't create two Databases if e.g. both the locale and the dataSource change
  _dbFlush () {
    Promise.resolve().then(() => (
      this._dbCreate()
    ));
  }
}

const definitions = {};

for (const prop of PROPS) {
  definitions[prop] = {
    get () {
      if (prop === 'database') {
        // in rare cases, the microtask may not be flushed yet, so we need to instantiate the DB
        // now if the user is asking for it
        this._dbCreate();
      }
      return this._ctx[prop]
    },
    set (val) {
      if (prop === 'database') {
        throw new Error('database is read-only')
      }
      this._set(prop, val);
    }
  };
}

Object.defineProperties(PickerElement.prototype, definitions);

/* istanbul ignore else */
if (!customElements.get('emoji-picker')) { // if already defined, do nothing (e.g. same script imported twice)
  customElements.define('emoji-picker', PickerElement);
}

export { PickerElement as default };
