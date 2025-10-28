# 🔑 Fix API Key Error - Quick Guide

## ❌ The Error You're Seeing

```
Error code: 401 - {'error': {'message': 'Invalid API Key', 'type': 'invalid_request_error', 'code': 'invalid_api_key'}}
```

This means your GROQ API key is not set or is invalid.

---

## ✅ How to Fix

### Step 1: Get Your GROQ API Key

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

### Step 2: Create .env File

In your `backend` directory:

```bash
cd d:\store\notify\backend

# Create .env file from example
copy .env.example .env
```

### Step 3: Add Your API Key

Open `backend/.env` in a text editor and replace:

```env
GROQ_API_KEY=your_groq_api_key_here
```

With your actual key:

```env
GROQ_API_KEY=gsk_your_actual_key_here_1234567890
```

### Step 4: Restart Backend

```bash
# Stop current backend (Ctrl+C)

# Start again
cd d:\store\notify\backend
python optimized_main.py
```

---

## ✅ Verify It Works

### Check 1: Backend Logs

You should see:
```
INFO:__main__:✅ Optimized audio processor initialized
INFO:     Uvicorn running on http://0.0.0.0:8001
```

No warnings about missing API key.

### Check 2: Test Recording

1. Refresh browser
2. Create lecture
3. Record for 60+ seconds
4. You should see structured notes appear!

### Check 3: Backend Logs During Synthesis

```
INFO:__main__:🤖 Starting agentic synthesis
INFO:__main__:📝 Structured notes generated and sent
```

No 401 errors!

---

## 🐛 Still Having Issues?

### Issue: "GROQ_API_KEY not set"

**Solution**: Make sure `.env` file is in the `backend` directory, not the root.

```
✅ Correct: d:\store\notify\backend\.env
❌ Wrong: d:\store\notify\.env
```

### Issue: "Invalid API Key" even after setting

**Solution**: 
1. Check for extra spaces in .env file
2. Make sure key starts with `gsk_`
3. Regenerate key on GROQ console
4. Restart backend after changing .env

### Issue: .env file not being read

**Solution**:
```bash
# Install python-dotenv if not installed
pip install python-dotenv

# Verify it's in requirements.txt
grep python-dotenv backend/requirements.txt
```

---

## 📝 Quick Test

Run this to verify your API key works:

```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', os.getenv('GROQ_API_KEY')[:20] + '...')"
```

Should output:
```
API Key: gsk_1234567890abcdef...
```

---

## 🎉 Once Fixed

Your system will work perfectly:

- ✅ Transcriptions every 20s
- ✅ Structured notes every 60s
- ✅ Beautiful UI with progressive feedback
- ✅ No more 401 errors!

---

**Need more help? Check the logs and share them for debugging!**
