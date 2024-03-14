class SaitoMentions {
  constructor(ref, menuRef, resolveFn, replaceFn, menuItemFn, inputType) {
    this.ref = ref
    this.menuRef = menuRef
    this.resolveFn = resolveFn
    this.replaceFn = replaceFn
    this.menuItemFn = menuItemFn
    this.options = []
    this.inputType = inputType;
    
    this.makeOptions = this.makeOptions.bind(this)
    this.closeMenu = this.closeMenu.bind(this)
    this.selectItem = this.selectItem.bind(this)
    this.onInput = this.onInput.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.renderMenu = this.renderMenu.bind(this)
    
    this.ref.addEventListener('input', this.onInput)
    this.ref.addEventListener('keydown', this.onKeyDown)

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
      'MozTabSize',
    ];

    this.isFirefox = typeof window !== 'undefined' && window['mozInnerScreenX'] != null;
  }
  
  async makeOptions(query) {
    const options = await this.resolveFn(query)
    if (options.lenght !== 0) {
      this.options = options
      this.renderMenu()
    } else {
      this.closeMenu()
    }
  }
  
  closeMenu() {
    setTimeout(() => {
      this.options = []
      this.left = undefined
      this.top = undefined
      this.triggerIdx = undefined
      this.renderMenu()
    }, 0)
  }

  selectItem(active) {

    let text = '';
    if (this.inputType == 'div') {
      text = this.ref.innerText;
    } else {
      text = this.ref.value;
    }

    return () => {
      const preMention = text.substr(0, this.triggerIdx)
      const option = this.options[active]
      let trigger = '';

      if (this.inputType == 'div') {
        trigger = this.ref.innerText[this.triggerIdx]; 
      } else {
        trigger = this.ref.value[this.triggerIdx];
      }
      const mention = this.replaceFn(option, trigger)

      let selectionStart = null;
      if (this.inputType == 'div') {


        if (typeof window.getSelection != "undefined") {
          var sel = document.getSelection();
          sel.modify("extend", "backward", "paragraphboundary");
          var pos = sel.toString().length;
          if(sel.anchorNode != undefined) sel.collapseToEnd();
          selectionStart =  pos + (mention.length - 1);
        }

      } else {
        selectionStart = this.ref.selectionStart;
      }
      console.log('selection:', selectionStart);

      const postMention = text.substr(selectionStart)
      const newValue = `${preMention}${mention}${postMention}`

      console.log('${preMention}: ', preMention);
      console.log('${mention}: ', mention);
      console.log('${postMention}: ', postMention);
      console.log('newValue:', newValue);

      console.log('inputType:', this.inputType);
      let caretPosition = 0;
      if (this.inputType == 'div') {
        this.ref.innerText = newValue;
        caretPosition = selectionStart;
      } else {
        this.ref.value = newValue;;
        caretPosition = this.ref.value.length - postMention.length;
      }
      console.log('caretPosition:', caretPosition);


      if (this.inputType != 'div') {
        this.ref.setSelectionRange(caretPosition, caretPosition)      
      } else {

        var range = document.createRange();
        let char = caretPosition, sel; 
        if (document.selection) {
          sel = document.selection.createRange();
          sel.moveStart('character', char);
          sel.select();
        }
        else {
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
  }
  
  onInput(ev) {
    const positionIndex = this.ref.selectionStart

    let text = '';
    if (this.inputType == 'div') {
      text = this.ref.innerText;
    } else {
      text = this.ref.value;
    }

    console.log('text: ', text);

    const textBeforeCaret = text.slice(0, positionIndex);
    const tokens = (typeof textBeforeCaret !== 'undefined') ? 
    textBeforeCaret.split(/\s/) : [];
    const lastToken = tokens[tokens.length - 1]
    const triggerIdx = textBeforeCaret.endsWith(lastToken)
      ? textBeforeCaret.length - lastToken.length
      : -1
    const maybeTrigger = textBeforeCaret[triggerIdx]
    const keystrokeTriggered = maybeTrigger === '@'

    if (!keystrokeTriggered) {
      this.closeMenu()
      return
    }
    
    const query = textBeforeCaret.slice(triggerIdx + 1)
    this.makeOptions(query)
    
    const coords = this.getCaretCoordinates(this.ref, positionIndex)
    const boundPos = this.ref.getBoundingClientRect()
    const offsetTop = 20;
    const offsetLeft = 0;

    setTimeout(() => {
      this.active = 0
      this.triggerIdx = triggerIdx


      if (this.inputType != 'div') {      
        this.left = window.scrollX  + coords.left  + this.ref.scrollLeft
        this.top = window.scrollY +  coords.top +  coords.height - this.ref.scrollTop
      } else {
        let listWidth = 481;
        let listHeight = 288;
        let listPosX = 0;
        let listPosY = 0;

        if (listWidth+(boundPos.left) > window.innerWidth) {
          let widthDiff = listWidth+(boundPos.left) - window.innerWidth; 
          listPosX = 0 - widthDiff;
        } else {
          listPosX =  0;
        }

        if (listHeight+(boundPos.top) > window.innerHeight) {
          let heightDiff = listHeight+(boundPos.top) - window.innerHeight; 
          listPosY =  - coords.height - (listHeight) ;
        } else {
          listPosY = coords.top  + coords.height - this.ref.scrollTop + offsetTop;
        }

        this.left = listPosX;
        this.top = listPosY;
      }

      this.renderMenu()
    }, 0)
  }
  
  onKeyDown(ev) {
    let keyCaught = false
    if (this.triggerIdx !== undefined) {
      switch (ev.key) {
        case 'ArrowDown':
          this.active = Math.min(this.active + 1, this.options.length - 1)
          this.renderMenu()
          keyCaught = true
          break
        case 'ArrowUp':
          this.active = Math.max(this.active - 1, 0)
          this.renderMenu()
          keyCaught = true
          break
        case 'Enter':
        case 'Tab':
          this.selectItem(this.active)()
          keyCaught = true
          break
      }
    }
    
    if (keyCaught) {
      ev.preventDefault()
    }
  }
  
  renderMenu() {  
    if (this.top === undefined) {
      this.menuRef.hidden = true
      this.menuRef.setAttribute('status', 'hidden');
      this.menuRef.classList.add('hidden');
      return
    } else {
      this.menuRef.setAttribute('status', 'show');
      this.menuRef.classList.remove('hidden');
    }
    
    this.menuRef.style.left = this.left + 'px'
    this.menuRef.style.top = this.top + 'px'
    this.menuRef.innerHTML = ''
    
    this.options.forEach((option, idx) => {
      this.menuRef.appendChild(this.menuItemFn(
        option,
        this.selectItem(idx),
        this.active === idx))
    })
    
    this.menuRef.hidden = false
  }

  getCaretCoordinates(element, position) {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const style = div.style
    const computed = getComputedStyle(element)

    style.whiteSpace = 'pre-wrap'
    style.wordWrap = 'break-word'
    style.position = 'absolute'
    style.visibility = 'hidden'

    this.properties.forEach(prop => {
      style[prop] = computed[prop]
    })

    if (this.isFirefox) {
      if (element.scrollHeight > parseInt(computed.height))
        style.overflowY = 'scroll'
    } else {
      style.overflow = 'hidden'
    }

    let text = '';
    if (this.inputType == 'div') {
      text = element.innerText;
    } else {
      text = element.value;
    }

    div.textContent = text.substring(0, position)

    const span = document.createElement('span')
    span.textContent = text.substring(position) || '.'
    div.appendChild(span)

    const coordinates = {
      top: span.offsetTop + parseInt(computed['borderTopWidth']),
      left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
      // height: parseInt(computed['lineHeight'])
      height: span.offsetHeight
    }

    div.remove()
    return coordinates
  }

}

module.exports = SaitoMentions;