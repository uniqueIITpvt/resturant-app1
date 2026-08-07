# Email Notification System for Unique Café

This document explains how to set up and use the email notification system for sending event and offer emails to users.

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```
# EMAIL CONFIG
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com  
EMAIL_PASSWORD=your-email-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Unique Café
```

Notes:
- For Gmail, you need to use an "App Password" (not your regular password)
- To generate an App Password:
  1. Go to your Google Account settings
  2. Enable 2-Step Verification
  3. Go to Security > App passwords > Create a new app password

### 2. Sending Emails

#### Automatic Email Notifications

When creating a new event/offer through the admin dashboard, you'll see options to:
- Send email notifications immediately to all users
- Send a test email to verify appearance

#### Manual Email Operations

The system supports the following email operations:

**Send an offer email to a specific user:**
```
POST /api/email/send-event-offer/:userId/:eventOfferId
```

**Broadcast an offer email to all users:**
```
POST /api/email/broadcast-event-offer/:eventOfferId
```
You can include `testEmail` in the request body to send a test email first.

**Send a welcome email to a user:**
```
POST /api/email/welcome/:userId
```

**Send a custom email to a user:**
```
POST /api/email/custom/:userId
```
Request body:
```json
{
  "subject": "Your Email Subject",
  "message": "Your email message goes here"
}
```

**Send a custom email to multiple users:**
```
POST /api/email/bulk-custom
```
Request body:
```json
{
  "userIds": ["id1", "id2", "id3"],
  "subject": "Your Email Subject",
  "message": "Your email message"
}
```

## Email Templates

All emails use responsive HTML templates with the Unique Café branding. 

The available templates are:
- Event/Offer Email - Automatically populated with offer details
- Welcome Email - Sent to new users
- Custom Email - For any custom messages

## Troubleshooting

If emails aren't being sent:

1. Check your `.env` file to ensure email configuration is correct
2. For Gmail, ensure your app password is valid
3. Check server logs for any email errors
4. Try sending a test email to verify the system is working

## Security Notes

- All email endpoints require admin authentication
- User emails are never exposed to frontend clients
- All email templates use proper HTML encoding to prevent injection attacks 