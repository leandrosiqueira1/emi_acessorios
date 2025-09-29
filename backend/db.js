// backend/db.js
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
});

pool.connect()
  .then(client => {
    console.log("✅ Conexão com o PostgreSQL BEM-SUCEDIDA!");
    client.release();
  })
  .catch(err => {
    // ESTE É O ERRO QUE ESTÁ CAUSANDO O 404!
    console.error("❌ ERRO FATAL: Falha ao conectar ao PostgreSQL. Verifique suas credenciais e serviço.", err.stack);
    // Você pode até encerrar a aplicação se a conexão falhar criticamente
    // process.exit(1); 
  });
// ⚠️ FIM DO TESTE DE CONEXÃO