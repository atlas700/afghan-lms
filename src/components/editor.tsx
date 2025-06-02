// components/Editor.tsx
"use client";

import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface EditorProps {
  value: string;
  onChange: (newHtml: string) => void;
  readOnly?: boolean;
  /** (Optional) If you ever do need RTL, you can remove forcing LTR below. */
  enforceLtr?: boolean;
}

export interface EditorHandle {
  getQuill: () => Quill | null;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ value, onChange, readOnly = false, enforceLtr = true }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const onChangeRef = useRef(onChange);

    // Keep the latest onChange callback in a ref
    useLayoutEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Expose Quill instance if needed
    useImperativeHandle(ref, () => ({
      getQuill: () => quillRef.current,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // If we want to force LTR, put dir="ltr" on the outer wrapper:
      if (enforceLtr) {
        container.setAttribute("dir", "ltr");
      }

      // Create the actual div that Quill will attach to
      const editorDiv = document.createElement("div");
      container.appendChild(editorDiv);

      const quill = new Quill(editorDiv, {
        theme: "snow",
        readOnly: readOnly,
      });
      quillRef.current = quill;

      // Immediately override Quill’s internal root to LTR as well:
      if (enforceLtr) {
        quill.root.setAttribute("dir", "ltr");
        quill.root.style.textAlign = "left";
      }

      // Load any initial HTML string
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      // On every text‐change, send out the latest HTML
      quill.on(Quill.events.TEXT_CHANGE, () => {
        const html = quill.root.innerHTML;
        onChangeRef.current(html);
      });

      // Respect the initial readOnly state
      quill.enable(!readOnly);

      return () => {
        quillRef.current = null;
        container.innerHTML = "";
      };
    }, [enforceLtr, readOnly, value]); // run once

    // If the parent value changes (e.g. form reset), update Quill
    useEffect(() => {
      const quill = quillRef.current;
      if (!quill) return;
      if (quill.root.innerHTML !== value) {
        const sel = quill.getSelection();
        quill.clipboard.dangerouslyPasteHTML(value || "");
        if (sel) {
          try {
            quill.setSelection(sel);
          } catch {
            // ignore out-of-range
          }
        }
      }
    }, [value]);

    // Toggle readOnly if prop changes
    useEffect(() => {
      quillRef.current?.enable(!readOnly);
    }, [readOnly]);

    return <div ref={containerRef} />;
  },
);

Editor.displayName = "Editor";
