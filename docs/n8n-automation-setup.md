# Enquiry Automation — n8n Setup Guide

Goal: contact-form submission → business email + customer acknowledgement +
WhatsApp business alert + (opt-in only) customer WhatsApp confirmation +
Google Sheets log. All secrets stay in n8n.

## 1. Prereqs

- Self-hosted n8n or n8n Cloud (https://n8n.io)
- A Gmail/Google Workspace account (or SMTP credentials) for sending mail
- Meta Business account with WhatsApp Business Platform (Cloud API) access
- A Google Sheet for the enquiry log

## 2. Build the workflow

1. **Webhook node** — method `POST`, path `grandeur-enquiry`.
   Enable "Respond immediately" = **No** so you can return the real result.
2. **IF / validation** — check `name`, `phone`, `email` (regex), `service`,
   `message` length. Invalid → **Respond to Webhook** `{ "success": false }`.
3. **Duplicate check** — compare against recent rows in Google Sheets
   (same phone+email within 10 minutes) → reject duplicates.
4. **Gmail node → business** — to `thegrandeurdesign@gmail.com`, subject
   "New Website Enquiry — {service}", body with all fields + opt-in status.
5. **Gmail node → customer acknowledgement** — to `{{email}}`, polite
   "we received your enquiry" template using submitted name/service.
6. **Google Sheets node — Append** — map each field to a column
   (timestamp, name, phone, email, service, location, message, opt-in, source page).
7. **HTTP Request node → WhatsApp business alert** (see §3) — notify the
   business number of the new lead.
8. **IF `whatsappOptIn == true`** → send customer WhatsApp confirmation
   using an **approved template** (§4). If false → skip.
9. **Respond to Webhook** — `{ "success": true, "message": "Enquiry recorded." }`
   (or `success:false` if any critical step failed).

The front-end shows its success message **only** when this node returns
`success: true` — nothing is faked client-side.

## 3. WhatsApp business notification (Cloud API)

```
POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {PERMANENT_ACCESS_TOKEN}   ← stored in n8n Credentials
{
  "messaging_product": "whatsapp",
  "to": "919952544586",
  "type": "template",
  "template": {
    "name": "new_enquiry_alert",
    "language": { "code": "en" },
    "components": [{
      "type": "body",
      "parameters": [
        { "type": "text", "text": "{{name}}" },
        { "type": "text", "text": "{{service}}" },
        { "type": "text", "text": "{{phone}}" }
      ]
    }]
  }
}
```

Create `new_enquiry_alert` in Meta Business Manager → WhatsApp → Message
Templates (e.g. "New enquiry from {{1}} for {{2}}. Call back: {{3}}") and
wait for Meta's approval before going live.

## 4. Customer confirmation (opt-in only)

- The form's opt-in checkbox maps to `whatsappOptIn`.
- Only when `true`, send an **approved utility template** (e.g.
  `enquiry_received`: "Hi {{1}}, thanks for contacting The Grandeur Design
  about {{2}}. Our team will reach out within one business day.")
- Marketing content is never sent on this number.
- Honor STOP/opt-out replies: add a WhatsApp Trigger node that flags the
  phone number in the sheet so future confirmations are skipped.

## 5. Security checklist

- [ ] Webhook: in n8n enable "Header auth" or a secret path token; set the
      same URL in `assets/js/main.js` (`GD_CONFIG.n8nWebhookUrl`)
- [ ] All tokens (Meta, Gmail, Google) in n8n **Credentials**, never in code
- [ ] n8n instance behind HTTPS; restrict CORS if your host allows
- [ ] Server-side validation + duplicate check (step 2–3) — front-end
      validation is only UX, not security
- [ ] Test with fake data before going live; verify sheet row, both emails,
      and both WhatsApp messages end-to-end

## 6. JSON payload the site sends

```json
{
  "name": "…", "phone": "…", "email": "…", "service": "…",
  "location": "…", "message": "…",
  "whatsappOptIn": true,
  "page": "https://…/contact.html",
  "submittedAt": "ISO-8601"
}
```
