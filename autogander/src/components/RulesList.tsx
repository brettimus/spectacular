import type { FC } from "hono/jsx";
import type { Rule } from "../db/schema";

type RulesListProps = {
  rules: Rule[];
  title?: string;
};

export const RulesList: FC<RulesListProps> = ({ rules, title }) => {
  // Sort rules: pending first, then approved, then rejected
  // Within each status group, sort by ID in descending order
  const sortedRules = [...rules].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      pending: 0,
      approved: 1,
      rejected: 2,
    };
    const statusA = a.status || "pending";
    const statusB = b.status || "pending";

    // First sort by status
    const orderA = statusOrder[statusA] ?? 0;
    const orderB = statusOrder[statusB] ?? 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Then sort by ID in descending order (within the same status)
    return b.id - a.id;
  });

  // Get count per status
  const statusCount = sortedRules.reduce(
    (acc, rule) => {
      const status = rule.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pendingCount = statusCount.pending || 0;
  const approvedCount = statusCount.approved || 0;
  const rejectedCount = statusCount.rejected || 0;

  return (
    <div class="rules-container">
      <h1>{title || "Rules"}</h1>

      <div class="rules-stats">
        <div class="stat-item">
          <span class="stat-label">Pending:</span>
          <span class="stat-value">{pendingCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Approved:</span>
          <span class="stat-value">{approvedCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Rejected:</span>
          <span class="stat-value">{rejectedCount}</span>
        </div>
      </div>

      <div class="rules-list">
        {sortedRules.length === 0 ? (
          <p>No rules found.</p>
        ) : (
          sortedRules.map((rule) => (
            <div class="rule-card" key={rule.id}>
              <div class="rule-header">
                <h3 class="rule-title">Rule #{rule.id}</h3>
                <div class="rule-metadata">
                  <a
                    href={`/fix-events/${rule.fixEventId}`}
                    class="rule-fix-link"
                  >
                    Fix #{rule.fixEventId}
                  </a>
                  <span class="rule-date">
                    {new Date(rule.createdAt).toLocaleString()}
                  </span>
                  <span
                    class={`rule-status status-${rule.status || "pending"}`}
                  >
                    {rule.status
                      ? rule.status.charAt(0).toUpperCase() +
                        rule.status.slice(1)
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div class="rule-content">
                <div class="section">
                  <h4 class="section-title">Rule</h4>
                  <pre class="code-block">{rule.rule}</pre>
                </div>

                {rule.reasoning && (
                  <div class="section">
                    <h4 class="section-title">Reasoning</h4>
                    <pre class="code-block">{rule.reasoning}</pre>
                  </div>
                )}

                {rule.additionalData && (
                  <div class="section">
                    <h4 class="section-title">Additional Data</h4>
                    <pre class="code-block">
                      {JSON.stringify(rule.additionalData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {(!rule.status || rule.status === "pending") && (
                <div class="rule-actions">
                  <form
                    method="post"
                    action={`/api/rules/${rule.id}/review`}
                    class="review-form"
                  >
                    <input
                      type="hidden"
                      name="returnUrl"
                      value={
                        title?.toLowerCase().includes("pending")
                          ? "/rules/pending"
                          : "/rules"
                      }
                    />
                    <div class="button-group">
                      <button
                        type="submit"
                        name="action"
                        value="approve"
                        class="btn btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="reject"
                        class="btn btn-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .rules-list {
          display: grid;
          gap: 1rem;
        }
        
        .rule-card {
          border-radius: 0.375rem;
          border: 1px solid var(--border-color);
          padding: 1rem;
          background-color: var(--card-background);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .rule-header {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .rule-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
        
        .rule-title {
          font-size: 1rem;
          margin: 0;
          color: var(--primary-color);
        }
        
        .rule-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .rule-metadata {
            margin-top: 0;
          }
        }
        
        .rule-fix-link {
          color: var(--primary-color);
          text-decoration: none;
          background-color: var(--secondary-color);
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
          font-weight: 500;
        }
        
        .rule-date {
          color: #6b7280;
        }
        
        .rule-status {
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
          font-weight: 500;
        }
        
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-approved {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-rejected {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .section {
          margin-bottom: 1rem;
        }
        
        .section-title {
          font-size: 0.875rem;
          margin: 0 0 0.5rem 0;
          color: #4b5563;
        }
        
        .code-block {
          font-size: 0.75rem;
          background-color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          white-space: pre-wrap;
          margin: 0;
        }
        
        .rule-actions {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        
        .button-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn {
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        
        .btn-approve {
          background-color: #059669;
          color: white;
        }
        
        .btn-reject {
          background-color: #dc2626;
          color: white;
        }
        
        .rules-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .stat-label {
          color: #6b7280;
        }
        
        .stat-value {
          font-weight: 600;
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
};
