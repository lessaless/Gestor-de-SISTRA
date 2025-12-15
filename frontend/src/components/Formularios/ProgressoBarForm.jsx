import React, { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import Dicionario from "../../utils/Dicionario";

/**
 * Reusable slider control for react-hook-form
 */
export function ProgressBarField({
  control,
  name = "progresso",
  label = "Progresso do Projeto",
  defaultValue = 0,
  required = false,
  erros,
  // sizing
  trackHeight = 12,
  thumbWidth = 16,
  thumbHeight = 26,
  // layout
  inline = true,          // label at left, bar at right (same row)
  labelWidth = 220,
  // behavior
  step = 1,               // set to 5 to snap by 5%
  showHint = true,
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPct, setHoverPct] = useState(null);

  const clamp = (v) => Math.min(100, Math.max(0, v));
  const pctFromClientX = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const snapped = Math.round(raw / step) * step;
    return clamp(snapped);
  };

  const onKey = (e, value, onChange) => {
    let d = 0;
    const big = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") d = big;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") d = -big;
    if (e.key === "Home") return onChange(0);
    if (e.key === "End") return onChange(100);
    if (d !== 0) {
      e.preventDefault();
      onChange(clamp((Number(value) || 0) + d));
    }
  };

  const onPointerDown = (e, onChange) => {
    if (!trackRef.current) return;
    trackRef.current.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    const pct = pctFromClientX(e.clientX);
    setHoverPct(pct);
    onChange(pct);
  };
  const onPointerMove = (e, onChange) => {
    const pct = pctFromClientX(e.clientX);
    setHoverPct(pct);
    if (isDragging) onChange(pct);
  };
  const onPointerUp = (e) => {
    setIsDragging(false);
    trackRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{ required: required ? "Campo obrigatório" : false }}
      render={({ field: { value = 0, onChange, onBlur }, fieldState: { error } }) => (
        <div style={{ width: "100%" }}>
          {/* Label + slider in one row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: inline ? `${labelWidth}px 1fr` : "1fr",
              alignItems: "center",
              columnGap: 12,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: inline ? 0 : 6,
                whiteSpace: "nowrap",
              }}
            >
              {label} {required && <em className="obrigatorios">*</em>}
            </label>

            {/* Slider */}
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number(value) || 0}
              aria-label={label}
              onKeyDown={(e) => onKey(e, Number(value) || 0, onChange)}
              onPointerDown={(e) => onPointerDown(e, onChange)}
              onPointerMove={(e) => onPointerMove(e, onChange)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onBlur={onBlur}
              style={{
                position: "relative",
                width: "100%",
                height: trackHeight,
                borderRadius: 999,
                border:"1px solid var(--color-borderdefault)",
                background: "var(--color-bg1)",
                cursor: isDragging ? "grabbing" : "ew-resize",
                userSelect: "none",
                outline: "none",
                touchAction: "none",
              }}
            >
              {/* filled track */}
              <div
                style={{
                  width: `${Number(value) || 0}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--color-theme3),var(--color-theme1))", // deep navy
                  transition: isDragging ? "none" : "width 80ms linear",
                }}
              />

              {/* thumb */}
              <div
                style={{
                  position: "absolute",
                  left: `calc(${Number(value) || 0}% - ${thumbWidth / 2}px)`,
                  top: -(thumbHeight - trackHeight) / 2,
                  width: thumbWidth,
                  height: thumbHeight,
                  borderRadius: 6,
                  background: "var(--color-bg4)",
                  border:"1px solid var(--color-borderdefault)" ,
                  boxShadow: "0 2px 6px var(--color-shadow)",
                  pointerEvents: "none",
                }}
              />

              {/* hover marker + tooltip */}
              {hoverPct !== null && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: `calc(${hoverPct}% - 1px)`,
                      top: 0,
                      height: "100%",
                      width: 2,
                      background: "rgba(0,0,0,0.25)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `calc(${hoverPct}% - 18px)`,
                      top: -36,
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: "#111827",
                      color: "#fff",
                      fontSize: 12,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hoverPct}%
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hint (left) + value box (right) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            {showHint && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                (setas ↑↓←→, Shift = ±10)
              </span>
            )}

            <input
              type="number"
              min={0}
              max={100}
              step={step}
              value={Number(value) || 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) onChange(clamp(v));
              }}
              onBlur={onBlur}
              style={{
                width: 64,
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid var(--color-borderdefault)",
                backgroundColor: "var(--color-bg1)",
                color: "var(--color-font4light)",
                marginLeft: "auto",
                textAlign: "right",
              }}
            />
          </div>

          {(error || (erros && erros[name])) && (
            <div style={{ color: "crimson", fontSize: 12, marginTop: 6 }}>
              {error?.message || erros[name]?.message}
            </div>
          )}
        </div>
      )}
    />
  );
}

/**
 * Minimal wrapper that renders only the progress field.
 * Keep the same component name if your parent expects <ProgressoBarForm ... />
 */
const ProgressoBarForm = ({ control, errors }) => {
  return (
    <div className="linha">
      <em className="obrigatorios">*</em>
      <div
        style={{
          border: "1px solid",
          borderColor: "var(--color-borderdefault)",
          borderRadius: "4px",
          margin: "0 10px",
          padding: "12px",
          width: "100%",
        }}
      >
        <ProgressBarField
          control={control}
          name="progresso"
          label={Dicionario("progresso")}
          defaultValue={0}
          required
          erros={errors}
          inline
          labelWidth={230}
          trackHeight={14}
          thumbWidth={18}
          thumbHeight={28}
        />
      </div>
    </div>
  );
};

export default ProgressoBarForm;
