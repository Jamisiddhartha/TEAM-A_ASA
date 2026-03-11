# Team Database Access (Docker + PostgreSQL)

## 1) Start services on the host machine
```powershell
cd C:\Users\VICTUS\TEAM-A_ASA\backend
docker compose up -d
```

## 2) Connection details for teammates
Use these values in pgAdmin / DBeaver / psql:

- Host: `localhost` (same machine) or `<HOST_MACHINE_IP>` (remote machine)
- Port: `5433`
- Database: `asadb`
- Username: `postgres`
- Password: value from host machine `backend/.env`

## 3) Remote access (different machine on same network)
- Use host machine LAN IP (for example `192.168.x.x`)
- Allow inbound TCP `5433` in Windows Firewall on host machine
- Keep Docker Desktop and containers running

## 4) Backend app config for teammates
Each teammate should create `backend/.env` from `backend/.env.example` and set:

```env
DB_HOST=<HOST_MACHINE_IP>
DB_PORT=5433
DB_NAME=asadb
DB_USER=postgres
DB_PASSWORD=<TEAM_DB_PASSWORD>
```

## 5) Quick test command
```bash
psql -h <HOST_MACHINE_IP> -p 5433 -U postgres -d asadb
```

## 6) Security note
- Do not commit real credentials.
- Rotate DB and SMTP passwords if they were shared publicly.
