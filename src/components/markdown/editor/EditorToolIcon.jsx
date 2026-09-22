import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import StrikethroughS from '@mui/icons-material/StrikethroughS';
import Code from '@mui/icons-material/Code';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import Checklist from '@mui/icons-material/Checklist';
import FormatQuote from '@mui/icons-material/FormatQuote';
import HorizontalRule from '@mui/icons-material/HorizontalRule';
import IntegrationInstructionsOutlined from '@mui/icons-material/IntegrationInstructionsOutlined';
import UnfoldMore from '@mui/icons-material/UnfoldMore';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import Link from '@mui/icons-material/Link';
import BookmarksOutlined from '@mui/icons-material/BookmarksOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import Notes from '@mui/icons-material/Notes';
import Search from '@mui/icons-material/Search';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import FormatColorText from '@mui/icons-material/FormatColorText';

const icons = { bold: FormatBold, italic: FormatItalic, strikethrough: StrikethroughS, inlineCode: Code, color: FormatColorText, unorderedList: FormatListBulleted, orderedList: FormatListNumbered, taskList: Checklist, quote: FormatQuote, divider: HorizontalRule, fence: IntegrationInstructionsOutlined, code: UnfoldMore, image: AddPhotoAlternateOutlined, table: TableChartOutlined, link: Link, bookmark: BookmarksOutlined, alert: InfoOutlined, edit: EditOutlined, notion: FileDownloadOutlined, paragraph: Notes, search: Search, undo: Undo, redo: Redo };

export default function EditorToolIcon({ name }) {
  if (/^heading[234]$/.test(name)) return <span className="editor-heading-icon" aria-hidden="true">H<sub>{name.at(-1)}</sub></span>;
  const Icon = icons[name] || Notes;
  return <Icon aria-hidden="true" focusable="false" className="editor-tool-icon" />;
}
