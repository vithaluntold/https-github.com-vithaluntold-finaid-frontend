export const formatMessageContent = (content) => {
  const elements = [];
  const lines = content.trim().split("\n"); // Split by new lines

  let tableHeaders = [];
  let tableRows = [];
  let isTable = false;
  let currentList = []; // Track current list items
  let isOrderedList = false; // Track if it's an ordered or unordered list

  // Helper function to format individual parts inside a paragraph
  const formatParagraph = (text) => {
    return text
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^ `]+` | https ?: \/\/\S+)/)
      .map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>; // Bold text
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={index}>{part.slice(1, -1)}</em>; // Italic text
        } else if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              style={{
                backgroundColor: "#f0f0f0",
                padding: "2px 4px",
                borderRadius: "3px",
              }}
            >
              {part.slice(1, -1)}
            </code>
          ); // Inline code
        } else if (part.startsWith("http")) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1a73e8" }}
            >
              {part}
            </a>
          ); // Links
        } else {
          return part; // Regular text
        }
      });
  };

  const isDashedOrEmpty = (cell) => /^[-\s]*$/.test(cell.trim()); // Check for dashes or empty cells

  // Iterate through lines and determine formatting
  lines.forEach((line, index) => {
    line = line.trim();

    // 1. Detect Horizontal Separator
    if (/^[-]{5,}$/.test(line)) {
      elements.push(<hr key={index} style={{ margin: "15px 0" }} />);
    }
    // 2. Detect Markdown Headers (#, ##, ###)
    else if (line.startsWith("#")) {
      const headerLevel = line.match(/^#+/)[0].length;
      const HeaderTag = `h${Math.min(headerLevel, 6)}`; // Limit to h1-h6
      elements.push(
        <HeaderTag key={index}>{line.slice(headerLevel).trim()}</HeaderTag>
      );
    }
    // 3. Detect Bold Labels (e.g., "Regulatory Oversight:")
    else if (/^\*\*.*\*\*:?$/.test(line)) {
      elements.push(
        <h4 key={index} style={{ fontWeight: "bold", marginTop: "10px" }}>
          {line.replace(/\*\*/g, "").trim()}
        </h4>
      );
      currentList = []; // Reset list for new section
      isOrderedList = false;
    }
    // 4. Detect Bullet Lists (- or *) under Bold Labels
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItem = line.replace(/^[-*]\s*/, ""); // Remove the list marker
      currentList.push(<li key={index}>{formatParagraph(listItem)}</li>);
      isOrderedList = false; // Track this as an unordered list
    }
    // 5. Detect Numbered Lists (1., 2., ...) under Bold Labels
    else if (/^\d+\./.test(line)) {
      const listItem = line.replace(/^\d+\.\s*/, ""); // Remove the number and period
      currentList.push(<li key={index}>{formatParagraph(listItem)}</li>);
      isOrderedList = true; // Track this as an ordered list
    }
    // 6. Detect Blockquotes (> text)
    else if (line.startsWith(">")) {
      elements.push(
        <blockquote
          key={index}
          style={{
            fontStyle: "italic",
            borderLeft: "4px solid #ccc",
            paddingLeft: "10px",
          }}
        >
          {line.slice(1).trim()}
        </blockquote>
      );
    }
    // 7. Detect Code Blocks (```code```)
    else if (line.startsWith("```")) {
      const code = lines.slice(index + 1, lines.length - 1).join("\n");
      elements.push(
        <pre
          key={index}
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <code>{code}</code>
        </pre>
      );
      return; // Skip the rest of the code block
    }
    // 8. Detect Tables (| separators)
    else if (line.includes("|")) {
      if (!isTable) {
        isTable = true;
        tableHeaders = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => !isDashedOrEmpty(cell)); // Remove empty or dashed headers
      } else {
        const row = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => !isDashedOrEmpty(cell)); // Remove empty or dashed cells
        if (row.length > 0) tableRows.push(row); // Only add non-empty rows
      }
    }
    // 9. Default Paragraph
    else if (line) {
      elements.push(<p key={index}>{formatParagraph(line)}</p>);
    }
  });

  // Render the current list if there are items
  if (currentList.length > 0) {
    elements.push(
      isOrderedList ? (
        <ol key="ordered-list">{currentList}</ol>
      ) : (
        <ul key="unordered-list">{currentList}</ul>
      )
    );
  }

  // Render the table if headers and rows are present
  if (tableHeaders.length > 0 && tableRows.length > 0) {
    elements.push(
      <table
        key="table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            {tableHeaders.map((header, idx) => (
              <th
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  backgroundColor: "#f2f2f2",
                  fontWeight: "bold",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{ border: "1px solid #ddd", padding: "8px" }}
                >
                  {formatParagraph(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return <div>{elements}</div>;
};
