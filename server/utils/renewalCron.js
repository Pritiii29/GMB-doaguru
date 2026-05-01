const cron = require('node-cron');
const db = require('../config/db');
const sendEmail = require('./mailSender');

const checkRenewals = async () => {
    console.log('Running renewal check cron job...');

    // Find subscriptions expiring in exactly 2 days
    const query = `
        SELECT s.*, c.email as clientEmail, c.name as clientName, p.name as planName 
        FROM subscriptions s
        JOIN clients c ON s.clientId = c.clientId
        JOIN subscription_plans p ON s.planId = p.id
        WHERE s.status = 'active' 
        AND DATEDIFF(s.end_date, NOW()) = 2
    `;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error in renewal cron job:', err);
            return;
        }

        for (const sub of results) {
            const { clientId, clientEmail, clientName, planName, end_date } = sub;
            const expiryDate = new Date(end_date).toLocaleDateString();

            // 1. Send mail to client
            const clientSubject = 'Subscription Renewal Reminder';
            const clientHtml = `
                <h3>Hello ${clientName},</h3>
                <p>Your subscription for the <strong>${planName}</strong> plan is expiring on <strong>${expiryDate}</strong>.</p>
                <p>Please renew your plan to continue using our services without interruption.</p>
                <br/>
                <p>Best regards,<br/>Team QR Review</p>
            `;

            try {
                await sendEmail(clientEmail, clientSubject, '', clientHtml);
                console.log(`Renewal email sent to client: ${clientEmail}`);
            } catch (error) {
                console.error(`Failed to send email to client ${clientEmail}:`, error);
            }

            // 2. Send mail to admin
            const adminEmail = process.env.ADMIN_EMAIL || 'doaguruinfosystems@gmail.com';
            const adminSubject = `Client Renewal Alert: ${clientName}`;
            const adminHtml = `
                <h3>Renewal Alert</h3>
                <p>Client <strong>${clientName}</strong> (${clientId}) has a subscription expiring on <strong>${expiryDate}</strong>.</p>
                <p>Plan: ${planName}</p>
                <p>Please follow up with the client for renewal.</p>
            `;

            try {
                await sendEmail(adminEmail, adminSubject, '', adminHtml);
                console.log(`Renewal email sent to admin for client: ${clientName}`);
            } catch (error) {
                console.error(`Failed to send email to admin:`, error);
            }

            // 3. Create notification for admin dashboard
            const notificationMsg = `Client ${clientName}'s ${planName} plan is expiring on ${expiryDate}. Please contact for renewal.`;
            const notifyQuery = 'INSERT INTO notifications (clientId, type, message) VALUES (?, ?, ?)';

            db.query(notifyQuery, [clientId, 'renewal_reminder', notificationMsg], (notifyErr) => {
                if (notifyErr) {
                    console.error('Error creating notification:', notifyErr);
                } else {
                    console.log(`Notification created for admin dashboard: ${clientName}`);
                }
            });
        }
    });
};

// Run every day at 10:00 AM
cron.schedule('0 10 * * *', checkRenewals);

// Also export to run manually if needed
module.exports = checkRenewals;
