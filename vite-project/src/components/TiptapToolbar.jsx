import {
  DocumentTextIcon,
  ListBulletIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

function TiptapToolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="bg-gray-100 p-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("bold")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Bold"
      >
        <DocumentTextIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("italic")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Italic"
      >
        <DocumentTextIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Heading 1"
      >
        <DocumentTextIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Heading 2"
      >
        <DocumentTextIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("bulletList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Bullet List"
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md transition ${
          editor.isActive("orderedList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Numbered List"
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = prompt("Enter URL", previousUrl || "");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded-md transition ${
          editor.isActive("link")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Link"
      >
        <LinkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
export default TiptapToolbar;
