import type { QueryResultRow } from "pg";
import type { ExecAsyncParams, } from "./types.js";
import { dbPool } from "../../config/db.js";



/**
 * @note Gemini did this
 */
export const execAsync = async <T extends QueryResultRow>({
  name,
  statement,
  params = {} 
}: ExecAsyncParams): Promise<T[]> => {

  const values: unknown[] = [];
  const paramToIndex = new Map<string, number>();
  let text = statement;

  // Case 3: Specialized handling for INSERT statements to align columns and values
  if (/^\s*insert\s+into/i.test(statement)) {
    const insertRegex = /insert\s+into\s+([a-zA-Z0-9_.]+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i;
    const match = statement.match(insertRegex);
    
    if (match) {
      const [fullMatch, tableName, colsStr, valsStr] = match;
      const cols = colsStr.split(',').map(s => s.trim());
      const vals = valsStr.split(',').map(s => s.trim());

      const activeCols: string[] = [];
      const activeVals: string[] = [];

      for (let i = 0; i < vals.length; i++) {
        const valToken = vals[i];
        
        if (valToken.startsWith('$')) {
          const key = valToken.slice(1);
          if (!(key in params)) throw new Error(`Missing parameter: ${key}`);
          
          // The Kill Switch: drop BOTH the column and value completely if undefined
          if (params[key] === undefined) continue;

          if (!paramToIndex.has(key)) {
            values.push(params[key]);
            paramToIndex.set(key, values.length);
          }
          activeCols.push(cols[i]);
          activeVals.push(`$${paramToIndex.get(key)}`);
        } else {
          // Safe fallback for raw literals or DEFAULT keywords
          activeCols.push(cols[i]);
          activeVals.push(valToken);
        }
      }

      const reconstructedInsert = `insert into ${tableName} (\n        ${activeCols.join(', ')}\n      ) values (\n        ${activeVals.join(', ')}\n      )`;
      text = statement.replace(fullMatch, reconstructedInsert);
    }
  }

  // Case 1 & 2: General parser for Functions and WHERE Equalities
  // Refined to ignore purely positional tokens like $1, $2
  const generalRegex = /(?:([a-zA-Z0-9_.]+)\s*=\s*)?\$([a-zA-Z_][a-zA-Z0-9_]*)/g; 
  text = text.replace(generalRegex, (_, colName, key) => {
    if (!(key in params)) throw new Error(`Missing parameter: ${key}`);
    if (params[key] === undefined) return ''; // Kill Switch: remove undefined params completely

    if (!paramToIndex.has(key)) {
      values.push(params[key]);
      paramToIndex.set(key, values.length);
    }
    const token = `$${paramToIndex.get(key)}`;
    return colName ? `${colName} = ${token}` : `${key} := ${token}`;
  });

  // structural cleanup pass for grammatical shrapnel
  text = text
    .replace(/,\s*(?=[,\)])/g, '')              // remove trailing/consecutive commas
    .replace(/\(\s*,/g, '(')                    // remove leading commas
    .replace(/\bWHERE\s+(AND|OR)\b/gi, 'WHERE') // `where and` -> `where`
    .replace(/\b(AND|OR)\s+(AND|OR)\b/gi, '$2') // `and and` -> `and`
    .replace(/\b(WHERE|AND|OR)\s*$/gi, '')      // remove trailing where/and/or at end of string
    .replace(/\s+/g, ' ')
    .trim();

  const result = await dbPool.query<T>({ name, text, values });
  return result.rows;
};