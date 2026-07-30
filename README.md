# GradConnect Live

A deployable multi-user graduation event application.

## Features
- Anonymous guest authentication
- Shared RSVPs
- Real-time guest chat
- Live congratulatory feed and host announcements
- Shared cloud photo gallery
- Guest service requests with live status
- Administrator dashboard
- Mobile-responsive design

## 1. Create the Supabase project
1. Create a project at Supabase.
2. In **Authentication > Providers**, enable **Anonymous Sign-Ins**.
3. Open **SQL Editor**, paste the contents of `supabase-schema.sql`, and run it.
4. In **Project Settings > API**, copy:
   - Project URL
   - Public anon/publishable key

## 2. Configure the web app
Open `config.js` and replace:
- `YOUR_SUPABASE_PROJECT_URL`
- `YOUR_SUPABASE_ANON_KEY`

Do not place a Supabase service-role key in this file.

## 3. Make yourself administrator
1. Deploy/open the app and enter your name once.
2. In Supabase, open **Table Editor > profiles**.
3. Find your profile and change `is_admin` to `true`.
4. Refresh the site.

## 4. Deploy
### Netlify
Drag the complete folder into Netlify's manual deployment area, or upload it through a Git repository.

### Vercel
Import the folder/repository as a static project.

## 5. Custom domain
After deployment, add the domain in the hosting platform's domain settings and follow its DNS instructions.

## Privacy note
This package uses anonymous accounts to make entry easy for guests. Before commercial use, add:
- Invitation-code validation
- Formal privacy notice and consent
- Content reporting/moderation
- Image retention and deletion rules
- Rate limiting and anti-spam controls
- Backups and operational monitoring

## Event details included
- Joseph Mugambi
- Master's in Data Science and Analytics
- Saturday, 15 August 2026
- 2:00 PM
- Nairobi Club
