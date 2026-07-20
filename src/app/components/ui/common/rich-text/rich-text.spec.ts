import { renderRichText } from './rich-text';

describe('renderRichText', () => {
  it('renders GitHub-flavored Markdown without losing its structure', () => {
    const html = renderRichText({
      format: 'MARKDOWN',
      content: `### Description

1. Detect the modal
2. Focus the \`accept\` button

> Keep the interaction accessible.

https://github.com/refined-github/refined-github/issues/9247

<img width="711" height="444" alt="Example dialog" src="https://github.com/user-attachments/assets/example" />`,
    });

    expect(html).toContain('<h3>Description</h3>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<code>accept</code>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<a href="https://github.com/refined-github/refined-github/issues/9247"');
    expect(html).toContain('alt="Example dialog"');
    expect(html).toContain('src="https://github.com/user-attachments/assets/example"');
  });

  it('sanitizes Markdown and provider HTML before rendering', () => {
    const markdown = renderRichText({
      format: 'MARKDOWN',
      content: '<img src="x" onerror="alert(1)"><script>alert(2)</script>',
    });
    const html = renderRichText({
      format: 'HTML',
      content: '<p onclick="alert(1)">Safe</p><script>alert(2)</script>',
    });

    expect(markdown).toContain('<img src="x">');
    expect(markdown).not.toContain('onerror');
    expect(markdown).not.toContain('<script');
    expect(html).toContain('<p>Safe</p>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('<script');
  });

  it('continues to render ADF and escapes plain text', () => {
    const adf = renderRichText({
      format: 'ADF',
      content: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{type: 'text', text: 'Jira content', marks: [{type: 'strong'}]}],
        }],
      },
    });
    const plainText = renderRichText({
      format: 'PLAIN_TEXT',
      content: '<b>Not HTML</b>\nSecond line',
    });

    expect(adf).toContain('<strong>Jira content</strong>');
    expect(plainText).toBe('&lt;b&gt;Not HTML&lt;/b&gt;<br>Second line');
  });
});
