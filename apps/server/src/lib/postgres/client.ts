import type { QueryResultRow } from "pg";
import type { ExecAsyncParams, } from "./types.js";
import { dbPool } from "../../config/db.js";



export const execAsync = async <T extends QueryResultRow>({
  name,
  statement,
  params = {} 
}: ExecAsyncParams): Promise<T[]> => {

  const values: unknown[] = [];
  const paramToIndex = new Map<string, number>();

  const regex = /(?:([a-zA-Z0-9_.]+)\s*=\s*)?\$([a-zA-Z0-9_]+)/g; // match optional 'column_name =' to allow for chaining (eg. table.col) followed by '$param'
  let text = statement.replace(regex,
    (_, colName, key) => {
    if (!(key in params)) throw new Error(`Missing parameter: ${key}`);
    if (params[key] === undefined) return ''; // remove `undefined` params
    if (!paramToIndex.has(key)) {
      values.push(params[key]);
      paramToIndex.set(key, values.length);
    }
    const token = `$${paramToIndex.get(key)}`;
    return colName ? `${colName} = ${token}` : `${key} := ${token}`;
  });

  // clean up the structural damage left by removed variables
  text = text
    .replace(/,\s*(?=[,\)])/g, '')              // remove trailing/consecutive commas
    .replace(/\(\s*,/g, '(')                    // remove leading commas
    .replace(/\bWHERE\s+(AND|OR)\b/gi, 'WHERE') // `where and` -> where
    .replace(/\b(AND|OR)\s+(AND|OR)\b/gi, '$2') // `and and` -> and
    .replace(/\b(WHERE|AND|OR)\s*$/gi, '')      // remove trailing where/and/or at end of string
    .replace(/\s+/g, ' ')
    .trim();

  const result = await dbPool.query<T>({ name, text, values });
  return result.rows;
};