import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // ⚠️ swap for 'bcrypt' if that's what your login/register routes use
import dbConnect from '@/lib/db'; // ⚠️ adjust this import to match the path your login/register routes already use
import Admin from '@/models/Admin'; // ⚠️ adjust this import to match your project's model path

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return Response.json({ error: 'Token and new password are both required.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await dbConnect();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // must not be expired
    });

    if (!admin) {
      return Response.json({ error: 'This link is invalid or has expired. Please request a new one.' }, { status: 400 });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    return Response.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}