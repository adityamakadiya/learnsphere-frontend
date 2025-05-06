import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapToolbar from "./TiptapToolbar";

const RichTextEditor = ({ content, onChange, error, initialContent }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content: initialContent || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <TiptapToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-blue max-w-none p-4 min-h-[200px] focus:outline-none"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
