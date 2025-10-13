/**
 * Declaration of the three-way-switch Web component.
 */
const tpl = document.createElement('template');
const pathsToImages = typeof locals !== undefined ? locals.pathsToImages : '/img';
tpl.innerHTML = `
    <style>
        :host { display: inline-flex; align-items: center; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        .wrap { display: inline-flex; align-items: center; gap: 0.6rem; user-select: none; -webkit-user-select: none; }

        .pill { --pill-h: 36px; --pill-w: 82px; --pad:6px; position:relative; width: var(--pill-w); height: var(--pill-h); box-sizing: border-box; display: inline-flex; align-items: center; padding: var(--pad); background: rgba(0,0,0,0.06); border-radius: 999px; gap: 6px; cursor: pointer; }

        /* selection fill that animates */
        .fill { --pill-color: #aa8811; position:absolute; top:4px; bottom: 3px; left:4px; width: calc(50% - 8px); border-radius: 999px; transition: transform 260ms cubic-bezier(.2,.9,.2,1), width 260ms cubic-bezier(.2,.9,.2,1), left 260ms cubic-bezier(.2,.9,.2,1); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }

        /* When both selected we stretch the fill */
        :host([color]) .fill { background: var(--accent-color); }
        :host(:not([color])) .fill { background: var(--accent-color); }

        .slot { position:relative; z-index:2; width:50%; display:inline-flex; justify-content:center; align-items:center; }
        .dot { width:28px; height:28px; border-radius:50%; display:inline-grid; place-items:center; font-weight:600; font-size:13px; background:transparent; z-index:2; }
        .label-text { margin-left:0; font-size:14px; color: rgb(108, 108, 108); cursor: pointer; user-select:none; -webkit-user-select:none; }

        /* Visuals when inactive to keep contrast */
        .dot span { pointer-events:none; }

        /* Balanced vertical alignment */
        .pill, .dot { display:flex; align-items:center; justify-content:center; }

        /* Accessible focus outlines */
        .pill:focus-visible { outline: 2px solid rgba(59,130,246,0.25); outline-offset:4px; }

        /* state classes applied on host for styling convenience */
        :host([mode="1"]) .fill { left:4px; width:calc(50% - 8px); transform: translateX(0); }
        :host([mode="2"]) .fill { left:calc(50% + 4px); width:calc(50% - 8px); transform: translateX(0); }
        :host([mode="3"]) .fill { left:4px; width:calc(100% - 8px); transform: translateX(0); }

        /* label color when active/inactive */
        :host([mode="1"]) .dot.left { color: white; }
        :host([mode="2"]) .dot.right { color: white; }
        :host([mode="3"]) .dot.left, :host([mode="3"]) .dot.right { color: white; }

        /* Keep the dots readable over the fill by using mix-blend or forced color */
        .dot { color: #111827; }
        :host([mode="1"]) .dot.left, :host([mode="2"]) .dot.right, :host([mode="3"]) .dot { color: white; }

        /* subtle borders to keep shape on light background */
        .pill { border:1px solid rgba(15,23,42,0.04); }
        .icon { display: inline-block; background-color: var(--title-color); transition: background-color 0.35s; position: relative; }
        .icon.left {
        -webkit-mask: url('${pathsToImages}/svg/devanagari-letter-a.svg') no-repeat center / contain;
        mask: url('${pathsToImages}/svg/devanagari-letter-a.svg') no-repeat center / contain;
        top: 3px; left: -2px; width: 15px; height: 15px;
        }
        .icon.right {
        -webkit-mask: url('${pathsToImages}/svg/letter-aa.svg') no-repeat center / contain;
        mask: url('${pathsToImages}/svg/letter-aa.svg') no-repeat center / contain;
        top: 2px; left: 1px; width: 24px; height: 24px;
        }
        :host([mode="1"]) .icon.left { background-color: var(--song-bg-color); }
        :host([mode="2"]) .icon.right { background-color: var(--song-bg-color); }
        :host([mode="3"]) .icon.left, :host([mode="3"]) .icon.right { background-color: var(--song-bg-color); }
    </style>

    <span class="wrap">
        <span class="pill" tabindex="0" role="group" aria-label="three-mode-pill">
        <span class="fill"></span>

        <span class="slot left">
            <span class="dot left">
            <span class="left-label">
                <span class='icon left'></span>
            </span>
            </span>
        </span>

        <span class="slot right">
            <span class="dot right">
            <span class="right-label">
                <span class='icon right'></span>
            </span>
            </span>
        </span>
        </span>

        <span class="label-text"></span>
    </span>
    `;

/**
 *
 */
class ThreeModeSwitch extends HTMLElement {
    static EVENT_NAME = 'switch_change';

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.appendChild(tpl.content.cloneNode(true));

        // Load from localStorage.
        // this.mode = getSongDisplayMode() || 3;
        this.mode = 3;
        this.$labelText = this._shadow.querySelector('.label-text');
    }

    /**/
    connectedCallback() {
        const leftSlot = this._shadow.querySelector('.slot.left');
        const rightSlot = this._shadow.querySelector('.slot.right');
        leftSlot.addEventListener('click', this._onLeftClick);
        rightSlot.addEventListener('click', this._onRightClick);

        this.$labelText.textContent = this.getAttribute('label') || '...';
        this.$labelText.addEventListener('click', this._onLabelClick);

        this.style.webkitUserSelect = 'none';
        this._render();
    }

    /**/
    _render() {
        this.setAttribute('mode', String(this.mode));
    }

    /**/
    _emitChange() {
        this.dispatchEvent(
            new CustomEvent(ThreeModeSwitch.EVENT_NAME, {
                detail: { value: this.mode },
                bubbles: true,
                composed: true
            })
        );
    }

    /**/
    _onLabelClick = (e) => {
        switch(this.mode) {
            case 1:
                this.mode = 2
                break;
            case 2:
                this.mode = 3
                break;
            case 3:
                this.mode = 1;
                break;
            default:
                this.mode = 3;
        }

        this._render();
        this._emitChange();
    };

    /**/
    _onLeftClick = (e) => {
        switch(this.mode) {
            case 1:
                this.mode = 3
                break;
            case 2:
                this.mode = 3
                break;
            case 3:
                this.mode = 1;
                break;
            default:
                this.mode = 3;
        }

        this._render();
        this._emitChange();
    };

    /**/
    _onRightClick = (e) => {
        switch(this.mode) {
            case 1:
                this.mode = 3
                break;
            case 2:
                this.mode = 3
                break;
            case 3:
                this.mode = 2;
                break;
            default:
                this.mode = 3;
        }

        this._render();
        this._emitChange();
    };
}

/**/
customElements.define('three-mode-switch', ThreeModeSwitch);
