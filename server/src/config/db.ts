import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const createPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host:              process.env.MYSQL_HOST     || 'localhost',
      port:              parseInt(process.env.MYSQL_PORT || '3306'),
      user:              process.env.MYSQL_USER     || 'root',
      password:          process.env.MYSQL_PASSWORD || '123456',
      database:          process.env.MYSQL_DATABASE || 'adaah_jewels_v2',
      waitForConnections: true,
      connectionLimit:   parseInt(process.env.DB_POOL_SIZE || '10'),
      queueLimit:        0,
      enableKeepAlive:   true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
};

export const getPool = (): mysql.Pool => {
  if (!pool) return createPool();
  return pool;
};

/** Run a raw SQL query */
export const executeQuery = async <T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> => {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows as T[];
};

/** Call a stored procedure — returns first result set */
export const callProcedure = async <T = any>(
  name: string,
  params: any[] = []
): Promise<T[]> => {
  const p = getPool();
  const placeholders = params.map(() => '?').join(',');
  const sql = `CALL ${name}(${placeholders})`;
  const [rows] = await p.execute(sql, params) as any;
  // mysql2 returns [[resultSet], OkPacket] for procedures
  return Array.isArray(rows[0]) ? rows[0] : rows;
};

/** Get a raw connection for transactions */
export const getConnection = (): Promise<mysql.PoolConnection> =>
  getPool().getConnection();

export const connectDB = async (): Promise<void> => {
  try {
    const p = createPool();
    // Smoke-test the connection
    await p.execute('SELECT 1');
    console.log('✨ MySQL Connected:', process.env.MYSQL_HOST || 'localhost');

    // OTP cleanup every 5 minutes
    setInterval(async () => {
      try { await p.execute('CALL sp_cleanup_expired_otps()'); }
      catch (e) { console.error('OTP cleanup failed:', e); }
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    process.exit(1);
  }
};

export const closePool = async (): Promise<void> => {
  if (pool) { await pool.end(); pool = null; }
};
