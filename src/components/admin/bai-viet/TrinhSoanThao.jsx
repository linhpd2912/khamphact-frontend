import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";


import {
  Bold,
  Italic,
  ImagePlus,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
} from "lucide-react";

import "./TrinhSoanThao.css";

function TrinhSoanThao({
  value = "",
  onChange,
  onMoThuVienAnh,
  anhCanChen,
  placeholder = "Bắt đầu viết nội dung bài viết...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Cập nhật nội dung khi mở bài viết có sẵn để chỉnh sửa
  useEffect(() => {
    if (!editor) return;

    const noiDungHienTai = editor.getHTML();

    if (value !== noiDungHienTai) {
      editor.commands.setContent(value || "", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !anhCanChen?.urlHienThi) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: anhCanChen.urlHienThi,
        alt: anhCanChen.altText || "",
      })
      .run();
  }, [editor, anhCanChen]);

  if (!editor) {
    return <div className="tst-loading">Đang tải trình soạn thảo...</div>;
  }

  // Thêm hoặc chỉnh sửa liên kết
  const xuLyChenLienKet = () => {
    const lienKetHienTai = editor.getAttributes("link").href || "";

    const url = window.prompt("Nhập đường dẫn liên kết:", lienKetHienTai);

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  // Nút chức năng trên thanh công cụ
  const ToolbarButton = ({
    icon: Icon,
    title,
    active = false,
    disabled = false,
    onClick,
  }) => (
    <button
      type="button"
      className={`tst-toolbar-btn ${active ? "active" : ""}`}
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon size={17} />
    </button>
  );

  return (
    <div className="tst-editor">
      <div className="tst-toolbar">
        {/* Định dạng chữ */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={Bold}
            title="In đậm"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />

          <ToolbarButton
            icon={Italic}
            title="In nghiêng"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />

          <ToolbarButton
            icon={UnderlineIcon}
            title="Gạch chân"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
        </div>

        <span className="tst-toolbar-divider" />

        {/* Thư viện ảnh */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={ImagePlus}
            title="Chèn ảnh từ thư viện"
            onClick={() => onMoThuVienAnh?.()}
          />
        </div>

        {/* Tiêu đề */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={Heading2}
            title="Tiêu đề H2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />

          <ToolbarButton
            icon={Heading3}
            title="Tiêu đề H3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />
        </div>

        <span className="tst-toolbar-divider" />

        {/* Danh sách */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={List}
            title="Danh sách dấu đầu dòng"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />

          <ToolbarButton
            icon={ListOrdered}
            title="Danh sách đánh số"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </div>

        <span className="tst-toolbar-divider" />

        {/* Căn lề */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={AlignLeft}
            title="Căn trái"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          />

          <ToolbarButton
            icon={AlignCenter}
            title="Căn giữa"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
          />

          <ToolbarButton
            icon={AlignRight}
            title="Căn phải"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          />
        </div>

        <span className="tst-toolbar-divider" />

        {/* Liên kết */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={LinkIcon}
            title="Chèn liên kết"
            active={editor.isActive("link")}
            onClick={xuLyChenLienKet}
          />

          <ToolbarButton
            icon={Unlink}
            title="Gỡ liên kết"
            disabled={!editor.isActive("link")}
            onClick={() => editor.chain().focus().unsetLink().run()}
          />
        </div>

        <span className="tst-toolbar-divider" />

        {/* Hoàn tác */}
        <div className="tst-toolbar-group">
          <ToolbarButton
            icon={Undo2}
            title="Hoàn tác"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />

          <ToolbarButton
            icon={Redo2}
            title="Làm lại"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>
      </div>

      <EditorContent editor={editor} className="tst-editor-content" />
    </div>
  );
}

export default TrinhSoanThao;