# 🔐 Authentication Testing Guide

Complete guide to test all authentication features locally before deployment.

---

## 📋 Prerequisites

Before testing, make sure you have:

- [x] Supabase project created
- [x] Environment variables configured in `.env.local`:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```
- [x] Development server running (`npm run dev`)

---

## 🧪 Test Scenarios

### ✅ 1. User Registration

**Test Steps:**

1. Navigate to: `http://localhost:3000/register`
2. Fill in the registration form:
   - **Full Name**: John Doe
   - **Email**: test@example.com
   - **Password**: TestPassword123!
   - **Confirm Password**: TestPassword123!
3. Observe password strength indicator:
   - Should show color-coded bar (red → yellow → green)
   - Should display strength text (Weak → Fair → Good → Strong)
4. Check password confirmation:
   - Green checkmark when passwords match
   - Red alert icon when passwords don't match
5. Click "Create account"

**Expected Results:**
- ✅ Success toast: "Account created! Check your email to verify your account."
- ✅ Redirected to `/login` page
- ✅ Email sent to test@example.com (if email confirmation enabled)

**Check Supabase:**
- Go to Supabase Dashboard → Authentication → Users
- New user should appear in the list

---

### ✅ 2. User Login

**Test Steps:**

1. Navigate to: `http://localhost:3000/login`
2. Fill in login form:
   - **Email**: test@example.com
   - **Password**: TestPassword123!
3. Click "Sign in"

**Expected Results:**
- ✅ Success toast: "Welcome back!"
- ✅ Redirected to `/dashboard`
- ✅ User is authenticated

**Error Cases to Test:**
- Wrong password → Error toast: "Invalid login credentials"
- Unregistered email → Error toast: "Invalid login credentials"
- Empty fields → Browser validation message

---

### ✅ 3. Protected Routes

**Test Steps:**

1. **Without Authentication:**
   - Try to access: `http://localhost:3000/dashboard`
   - Expected: Redirected to `/login?redirectedFrom=/dashboard`

2. **With Authentication:**
   - Login first
   - Access: `http://localhost:3000/dashboard`
   - Expected: Dashboard loads successfully

3. **Auth Routes While Logged In:**
   - While logged in, try to access: `http://localhost:3000/login`
   - Expected: Redirected to `/dashboard`

**Protected Routes:**
- `/dashboard/*`
- `/calendar/*`
- `/plans/*`
- `/analytics/*`

---

### ✅ 4. Forgot Password Flow

**Test Steps:**

1. Navigate to: `http://localhost:3000/forgot-password`
2. Enter email: test@example.com
3. Click "Send reset link"

**Expected Results:**
- ✅ Success page appears with message:
  - "Check your email"
  - "We've sent a password reset link to test@example.com"
- ✅ Email sent with reset link

**Email Check:**
- Check inbox for password reset email
- Email should contain link like:
  ```
  http://localhost:3000/auth/callback?code=...&next=/reset-password
  ```

**Alternative Test (If Email Not Configured):**
- Go to Supabase Dashboard → Authentication → Users
- Click on user → "Send Password Recovery"
- Copy the recovery link from Supabase logs

---

### ✅ 5. Reset Password

**Test Steps:**

1. Click the reset link from email (or paste it in browser)
2. Should redirect to: `http://localhost:3000/reset-password`
3. Enter new password:
   - **New Password**: NewPassword456!
   - **Confirm New Password**: NewPassword456!
4. Observe password strength indicator
5. Check password match icon (green checkmark)
6. Click "Reset password"

**Expected Results:**
- ✅ Success toast: "Password updated successfully!"
- ✅ Redirected to `/login`
- ✅ Can login with new password

**Test New Password:**
- Go to `/login`
- Try old password → Should fail
- Try new password → Should succeed

---

### ✅ 6. Password Visibility Toggle

**Test All Pages:**

1. **Login Page**: Click eye icon → password should show/hide
2. **Register Page**: Click eye icon → both password fields should show/hide
3. **Reset Password Page**: Click eye icon → both fields should show/hide

---

### ✅ 7. Form Validation

**Registration Validation:**
- Password < 8 characters → Error toast
- Passwords don't match → Error toast
- Empty fields → Browser validation

**Login Validation:**
- Empty fields → Browser validation
- Invalid email format → Browser validation

**Forgot Password Validation:**
- Empty email → Browser validation
- Invalid email format → Browser validation

---

### ✅ 8. Session Persistence

**Test Steps:**

1. Login successfully
2. Refresh the page → Should stay logged in
3. Close and reopen browser → Should stay logged in (until session expires)
4. Open new tab → Navigate to `/dashboard` → Should be logged in

---

### ✅ 9. Logout (If Implemented)

**Test Steps:**

1. Login first
2. Click logout button (in navigation/header)
3. Should redirect to `/login`
4. Try accessing `/dashboard` → Should redirect to login

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid redirect URI"

**Solution:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add redirect URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/reset-password
   ```

### Issue: Email not sending

**Solution:**
- Supabase sends emails by default (check spam folder)
- For custom SMTP: Configure in Supabase → Project Settings → Auth

### Issue: "Session not found" after password reset

**Solution:**
- The reset link is single-use only
- Request a new password reset link

### Issue: Middleware redirects not working

**Solution:**
- Make sure environment variables are set
- Restart dev server after adding middleware

### Issue: User stays on login page after successful login

**Solution:**
- Check browser console for errors
- Verify `router.push('/dashboard')` is working
- Check if `/dashboard` page exists

---

## 📊 Test Checklist

Use this checklist to verify all features:

### Registration
- [ ] Can create new account with valid data
- [ ] Password strength indicator works
- [ ] Password match validation works
- [ ] Success toast appears
- [ ] Redirects to login page
- [ ] User appears in Supabase dashboard

### Login
- [ ] Can login with correct credentials
- [ ] Error shown for wrong password
- [ ] Error shown for non-existent email
- [ ] Success toast appears
- [ ] Redirects to dashboard
- [ ] Session persists on refresh

### Forgot Password
- [ ] Can request password reset
- [ ] Success message appears
- [ ] Reset email sent
- [ ] Email contains valid reset link

### Reset Password
- [ ] Reset link opens reset password page
- [ ] Password strength indicator works
- [ ] Password match validation works
- [ ] Can update password successfully
- [ ] Redirects to login
- [ ] Can login with new password
- [ ] Old password no longer works

### Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access protected routes
- [ ] Logged-in users redirected away from auth pages

### UI/UX
- [ ] Password visibility toggle works on all pages
- [ ] Loading spinners appear during submission
- [ ] Form validation messages clear
- [ ] Responsive design on mobile
- [ ] All links work correctly

---

## 🔍 Manual Testing Workflow

**Complete Test Run (15-20 minutes):**

1. **Register New User** (3 min)
   - Visit `/register`
   - Fill form with test data
   - Submit and verify success

2. **Login** (2 min)
   - Visit `/login`
   - Login with test credentials
   - Verify dashboard access

3. **Test Protected Routes** (3 min)
   - Logout (or open incognito)
   - Try accessing `/dashboard` → Should redirect
   - Login and access dashboard → Should work

4. **Password Reset** (5 min)
   - Logout
   - Visit `/forgot-password`
   - Request reset link
   - Click email link
   - Set new password
   - Login with new password

5. **Edge Cases** (5 min)
   - Try wrong password
   - Try non-existent email
   - Try mismatched passwords
   - Try weak password (< 8 chars)
   - Test all validation messages

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Review DEPLOYMENT.md** for production deployment
2. **Configure production Supabase project**
3. **Set up production environment variables in Vercel**
4. **Deploy to Vercel**
5. **Update redirect URLs in Supabase for production domain**

---

## 📝 Test Results Template

Use this template to document your test results:

```
# Authentication Test Results
Date: [DATE]
Tester: [NAME]

## Registration
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues or observations]

## Login
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues or observations]

## Forgot Password
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues or observations]

## Reset Password
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues or observations]

## Protected Routes
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any issues or observations]

## Overall Result
- ✅ All tests passed - Ready for production
- ❌ Issues found - Needs fixes

## Issues Found
1. [Issue description]
2. [Issue description]
```

---

**Happy Testing! 🎉**
