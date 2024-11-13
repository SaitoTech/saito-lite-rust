class SaitoMentions {
  constructor(app, ref, menuRef, inputType) {
    this.app = app;
    this.ref = ref;
    this.menuRef = menuRef;
    this.options = [];
    this.inputType = inputType;

    this.closeMenu = this.closeMenu.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.renderMenu = this.renderMenu.bind(this);

    this.ref.addEventListener('input', this.onInput);
    this.ref.addEventListener('keydown', this.onKeyDown);

    this.properties = [
      'direction',
      'boxSizing',
      'width',
      'height',
      'overflowX',
      'overflowY',

      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'borderStyle',

      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',

      'fontStyle',
      'fontVariant',
      'fontWeight',
      'fontStretch',
      'fontSize',
      'fontSizeAdjust',
      'lineHeight',
      'fontFamily',

      'textAlign',
      'textTransform',
      'textIndent',
      'textDecoration',

      'letterSpacing',
      'wordSpacing',

      'tabSize',
      'MozTabSize'
    ];

    this.isFirefox =
      typeof window !== 'undefined' && window['mozInnerScreenX'] != null;
  }

  closeMenu() {
    setTimeout(() => {
      this.options = [];
      this.triggerIdx = undefined;
      this.renderMenu();
    }, 0);
  }

  selectItem(active) {
    
      let text = '';
      if (this.inputType == 'div') {
        text = this.ref.innerText;
      } else {
        text = this.ref.value;
      }

      const preMention = text.substr(0, this.triggerIdx);
      const option = this.options[active];
      let trigger = '';

      if (!option){
        console.log("Null Items, nope out");
        this.closeMenu();
        this.ref.focus();
        return;
      }

      if (this.inputType == 'div') {
        trigger = this.ref.innerText[this.triggerIdx];
      } else {
        trigger = this.ref.value[this.triggerIdx];
      }

      const mention = (option?.identifier) ? `${trigger}${option.identifier} ` : `${trigger}${option.publicKey} `

      let selectionStart = null;
      if (this.inputType == 'div') {
        if (typeof window.getSelection != 'undefined') {
          var sel = window.getSelection();
          console.log(sel);
          sel.modify('extend', 'backward', 'word');
          var pos = sel.toString().length;
          if (sel.anchorNode != undefined) sel.collapseToEnd();
          selectionStart = pos + (mention.length - 1);
        }
      } else {
        selectionStart = this.ref.selectionStart;
      }
      //console.log('selection:', selectionStart);

      const postMention = text.substr(selectionStart);
      const newValue = `${preMention}${mention}${postMention}`;

      // console.log('${preMention}: ', preMention);
      // console.log('${mention}: ', mention);
      // console.log('${postMention}: ', postMention);
      // console.log('newValue:', newValue);

      // console.log('inputType:', this.inputType);
      let caretPosition = 0;
      if (this.inputType == 'div') {
        this.ref.innerText = newValue;
        caretPosition = selectionStart;
      } else {
        this.ref.value = newValue;
        caretPosition = this.ref.value.length - postMention.length;
      }
      console.log('caretPosition:', caretPosition);

      if (this.inputType != 'div') {
        this.ref.setSelectionRange(caretPosition, caretPosition);
      } else {
        var range = document.createRange();
        let char = caretPosition,
          sel;
        if (document.selection) {
          sel = document.selection.createRange();
          sel.moveStart('character', char);
          sel.select();
        } else {
          sel = window.getSelection();

          console.log('char:', char);
          console.log('this.ref.lastChild.length', this.ref.lastChild.length);
          console.log(this.ref.lastChild.length);

          if (char > this.ref.lastChild.length) {
            sel.collapse(this.ref.lastChild, this.ref.lastChild.length);
          } else {
            sel.collapse(this.ref.lastChild, char);
          }
        }
      }

      this.closeMenu();
      this.ref.focus();
  }

  async onInput(ev) {

    /*  
      This will apparently be undefined for <div>s, but the slice just
      returns the entire text.
    */

    const positionIndex = this.ref.selectionStart;

    let text = '';
    if (this.inputType == 'div') {
      // Should drop the <br> from Firefox
      text = this.ref.innerText.trim();
    } else {
      text = this.ref.value;
    }

    const textBeforeCaret = text.slice(0, positionIndex);
    const tokens = textBeforeCaret ? textBeforeCaret.split(/\s+/) : [];

    let lastToken = tokens.pop();
    const triggerIdx = textBeforeCaret.endsWith(lastToken)
      ? textBeforeCaret.length - lastToken.length
      : -1;

    const maybeTrigger = textBeforeCaret[triggerIdx];
    const keystrokeTriggered = maybeTrigger === '@';

    if (!keystrokeTriggered) {
      this.closeMenu();
      return;
    }

    const query = textBeforeCaret.slice(triggerIdx + 1);

    this.options = await this.resolveFn(query);

    if (this.options?.length) {
      const coords = this.getCaretCoordinates(this.ref, positionIndex);
      const boundPos = this.ref.getBoundingClientRect();
      this.top = 0;
      this.left = 0;
      setTimeout(() => {
        this.active = 0;
        this.triggerIdx = triggerIdx;
        this.renderMenu(boundPos, coords);
      }, 1);
    } else {
      this.closeMenu();
    }
  }

  onKeyDown(ev) {
    let keyCaught = false;
    if (this.triggerIdx !== undefined) {
      switch (ev.key) {
        case 'ArrowDown':
          this.active = Math.min(this.active + 1, this.options.length - 1);
          this.renderMenu();
          keyCaught = true;
          break;
        case 'ArrowUp':
          this.active = Math.max(this.active - 1, 0);
          this.renderMenu();
          keyCaught = true;
          break;
        case 'Enter':
        case 'Tab':
          this.selectItem(this.active);
          keyCaught = true;
          break;
        case 'Escape':
          this.closeMenu();
          break;
      }
    }

    if (keyCaught) {
      ev.preventDefault();
    }
  }

  resolveFn(prefix){
      let users = this.app.keychain.returnKeys(null, false);
      if (!prefix){
        return users;
      }else{
        return users.filter(user => {
          if (user?.identifier) {
            return user.identifier.toLowerCase().startsWith(prefix.toLowerCase())
          } else {
            return user.publicKey.toLowerCase().startsWith(prefix.toLowerCase())
          }
        });
      }
  }

  renderMenu(boundPos = null, coords = null) {
    if (!this.options.length) {
      this.menuRef.hidden = true;
      this.menuRef.setAttribute('status', 'hidden');
      this.menuRef.classList.add('hidden');
      return;
    } else {
      this.menuRef.setAttribute('status', 'show');
      this.menuRef.classList.remove('hidden');
      this.menuRef.hidden = false;
    }

    this.menuRef.style.left = this.left + 'px';
    this.menuRef.style.top = this.top + 'px';
    this.menuRef.innerHTML = '';

    this.options.forEach((option, idx) => {
      this.menuRef.appendChild(
        this.addMenuItem(option, idx)
      );
    });

    if (boundPos != null || coords != null) {
      const offsetTop = 10;

      if (this.inputType != 'div') {
        this.left = window.scrollX + coords.left + this.ref.scrollLeft;
        this.top =
          window.scrollY + coords.top + coords.height - this.ref.scrollTop;
      } else {
        let menuStyles = getComputedStyle(this.menuRef);
        let listWidth = Number(menuStyles.width.split('px')[0]);
        let listHeight = Number(menuStyles.height.split('px')[0]);

        let inputStyles = getComputedStyle(this.ref);
        let inputWidth = Number(inputStyles.width.split('px')[0]);
        let inputHeight = Number(inputStyles.height.split('px')[0]);

        let listPosX = 0;
        let listPosY = 0;

        if (listWidth + boundPos.left > window.innerWidth) {
          let widthDiff = listWidth + boundPos.left - window.innerWidth;
          listPosX = 0 - widthDiff;
        } else {
          listPosX = 0;
        }

        listPosY = -listHeight - offsetTop;

        this.left = listPosX;
        this.top = listPosY;
      }

      this.menuRef.style.left = this.left + 'px';
      this.menuRef.style.top = this.top + 'px';

    }else{
      // Need to check if we are using keys to scroll down
      let selec = this.menuRef.querySelector(".menu-item.selected");
      if (selec){
        if (selec.getBoundingClientRect().bottom > this.menuRef.getBoundingClientRect().bottom){
          selec.scrollIntoView(false);
        }
        if (selec.getBoundingClientRect().top < this.menuRef.getBoundingClientRect().top){
          selec.scrollIntoView();
        }
      }
    }
  }

  addMenuItem(user, idx){
      const parentDiv = document.createElement('div');
      parentDiv.classList.add('saito-mentions-contact');

      // identifier 
      if (!user?.identicon){
        user.identicon = this.app.keychain.returnIdenticon(user.publicKey);
      }
      const identicon = document.createElement('img');
      identicon.classList.add('saito-identicon');
      identicon.setAttribute('src', user.identicon);

      parentDiv.appendChild(identicon);

      // username div
      const div = document.createElement('div')
      div.setAttribute('role', 'option')
      div.className = 'menu-item'
      if (idx === this.active) {
        div.classList.add('selected')
        div.setAttribute('aria-selected', '')
      }

      if (user?.identifier) {
        div.textContent = user.identifier
      } else {
        div.textContent = user.publicKey
      }

      parentDiv.appendChild(div);
      parentDiv.onclick = () => {
          this.selectItem(idx);
        };
      return parentDiv;
  }

  getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    document.body.appendChild(div);

    const style = div.style;
    const computed = getComputedStyle(element);

    style.whiteSpace = 'pre-wrap';
    style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';

    this.properties.forEach((prop) => {
      style[prop] = computed[prop];
    });

    if (this.isFirefox) {
      if (element.scrollHeight > parseInt(computed.height))
        style.overflowY = 'scroll';
    } else {
      style.overflow = 'hidden';
    }

    let text = '';
    if (this.inputType == 'div') {
      text = element.innerText;
    } else {
      text = element.value;
    }

    div.textContent = text.substring(0, position);

    const span = document.createElement('span');
    span.textContent = text.substring(position) || '.';
    div.appendChild(span);

    const coordinates = {
      top: span.offsetTop + parseInt(computed['borderTopWidth']),
      left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
      // height: parseInt(computed['lineHeight'])
      height: span.offsetHeight
    };

    div.remove();
    return coordinates;
  }
}

module.exports = SaitoMentions;
