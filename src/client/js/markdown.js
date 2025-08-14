
// Simple Markdown to HTML converter
function markdownToHtml(text) {
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italics
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}

