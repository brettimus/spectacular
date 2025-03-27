import type { FC } from 'hono/jsx';
import type { Fix } from '../db/schema';

type FixesListProps = {
  fixes: Fix[];
  total: number;
  page: number;
  pageSize: number;
};

export const FixesList: FC<FixesListProps> = ({ fixes, total, page, pageSize }) => {
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div class="fixes-container">
      <h1>Autogander Fixes</h1>
      
      <div class="pagination">
        <p>
          Showing page {page} of {totalPages} ({total} total fixes)
        </p>
        <div class="pagination-controls">
          {page > 1 && <a href={`?page=${page - 1}&pageSize=${pageSize}`}>Previous</a>}
          {page < totalPages && <a href={`?page=${page + 1}&pageSize=${pageSize}`}>Next</a>}
        </div>
      </div>
      
      <div class="fixes-list">
        {fixes.length === 0 ? (
          <p>No fixes found.</p>
        ) : (
          fixes.map((fix) => (
            <div class="fix-card" key={fix.id}>
              <div class="fix-header">
                <h3>Fix #{fix.id}</h3>
                <span class="fix-type">{fix.type}</span>
                <span class="fix-date">{new Date(fix.createdAt).toLocaleString()}</span>
              </div>
              
              <div class="fix-content">
                <div class="section">
                  <h4>Analysis</h4>
                  <pre>{fix.analysis}</pre>
                </div>
                
                <div class="code-columns">
                  <div class="code-column">
                    <h4>Original Code</h4>
                    <pre>{fix.originalCode}</pre>
                  </div>
                  <div class="code-column">
                    <h4>Fixed Code</h4>
                    <pre>{fix.fixedCode || "No fix provided"}</pre>
                  </div>
                </div>
                
                <div class="section">
                  <h4>Errors</h4>
                  <pre>{JSON.stringify(fix.errors, null, 2)}</pre>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 