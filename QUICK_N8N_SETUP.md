# Quick n8n + WhatsApp Setup Guide

## What You Need:

### 1. n8n Account
- Sign up at https://n8n.io (Cloud is easiest - free tier available)
- Or self-host n8n if you prefer

### 2. WhatsApp Business API (Free for testing)
- Go to https://developers.facebook.com/
- Create a Meta for Developers account
- Create a WhatsApp Business App
- Get your:
  - Phone Number ID
  - Access Token
  - WhatsApp Business Number: 6383116616

### 3. Google Account (Free)
- For Gmail to send emails
- For Google Sheets to log enquiries

## Step-by-Step Setup:

### Step 1: Set up n8n
1. Go to https://n8n.io and sign up
2. Create a new workflow
3. Add a **Webhook** node:
   - Method: POST
   - Path: grandeur-enquiry
   - Authentication: None (for testing)
4. Copy the webhook URL (looks like: https://your-n8n-instance/webhook/grandeur-enquiry)

### Step 2: Update the website
Update `assets/js/main.js` with your n8n webhook URL:
```javascript
n8nWebhookUrl: "https://your-n8n-instance/webhook/grandeur-enquiry"
```

### Step 3: Build the n8n Workflow

**Node 1: Webhook** (already created)
- Receives form data from website

**Node 2: Send Email (Gmail)**
- Add Gmail node
- Authenticate with your Google account
- To: kishorerakesh13@gmail.com
- Subject: "New Enquiry from {{ $json.name }}"
- Body: Include all form fields

**Node 3: Send WhatsApp Message**
- Add HTTP Request node
- Method: POST
- URL: https://graph.facebook.com/v19.0/{YOUR_PHONE_NUMBER_ID}/messages
- Headers:
  - Authorization: Bearer {YOUR_ACCESS_TOKEN}
- Body (JSON):
```json
{
  "messaging_product": "whatsapp",
  "to": "916383116616",
  "type": "text",
  "text": {
    "body": "New enquiry from {{ $json.name }}\nService: {{ $json.service }}\nPhone: {{ $json.phone }}\nEmail: {{ $json.email }}\nMessage: {{ $json.message }}"
  }
}
```

**Node 4: Respond to Webhook**
- Add Respond to Webhook node
- Response:
```json
{
  "success": true,
  "message": "Enquiry received"
}
```

### Step 4: Test the Flow
1. Activate the n8n workflow
2. Go to your website contact form
3. Fill and submit the form
4. Check:
   - Email received at kishorerakesh13@gmail.com
   - WhatsApp message received at 6383116616
   - Success message on website

## Simplified Testing Version (No WhatsApp Template):

For quick testing without Meta approval, you can send simple text messages:
- Use the HTTP Request node as shown above
- This works for testing with your own number
- For production, you'll need approved templates

## Next Steps:

1. **Get n8n running** - Sign up at n8n.io
2. **Get WhatsApp API access** - Create Meta developer account
3. **Build the workflow** - Follow the steps above
4. **Test thoroughly** - Make sure everything works
5. **Go live** - Add security (authentication, validation)

## Troubleshooting:

- **Webhook not receiving data**: Check the webhook URL is correct in main.js
- **WhatsApp not sending**: Verify your Access Token and Phone Number ID
- **Email not sending**: Check Gmail authentication in n8n
- **No success message**: Check the Respond to Webhook node returns `{ "success": true }`

## Security (Before Production):

- Add authentication to webhook (Header auth or secret token)
- Validate all data in n8n (server-side)
- Add rate limiting
- Use environment variables for secrets
- Enable HTTPS for n8n instance

---

Need help with any specific step? Let me know!
