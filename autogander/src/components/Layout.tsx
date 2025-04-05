import type { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - Autogander</title>
        <style>{`
          :root {
            --primary-color: #4f46e5;
            --secondary-color: #a5b4fc;
            --background-color: #f9fafb;
            --card-background: #ffffff;
            --text-color: #111827;
            --border-color: #e5e7eb;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
          }
          
          header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          
          header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          nav a {
            color: white;
            margin-left: 1rem;
            text-decoration: none;
          }
          
          nav a:hover {
            text-decoration: underline;
          }
          
          h1 {
            margin-top: 0;
            font-size: 1.5rem;
          }
          
          .fixes-container, .rules-container {
            margin-bottom: 2rem;
          }
          
          .fix-card, .rule-card {
            background-color: var(--card-background);
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          
          .fix-header, .rule-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
          }
          
          .fix-type, .rule-fix-id {
            background-color: var(--secondary-color);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
          
          .fix-date, .rule-date {
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .section {
            margin-bottom: 1rem;
          }
          
          .code-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          pre {
            background-color: #f3f4f6;
            padding: 0.75rem;
            border-radius: 0.25rem;
            overflow-x: auto;
            font-size: 0.875rem;
            white-space: pre-wrap;
          }
          
          .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .pagination-controls a {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            text-decoration: none;
            margin-left: 0.5rem;
          }
          
          .pagination-controls a:hover {
            opacity: 0.9;
          }
        `}</style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Autogander</h1>
            <nav>
              <a href="/">Fixes</a>
              <a href="/rules">Rules</a>
            </nav>
          </div>
        </header>

        <main class="container">
          {title.includes("Rules") && (
            <div class="rules-subnav">
              <nav class="subnav">
                <a href="/rules" class={title === "All Rules" ? "active" : ""}>
                  All
                </a>
                <a
                  href="/rules/pending"
                  class={title === "Pending Rules" ? "active" : ""}
                >
                  Pending
                </a>
                <a
                  href="/rules/approved"
                  class={title === "Approved Rules" ? "active" : ""}
                >
                  Approved
                </a>
                <a
                  href="/rules/rejected"
                  class={title === "Rejected Rules" ? "active" : ""}
                >
                  Rejected
                </a>
              </nav>
            </div>
          )}
          {children}
        </main>

        <style>{`
          .rules-subnav {
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
          }
          
          .subnav {
            display: flex;
            gap: 1rem;
            padding-bottom: 0.5rem;
          }
          
          .subnav a {
            color: var(--text-color);
            text-decoration: none;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
          
          .subnav a:hover {
            background-color: #f3f4f6;
          }
          
          .subnav a.active {
            color: var(--primary-color);
            font-weight: 500;
            border-bottom: 2px solid var(--primary-color);
          }
        `}</style>
      </body>
    </html>
  );
};
