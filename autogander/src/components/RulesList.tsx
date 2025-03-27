import type { FC } from 'hono/jsx';
import type { Rule } from '../db/schema';

type RulesListProps = {
  rules: Rule[];
};

export const RulesList: FC<RulesListProps> = ({ rules }) => {
  return (
    <div class="rules-container">
      <h1>Rules</h1>
      
      <div class="rules-list">
        {rules.length === 0 ? (
          <p>No rules found.</p>
        ) : (
          rules.map((rule) => (
            <div class="rule-card" key={rule.id}>
              <div class="rule-header">
                <h3>Rule #{rule.id}</h3>
                <span class="rule-fix-id">Fix Event ID: {rule.fixEventId}</span>
                <span class="rule-date">{new Date(rule.createdAt).toLocaleString()}</span>
              </div>
              
              <div class="rule-content">
                <div class="section">
                  <h4>Rule</h4>
                  <pre>{rule.rule}</pre>
                </div>
                
                {rule.reasoning && (
                  <div class="section">
                    <h4>Reasoning</h4>
                    <pre>{rule.reasoning}</pre>
                  </div>
                )}
                
                {rule.additionalData && (
                  <div class="section">
                    <h4>Additional Data</h4>
                    <pre>{JSON.stringify(rule.additionalData, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 