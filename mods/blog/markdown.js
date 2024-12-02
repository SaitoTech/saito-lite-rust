module.exports = (app, mod, build_number, og_card) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="description" content="${app.browser.escapeHTML(mod.description)}" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=yes" />
  
      <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/fontawesome.min.css" type="text/css" media="screen" />
      <link rel="stylesheet" href="/saito/lib/font-awesome-6/css/all.css" type="text/css" media="screen" />
      <link rel="stylesheet" href="/saito/saito.css?v=${build_number}" />
      <link rel="stylesheet" href="/blog/style.css" />
  
      <title>Markdown Guide - Saito Blog</title>

          <style>
      body {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.markdown-preview {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  margin: 0 auto;
}

        section {
          margin: 2rem 0;
          padding: 2rem;
          border: 1px solid var(--saito-border-color);
          border-radius: 8px;
          background: var(--saito-background-color);
        }

        h1 {
          margin-bottom: 3rem;
          padding-bottom: 1rem;
        }

        h2 {
          color: var(--saito-primary);
          margin-bottom: 1.5rem;
        }

        h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        pre {
          background: var(--saito-background-color-alt);
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          border: 1px solid var(--saito-border-color);
          margin: 1rem 0;
        }

        code {
          font-family: monospace;
        }

        table {
          width: 100%;
          margin: 1rem 0;
        }

        blockquote {
          margin: 1rem 0;
          padding: 1rem;
          border-left: 4px solid var(--saito-primary);
          background: var(--saito-background-color-alt);
        }

        hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid var(--saito-border-color);
        }

        .example-output {
          margin: 1rem 0;
          padding: 1rem;
          border-left: 4px solid var(--saito-primary);
          background: var(--saito-background-color-light);
        }

        dl {
          margin: 1rem 0;
        }

        dt {
          font-weight: bold;
          margin-top: 1rem;
        }

        dd {
          margin-left: 2rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 850px) {
          body {
            padding: 1rem;
          }

          .markdown-preview {
            padding: 1rem;
          }

          section {
            padding: 1rem;
            margin: 1rem 0;
          }
        }
      </style>
    </head>
    
    <body>
      <div class="markdown-preview">
        <h1>Markdown Formatting Guide</h1>
        
        <section>
          <h2>Headers</h2>
          <pre>
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6</pre>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        </section>
  
        <section>
          <h2>Basic Text Formatting</h2>
          <pre>
*This text is italic* or _this text is italic_
**This text is bold** or __this text is bold__
***This text is bold and italic*** or ___this text is bold and italic___
~~This text is strikethrough~~
'This is inline code'</pre>
          <p><em>This text is italic</em> or <em>this text is italic</em></p>
          <p><strong>This text is bold</strong> or <strong>this text is bold</strong></p>
          <p><strong><em>This text is bold and italic</em></strong> or <strong><em>this text is bold and italic</em></strong></p>
          <p><del>This text is strikethrough</del></p>
          <p><code>This is inline code</code></p>
        </section>

        <section>
          <h2>Lists</h2>
          <h3>Unordered Lists</h3>
          <pre>
* Item 1
* Item 2
  * Nested item 2.1
  * Nested item 2.2
* Item 3

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3</pre>
          <ul>
            <li>Item 1</li>
            <li>Item 2
              <ul>
                <li>Nested item 2.1</li>
                <li>Nested item 2.2</li>
              </ul>
            </li>
            <li>Item 3</li>
          </ul>

          <h3>Ordered Lists</h3>
          <pre>
1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item</pre>
          <ol>
            <li>First item</li>
            <li>Second item
              <ol>
                <li>Nested item 2.1</li>
                <li>Nested item 2.2</li>
              </ol>
            </li>
            <li>Third item</li>
          </ol>

          <h3>Task Lists</h3>
          <pre>
- [x] Completed task
- [ ] Uncompleted task
- [ ] Another task</pre>
          <ul>
            <li><input type="checkbox" checked disabled> Completed task</li>
            <li><input type="checkbox" disabled> Uncompleted task</li>
            <li><input type="checkbox" disabled> Another task</li>
          </ul>
        </section>

        <section>
          <h2>Links and Images</h2>
          <pre>
[Link text](https://example.com)
[Link with title](https://example.com "Link title")

![Alt text](image.jpg)
![Alt text with title](image.jpg "Image title")</pre>
          <p><a href="https://example.com">Link text</a></p>
          <p><a href="https://example.com" title="Link title">Link with title</a></p>
        </section>

        <section>
          <h2>Blockquotes</h2>
          <pre>
> This is a blockquote
> Multiple lines
>> Nested blockquote</pre>
          <blockquote>
            <p>This is a blockquote<br>Multiple lines</p>
            <blockquote>
              <p>Nested blockquote</p>
            </blockquote>
          </blockquote>
        </section>

        <section>
          <h2>Code Blocks</h2>
          <pre>
\`\`\`javascript
function helloWorld() {
    console.log("Hello, World!");
}
\`\`\`

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`</pre>
          <pre><code class="language-javascript">function helloWorld() {
    console.log("Hello, World!");
}</code></pre>
          <pre><code class="language-python">def hello_world():
    print("Hello, World!")</code></pre>
        </section>

        <section>
          <h2>Tables</h2>
          <pre>
| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |

Simple Tables:
Header 1 | Header 2
---------|----------
Cell 1   | Cell 2  
Cell 3   | Cell 4  </pre>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">Header 1</th>
                <th style="text-align:center">Header 2</th>
                <th style="text-align:right">Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align:left">Left</td>
                <td style="text-align:center">Center</td>
                <td style="text-align:right">Right</td>
              </tr>
              <tr>
                <td style="text-align:left">aligned</td>
                <td style="text-align:center">aligned</td>
                <td style="text-align:right">aligned</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Horizontal Rules</h2>
          <pre>
Three or more...

---
Hyphens

***
Asterisks

___
Underscores</pre>
          <hr>
          <p>Hyphens</p>
          <hr>
          <p>Asterisks</p>
          <hr>
          <p>Underscores</p>
        </section>

        <section>
          <h2>Footnotes</h2>
          <pre>
Here's a sentence with a footnote[^1].

[^1]: This is the footnote.</pre>
          <p>Here's a sentence with a footnote<sup>1</sup>.</p>
          <hr>
          <p><small><sup>1</sup> This is the footnote.</small></p>
        </section>

        <section>
          <h2>Definition Lists</h2>
          <pre>
Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b</pre>
          <dl>
            <dt>Term 1</dt>
            <dd>Definition 1</dd>
            <dt>Term 2</dt>
            <dd>Definition 2a</dd>
            <dd>Definition 2b</dd>
          </dl>
        </section>

        <section>
          <h2>Escaping Characters</h2>
          <pre>
\* Without the backslash, this would be a bullet point
\# Without the backslash, this would be a header
\[Text]: Without the backslash, this would be a link
\` Without the backslash, this would be code</pre>
          <p>* Without the backslash, this would be a bullet point</p>
          <p># Without the backslash, this would be a header</p>
          <p>[Text]: Without the backslash, this would be a link</p>
          <p>' Without the backslash, this would be code</p>
        </section>
      </div>
    </body>
    </html>`;

    return html;
};