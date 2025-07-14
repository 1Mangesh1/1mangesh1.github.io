---
title: "Track Your Code Analytics with WakaTime"
description: "Learn how to set up and use WakaTime to automatically track your coding time and productivity across different editors and projects."
pubDate: 2025-07-14T00:00:00Z
tags: ["WakaTime", "Productivity", "Analytics"]
---

Ever wondered how much time you actually spend coding each day—or which languages and projects take up most of your time? That’s where **WakaTime** comes in. It’s an automatic time-tracking tool built specifically for developers. WakaTime runs quietly in the background and gives you clear, visual insights into how you write code.

Whether you're a hobbyist or a full-time engineer, tracking your development habits helps you improve productivity, identify burnout early, and stay consistent.

---

## 🧠 Why Track Your Coding Time?

* 🔄 **Measure your progress** – Know how consistent you are day-to-day or week-to-week.
* 🧠 **Understand your focus** – See which projects and languages you're investing most time in.
* ⏳ **Avoid burnout** – Spot days where you’re overworking or under-working.
* 🎯 **Stay accountable** – Track progress toward learning goals or freelance commitments.

---

## 🚀 Step 1: Sign Up and Get Your API Key

Start by creating a free account at [wakatime.com](https://wakatime.com/). Once you're in:

1. Visit your [account settings](https://wakatime.com/settings/account)
2. Copy your **secret API key**

```bash
# It will look like this:
waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 💻 Step 2: Install the WakaTime Plugin in Your Editor

WakaTime supports over 100 editors! Here's how to install it on popular ones:

### For **VS Code**:

1. Open VS Code
2. Go to Extensions (Ctrl + Shift + X)
3. Search for “WakaTime”
4. Install the **official** WakaTime extension

### Other supported editors:

* IntelliJ IDEA, PyCharm, WebStorm
* Sublime Text, Atom, Vim, Neovim
* Android Studio, Xcode
* Emacs, Eclipse, NetBeans, and more

Full list: [wakatime.com/plugins](https://wakatime.com/plugins)

---

## 🔐 Step 3: Add Your API Key

Once installed, your editor will prompt you to enter your API key.

```bash
# In VS Code, press:
Ctrl + Shift + P → "WakaTime: API Key"
# Paste your key and hit Enter
```

WakaTime will now start logging your coding time automatically.

---

## 📊 Step 4: Start Coding and Check Your Analytics

As you work, WakaTime records your activity in real time. Head to your [WakaTime dashboard](https://wakatime.com/dashboard) to explore:

* ⏱️ **Daily coding time** breakdowns
* 🧪 **Languages used** with percentage stats
* 🗂️ **Project-level insights** by file/folder
* 🖥️ **Editor and OS tracking**
* 📈 **Weekly productivity trends** and historical graphs

```json
// Sample Dashboard Overview
{
  "today": "2h 34m",
  "languages": {
    "JavaScript": "45%",
    "Python": "30%", 
    "TypeScript": "25%"
  },
  "projects": {
    "my-website": "1h 20m",
    "api-server": "1h 14m"
  }
}
```

---

## 🎯 Set Goals & Stay on Track

WakaTime also lets you set **coding goals**—like spending 1 hour/day coding or hitting 10 hours/week on a project.

### How to Set a Goal:

1. Visit [wakatime.com/goals](https://wakatime.com/goals)
2. Choose your time window and target
3. Track your streaks and celebrate small wins 🥳

It's a great way to build habits, stay consistent, or even prepare for hackathons and job interviews.

---

## 📸 WakaTime Dashboard Preview

![WakaTime Dashboard 1](/images/blogs/wakatime/dashboard1.png)
*Overview of daily coding stats*

![WakaTime Dashboard 2](/images/blogs/wakatime/dashboard2.png)
*Project and language insights*

---

## 🔐 Bonus Tips

* **Control privacy**: Mark sensitive projects as private
* **Team dashboards**: Collaborate and track productivity with teammates
* **Export data**: Download reports as CSV for offline tracking or journaling

---

## ✅ Final Thoughts

WakaTime gives you the power of data—without interrupting your workflow. Once set up, it’s fully automatic and helps you understand your programming habits better over time.
If you’ve ever wondered where your time goes, WakaTime has the answer.

Feel free to DM me on [X](https://x.com/Mangesh_Bide) or email me at [mangeshsbide@gmail.com](mailto:mangeshsbide@gmail.com) if you have questions or want help setting it up!

Thanks to my colleague for suggesting this tool!
Happy coding! 🚀

---