import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaTable,
  FaImage,
  FaLink,
  FaUnlink,
  FaHeading,
} from "react-icons/fa";

const TiptapToolbar = ({ editor }) => {
  if (!editor) return null;

  // Prevent default to avoid form submission
  const handleClick = (e, callback) => {
    e.preventDefault();
    callback();
  };

  // Toggle heading level
  const toggleHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  // Set link
  const setLink = () => {
    const url = prompt("Enter the URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Unset link
  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // Add image
  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Add table
  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300 animate-slide-up">
      {/* Headings */}
      <button
        type="button"
        onClick={(e) => handleClick(e, () => toggleHeading(1))}
        className={`p-2 rounded ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Heading 1"
        aria-label="Toggle Heading 1"
      >
        <FaHeading />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick(e, () => toggleHeading(2))}
        className={`p-2 rounded ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Heading 2"
        aria-label="Toggle Heading 2"
      >
        <FaHeading className="text-sm" />
      </button>

      {/* Text formatting */}
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleBold().run())
        }
        className={`p-2 rounded ${
          editor.isActive("bold")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Bold"
        aria-label="Toggle Bold"
      >
        <FaBold />
      </button>
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleItalic().run())
        }
        className={`p-2 rounded ${
          editor.isActive("italic")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Italic"
        aria-label="Toggle Italic"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleUnderline().run())
        }
        className={`p-2 rounded ${
          editor.isActive("underline")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Underline"
        aria-label="Toggle Underline"
      >
        <FaUnderline />
      </button>

      {/* Lists */}
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleBulletList().run())
        }
        className={`p-2 rounded ${
          editor.isActive("bulletList")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Bullet List"
        aria-label="Toggle Bullet List"
      >
        <FaListUl />
      </button>
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleOrderedList().run())
        }
        className={`p-2 rounded ${
          editor.isActive("orderedList")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Ordered List"
        aria-label="Toggle Ordered List"
      >
        <FaListOl />
      </button>

      {/* Blockquote and Code */}
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleBlockquote().run())
        }
        className={`p-2 rounded ${
          editor.isActive("blockquote")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Blockquote"
        aria-label="Toggle Blockquote"
      >
        <FaQuoteLeft />
      </button>
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => editor.chain().focus().toggleCodeBlock().run())
        }
        className={`p-2 rounded ${
          editor.isActive("codeBlock")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Code Block"
        aria-label="Toggle Code Block"
      >
        <FaCode />
      </button>

      {/* Link and Image */}
      <button
        type="button"
        onClick={(e) => handleClick(e, setLink)}
        className={`p-2 rounded ${
          editor.isActive("link")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Add Link"
        aria-label="Add Link"
      >
        <FaLink />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick(e, unsetLink)}
        className={`p-2 rounded ${
          editor.isActive("link")
            ? "bg-blue-500 text-white"
            : "bg-white text-blue-700"
        } hover:bg-blue-200`}
        title="Remove Link"
        aria-label="Remove Link"
        disabled={!editor.isActive("link")}
      >
        <FaUnlink />
      </button>
      <button
        type="button"
        onClick={(e) => handleClick(e, addImage)}
        className="p-2 rounded bg-white text-blue-700 hover:bg-blue-200"
        title="Add Image"
        aria-label="Add Image"
      >
        <FaImage />
      </button>

      {/* Table */}
      <button
        type="button"
        onClick={(e) => handleClick(e, addTable)}
        className="p-2 rounded bg-white text-blue-700 hover:bg-blue-200"
        title="Add Table"
        aria-label="Add Table"
      >
        <FaTable />
      </button>
    </div>
  );
};

export default TiptapToolbar;
