require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = process.env.MONGO_URI || (process.env.DB_USER && process.env.DB_PASS
  ? `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASS)}@cluster0.ko9wk8w.mongodb.net/faitherpa?retryWrites=true&w=majority`
  : null);

if (!mongoUri) {
  console.error('No MONGO_URI or DB_USER/DB_PASS set in environment. Aborting seed.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, isAdmin: { type: Boolean, default: false } }, { timestamps: true });
const ContributionSchema = new mongoose.Schema({ amount: Number, note: String, isAnonymous: Boolean, confirmed: Boolean, name: String, contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Contribution = mongoose.model('Contribution', ContributionSchema);

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('Connected to', mongoUri.split('@')[1]);

  // clear small dataset
  await Contribution.deleteMany({});
  await User.deleteMany({});

  const adminPass = await bcrypt.hash('adminpass', 10);
  const users = await User.create([
    { name: 'Admin User', email: 'admin@example.com', password: adminPass, isAdmin: true },
    { name: 'Alice Example', email: 'alice@example.com' },
    { name: 'Bob Contributor', email: 'bob@example.com' }
  ]);

  const contributions = [
    { amount: 50, note: 'For the cause', isAnonymous: false, confirmed: true, name: 'Alice Example', contributor: users[1]._id },
    { amount: 100, note: 'Keep it up', isAnonymous: false, confirmed: false, name: 'Bob Contributor', contributor: users[2]._id },
    { amount: 25, note: 'Anonymous gift', isAnonymous: true, confirmed: false, name: 'Anonymous Donor', contributor: null }
  ];

  await Contribution.create(contributions);

  console.log('Seed complete: created', users.length, 'users and', contributions.length, 'contributions');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});
