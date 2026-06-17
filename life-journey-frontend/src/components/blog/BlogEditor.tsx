"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect, useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  Table as TableIcon,
  Video,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes({ controls: true, style: "max-width:100%;border-radius:8px;" }, HTMLAttributes)];
  },
});

const YoutubeNode = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'iframe[src*="youtube.com/embed"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(
        {
          width: "100%",
          height: "400",
          frameborder: "0",
          allowfullscreen: "true",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          style: "border-radius:8px;aspect-ratio:16/9;width:100%;",
        },
        HTMLAttributes
      ),
    ];
  },
});

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1).split("?")[0];
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.includes("/embed/")) return url;
      videoId = u.searchParams.get("v");
    }
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export interface BlogEditorHandle {
  insertLink: (href: string, text: string) => void;
  setContent: (html: string) => void;
}

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onVideoUpload?: (file: File) => Promise<string>;
}

function convertMarkdownToHtml(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let listType = '';

  const inline = (s: string) =>
    s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = ''; } };

  for (const line of lines) {
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const ul = line.match(/^[-*+] (.+)/);
    const ol = line.match(/^\d+\. (.+)/);

    if (h3) { closeList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue; }
    if (h2) { closeList(); out.push(`<h2>${inline(h2[1])}</h2>`); continue; }
    if (h1) { closeList(); out.push(`<h1>${inline(h1[1])}</h1>`); continue; }

    if (ul) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    if (ol) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    closeList();
    if (line.trim() === '') continue;
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join('');
}

export const BlogEditor = forwardRef<BlogEditorHandle, BlogEditorProps>(function BlogEditor(
  { content, onChange, placeholder, onImageUpload, onVideoUpload }: BlogEditorProps,
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const editorInstanceRef = useRef<import("@tiptap/react").Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Begin met schrijven…" }),
      CharacterCount,
      Typography,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      VideoNode,
      YoutubeNode,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      transformPastedHTML(html) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          // Remove non-content elements
          doc.querySelectorAll('script, style, nav, footer, header, aside, form, button, input, select, textarea').forEach(el => el.remove());
          // Strip presentation attributes so TipTap can parse clean semantic HTML
          doc.querySelectorAll('*').forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('style');
            el.removeAttribute('id');
          });
          return doc.body.innerHTML;
        } catch {
          return html;
        }
      },
      handlePaste: (view, event) => {
        const data = event.clipboardData;
        if (!data) return false;

        // If clipboard has HTML, let transformPastedHTML + TipTap handle it natively
        const html = data.getData('text/html');
        if (html && html.trim()) return false;

        const text = data.getData('text/plain');
        if (!text) return false;

        // Only intercept plain text with markdown headings
        if (!/^#{1,6} /m.test(text)) return false;

        const converted = convertMarkdownToHtml(text);
        editorInstanceRef.current?.commands.insertContent(converted);
        return true;
      },
      attributes: {
        class:
          "min-h-[500px] p-6 focus:outline-none prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-slate-100 prose-code:rounded prose-code:px-1 prose-img:rounded-lg [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:border [&_th]:border-slate-300 [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:font-semibold [&_th]:bg-slate-50 [&_th]:text-left",
      },
    },
  });

  useEffect(() => {
    editorInstanceRef.current = editor;
  }, [editor]);

  useImperativeHandle(ref, () => ({
    insertLink(href: string, text: string) {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().setLink({ href }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${href}">${text}</a> `).run();
      }
    },
    setContent(html: string) {
      if (!editor) return;
      editor.commands.setContent(html, { emitUpdate: false });
    },
  }), [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor || !onImageUpload) return;
      setImageUploading(true);
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // Silently ignore — user sees nothing changed
      } finally {
        setImageUploading(false);
      }
    },
    [editor, onImageUpload]
  );

  const handleVideoFile = useCallback(
    async (file: File) => {
      if (!editor || !onVideoUpload) return;
      setVideoUploading(true);
      try {
        const url = await onVideoUpload(file);
        editor.chain().focus().insertContent({ type: "video", attrs: { src: url } }).run();
      } catch {
        // Silently ignore
      } finally {
        setVideoUploading(false);
      }
    },
    [editor, onVideoUpload]
  );

  const addImage = useCallback(() => {
    if (!editor) return;
    if (onImageUpload) {
      fileInputRef.current?.click();
    } else {
      const url = window.prompt("Afbeelding URL:");
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, onImageUpload]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    if (onVideoUpload) {
      videoInputRef.current?.click();
    } else {
      const url = window.prompt("Video URL:");
      if (url) editor.chain().focus().insertContent({ type: "video", attrs: { src: url } }).run();
    }
  }, [editor, onVideoUpload]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL (bijv. https://www.youtube.com/watch?v=...):");
    if (!url) return;
    const embedUrl = toYoutubeEmbed(url.trim());
    if (!embedUrl) {
      window.alert("Ongeldige YouTube URL. Gebruik een link zoals:\nhttps://www.youtube.com/watch?v=...\nhttps://youtu.be/...");
      return;
    }
    editor.chain().focus().insertContent({ type: "youtube", attrs: { src: embedUrl } }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleVideoFile(file);
          e.target.value = "";
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Vet (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Cursief (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Doorgestreept"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Kop 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Kop 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Kop 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Ongeordende lijst"
        >
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Genummerde lijst"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citaat"
        >
          <Quote className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontale lijn"
        >
          <Minus className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Link invoegen">
          <LinkIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={addImage} disabled={imageUploading} title="Afbeelding invoegen">
          {imageUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolBtn>
        <ToolBtn onClick={addVideo} disabled={videoUploading} title="Video uploaden">
          {videoUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4" />
          )}
        </ToolBtn>
        <ToolBtn onClick={addYoutube} title="YouTube video invoegen">
          <Youtube className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={insertTable} title="Tabel invoegen">
          <TableIcon className="h-4 w-4" />
        </ToolBtn>

        <Divider />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Ongedaan maken"
        >
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Opnieuw"
        >
          <Redo className="h-4 w-4" />
        </ToolBtn>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between gap-4 px-6 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
        <span>{imageUploading ? "Afbeelding uploaden…" : videoUploading ? "Video uploaden…" : ""}</span>
        <div className="flex gap-4">
          <span>{wordCount} woorden</span>
          <span>{charCount} tekens</span>
        </div>
      </div>
    </div>
  );
});

function ToolBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-300 mx-1" />;
}
