# Activity Tracking System - User Guide

## Overview

The Activity Tracking System provides you with complete visibility into your account activities, security events, and system interactions. This guide will help you understand and effectively use the activity dashboard to monitor your account security and usage patterns.

## Accessing the Activity Dashboard

### Navigation

1. **Log into your account** and navigate to your profile
2. **Click on "Settings"** or your profile avatar
3. **Select "Activity Log"** from the menu
4. The activity dashboard will load with your recent activities

### Direct URL Access

- URL: `/profile/activity`
- The activity dashboard is accessible from any device where you're logged in

## Dashboard Overview

<!-- TODO: Add dashboard overview image -->
<!-- ![Activity Dashboard Overview](./images/activity-dashboard-overview.png) -->

### Main Sections

#### 1. Activity Statistics (Top Section)

- **Total Activities**: Your lifetime activity count
- **Recent Activity**: Activities from today, this week, and this month
- **Activity Breakdown**: Chart showing distribution by activity type
- **Security Summary**: Warning and error activities requiring attention

#### 2. Filter Panel

- **Search Box**: Search activity descriptions
- **Action Filter**: Filter by specific activity types
- **Severity Filter**: Filter by info, warning, error, or critical
- **Date Range**: Select custom date ranges for activities

#### 3. Activity Table

- **Timestamp**: When the activity occurred
- **Action**: What type of activity happened
- **Description**: Detailed description of the activity
- **Severity**: Importance level of the activity
- **Device/IP**: Device and location information
- **Session**: Session identifier for correlation

## Understanding Your Activities

### Activity Types and What They Mean

#### 🔐 Authentication Activities

- **Login**: You successfully logged into your account
- **Logout**: You logged out of your account
- **Login Failed**: Someone attempted to log in with your credentials (unsuccessful)
- **Password Reset**: You requested or completed a password reset

#### 👤 Profile Activities

- **Profile View**: You accessed your profile page
- **Profile Update**: You changed your profile information
- **Password Change**: You changed your password
- **Avatar Upload**: You uploaded a new profile picture

#### ⚙️ Preferences Activities

- **Preferences Update**: You changed your account preferences
- **Theme Change**: You switched between light/dark themes
- **Language Change**: You changed your language preference

#### 🛡️ Security Activities

- **Session Created**: A new login session was established
- **Session Destroyed**: A session was terminated
- **Suspicious Activity**: The system detected unusual behavior
- **Account Locked/Unlocked**: Your account was locked or unlocked for security

### Severity Levels

#### 🔵 Info (Blue)

- Normal activities like profile views, theme changes
- Regular system operations
- No action required

#### 🟡 Warning (Yellow)

- Important security events like password changes
- Failed login attempts
- May require attention

#### 🔴 Error (Red)

- API errors or system failures
- Validation problems
- Should be investigated

#### ⚫ Critical (Black)

- Suspicious activity detection
- Security breaches
- Requires immediate attention

## Using the Activity Dashboard

### Viewing Recent Activities

By default, the dashboard shows your 20 most recent activities. You can:

1. **Scroll through the list** to see older activities
2. **Use pagination** at the bottom to navigate between pages
3. **Change page size** (10, 20, 50, or 100 activities per page)

### Searching Activities

#### Text Search

1. **Type in the search box** at the top of the filters panel
2. **Search terms** will match activity descriptions
3. **Results update automatically** as you type

Example searches:

- "login" - Find all login-related activities
- "password" - Find password-related events
- "profile" - Find profile management activities

#### Filtering by Activity Type

1. **Click the "Action" dropdown** in the filters panel
2. **Select specific activity types** you want to see
3. **Multiple selections** are supported

Common filters:

- Show only login/logout activities
- View only security events
- Filter profile-related activities

#### Filtering by Severity

1. **Click the "Severity" dropdown** in the filters panel
2. **Select severity levels** you want to view
3. **Use this to focus on important events**

Recommended filters:

- **Critical & Error**: Focus on security issues
- **Warning**: Review important security events
- **Info**: See general account usage

#### Date Range Filtering

1. **Click "From Date" and "To Date"** in the filters panel
2. **Select start and end dates** for your search
3. **View activities within specific time periods**

Use cases:

- Review activities from a specific day
- Check for suspicious activity during vacation
- Analyze usage patterns over time

### Understanding Device and Location Information

#### Device Information

- **Browser**: Chrome, Firefox, Safari, Edge
- **Operating System**: Windows, macOS, Linux, iOS, Android
- **Device Type**: Desktop, Mobile, Tablet

#### IP Address Information

- **Your current IP** is shown for recent activities
- **Different IPs** may indicate access from different locations
- **Unusual IPs** could indicate unauthorized access

#### Session Correlation

- **Session IDs** help track related activities
- **Same session ID** means activities happened during the same login session
- **Different session IDs** indicate separate login sessions

## Security Monitoring

### What to Look For

#### 🚨 Suspicious Login Activity

- **Failed login attempts** you didn't make
- **Successful logins** from unfamiliar locations
- **Logins at unusual times** (middle of the night, etc.)
- **Multiple failed attempts** followed by successful login

#### 🚨 Unauthorized Changes

- **Profile updates** you didn't make
- **Password changes** you didn't initiate
- **Preference changes** that happened without your knowledge

#### 🚨 Unusual Device Activity

- **New devices** you don't recognize
- **Login from multiple devices** simultaneously
- **Activities from locations** you haven't been to

### Recommended Security Practices

#### Regular Monitoring

1. **Check your activity log weekly** for unusual events
2. **Review failed login attempts** regularly
3. **Monitor for new devices** accessing your account

#### Immediate Action Required

If you see suspicious activity:

1. **Change your password immediately**
2. **Log out of all sessions** (if available)
3. **Contact support** if you suspect account compromise
4. **Enable two-factor authentication** if not already enabled

#### Alert Notifications

- **Critical activities** may trigger email notifications
- **Check your email** for security alerts
- **Don't ignore security notifications**

## Auto-Refresh and Real-Time Updates

### Auto-Refresh Feature

1. **Click the sync button** in the top-right corner
2. **Toggle auto-refresh on/off** as needed
3. **Activities update every 30 seconds** when enabled

### Manual Refresh

- **Click the "Refresh" button** to update activities manually
- **Use when you expect new activities** to appear
- **Helpful after performing actions** in other tabs/windows

## Privacy and Data Retention

### What Information is Collected

- **Activity type and description** - What you did
- **Timestamp** - When you did it
- **Device information** - What device you used
- **IP address** - Where you accessed from (general location)
- **Session information** - Which login session

### What Information is NOT Collected

- **Exact GPS location** - Only general IP-based location
- **Personal conversations** - No chat or message content
- **File contents** - Only that files were uploaded/downloaded
- **Detailed browsing** - Only activities within our application

### Data Retention

- **Activity logs are kept for 2 years** for security purposes
- **Older activities are automatically deleted**
- **You can request data deletion** by contacting support

## Troubleshooting

### Common Issues

#### Activities Not Showing

1. **Check your internet connection**
2. **Refresh the page** or browser
3. **Clear your browser cache** if issues persist
4. **Try a different browser** to isolate the issue

#### Filtering Not Working

1. **Clear all filters** and try again
2. **Check date ranges** - ensure they're logical
3. **Refresh the page** to reset filters

#### Performance Issues

1. **Reduce the page size** to load fewer activities
2. **Use specific date ranges** instead of loading all activities
3. **Close other browser tabs** to free up memory

### Getting Help

If you need assistance:

1. **Check this user guide** for common questions
2. **Review the FAQ section** below
3. **Contact support** through the help desk
4. **Include screenshots** when reporting issues

## Frequently Asked Questions

### General Questions

**Q: Why can't I see activities from more than 2 years ago?**
A: Activity logs are automatically deleted after 2 years for privacy and performance reasons.

**Q: Can I download my activity history?**
A: Currently, activity history can be viewed in the dashboard. Export functionality may be added in the future.

**Q: Why do I see activities I don't remember doing?**
A: Many activities are logged automatically (like profile views). If you see unfamiliar activities, review the timestamp and device information.

### Security Questions

**Q: I see failed login attempts. Is my account compromised?**
A: Failed login attempts are common and usually not a concern. However, monitor for patterns and change your password if you're concerned.

**Q: Someone accessed my account from a different location. What should I do?**
A: If you didn't authorize this access, immediately change your password, log out all sessions, and contact support.

**Q: What does "suspicious activity" mean?**
A: This indicates the system detected unusual behavior patterns, such as rapid password changes, unusual access patterns, or other security indicators.

### Technical Questions

**Q: Why don't I see real-time updates?**
A: Enable auto-refresh for updates every 30 seconds, or manually refresh to see the latest activities.

**Q: Can I control what activities are logged?**
A: Activity logging is automatic for security purposes. You cannot disable logging, but you can control who sees the information.

**Q: How accurate is the location information?**
A: Location is estimated based on your IP address and may not be precisely accurate, especially if you're using a VPN.

## Tips for Effective Monitoring

### Daily Habits

1. **Quick daily check** - Glance at recent activities
2. **Review security events** - Check warnings and errors
3. **Monitor new devices** - Be aware of new device access

### Weekly Reviews

1. **Comprehensive activity review** - Look at the past week's activities
2. **Pattern analysis** - Look for unusual timing or frequency
3. **Security assessment** - Review any warnings or errors

### Monthly Maintenance

1. **Full security review** - Check for any missed suspicious activities
2. **Update security settings** - Review and update passwords if needed
3. **Device audit** - Review which devices have accessed your account

---

By regularly monitoring your activity log, you can maintain better security awareness and quickly identify any potential issues with your account. Remember, proactive monitoring is key to maintaining account security.
