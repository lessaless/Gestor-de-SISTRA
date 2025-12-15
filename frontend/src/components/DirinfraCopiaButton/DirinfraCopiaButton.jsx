// DirinfraCopiaButton.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

/**
 * DirinfraCopiaButton (full-field renderer)
 * - kept for backwards compatibility (renders provided InputComponent + copy button).
 *
 * DirinfraCopyButton (button-only)
 * - minimal copy-only button you can pass to DirinfraInput via the `addon` prop.
 */

// shared helpers ------------------------------------------------------------
const copyTextToClipboard = async (text, labelForToast = '') => {
  try {
    if (!text) {
      toast.info(`${labelForToast || 'Valor'} vazio — nada para copiar.`);
      return;
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast.info(`${labelForToast || 'Valor'} copiado para a área de transferência`);
    
  } catch (err) {
    console.error('Erro ao copiar:', err);
    toast.error('Não foi possível copiar para a área de transferência');
  }
};

const readFieldValueFromContextOrDOM = (fieldName, ctxGetValues, inputProps = {}) => {
  let value = '';

  // 1) try RHF getValues from context
  if (typeof ctxGetValues === 'function') {
    try {
      value = ctxGetValues(fieldName) ?? '';
    } catch (e) {
      value = '';
    }
  }

  // 2) fallback: try Input-provided getValues function (rare)
  if (!value && inputProps && typeof inputProps.getValues === 'function') {
    try {
      value = inputProps.getValues(fieldName) ?? '';
    } catch (e) {
      value = '';
    }
  }

  // 3) final fallback: query DOM for element with name attr
  if (!value) {
    const el = document.querySelector(`[name="${fieldName}"]`);
    if (el) {
      value = el.value ?? el.innerText ?? '';
    }
  }

  return value;
};

// Button-only component you can reuse everywhere -----------------------------
export const DirinfraCopyButton = ({ name, label, inputProps = {}, size = 34, style = {}, titleSuffix }) => {
  const formContext = useFormContext?.() || {};
  const { getValues: ctxGetValues } = formContext;

  const btnStyle = {
    height: size,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-borderdefault)',
    background: 'var(--color-bg2)',
    color: 'var(--color-font4light)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    ...style
  };

  const handleCopy = async () => {
    const val = readFieldValueFromContextOrDOM(name, ctxGetValues, inputProps);
    await copyTextToClipboard(val, label || name);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={btnStyle}
      title={`Copiar ${titleSuffix || label || name}`}
      aria-label={`Copiar ${label || name}`}
    >
      Copiar
    </button>
  );
};

// Full-field component (keeps your original behaviour) ----------------------
const DirinfraCopiaButton = ({
  name,
  label,
  placeholder,
  registro,
  erros,
  disabled = false,
  InputComponent = null, // pass DirinfraInput when calling
  inputProps = {}
}) => {
  const formContext = useFormContext?.() || {};
  const { getValues: ctxGetValues } = formContext;

  // use the same helpers
  const readFieldValue = (fieldName) => readFieldValueFromContextOrDOM(fieldName, ctxGetValues, inputProps);

  const handleCopy = async () => {
    const val = readFieldValue(name);
    await copyTextToClipboard(val, label || name);
  };

  // local styles (copy button)
  const btnStyle = {
    height: 40,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid var(--color-borderdefault)',
    background: 'var(--color-bg2)',
    color: 'var(--color-font4light)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="linha" style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
      <div style={{ flex: 1 }}>
        {InputComponent ? (
          <InputComponent
            name={name}
            erros={erros}
            label={label}
            placeholder={placeholder}
            registro={registro}
            required={false}
            disabled={disabled}
            {...inputProps}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ color: 'var(--color-font4light)', fontSize: '.85rem', marginBottom: 6 }}>{label}</label>
            <input
              name={name}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--color-borderdefault)',
                background: 'var(--color-bg1)',
                color: 'var(--color-font)',
                boxSizing: 'border-box'
              }}
              readOnly
              value={readFieldValue(name) ?? ''}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        style={btnStyle}
        title={`Copiar ${label || name}`}
      >
        Copiar
      </button>
    </div>
  );
};

export default DirinfraCopiaButton;
