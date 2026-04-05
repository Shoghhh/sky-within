/**
 * Reset a user's password locally (bcrypt hash, same as registration).
 * Usage: node scripts/reset-password.cjs <email> <new-password>
 */
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password.cjs <email> <new-password>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash(newPassword, 10);
  const result = await prisma.user.updateMany({
    where: { email },
    data: { password: hash },
  });
  await prisma.$disconnect();
  if (result.count === 0) {
    console.error('No user found with that email.');
    process.exit(1);
  }
  console.log('Password updated. You can sign in with the new password.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
