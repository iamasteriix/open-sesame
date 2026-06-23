import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { dbPool } from "../../config/db.js";
import { logger } from "../../config/logger.js";


/**
 * (Supposed to) Find all orphaned stored procedures and log them for dropping before loading and
 * executing all existing all functions defined in `db/functions/`.
 * 
 * @note Renaming or deleting a sql file from `db/functions/` leaves it dangling in postgres since it is a stored procedure.
 * @see [This issue](https://github.com/iamasteriix/open-sesame/issues/13) documents how we fix it.
 * @todo Fix it!
 * 
 * @returns {Promise<void>}
 * @throws {Error} If file read or database query fails.
 */
export const onLoadDbFunctions = async (): Promise<void> => {
  const dbFnDir = resolve('db/functions/');
  const allFiles = await readdir(dbFnDir);
  const sqlFiles = allFiles.filter(file => file.endsWith('.sql'));

  for (const file of sqlFiles) {
    const sql = await readFile(join(dbFnDir, file), 'utf-8');
    await dbPool.query(sql);
  }

  logger.info('Loaded DB functions');
}