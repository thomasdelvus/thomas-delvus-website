import { createContracts } from './modules/contracts.js';
import { createPrefsController } from './modules/prefs.js';
import { createApiController } from './modules/api.js';
import { createChatController } from './modules/chat.js';
import { createHistoryController } from './modules/history.js';
import { createControlsController } from './modules/controls.js';

(() => {
      const canvas = document.getElementById('map');
      const canvasWrap = document.getElementById('canvasWrap');
      const ctx = canvas.getContext('2d');
      const toolbar = document.getElementById('toolbar');
      const sidebar = document.getElementById('sidebar');
      const inspectorSection = sidebar ? sidebar.querySelector('section[data-section="inspector"]') : null;

      const toolButtons = {
        select: document.getElementById('toolSelect'),
        poly: document.getElementById('toolPoly'),
        roof: document.getElementById('toolRoof'),
        opening: document.getElementById('toolOpening'),
        object: document.getElementById('toolObject'),
        token: document.getElementById('toolToken'),
      };

      const floorSelect = document.getElementById('floorSelect');
      const layerSelect = document.getElementById('layerSelect');
      const openingKindSelect = document.getElementById('openingKind');
      const openingOrientH = document.getElementById('openingOrientH');
      const openingOrientV = document.getElementById('openingOrientV');
      const objectKindSelect = document.getElementById('objectKind');
      const tokenKindSelect = document.getElementById('tokenKind');
      const mapSelect = document.getElementById('mapSelect');
      const mapOffsetXInput = document.getElementById('mapOffsetX');
      const mapOffsetYInput = document.getElementById('mapOffsetY');
      const mapScaleInput = document.getElementById('mapScale');
      const mapRotInput = document.getElementById('mapRot');
      const openingGroup = document.getElementById('openingGroup');
      const objectGroup = document.getElementById('objectGroup');
      const tokenGroup = document.getElementById('tokenGroup');
      const zoomInput = document.getElementById('zoom');
      const panUp = document.getElementById('panUp');
      const panDown = document.getElementById('panDown');
      const panLeft = document.getElementById('panLeft');
      const panRight = document.getElementById('panRight');
      const zoomInButton = document.getElementById('zoomIn');
      const zoomOutButton = document.getElementById('zoomOut');
      const zoomLevel = document.getElementById('zoomLevel');
      const polyAlphaInput = document.getElementById('polyAlpha');
      const backdropToggle = document.getElementById('backdropToggle');
      const hexGridToggle = document.getElementById('hexGridToggle');
      const labelBoldToggle = document.getElementById('labelBoldToggle');
      const handlesToggle = document.getElementById('handlesToggle');
      const hideRoofsToggle = document.getElementById('hideRoofsToggle');
      const streetViewToggle = document.getElementById('streetViewToggle');
      const roofLineColorInput = document.getElementById('roofLineColor');
      const roofLineWidthInput = document.getElementById('roofLineWidth');
      const fogToggle = document.getElementById('fogToggle');
      const videoSelect = document.getElementById('videoQuality');
      const saveButton = document.getElementById('btnSave');
      const undoButton = document.getElementById('btnUndo');
      const saveStatus = document.getElementById('saveStatus');
      const statusMeta = document.getElementById('statusMeta');
      const statusBody = document.getElementById('statusBody');
      const chatLog = document.getElementById('chatLog');
      const chatSpeaker = document.getElementById('chatSpeaker');
      const chatInput = document.getElementById('chatInput');
      const chatSend = document.getElementById('chatSend');
      const inspectorEmpty = document.getElementById('inspectorEmpty');
      const inspectorFields = document.getElementById('inspectorFields');
      const floorKindList = document.getElementById('floorKindList');
      const wallKindList = document.getElementById('wallKindList');
      const openingKindList = document.getElementById('openingKindList');
      const objectKindList = document.getElementById('objectKindList');
      const tokenKindList = document.getElementById('tokenKindList');

      const GRID = {
        size: 32,
        lineAlpha: 0.16,
        lineWidth: 1.25,
        labelAlpha: 0.38,
        labelFont: '600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'
      };
      const ROOF_SHADOW_ALPHA = 0.25;
      const VIEW = { camera: { col: 0, row: 0 }, cameraWorld: { x: 0, y: 0 }, zoom: 1, floorId: '' };
      const STATE = { battle: null, campaign: null, entities: [] };
      const UI = { hexGrid: true, brightLabels: false, showHandles: false, handleHot: false, fogEnabled: true, video: 'medium', polyAlpha: 1, showBackdrop: true, hideRoofs: false, streetView: false, roofLineColor: '#464a4f', roofLineWidth: 1.5 };
      const VIDEO_SCALE = { low: 1, medium: 1.5, high: 2, ultra: 3 };
      let renderDpr = window.devicePixelRatio || 1;
      const CHAT = { rows: [], byId: new Map(), lastTs: 0, timer: null };
      const EDITOR = {
        tool: 'select',
        polyMode: 'room',
        selection: null,
        polyPoints: [],
        polyHover: null,
        dirty: false,
        drag: null,
        ignoreClick: false,
        openingKind: 'door.wood',
        openingOrientation: 'h',
        objectKind: 'object',
        tokenKind: 'npc'
      };
      const HISTORY = { stack: [], index: -1, limit: 20 };
      const EDITOR_HOTKEY = Object.freeze({ key: 'j', ctrl: true, shift: true });
      let editorMode = false;

      const BACKDROP = {
        src: '/images/zone.jpg',
        widthHex: 500,
        origin: { x: 0, y: 0 },
        img: null,
        loaded: false,
        anchorHex: { col: 0, row: 0 },
        anchorHexLabel: 'DO97',
        anchorPixel: { x: 1229, yFromBottom: 1842 },
        offsetHex: { x: 0, y: 1.5 },
        scale: 3.7,
        rotDeg: 19
      };

      BACKDROP.img = new Image();
      BACKDROP.img.onload = () => {
        BACKDROP.loaded = true;
        render();
      };
      BACKDROP.img.src = BACKDROP.src;

      const DEFAULT_FLOOR_KINDS = [
        'wood_oak', 'wood', 'stone', 'cobble', 'brick', 'brick_dark', 'gravel', 'terracotta', 'thatch', 'slate', 'grass', 'fog'
      ];
      const DEFAULT_WALL_KINDS = [
        'brick', 'brick_dark', 'wood_dark', 'wood', 'stone', 'cobble', 'none'
      ];
      const DEFAULT_OPENING_KINDS = [
        'door.wood', 'door', 'window', 'threshold', 'portal', 'gate'
      ];
      const DEFAULT_OBJECT_KINDS = [
        'object', 'poi.view', 'table.rect', 'table.round', 'table.sqr', 'table.hot', 'table.cold', 'table.prep',
        'chair', 'bed', 'bed.double', 'bath', 'chest', 'hearth', 'cooking.hearth', 'stairs',
        'crate', 'barrel', 'keg'
      ];
      const DEFAULT_TOKEN_KINDS = ['pc', 'npc', 'monster', 'creature'];
      const DEFAULT_TOKEN_SCALE = 1.5;
      const TOKEN_KIND_SCALES = {
        pc: 1.5,
        npc: 1.5,
        monster: 1.5,
        creature: 1.5
      };

      // Floors under wall bands can hide cutouts; keep false unless you want that effect.
      const FLOOR_UNDER_WALLS = false;

      const OPENING_STYLE = {
        door: { len: 1.5, thick: 0.25, color: '#9a6b3a' },
        window: { len: 1.2, thick: 0.5, color: '#7aaad6' },
        threshold: { len: 1.4, thick: 0.12, color: '#6f7884' },
        portal: { len: 1.3, thick: 0.22, color: '#6fd3ff' },
        gate: { len: 2.5, thick: 0.3, color: '#8a6f4a' }
      };
      const ROOF_WEATHERING_KEYS = ['aging', 'moss', 'mottling', 'streaks', 'repairs', 'contrast'];
      const ROOF_WEATHERING_DEFAULTS = Object.freeze({
        aging: 0,
        moss: 0,
        mottling: 0,
        streaks: 0,
        repairs: 0,
        contrast: 0
      });
      const ROOF_WEATHER_TEXTURE_SIZE = 256;
      const ROOF_WEATHER_MAP_CACHE_LIMIT = 96;
      const ROOF_WEATHER_PATTERN_CACHE_LIMIT = 320;
      const ROOF_WEATHER_PATTERN_SCALE = Object.freeze({
        aging: 0.2,
        moss: 0.2,
        mottlingDark: 0.24,
        mottlingLight: 0.24,
        streaks: 0.2,
        repairs: 0.2
      });

      const FLOOR_COLORS = {
        fog: '#0e1117',
        wood: '#2a1f17',
        wood_oak: '#3a2b1e',
        cobble: '#45474a',
        stone: '#3f3f3f',
        terracotta: '#6a3a2a',
        thatch: '#6a5a3a',
        slate: '#3a434a',
        grass: '#2f5a2f',
        default: '#1a1f2a'
      };

      const WALL_COLORS = {
        brick: '#3d2b23',
        brick_dark: '#2c1e19',
        wood_dark: '#2b231a',
        none: 'transparent',
        default: '#2d2f33'
      };

      const TEXTURE_FILES = {
        wood_oak: '/assets/sprites/wood_oak.png',
        wood_elm: '/assets/sprites/wood_elm.png',
        wood_dark: '/assets/sprites/wood_dark.png',
        stone: '/assets/sprites/stone.png',
        stone_cobble: '/assets/sprites/stone_cobble.png',
        brick_gray: '/assets/sprites/brick_gray.png',
        brick_red: '/assets/sprites/brick_red.png',
        brick_dark: '/assets/sprites/brick_dark.png',
        terracotta: '/assets/sprites/terracotta.png',
        thatch: '/assets/sprites/thatch.png',
        slate: '/assets/sprites/slate.png',
        grass: '/assets/sprites/grass.png',
        crosskeys: '/images/the_cross_keys_floor.jpg'
      };

      const TEXTURE_SCALES = {
        wall: {
          wood_oak: 0.15,
          wood_elm: 0.15,
          wood_dark: 0.15,
          stone: 0.5,
          stone_cobble: 0.1,
          brick_gray: 0.15,
          brick_red: 0.15,
          brick_dark: 0.15,
        },
        floor: {
          wood_oak: 0.15,
          wood_elm: 0.15,
          wood_dark: 0.15,
          stone: 0.25,
          stone_cobble: 0.15,
          brick_gray: 0.15,
          brick_red: 0.15,
          brick_dark: 0.15,
          terracotta: 0.2,
          thatch: 0.2,
          slate: 0.2,
          grass: 0.2,
          crosskeys: 1.0
        }
      };

      const TEXTURE_ALIASES = {
        wall: {
          brick: 'brick_gray',
          wood: 'wood_oak',
          cobble: 'stone_cobble',
          stone: 'stone',
          gravel: 'stone_cobble'
        },
        floor: {
          wood: 'wood_oak',
          stone: 'stone',
          cobble: 'stone_cobble',
          gravel: 'stone_cobble',
          brick: 'brick_gray'
        }
      };

      const SPRITE_MAP = {
        'the.cross.keys': '/assets/sprites/the_cross_keys.png',
        'the.swan': '/assets/sprites/the_swan.png',
        'the.dolphin': '/assets/sprites/the_dolphin.png',
        'chair': '/assets/sprites/chair.png',
        'table.round': '/assets/sprites/table_round.png',
        'table.rect': '/assets/sprites/table_rectangle.png',
        'table.sqr': '/assets/sprites/table_square.png',
        'table.hot': '/assets/sprites/table_hot.png',
        'table.cold': '/assets/sprites/table_cold.png',
        'table.prep': '/assets/sprites/table_prep.png',
        'table.plate': '/assets/sprites/table_plate.png',
        'bed': '/assets/sprites/bed.png',
        'bed.double': '/assets/sprites/bed_double.png',
        'bath': '/assets/sprites/bath.png',
        'chest': '/assets/sprites/chest_closed.png',
        'hearth': '/assets/sprites/hearth.png',
        'cooking.hearth': '/assets/sprites/cooking_hearth.png',
        'stairs': '/assets/sprites/stairs.png',
        'stairs.up': '/assets/sprites/stairs_up.png',
        'stairs.down': '/assets/sprites/stairs_down.png',
        'crate': '/assets/sprites/crate.png',
        'barrel': '/assets/sprites/barrel.png',
        'keg': '/assets/sprites/keg.png',
        'token.pc': '/assets/sprites/token_pc.png',
        'token.npc': '/assets/sprites/token_npc.png'
      };

      const TOKEN_SPRITE_OPTIONS = [
        { label: 'Default', value: '' },
        { label: 'Token PC', value: '/assets/sprites/token_pc.png' },
        { label: 'Token NPC', value: '/assets/sprites/token_npc.png' },
        { label: 'Barbarian Female', value: '/assets/sprites/barbarian_female.png' },
        { label: 'Barbarian Male', value: '/assets/sprites/barbarian_male.png' },
        { label: 'Bard Female', value: '/assets/sprites/bard_female.png' },
        { label: 'Bard Male', value: '/assets/sprites/bard_male.png' },
        { label: 'Cleric Female', value: '/assets/sprites/cleric_female.png' },
        { label: 'Cleric Male', value: '/assets/sprites/cleric_male.png' },
        { label: 'Druid Female', value: '/assets/sprites/druid_female.png' },
        { label: 'Druid Male', value: '/assets/sprites/druid_male.png' },
        { label: 'Fighter Female', value: '/assets/sprites/fighter_female.png' },
        { label: 'Fighter Male', value: '/assets/sprites/fighter_male.png' },
        { label: 'Monk Female', value: '/assets/sprites/monk_female.png' },
        { label: 'Monk Male', value: '/assets/sprites/monk_male.png' },
        { label: 'Paladin Female', value: '/assets/sprites/paladin_female.png' },
        { label: 'Paladin Male', value: '/assets/sprites/paladin_male.png' },
        { label: 'Ranger Female', value: '/assets/sprites/ranger_female.png' },
        { label: 'Ranger Male', value: '/assets/sprites/ranger_male.png' },
        { label: 'Rogue Male', value: '/assets/sprites/rogue_male.png' },
        { label: 'Rogue Female', value: '/assets/sprites/rouge_female.png' },
        { label: 'Sorcerer Female', value: '/assets/sprites/sorcerer_female.png' },
        { label: 'Sorcerer Male', value: '/assets/sprites/sorcerer_male.png' },
        { label: 'Warlock Female', value: '/assets/sprites/warlock_female.png' },
        { label: 'Warlock Male', value: '/assets/sprites/warlock_male.png' },
        { label: 'Wizard Female', value: '/assets/sprites/wizard_female.png' },
        { label: 'Wizard Male', value: '/assets/sprites/wizard_male.png' },
        { label: 'Bear', value: '/assets/sprites/bear.png' },
        { label: 'Bugbear', value: '/assets/sprites/bugbear.png' },
        { label: 'Dire Wolf', value: '/assets/sprites/dire_wolf.png' },
        { label: 'Dragonkin Black', value: '/assets/sprites/dragonkin_black.png' },
        { label: 'Dragonkin Blue', value: '/assets/sprites/dragonkin_blue.png' },
        { label: 'Dragonkin Green', value: '/assets/sprites/dragonkin_green.png' },
        { label: 'Dragonkin Red', value: '/assets/sprites/dragonkin_red.png' },
        { label: 'Dragonkin White', value: '/assets/sprites/dragonkin_white.png' },
        { label: 'Ghoul', value: '/assets/sprites/ghoul.png' },
        { label: 'Giant Rat', value: '/assets/sprites/giant_rat.png' },
        { label: 'Giant Spider', value: '/assets/sprites/giant_spider.png' },
        { label: 'Goblin', value: '/assets/sprites/goblin.png' },
        { label: 'Guard', value: '/assets/sprites/guard.png' },
        { label: 'Hobgoblin', value: '/assets/sprites/hobgoblin.png' },
        { label: 'Lich', value: '/assets/sprites/lich.png' },
        { label: 'Mimic', value: '/assets/sprites/mimic.png' },
        { label: 'Ogre', value: '/assets/sprites/ogre.png' },
        { label: 'Orc', value: '/assets/sprites/orc.png' },
        { label: 'Skeleton', value: '/assets/sprites/skeleton.png' },
        { label: 'Skeleton Archer', value: '/assets/sprites/skeleton_archer.png' },
        { label: 'Wight', value: '/assets/sprites/wight.png' },
        { label: 'Wolf', value: '/assets/sprites/wolf.png' },
        { label: 'Wraith', value: '/assets/sprites/wraith.png' },
        { label: 'Wraith 2', value: '/assets/sprites/wraith2.png' },
        { label: 'Zombie', value: '/assets/sprites/zombie.png' }
      ];

      const SPRITE_ALIASES = {
        'table.rect': 'table_rectangle',
        'table.sqr': 'table_square',
        'table.round': 'table_round',
        'table.hot': 'table_hot',
        'table.cold': 'table_cold',
        'table.prep': 'table_prep',
        'table.plate': 'table_plate',
        'bed.double': 'bed_double',
        'stairs.up': 'stairs_up',
        'stairs.down': 'stairs_down',
        'cooking.hearth': 'cooking_hearth',
        'door.wood': 'door_wood',
        'door': 'door_wood',
        'window.open': 'window_open',
        'window': 'window',
        'pc': 'token_pc',
        'npc': 'token_npc'
      };

      function resolveSpriteUrl(kind) {
        const raw = String(kind || '').trim().toLowerCase();
        if (!raw) return null;
        if (SPRITE_MAP[raw]) return SPRITE_MAP[raw];
        const alias = SPRITE_ALIASES[raw] || raw.replace(/[^a-z0-9]+/g, '_');
        return `/assets/sprites/${alias}.png`;
      }

      function resolveOpeningSprite(kindRaw, openPct) {
        const k = String(kindRaw || '').toLowerCase();
        if (k.startsWith('window.open')) return resolveSpriteUrl('window.open');
        if (k.startsWith('window')) return resolveSpriteUrl('window');
        if (k.startsWith('door')) {
          return resolveSpriteUrl(k);
        }
        return null;
      }

      function colStep() { return 1.5 * GRID.size; }
      function rowStep() { return Math.sqrt(3) * GRID.size; }

      function hexToWorld(col, row) {
        const x = col * colStep();
        const y = -(row * rowStep() + (col & 1) * (rowStep() / 2));
        return { x, y };
      }

      function getCameraWorld() {
        if (VIEW.cameraWorld && Number.isFinite(VIEW.cameraWorld.x) && Number.isFinite(VIEW.cameraWorld.y)) {
          return VIEW.cameraWorld;
        }
        return hexToWorld(VIEW.camera.col, VIEW.camera.row);
      }

      function setCameraWorld(p) {
        if (!p) return;
        VIEW.cameraWorld = { x: p.x, y: p.y };
      }

      function setCameraFromHex(p) {
        if (!p) return;
        const world = hexToWorld(p.col, p.row);
        VIEW.camera.col = p.col;
        VIEW.camera.row = p.row;
        setCameraWorld(world);
      }

      function worldToScreen(p) {
        const cam = getCameraWorld();
        const w = canvas.width / renderDpr;
        const h = canvas.height / renderDpr;
        return {
          x: w / 2 + (p.x - cam.x) * VIEW.zoom,
          y: h / 2 + (p.y - cam.y) * VIEW.zoom,
        };
      }

      function screenToWorld(x, y) {
        const cam = getCameraWorld();
        const w = canvas.width / renderDpr;
        const h = canvas.height / renderDpr;
        const wx = (x - w / 2) / VIEW.zoom + cam.x;
        const wy = (y - h / 2) / VIEW.zoom + cam.y;
        return { x: wx, y: wy };
      }

      function axialToCube(q, r) {
        return { x: q, z: r, y: -q - r };
      }

      function cubeRound(c) {
        let rx = Math.round(c.x);
        let ry = Math.round(c.y);
        let rz = Math.round(c.z);
        const dx = Math.abs(rx - c.x);
        const dy = Math.abs(ry - c.y);
        const dz = Math.abs(rz - c.z);
        if (dx > dy && dx > dz) rx = -ry - rz;
        else if (dy > dz) ry = -rx - rz;
        else rz = -rx - ry;
        return { x: rx, y: ry, z: rz };
      }

      function worldToHex(p) {
        const size = GRID.size || 1;
        const qf = (2 / 3) * (p.x / size);
        const rf = ((-p.y) / size) / Math.sqrt(3) - (qf / 2);
        const col = Math.round(qf);
        const rowf = rf + (col - (col & 1)) / 2;
        const row = Math.round(rowf);
        return { col, row };
      }

      function roundHalf(v) {
        return Math.round(v * 2) / 2;
      }

      function worldToHexHalf(p) {
        const size = GRID.size || 1;
        const qf = (2 / 3) * (p.x / size);
        const rf = ((-p.y) / size) / Math.sqrt(3) - (qf / 2);
        const col = Math.round(qf);
        const rowf = rf + (col - (col & 1)) / 2;
        const row = roundHalf(rowf);
        return { col, row };
      }

      function rowFromWorldYForCol(yWorld, col) {
        const size = GRID.size || 1;
        const rowf = (-yWorld / (Math.sqrt(3) * size)) - (col & 1) * 0.5;
        return roundHalf(rowf);
      }

      function roundQuarter(v) {
        return Math.round(v * 4) / 4;
      }

      function formatStep(v) {
        const s = roundQuarter(v).toFixed(2);
        return s.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      }

      function openingHexFromWorld(p) {
        const size = GRID.size || 1;
        const qf = (2 / 3) * (p.x / size);
        const rf = ((-p.y) / size) / Math.sqrt(3) - (qf / 2);
        const col = Math.round(qf);
        const rowf = rf + (col - (col & 1)) / 2;
        const row = roundQuarter(rowf);
        return { col, row };
      }

      function openingHexLabelFromCoords(col, row) {
        if (!Number.isFinite(col) || !Number.isFinite(row)) return null;
        const rowNum = row + 1;
        return indexToLetters(col) + formatStep(rowNum);
      }

      function indexToLetters(idx) {
        let n = idx;
        let out = '';
        while (n >= 0) {
          out = String.fromCharCode(65 + (n % 26)) + out;
          n = Math.floor(n / 26) - 1;
        }
        return out;
      }

      function lettersToIndex(letters) {
        let n = 0;
        for (let i = 0; i < letters.length; i++) {
          n = n * 26 + (letters.charCodeAt(i) - 64);
        }
        return n - 1;
      }

      function toHexLabel(col, row) {
        return indexToLetters(col) + String(row + 1);
      }

      function parseHexLabel(label) {
        if (!label) return null;
        const m = String(label).trim().toUpperCase().match(/^([A-Z]+)(-?\d+(?:\.\d+)?)$/);
        if (!m) return null;
        const col = lettersToIndex(m[1]);
        const row = parseFloat(m[2]) - 1;
        return { col, row };
      }

      const { getQueryParams, escapeHtml, normStr, getAuthHeaders } = createContracts();

      const { loadPrefs, savePrefs, initSectionCollapse } = createPrefsController({
        UI,
        BACKDROP,
        elements: {
          hexGridToggle,
          labelBoldToggle,
          handlesToggle,
          hideRoofsToggle,
          streetViewToggle,
          roofLineColorInput,
          roofLineWidthInput,
          fogToggle,
          videoSelect,
          polyAlphaInput,
          backdropToggle,
          mapOffsetXInput,
          mapOffsetYInput,
          mapScaleInput,
          mapRotInput,
        },
      });

      function isEditorToggleHotkey(ev) {
        if (!ev) return false;
        const key = String(ev.key || '').toLowerCase();
        if (key !== EDITOR_HOTKEY.key) return false;
        if (!!ev.ctrlKey !== !!EDITOR_HOTKEY.ctrl) return false;
        if (!!ev.shiftKey !== !!EDITOR_HOTKEY.shift) return false;
        if (ev.altKey || ev.metaKey) return false;
        return true;
      }

      function setEditorMode(enabled) {
        const next = !!enabled;
        editorMode = next;
        if (toolbar) toolbar.style.display = next ? '' : 'none';
        if (inspectorSection) inspectorSection.style.display = next ? '' : 'none';
        if (!next) {
          if (EDITOR.tool !== 'select') setTool('select');
          if (EDITOR.selection && EDITOR.selection.type !== 'token') clearSelection();
        }
        render();
      }

      function setTool(tool) {
        if (!editorMode && tool !== 'select') return;
        const isRoof = tool === 'roof';
        const nextTool = isRoof ? 'poly' : tool;
        if (nextTool === 'poly') {
          EDITOR.polyMode = isRoof ? 'roof' : 'room';
        }
        EDITOR.tool = nextTool;
        Object.entries(toolButtons).forEach(([key, btn]) => {
          if (!btn) return;
          let active = false;
          if (key === 'poly') active = (nextTool === 'poly' && EDITOR.polyMode === 'room');
          else if (key === 'roof') active = (nextTool === 'poly' && EDITOR.polyMode === 'roof');
          else active = (key === nextTool);
          btn.classList.toggle('active', active);
        });
        EDITOR.roomStart = null;
        EDITOR.polyPoints = [];
        EDITOR.polyHover = null;
        if (openingGroup) openingGroup.style.display = tool === 'opening' ? 'flex' : 'none';
        if (objectGroup) objectGroup.style.display = tool === 'object' ? 'flex' : 'none';
        if (tokenGroup) tokenGroup.style.display = tool === 'token' ? 'flex' : 'none';
        if (canvasWrap) canvasWrap.style.cursor = nextTool === 'poly' ? 'crosshair' : 'default';
      }

      function drawHexOutline(gctx, center, size) {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 180) * (60 * i);
          pts.push({ x: center.x + size * Math.cos(a), y: center.y + size * Math.sin(a) });
        }
        gctx.beginPath();
        gctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) gctx.lineTo(pts[i].x, pts[i].y);
        gctx.closePath();
        gctx.stroke();
      }

      function drawGridLayer(gctx) {
        if (!UI.hexGrid) return;
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        const camHex = worldToHex(getCameraWorld());
        const colsR = Math.ceil((w / 2) / colStep()) + 4;
        const rowsR = Math.ceil((h / 2) / rowStep()) + 4;

        gctx.save();
        gctx.strokeStyle = `rgba(255,255,255,${GRID.lineAlpha})`;
        gctx.lineWidth = GRID.lineWidth;
        const size = GRID.size * VIEW.zoom;

        for (let dc = -colsR; dc <= colsR; dc++) {
          for (let dr = -rowsR; dr <= rowsR; dr++) {
            const col = camHex.col + dc;
            const row = camHex.row + dr;
            const p = worldToScreen(hexToWorld(col, row));
            if (p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 100) continue;
            drawHexOutline(gctx, p, size);
          }
        }

        const bright = !!UI.brightLabels;
        gctx.globalAlpha = bright ? 1 : GRID.labelAlpha;
        gctx.fillStyle = bright ? 'rgba(233,238,247,0.96)' : 'rgba(233,238,247,0.65)';
        const fontScale = Math.min(1.6, VIEW.zoom);
        const fontSize = Math.min(18, (bright ? 13 : 11) * fontScale);
        gctx.font = bright
          ? `900 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`
          : `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`;
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';

        if (bright) {
          gctx.lineWidth = 3;
          gctx.strokeStyle = 'rgba(0,0,0,0.70)';
          gctx.lineJoin = 'round';
        }

        for (let dc = -colsR; dc <= colsR; dc++) {
          for (let dr = -rowsR; dr <= rowsR; dr++) {
            const col = camHex.col + dc;
            const row = camHex.row + dr;
            const p = worldToScreen(hexToWorld(col, row));
            if (p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 100) continue;
            const label = toHexLabel(col, row);
            const lx = p.x;
            const ly = p.y + 2;
            if (bright) gctx.strokeText(label, lx, ly);
            gctx.fillText(label, lx, ly);
          }
        }

        gctx.restore();
      }

      function drawHandle(gctx, center, size) {
        const r = size;
        gctx.beginPath();
        gctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        gctx.stroke();
        gctx.beginPath();
        gctx.moveTo(center.x - r * 1.6, center.y);
        gctx.lineTo(center.x + r * 1.6, center.y);
        gctx.moveTo(center.x, center.y - r * 1.6);
        gctx.lineTo(center.x, center.y + r * 1.6);
        gctx.stroke();
      }

      function drawHandlesLayer(floor, gctx) {
        const show = UI.showHandles || UI.handleHot;
        if (!show || !floor) return;
        const objects = filterAlive(floor.objects || []);
        if (!objects.length) return;
        gctx.save();
        gctx.strokeStyle = 'rgba(255,145,0,0.9)';
        gctx.lineWidth = 1.5;
        const size = Math.max(4, Math.min(10, 6 * VIEW.zoom));
        for (const obj of objects) {
          const world = objectWorldCenter(obj);
          if (!world) continue;
          const center = worldToScreen(world);
          drawHandle(gctx, center, size);
        }
        gctx.restore();
      }

      function drawRoomEdgeHandles(floor, gctx) {
        const show = UI.showHandles || UI.handleHot;
        if (!show || !floor) return;
        const sel = EDITOR.selection;
        const isRoom = sel && sel.type === 'room';
        const isRoof = sel && sel.type === 'roof';
        if ((!isRoom && !isRoof) || !sel || !sel.item) return;
        if (String(sel.floorId) !== String(floor.id)) return;
        const polyLabels = getPolyPointLabels(sel.item);
        if (polyLabels) {
          const pts = isRoof ? roofWorldPoints(sel.item) : labelsToWorldPoints(polyLabels);
          if (!pts.length) return;
          const hidden = isRoom ? getPolyEdgeHiddenSet(sel.item) : new Set();
          const hiddenLines = isRoof ? getRoofLineHiddenSet(sel.item) : new Set();
          const center = polyCenterWorld(pts);
          gctx.save();
          gctx.strokeStyle = 'rgba(255,145,0,0.95)';
          gctx.lineWidth = 1.6;
          const size = Math.max(5, Math.min(12, 7 * VIEW.zoom));
          for (const p of pts) {
            const sp = worldToScreen(p);
            drawHandle(gctx, sp, size);
          }
          if (isRoom) {
            const edgeSize = Math.max(5, Math.min(11, 6 * VIEW.zoom));
            for (let i = 0; i < pts.length; i++) {
              const a = pts[i];
              const b = pts[(i + 1) % pts.length];
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              const sp = worldToScreen(mid);
              gctx.strokeStyle = hidden.has(i) ? 'rgba(255,80,80,0.35)' : 'rgba(255,80,80,0.95)';
              drawHandle(gctx, sp, edgeSize);
            }
          }
          if (isRoof) {
            const edgeSize = Math.max(5, Math.min(11, 6 * VIEW.zoom));
            const aAdj = Number(sel.item && sel.item.spineAdjustA) || 0;
            const bAdj = Number(sel.item && sel.item.spineAdjustB) || 0;
            const aPos = aAdj > 0;
            const bPos = bAdj > 0;
            const targetInfo = getRoofConnectorTargets(sel.item, pts);
            const autoHidePairs = [];
            if (targetInfo) {
              if (!targetInfo.isHorizontal) {
                if (aPos && targetInfo.north.length >= 2) autoHidePairs.push([targetInfo.north[0], targetInfo.north[1]]);
                if (bPos && targetInfo.south.length >= 2) autoHidePairs.push([targetInfo.south[0], targetInfo.south[1]]);
              } else {
                if (aPos && targetInfo.west.length >= 2) autoHidePairs.push([targetInfo.west[0], targetInfo.west[1]]);
                if (bPos && targetInfo.east.length >= 2) autoHidePairs.push([targetInfo.east[0], targetInfo.east[1]]);
              }
            }
            const samePoint = (p1, p2) => {
              if (!p1 || !p2) return false;
              return Math.abs(p1.x - p2.x) < 0.0001 && Math.abs(p1.y - p2.y) < 0.0001;
            };
            const edgeMatchesPair = (p1, p2, pair) => {
              if (!pair || pair.length < 2) return false;
              const a = pair[0];
              const b = pair[1];
              return (samePoint(p1, a) && samePoint(p2, b)) || (samePoint(p1, b) && samePoint(p2, a));
            };
            for (let i = 0; i < pts.length; i++) {
              const a = pts[i];
              const b = pts[(i + 1) % pts.length];
              const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              const sp = worldToScreen(mid);
              const edgeKey = `edge:${i}`;
              let isHidden = hiddenLines.has(edgeKey);
              if (!isHidden && autoHidePairs.length) {
                isHidden = autoHidePairs.some(pair => edgeMatchesPair(a, b, pair));
              }
              gctx.strokeStyle = isHidden ? 'rgba(255,80,80,0.35)' : 'rgba(255,80,80,0.95)';
              drawHandle(gctx, sp, edgeSize);
            }
            if (sel.item && sel.item.spine && targetInfo) {
              const lineSize = Math.max(5, Math.min(11, 6 * VIEW.zoom));
              const drawLineHandle = (key, p1, p2) => {
                if (!p1 || !p2) return;
                const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
                const sp = worldToScreen(mid);
                const isHidden = hiddenLines.has(key);
                gctx.strokeStyle = isHidden ? 'rgba(255,80,80,0.35)' : 'rgba(255,80,80,0.95)';
                drawHandle(gctx, sp, lineSize);
              };
              drawLineHandle('spine', sel.item.spine.a, sel.item.spine.b);
              const aTargets = targetInfo.targetsA || [];
              const bTargets = targetInfo.targetsB || [];
              for (let i = 0; i < aTargets.length; i++) {
                drawLineHandle(`conn:a:${i}`, sel.item.spine.a, aTargets[i]);
              }
              for (let i = 0; i < bTargets.length; i++) {
                drawLineHandle(`conn:b:${i}`, sel.item.spine.b, bTargets[i]);
              }
            }
          }
          if (center) {
            const sc = worldToScreen(center);
            drawHandle(gctx, sc, Math.max(6, size));
          }
          gctx.restore();
          if (isRoof && sel.item && sel.item.spine) {
            const handleSize = Math.max(5, Math.min(11, 6 * VIEW.zoom));
            drawSpineHandle(gctx, worldToScreen(sel.item.spine.a), handleSize, '#f3d04f');
            drawSpineHandle(gctx, worldToScreen(sel.item.spine.b), handleSize, '#58a8ff');
          }
          return;
        }
        return;
      }

      function getPolyHandleHit(room, screenPoint) {
        const labels = getPolyPointLabels(room);
        if (!labels) return null;
        const pts = room && room.fullRotOn ? roofWorldPoints(room) : labelsToWorldPoints(labels);
        if (!pts.length) return null;
        const hitR = Math.max(8, Math.min(14, 9 * VIEW.zoom));
        const hitRadius2 = hitR * hitR;
        for (let i = 0; i < pts.length; i++) {
          const sp = worldToScreen(pts[i]);
          const dx = sp.x - screenPoint.x;
          const dy = sp.y - screenPoint.y;
          if (dx * dx + dy * dy <= hitRadius2) {
            return { type: 'poly-point', index: i };
          }
        }
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          const sp = worldToScreen(mid);
          const dx = sp.x - screenPoint.x;
          const dy = sp.y - screenPoint.y;
          if (dx * dx + dy * dy <= hitRadius2) {
            return { type: 'poly-edge', index: i };
          }
        }
        const center = polyCenterWorld(pts);
        if (center) {
          const sc = worldToScreen(center);
          const dx = sc.x - screenPoint.x;
          const dy = sc.y - screenPoint.y;
          if (dx * dx + dy * dy <= hitRadius2) {
            return { type: 'poly-move' };
          }
        }
        return null;
      }


      function drawPolyPreview(gctx) {
        if (EDITOR.tool !== 'poly' || !Array.isArray(EDITOR.polyPoints) || !EDITOR.polyPoints.length) return;
        const pts = EDITOR.polyPoints.map(p => p.world).filter(Boolean);
        if (!pts.length) return;
        const hover = EDITOR.polyHover && EDITOR.polyHover.world ? EDITOR.polyHover.world : null;
        gctx.save();
        gctx.strokeStyle = 'rgba(88, 220, 120, 0.9)';
        gctx.lineWidth = 2;
        gctx.setLineDash([6, 6]);
        gctx.beginPath();
        const first = worldToScreen(pts[0]);
        gctx.moveTo(first.x, first.y);
        for (let i = 1; i < pts.length; i++) {
          const p = worldToScreen(pts[i]);
          gctx.lineTo(p.x, p.y);
        }
        if (hover) {
          const ph = worldToScreen(hover);
          gctx.lineTo(ph.x, ph.y);
        }
        gctx.stroke();
        gctx.restore();
      }

      function roomCornersFromWorld(start, end) {
        const x1 = Math.min(start.x, end.x);
        const x2 = Math.max(start.x, end.x);
        const y1 = Math.min(start.y, end.y);
        const y2 = Math.max(start.y, end.y);
        const cornersWorld = [
          { x: x1, y: y1 },
          { x: x2, y: y1 },
          { x: x2, y: y2 },
          { x: x1, y: y2 }
        ];
        return cornersWorld.map((p) => {
          const hex = worldToHexHalf(p);
          return toHexLabel(hex.col, hex.row);
        });
      }

      function setPolyPoint(room, index, label) {
        if (!room) return;
        const points = Array.isArray(room.points) ? room.points
          : (Array.isArray(room.poly) ? room.poly : (Array.isArray(room.vertices) ? room.vertices : null));
        if (Array.isArray(points)) {
          if (index < 0 || index >= points.length) return;
          points[index] = label;
          if (Array.isArray(room.points)) room.points = points.slice();
          else if (Array.isArray(room.poly)) room.poly = points.slice();
          else if (Array.isArray(room.vertices)) room.vertices = points.slice();
          else room.points = points.slice();
          return;
        }
        const corners = Array.isArray(room.corners) ? room.corners.slice() : [];
        if (!corners.length || index < 0 || index >= corners.length) return;
        corners[index] = label;
        room.corners = corners;
      }

      function setPolyPoints(room, labels) {
        if (!room || !Array.isArray(labels) || labels.length < 3) return;
        if (Array.isArray(room.points)) room.points = labels.slice();
        else if (Array.isArray(room.poly)) room.poly = labels.slice();
        else if (Array.isArray(room.vertices)) room.vertices = labels.slice();
        else if (Array.isArray(room.corners) && room.corners.length >= 3) room.corners = labels.slice();
        else room.points = labels.slice();
      }

      function clampZoom(value) {
        const min = zoomInput ? Number(zoomInput.min) : 0.05;
        const max = zoomInput ? Number(zoomInput.max) : 4;
        if (!Number.isFinite(min) || !Number.isFinite(max)) return value;
        return Math.max(min, Math.min(max, value));
      }

      function setZoom(value) {
        const next = clampZoom(value);
        VIEW.zoom = next;
        if (zoomInput) zoomInput.value = String(next);
        if (zoomLevel) zoomLevel.textContent = `${Math.round(next * 100)}%`;
        render();
      }
      
      const { resolveBattleId, getCampaignId, resolvePoiId, buildMapOptionsFromMeta, extractScene, applyViewFromState, normalizeState, loadCampaign, loadMapOptions, loadBattle } = createApiController({
              STATE,
              VIEW,
              mapSelect,
              updateRoofSpine,
              normalizeRoofWeathering,
              parseHexLabel,
              setCameraFromHex,
              getQueryParams,
              getAuthHeaders,
            });
            

      function buildTokens() {
        const pickEntityList = () => {
          if (Array.isArray(STATE.entities) && STATE.entities.length) return STATE.entities;
          const candidates = [
            STATE && STATE.campaign && STATE.campaign.world && STATE.campaign.world.entities,
            STATE && STATE.campaign && STATE.campaign.entities,
            STATE && STATE.battle && STATE.battle.world && STATE.battle.world.entities,
            STATE && STATE.battle && STATE.battle.entities
          ];
          for (const list of candidates) {
            if (Array.isArray(list) && list.length) return list;
          }
          return [];
        };
        const poiId = String(resolvePoiId() || '').trim();
        const entities = pickEntityList();
        return entities
          .filter(e => {
            if (!e || e.deleted) return false;
            const loc = (e.location && typeof e.location === 'object') ? e.location : {};
            const entityPoi = String(e.poi_id ?? e.poiId ?? loc.poi_id ?? loc.poiId ?? '').trim();
            // If current map has no POI mapping, do not discard POI-bound entities.
            if (!entityPoi || !poiId) return true;
            return entityPoi === poiId;
          })
          .map(e => {
            const loc = e.location || e.position || {};
            const toHexLabelFromCoords = (colRaw, rowRaw) => {
              const col = Number(colRaw);
              const row = Number(rowRaw);
              if (!Number.isFinite(col) || !Number.isFinite(row)) return '';
              return toHexLabel(col, row);
            };
            const normalizeHex = (value) => {
              if (typeof value === 'string') return value.trim().toUpperCase();
              if (value && typeof value === 'object') {
                const col = value.col ?? value.q ?? value.x;
                const row = value.row ?? value.r ?? value.y;
                return toHexLabelFromCoords(col, row);
              }
              return '';
            };
            const hex = normalizeHex(
              e.hex ||
              loc.hex ||
              loc.hex_label ||
              loc.hexLabel ||
              toHexLabelFromCoords(
                e.col ?? loc.col ?? loc.q ?? loc.x,
                e.row ?? loc.row ?? loc.r ?? loc.y
              )
            );
            const floorRaw = e.floorId ?? loc.floorId ?? loc.floor_id ?? loc.floor ?? e.floor_id ?? '';
            const floorId = floorRaw == null ? '' : String(floorRaw);
            return {
              id: String(e.id || e.character_id || ''),
              characterId: e.character_id || e.characterId || '',
              name: e.name || e.label || e.title || e.id,
              hex,
              floorId,
              kind: e.kind || 'pc',
              sprite: e.sprite || (e.appearance && e.appearance.sprite) || '',
              spriteScale: (e.appearance && (e.appearance.sprite_scale ?? e.appearance.spriteScale)) ?? e.spriteScale ?? null,
              hp: e.hp || (e.stats && e.stats.hp) || null,
              hp_max: e.hp_max || (e.stats && e.stats.hp_max) || null,
              init: e.init || (e.stats && e.stats.init) || null,
              side: e.side || (e.kind === 'npc' ? 'NPC' : 'PC'),
              hostility: e.hostility || (e.stats && e.stats.hostility) || '',
              conditions: e.conditions || (e.stats && e.stats.conditions) || null,
              __entity: e
            };
          });
      }
            const {
        chatStatusClass,
        populateChatSpeakerSelect,
        renderChat,
        mergeChatRows,
        fetchChat,
        pollChat,
        startChatPolling,
        sendChatMessage,
      } = createChatController({
        CHAT,
        chatLog,
        chatSpeaker,
        chatInput,
        getCampaignId,
        getAuthHeaders,
        escapeHtml,
        normStr,
        buildTokens,
      });
            function renderStatus() {
              if (!statusBody || !statusMeta) return;
              const tokens = buildTokens();
              const turn = (STATE.battle && (STATE.battle.turn || STATE.battle.meta && STATE.battle.meta.turn)) || {};
              const round = turn.round ?? (STATE.battle && STATE.battle.meta && STATE.battle.meta.round);
              const activeId = turn.activeTokenId || turn.active_token_id || turn.activeToken || turn.active_token || '';
              const activeToken = tokens.find(t => String(t.id) === String(activeId) || String(t.characterId || '') === String(activeId));
              const activeName = activeToken ? activeToken.name : (turn.activeName || turn.active_name || '');

              statusMeta.innerHTML = [
                `<div class="statusPill">Round <strong>${round != null ? round : '–'}</strong></div>`,
                `<div class="statusPill">Active <strong>${activeName || '–'}</strong></div>`
              ].join('');

              const sorted = tokens.slice().sort((a, b) => {
                const ai = Number.isFinite(Number(a.init)) ? Number(a.init) : -9999;
                const bi = Number.isFinite(Number(b.init)) ? Number(b.init) : -9999;
                if (ai !== bi) return bi - ai;
                return String(a.name || a.id).localeCompare(String(b.name || b.id));
              });

              statusBody.innerHTML = sorted.map(t => {
                const isActive = activeId && (String(t.id) === String(activeId) || String(t.characterId || '') === String(activeId));
                const hostilityRaw = String((t.__entity && t.__entity.hostility) || t.hostility || '').toLowerCase();
                const isFriendly = String(t.kind || '').toLowerCase() === 'pc' || String(t.side || '').toUpperCase() === 'PC';
                const isHostile = hostilityRaw === 'hostile' || String(t.kind || '').toLowerCase() === 'monster';
                const hostility = isHostile ? 'hostile' : (isFriendly ? 'friendly' : 'neutral');
                const nameClass = `statusName status-${hostility}`;
                const markerClass = `statusTurnMarker${isActive ? '' : ' inactive'}`;
                const initText = Number.isFinite(Number(t.init)) ? String(t.init) : '–';
                const hpCur = Number.isFinite(Number(t.hp)) ? Number(t.hp) : null;
                const hpMax = Number.isFinite(Number(t.hp_max)) ? Number(t.hp_max) : null;
                const hpText = hpCur != null ? (hpMax != null ? `${hpCur}/${hpMax}` : String(hpCur)) : '–';
                const conditions = Array.isArray(t.conditions) ? t.conditions : (t.cond ? [t.cond] : []);
                const hasIntent = !!(t.__entity && (t.__entity.intent || t.__entity.intent_text || t.__entity.intentText));
                const intentClass = `statusIntent${hasIntent ? ' on' : ''}`;
                const condHtml = conditions.length ? conditions.map(c => `<span>${String(c)}</span>`).join(' ') : '';
                const intentHtml = `<span class="${intentClass}" title="Intent">${hasIntent ? '✓' : ''}</span>`;
                return `
                  <tr class="statusRow${isActive ? ' active' : ''}">
                    <td class="statusNameCell">
                      <span class="${markerClass}" aria-hidden="true"></span>
                      <span class="${nameClass}">${t.name || t.id}</span>
                    </td>
                    <td class="statusNum">${initText}</td>
                    <td class="statusNum">${hpText}</td>
                    <td><div class="statusCond">${condHtml}${intentHtml}</div></td>
                  </tr>
                `;
              }).join('');
              populateChatSpeakerSelect();
            }

            function setFloorOptions() {
              floorSelect.innerHTML = '';
              const floors = STATE.battle ? STATE.battle.floors : [];
              floors.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.name || f.id;
                floorSelect.appendChild(opt);
              });
              if (!VIEW.floorId && floors[0]) VIEW.floorId = floors[0].id;
              floorSelect.value = VIEW.floorId;
            }

            function pickFloor() {
              const floors = STATE.battle ? STATE.battle.floors : [];
              return floors.find(f => f.id === VIEW.floorId) || floors[0];
            }

            function autoCenterCamera() {
              if (!STATE.battle) return;
              const view = STATE.battle.view || {};
              if (view.camera_hex || view.cameraHex) return;
              const floor = pickFloor();
              if (!floor) return;
              let target = null;
              if (Array.isArray(floor.rooms) && floor.rooms.length) {
                const labels = roomPointLabels(floor.rooms[0]);
                const pts = labels.map(parseHexLabel).filter(Boolean);
                if (pts.length) {
                  const avg = pts.reduce((acc, p) => ({ col: acc.col + p.col, row: acc.row + p.row }), { col: 0, row: 0 });
                  target = { col: avg.col / pts.length, row: avg.row / pts.length };
                }
              }
              if (!target && Array.isArray(floor.objects) && floor.objects.length) {
                target = parseHexLabel(floor.objects[0].hex);
              }
              if (!target) {
                const tokens = buildTokens();
                if (tokens.length) target = parseHexLabel(tokens[0].hex);
              }
              if (target) setCameraFromHex({ col: Math.round(target.col), row: Math.round(target.row) });
            }

            function nudgeCamera(dxWorld, dyWorld) {
              const cam = getCameraWorld();
              const next = { x: cam.x + dxWorld, y: cam.y + dyWorld };
              setCameraWorld(next);
              render();
            }

            
            
      function roomWallKind(room) {
        const wall = room && room.wall && typeof room.wall === 'object' ? room.wall : null;
        const kind = wall && wall.kind != null ? String(wall.kind) : '';
        const type = wall && wall.type != null ? String(wall.type) : '';
        return (kind || type || 'brick').toLowerCase();
      }

      function roomHasWalls(room) {
        const thickness = Number(room && room.thickness != null ? room.thickness : 0);
        return thickness > 0 && roomWallKind(room) !== 'none';
      }

      function roomPointLabels(room) {
        if (!room || typeof room !== 'object') return [];
        const points = Array.isArray(room.points) ? room.points
          : (Array.isArray(room.poly) ? room.poly : (Array.isArray(room.vertices) ? room.vertices : null));
        if (Array.isArray(points) && points.length >= 3) return points;
        const corners = Array.isArray(room.corners) ? room.corners : [];
        return corners.length >= 3 ? corners : [];
      }

      function getPolyPointLabels(room) {
        if (!room || typeof room !== 'object') return null;
        const points = Array.isArray(room.points) ? room.points
          : (Array.isArray(room.poly) ? room.poly : (Array.isArray(room.vertices) ? room.vertices : null));
        if (Array.isArray(points) && points.length >= 3) return points;
        const corners = Array.isArray(room.corners) ? room.corners : [];
        return corners.length >= 3 ? corners : null;
      }

      function getPolyEdgeHiddenArray(room) {
        if (!room || typeof room !== 'object') return [];
        const raw = room.edge_hidden ?? room.edgeHidden ?? room.hidden_edges ?? room.hiddenEdges;
        if (Array.isArray(raw)) return raw.map(Number).filter(n => Number.isFinite(n) && n >= 0);
        if (typeof raw === 'string') {
          return raw.split(/[,\s]+/).map(Number).filter(n => Number.isFinite(n) && n >= 0);
        }
        return [];
      }

      function getPolyEdgeHiddenSet(room) {
        return new Set(getPolyEdgeHiddenArray(room));
      }

      function setPolyEdgeHiddenArray(room, arr) {
        if (!room || typeof room !== 'object') return;
        const cleaned = Array.isArray(arr)
          ? arr.map(Number).filter(n => Number.isFinite(n) && n >= 0)
          : [];
        if (!cleaned.length) {
          delete room.edge_hidden;
          delete room.edgeHidden;
          return;
        }
        room.edge_hidden = Array.from(new Set(cleaned)).sort((a, b) => a - b);
      }

      function togglePolyEdgeHidden(room, index, count) {
        if (!room || !Number.isFinite(index)) return;
        const len = Number.isFinite(count) ? count : 0;
        if (len && (index < 0 || index >= len)) return;
        const arr = getPolyEdgeHiddenArray(room);
        const idx = arr.indexOf(index);
        if (idx === -1) arr.push(index);
        else arr.splice(idx, 1);
        setPolyEdgeHiddenArray(room, arr);
      }

      function clampUnitInterval(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return 0;
        return Math.max(0, Math.min(1, num));
      }

      function normalizeRoofWeathering(roof) {
        if (!roof || typeof roof !== 'object') return null;
        const raw = (roof.weathering && typeof roof.weathering === 'object') ? roof.weathering : {};
        const next = {};
        for (const key of ROOF_WEATHERING_KEYS) {
          const value = raw[key];
          next[key] = (value == null) ? ROOF_WEATHERING_DEFAULTS[key] : clampUnitInterval(value);
        }
        const rawSeed = raw.seed != null ? String(raw.seed).trim() : '';
        const idSeed = roof.id != null ? String(roof.id).trim() : '';
        if (rawSeed) next.seed = rawSeed;
        else if (idSeed) next.seed = idSeed;
        roof.weathering = next;
        return next;
      }

      const ROOF_WEATHER_MAP_CACHE = new Map();
      const ROOF_WEATHER_PATTERN_CACHE = new WeakMap();

      function touchLruCacheEntry(cache, key, value, limit) {
        if (!cache || key == null) return;
        if (cache.has(key)) cache.delete(key);
        cache.set(key, value);
        const max = Number.isFinite(Number(limit)) ? Math.max(1, Math.floor(Number(limit))) : 0;
        if (!max) return;
        while (cache.size > max) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey == null) break;
          cache.delete(oldestKey);
        }
      }

      function seedHash32(value) {
        const text = String(value == null ? '' : value);
        let h = 2166136261;
        for (let i = 0; i < text.length; i++) {
          h ^= text.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        return h >>> 0;
      }

      function createSeededRng(seedValue) {
        let state = (seedValue >>> 0) || 1;
        return () => {
          state += 0x6D2B79F5;
          let t = state;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      function createWeatherLayerCanvas(size) {
        const canvasEl = document.createElement('canvas');
        canvasEl.width = size;
        canvasEl.height = size;
        const gctx = canvasEl.getContext('2d');
        gctx.clearRect(0, 0, size, size);
        return { canvas: canvasEl, gctx };
      }

      function paintSoftBlob(gctx, x, y, radius, rgb, alpha) {
        if (!gctx || !Number.isFinite(radius) || radius <= 0 || alpha <= 0) return;
        const c0 = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.max(0, Math.min(1, alpha))})`;
        const c1 = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`;
        const grad = gctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        grad.addColorStop(0, c0);
        grad.addColorStop(1, c1);
        gctx.fillStyle = grad;
        gctx.beginPath();
        gctx.arc(x, y, radius, 0, Math.PI * 2);
        gctx.fill();
      }

      function paintBlobLayer(gctx, rng, options) {
        if (!gctx || !rng || !options) return;
        const size = Number(options.size) || ROOF_WEATHER_TEXTURE_SIZE;
        const count = Math.max(0, Number(options.count) || 0);
        const minR = Math.max(0.5, Number(options.minR) || 1);
        const maxR = Math.max(minR, Number(options.maxR) || minR);
        const alphaMin = Math.max(0, Number(options.alphaMin) || 0);
        const alphaMax = Math.max(alphaMin, Number(options.alphaMax) || alphaMin);
        const colorFn = typeof options.colorFn === 'function'
          ? options.colorFn
          : (() => [0, 0, 0]);
        const yFn = typeof options.yFn === 'function'
          ? options.yFn
          : (() => rng() * size);
        for (let i = 0; i < count; i++) {
          const x = rng() * size;
          const y = yFn(rng, size, i);
          const radius = minR + (maxR - minR) * rng();
          const alpha = alphaMin + (alphaMax - alphaMin) * rng();
          const rgb = colorFn(rng, i);
          paintSoftBlob(gctx, x, y, radius, rgb, alpha);
        }
      }

      function buildRoofWeatherMaps(seedKey) {
        const size = ROOF_WEATHER_TEXTURE_SIZE;
        const keyBase = String(seedKey || 'roof-weather');

        const aging = createWeatherLayerCanvas(size);
        const moss = createWeatherLayerCanvas(size);
        const mottlingDark = createWeatherLayerCanvas(size);
        const mottlingLight = createWeatherLayerCanvas(size);
        const streaks = createWeatherLayerCanvas(size);
        const repairs = createWeatherLayerCanvas(size);

        const agingRng = createSeededRng(seedHash32(`${keyBase}:aging`));
        const mossRng = createSeededRng(seedHash32(`${keyBase}:moss`));
        const darkRng = createSeededRng(seedHash32(`${keyBase}:mottling-dark`));
        const lightRng = createSeededRng(seedHash32(`${keyBase}:mottling-light`));
        const streakRng = createSeededRng(seedHash32(`${keyBase}:streaks`));
        const repairRng = createSeededRng(seedHash32(`${keyBase}:repairs`));

        paintBlobLayer(aging.gctx, agingRng, {
          size,
          count: 300,
          minR: 8,
          maxR: 44,
          alphaMin: 0.05,
          alphaMax: 0.18,
          colorFn: () => [0, 0, 0]
        });

        paintBlobLayer(moss.gctx, mossRng, {
          size,
          count: 300,
          minR: 6,
          maxR: 32,
          alphaMin: 0.08,
          alphaMax: 0.26,
          colorFn: (rng) => {
            const hueOffset = Math.round(rng() * 20);
            return [70 + hueOffset, 95 + hueOffset, 58 + Math.round(rng() * 10)];
          },
          yFn: (rng, s) => {
            const topBias = Math.pow(rng(), 1.85);
            return topBias * s * 0.78;
          }
        });

        paintBlobLayer(mottlingDark.gctx, darkRng, {
          size,
          count: 1200,
          minR: 1,
          maxR: 5,
          alphaMin: 0.035,
          alphaMax: 0.16,
          colorFn: () => [0, 0, 0]
        });
        paintBlobLayer(mottlingLight.gctx, lightRng, {
          size,
          count: 980,
          minR: 1,
          maxR: 4,
          alphaMin: 0.03,
          alphaMax: 0.13,
          colorFn: () => [255, 255, 255]
        });

        const strokeColor = [40, 43, 49];
        streaks.gctx.lineCap = 'round';
        streaks.gctx.lineJoin = 'round';
        for (let i = 0; i < 160; i++) {
          const x = streakRng() * size;
          const y = -size * 0.05 + streakRng() * size * 0.55;
          const len = size * (0.2 + streakRng() * 0.95);
          const drift = (streakRng() - 0.5) * size * 0.2;
          const width = 0.9 + streakRng() * 2.8;
          const a = 0.1 + streakRng() * 0.28;
          const grad = streaks.gctx.createLinearGradient(x, y, x + drift, y + len);
          grad.addColorStop(0, `rgba(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]},${a})`);
          grad.addColorStop(0.65, `rgba(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]},${a * 0.52})`);
          grad.addColorStop(1, `rgba(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]},0)`);
          streaks.gctx.strokeStyle = grad;
          streaks.gctx.lineWidth = width;
          streaks.gctx.beginPath();
          streaks.gctx.moveTo(x, y);
          streaks.gctx.quadraticCurveTo(x + drift * 0.25, y + len * 0.45, x + drift, y + len);
          streaks.gctx.stroke();
        }

        for (let i = 0; i < 52; i++) {
          const w = size * (0.03 + repairRng() * 0.12);
          const h = size * (0.02 + repairRng() * 0.06);
          const x = repairRng() * size;
          const y = repairRng() * size;
          const rot = (repairRng() - 0.5) * 0.8;
          const alpha = 0.18 + repairRng() * 0.34;
          const dark = 80 + Math.round(repairRng() * 45);
          const mid = dark + 8 + Math.round(repairRng() * 28);
          repairs.gctx.save();
          repairs.gctx.translate(x, y);
          repairs.gctx.rotate(rot);
          repairs.gctx.fillStyle = `rgba(${dark},${dark},${mid},${alpha})`;
          repairs.gctx.fillRect(-w / 2, -h / 2, w, h);
          repairs.gctx.strokeStyle = `rgba(${Math.max(30, dark - 28)},${Math.max(30, dark - 28)},${Math.max(40, mid - 30)},${Math.max(0.08, alpha * 0.55)})`;
          repairs.gctx.lineWidth = 1;
          repairs.gctx.strokeRect(-w / 2, -h / 2, w, h);
          repairs.gctx.restore();
        }

        return {
          aging: aging.canvas,
          moss: moss.canvas,
          mottlingDark: mottlingDark.canvas,
          mottlingLight: mottlingLight.canvas,
          streaks: streaks.canvas,
          repairs: repairs.canvas
        };
      }

      function getRoofWeatherMaps(seedKey) {
        const key = String(seedKey || 'roof-weather');
        const cached = ROOF_WEATHER_MAP_CACHE.get(key);
        if (cached) {
          touchLruCacheEntry(ROOF_WEATHER_MAP_CACHE, key, cached, ROOF_WEATHER_MAP_CACHE_LIMIT);
          return cached;
        }
        const maps = buildRoofWeatherMaps(key);
        touchLruCacheEntry(ROOF_WEATHER_MAP_CACHE, key, maps, ROOF_WEATHER_MAP_CACHE_LIMIT);
        return maps;
      }

      function getRoofWeatherPatternCache(gctx) {
        const cache = ROOF_WEATHER_PATTERN_CACHE.get(gctx);
        if (cache) return cache;
        const created = new Map();
        ROOF_WEATHER_PATTERN_CACHE.set(gctx, created);
        return created;
      }

      function getRoofWeatherPattern(gctx, seedKey, layerName) {
        if (!gctx || !layerName) return null;
        const cache = getRoofWeatherPatternCache(gctx);
        const cacheKey = `${seedKey}:${layerName}`;
        const cached = cache.get(cacheKey);
        if (cached && cached.pattern) {
          touchLruCacheEntry(cache, cacheKey, cached, ROOF_WEATHER_PATTERN_CACHE_LIMIT);
          return cached.pattern;
        }
        const maps = getRoofWeatherMaps(seedKey);
        const source = maps && maps[layerName];
        if (!source) return null;
        const pattern = gctx.createPattern(source, 'repeat');
        if (!pattern) return null;
        touchLruCacheEntry(cache, cacheKey, { pattern }, ROOF_WEATHER_PATTERN_CACHE_LIMIT);
        return pattern;
      }

      function hasRoofWeatheringEffect(weathering) {
        if (!weathering || typeof weathering !== 'object') return false;
        for (const key of ROOF_WEATHERING_KEYS) {
          if (clampUnitInterval(weathering[key]) > 0) return true;
        }
        return false;
      }

      function traceScreenPolygonPath(gctx, polyScreen) {
        if (!gctx || !Array.isArray(polyScreen) || polyScreen.length < 3) return false;
        gctx.beginPath();
        gctx.moveTo(polyScreen[0].x, polyScreen[0].y);
        for (let i = 1; i < polyScreen.length; i++) gctx.lineTo(polyScreen[i].x, polyScreen[i].y);
        gctx.closePath();
        return true;
      }

      function roofMossSectionBias(section) {
        if (section === 'north') return 1.1;
        if (section === 'south') return 0.72;
        return 0.9;
      }

      function applyRoofWeatheringToPolygon(roof, gctx, polyScreen, anchorWorld, section, rotDeg, weathering) {
        if (!roof || !gctx || !Array.isArray(polyScreen) || polyScreen.length < 3) return;
        const w = weathering && typeof weathering === 'object' ? weathering : normalizeRoofWeathering(roof);
        if (!w) return;

        const intensity = (value) => Math.pow(clampUnitInterval(value), 0.78);
        const aging = intensity(w.aging);
        const moss = intensity(w.moss);
        const mottling = intensity(w.mottling);
        const streaks = intensity(w.streaks);
        const repairs = intensity(w.repairs);
        const contrast = intensity(w.contrast);
        if (aging <= 0 && moss <= 0 && mottling <= 0 && streaks <= 0 && repairs <= 0 && contrast <= 0) return;

        const seed = String((w.seed || roof.id || 'roof-weather')).trim() || 'roof-weather';
        const contrastBoost = 1 + contrast * 0.85;
        const mossBias = roofMossSectionBias(section);
        const rotate = Number.isFinite(Number(rotDeg)) ? Number(rotDeg) : 0;
        const anchor = anchorWorld || { x: 0, y: 0 };

        const paintLayer = (layerName, composite, rawAlpha) => {
          const alpha = Math.max(0, Math.min(1, Number(rawAlpha) || 0));
          if (alpha <= 0.0001) return;
          const pattern = getRoofWeatherPattern(gctx, seed, layerName);
          if (!pattern) return;
          const scale = ROOF_WEATHER_PATTERN_SCALE[layerName] || 0.2;
          applyPatternTransform(pattern, scale, anchor, rotate);
          gctx.save();
          gctx.globalCompositeOperation = composite || 'source-over';
          gctx.globalAlpha = alpha;
          gctx.fillStyle = pattern;
          if (!traceScreenPolygonPath(gctx, polyScreen)) {
            gctx.restore();
            return;
          }
          gctx.fill();
          gctx.restore();
        };

        paintLayer('aging', 'multiply', 0.95 * aging * (0.95 + contrast * 0.25));
        paintLayer('moss', 'multiply', 0.95 * moss * mossBias * (0.9 + contrast * 0.35));
        paintLayer('mottlingDark', 'multiply', 0.72 * mottling * contrastBoost);
        paintLayer('mottlingLight', 'screen', 0.62 * mottling * (0.7 + contrast * 0.6));
        paintLayer('streaks', 'multiply', 0.82 * streaks * (0.8 + contrast * 0.4));
        paintLayer('repairs', 'source-over', 0.58 * repairs * (0.95 + contrast * 0.25));
        paintLayer('repairs', 'multiply', 0.42 * repairs * contrastBoost);

        if (contrast > 0.001) {
          paintLayer('aging', 'multiply', 0.22 * contrast);
          paintLayer('mottlingLight', 'screen', 0.16 * contrast);
          paintLayer('streaks', 'multiply', 0.1 * contrast);
        }
      }

      function getRoofLineHiddenArray(roof) {
        if (!roof || typeof roof !== 'object') return [];
        const raw = roof.line_hidden ?? roof.lineHidden ?? roof.hidden_lines ?? roof.hiddenLines;
        if (Array.isArray(raw)) return raw.map(v => String(v).trim()).filter(Boolean);
        if (typeof raw === 'string') {
          return raw.split(/[,\s]+/).map(v => String(v).trim()).filter(Boolean);
        }
        return [];
      }

      function getRoofLineHiddenSet(roof) {
        return new Set(getRoofLineHiddenArray(roof));
      }

      function setRoofLineHiddenArray(roof, arr) {
        if (!roof || typeof roof !== 'object') return;
        const cleaned = Array.isArray(arr)
          ? arr.map(v => String(v).trim()).filter(Boolean)
          : [];
        if (!cleaned.length) {
          delete roof.line_hidden;
          delete roof.lineHidden;
          return;
        }
        roof.line_hidden = Array.from(new Set(cleaned)).sort();
      }

      function toggleRoofLineHidden(roof, key) {
        if (!roof || !key) return;
        const nextKey = String(key).trim();
        if (!nextKey) return;
        const arr = getRoofLineHiddenArray(roof);
        const idx = arr.indexOf(nextKey);
        if (idx === -1) arr.push(nextKey);
        else arr.splice(idx, 1);
        setRoofLineHiddenArray(roof, arr);
      }

      function sortPairByX(pair) {
        return Array.isArray(pair) ? pair.slice().sort((a, b) => a.x - b.x) : [];
      }

      function sortPairByY(pair) {
        return Array.isArray(pair) ? pair.slice().sort((a, b) => a.y - b.y) : [];
      }

      function pickExtremePair(pointsWorld, axis, dir) {
        if (!Array.isArray(pointsWorld) || pointsWorld.length < 2) return [];
        const key = axis === 'y' ? 'y' : 'x';
        const sorted = pointsWorld.slice().sort((a, b) => {
          const d = (a[key] - b[key]) * dir;
          if (Math.abs(d) > 0.0001) return d;
          return axis === 'y' ? (a.x - b.x) : (a.y - b.y);
        });
        return sorted.slice(0, 2);
      }

      function getRoofConnectorTargets(roof, pointsWorld) {
        if (!roof || !roof.spine || !roof.spine.a || !roof.spine.b) return null;
        const extremes = getRoofLocalExtremes(roof, pointsWorld);
        if (!extremes) return null;
        const aLocal = toLocalPoint(roof.spine.a, extremes.origin, extremes.rotDeg);
        const bLocal = toLocalPoint(roof.spine.b, extremes.origin, extremes.rotDeg);
        const spineMidLocal = { x: (aLocal.x + bLocal.x) / 2, y: (aLocal.y + bLocal.y) / 2 };
        const isHorizontal = !!roof.rot90;
        const pickTargets = (endpointLocal) => {
          if (isHorizontal) return endpointLocal.x <= spineMidLocal.x ? extremes.west : extremes.east;
          return endpointLocal.y <= spineMidLocal.y ? extremes.north : extremes.south;
        };
        return {
          ...extremes,
          isHorizontal,
          spineMidLocal,
          targetsA: pickTargets(aLocal),
          targetsB: pickTargets(bLocal)
        };
      }

      function labelsToWorldPoints(labels) {
        if (!Array.isArray(labels)) return [];
        const out = [];
        for (const label of labels) {
          const parsed = parseHexLabel(label);
          if (!parsed) continue;
          out.push(hexToWorld(parsed.col, parsed.row));
        }
        return out;
      }

      function labelsToScreenPoints(labels) {
        return labelsToWorldPoints(labels).map(worldToScreen);
      }

      function polyCenterWorld(pointsWorld) {
        if (!Array.isArray(pointsWorld) || !pointsWorld.length) return null;
        let sx = 0;
        let sy = 0;
        for (const p of pointsWorld) {
          sx += p.x;
          sy += p.y;
        }
        return { x: sx / pointsWorld.length, y: sy / pointsWorld.length };
      }

      function rotatePointAround(p, origin, deg) {
        if (!p) return null;
        const angle = Number(deg) || 0;
        if (!origin || Math.abs(angle) < 0.0001) return { x: p.x, y: p.y };
        const rad = angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const dx = p.x - origin.x;
        const dy = p.y - origin.y;
        return {
          x: origin.x + (dx * cos - dy * sin),
          y: origin.y + (dx * sin + dy * cos)
        };
      }

      function toLocalPoint(p, origin, deg) {
        return rotatePointAround(p, origin, -(Number(deg) || 0));
      }

      function toWorldPoint(p, origin, deg) {
        return rotatePointAround(p, origin, Number(deg) || 0);
      }

      function buildRoofLocalPoints(pointsWorld, origin, deg) {
        return pointsWorld.map(p => ({
          world: p,
          local: toLocalPoint(p, origin, deg)
        }));
      }

      function pickExtremePairLocal(points, axis, dir) {
        if (!Array.isArray(points) || points.length < 2) return [];
        const key = axis === 'y' ? 'y' : 'x';
        const sorted = points.slice().sort((a, b) => {
          const d = (a.local[key] - b.local[key]) * dir;
          if (Math.abs(d) > 0.0001) return d;
          return axis === 'y' ? (a.local.x - b.local.x) : (a.local.y - b.local.y);
        });
        return sorted.slice(0, 2);
      }

      function sortLocalPairByX(pair) {
        return Array.isArray(pair) ? pair.slice().sort((a, b) => a.local.x - b.local.x) : [];
      }

      function sortLocalPairByY(pair) {
        return Array.isArray(pair) ? pair.slice().sort((a, b) => a.local.y - b.local.y) : [];
      }

      function getRoofLocalExtremes(roof, pointsWorld) {
        if (!Array.isArray(pointsWorld) || pointsWorld.length < 2) return null;
        const origin = polyCenterWorld(pointsWorld);
        if (!origin) return null;
        const rotDeg = Number(roof && roof.rotDeg) || 0;
        const locals = buildRoofLocalPoints(pointsWorld, origin, rotDeg);
        const northLocal = sortLocalPairByX(pickExtremePairLocal(locals, 'y', 1));
        const southLocal = sortLocalPairByX(pickExtremePairLocal(locals, 'y', -1));
        const westLocal = sortLocalPairByY(pickExtremePairLocal(locals, 'x', 1));
        const eastLocal = sortLocalPairByY(pickExtremePairLocal(locals, 'x', -1));
        if (northLocal.length < 2 || southLocal.length < 2 || westLocal.length < 2 || eastLocal.length < 2) return null;
        return {
          origin,
          rotDeg,
          locals,
          northLocal,
          southLocal,
          westLocal,
          eastLocal,
          north: northLocal.map(p => p.world),
          south: southLocal.map(p => p.world),
          west: westLocal.map(p => p.world),
          east: eastLocal.map(p => p.world)
        };
      }

      function isPolyRoom(room) {
        if (!room || typeof room !== 'object') return false;
        if (room.shape === 'poly' || room.isPoly === true) return true;
        if (Array.isArray(room.points) && room.points.length >= 3) return true;
        if (Array.isArray(room.poly) && room.poly.length >= 3) return true;
        if (Array.isArray(room.vertices) && room.vertices.length >= 3) return true;
        const corners = Array.isArray(room.corners) ? room.corners : [];
        return corners.length >= 3;
      }

      function roomWorldPoints(room) {
        const labels = roomPointLabels(room);
        if (!labels.length) return [];
        const pts = [];
        for (const label of labels) {
          const parsed = parseHexLabel(label);
          if (!parsed) continue;
          pts.push(hexToWorld(parsed.col, parsed.row));
        }
        return pts;
      }

      function getRoofFullRot(roof) {
        if (!roof || !roof.fullRotOn) return 0;
        const n = Number(roof.fullRot);
        return Number.isFinite(n) ? n : 0;
      }

      function roofBaseWorldPoints(roof) {
        return roomWorldPoints(roof);
      }

      function roofRotationOrigin(roof) {
        const base = roofBaseWorldPoints(roof);
        return base.length ? polyCenterWorld(base) : null;
      }

      function roofWorldPoints(roof) {
        const base = roofBaseWorldPoints(roof);
        if (!base.length) return base;
        const rot = getRoofFullRot(roof);
        if (!rot) return base;
        const origin = polyCenterWorld(base);
        if (!origin) return base;
        return base.map(p => rotatePointAround(p, origin, rot));
      }

      function unrotateRoofWorldPoint(roof, worldPoint) {
        if (!worldPoint) return worldPoint;
        const rot = getRoofFullRot(roof);
        if (!rot) return worldPoint;
        const origin = roofRotationOrigin(roof);
        if (!origin) return worldPoint;
        return rotatePointAround(worldPoint, origin, -rot);
      }

      function roomPolygonScreen(room) {
        const pts = roomWorldPoints(room);
        if (pts.length < 3) return null;
        return pts.map(worldToScreen);
      }

      function formatRoomPoints(room) {
        const labels = roomPointLabels(room);
        return labels.map(l => String(l).trim()).filter(Boolean).join(', ');
      }

      const {
        cloneValue,
        snapshotState,
        restoreState,
        prepareBattleForSave,
        pushHistory,
        updateUndoButton,
        bindUndoControls,
      } = createHistoryController({
        STATE,
        HISTORY,
        undoButton,
        saveStatus,
        setFloorOptions,
        renderStatus,
        render,
      });

      const { bindPanZoomHoldControls } = createControlsController({
        VIEW,
        rowStep,
        colStep,
        nudgeCamera,
        setZoom,
      });

      function parsePointList(text) {
        const raw = String(text || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
        const out = [];
        for (const entry of raw) {
          const parsed = parseHexLabel(entry);
          if (!parsed) continue;
          out.push(entry.toUpperCase());
        }
        return out;
      }

      function buildWallSegments(rooms) {
        const segs = [];
        for (const room of filterAlive(rooms)) {
          const pts = roomWorldPoints(room);
          if (pts.length < 2) continue;
          const t = Number.isFinite(Number(room.thickness)) ? Number(room.thickness) : 0;
          const roomId = room && room.id != null ? String(room.id) : '';
          const hidden = getPolyEdgeHiddenSet(room);
          for (let i = 0; i < pts.length; i++) {
            if (hidden.has(i)) continue;
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            segs.push({ orientation: 'a', a, b, thickness: t, roomId, room });
          }
        }
        return segs;
      }

      function segmentClosestPoint(p, a, b) {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const apx = p.x - a.x;
        const apy = p.y - a.y;
        const abLen2 = abx * abx + aby * aby;
        if (abLen2 <= 0.000001) return { x: a.x, y: a.y, t: 0 };
        let t = (apx * abx + apy * aby) / abLen2;
        t = Math.max(0, Math.min(1, t));
        return { x: a.x + abx * t, y: a.y + aby * t, t };
      }

      function wallSegDistance2(seg, p) {
        if (!seg || !p) return Infinity;
        const a = seg.a;
        const b = seg.b;
        if (!a || !b) return Infinity;
        const closest = segmentClosestPoint(p, a, b);
        const dx = p.x - closest.x;
        const dy = p.y - closest.y;
        return dx * dx + dy * dy;
      }

      function projectToWall(seg, p) {
        if (!seg || !p) return null;
        const a = seg.a;
        const b = seg.b;
        if (!a || !b) return null;
        const closest = segmentClosestPoint(p, a, b);
        return { x: closest.x, y: closest.y };
      }

      function findNearestWallSegment(worldPoint, floor, orientation) {
        const segs = buildWallSegments(floor ? floor.rooms : []);
        if (!segs.length) return null;
        const want = orientation === 'v' || orientation === 'h' ? orientation : null;
        let bestAll = null;
        let bestAllD2 = Infinity;
        let bestMatch = null;
        let bestMatchD2 = Infinity;
        for (const seg of segs) {
          const d2 = wallSegDistance2(seg, worldPoint);
          if (d2 < bestAllD2) {
            bestAllD2 = d2;
            bestAll = seg;
          }
          if (want && seg.orientation === want && d2 < bestMatchD2) {
            bestMatchD2 = d2;
            bestMatch = seg;
          }
        }
        if (bestMatch && bestAll) {
          if (bestMatchD2 <= bestAllD2 * 1.5 || bestAll.orientation === want) return bestMatch;
        }
        return bestAll || bestMatch;
      }

      function snapWorldToWall(worldPoint, floor, orientation) {
        const best = findNearestWallSegment(worldPoint, floor, orientation);
        if (!best) return worldPoint;
        return projectToWall(best, worldPoint) || worldPoint;
      }

      function openingAllowsCutout(opening) {
        const flag = opening && (opening.cutout ?? opening.cutoutMode ?? opening.cutout_mode);
        if (flag === false) return false;
        if (flag == null) return true;
        const val = String(flag).toLowerCase();
        return val !== 'none' && val !== 'off' && val !== 'false';
      }

      function drawFloorRoom(room, gctx) {
        const pts = roomWorldPoints(room);
        if (pts.length < 3) return;
        const screenPts = pts.map(worldToScreen);
        const fk = room.floor && room.floor.kind ? String(room.floor.kind) : 'default';
        const floorColor = FLOOR_COLORS[fk] || FLOOR_COLORS.default;
        const floorAnchor = pts[0];
        const floorRot = room.floor && (room.floor.rot ?? room.floor.rotDeg);
        const fill = getFillStyle(gctx, 'floor', fk, floorColor, floorAnchor, { allowFallback: false, rotDeg: floorRot });
        if (!fill) return;
        gctx.save();
        gctx.fillStyle = fill;
        gctx.globalAlpha *= (UI.polyAlpha != null ? UI.polyAlpha : 1);
        gctx.beginPath();
        gctx.moveTo(screenPts[0].x, screenPts[0].y);
        for (let i = 1; i < screenPts.length; i++) gctx.lineTo(screenPts[i].x, screenPts[i].y);
        gctx.closePath();
        gctx.fill();
        gctx.restore();
      }

      function rotateCardinal(dir, rotDeg) {
        const order = ['north', 'east', 'south', 'west'];
        const idx = order.indexOf(dir);
        if (idx < 0) return dir;
        const steps = ((Math.round((Number(rotDeg) || 0) / 90) % 4) + 4) % 4;
        return order[(idx + steps) % 4];
      }

      function roomCenterHexHalf(room) {
        const labels = getPolyPointLabels(room);
        if (!labels || !labels.length) return null;
        const pts = labelsToWorldPoints(labels);
        const center = polyCenterWorld(pts);
        if (!center) return null;
        return worldToHexHalf(center);
      }

      function findRoomById(floor, roomId) {
        if (!floor || !Array.isArray(floor.rooms) || !roomId) return null;
        const id = String(roomId);
        for (const room of floor.rooms) {
          if (!room || room.deleted) continue;
          if (String(room.id || '') === id) return room;
        }
        return null;
      }

      function drawBackdrop(gctx) {
        if (!UI.showBackdrop) return;
        if (!BACKDROP.loaded || !BACKDROP.img) return;
        const img = BACKDROP.img;
        const widthWorld = BACKDROP.widthHex * colStep();
        const worldPerPixel = (widthWorld / img.naturalWidth) * (Number.isFinite(BACKDROP.scale) ? BACKDROP.scale : 1);
        const scale = worldPerPixel * VIEW.zoom;
        const parsedAnchor = BACKDROP.anchorHexLabel ? parseHexLabel(BACKDROP.anchorHexLabel) : null;
        const anchorHex = parsedAnchor || BACKDROP.anchorHex || { col: 0, row: 0 };
        const offset = BACKDROP.offsetHex || { x: 0, y: 0 };
        const anchorWorld = hexToWorld(anchorHex.col + offset.x, anchorHex.row + offset.y);
        const anchorScreen = worldToScreen(anchorWorld);
        const anchorPx = {
          x: Number(BACKDROP.anchorPixel && BACKDROP.anchorPixel.x) || 0,
          y: Number.isFinite(BACKDROP.anchorPixel && BACKDROP.anchorPixel.yFromBottom)
            ? (img.naturalHeight - BACKDROP.anchorPixel.yFromBottom)
            : (Number(BACKDROP.anchorPixel && BACKDROP.anchorPixel.y) || 0)
        };
        const rot = (Number(BACKDROP.rotDeg) || 0) * Math.PI / 180;

        gctx.save();
        gctx.translate(anchorScreen.x, anchorScreen.y);
        if (rot) gctx.rotate(rot);
        gctx.scale(scale, scale);
        gctx.drawImage(img, -anchorPx.x, -anchorPx.y);
        gctx.restore();
      }

      function drawFloorsLayer(floor, gctx, rooms) {
        const list = sortByZ(rooms || filterAlive(floor.rooms || []));
        drawBackdrop(gctx);
        list.forEach(room => drawFloorRoom(room, gctx));
      }

      function computeRoofSpine(pointsWorld, rot90, rotDeg) {
        if (!Array.isArray(pointsWorld) || pointsWorld.length < 2) return null;
        const origin = polyCenterWorld(pointsWorld);
        if (!origin) return null;
        const localPoints = pointsWorld.map(p => toLocalPoint(p, origin, rotDeg));
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const p of localPoints) {
          if (!p) continue;
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) return null;
        const north = localPoints.slice().sort((a, b) => a.y - b.y).slice(0, 2);
        const south = localPoints.slice().sort((a, b) => b.y - a.y).slice(0, 2);
        if (north.length < 2 || south.length < 2) return null;
        const northY = Math.max(north[0].y, north[1].y);
        const southY = Math.min(south[0].y, south[1].y);
        const west = localPoints.slice().sort((a, b) => a.x - b.x).slice(0, 2);
        const east = localPoints.slice().sort((a, b) => b.x - a.x).slice(0, 2);
        if (west.length < 2 || east.length < 2) return null;
        const westX = Math.max(west[0].x, west[1].x);
        const eastX = Math.min(east[0].x, east[1].x);
        if (rot90) {
          let aX = westX;
          let bX = eastX;
          if (aX > bX) {
            const tmp = aX;
            aX = bX;
            bX = tmp;
          }
          const spineY = (northY + southY) / 2;
          return {
            a: toWorldPoint({ x: aX, y: spineY }, origin, rotDeg),
            b: toWorldPoint({ x: bX, y: spineY }, origin, rotDeg)
          };
        }
        const spineX = (minX + maxX) / 2;
        let aY = northY;
        let bY = southY;
        if (aY > bY) {
          const tmp = aY;
          aY = bY;
          bY = tmp;
        }
        return {
          a: toWorldPoint({ x: spineX, y: aY }, origin, rotDeg),
          b: toWorldPoint({ x: spineX, y: bY }, origin, rotDeg)
        };
      }

      function updateRoofSpine(roof) {
        if (!roof || typeof roof !== 'object') return;
        const labels = roomPointLabels(roof);
        if (!labels.length) {
          delete roof.spine;
          return;
        }
        const pts = roofWorldPoints(roof);
        const rotDeg = Number(roof && roof.rotDeg) || 0;
        const spine = computeRoofSpine(pts, !!roof.rot90, rotDeg);
        if (!spine) {
          delete roof.spine;
          return;
        }
        const origin = polyCenterWorld(pts);
        if (!origin) {
          delete roof.spine;
          return;
        }
        const safeAdj = (val) => {
          const n = Number(val);
          return Number.isFinite(n) ? n : 0;
        };
        const adjA = safeAdj(roof.spineAdjustA);
        const adjB = safeAdj(roof.spineAdjustB);
        const aLocal = toLocalPoint(spine.a, origin, rotDeg);
        const bLocal = toLocalPoint(spine.b, origin, rotDeg);
        if (roof.rot90) {
          aLocal.x += -adjA;
          bLocal.x += adjB;
        } else {
          aLocal.y += -adjA;
          bLocal.y += adjB;
        }
        spine.a = toWorldPoint(aLocal, origin, rotDeg);
        spine.b = toWorldPoint(bLocal, origin, rotDeg);
        roof.spine = spine;
      }

      function roofWorldCenter(roof) {
        const pts = roofWorldPoints(roof);
        return pts.length ? polyCenterWorld(pts) : null;
      }

      function drawRoofPoly(roof, gctx) {
        const pts = roofWorldPoints(roof);
        if (pts.length < 3) return;
        const screenPts = pts.map(worldToScreen);
        const weathering = normalizeRoofWeathering(roof);
        const weatheringActive = hasRoofWeatheringEffect(weathering);
        const kind = String(roof && roof.kind ? roof.kind : 'slate');
        const roofColor = FLOOR_COLORS[kind] || FLOOR_COLORS.default;
        const shadeStrength = Number.isFinite(Number(roof && roof.shade)) ? Number(roof.shade) : 0.2;
        const shadeValue = Math.max(0, Math.min(1, shadeStrength));
        const shadeColor = (() => {
          if (shadeValue <= 0) return null;
          const v = Math.round(255 * (1 - shadeValue));
          return `rgb(${v},${v},${v})`;
        })();
        const southLighten = 0.1;
        const roofRot = Number(roof && roof.rotDeg) || 0;
        const totalRot = roofRot;
        const tintRaw = roof && typeof roof.tint === 'string' ? roof.tint.trim() : '';
        const tintColor = /^#[0-9a-f]{6}$/i.test(tintRaw) ? tintRaw : '#ffffff';
        const tintStrength = Number.isFinite(Number(roof && roof.tintStrength)) ? Number(roof.tintStrength) : 0;
        const tintValue = Math.max(0, Math.min(1, tintStrength));
        const yellowOffset = Number.isFinite(Number(roof && roof.tileOffsetYellow)) ? Number(roof.tileOffsetYellow) : 0;
        const blueOffset = Number.isFinite(Number(roof && roof.tileOffsetBlue)) ? Number(roof.tileOffsetBlue) : 0;
        const rotFor = (section) => {
          if (section === 'north') return 180;
          if (section === 'south') return 0;
          if (section === 'east') return 270;
          if (section === 'west') return 90;
          return 0;
        };
        const fillPolygon = (polyPoints, section, anchorOverride) => {
          if (!Array.isArray(polyPoints) || polyPoints.length < 3) return;
          const anchor = anchorOverride || polyPoints[0];
          const fill = getFillStyle(gctx, 'floor', kind, roofColor, anchor, { allowFallback: false, rotDeg: rotFor(section) + totalRot });
          if (!fill) return;
          const polyScreen = polyPoints.map(worldToScreen);
          gctx.save();
          gctx.fillStyle = fill;
          if (!traceScreenPolygonPath(gctx, polyScreen)) {
            gctx.restore();
            return;
          }
          gctx.fill();
          gctx.restore();
          if (tintValue > 0) {
            gctx.save();
            gctx.globalCompositeOperation = 'multiply';
            gctx.fillStyle = tintColor;
            gctx.globalAlpha = tintValue;
            if (!traceScreenPolygonPath(gctx, polyScreen)) {
              gctx.restore();
              return;
            }
            gctx.fill();
            gctx.restore();
          }
          if ((section === 'north' || section === 'east') && shadeColor) {
            gctx.save();
            gctx.globalCompositeOperation = 'multiply';
            gctx.fillStyle = shadeColor;
            gctx.globalAlpha = 1;
            if (!traceScreenPolygonPath(gctx, polyScreen)) {
              gctx.restore();
              return;
            }
            gctx.fill();
            gctx.restore();
          }
          if (section === 'south' && southLighten > 0) {
            gctx.save();
            gctx.globalCompositeOperation = 'screen';
            gctx.fillStyle = 'rgb(255,255,255)';
            gctx.globalAlpha = Math.max(0, Math.min(1, southLighten));
            if (!traceScreenPolygonPath(gctx, polyScreen)) {
              gctx.restore();
              return;
            }
            gctx.fill();
            gctx.restore();
          }
          if (weatheringActive) {
            applyRoofWeatheringToPolygon(roof, gctx, polyScreen, anchor, section, rotFor(section) + totalRot, weathering);
          }
        };
        const uniqueBy = (arr, keyFn) => {
          const out = [];
          for (const item of arr) {
            const key = keyFn(item);
            if (out.some(o => Math.abs(keyFn(o) - key) < 0.0001)) continue;
            out.push(item);
          }
          return out;
        };
        const intersectHorizontal = (pointsWorld, y0) => {
          const hits = [];
          for (let i = 0; i < pointsWorld.length; i++) {
            const a = pointsWorld[i];
            const b = pointsWorld[(i + 1) % pointsWorld.length];
            if (!a || !b) continue;
            if (a.y === b.y) continue;
            const minY = Math.min(a.y, b.y);
            const maxY = Math.max(a.y, b.y);
            if (y0 < minY || y0 > maxY) continue;
            const t = (y0 - a.y) / (b.y - a.y);
            const x = a.x + t * (b.x - a.x);
            hits.push({ x, y: y0 });
          }
          const uniq = uniqueBy(hits, p => p.x);
          if (uniq.length < 2) return null;
          const xs = uniq.sort((p1, p2) => p1.x - p2.x);
          return [xs[0], xs[xs.length - 1]];
        };
        const intersectVertical = (pointsWorld, x0) => {
          const hits = [];
          for (let i = 0; i < pointsWorld.length; i++) {
            const a = pointsWorld[i];
            const b = pointsWorld[(i + 1) % pointsWorld.length];
            if (!a || !b) continue;
            if (a.x === b.x) continue;
            const minX = Math.min(a.x, b.x);
            const maxX = Math.max(a.x, b.x);
            if (x0 < minX || x0 > maxX) continue;
            const t = (x0 - a.x) / (b.x - a.x);
            const y = a.y + t * (b.y - a.y);
            hits.push({ x: x0, y });
          }
          const uniq = uniqueBy(hits, p => p.y);
          if (uniq.length < 2) return null;
          const ys = uniq.sort((p1, p2) => p1.y - p2.y);
          return [ys[0], ys[ys.length - 1]];
        };
        const canSpine = roof && roof.spine && roof.spine.a && roof.spine.b;
        const aAdj = Number(roof && roof.spineAdjustA) || 0;
        const bAdj = Number(roof && roof.spineAdjustB) || 0;
        const aNeg = aAdj < 0;
        const bNeg = bAdj < 0;
        const aPos = aAdj > 0;
        const bPos = bAdj > 0;
        const hiddenLines = canSpine ? getRoofLineHiddenSet(roof) : new Set();
        const targetInfo = canSpine ? getRoofConnectorTargets(roof, pts) : null;
        const extremes = targetInfo || getRoofLocalExtremes(roof, pts);
        const isHorizontal = targetInfo ? targetInfo.isHorizontal : !!roof.rot90;
        const northPair = extremes ? extremes.north : sortPairByX(pickExtremePair(pts, 'y', 1));
        const southPair = extremes ? extremes.south : sortPairByX(pickExtremePair(pts, 'y', -1));
        const westPair = extremes ? extremes.west : sortPairByY(pickExtremePair(pts, 'x', 1));
        const eastPair = extremes ? extremes.east : sortPairByY(pickExtremePair(pts, 'x', -1));
        const UL = northPair[0] || null;
        const UR = northPair[1] || null;
        const LL = southPair[0] || null;
        const LR = southPair[1] || null;

        if (canSpine && targetInfo) {
          if (!isHorizontal) {
            if (UL && LL) fillPolygon([roof.spine.b, roof.spine.a, UL, LL], 'west');
            if (UR && LR) fillPolygon([roof.spine.b, roof.spine.a, UR, LR], 'east');
            if (aNeg && UL && UR) {
              const origin = extremes ? extremes.origin : polyCenterWorld(pts);
              const rotDeg = extremes ? extremes.rotDeg : (Number(roof && roof.rotDeg) || 0);
              const ulLocal = toLocalPoint(UL, origin, rotDeg);
              const anchorLocal = { x: ulLocal.x, y: ulLocal.y + yellowOffset };
              const anchor = toWorldPoint(anchorLocal, origin, rotDeg);
              fillPolygon([UL, UR, roof.spine.a], 'north', anchor);
            }
            if (bNeg && LL && LR) {
              const origin = extremes ? extremes.origin : polyCenterWorld(pts);
              const rotDeg = extremes ? extremes.rotDeg : (Number(roof && roof.rotDeg) || 0);
              const llLocal = toLocalPoint(LL, origin, rotDeg);
              const anchorLocal = { x: llLocal.x, y: llLocal.y - blueOffset };
              const anchor = toWorldPoint(anchorLocal, origin, rotDeg);
              fillPolygon([LL, LR, roof.spine.b], 'south', anchor);
            }
          } else {
            if (UL && UR) fillPolygon([roof.spine.b, roof.spine.a, UL, UR], 'north');
            if (LL && LR) fillPolygon([roof.spine.b, roof.spine.a, LL, LR], 'south');
            if (aNeg && westPair.length >= 2) {
              const origin = extremes ? extremes.origin : polyCenterWorld(pts);
              const rotDeg = extremes ? extremes.rotDeg : (Number(roof && roof.rotDeg) || 0);
              const wLocal = toLocalPoint(westPair[0], origin, rotDeg);
              const anchorLocal = { x: wLocal.x + yellowOffset, y: wLocal.y };
              const anchor = toWorldPoint(anchorLocal, origin, rotDeg);
              fillPolygon([westPair[0], westPair[1], roof.spine.a], 'west', anchor);
            }
            if (bNeg && eastPair.length >= 2) {
              const origin = extremes ? extremes.origin : polyCenterWorld(pts);
              const rotDeg = extremes ? extremes.rotDeg : (Number(roof && roof.rotDeg) || 0);
              const eLocal = toLocalPoint(eastPair[0], origin, rotDeg);
              const anchorLocal = { x: eLocal.x - blueOffset, y: eLocal.y };
              const anchor = toWorldPoint(anchorLocal, origin, rotDeg);
              fillPolygon([eastPair[0], eastPair[1], roof.spine.b], 'east', anchor);
            }
          }
        } else {
          fillPolygon(pts, 'south');
        }

        const spineColor = /^#[0-9a-f]{6}$/i.test(UI.roofLineColor || '')
          ? UI.roofLineColor
          : 'rgb(112,119,126)';
        const spineWidth = Number.isFinite(Number(UI.roofLineWidth)) && Number(UI.roofLineWidth) > 0
          ? Number(UI.roofLineWidth)
          : 2;
        const spinePx = spineWidth * Math.max(0.05, Number(VIEW.zoom) || 1);
        const samePoint = (p1, p2) => {
          if (!p1 || !p2) return false;
          return Math.abs(p1.x - p2.x) < 0.0001 && Math.abs(p1.y - p2.y) < 0.0001;
        };
        const shouldSkipEdge = (p1, p2, skipPairs) => {
          if (!Array.isArray(skipPairs) || !skipPairs.length) return false;
          return skipPairs.some((pair) => {
            if (!pair || pair.length < 2) return false;
            const a = pair[0];
            const b = pair[1];
            return (samePoint(p1, a) && samePoint(p2, b)) || (samePoint(p1, b) && samePoint(p2, a));
          });
        };
        const drawOutline = (skipPairs) => {
          gctx.save();
          gctx.strokeStyle = spineColor;
          gctx.lineWidth = spinePx;
          gctx.lineJoin = 'round';
          gctx.lineCap = 'round';
          gctx.beginPath();
          for (let i = 0; i < screenPts.length; i++) {
            const next = (i + 1) % screenPts.length;
            const wp1 = pts[i];
            const wp2 = pts[next];
            if (shouldSkipEdge(wp1, wp2, skipPairs)) continue;
            gctx.moveTo(screenPts[i].x, screenPts[i].y);
            gctx.lineTo(screenPts[next].x, screenPts[next].y);
          }
          gctx.stroke();
          gctx.restore();
        };
        const skipPairs = [];
        if (canSpine && targetInfo) {
          if (!isHorizontal) {
            if (aPos && UL && UR) skipPairs.push([UL, UR]);
            if (bPos && LL && LR) skipPairs.push([LL, LR]);
          } else {
            if (aPos && westPair.length >= 2) skipPairs.push([westPair[0], westPair[1]]);
            if (bPos && eastPair.length >= 2) skipPairs.push([eastPair[0], eastPair[1]]);
          }
        }
        if (hiddenLines.size) {
          for (let i = 0; i < pts.length; i++) {
            if (!hiddenLines.has(`edge:${i}`)) continue;
            const next = (i + 1) % pts.length;
            skipPairs.push([pts[i], pts[next]]);
          }
        }
        drawOutline(skipPairs);

        if (roof && roof.spine && roof.spine.a && roof.spine.b) {
          const a = worldToScreen(roof.spine.a);
          const b = worldToScreen(roof.spine.b);
          if (!hiddenLines.has('spine')) {
            gctx.save();
            gctx.strokeStyle = spineColor;
            gctx.lineWidth = spinePx;
            gctx.lineCap = 'round';
            gctx.beginPath();
            gctx.moveTo(a.x, a.y);
            gctx.lineTo(b.x, b.y);
            gctx.stroke();
            gctx.restore();
          }

          const drawConnector = (from, targets, keyPrefix) => {
            if (!targets || targets.length < 2) return;
            gctx.save();
            gctx.strokeStyle = spineColor;
            gctx.lineWidth = spinePx;
            gctx.lineCap = 'round';
            for (let i = 0; i < targets.length; i++) {
              if (hiddenLines.has(`conn:${keyPrefix}:${i}`)) continue;
              const t = targets[i];
              const tp = worldToScreen(t);
              gctx.beginPath();
              gctx.moveTo(from.x, from.y);
              gctx.lineTo(tp.x, tp.y);
              gctx.stroke();
            }
            gctx.restore();
          };
          if (targetInfo) {
            drawConnector(a, targetInfo.targetsA, 'a');
            drawConnector(b, targetInfo.targetsB, 'b');
          }
        }
      }

      function drawRoofShadowsLayer(floor, gctx, rooms, roomSets, rect, dpr) {
        if (UI.hideRoofs) return;
        if (!floor) return;
        const baseRooms = rooms || filterAlive(floor.rooms || []);
        let list = sortByZ(filterAlive(floor.roofs || []));
        if (UI.fogEnabled && roomSets) {
          list = list.filter(roof => itemFogState(roof, floor, baseRooms, roomSets, roofWorldCenter) !== 'hidden');
        }
        if (!list.length) return;
        const tempLayer = (rect && dpr) ? getLayerContext('roofShadowTemp', rect, dpr) : null;
        const entries = list.map((roof) => {
          const pts = roofWorldPoints(roof);
          const z = Number.isFinite(Number(roof && roof.z)) ? Number(roof.z) : 0;
          return { roof, pts, z };
        }).filter(entry => entry.pts.length >= 3);
        const drawRoofPolyMask = (ctx, pts) => {
          if (!ctx || !pts || pts.length < 3) return;
          const screenPts = pts.map(worldToScreen);
          ctx.beginPath();
          ctx.moveTo(screenPts[0].x, screenPts[0].y);
          for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
          ctx.closePath();
          ctx.fill();
        };
        const drawTempMask = (caster, casterZ, ctx) => {
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.save();
          ctx.fillStyle = '#000';
          ctx.globalAlpha = 1;
          drawRoofShadow(caster, ctx);
          ctx.globalCompositeOperation = 'destination-out';
          for (const entry of entries) {
            if (entry.z >= casterZ) {
              drawRoofPolyMask(ctx, entry.pts);
            }
          }
          ctx.restore();
        };
        entries.forEach(entry => {
          if (!tempLayer) return;
          drawTempMask(entry.roof, entry.z, tempLayer.ctx);
          gctx.drawImage(tempLayer.canvas, 0, 0, rect.width, rect.height);
        });
      }

      function drawRoofShadow(roof, gctx) {
        if (!roof || !gctx) return;
        const pts = roofWorldPoints(roof);
        if (pts.length < 3) return;
        const shadowDepth = Number.isFinite(Number(roof && roof.shadowDepth)) ? Number(roof.shadowDepth) : 32;
        if (!Number.isFinite(shadowDepth) || shadowDepth === 0) return;
        const canSpine = roof && roof.spine && roof.spine.a && roof.spine.b;
        const aAdj = Number(roof && roof.spineAdjustA) || 0;
        const bAdj = Number(roof && roof.spineAdjustB) || 0;
        const aPos = aAdj > 0;
        const bPos = bAdj > 0;
        const targetInfo = canSpine ? getRoofConnectorTargets(roof, pts) : null;
        const extremes = targetInfo || getRoofLocalExtremes(roof, pts);
        if (!extremes) return;
        const isHorizontal = targetInfo ? targetInfo.isHorizontal : !!roof.rot90;
        const northPair = extremes.north || [];
        const eastPair = extremes.east || [];
        const northPeak = null;
        const eastPeak = null;
        const v = { x: shadowDepth, y: -shadowDepth };
        const drawShadowPolygon = (polyPoints) => {
          if (!Array.isArray(polyPoints) || polyPoints.length < 3) return;
          const polyScreen = polyPoints.map(worldToScreen);
          gctx.beginPath();
          gctx.moveTo(polyScreen[0].x, polyScreen[0].y);
          for (let i = 1; i < polyScreen.length; i++) gctx.lineTo(polyScreen[i].x, polyScreen[i].y);
          gctx.closePath();
          gctx.fill();
        };
        const drawShadowEdge = (p1, p2, peak) => {
          if (!p1 || !p2) return;
          const p1s = { x: p1.x + v.x, y: p1.y + v.y };
          const p2s = { x: p2.x + v.x, y: p2.y + v.y };
          if (peak) {
            const ps = { x: peak.x + v.x, y: peak.y + v.y };
            drawShadowPolygon([p1, p2, p2s, ps, p1s]);
          } else {
            drawShadowPolygon([p1, p2, p2s, p1s]);
          }
        };
        gctx.save();
        gctx.fillStyle = '#000';
        gctx.globalAlpha = 1;
        if (!isHorizontal) {
          if (!aPos && northPair.length >= 2) drawShadowEdge(northPair[0], northPair[1], northPeak);
          if (eastPair.length >= 2) drawShadowEdge(eastPair[0], eastPair[1], eastPeak);
        } else {
          if (northPair.length >= 2) drawShadowEdge(northPair[0], northPair[1], northPeak);
          if (!bPos && eastPair.length >= 2) drawShadowEdge(eastPair[0], eastPair[1], eastPeak);
        }
        gctx.restore();
      }

      function drawSpineHandle(gctx, center, size, color) {
        gctx.save();
        gctx.strokeStyle = color;
        gctx.lineWidth = 1.6;
        drawHandle(gctx, center, size);
        gctx.restore();
      }

      function getRoofSpineHandleHit(roof, screenPoint) {
        if (!roof || !roof.spine || !roof.spine.a || !roof.spine.b) return null;
        const hitR = Math.max(8, Math.min(14, 9 * VIEW.zoom));
        const hitRadius2 = hitR * hitR;
        const a = worldToScreen(roof.spine.a);
        const b = worldToScreen(roof.spine.b);
        const dxA = a.x - screenPoint.x;
        const dyA = a.y - screenPoint.y;
        if (dxA * dxA + dyA * dyA <= hitRadius2) return 'a';
        const dxB = b.x - screenPoint.x;
        const dyB = b.y - screenPoint.y;
        if (dxB * dxB + dyB * dyB <= hitRadius2) return 'b';
        return null;
      }

      function getRoofLineHit(roof, screenPoint) {
        const labels = getPolyPointLabels(roof);
        if (!labels) return null;
        const pts = roofWorldPoints(roof);
        if (!pts.length) return null;
        if (!roof || !roof.spine || !roof.spine.a || !roof.spine.b) return null;
        const targetInfo = getRoofConnectorTargets(roof, pts);
        if (!targetInfo) return null;
        const hitR = Math.max(8, Math.min(14, 9 * VIEW.zoom));
        const hitRadius2 = hitR * hitR;
        const testSegment = (key, p1, p2) => {
          if (!p1 || !p2) return null;
          const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
          const sp = worldToScreen(mid);
          const dx = sp.x - screenPoint.x;
          const dy = sp.y - screenPoint.y;
          if (dx * dx + dy * dy <= hitRadius2) return { type: 'roof-line', key };
          return null;
        };
        const spineHit = testSegment('spine', roof.spine.a, roof.spine.b);
        if (spineHit) return spineHit;
        const aTargets = targetInfo.targetsA || [];
        const bTargets = targetInfo.targetsB || [];
        for (let i = 0; i < aTargets.length; i++) {
          const hit = testSegment(`conn:a:${i}`, roof.spine.a, aTargets[i]);
          if (hit) return hit;
        }
        for (let i = 0; i < bTargets.length; i++) {
          const hit = testSegment(`conn:b:${i}`, roof.spine.b, bTargets[i]);
          if (hit) return hit;
        }
        return null;
      }

      function drawRoofsLayer(floor, gctx, rooms, roomSets) {
        if (UI.hideRoofs) return;
        const baseRooms = rooms || filterAlive(floor.rooms || []);
        let list = sortByZ(filterAlive(floor.roofs || []));
        if (UI.fogEnabled && roomSets) {
          list = list.filter(roof => itemFogState(roof, floor, baseRooms, roomSets, roofWorldCenter) !== 'hidden');
        }
        list.forEach(roof => drawRoofPoly(roof, gctx));
      }

      function wallThicknessAtWorld(worldPoint, floor) {
        const segs = buildWallSegments(floor ? floor.rooms : []);
        let best = null;
        let bestD2 = Infinity;
        for (const seg of segs) {
          const d2 = wallSegDistance2(seg, worldPoint);
          if (d2 < bestD2) {
            bestD2 = d2;
            best = seg;
          }
        }
        if (!best || !Number.isFinite(best.thickness)) return 0;
        if (UI.streetView) {
          const kind = String(best.room && best.room.floor && best.room.floor.kind ? best.room.floor.kind : '');
          if (kind.toLowerCase() === 'wood_oak' && best.thickness > 0) return 1;
        }
        return best.thickness;
      }

      function openingCutoutRectsForFloor(floor, rooms, roomSets) {
        if (!floor || !Array.isArray(floor.openings)) return [];
        const out = [];
        for (const opening of filterAlive(floor.openings)) {
          if (!openingAllowsCutout(opening)) continue;
          if (roomSets && rooms) {
            const state = itemFogState(opening, floor, rooms, roomSets, openingWorldCenter);
            if (state === 'hidden') continue;
          }
          const info = openingPlacement(opening, floor);
          if (!info || !info.world) continue;
          const kindRaw = String(opening.kind || '').toLowerCase();
          const kind =
            kindRaw.startsWith('window') ? 'window' :
            kindRaw.startsWith('portal') ? 'portal' :
            kindRaw.startsWith('threshold') ? 'threshold' :
            kindRaw.startsWith('gate') ? 'gate' : 'door';
          const style = OPENING_STYLE[kind] || OPENING_STYLE.door;
          const lenUnits = Number.isFinite(Number(opening.len ?? opening.length ?? opening.size))
            ? Number(opening.len ?? opening.length ?? opening.size)
            : style.len;
          const thickUnits = Number.isFinite(Number(opening.thick ?? opening.thickness))
            ? Number(opening.thick ?? opening.thickness)
            : style.thick;
          const len = GRID.size * lenUnits * VIEW.zoom;
          const thick = GRID.size * thickUnits * VIEW.zoom;
          const wallThickWorld = wallThicknessAtWorld(info.world, floor);
          const baseWallWorld = wallThickWorld > 0 ? wallThickWorld : (GRID.size * thickUnits);
          const center = worldToScreen(info.world);
          const cutLen = len * 1.1;
          const cutThick = baseWallWorld * VIEW.zoom * 1.1;
          out.push({ center, w: cutLen, h: cutThick, angle: info.angle || 0 });
        }
        return out;
      }

      function drawWallsLayer(floor, gctx, rooms, roomSets) {
        const list = sortByZ(rooms || filterAlive(floor.rooms || []));
        const drawWallStroke = (ctx, screenPts, lineW, hiddenSet, erasePass) => {
          const cornerPads = screenPts.map((pt, i) => {
            const prev = screenPts[(i - 1 + screenPts.length) % screenPts.length];
            const next = screenPts[(i + 1) % screenPts.length];
            const v1x = prev.x - pt.x;
            const v1y = prev.y - pt.y;
            const v2x = next.x - pt.x;
            const v2y = next.y - pt.y;
            const l1 = Math.hypot(v1x, v1y) || 1;
            const l2 = Math.hypot(v2x, v2y) || 1;
            const dot = (v1x * v2x + v1y * v2y) / (l1 * l2);
            const clamped = Math.max(-1, Math.min(1, dot));
            const theta = Math.acos(clamped);
            const base = Math.sin(Math.PI / 4);
            const scale = Math.min(1, Math.sin(theta / 2) / base);
            return (lineW * 0.5) * (Number.isFinite(scale) ? scale : 1);
          });
          const cornerAngle = screenPts.map((pt, i) => {
            const prev = screenPts[(i - 1 + screenPts.length) % screenPts.length];
            const next = screenPts[(i + 1) % screenPts.length];
            const v1x = prev.x - pt.x;
            const v1y = prev.y - pt.y;
            const v2x = next.x - pt.x;
            const v2y = next.y - pt.y;
            const l1 = Math.hypot(v1x, v1y) || 1;
            const l2 = Math.hypot(v2x, v2y) || 1;
            const dot = (v1x * v2x + v1y * v2y) / (l1 * l2);
            const clamped = Math.max(-1, Math.min(1, dot));
            return Math.acos(clamped);
          });
          for (let i = 0; i < screenPts.length; i++) {
            if (!erasePass && hiddenSet && hiddenSet.has(i)) continue;
            const a = screenPts[i];
            const b = screenPts[(i + 1) % screenPts.length];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const thetaA = cornerAngle[i] ?? Math.PI / 2;
            const thetaB = cornerAngle[(i + 1) % screenPts.length] ?? Math.PI / 2;
            const devA = Math.abs(thetaA - Math.PI / 2);
            const devB = Math.abs(thetaB - Math.PI / 2);
            const dev = Math.max(devA, devB);
            const devMin = Math.PI / 180; // 1 deg
            const devMax = Math.PI / 4; // 45 deg
            const t = Math.max(0, Math.min(1, (dev - devMin) / (devMax - devMin)));
            const useRound = dev >= devMin;
            const padA = useRound ? 0 : (cornerPads[i] ?? (lineW * 0.5));
            const padB = useRound ? 0 : (cornerPads[(i + 1) % screenPts.length] ?? (lineW * 0.5));
            ctx.beginPath();
            ctx.lineWidth = useRound ? (lineW * (0.9 + 0.1 * t)) : lineW;
            ctx.lineCap = useRound ? 'round' : 'butt';
            ctx.lineJoin = useRound ? 'round' : 'miter';
            ctx.moveTo(a.x - ux * padA, a.y - uy * padA);
            ctx.lineTo(b.x + ux * padB, b.y + uy * padB);
            ctx.stroke();
          }
        };

        for (const room of list) {
          if (!roomHasWalls(room)) continue;
          const pts = roomWorldPoints(room);
          if (pts.length < 3) continue;
          const screenPts = pts.map(worldToScreen);
          const wk = roomWallKind(room);
          const wallColor = WALL_COLORS[wk] || WALL_COLORS.default;
          const wallAnchor = pts[0];
          const fill = getFillStyle(gctx, 'wall', wk, wallColor, wallAnchor, { allowFallback: false });
          if (!fill) continue;
          let thickness = Number(room.thickness || 0);
          if (UI.streetView) {
            const fk = String(room.floor && room.floor.kind ? room.floor.kind : '').toLowerCase();
            if (fk === 'wood_oak' && thickness > 0) thickness = 1;
          }
          const lineW = Math.max(1, thickness * VIEW.zoom);
          const hidden = getPolyEdgeHiddenSet(room);
          gctx.save();
          gctx.strokeStyle = fill;
          gctx.lineJoin = 'miter';
          gctx.lineCap = 'butt';
          gctx.miterLimit = 20;
          gctx.globalAlpha *= (UI.polyAlpha != null ? UI.polyAlpha : 1);
          if (hidden && hidden.size) {
            gctx.save();
            gctx.globalCompositeOperation = 'destination-out';
            gctx.lineWidth = lineW * 1.05;
            drawWallStroke(gctx, screenPts, lineW * 1.05, hidden, true);
            gctx.restore();
          }
          gctx.lineWidth = lineW;
          drawWallStroke(gctx, screenPts, lineW, hidden, false);
          gctx.restore();
        }

        const cutouts = openingCutoutRectsForFloor(floor, rooms || filterAlive(floor.rooms || []), roomSets);
        if (cutouts.length) {
          gctx.save();
          gctx.globalCompositeOperation = 'destination-out';
          for (const cut of cutouts) {
            const angle = Number(cut.angle) || 0;
            if (Math.abs(angle) > 0.0001) {
              gctx.save();
              gctx.translate(cut.center.x, cut.center.y);
              gctx.rotate(angle);
              gctx.fillRect(-cut.w / 2, -cut.h / 2, cut.w, cut.h);
              gctx.restore();
            } else {
              gctx.fillRect(cut.center.x - cut.w / 2, cut.center.y - cut.h / 2, cut.w, cut.h);
            }
          }
          gctx.restore();
        }
      }

      function roomAnchorWorld(room) {
        const pts = roomWorldPoints(room);
        if (!pts.length) return null;
        return pts[0];
      }

      function roomCenterWorld(room) {
        const pts = roomWorldPoints(room);
        if (!pts.length) return null;
        return polyCenterWorld(pts);
      }


      function openingWorldCenter(opening, floor) {
        const info = openingPlacement(opening, floor);
        return info ? info.world : null;
      }

      function openingPlacement(opening, floor) {
        const p = parseHexLabel(opening.hex);
        if (!p) return null;
        const world = hexToWorld(p.col, p.row);
        const orientRaw = opening && opening.orientation === 'v' ? 'v' : (opening && opening.orientation === 'h' ? 'h' : '');
        const seg = findNearestWallSegment(world, floor, orientRaw);
        const snapped = seg ? projectToWall(seg, world) : world;
        let angle = 0;
        if (seg && seg.a && seg.b) {
          angle = Math.atan2(seg.b.y - seg.a.y, seg.b.x - seg.a.x);
        } else if (orientRaw === 'v') {
          angle = Math.PI / 2;
        }
        const normal = { x: -Math.sin(angle), y: Math.cos(angle) };
        return { world: snapped, angle, normal, seg };
      }

      function openingParentRoomId(opening) {
        const raw = opening && (opening.parent ?? opening.room_id ?? opening.roomId ?? opening.room);
        if (raw == null) return '';
        return String(raw);
      }

      function openingsForRoomMove(room, floor) {
        if (!room || !floor || !Array.isArray(floor.openings)) return [];
        const rid = room.id != null ? String(room.id) : '';
        const out = [];
        for (const opening of filterAlive(floor.openings)) {
          const parentId = openingParentRoomId(opening);
          const info = openingPlacement(opening, floor);
          if (!info || !info.world) continue;
          const segRoomId = info.seg && info.seg.roomId != null ? String(info.seg.roomId) : '';
          if (parentId && parentId === rid) {
            out.push({ opening, world: info.world });
          } else if (!parentId && segRoomId && segRoomId === rid) {
            out.push({ opening, world: info.world });
          }
        }
        return out;
      }

      function normalizeRoomOpeningsHexes(room, floor) {
        if (!room || !floor || !Array.isArray(floor.openings)) return;
        const rid = room.id != null ? String(room.id) : '';
        const openings = openingsForRoomMove(room, floor);
        if (!openings.length) return;
        for (const entry of openings) {
          const info = openingPlacement(entry.opening, floor);
          if (!info || !info.world) continue;
          const oHex = openingHexFromWorld(info.world);
          const openLabel = openingHexLabelFromCoords(oHex.col, oHex.row) || toHexLabel(oHex.col, oHex.row);
          entry.opening.hex = openLabel;
        }
      }

      function openingFogState(opening, floor, rooms, roomSets) {
        if (!UI.fogEnabled) return 'visible';
        const info = openingPlacement(opening, floor);
        if (!info || !info.world) return 'visible';
        const offset = GRID.size * 0.35;
        const a = {
          x: info.world.x + info.normal.x * offset,
          y: info.world.y + info.normal.y * offset
        };
        const b = {
          x: info.world.x - info.normal.x * offset,
          y: info.world.y - info.normal.y * offset
        };
        const roomA = findRoomForWorldPoint(rooms, a);
        const roomB = findRoomForWorldPoint(rooms, b);
        const stateForRoom = (room) => {
          if (!room || room.id == null) return 'visible';
          const id = String(room.id);
          if (roomSets.visible && roomSets.visible.has(id)) return 'visible';
          if (roomSets.explored && roomSets.explored.has(id)) return 'explored';
          if (roomSets.hidden && roomSets.hidden.has(id)) return 'hidden';
          return 'visible';
        };
        const sA = stateForRoom(roomA);
        const sB = stateForRoom(roomB);
        if (sA === 'visible' || sB === 'visible') return 'visible';
        if (sA === 'explored' || sB === 'explored') return 'explored';
        return 'hidden';
      }

      function drawOpening(opening, floor, gctx, fogState) {
        const info = openingPlacement(opening, floor);
        if (!info || !info.world) return;
        const center = worldToScreen(info.world);
        const angle = Number(info.angle) || 0;
        const orient = (info.seg && info.seg.orientation === 'a')
          ? (Math.abs(Math.sin(angle)) > Math.abs(Math.cos(angle)) ? 'v' : 'h')
          : (opening.orientation === 'v'
            ? 'v'
            : (opening.orientation === 'h'
              ? 'h'
              : (Math.abs(Math.sin(angle)) > Math.abs(Math.cos(angle)) ? 'v' : 'h')));
        const kindRaw = String(opening.kind || '').toLowerCase();
        const kind =
          kindRaw.startsWith('window') ? 'window' :
          kindRaw.startsWith('portal') ? 'portal' :
          kindRaw.startsWith('threshold') ? 'threshold' :
          kindRaw.startsWith('gate') ? 'gate' : 'door';
        if (UI.fogEnabled && kind === 'threshold') return;
        const style = OPENING_STYLE[kind] || OPENING_STYLE.door;
        const spriteUrl = resolveOpeningSprite(kindRaw, opening.openPct || 0);
        const lenUnits = Number.isFinite(Number(opening.len ?? opening.length ?? opening.size))
          ? Number(opening.len ?? opening.length ?? opening.size)
          : style.len;
        const thickUnits = Number.isFinite(Number(opening.thick ?? opening.thickness))
          ? Number(opening.thick ?? opening.thickness)
          : style.thick;
        const len = GRID.size * lenUnits * VIEW.zoom;
        const thick = GRID.size * thickUnits * VIEW.zoom;
        const hingeRaw = (opening.hinge || 'left').toLowerCase();
        const hinge = orient === 'v'
          ? (hingeRaw === 'bottom' ? 'right' : 'left')
          : (hingeRaw === 'right' ? 'right' : 'left');
        let swingDir = Number.isFinite(Number(opening.swing)) ? Number(opening.swing) : 1;
        if (swingDir === 0) swingDir = -1;
        const openPct = Math.max(0, Math.min(1, Number(opening.openPct ?? opening.open ?? 0)));
        const swingAngle = openPct * (Math.PI / 2) * (swingDir === 0 ? 1 : swingDir);
        const baseRot = angle;
        const pivotX = hinge === 'right' ? len / 2 : -len / 2;
        if (spriteUrl) {
          const img = loadSprite(spriteUrl);
          if (img && img.complete && img.naturalWidth && img.naturalHeight) {
            gctx.save();
            if (fogState === 'explored') gctx.globalAlpha *= 0.6;
            gctx.translate(center.x, center.y);
            if (baseRot) gctx.rotate(baseRot);
            gctx.translate(pivotX, 0);
            if (swingAngle) gctx.rotate(swingAngle);
            gctx.translate(-pivotX, 0);
            gctx.drawImage(img, -len / 2, -thick / 2, len, thick);
            gctx.restore();
            return;
          }
          if (img && img.__bmStatus !== 'error') return;
        }
        gctx.save();
        if (fogState === 'explored') gctx.globalAlpha *= 0.6;
        const stateRaw = String(opening.state || opening.lock_state || '').toLowerCase();
        if (stateRaw === 'locked') gctx.globalAlpha *= 0.8;
        if (stateRaw === 'barred') gctx.globalAlpha *= 0.65;
        gctx.translate(center.x, center.y);
        if (baseRot) gctx.rotate(baseRot);
        gctx.translate(pivotX, 0);
        if (swingAngle) gctx.rotate(swingAngle);
        gctx.translate(-pivotX, 0);
        gctx.fillStyle = style.color;
        gctx.fillRect(-len / 2, -thick / 2, len, thick);
        gctx.restore();
      }

      function objectWorldCenter(obj) {
        if (!obj) return null;
        const p = parseHexLabel(obj.hex);
        if (!p) return null;
        const base = hexToWorld(p.col, p.row);
        const ox = Number(obj.ox);
        const oy = Number(obj.oy);
        return {
          x: base.x + (Number.isFinite(ox) ? ox : 0) * GRID.size,
          y: base.y + (Number.isFinite(oy) ? oy : 0) * GRID.size,
        };
      }

      const spriteCache = new Map();
      function loadSprite(url) {
        if (!url) return null;
        if (spriteCache.has(url)) return spriteCache.get(url);
        const img = new Image();
        img.__bmStatus = 'loading';
        img.src = url;
        img.onload = () => {
          img.__bmStatus = 'ready';
          render();
        };
        img.onerror = () => {
          img.__bmStatus = 'error';
          render();
        };
        spriteCache.set(url, img);
        return img;
      }

      const LAYER_CANVASES = new Map();
      function getLayerContext(name, rect, dpr) {
        let layer = LAYER_CANVASES.get(name);
        if (!layer) {
          const canvas = document.createElement('canvas');
          const gctx = canvas.getContext('2d');
          layer = { canvas, ctx: gctx };
          LAYER_CANVASES.set(name, layer);
        }
        layer.canvas.width = rect.width * dpr;
        layer.canvas.height = rect.height * dpr;
        layer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        layer.ctx.clearRect(0, 0, rect.width, rect.height);
        return layer;
      }

      const PATTERN_CACHE = new WeakMap();

      function getPatternCache(gctx) {
        const cache = PATTERN_CACHE.get(gctx);
        if (cache) return cache;
        const created = new Map();
        PATTERN_CACHE.set(gctx, created);
        return created;
      }

      function resolveTextureDef(category, kind) {
        const cat = String(category || '').toLowerCase();
        const k0 = String(kind || '').toLowerCase();
        if (!cat || !k0) return null;
        if (k0 === 'fog' || k0 === 'none') return null;

        const aliases = TEXTURE_ALIASES[cat] || {};
        const key = (k0 in TEXTURE_FILES) ? k0 : (aliases[k0] || '');
        if (!key || !(key in TEXTURE_FILES)) return null;

        const scale = (TEXTURE_SCALES[cat] && Number.isFinite(Number(TEXTURE_SCALES[cat][key])))
          ? Number(TEXTURE_SCALES[cat][key])
          : 1;
        return { url: TEXTURE_FILES[key], scale };
      }

      function getTexturePattern(gctx, category, kind) {
        const def = resolveTextureDef(category, kind);
        if (!def) return null;
        const cache = getPatternCache(gctx);
        const cached = cache.get(def.url);
        if (cached && cached.pattern) return { pattern: cached.pattern, scale: def.scale };

        const img = loadSprite(def.url);
        if (!img || !img.complete) {
          if (img && !img.__patternHooked) {
            img.__patternHooked = true;
            img.onload = () => {
              img.__patternHooked = false;
              cache.delete(def.url);
              render();
            };
          }
          return null;
        }

        const pattern = gctx.createPattern(img, 'repeat');
        if (!pattern) return null;
        cache.set(def.url, { pattern });
        return { pattern, scale: def.scale };
      }

      function applyPatternTransform(pattern, scale, anchorWorld, rotDeg) {
        if (!pattern || typeof pattern.setTransform !== 'function') return;
        const cam = getCameraWorld();
        const rect = canvas.getBoundingClientRect();
        const anchor = anchorWorld || { x: 0, y: 0 };
        const originX = rect.width / 2 + (anchor.x - cam.x) * VIEW.zoom;
        const originY = rect.height / 2 + (anchor.y - cam.y) * VIEW.zoom;
        const s = (Number(scale) || 1) * VIEW.zoom;
        const m = new DOMMatrix();
        m.translateSelf(originX, originY);
        if (Number.isFinite(Number(rotDeg)) && Number(rotDeg) !== 0) {
          m.rotateSelf(Number(rotDeg));
        }
        m.scaleSelf(s, s);
        pattern.setTransform(m);
      }

      function getFillStyle(gctx, category, kind, fallback, anchorWorld, opts = {}) {
        const def = resolveTextureDef(category, kind);
        if (def) {
          const tex = getTexturePattern(gctx, category, kind);
          if (tex && tex.pattern) {
            applyPatternTransform(tex.pattern, tex.scale, anchorWorld, opts.rotDeg);
            return tex.pattern;
          }
          if (opts.allowFallback === false) return null;
        }
        return fallback;
      }

      function drawObject(obj, zIndex, gctx) {
        const world = objectWorldCenter(obj);
        if (!world) return;
        const center = worldToScreen(world);
        const url = obj.sprite || obj.spriteFile || resolveSpriteUrl(obj.kind);
        const scale = Number.isFinite(Number(obj.spriteScale)) ? Number(obj.spriteScale) : 1;
        const scaleX = Number.isFinite(Number(obj.spriteScaleX)) ? Number(obj.spriteScaleX) : scale;
        const scaleY = Number.isFinite(Number(obj.spriteScaleY)) ? Number(obj.spriteScaleY) : scale;
        const base = GRID.size * 1.15;
        let sizeW = base * scaleX * VIEW.zoom;
        let sizeH = base * scaleY * VIEW.zoom;
        const rotDeg = Number.isFinite(Number(obj.rotDeg)) ? Number(obj.rotDeg) : 0;
        const rot = rotDeg * Math.PI / 180;

        if (url) {
          const img = loadSprite(url);
          if (img && img.complete && img.naturalWidth && img.naturalHeight) {
            const ratio = img.naturalHeight / img.naturalWidth;
            sizeW = base * scaleX * VIEW.zoom;
            sizeH = base * ratio * scaleY * VIEW.zoom;
            gctx.save();
            gctx.translate(center.x, center.y);
            if (rot) gctx.rotate(rot);
            gctx.drawImage(img, -sizeW / 2, -sizeH / 2, sizeW, sizeH);
            gctx.restore();
            return;
          }
          if (img && img.__bmStatus !== 'error') {
            return;
          }
        }

        gctx.save();
        gctx.translate(center.x, center.y);
        if (rot) gctx.rotate(rot);
        gctx.fillStyle = '#2b2f3a';
        gctx.fillRect(-sizeW / 2, -sizeH / 2, sizeW, sizeH);
        gctx.strokeStyle = '#4a5568';
        gctx.strokeRect(-sizeW / 2, -sizeH / 2, sizeW, sizeH);
        gctx.fillStyle = '#cfd6df';
        gctx.font = `${10 * VIEW.zoom}px sans-serif`;
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        const baseLabel = obj.name || obj.kind || 'obj';
        const displayZ = obj.z != null ? obj.z : (Number.isFinite(zIndex) ? zIndex : null);
        const label = displayZ != null ? `${baseLabel} (${displayZ})` : baseLabel;
        gctx.fillText(label, 0, 0);
        gctx.restore();
      }

      function tokenDefaultScale(token) {
        if (!token) return DEFAULT_TOKEN_SCALE;
        const kind = String(token.kind || '').toLowerCase();
        if (TOKEN_KIND_SCALES[kind] != null) return Number(TOKEN_KIND_SCALES[kind]) || DEFAULT_TOKEN_SCALE;
        return DEFAULT_TOKEN_SCALE;
      }

      function drawToken(token, gctx) {
        const p = parseHexLabel(token.hex);
        if (!p) return;
        const center = worldToScreen(hexToWorld(p.col, p.row));
        const url = token.sprite || token.spriteFile || resolveSpriteUrl(token.kind) ||
          resolveSpriteUrl(token.side === 'NPC' ? 'token.npc' : 'token.pc');
        const scale = Number.isFinite(Number(token.spriteScale)) ? Number(token.spriteScale) : tokenDefaultScale(token);
        const base = GRID.size * 0.9 * scale;
        if (url) {
          const img = loadSprite(url);
          if (img && img.complete && img.naturalWidth && img.naturalHeight) {
            const ratio = img.naturalHeight / img.naturalWidth;
            const sizeW = base * VIEW.zoom;
            const sizeH = base * ratio * VIEW.zoom;
            gctx.drawImage(img, center.x - sizeW / 2, center.y - sizeH / 2, sizeW, sizeH);
            return;
          }
          if (img && img.__bmStatus !== 'error') return;
        }
        const r = GRID.size * 0.35 * VIEW.zoom * scale;
        gctx.fillStyle = token.side === 'NPC' ? '#c95c5c' : '#5ca9c9';
        gctx.beginPath();
        gctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        gctx.fill();
        gctx.fillStyle = '#0b0f14';
        gctx.font = `${11 * VIEW.zoom}px sans-serif`;
        gctx.textAlign = 'center';
        gctx.textBaseline = 'middle';
        const label = token.name ? token.name[0].toUpperCase() : '?';
        gctx.fillText(label, center.x, center.y);
      }

      function numOr(value, fallback) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
      }

      function sortByZ(list) {
        if (!Array.isArray(list)) return [];
        const order = new Map();
        list.forEach((item, idx) => order.set(item, idx));
        return list.slice().sort((a, b) => {
          const za = numOr(a && a.z, order.get(a));
          const zb = numOr(b && b.z, order.get(b));
          return za - zb;
        });
      }

      function isDeleted(item) {
        return !!(item && item.deleted);
      }

      function filterAlive(list) {
        return Array.isArray(list) ? list.filter(item => item && !item.deleted) : [];
      }

      function roomAlwaysVisible(room) {
        if (!room || typeof room !== 'object') return false;
        const mode = String(room.fog_mode || room.fogMode || '').toLowerCase();
        if (mode === 'always' || mode === 'visible') return true;
        if (room.always_visible === true || room.alwaysVisible === true) return true;
        return false;
      }

      function getFogState() {
        const fog = STATE.battle && STATE.battle.fog ? STATE.battle.fog : null;
        if (!fog || fog.enabled === false) return null;
        return fog;
      }

      function getFogSets(floorId) {
        const fog = getFogState();
        if (!fog) return null;
        const key = String(floorId || '');
        const visibleMap = fog.visibleRoomIdsByFloor || {};
        const exploredMap = fog.exploredRoomIdsByFloor || {};
        let visible = visibleMap[key];
        let explored = exploredMap[key];
        if (!Array.isArray(visible) || !Array.isArray(explored)) {
          const lowerKey = key.toLowerCase();
          const findCase = (map) => {
            if (!map || typeof map !== 'object') return null;
            for (const k of Object.keys(map)) {
              if (String(k).toLowerCase() === lowerKey) return map[k];
            }
            return null;
          };
          if (!Array.isArray(visible)) visible = findCase(visibleMap);
          if (!Array.isArray(explored)) explored = findCase(exploredMap);
        }
        if (!Array.isArray(visible)) visible = [];
        if (!Array.isArray(explored)) explored = [];
        return {
          visible: new Set(visible.map(String)),
          explored: new Set(explored.map(String))
        };
      }

      function roomContainsWorld(room, worldPoint) {
        if (!room || !worldPoint) return false;
        const pts = roomWorldPoints(room);
        if (pts.length < 3) return false;
        return pointInPolygon(worldPoint, pts);
      }

      function findRoomForWorldPoint(rooms, worldPoint) {
        if (!Array.isArray(rooms) || !worldPoint) return null;
        for (const room of rooms) {
          if (!room || room.deleted) continue;
          if (roomContainsWorld(room, worldPoint)) return room;
        }
        return null;
      }

      function roomFogMode(room) {
        return String(room && (room.fog_mode || room.fogMode || '')).toLowerCase();
      }

      function roomIsStreetSegment(room) {
        if (!room || room.deleted) return false;
        const mode = roomFogMode(room);
        if (mode === 'street' || mode === 'street_segment' || mode === 'street-segment') return true;
        if (room.street === true || room.isStreet === true || room.streetSegment === true) return true;
        const idName = String((room.name || room.id || '')).toLowerCase();
        if (/(^|[^a-z])(street|road|lane|alley|close|way)([^a-z]|$)/.test(idName)) return true;
        const fk = String(room && room.floor && room.floor.kind ? room.floor.kind : '').toLowerCase();
        const wk = roomWallKind(room);
        if ((fk.includes('cobble') || fk.includes('gravel') || fk === 'stone_cobble') && wk === 'none') return true;
        return false;
      }

      function polygonBounds(points) {
        if (!Array.isArray(points) || !points.length) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of points) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        return { minX, minY, maxX, maxY };
      }

      function boundsOverlap(a, b) {
        if (!a || !b) return false;
        return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
      }

      function segCross(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      }

      function segOn(a, b, p, eps = 1e-6) {
        if (Math.abs(segCross(a, b, p)) > eps) return false;
        return (
          p.x >= Math.min(a.x, b.x) - eps &&
          p.x <= Math.max(a.x, b.x) + eps &&
          p.y >= Math.min(a.y, b.y) - eps &&
          p.y <= Math.max(a.y, b.y) + eps
        );
      }

      function segmentsIntersectInclusive(a, b, c, d, eps = 1e-6) {
        const o1 = segCross(a, b, c);
        const o2 = segCross(a, b, d);
        const o3 = segCross(c, d, a);
        const o4 = segCross(c, d, b);
        if ((o1 > eps && o2 < -eps || o1 < -eps && o2 > eps) && (o3 > eps && o4 < -eps || o3 < -eps && o4 > eps)) {
          return true;
        }
        if (Math.abs(o1) <= eps && segOn(a, b, c, eps)) return true;
        if (Math.abs(o2) <= eps && segOn(a, b, d, eps)) return true;
        if (Math.abs(o3) <= eps && segOn(c, d, a, eps)) return true;
        if (Math.abs(o4) <= eps && segOn(c, d, b, eps)) return true;
        return false;
      }

      function polygonsTouchOrOverlap(aPts, bPts) {
        if (!Array.isArray(aPts) || !Array.isArray(bPts) || aPts.length < 3 || bPts.length < 3) return false;
        const aBox = polygonBounds(aPts);
        const bBox = polygonBounds(bPts);
        if (!boundsOverlap(aBox, bBox)) return false;
        for (let i = 0; i < aPts.length; i++) {
          const a1 = aPts[i];
          const a2 = aPts[(i + 1) % aPts.length];
          for (let j = 0; j < bPts.length; j++) {
            const b1 = bPts[j];
            const b2 = bPts[(j + 1) % bPts.length];
            if (segmentsIntersectInclusive(a1, a2, b1, b2)) return true;
          }
        }
        if (pointInPolygon(aPts[0], bPts)) return true;
        if (pointInPolygon(bPts[0], aPts)) return true;
        return false;
      }

      function ensureFogFloorArray(map, floorId) {
        const key = String(floorId || '');
        if (!map || typeof map !== 'object') return null;
        if (!Array.isArray(map[key])) map[key] = [];
        return map[key];
      }

      function applyStreetSegmentReveal(floor, rooms) {
        const none = { visibleNow: new Set(), exploredNow: new Set() };
        if (!UI.fogEnabled || !floor) return none;
        const fog = getFogState();
        if (!fog) return none;
        if (fog.autoExplore === false) return none;
        const roomList = Array.isArray(rooms) ? rooms : [];
        if (!roomList.length) return none;
        const streetRooms = roomList.filter(roomIsStreetSegment);
        if (!streetRooms.length) return none;
        const streetById = new Map(streetRooms.map((r) => [String(r.id || ''), r]).filter(([id]) => !!id));
        const playerTokens = tokensForFloor(floor.id, { allowFallback: true }).filter((t) => {
          const kind = String(t && t.kind || '').toLowerCase();
          const side = String(t && t.side || '').toUpperCase();
          return kind === 'pc' || side === 'PC';
        });
        if (!playerTokens.length) return none;
        const activeStreetIds = new Set();
        for (const token of playerTokens) {
          const world = tokenWorldCenter(token);
          if (!world) continue;
          const seg = findRoomForWorldPoint(streetRooms, world);
          if (seg && seg.id != null) activeStreetIds.add(String(seg.id));
        }
        if (!activeStreetIds.size) return none;

        const visibleNow = new Set(activeStreetIds);
        const exploredNow = new Set();
        const revealCandidates = roomList.filter((room) => {
          if (!room || room.deleted || room.id == null) return false;
          const mode = roomFogMode(room);
          if (mode === 'hidden') return false;
          return !roomIsStreetSegment(room);
        });
        const streetPolys = Array.from(activeStreetIds)
          .map((id) => streetById.get(id))
          .filter(Boolean)
          .map((room) => ({ id: String(room.id), pts: roomWorldPoints(room) }))
          .filter((entry) => entry.pts.length >= 3);

        for (const room of revealCandidates) {
          const rid = String(room.id);
          const pts = roomWorldPoints(room);
          if (pts.length < 3) continue;
          for (const street of streetPolys) {
            if (polygonsTouchOrOverlap(pts, street.pts)) {
              visibleNow.add(rid);
              exploredNow.add(rid);
              break;
            }
          }
        }

        if (exploredNow.size) {
          fog.exploredRoomIdsByFloor = fog.exploredRoomIdsByFloor || {};
          const arr = ensureFogFloorArray(fog.exploredRoomIdsByFloor, floor.id);
          if (Array.isArray(arr)) {
            const set = new Set(arr.map(String));
            let changed = false;
            exploredNow.forEach((id) => {
              if (!set.has(id)) {
                set.add(id);
                changed = true;
              }
            });
            if (changed) {
              fog.exploredRoomIdsByFloor[String(floor.id)] = Array.from(set);
              DIRTY = true;
              if (saveStatus) saveStatus.textContent = 'DB: unsaved';
            }
          }
        }
        return { visibleNow, exploredNow };
      }

      function classifyRoomsForFog(floor, revealCtx) {
        const rooms = filterAlive(floor && floor.rooms ? floor.rooms : []);
        if (!UI.fogEnabled) return { visible: rooms, explored: [], hidden: [] };
        const sets = getFogSets(floor.id);
        if (!sets) return { visible: rooms, explored: [], hidden: [] };
        const forceVisible = revealCtx && revealCtx.visibleNow ? revealCtx.visibleNow : null;
        const forceExplored = revealCtx && revealCtx.exploredNow ? revealCtx.exploredNow : null;

        const visible = [];
        const explored = [];
        const hidden = [];
        for (const room of rooms) {
          const mode = String(room.fog_mode || room.fogMode || '').toLowerCase();
          const id = String(room.id || '');
          if (mode === 'hidden') { hidden.push(room); continue; }
          if (mode === 'street' || mode === 'street_segment' || mode === 'street-segment') { visible.push(room); continue; }
          if (mode === 'explored' || mode === 'always_fogged' || mode === 'fogged') { explored.push(room); continue; }
          if (roomAlwaysVisible(room) || mode === 'visible') {
            visible.push(room);
            continue;
          }
          if (forceVisible && forceVisible.has(id)) {
            visible.push(room);
            continue;
          }
          if (sets.visible.has(id)) {
            visible.push(room);
            continue;
          }
          if (forceExplored && forceExplored.has(id)) {
            explored.push(room);
            continue;
          }
          if (sets.explored.has(id)) {
            explored.push(room);
            continue;
          }
          hidden.push(room);
        }
        return { visible, explored, hidden };
      }

      function buildFogRoomSets(groups) {
        const visible = new Set();
        const explored = new Set();
        const hidden = new Set();
        if (!groups) return { visible, explored, hidden };
        (groups.visible || []).forEach(r => { if (r && r.id != null) visible.add(String(r.id)); });
        (groups.explored || []).forEach(r => { if (r && r.id != null) explored.add(String(r.id)); });
        (groups.hidden || []).forEach(r => { if (r && r.id != null) hidden.add(String(r.id)); });
        return { visible, explored, hidden };
      }

      function tokenWorldCenter(token) {
        if (!token) return null;
        const p = parseHexLabel(token.hex);
        if (!p) return null;
        return hexToWorld(p.col, p.row);
      }

      function tokenMatchesFloor(token, floorId) {
        if (!token) return false;
        const tokenFloor = token.floorId == null ? '' : String(token.floorId).trim();
        if (!tokenFloor) return true;
        return tokenFloor.toLowerCase() === String(floorId == null ? '' : floorId).trim().toLowerCase();
      }

      function tokensForFloor(floorId, opts = {}) {
        const allowFallback = !!(opts && opts.allowFallback);
        const all = buildTokens();
        const matched = all.filter(t => tokenMatchesFloor(t, floorId));
        if (matched.length || !allowFallback) return matched;
        return all;
      }

      function itemFogState(item, floor, rooms, roomSets, getWorld) {
        if (!UI.fogEnabled) return 'visible';
        const parentId = item && (item.parent_room || item.parentRoom || item.parentRoomId || item.room_id || item.roomId);
        if (parentId) {
          const room = Array.isArray(rooms) ? rooms.find(r => r && String(r.id) === String(parentId)) : null;
          if (room && room.id != null) {
            const id = String(room.id);
            if (roomSets.hidden && roomSets.hidden.has(id)) return 'hidden';
            if (roomSets.explored && roomSets.explored.has(id)) return 'explored';
            if (roomSets.visible && roomSets.visible.has(id)) return 'visible';
          }
        }
        const world = getWorld ? getWorld(item, floor) : null;
        if (!world) return 'visible';
        const room = findRoomForWorldPoint(rooms, world);
        if (!room || room.id == null) return 'visible';
        const id = String(room.id);
        if (roomSets.hidden && roomSets.hidden.has(id)) return 'hidden';
        if (roomSets.explored && roomSets.explored.has(id)) return 'explored';
        return 'visible';
      }

      function drawFogOverlay(rooms, gctx) {
        if (!UI.fogEnabled || !rooms || !rooms.length) return;
        const fog = getFogState();
        if (!fog) return;
        const alpha = Number.isFinite(Number(fog.exploredAlpha)) ? Number(fog.exploredAlpha) : 0.55;
        const color = FLOOR_COLORS.fog || '#0e1117';
        gctx.save();
        gctx.fillStyle = color;
        gctx.globalAlpha = alpha;
        for (const room of rooms) {
          if (!room || room.deleted) continue;
          const pts = roomWorldPoints(room);
          if (pts.length < 3) continue;
          const screenPts = pts.map(worldToScreen);
          gctx.beginPath();
          gctx.moveTo(screenPts[0].x, screenPts[0].y);
          for (let i = 1; i < screenPts.length; i++) gctx.lineTo(screenPts[i].x, screenPts[i].y);
          gctx.closePath();
          gctx.fill();
        }
        gctx.restore();
      }

      function render() {
        if (!STATE.battle) return;
        const baseDpr = window.devicePixelRatio || 1;
        const scale = VIDEO_SCALE[UI.video] ?? 1.5;
        const dpr = baseDpr * scale;
        renderDpr = dpr;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);

        const floor = pickFloor();
        if (!floor) return;

        const layerMode = layerSelect ? layerSelect.value : 'all';
        const floorLayer = getLayerContext('floors', rect, dpr);
        const wallLayer = getLayerContext('walls', rect, dpr);
        const roofLayer = getLayerContext('roofs', rect, dpr);
        const shadowLayer = getLayerContext('roofShadows', rect, dpr);
        const objectLayer = getLayerContext('objects', rect, dpr);
        const fogLayer = getLayerContext('fog', rect, dpr);
        const gridLayer = getLayerContext('grid', rect, dpr);
        const handleLayer = getLayerContext('handles', rect, dpr);
        const tokenLayer = getLayerContext('tokens', rect, dpr);

        const allRooms = filterAlive(floor.rooms || []);
        const streetReveal = applyStreetSegmentReveal(floor, allRooms);
        const fogRooms = classifyRoomsForFog(floor, streetReveal);
        const fogSets = buildFogRoomSets(fogRooms);
        const roomsToDraw = UI.fogEnabled ? fogRooms.visible.concat(fogRooms.explored) : allRooms;

        drawFloorsLayer(floor, floorLayer.ctx, roomsToDraw);
        drawWallsLayer(floor, wallLayer.ctx, roomsToDraw, fogSets);
        drawRoofsLayer(floor, roofLayer.ctx, allRooms, fogSets);
        drawRoofShadowsLayer(floor, shadowLayer.ctx, allRooms, fogSets, rect, dpr);
        drawGridLayer(gridLayer.ctx);
        drawHandlesLayer(floor, handleLayer.ctx);
        drawRoomEdgeHandles(floor, handleLayer.ctx);

        const openingsAll = sortByZ(filterAlive(floor.openings || [])).map(o => {
          const fogState = openingFogState(o, floor, allRooms, fogSets);
          return { opening: o, fogState };
        }).filter(entry => entry.fogState !== 'hidden');
        const objects = sortByZ(filterAlive(floor.objects || [])).filter(o => {
          return itemFogState(o, floor, allRooms, fogSets, objectWorldCenter) !== 'hidden';
        });
        const poiObjects = objects.filter(o => String(o.kind || '').toLowerCase().startsWith('the.'));
        const normalObjects = objects.filter(o => !String(o.kind || '').toLowerCase().startsWith('the.'));
        const tokensUnfiltered = tokensForFloor(floor.id, { allowFallback: true });
        const tokens = (UI.fogEnabled && layerMode !== 'tokens')
          ? tokensUnfiltered.filter(t => itemFogState(t, floor, allRooms, fogSets, tokenWorldCenter) !== 'hidden')
          : tokensUnfiltered;
        const objectOpenings = [];
        const tokenOpenings = [];
        openingsAll.forEach(entry => {
          const kind = String(entry.opening.kind || '').toLowerCase();
          if (kind === 'door' || kind.startsWith('door.') || kind.startsWith('window')) {
            tokenOpenings.push(entry);
          } else {
            objectOpenings.push(entry);
          }
        });
        objectOpenings.forEach(entry => drawOpening(entry.opening, floor, objectLayer.ctx, entry.fogState));
        normalObjects.forEach((obj, idx) => drawObject(obj, idx, objectLayer.ctx));
        tokens.forEach(t => drawToken(t, tokenLayer.ctx));
        tokenOpenings.forEach(entry => drawOpening(entry.opening, floor, tokenLayer.ctx, entry.fogState));
        poiObjects.forEach((obj, idx) => drawObject(obj, idx, tokenLayer.ctx));
        drawFogOverlay(fogRooms.explored, fogLayer.ctx);

        ctx.clearRect(0, 0, rect.width, rect.height);
        if (layerMode === 'all' || layerMode === 'floors') {
          ctx.drawImage(floorLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all' || layerMode === 'objects') {
          ctx.drawImage(objectLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all') {
          ctx.drawImage(fogLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all' || layerMode === 'walls') {
          ctx.drawImage(wallLayer.canvas, 0, 0, rect.width, rect.height);
        }
        const roofCompositeAlpha = Math.max(0, Math.min(1, UI.polyAlpha != null ? UI.polyAlpha : 1));
        if (layerMode === 'all' || layerMode === 'roofs') {
          ctx.save();
          ctx.globalAlpha = roofCompositeAlpha;
          ctx.drawImage(roofLayer.canvas, 0, 0, rect.width, rect.height);
          ctx.restore();
        }
        if (layerMode === 'all') {
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = Math.max(0, Math.min(1, ROOF_SHADOW_ALPHA * roofCompositeAlpha));
          ctx.drawImage(shadowLayer.canvas, 0, 0, rect.width, rect.height);
          ctx.restore();
        }
        if (layerMode === 'roof_shadows') {
          ctx.save();
          ctx.globalAlpha = roofCompositeAlpha;
          ctx.drawImage(shadowLayer.canvas, 0, 0, rect.width, rect.height);
          ctx.restore();
        }
        if (layerMode === 'all' || layerMode === 'tokens') {
          ctx.drawImage(tokenLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all' && UI.hexGrid) {
          ctx.drawImage(gridLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all' && (UI.showHandles || UI.handleHot)) {
          ctx.drawImage(handleLayer.canvas, 0, 0, rect.width, rect.height);
        }
        if (layerMode === 'all') {
          drawPolyPreview(ctx);
        }
      }

      function updateInspector() {
        const sel = EDITOR.selection;
        if (!sel) {
          inspectorEmpty.hidden = false;
          inspectorFields.hidden = true;
          inspectorFields.innerHTML = '';
          return;
        }

        inspectorEmpty.hidden = true;
        inspectorFields.hidden = false;
        inspectorFields.innerHTML = '';

        const addField = (label, value, key, opts = {}) => {
          const row = document.createElement('div');
          row.className = 'row';
          const lab = document.createElement('label');
          lab.textContent = label;
          const input = document.createElement('input');
          if (opts.type) input.type = opts.type;
          if (opts.step != null) input.step = String(opts.step);
          if (opts.list) input.setAttribute('list', opts.list);
          input.value = value == null ? '' : String(value);
          if (opts.readonly) input.readOnly = true;
          input.addEventListener('input', () => {
            applyFieldChange(key, input.value);
          });
          row.appendChild(lab);
          row.appendChild(input);
          inspectorFields.appendChild(row);
        };
        const addSelectField = (label, value, key, options = []) => {
          const row = document.createElement('div');
          row.className = 'row';
          const lab = document.createElement('label');
          lab.textContent = label;
          const select = document.createElement('select');
          for (const opt of options) {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            select.appendChild(o);
          }
          select.value = value == null ? '' : String(value);
          select.addEventListener('change', () => {
            applyFieldChange(key, select.value);
          });
          row.appendChild(lab);
          row.appendChild(select);
          inspectorFields.appendChild(row);
        };
        const addCheckboxField = (label, checked, key) => {
          const row = document.createElement('div');
          row.className = 'row';
          const lab = document.createElement('label');
          lab.textContent = label;
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = !!checked;
          input.addEventListener('change', () => {
            applyFieldChange(key, input.checked ? '1' : '');
          });
          row.appendChild(lab);
          row.appendChild(input);
          inspectorFields.appendChild(row);
        };
        const addSliderField = (label, value, key, opts = {}) => {
          const row = document.createElement('div');
          row.className = 'row';
          const lab = document.createElement('label');
          lab.textContent = label;
          const wrap = document.createElement('div');
          wrap.style.display = 'grid';
          wrap.style.gridTemplateColumns = '1fr 58px';
          wrap.style.gap = '6px';
          wrap.style.alignItems = 'center';

          const min = Number.isFinite(Number(opts.min)) ? Number(opts.min) : 0;
          const max = Number.isFinite(Number(opts.max)) ? Number(opts.max) : 1;
          const step = Number.isFinite(Number(opts.step)) ? Number(opts.step) : 0.01;
          const val = Number.isFinite(Number(value)) ? Number(value) : min;

          const range = document.createElement('input');
          range.type = 'range';
          range.min = String(min);
          range.max = String(max);
          range.step = String(step);
          range.value = String(Math.max(min, Math.min(max, val)));

          const number = document.createElement('input');
          number.type = 'number';
          number.min = String(min);
          number.max = String(max);
          number.step = String(step);
          number.value = String(Math.max(min, Math.min(max, val)));

          const syncFromRange = () => {
            number.value = range.value;
          };
          const syncFromNumber = () => {
            const n = Number(number.value);
            const clamped = Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
            range.value = String(clamped);
            number.value = String(clamped);
          };

          range.addEventListener('input', syncFromRange);
          range.addEventListener('change', () => {
            syncFromRange();
            applyFieldChange(key, range.value);
          });
          number.addEventListener('change', () => {
            syncFromNumber();
            applyFieldChange(key, number.value);
          });

          wrap.appendChild(range);
          wrap.appendChild(number);
          row.appendChild(lab);
          row.appendChild(wrap);
          inspectorFields.appendChild(row);
        };
        const addButtonRow = (buttons) => {
          const row = document.createElement('div');
          row.className = 'btnRow';
          buttons.forEach(({ label, onClick }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.addEventListener('click', onClick);
            row.appendChild(btn);
          });
          inspectorFields.appendChild(row);
        };
        const bumpToken = (key, delta) => {
          const cur = Number(sel.item[key]);
          const next = Number.isFinite(cur) ? cur + delta : delta;
          applyFieldChange(key, String(next));
          updateInspector();
        };
        const setTokenSide = (side, kind) => {
          applyFieldChange('side', side);
          if (kind) applyFieldChange('kind', kind);
          updateInspector();
        };

        if (sel.type === 'room') {
          addField('Type', 'room', 'type', { readonly: true });
          addField('ID', sel.item.id, 'id', { readonly: true });
          addField('Name', sel.item.name || '', 'name');
          addField('Floor', sel.floorId, 'floorId');
          addField('Points', formatRoomPoints(sel.item), 'points');
          addField('Thickness', sel.item.thickness != null ? sel.item.thickness : '', 'thickness', { type: 'number', step: '1' });
          addField('Floor Kind', sel.item.floor && sel.item.floor.kind ? sel.item.floor.kind : '', 'floor.kind', { list: 'floorKindList' });
          addField('Floor Rot', sel.item.floor && (sel.item.floor.rot ?? sel.item.floor.rotDeg) ? (sel.item.floor.rot ?? sel.item.floor.rotDeg) : '', 'floor.rot', { type: 'number', step: '1' });
          addField('Wall Kind', sel.item.wall && sel.item.wall.kind ? sel.item.wall.kind : '', 'wall.kind', { list: 'wallKindList' });
          if (getPolyPointLabels(sel.item)) {
            const edgeHidden = getPolyEdgeHiddenArray(sel.item).join(',');
            addField('Edge Hidden', edgeHidden, 'edge_hidden');
          }
          addField('Z', sel.item.z != null ? sel.item.z : '', 'z', { type: 'number', step: '1' });
          addSelectField('Fog', sel.item.fog_mode || sel.item.fogMode || '', 'fog_mode', [
            { value: '', label: 'Default' },
            { value: 'street_segment', label: 'Street Segment' },
            { value: 'visible', label: 'Always Visible' },
            { value: 'always_fogged', label: 'Always Fogged' },
            { value: 'explored', label: 'Always Explored' },
            { value: 'hidden', label: 'Always Hidden' }
          ]);
          addButtonRow([
            { label: 'To Front', onClick: () => reorderSelection('front') },
            { label: 'To Back', onClick: () => reorderSelection('back') },
          ]);
          addButtonRow([
            { label: 'Delete', onClick: () => deleteSelection() },
          ]);
        }

        if (sel.type === 'roof') {
          const weather = normalizeRoofWeathering(sel.item);
          addField('Type', 'roof', 'type', { readonly: true });
          addField('ID', sel.item.id, 'id', { readonly: true });
          addField('Floor', sel.floorId, 'floorId');
          addField('Points', formatRoomPoints(sel.item), 'points');
          addField('Kind', sel.item.kind || 'slate', 'kind', { list: 'floorKindList' });
          addCheckboxField('Rot90', !!sel.item.rot90, 'rot90');
          addField('Roof Rot', sel.item.rotDeg != null ? sel.item.rotDeg : 0, 'roof_rot', { type: 'number', step: '1' });
          addCheckboxField('Full Rot', !!sel.item.fullRotOn, 'full_rot_on');
          addField('Full Roof Rot', sel.item.fullRot != null ? sel.item.fullRot : 0, 'full_rot', { type: 'number', step: '1' });
          addField('Yellow', sel.item.spineAdjustA != null ? sel.item.spineAdjustA : 0, 'spine_adjust_a', { type: 'number', step: '1' });
          addField('Blue', sel.item.spineAdjustB != null ? sel.item.spineAdjustB : 0, 'spine_adjust_b', { type: 'number', step: '1' });
          addField('Shadow Depth', sel.item.shadowDepth != null ? sel.item.shadowDepth : 32, 'shadow_depth', { type: 'number', step: '1' });
          addField('Yellow Tile Offset', sel.item.tileOffsetYellow != null ? sel.item.tileOffsetYellow : 0, 'tile_offset_yellow', { type: 'number', step: '1' });
          addField('Blue Tile Offset', sel.item.tileOffsetBlue != null ? sel.item.tileOffsetBlue : 0, 'tile_offset_blue', { type: 'number', step: '1' });
          addField('Tint', sel.item.tint || '#ffffff', 'tint', { type: 'color' });
          addField('Tint Strength', sel.item.tintStrength != null ? sel.item.tintStrength : 0, 'tint_strength', { type: 'number', step: '0.05' });
          addField('Shade NE', sel.item.shade != null ? sel.item.shade : 0.2, 'shade', { type: 'number', step: '0.05' });
          addField('Weather Seed', weather && weather.seed ? weather.seed : (sel.item.id || ''), 'weather_seed');
          addSliderField('Aging', weather ? weather.aging : 0, 'weather_aging', { min: 0, max: 1, step: 0.01 });
          addSliderField('Moss', weather ? weather.moss : 0, 'weather_moss', { min: 0, max: 1, step: 0.01 });
          addSliderField('Mottling', weather ? weather.mottling : 0, 'weather_mottling', { min: 0, max: 1, step: 0.01 });
          addSliderField('Streaks', weather ? weather.streaks : 0, 'weather_streaks', { min: 0, max: 1, step: 0.01 });
          addSliderField('Repairs', weather ? weather.repairs : 0, 'weather_repairs', { min: 0, max: 1, step: 0.01 });
          addSliderField('Contrast', weather ? weather.contrast : 0, 'weather_contrast', { min: 0, max: 1, step: 0.01 });
          addField('Z', sel.item.z != null ? sel.item.z : '', 'z', { type: 'number', step: '1' });
          addButtonRow([
            {
              label: 'Reset Weather',
              onClick: () => {
                applyFieldChange('weather_reset', '1');
                updateInspector();
              }
            },
          ]);
          addButtonRow([
            { label: 'To Front', onClick: () => reorderSelection('front') },
            { label: 'To Back', onClick: () => reorderSelection('back') },
          ]);
          addButtonRow([
            { label: 'Delete', onClick: () => deleteSelection() },
          ]);
        }

        if (sel.type === 'opening') {
          addField('Type', 'opening', 'type', { readonly: true });
          addField('ID', sel.item.id, 'id', { readonly: true });
          addField('Name', sel.item.name || '', 'name');
          addField('Kind', sel.item.kind || '', 'kind', { list: 'openingKindList' });
          addSelectField('State', sel.item.state || sel.item.lock_state || '', 'state', [
            { value: '', label: 'Default' },
            { value: 'unlocked', label: 'Unlocked' },
            { value: 'locked', label: 'Locked' },
            { value: 'barred', label: 'Barred' }
          ]);
          addField('Hex', sel.item.hex || '', 'hex');
          addField('Floor', sel.floorId || '', 'floorId');
          addField('Orientation', sel.item.orientation || 'h', 'orientation');
          addField('Hinge', sel.item.hinge || '', 'hinge');
          addField('Swing', sel.item.swing != null ? sel.item.swing : '', 'swing', { type: 'number', step: '1' });
          addField('Open %', sel.item.openPct != null ? sel.item.openPct : 0, 'openPct', { type: 'number', step: '0.05' });
          addField('Length', sel.item.len != null ? sel.item.len : '', 'len', { type: 'number', step: '0.05' });
          addField('Thickness', sel.item.thickness != null ? sel.item.thickness : '', 'thickness', { type: 'number', step: '0.05' });
          addField('Z', sel.item.z != null ? sel.item.z : '', 'z', { type: 'number', step: '1' });
          addButtonRow([
            { label: 'To Front', onClick: () => reorderSelection('front') },
            { label: 'To Back', onClick: () => reorderSelection('back') },
          ]);
          addButtonRow([
            { label: 'Delete', onClick: () => deleteSelection() },
          ]);
        }

        if (sel.type === 'object') {
          addField('Type', 'object', 'type', { readonly: true });
          addField('ID', sel.item.id, 'id', { readonly: true });
          addField('Name', sel.item.name || '', 'name');
          addField('Kind', sel.item.kind || '', 'kind', { list: 'objectKindList' });
          addField('Hex', sel.item.hex || '', 'hex');
          addField('Floor', sel.item.floorId || '', 'floorId');
          addField('Parent Room', sel.item.parent_room || sel.item.parentRoom || sel.item.room_id || sel.item.roomId || '', 'parent_room');
          addField('Sprite', sel.item.sprite || sel.item.spriteFile || '', 'sprite');
          addField('Scale', sel.item.spriteScale != null ? sel.item.spriteScale : '', 'spriteScale', { type: 'number', step: '0.05' });
          addField('Scale X', sel.item.spriteScaleX != null ? sel.item.spriteScaleX : '', 'spriteScaleX', { type: 'number', step: '0.05' });
          addField('Scale Y', sel.item.spriteScaleY != null ? sel.item.spriteScaleY : '', 'spriteScaleY', { type: 'number', step: '0.05' });
          addField('Rot Deg', sel.item.rotDeg != null ? sel.item.rotDeg : '', 'rotDeg', { type: 'number', step: '1' });
          addField('Offset X', sel.item.ox != null ? sel.item.ox : '', 'ox', { type: 'number', step: '0.05' });
          addField('Offset Y', sel.item.oy != null ? sel.item.oy : '', 'oy', { type: 'number', step: '0.05' });
          addField('Z', sel.item.z != null ? sel.item.z : '', 'z', { type: 'number', step: '1' });
          addButtonRow([
            { label: 'To Front', onClick: () => reorderSelection('front') },
            { label: 'To Back', onClick: () => reorderSelection('back') },
          ]);
          addButtonRow([
            { label: 'Delete', onClick: () => deleteSelection() },
          ]);
        }

        if (sel.type === 'token') {
          addField('Type', 'token', 'type', { readonly: true });
          addField('ID', sel.item.id, 'id', { readonly: true });
          addField('Name', sel.item.name || '', 'name');
          addField('Kind', sel.item.kind || '', 'kind', { list: 'tokenKindList' });
          addField('Hex', sel.item.hex || '', 'hex');
          addField('Floor', sel.item.floorId || '', 'floorId');
          addField('POI', sel.item.poi_id || '', 'poi_id');
          addSelectField('Sprite', sel.item.sprite || '', 'sprite', TOKEN_SPRITE_OPTIONS);
          addField('Scale', sel.item.spriteScale != null ? sel.item.spriteScale : '', 'spriteScale', { type: 'number', step: '0.05' });
          addField('Side', sel.item.side || '', 'side');
          addField('HP', sel.item.hp != null ? sel.item.hp : '', 'hp', { type: 'number', step: '1' });
          addField('Init', sel.item.init != null ? sel.item.init : '', 'init', { type: 'number', step: '1' });
          addField('Z', sel.item.z != null ? sel.item.z : '', 'z', { type: 'number', step: '1' });
          addButtonRow([
            { label: 'HP -1', onClick: () => bumpToken('hp', -1) },
            { label: 'HP +1', onClick: () => bumpToken('hp', 1) },
            { label: 'Init -1', onClick: () => bumpToken('init', -1) },
            { label: 'Init +1', onClick: () => bumpToken('init', 1) },
          ]);
          addButtonRow([
            { label: 'Set PC', onClick: () => setTokenSide('PC', 'pc') },
            { label: 'Set NPC', onClick: () => setTokenSide('NPC', 'npc') },
          ]);
          addButtonRow([
            { label: 'Delete', onClick: () => deleteSelection() },
          ]);
        }
      }
      function applyFieldChange(key, value) {
        const sel = EDITOR.selection;
        if (!sel) return;
        pushHistory();
        const item = sel.item;
        const num = (val, fallback = null) => {
          if (val == null || String(val).trim() === '') return fallback;
          const n = Number(val);
          return Number.isFinite(n) ? n : fallback;
        };

        if (sel.type === 'room') {
          if (key === 'name') item.name = value;
          if (key === 'floorId') moveRoomToFloor(item, value);
          if (key === 'points') {
            const points = parsePointList(value);
            if (points.length >= 3) {
              item.points = points;
            } else {
              delete item.points;
            }
          }
          if (key === 'fog_mode') {
            const v = String(value || '').trim().toLowerCase();
            if (!v) {
              delete item.fog_mode;
              delete item.fogMode;
            } else {
              item.fog_mode = v;
            }
          }
          if (key === 'thickness') item.thickness = num(value, 0);
          if (key === 'floor.kind') {
            item.floor = item.floor || {};
            item.floor.kind = value;
          }
          if (key === 'floor.rot') {
            item.floor = item.floor || {};
            const n = num(value, null);
            if (n == null) delete item.floor.rot;
            else item.floor.rot = n;
          }
          if (key === 'wall.kind') {
            item.wall = item.wall || {};
            item.wall.kind = value;
          }
          if (key === 'edge_hidden') {
            const raw = String(value || '').trim();
            if (!raw) {
              delete item.edge_hidden;
              delete item.edgeHidden;
            } else {
              const arr = raw.split(/[,\s]+/).map(Number).filter(n => Number.isFinite(n) && n >= 0);
              setPolyEdgeHiddenArray(item, arr);
            }
          }
          if (key === 'z') item.z = num(value, null);
        }

        if (sel.type === 'roof') {
          const weather = normalizeRoofWeathering(item);
          if (key === 'floorId') moveRoofToFloor(item, value);
          if (key === 'points') {
            const points = parsePointList(value);
            if (points.length >= 3) {
              item.points = points;
              updateRoofSpine(item);
            } else {
              delete item.points;
              delete item.spine;
            }
          }
          if (key === 'kind') item.kind = value;
          if (key === 'rot90') {
            const v = String(value || '').trim().toLowerCase();
            item.rot90 = v === '1' || v === 'true' || v === 'yes' || v === 'on';
            updateRoofSpine(item);
          }
          if (key === 'roof_rot') {
            const n = num(value, 0);
            item.rotDeg = Number.isFinite(n) ? n : 0;
            updateRoofSpine(item);
          }
          if (key === 'full_rot_on') {
            const v = String(value || '').trim().toLowerCase();
            item.fullRotOn = v === '1' || v === 'true' || v === 'yes' || v === 'on';
            updateRoofSpine(item);
          }
          if (key === 'full_rot') {
            const n = num(value, 0);
            item.fullRot = Number.isFinite(n) ? n : 0;
            updateRoofSpine(item);
          }
          if (key === 'spine_adjust_a') {
            const n = num(value, 0);
            item.spineAdjustA = Number.isFinite(n) ? Math.round(n) : 0;
            updateRoofSpine(item);
          }
          if (key === 'spine_adjust_b') {
            const n = num(value, 0);
            item.spineAdjustB = Number.isFinite(n) ? Math.round(n) : 0;
            updateRoofSpine(item);
          }
          if (key === 'shadow_depth') {
            const n = num(value, 32);
            item.shadowDepth = Number.isFinite(n) ? n : 32;
          }
          if (key === 'tile_offset_yellow') {
            const n = num(value, 0);
            item.tileOffsetYellow = Number.isFinite(n) ? n : 0;
          }
          if (key === 'tile_offset_blue') {
            const n = num(value, 0);
            item.tileOffsetBlue = Number.isFinite(n) ? n : 0;
          }
          if (key === 'tint') {
            const v = String(value || '').trim();
            item.tint = /^#[0-9a-f]{6}$/i.test(v) ? v : '#ffffff';
          }
          if (key === 'tint_strength') item.tintStrength = Math.max(0, Math.min(1, num(value, 0)));
          if (key === 'shade') item.shade = Math.max(0, Math.min(1, num(value, 0.2)));
          if (key === 'weather_seed') {
            const v = String(value || '').trim();
            weather.seed = v || String(item.id || 'roof-weather');
          }
          if (key === 'weather_aging') weather.aging = clampUnitInterval(num(value, 0));
          if (key === 'weather_moss') weather.moss = clampUnitInterval(num(value, 0));
          if (key === 'weather_mottling') weather.mottling = clampUnitInterval(num(value, 0));
          if (key === 'weather_streaks') weather.streaks = clampUnitInterval(num(value, 0));
          if (key === 'weather_repairs') weather.repairs = clampUnitInterval(num(value, 0));
          if (key === 'weather_contrast') weather.contrast = clampUnitInterval(num(value, 0));
          if (key === 'weather_reset') {
            weather.aging = 0;
            weather.moss = 0;
            weather.mottling = 0;
            weather.streaks = 0;
            weather.repairs = 0;
            weather.contrast = 0;
          }
          if (key === 'z') item.z = num(value, null);
        }

        if (sel.type === 'opening') {
          if (key === 'name') item.name = value;
          if (key === 'kind') item.kind = value;
          if (key === 'state') {
            const v = String(value || '').trim().toLowerCase();
            if (!v) delete item.state;
            else item.state = v;
          }
          if (key === 'hex') item.hex = value;
          if (key === 'floorId') moveOpeningToFloor(item, value);
          if (key === 'orientation') item.orientation = value;
          if (key === 'hinge') item.hinge = value;
          if (key === 'swing') item.swing = num(value, 1);
          if (key === 'openPct') item.openPct = Math.max(0, Math.min(1, num(value, 0)));
          if (key === 'len') {
            const n = num(value, null);
            if (n == null) delete item.len;
            else item.len = n;
          }
          if (key === 'thickness') {
            const n = num(value, null);
            if (n == null) delete item.thickness;
            else item.thickness = n;
          }
          if (key === 'z') item.z = num(value, null);
        }

        if (sel.type === 'object') {
          if (key === 'name') item.name = value;
          if (key === 'kind') item.kind = value;
          if (key === 'hex') item.hex = value;
          if (key === 'floorId') item.floorId = value;
          if (key === 'parent_room') {
            if (!value) {
              delete item.parent_room;
              delete item.parentRoom;
              delete item.room_id;
              delete item.roomId;
            } else {
              item.parent_room = value;
            }
          }
          if (key === 'sprite') item.sprite = value;
          if (key === 'spriteScale') item.spriteScale = num(value, 1);
          if (key === 'spriteScaleX') item.spriteScaleX = num(value, null);
          if (key === 'spriteScaleY') item.spriteScaleY = num(value, null);
          if (key === 'rotDeg') item.rotDeg = num(value, 0);
          if (key === 'ox') item.ox = num(value, 0);
          if (key === 'oy') item.oy = num(value, 0);
          if (key === 'z') item.z = num(value, null);
        }

        if (sel.type === 'token') {
          if (key === 'name') item.name = value;
          if (key === 'kind') item.kind = value;
          if (key === 'hex') item.hex = value;
          if (key === 'floorId') item.floorId = value;
          if (key === 'poi_id') item.poi_id = value;
          if (key === 'sprite') {
            if (!value) delete item.sprite;
            else item.sprite = value;
          }
          if (key === 'spriteScale') item.spriteScale = num(value, null);
          if (key === 'side') item.side = value;
          if (key === 'hp') item.hp = num(value, null);
          if (key === 'init') item.init = num(value, null);
          if (key === 'z') item.z = num(value, null);
          syncEntityFromToken(item);
          queueEntitySave(item);
          renderStatus();
        }

        EDITOR.dirty = true;
        render();
      }

      function updateRoomCorners(room, key, value) {
        const corners = Array.isArray(room.corners) ? room.corners.slice() : [];
        if (corners.length < 4) return;
        if (key === 'cornerTL') corners[0] = value;
        if (key === 'cornerBR') corners[2] = value;
        room.corners = corners;
      }

      function moveRoomToFloor(room, floorId) {
        const floors = STATE.battle.floors;
        const source = floors.find(f => f.rooms.includes(room));
        const target = floors.find(f => f.id === floorId);
        if (!source || !target) return;
        source.rooms = source.rooms.filter(r => r !== room);
        target.rooms.push(room);
        EDITOR.selection.floorId = floorId;
      }

      function moveOpeningToFloor(opening, floorId) {
        const floors = STATE.battle.floors;
        const source = floors.find(f => f.openings && f.openings.includes(opening));
        const target = floors.find(f => f.id === floorId);
        if (!source || !target) return;
        source.openings = source.openings.filter(o => o !== opening);
        if (!Array.isArray(target.openings)) target.openings = [];
        target.openings.push(opening);
        EDITOR.selection.floorId = floorId;
      }

      function moveRoofToFloor(roof, floorId) {
        const floors = STATE.battle.floors;
        const source = floors.find(f => f.roofs && f.roofs.includes(roof));
        const target = floors.find(f => f.id === floorId);
        if (!source || !target) return;
        source.roofs = source.roofs.filter(r => r !== roof);
        if (!Array.isArray(target.roofs)) target.roofs = [];
        target.roofs.push(roof);
        EDITOR.selection.floorId = floorId;
      }

      function reorderSelection(direction) {
        const sel = EDITOR.selection;
        if (!sel || !STATE.battle) return;
        const floor = STATE.battle.floors.find(f => String(f.id) === String(sel.floorId));
        if (!floor) return;
        pushHistory();

        let list = null;
        if (sel.type === 'room') list = floor.rooms;
        if (sel.type === 'roof') list = floor.roofs;
        if (sel.type === 'opening') list = floor.openings;
        if (sel.type === 'object') list = floor.objects;
        if (!Array.isArray(list)) return;

        const idx = list.indexOf(sel.item);
        if (idx === -1) return;
        list.splice(idx, 1);
        if (direction === 'front') list.push(sel.item);
        else list.unshift(sel.item);

        // Persist order via z so reloads keep the stack.
        const zVals = list.map((item, i) => numOr(item && item.z, i));
        const maxZ = Math.max(0, ...zVals);
        const minZ = Math.min(0, ...zVals);
        sel.item.z = direction === 'front' ? maxZ + 1 : minZ - 1;

        EDITOR.dirty = true;
        updateInspector();
        render();
      }

      function selectItem(type, item, floorId) {
        EDITOR.selection = { type, item, floorId };
        updateInspector();
      }

      function clearSelection() {
        EDITOR.selection = null;
        updateInspector();
      }

      function deleteSelection() {
        const sel = EDITOR.selection;
        if (!sel) return;
        pushHistory();
        if (sel.type === 'token') {
          const entity = sel.item && sel.item.__entity;
          if (entity) {
            entity.deleted = true;
            saveEntityPatch(entity.id || sel.item.id, { deleted: true }, false);
          }
          renderStatus();
          clearSelection();
          render();
          return;
        }
        const floor = STATE.battle && Array.isArray(STATE.battle.floors)
          ? STATE.battle.floors.find(f => String(f.id) === String(sel.floorId))
          : null;
        if (!floor) return;
        if (sel.type === 'room') sel.item.deleted = true;
        if (sel.type === 'roof') sel.item.deleted = true;
        if (sel.type === 'opening') sel.item.deleted = true;
        if (sel.type === 'object') sel.item.deleted = true;
        clearSelection();
        EDITOR.dirty = true;
        render();
      }

      function nearestItem(list, point, getPos, maxDist = 20) {
        let best = null;
        let bestD = Infinity;
        for (const item of list) {
          const pos = getPos(item);
          if (!pos) continue;
          const dx = pos.x - point.x;
          const dy = pos.y - point.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD && d <= maxDist) {
            bestD = d;
            best = item;
          }
        }
        return best;
      }

      function findSelectionAt(worldPoint) {
        const floor = pickFloor();
        if (!floor) return null;
        const screenPoint = worldToScreen(worldPoint);

        const tokens = tokensForFloor(floor.id, { allowFallback: true });
        const token = nearestItem(tokens, screenPoint, t => {
          const pos = parseHexLabel(t.hex);
          return pos ? worldToScreen(hexToWorld(pos.col, pos.row)) : null;
        }, 18);
        if (token) return { type: 'token', item: token, floorId: floor.id };

        const objects = filterAlive(floor.objects || []);
        const object = nearestItem(objects, screenPoint, o => {
          const world = objectWorldCenter(o);
          return world ? worldToScreen(world) : null;
        }, 18);
        if (object) return { type: 'object', item: object, floorId: floor.id };

        const openings = filterAlive(floor.openings || []);
        const opening = nearestItem(openings, screenPoint, o => {
          const world = openingWorldCenter(o, floor);
          return world ? worldToScreen(world) : null;
        }, 14);
        if (opening) return { type: 'opening', item: opening, floorId: floor.id };

        if (!UI.hideRoofs) {
          const roofs = sortByZ(filterAlive(floor.roofs || [])).reverse();
          for (const roof of roofs) {
          const pts = roofWorldPoints(roof);
            if (pts.length >= 3 && pointInPolygon(worldPoint, pts)) {
              return { type: 'roof', item: roof, floorId: floor.id };
            }
          }
        }

        for (const room of filterAlive(floor.rooms || [])) {
          const polyLabels = getPolyPointLabels(room);
          if (polyLabels) {
            const poly = labelsToScreenPoints(polyLabels);
            if (!poly || poly.length < 3) continue;
            if (pointInPolygon(screenPoint, poly)) {
              return { type: 'room', item: room, floorId: floor.id };
            }
          }
        }

        return null;
      }

      function pointInPolygon(point, vs) {
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          const xi = vs[i].x, yi = vs[i].y;
          const xj = vs[j].x, yj = vs[j].y;
          const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 0.00001) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }

      function handleCanvasClick(ev) {
        if (EDITOR.ignoreClick) {
          EDITOR.ignoreClick = false;
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const world = screenToWorld(x, y);
        const hex = (EDITOR.tool === 'poly') ? worldToHexHalf(world) : worldToHex(world);
        const hexLabel = toHexLabel(hex.col, hex.row);
        const hexWorld = hexToWorld(hex.col, hex.row);
        const floor = pickFloor();
        if (!floor) return;

        if (!editorMode && EDITOR.tool !== 'select') {
          setTool('select');
          return;
        }

        if (EDITOR.tool === 'select') {
          const sel = findSelectionAt(world);
          if (!editorMode) {
            if (sel && sel.type === 'token') selectItem(sel.type, sel.item, sel.floorId);
            else clearSelection();
            return;
          }
          if (sel) selectItem(sel.type, sel.item, sel.floorId);
          else clearSelection();
          return;
        }

        if (EDITOR.tool === 'poly') {
          const snap = worldToHexHalf(world);
          const snapWorld = hexToWorld(snap.col, snap.row);
          const label = toHexLabel(snap.col, snap.row);
          const points = Array.isArray(EDITOR.polyPoints) ? EDITOR.polyPoints : [];
          const polyMode = EDITOR.polyMode || 'room';
          if (!points.length) {
            EDITOR.polyPoints = [{ hex: snap, world: snapWorld, label }];
            return;
          }
          const first = points[0].world;
          const firstScreen = worldToScreen(first);
          const curScreen = worldToScreen(snapWorld);
          const dx = firstScreen.x - curScreen.x;
          const dy = firstScreen.y - curScreen.y;
          const closeEnough = (dx * dx + dy * dy) <= 144; // 12px radius
          if (closeEnough && points.length >= 3) {
            pushHistory();
            if (polyMode === 'roof') {
              const roofPoints = points.map(p => p.label);
              const roof = {
                id: 'roof_' + Date.now().toString(36),
                shape: 'poly',
                points: roofPoints,
                kind: 'slate',
                shade: 0.2,
                tint: '#ffffff',
                tintStrength: 0,
                tileOffsetYellow: 0,
                tileOffsetBlue: 0,
                shadowDepth: 32,
                rotDeg: 0,
                fullRot: 0,
                fullRotOn: false,
                rot90: false,
                spineAdjustA: 0,
                spineAdjustB: 0,
                z: 0
              };
              normalizeRoofWeathering(roof);
              updateRoofSpine(roof);
              if (!Array.isArray(floor.roofs)) floor.roofs = [];
              floor.roofs.push(roof);
              selectItem('roof', roof, floor.id);
            } else {
              const room = {
                id: 'room_' + Date.now().toString(36),
                shape: 'poly',
                points: points.map(p => p.label),
                thickness: 15,
                floor: { kind: 'wood_oak' },
                wall: { kind: 'brick' }
              };
              floor.rooms.push(room);
              selectItem('room', room, floor.id);
            }
            EDITOR.polyPoints = [];
            EDITOR.polyHover = null;
            EDITOR.dirty = true;
            render();
            setTool('select');
            return;
          }
          EDITOR.polyPoints = points.concat({ hex: snap, world: snapWorld, label });
          render();
          return;
        }

        if (EDITOR.tool === 'opening') {
          const snapped = snapWorldToWall(world, floor, EDITOR.openingOrientation || 'h');
          const openHex = openingHexFromWorld(snapped);
          const openLabel = openingHexLabelFromCoords(openHex.col, openHex.row) || hexLabel;
          pushHistory();
          const opening = {
            id: 'opening_' + Date.now().toString(36),
            kind: EDITOR.openingKind || 'door.wood',
            hex: openLabel,
            orientation: EDITOR.openingOrientation || 'h',
            openPct: 0
          };
          floor.openings.push(opening);
          selectItem('opening', opening, floor.id);
          EDITOR.dirty = true;
          render();
          setTool('select');
          return;
        }

        if (EDITOR.tool === 'object') {
          pushHistory();
          const obj = {
            id: 'object_' + Date.now().toString(36),
            kind: EDITOR.objectKind || 'object',
            hex: hexLabel,
            floorId: floor.id
          };
          floor.objects.push(obj);
          selectItem('object', obj, floor.id);
          EDITOR.dirty = true;
          render();
          setTool('select');
          return;
        }

        if (EDITOR.tool === 'token') {
          pushHistory();
          const poiId = resolvePoiId();
          const entityId = `entity_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
          const tokenKind = (EDITOR.tokenKind || 'npc').toLowerCase();
          const tokenSide = tokenKind === 'pc' ? 'PC' : 'NPC';
          const entity = {
            id: entityId,
            name: 'Token',
            kind: tokenKind,
            poi_id: poiId || '',
            location: { hex: hexLabel, floorId: floor.id }
          };
          STATE.entities = Array.isArray(STATE.entities) ? STATE.entities : [];
          STATE.entities.push(entity);

          const token = {
            id: entityId,
            name: entity.name,
            kind: entity.kind,
            hex: entity.location.hex,
            floorId: entity.location.floorId,
            poi_id: entity.poi_id,
            side: entity.side || tokenSide,
            __entity: entity
          };
          selectItem('token', token, floor.id);
          syncEntityFromToken(token);
          queueEntitySave(token);
          renderStatus();
          EDITOR.dirty = true;
          render();
          setTool('select');
        }
      }

      function syncEntityFromToken(token) {
        const entity = token && token.__entity;
        if (!entity) return;
        entity.name = token.name;
        if (token.kind) entity.kind = token.kind;
        if (token.sprite) entity.sprite = token.sprite;
        if (!token.sprite && entity.sprite) delete entity.sprite;
        if (token.spriteScale != null) {
          if (!entity.appearance || typeof entity.appearance !== 'object') entity.appearance = {};
          entity.appearance.sprite_scale = token.spriteScale;
        } else if (entity.appearance && (entity.appearance.sprite_scale != null || entity.appearance.spriteScale != null)) {
          delete entity.appearance.sprite_scale;
          delete entity.appearance.spriteScale;
        }
        if (!entity.location || typeof entity.location !== 'object') entity.location = {};
        if (token.hex) entity.location.hex = token.hex;
        if (token.floorId) entity.location.floorId = token.floorId;
        if (token.poi_id) entity.poi_id = token.poi_id;
        if (token.side) entity.side = token.side;
        if (!entity.stats || typeof entity.stats !== 'object') entity.stats = {};
        if (token.hp != null) {
          entity.stats.hp = token.hp;
          entity.hp = token.hp;
        }
        if (token.init != null) {
          entity.stats.init = token.init;
          entity.init = token.init;
        }
      }

      function onDragMove(worldPoint) {
        const drag = EDITOR.drag;
        if (!drag) return;
        const hex = worldToHex(worldPoint);
        const hexLabel = toHexLabel(hex.col, hex.row);

        const moveDx = worldPoint.x - (drag.startWorld ? drag.startWorld.x : worldPoint.x);
        const moveDy = worldPoint.y - (drag.startWorld ? drag.startWorld.y : worldPoint.y);

        if (drag.type === 'token') {
          drag.item.hex = hexLabel;
          drag.item.floorId = VIEW.floorId || drag.floorId || drag.item.floorId;
          syncEntityFromToken(drag.item);
        } else if (drag.type === 'opening') {
          const orient = drag.item && drag.item.orientation === 'v' ? 'v' : 'h';
          const snapped = snapWorldToWall(worldPoint, pickFloor(), orient);
          const openHex = openingHexFromWorld(snapped);
          const openLabel = openingHexLabelFromCoords(openHex.col, openHex.row) || hexLabel;
          drag.item.hex = openLabel;
        } else if (drag.type === 'object') {
          const base = hexToWorld(hex.col, hex.row);
          const ox = (worldPoint.x - base.x) / GRID.size;
          const oy = (worldPoint.y - base.y) / GRID.size;
          drag.item.hex = hexLabel;
          drag.item.ox = Math.round(ox * 100) / 100;
          drag.item.oy = Math.round(oy * 100) / 100;
        } else if (drag.type === 'poly-point') {
          const snapWorld = (drag.ownerType === 'roof') ? unrotateRoofWorldPoint(drag.item, worldPoint) : worldPoint;
          const snap = worldToHexHalf(snapWorld);
          const label = toHexLabel(snap.col, snap.row);
          setPolyPoint(drag.item, drag.index, label);
          if (drag.ownerType === 'roof') updateRoofSpine(drag.item);
        } else if (drag.type === 'poly-move') {
          const baseWorld = (drag.ownerType === 'roof') ? unrotateRoofWorldPoint(drag.item, worldPoint) : worldPoint;
          const startWorld = drag.startWorld
            ? ((drag.ownerType === 'roof') ? unrotateRoofWorldPoint(drag.item, drag.startWorld) : drag.startWorld)
            : baseWorld;
          const startHex = drag.startHex || worldToHexHalf(startWorld);
          const curHex = worldToHexHalf(baseWorld);
          const dCol = curHex.col - startHex.col;
          const dRow = curHex.row - startHex.row;
          const base = Array.isArray(drag.pointsBase) ? drag.pointsBase : null;
          if (!base || !base.length) return;
          const labels = base.map(p => toHexLabel(p.col + dCol, p.row + dRow));
          setPolyPoints(drag.item, labels);
          if (drag.ownerType === 'roof') updateRoofSpine(drag.item);
        } else if (drag.type === 'roof-spine') {
          const axisDelta = drag.rot90 ? (worldPoint.x - drag.startWorld.x) : (worldPoint.y - drag.startWorld.y);
          const dir = drag.endpoint === 'a' ? -1 : 1;
          const next = drag.startAdjust + (dir * axisDelta);
          const value = Number.isFinite(next) ? Math.round(next) : 0;
          if (drag.endpoint === 'a') drag.item.spineAdjustA = value;
          else drag.item.spineAdjustB = value;
          updateRoofSpine(drag.item);
        }
        if (drag.type === 'poly-move' && drag.ownerType === 'room') {
          const openings = Array.isArray(drag.openingsBase) ? drag.openingsBase : null;
          if (openings && openings.length) {
            for (const entry of openings) {
              const baseWorld = entry.world;
              if (!baseWorld || !entry.opening) continue;
              const newWorld = { x: baseWorld.x + moveDx, y: baseWorld.y + moveDy };
              const oHex = openingHexFromWorld(newWorld);
              const openLabel = openingHexLabelFromCoords(oHex.col, oHex.row) || toHexLabel(oHex.col, oHex.row);
              entry.opening.hex = openLabel;
            }
          }
        }
        EDITOR.dirty = true;
        render();
      }

      function attachDragHandlers() {
        canvas.addEventListener('mousedown', (ev) => {
          const rect = canvas.getBoundingClientRect();
          const x = ev.clientX - rect.left;
          const y = ev.clientY - rect.top;
          const world = screenToWorld(x, y);
          const screenPoint = { x, y };
          const floor = pickFloor();
          if (EDITOR.tool !== 'select') return;
          if (!editorMode) {
            const sel = findSelectionAt(world);
            if (!sel || sel.type !== 'token') {
              clearSelection();
              return;
            }
            selectItem(sel.type, sel.item, sel.floorId);
            EDITOR.drag = sel;
            EDITOR.drag.didMove = false;
            EDITOR.drag.pushed = false;
            return;
          }
          if (floor && EDITOR.selection && (EDITOR.selection.type === 'room' || EDITOR.selection.type === 'roof')) {
            if (UI.showHandles || UI.handleHot) {
              if (EDITOR.selection.type === 'roof') {
                const spineHit = getRoofSpineHandleHit(EDITOR.selection.item, screenPoint);
                if (spineHit) {
                  EDITOR.drag = {
                    type: 'roof-spine',
                    endpoint: spineHit,
                    item: EDITOR.selection.item,
                    floorId: EDITOR.selection.floorId,
                    startWorld: world,
                    startAdjust: spineHit === 'a'
                      ? (Number(EDITOR.selection.item.spineAdjustA) || 0)
                      : (Number(EDITOR.selection.item.spineAdjustB) || 0),
                    rot90: !!EDITOR.selection.item.rot90,
                    didMove: false,
                    pushed: false
                  };
                  return;
                }
              }
              let hit = getPolyHandleHit(EDITOR.selection.item, screenPoint);
              if (EDITOR.selection.type === 'roof') {
                if (hit && hit.type === 'poly-edge') {
                  pushHistory();
                  toggleRoofLineHidden(EDITOR.selection.item, `edge:${hit.index}`);
                  updateInspector();
                  render();
                  return;
                }
                if (!hit || hit.type === 'poly-move') {
                  const roofLineHit = getRoofLineHit(EDITOR.selection.item, screenPoint);
                  if (roofLineHit) {
                    pushHistory();
                    toggleRoofLineHidden(EDITOR.selection.item, roofLineHit.key);
                    updateInspector();
                    render();
                    return;
                  }
                }
              }
              if (hit) {
                if (hit.type === 'poly-edge') {
                  if (EDITOR.selection.type === 'room') {
                    pushHistory();
                    const labels = getPolyPointLabels(EDITOR.selection.item);
                    const count = labels ? labels.length : 0;
                    togglePolyEdgeHidden(EDITOR.selection.item, hit.index, count);
                    updateInspector();
                    render();
                  }
                  return;
                }
                const polyLabels = hit.type === 'poly-move' ? getPolyPointLabels(EDITOR.selection.item) : null;
                const pointsBase = polyLabels
                  ? polyLabels.map(parseHexLabel).filter(p => p && Number.isFinite(p.col) && Number.isFinite(p.row))
                  : null;
                const openingsBase = (EDITOR.selection.type === 'room' && (hit.type === 'room-move' || hit.type === 'poly-move'))
                  ? openingsForRoomMove(EDITOR.selection.item, floor)
                  : null;
                EDITOR.drag = {
                  type: hit.type,
                  side: hit.side,
                  index: hit.index,
                  item: EDITOR.selection.item,
                  floorId: EDITOR.selection.floorId,
                  startWorld: world,
                  startHex: (EDITOR.selection.type === 'roof' && EDITOR.selection.item && EDITOR.selection.item.fullRotOn)
                    ? worldToHexHalf(unrotateRoofWorldPoint(EDITOR.selection.item, world))
                    : worldToHexHalf(world),
                  pointsBase,
                  openingsBase,
                  ownerType: EDITOR.selection.type,
                  didMove: false,
                  pushed: false
                };
                return;
              }
            }
          }
          const sel = findSelectionAt(world);
          if (sel && (sel.type === 'room' || sel.type === 'roof')) {
            selectItem(sel.type, sel.item, sel.floorId);
            const showHandles = UI.showHandles || UI.handleHot;
            if (showHandles) {
              if (sel.type === 'roof') {
                const spineHit = getRoofSpineHandleHit(sel.item, screenPoint);
                if (spineHit) {
                  EDITOR.drag = {
                    type: 'roof-spine',
                    endpoint: spineHit,
                    item: sel.item,
                    floorId: sel.floorId,
                    startWorld: world,
                    startAdjust: spineHit === 'a'
                      ? (Number(sel.item.spineAdjustA) || 0)
                      : (Number(sel.item.spineAdjustB) || 0),
                    rot90: !!sel.item.rot90,
                    didMove: false,
                    pushed: false
                  };
                  return;
                }
              }
              let hit = getPolyHandleHit(sel.item, screenPoint);
              if (sel.type === 'roof') {
                if (hit && hit.type === 'poly-edge') {
                  pushHistory();
                  toggleRoofLineHidden(sel.item, `edge:${hit.index}`);
                  updateInspector();
                  render();
                  return;
                }
                if (!hit || hit.type === 'poly-move') {
                  const roofLineHit = getRoofLineHit(sel.item, screenPoint);
                  if (roofLineHit) {
                    pushHistory();
                    toggleRoofLineHidden(sel.item, roofLineHit.key);
                    updateInspector();
                    render();
                    return;
                  }
                }
              }
              if (hit) {
                if (hit.type === 'poly-edge') {
                  if (sel.type === 'room') {
                    pushHistory();
                    const labels = getPolyPointLabels(sel.item);
                    const count = labels ? labels.length : 0;
                    togglePolyEdgeHidden(sel.item, hit.index, count);
                    updateInspector();
                    render();
                  }
                  return;
                }
                const polyLabels = hit.type === 'poly-move' ? getPolyPointLabels(sel.item) : null;
                const pointsBase = polyLabels
                  ? polyLabels.map(parseHexLabel).filter(p => p && Number.isFinite(p.col) && Number.isFinite(p.row))
                  : null;
                const openingsBase = (sel.type === 'room' && (hit.type === 'room-move' || hit.type === 'poly-move'))
                  ? openingsForRoomMove(sel.item, floor)
                  : null;
                EDITOR.drag = {
                  type: hit.type,
                  side: hit.side,
                  index: hit.index,
                  item: sel.item,
                  floorId: sel.floorId,
                  startWorld: world,
                  startHex: (sel.type === 'roof' && sel.item && sel.item.fullRotOn)
                    ? worldToHexHalf(unrotateRoofWorldPoint(sel.item, world))
                    : worldToHexHalf(world),
                  pointsBase,
                  openingsBase,
                  ownerType: sel.type,
                  didMove: false,
                  pushed: false
                };
                return;
              }
            }
            return;
          }
          if (!sel) return;
          selectItem(sel.type, sel.item, sel.floorId);
          EDITOR.drag = sel;
          EDITOR.drag.didMove = false;
          EDITOR.drag.pushed = false;
        });

        canvas.addEventListener('mousemove', (ev) => {
          if (!EDITOR.drag) return;
          const rect = canvas.getBoundingClientRect();
          const x = ev.clientX - rect.left;
          const y = ev.clientY - rect.top;
          const world = screenToWorld(x, y);
          EDITOR.drag.didMove = true;
          if (!EDITOR.drag.pushed) {
            pushHistory();
            EDITOR.drag.pushed = true;
          }
          onDragMove(world);
        });

        canvas.addEventListener('mousemove', (ev) => {
          if (EDITOR.drag) return;
          if (EDITOR.tool !== 'poly') return;
          const rect = canvas.getBoundingClientRect();
          const x = ev.clientX - rect.left;
          const y = ev.clientY - rect.top;
          const world = screenToWorld(x, y);
          const hex = worldToHexHalf(world);
          const snapWorld = hexToWorld(hex.col, hex.row);
          EDITOR.polyHover = { hex, world: snapWorld };
          render();
        });

        window.addEventListener('mouseup', () => {
          if (!EDITOR.drag) return;
          const dragged = EDITOR.drag;
          EDITOR.drag = null;
          if (dragged.didMove) {
            EDITOR.ignoreClick = true;
            updateInspector();
            if (dragged.type === 'poly-point' && dragged.item && dragged.ownerType === 'room') {
              const floor = pickFloor();
              if (floor) normalizeRoomOpeningsHexes(dragged.item, floor);
            }
            if (dragged.type === 'token') {
              syncEntityFromToken(dragged.item);
              queueEntitySave(dragged.item);
              renderStatus();
            }
          }
        });
      }

      async function saveState() {
        const battleId = resolveBattleId();
        if (!battleId || !STATE.battle) return;
        saveStatus.textContent = 'DB: saving...';
        try {
          let payloadState = prepareBattleForSave(STATE.battle);
          if (STATE.wrapper && STATE.recordId) {
            const wrapper = cloneValue(STATE.wrapper);
            if (!wrapper.records || typeof wrapper.records !== 'object') wrapper.records = {};
            wrapper.records[STATE.recordId] = payloadState;
            if (!wrapper.active || typeof wrapper.active !== 'object') wrapper.active = { recordId: STATE.recordId };
            if (!wrapper.active.recordId) wrapper.active.recordId = STATE.recordId;
            payloadState = wrapper;
          }
          const body = JSON.stringify({ state_json: payloadState });
          const res = await fetch(`/api/battles/${encodeURIComponent(battleId)}`, {
            method: 'PUT',
            headers: { 'content-type': 'application/json', 'accept': 'application/json', ...getAuthHeaders() },
            body
          });
          if (!res.ok) throw new Error('Save failed');
          saveStatus.textContent = 'DB: saved';
          EDITOR.dirty = false;
        } catch (e) {
          saveStatus.textContent = 'DB: error';
        }
      }

      let entitySaveTimer = null;
      function queueEntitySave(token) {
        if (!getCampaignId()) return;
        if (entitySaveTimer) clearTimeout(entitySaveTimer);
        entitySaveTimer = setTimeout(() => saveEntity(token), 400);
      }

      async function saveEntityPatch(entityId, patch, createIfMissing) {
        const cid = getCampaignId();
        if (!cid || !entityId) return;
        const payload = {
          entity_id: entityId,
          patch: patch || {},
          create_if_missing: !!createIfMissing
        };
        try {
          await fetch(`/api/campaigns/${encodeURIComponent(cid)}/entities`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', 'accept': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(payload)
          });
        } catch {}
      }

      async function saveEntity(token) {
        if (!token) return;
        const stats = {};
        if (token.hp != null) stats.hp = token.hp;
        if (token.init != null) stats.init = token.init;
        const patch = {
          name: token.name,
          kind: token.kind,
          side: token.side,
          poi_id: token.poi_id || resolvePoiId(),
          location: { hex: token.hex, floorId: token.floorId },
          ...(Object.keys(stats).length ? { stats } : {})
        };
        if (token.sprite) patch.sprite = token.sprite;
        else if (token.__entity && token.__entity.sprite) patch.sprite = null;
        if (token.spriteScale != null) {
          const existing = token.__entity && token.__entity.appearance && typeof token.__entity.appearance === 'object'
            ? token.__entity.appearance
            : {};
          patch.appearance = { ...existing, sprite_scale: token.spriteScale };
        }
        saveEntityPatch(token.id, patch, true);
      }

      function attachEvents() {
        Object.entries(toolButtons).forEach(([key, btn]) => {
          if (!btn) return;
          btn.addEventListener('click', () => setTool(key));
        });
        if (openingKindSelect) {
          openingKindSelect.addEventListener('change', () => {
            EDITOR.openingKind = openingKindSelect.value;
          });
          openingKindSelect.value = EDITOR.openingKind;
        }
        const setOpeningOrientation = (val) => {
          EDITOR.openingOrientation = val;
          if (openingOrientH) openingOrientH.classList.toggle('active', val === 'h');
          if (openingOrientV) openingOrientV.classList.toggle('active', val === 'v');
        };
        if (openingOrientH) openingOrientH.addEventListener('click', () => setOpeningOrientation('h'));
        if (openingOrientV) openingOrientV.addEventListener('click', () => setOpeningOrientation('v'));
        setOpeningOrientation(EDITOR.openingOrientation);
        if (objectKindSelect) {
          objectKindSelect.addEventListener('change', () => {
            EDITOR.objectKind = objectKindSelect.value;
          });
          objectKindSelect.value = EDITOR.objectKind;
        }
        if (tokenKindSelect) {
          tokenKindSelect.addEventListener('change', () => {
            EDITOR.tokenKind = tokenKindSelect.value;
          });
          tokenKindSelect.value = EDITOR.tokenKind;
        }
        if (hexGridToggle) {
          hexGridToggle.addEventListener('change', () => {
            UI.hexGrid = !!hexGridToggle.checked;
            savePrefs();
            render();
          });
        }
        if (labelBoldToggle) {
          labelBoldToggle.addEventListener('change', () => {
            UI.brightLabels = !!labelBoldToggle.checked;
            savePrefs();
            render();
          });
        }
        if (handlesToggle) {
          handlesToggle.addEventListener('change', () => {
            UI.showHandles = !!handlesToggle.checked;
            savePrefs();
            render();
          });
        }
        if (hideRoofsToggle) {
          hideRoofsToggle.addEventListener('change', () => {
            UI.hideRoofs = !!hideRoofsToggle.checked;
            if (UI.hideRoofs && EDITOR.selection && EDITOR.selection.type === 'roof') {
              clearSelection();
            }
            savePrefs();
            render();
          });
        }
        if (streetViewToggle) {
          streetViewToggle.addEventListener('change', () => {
            UI.streetView = !!streetViewToggle.checked;
            savePrefs();
            render();
          });
        }
        if (roofLineColorInput) {
          roofLineColorInput.addEventListener('input', () => {
            const val = String(roofLineColorInput.value || '').trim();
            if (/^#[0-9a-f]{6}$/i.test(val)) {
              UI.roofLineColor = val;
              savePrefs();
              render();
            }
          });
        }
        if (roofLineWidthInput) {
          roofLineWidthInput.addEventListener('input', () => {
            const n = Number(roofLineWidthInput.value);
            if (Number.isFinite(n) && n > 0) {
              UI.roofLineWidth = n;
              savePrefs();
              render();
            }
          });
        }
        if (fogToggle) {
          fogToggle.addEventListener('change', () => {
            UI.fogEnabled = !!fogToggle.checked;
            savePrefs();
            render();
          });
        }
        if (polyAlphaInput) {
          polyAlphaInput.addEventListener('input', () => {
            const val = Number(polyAlphaInput.value);
            if (Number.isFinite(val)) {
              UI.polyAlpha = Math.max(0, Math.min(1, val / 100));
              savePrefs();
              render();
            }
          });
        }
        if (backdropToggle) {
          backdropToggle.addEventListener('change', () => {
            UI.showBackdrop = !!backdropToggle.checked;
            savePrefs();
            render();
          });
        }
        if (videoSelect) {
          videoSelect.addEventListener('change', () => {
            const next = videoSelect.value;
            if (next === 'low' || next === 'medium' || next === 'high' || next === 'ultra') {
              UI.video = next;
              savePrefs();
              render();
            }
          });
        }
        floorSelect.addEventListener('change', () => {
          VIEW.floorId = floorSelect.value;
          render();
        });
        if (mapSelect) {
          mapSelect.addEventListener('change', () => {
            const next = mapSelect.value;
            if (!next) return;
            const url = new URL(window.location.href);
            url.searchParams.set('battle_id', next);
            window.location.href = url.toString();
          });
        }
        if (layerSelect) {
          layerSelect.addEventListener('change', () => {
            render();
          });
        }
      zoomInput.addEventListener('input', () => {
        setZoom(Number(zoomInput.value));
      });
      const applyBackdropControls = () => {
        if (mapOffsetXInput) BACKDROP.offsetHex.x = Number(mapOffsetXInput.value) || 0;
        if (mapOffsetYInput) BACKDROP.offsetHex.y = Number(mapOffsetYInput.value) || 0;
        if (mapScaleInput) {
          const val = Number(mapScaleInput.value);
          BACKDROP.scale = Number.isFinite(val) && val > 0 ? (val / 100) : 1;
        }
        if (mapRotInput) BACKDROP.rotDeg = Number(mapRotInput.value) || 0;
        render();
      };

      if (mapOffsetXInput) mapOffsetXInput.addEventListener('input', applyBackdropControls);
      if (mapOffsetYInput) mapOffsetYInput.addEventListener('input', applyBackdropControls);
      if (mapScaleInput) mapScaleInput.addEventListener('input', applyBackdropControls);
      if (mapRotInput) mapRotInput.addEventListener('input', applyBackdropControls);
        if (canvasWrap) {
          canvasWrap.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            const step = zoomInput ? Number(zoomInput.step) : 0.05;
            const delta = ev.deltaY > 0 ? -step : step;
            setZoom(VIEW.zoom + delta);
          }, { passive: false });
        }
        bindPanZoomHoldControls({
          panUp,
          panDown,
          panLeft,
          panRight,
          zoomOutButton,
          zoomInButton,
        });
        bindUndoControls(window);
        saveButton.addEventListener('click', () => saveState());
        if (chatSend) chatSend.addEventListener('click', () => sendChatMessage());
        if (chatInput) {
          chatInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
              ev.preventDefault();
              sendChatMessage();
            }
          });
        }
        canvas.addEventListener('click', handleCanvasClick);
        attachDragHandlers();
        window.addEventListener('keydown', (ev) => {
          if (!isEditorToggleHotkey(ev)) return;
          ev.preventDefault();
          setEditorMode(!editorMode);
        });
        window.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Delete' && ev.key !== 'Backspace') return;
          if (!editorMode) return;
          const el = document.activeElement;
          if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
          deleteSelection();
        });
        window.addEventListener('keydown', (ev) => {
          if (ev.key === 'Escape') {
          if (Array.isArray(EDITOR.polyPoints) && EDITOR.polyPoints.length) {
            EDITOR.polyPoints = [];
            EDITOR.polyHover = null;
            render();
          }
          }
        });
        window.addEventListener('keydown', (ev) => {
          if (ev.key === 'Control') {
            UI.handleHot = true;
            render();
          }
        });
        window.addEventListener('keyup', (ev) => {
          if (ev.key === 'Control') {
            UI.handleHot = false;
            render();
          }
        });
        window.addEventListener('resize', () => render());
        setTool(EDITOR.tool);
        updateUndoButton();
      }

      function populateKindLists() {
        if (!floorKindList || !wallKindList || !openingKindList || !objectKindList) return;
        const floorKinds = new Set(DEFAULT_FLOOR_KINDS);
        const wallKinds = new Set(DEFAULT_WALL_KINDS);
        const openingKinds = new Set(DEFAULT_OPENING_KINDS);
        const objectKinds = new Set(DEFAULT_OBJECT_KINDS);
        const tokenKinds = new Set(DEFAULT_TOKEN_KINDS);

        if (STATE.battle && Array.isArray(STATE.battle.floors)) {
          for (const floor of STATE.battle.floors) {
            if (Array.isArray(floor.rooms)) {
              for (const room of floor.rooms) {
                const fk = room && room.floor && room.floor.kind;
                const wk = room && room.wall && room.wall.kind;
                if (fk) floorKinds.add(String(fk));
                if (wk) wallKinds.add(String(wk));
              }
            }
            if (Array.isArray(floor.openings)) {
              for (const o of floor.openings) {
                if (o && o.kind) openingKinds.add(String(o.kind));
              }
            }
            if (Array.isArray(floor.objects)) {
              for (const o of floor.objects) {
                if (o && o.kind) objectKinds.add(String(o.kind));
              }
            }
          }
        }

        const fill = (el, values) => {
          el.innerHTML = Array.from(values).sort().map(v => `<option value="${String(v).replace(/\"/g, '&quot;')}"></option>`).join('');
        };
        fill(floorKindList, floorKinds);
        fill(wallKindList, wallKinds);
        fill(openingKindList, openingKinds);
        fill(objectKindList, objectKinds);
        if (tokenKindList) fill(tokenKindList, tokenKinds);
      }

      async function init() {
        await loadBattle();
        await loadCampaign();
        loadPrefs();
        initSectionCollapse();
        setFloorOptions();
        populateKindLists();
        await loadMapOptions();
        VIEW.zoom = Number(zoomInput.value);
        if (zoomLevel) zoomLevel.textContent = `${Math.round(VIEW.zoom * 100)}%`;
        autoCenterCamera();
        pushHistory();
        renderStatus();
        attachEvents();
        setEditorMode(false);
        startChatPolling();
      }

      init().catch(err => {
        saveStatus.textContent = 'DB: error';
        console.error(err);
      });
    })();


























