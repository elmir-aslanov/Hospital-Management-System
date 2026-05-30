import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    // New split-name fields  
    name:        { type: String, trim: true },
    surname:     { type: String, trim: true },
    // Legacy full-name field — kept for existing users
    fullName:    { type: String, trim: true },

    sexiyyatId:  { type: String, trim: true },
    ataAdi:      { type: String, trim: true },
    birthDate:   { type: Date },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    address:     { type: String, trim: true },
    phone:       { type: String, trim: true },
    password:    { type: String, required: true, minlength: 6, select: false },
    role:        { type: String, enum: Object.values(ROLES), required: true, default: 'STAFF' },
    department:  { type: String, trim: true },
    photoUrl:    { type: String, default: '' },
    avatar:      { type: String, default: '' },   // kept for backward compat
    isActive:    { type: Boolean, default: true },
    refreshToken:{ type: String, select: false },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: prefer name+surname; fall back to stored fullName
userSchema.virtual('displayName').get(function () {
  if (this.name && this.surname) return `${this.name} ${this.surname}`;
  if (this.name)    return this.name;
  if (this.surname) return this.surname;
  return this.fullName || '';
});

userSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  return Math.floor((Date.now() - new Date(this.birthDate)) / 31557600000);
});

userSchema.pre('save', async function (next) {
  // Sync: if name/surname set → update fullName
  if ((this.isModified('name') || this.isModified('surname')) && (this.name || this.surname)) {
    this.fullName = `${this.name || ''} ${this.surname || ''}`.trim();
  }
  // Sync reverse: if fullName set directly and name/surname empty → split into name/surname
  if (this.isModified('fullName') && this.fullName && !this.name && !this.surname) {
    const parts = this.fullName.trim().split(/\s+/);
    this.name    = parts[0] || '';
    this.surname = parts.slice(1).join(' ') || '';
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
  