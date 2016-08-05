// @flow
import classNames from 'classnames';
import MaskedInput from 'react-input-mask';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import filterProps from '../filterProps';
import Upgrades from '../../lib/Upgrades';

import '../ensureOldIEClassName';
import styles from './Input.less';

var polyfillPlaceholder = false;
if (typeof window !== 'undefined' && window.document
    && window.document.createElement) {
  polyfillPlaceholder = !('placeholder' in document.createElement('input'));
}

const INPUT_PASS_PROPS = {
  autoFocus: true,
  disabled: true,
  id: true,
  maxLength: true,
  placeholder: true,
  title: true,

  onBlur: true,
  onCopy: true,
  onCut: true,
  onFocus: true,
  onInput: true,
  onKeyDown: true,
  onKeyPress: true,
  onKeyUp: true,
  onPaste: true,
};

const SIZE_CLASS_NAMES = {
  small: styles.deprecated_sizeSmall,
  default: styles.deprecated_sizeDefault,
  large: styles.deprecated_sizeLarge,
};

const PASS_TYPES = {
  password: true,
  text: true,
};

type InputEvent = SyntheticKeyboardEvent & {target: HTMLInputElement}

type Props = {
  align?: 'left' | 'center' | 'right',
  alwaysShowMask?: boolean,
  borderless?: boolean,
  defaultValue?: string | number,
  disabled?: boolean,
  error?: boolean,
  id?: string,
  leftIcon?: any,
  mask?: string,
  maskChar?: string,
  maxLength?: string | number,
  placeholder?: string,
  rightIcon?: any,
  size: 'small' | 'default' | 'large',
  title?: string,
  type?: 'password' | 'text',
  value: string,
  warning?: boolean,
  width?: number | string,
  onBlur?: (e: InputEvent) => any,
  onChange?: (e: InputEvent) => any,
  onCopy?: (e: InputEvent) => any,
  onCut?: (e: InputEvent) => any,
  onFocus?: (e: InputEvent) => any,
  onInput?: (e: InputEvent) => any,
  onKeyDown?: (e: InputEvent) => any,
  onKeyPress?: (e: InputEvent) => any,
  onKeyUp?: (e: InputEvent) => any,
  onPaste?: (e: InputEvent) => any,
}

class Input extends React.Component {
  static __ADAPTER__: any

  static propTypes = {
    align: PropTypes.oneOf(['left', 'center', 'right']),

    /**
     * Показывать маску, даже если ничего не введено.
     */
    alwaysShowMask: PropTypes.bool,

    /**
     * Не отрисовывать рамку.
     */
    borderless: PropTypes.bool,

    defaultValue: PropTypes.string,

    disabled: PropTypes.bool,

    /**
     * Визуально показать наличие ошибки.
     */
    error: PropTypes.bool,

    /**
     * ID для использования с элементом label.
     */
    id: PropTypes.string,

    /**
     * Иконка слева инпута.
     */
    leftIcon: PropTypes.element,

    /**
     * Маска ввода. Заменяет placeholder и defaultValue, влияет на значение
     * инпута. Позволяет вводить только ограниченное количество символов.
     *
     * Шаблоны:
     *  9: 0-9
     *  a: A-Z, a-z
     *  *: A-Z, a-z, 0-9
     *
     * Можно делать неудаляемую маску, например: `+4\9 99 999 99`. `\` &mdash;
     * экранирует символ шаблона.
     */
    mask: PropTypes.string,

    /**
     * Символ маски. Если не указан, используется '_'.
     */
    maskChar: PropTypes.string,

    maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    placeholder: PropTypes.string,

    /**
     * Иконка справа инпута.
     */
    rightIcon: PropTypes.element,

    /**
     * DEPRECATED
     */
    size: PropTypes.oneOf(['small', 'default', 'large']),

    title: PropTypes.string,

    type: PropTypes.oneOf(['password', 'text']),

    value: PropTypes.string.isRequired,

    /**
     * Визуально показать наличие предупреждения.
     */
    warning: PropTypes.bool,

    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    onBlur: PropTypes.func,

    /**
     * Вызывается при вводе каждого символа.
     */
    onChange: PropTypes.func,

    onCopy: PropTypes.func,

    onCut: PropTypes.func,

    onFocus: PropTypes.func,

    onInput: PropTypes.func,

    onKeyDown: PropTypes.func,

    onKeyPress: PropTypes.func,

    onKeyUp: PropTypes.func,

    onPaste: PropTypes.func,
  };

  static defaultProps = {
    size: 'default',
  };

  props: Props;

  state: {
    value: ?string | ?number,
    polyfillPlaceholder?: boolean
  }

  constructor(props: Props, context: any) {
    super(props, context);

    this.state = {
      value: props.value !== undefined ? props.value :
             props.mask ? null : props.defaultValue,
    };
  }

  render() {
    var labelProps = {
      className: classNames({
        [styles.root]: true,
        [this.props.className || '']: true,
        [styles.disabled]: this.props.disabled,
        [styles.error]: this.props.error,
        [styles.warning]: this.props.warning,
        [styles.padLeft]: this.props.leftIcon,
        [styles.padRight]: this.props.rightIcon,
      }),
      style: {},
    };
    if (this.props.width) {
      labelProps.style.width = this.props.width;
    }

    if (!Upgrades.isHeight34Enabled()) {
      const sizeClassName = SIZE_CLASS_NAMES[this.props.size];
      if (sizeClassName) {
        labelProps.className += ' ' + sizeClassName;
      }
    }

    var placeholder = null;
    if (this.state.polyfillPlaceholder && this.props.placeholder
        && !this.props.mask && !this.state.value) {
      placeholder = (
        <div className={styles.placeholder}>{this.props.placeholder}</div>
      );
    }

    var leftIcon = null;
    if (this.props.leftIcon) {
      leftIcon = <div className={styles.leftIcon}>{this.props.leftIcon}</div>;
    }
    var rightIcon = null;
    if (this.props.rightIcon) {
      rightIcon = (
        <div className={styles.rightIcon}>{this.props.rightIcon}</div>
      );
    }

    const inputProps = {
      ...filterProps(this.props, INPUT_PASS_PROPS),
      className: classNames({
        [styles.input]: true,
        [styles.borderless]: this.props.borderless,
      }),
      value: this.state.value,
      onChange: (e) => this.handleChange(e),
      style: {},
    };

    const type = this.props.type;
    if (type && PASS_TYPES[type]) {
      inputProps.type = type;
    }

    if (this.props.align) {
      inputProps.style.textAlign = this.props.align;
    }

    let input = null;
    if (this.props.mask) {
      input = (
        <MaskedInput {...inputProps} mask={this.props.mask}
          maskChar={
            this.props.maskChar === undefined ? '_' : this.props.maskChar
          }
          alwaysShowMask={this.props.alwaysShowMask}
        />
      );
    } else {
      input = <input {...inputProps} />;
    }

    return (
      <label {...labelProps}>
        {input}
        {placeholder}
        {leftIcon}
        {rightIcon}
      </label>
    );
  }

  componentDidMount() {
    if (polyfillPlaceholder) {
      this.setState({polyfillPlaceholder: true});
    }
  }

  componentWillReceiveProps(props: Props) {
    if (props.value !== undefined) {
      this.setState({value: props.value});
    }
  }

  /**
   * @api
   */
  focus() {
    ReactDOM.findDOMNode(this).querySelector('input').focus();
  }

  /**
   * @api
   */
  setSelectionRange(start: number, end: number) {
    const input = ReactDOM.findDOMNode(this).querySelector('input');
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(start, end);
    } else if (input.createTextRange) {
      const range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  }

  handleChange(event: InputEvent) {
    if (this.props.value === undefined) {
      this.setState({value: event.target.value});
    }

    if (this.props.onChange) {
      this.props.onChange(event, event.target.value);
    }
  }
}

export default Input;
