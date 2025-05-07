import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight"; // Correct import
import TiptapToolbar from "./TiptapToolbar";

// Create lowlight instance
const lowlight = createLowlight();

const RichTextEditor = ({ value, onChange, error }) => {
  // Initialize Tiptap editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit, // Includes bold, italic, headings, lists, etc.
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: true }), // Support images
      Table.configure({ resizable: true }), // Support tables
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }), // Use created lowlight instance
    ],
    content: value || "<p></p>", // Initial content
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // console.log("Editor updated:", html); // Debug
      onChange(html === "<p></p>" ? "" : html);
    },
    editable: true,
  });

  // Update editor content when value changes
  useEffect(() => {
    if (!editor || !value) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Render editor
  return (
    <div className="mb-4">
      <label
        htmlFor="content"
        className="block text-sm sm:text-base font-medium text-blue-800 mb-1"
      >
        Session Content
      </label>
      <div
        className={`border rounded-lg overflow-hidden ${
          error ? "border-red-500" : "border-gray-300"
        } focus-within:ring-2 focus-within:ring-blue-500 animate-slide-up`}
      >
        <TiptapToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className="prose prose-blue max-w-none p-4 min-h-[200px] focus:outline-none"
          aria-label="Session content editor"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
