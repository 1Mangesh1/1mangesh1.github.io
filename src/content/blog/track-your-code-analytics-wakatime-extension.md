---
title: "Track Your Code Analytics with WakaTime"
description: "Learn how to set up and use WakaTime to automatically track your coding time and productivity across different editors and projects."
pubDate: 2025-07-14T00:00:00Z
tags: ["WakaTime", "Productivity", "Analytics"]
---

WakaTime is an automatic time tracking tool for programmers. It runs in the background while you code and provides detailed analytics about your coding habits, languages used, and project time allocation.

## Step 1: Create a WakaTime account and get your API key

Visit [wakatime.com](https://wakatime.com/) and sign up for a free account. Once logged in, go to your [settings page](https://wakatime.com/settings/account) to find your secret API key.

```bash
# Your API key will look like this:
waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Step 2: Install the WakaTime extension for your editor

For **VS Code**:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "WakaTime"
4. Install the official WakaTime extension

For **other editors**, WakaTime supports 100+ editors including:
- IntelliJ IDEA, PyCharm, WebStorm
- Sublime Text, Atom, Vim
- Xcode, Android Studio
- And many more

## Step 3: Configure the extension with your API key

After installing, the extension will prompt you for your API key. Paste the key you copied from step 1.

```bash
# VS Code Command Palette (Ctrl+Shift+P)
> WakaTime: API Key
# Enter your API key when prompted
```

## Step 4: Start coding and view your analytics

WakaTime automatically tracks your coding time in the background. After coding for a while, visit your [WakaTime dashboard](https://wakatime.com/dashboard) to see:

- **Daily coding time** with detailed breakdowns
- **Programming languages** usage statistics  
- **Projects and files** you've worked on
- **Code editors** and operating systems used
- **Weekly reports** and productivity trends

```javascript
// Example dashboard data you'll see:
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
# WakaTime Dashboard Examples

[![WakaTime Dashboard Example](/images/blogs/wakatime/dashboard1.png)](/images/blogs/wakatime/dashboard1.png)

[![WakaTime Dashboard Example](/images/blogs/wakatime/dashboard2.png)](/images/blogs/wakatime/dashboard2.png)


## Pro Tips

**Set coding goals**: Use WakaTime's goal feature to set daily/weekly coding targets and track your progress.

**Privacy settings**: Configure which projects are private or public in your settings.

**Team dashboards**: For organizations, WakaTime offers team dashboards to track collective productivity.

That's it! WakaTime will now automatically track your coding activity and provide valuable insights into your programming habits. I hope you found this post helpful. If you have any questions or feedback, feel free to dm me on [X](https://x.com/Mangesh_Bide) or mail me at [gmail](mailto:mangeshsbide@gmail.com).