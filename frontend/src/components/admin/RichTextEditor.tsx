import { useEffect, useRef } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered, Heading2, Heading3,
  Link2, Eraser, AlignLeft, AlignCenter,
} from "lucide-react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

const COLORS = [
  "#111827", "#dc2626", "#ea580c", "#ca8a04",
  "#16a34a", "#0891b2", "#2563eb", "#7c3aed",
];

const HIGHLIGHTS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca"];

// Keep only the inline styles this editor itself produces (text color, highlight)
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  const el = node as Element;
  if (el.nodeType === 1 && el.hasAttribute?.("style")) {
    const kept = (el.getAttribute("style") || "")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => /^(color|background-color)\s*:/i.test(s));
    if (kept.length) el.setAttribute("style", kept.join("; "));
    else el.removeAttribute("style");
  }
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value only when it differs (avoids caret jumping while typing)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    onChange(ref.current?.innerHTML || "");
  };

  const Btn = ({
    onClick, title, active, children,
  }: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent transition-colors",
        active && "bg-accent"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border">
        <Btn onClick={() => exec("bold")} title="বোল্ড"><Bold className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("italic")} title="ইটালিক"><Italic className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("underline")} title="আন্ডারলাইন"><Underline className="w-4 h-4" /></Btn>
        <span className="w-px h-6 bg-border mx-0.5" />
        <Btn onClick={() => exec("formatBlock", "<h2>")} title="শিরোনাম বড়"><Heading2 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("formatBlock", "<h3>")} title="শিরোনাম ছোট"><Heading3 className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("insertUnorderedList")} title="বুলেট লিস্ট"><List className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("insertOrderedList")} title="নাম্বার লিস্ট"><ListOrdered className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("justifyLeft")} title="বাম"><AlignLeft className="w-4 h-4" /></Btn>
        <Btn onClick={() => exec("justifyCenter")} title="মাঝে"><AlignCenter className="w-4 h-4" /></Btn>
        <span className="w-px h-6 bg-border mx-0.5" />
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`টেক্সট কালার ${c}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("foreColor", c)}
              className="w-5 h-5 rounded-full border border-border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="w-px h-6 bg-border mx-0.5" />
        <div className="flex items-center gap-1">
          {HIGHLIGHTS.map((c) => (
            <button
              key={c}
              type="button"
              title={`হাইলাইট ${c}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("hiliteColor", c)}
              className="w-5 h-5 rounded-sm border border-border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="w-px h-6 bg-border mx-0.5" />
        <Btn
          title="লিংক"
          onClick={() => {
            const url = window.prompt("লিংক URL দিন:");
            if (url) exec("createLink", url);
          }}
        >
          <Link2 className="w-4 h-4" />
        </Btn>
        <Btn onClick={() => exec("removeFormat")} title="ফরম্যাট মুছুন"><Eraser className="w-4 h-4" /></Btn>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML || "")}
        onBlur={() => onChange(ref.current?.innerHTML || "")}
        onPaste={(e) => {
          e.preventDefault();
          // Prefer formatted HTML so copied color/bold/etc. survive paste,
          // sanitized to only the tags/attributes this editor supports.
          const html = e.clipboardData.getData("text/html");
          if (html) {
            const clean = DOMPurify.sanitize(html, {
              ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "s", "strike", "h2", "h3", "p", "div", "br", "ul", "ol", "li", "a", "span"],
              ALLOWED_ATTR: ["href", "target", "rel", "style"],
              ALLOW_DATA_ATTR: false,
            });
            document.execCommand("insertHTML", false, clean);
          } else {
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }
        }}
        className="rte-content min-h-[280px] max-h-[55vh] overflow-y-auto p-3 text-sm leading-relaxed outline-none bg-background text-foreground"
      />
    </div>
  );
}
