
Khadija Frontend Dashboard (starter)
-----------------------------------

Location: /mnt/data/khadija_frontend_dashboard

How to run locally:
1. unzip into your project folder (or keep as is in this zip extraction).
2. open terminal in the folder and run:
   npm install
   npm run dev
3. Open http://localhost:5173

Notes:
- Theme: black background, golden highlights.
- Navbar has dropdowns and placeholder pages for Sales, Purchase, Master and Reports.
- .env is included with your Supabase and backend values. Do NOT commit the .env to public repos.
- Dashboard includes a small Supabase connection test (will attempt to read 'items' table). If the table doesn't exist you'll see a message but connection is tested.
