import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, ImageIcon, Highlighter,
} from "lucide-react";
import { useEffect } from "react";

interface ResourceEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function ResourceEditor({ content, onChange }: ResourceEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      Placeholder.configure({ placeholder: "Write resource content here…" }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-muted text-primary" : "text-muted-foreground"}`;

  const addLink = () => {
    const url = prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/30">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("highlight"))} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter className="h-4 w-4" /></button>
        <span className="w-px bg-border mx-1" />
        <button type="button" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></button>
        <span className="w-px bg-border mx-1" />
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></button>
        <span className="w-px bg-border mx-1" />
        <button type="button" className={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></button>
        <button type="button" className={btn(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></button>
        <span className="w-px bg-border mx-1" />
        <button type="button" className={btn(editor.isActive("link"))} onClick={addLink}><LinkIcon className="h-4 w-4" /></button>
        <button type="button" className={btn(false)} onClick={addImage}><ImageIcon className="h-4 w-4" /></button>
      </div>
      <EditorContent editor={editor} className="tiptap-editor prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px]" />
    </div>
  );
}
