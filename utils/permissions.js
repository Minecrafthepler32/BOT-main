const OWNER_ROLE_ID         = '1503591897615302748';
const STAFF_MANAGER_ROLE_ID = '1503781011648151733';
const STAFF_ROLE_ID         = '1503591897598529671';
const TRIAL_ROLE_ID         = '1503591897598529669';
const SUPPORT_ROLE_ID       = '1503591897598529670';
const VERIFIED_ROLE_ID      = '1503796042410491967';

function isOwner(member)        { return member.roles.cache.has(OWNER_ROLE_ID); }
function isStaffManager(member) { return member.roles.cache.has(STAFF_MANAGER_ROLE_ID) || isOwner(member); }
function isStaff(member)        { return member.roles.cache.has(STAFF_ROLE_ID) || isOwner(member); }
function isTrial(member)        { return member.roles.cache.has(TRIAL_ROLE_ID); }
function isSupport(member)      { return member.roles.cache.has(SUPPORT_ROLE_ID) || isStaff(member); }
function isVerified(member)     { return member.roles.cache.has(VERIFIED_ROLE_ID); }

module.exports = {
  isOwner, isStaffManager, isStaff, isTrial, isSupport, isVerified,
  OWNER_ROLE_ID, STAFF_MANAGER_ROLE_ID, STAFF_ROLE_ID,
  TRIAL_ROLE_ID, SUPPORT_ROLE_ID, VERIFIED_ROLE_ID,
};
