import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db'; // ⚠️ adjust this import to match the path your login/register routes already use
import Admin from '@/models/Admin'; // ⚠️ adjust this import to match your project's model path

export async function POST(req) {
  try {
    const { identifier } = await req.json(); // admin can type Admin ID OR email — same field the login form uses

    if (!identifier || !identifier.trim()) {
      return Response.json({ error: 'Admin ID or Email is required.' }, { status: 400 });
    }

    await dbConnect();

    const value = identifier.trim();
    const admin = await Admin.findOne({
      $or: [{ email: value.toLowerCase() }, { adminId: value }],
    });

    // IMPORTANT: always return the same generic success message whether or not the
    // account exists. This stops attackers from using this endpoint to find out
    // which emails/adminIds are registered.
    const genericResponse = Response.json({
      message: 'If an account exists with this detail, a password reset link has been sent to the email.',
    });

    if (!admin) {
      return genericResponse;
    }

    // Generate a random raw token. Only the SHA-256 hash of it is stored in the DB;
    // the raw token is what goes out in the email link and is never persisted.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await admin.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/admin?reset_token=${rawToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g. yourshop@gmail.com
        pass: process.env.EMAIL_PASS, // Gmail App Password (not your normal Gmail password)
      },
    });

    await transporter.sendMail({
      from: `"Kamran Sports Admin" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: 'Reset Your Admin Password — Kamran Sports',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0B120D;">Password Reset Request</h2>
          <p>You requested a password reset for the Kamran Sports Admin Portal.</p>
          <p>Click the button below to set a new password. This link will expire in <b>30 minutes</b>.</p>
          <p style="margin:24px 0;">
            <a href="${resetLink}" style="background:#0B120D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
          </p>
          <p style="font-size:12px;color:#888;">If you did not request this, you can safely ignore this email — your password will not change.</p>
        </div>
      `,
    });

    return genericResponse;
  } catch (err) {
    console.error('Forgot password error:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}