# Test Credentials — CareBridge AI (demo, client-side auth)

Auth is simulated/local (no real backend auth). State persists in browser localStorage.

## Hospital login (/hospital/login)
- Email: admin@apollocare.in (prefilled) — any valid email works
- Password: carebridge (prefilled) — any 6+ char password works
- Role: pick Admin / Doctor / Care Coordinator / Nurse (controls sidebar access)
- OTP (demo): 123456

## Patient login (/patient/login)
- Mobile: 9876500001 (prefilled) — any 10-digit number works
- OTP (demo): 123456
- Demo signs you in as the first seeded patient: Rahul Sharma (id: rahul)

## Patient detail deep links (hospital side)
- /hospital/patient/rahul (and other first-name ids: priya, amit, kavya, ...)
