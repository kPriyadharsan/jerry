# JERRY -  Brain 🧠

> **"Hello sir! I am Jerry, your personal AI brain. How can we optimize your day?"**

JERRY is a high-performance, real-time AI companion designed to track, mentor, and optimize your daily development and learning journey. Built with a sophisticated backend and a premium glassmorphic frontend, Jerry acts as a digital neocortex for developers striving for mastery in DSA, Aptitude, English, and Project Building.

---

## 🚀 What JERRY Does
JERRY is not just a chatbot; it's a **productivity-scoring engine**. It solves the problem of "Shadow Work" (work done without reflection) by:
- **Quantifying Progress**: Automatically calculating a daily productivity score out of 100.
- **Pattern Recognition**: Identifying drops in consistency (e.g., skipping English for 3 days).
- **Contextual Mentoring**: Jerry knows your current weaknesses, streaks, and today's status, tailoring every chat response to your specific progress.

---

## 🛠️ How it Solves Problems
### 1. The Consistency Problem
JERRY uses a **Streak & Score system**. By breaking down your goals into mandatory daily targets, it provides a clear "Pending Missions" list, ensuring you never feel lost at the start of the day.

### 2. The Overload Problem
JERRY manages its own "intelligence" via a **Gemini API Service Overhaul**. It features:
- **Key Rotation**: High availability using 3+ API keys.
- **Priority Queuing**: Ensures real-time chat is fast while background analysis is processed in parallel lanes.
- **Circuit Breakers**: Gracefully handles API rate limits (429 errors).

---

## ⚙️ Core Logic (Built Till Now)
### **The 100-Mark Scoring Model**
JERRY uses a refined weight distribution to ensure you focus on what matters most:
- **DSA (30 Marks)**: Points awarded based on `(Problems Solved / Target Problems) * 30`. Ideal for LeetCode tracking.
- **Aptitude (30 Marks)**: Calculated through a mix of concept study time and practice performance (Questions/Score).
- **English (40 Marks)**: A high-weight time-based metric focusing on fluency drills and exposure.
- **Build/Projects (Optional)**: tracked for experience but doesn't contribute to the stress of a 100% daily score.

### **Incremental Task Ingestion**
You don't have to enter everything at once. JERRY's neural pathways allow you to add "missions" bit by bit throughout the day. Added one problem? Synchronize. Added 15 mins of Dev later? Synchronize again. JERRY sums them up.

### **Memory & Pattern Module**
JERRY analyzes the last 7 days of logs to detect:
- **Weakness Detection**: Automatically tags topics where your scores are consistently low.
- **Drift Alerts**: Detects when you're drifting away from your primary goal (e.g., dropping DSA consistency).

---

## 🖱️ How To Use JERRY
1. **Initialize Intelligence**: Sign up and set your primary goals.
2. **Consult JERRY**: Use the **Chat Interface** to ask: *"What is my status for today?"* Jerry will look at your current logs and tell you exactly what's pending.
3. **Feed the Brain**: Use the **Update (Task) Panel** to ingest your accomplishments.
   - Enter comma-separated problem IDs for DSA.
   - Enter minutes spent on English/Dev.
   - Enter your scores from Aptitude practice tests.
4. **Monitor the Core**: Check the **Dashboard** for your live daily score, 7-day trends, and "Pattern Insights."

---

## 🔮 Future Add-on Features
- **Voice Ingestion**: Record audio logs specifically for English fluency assessment.
- **LeetCode Sync**: Automated problem-level ingestion via API/Webhooks.
- **Deep Memory Retrieval**: Ability for Jerry to recall technical solutions discussed weeks ago.
- **Exam Mode Overdrive**: A specialized UI mode that locks down distractions and focuses purely on high-intensity training.

---

**Current Target Configuration (`.env`):**
- `TARGET_DSA_PROBLEMS=2`
- `TARGET_ENGLISH_MINS=30`
- `TARGET_DEV_MINS=60`
- `TARGET_APPS_TOPICS=1`

*Built with ❤️ by a Senior AI Architect Mentor.*
